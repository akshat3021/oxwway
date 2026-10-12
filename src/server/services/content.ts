import "server-only";
import type { Prisma } from "@prisma/client";
import type { ZodType } from "zod";
import { prisma } from "../db/prisma";
import { can } from "../auth/permissions";
import type { SessionUser } from "../auth/session";
import { forbidden, notFound, validationFailed } from "../http/errors";
import type { PageMeta } from "../http/response";
import type { ListQuery } from "../validation/common";
import {
  asUpdate,
  blogPostCreate,
  galleryItemCreate,
  jobListingCreate,
  productCreate,
  teamMemberCreate,
} from "../validation/schemas";
import { writeAudit } from "./audit";

type Row = Record<string, unknown>;

/**
 * Minimal structural view of a Prisma model delegate. The five content models
 * share this shape, which is what lets one implementation serve them all.
 * (Prisma's generated delegates are individually typed and not assignable to
 * a common type, hence the single narrow cast in `delegateOf`.)
 */
interface Delegate {
  findMany(args: object): Promise<Row[]>;
  findFirst(args: object): Promise<Row | null>;
  count(args: object): Promise<number>;
  create(args: object): Promise<Row>;
  update(args: object): Promise<Row>;
}

type ModelKey = "blogPost" | "product" | "teamMember" | "jobListing" | "galleryItem";
type Db = Prisma.TransactionClient | typeof prisma;

const delegateOf = (db: Db, key: ModelKey): Delegate =>
  (db as unknown as Record<ModelKey, Delegate>)[key];

export interface ResourceDef {
  /** URL segment: /api/admin/<key> */
  key: string;
  /** Label used in the audit log */
  entity: string;
  model: ModelKey;
  createSchema: ZodType<Row>;
  updateSchema: ZodType<Row>;
  slugged?: boolean;
  /** Has a draft/published lifecycle that only admins may change. */
  publishable?: boolean;
  /** Allowed values for the ?status= filter. */
  statusValues?: readonly string[];
  searchFields: readonly string[];
  orderBy: readonly object[];
  /** Fields that must be arrays on create (Postgres lists have no default). */
  listFields?: readonly string[];
}

export const RESOURCES: Record<string, ResourceDef> = {
  "blog-posts": {
    key: "blog-posts",
    entity: "BlogPost",
    model: "blogPost",
    createSchema: blogPostCreate,
    updateSchema: asUpdate(blogPostCreate),
    slugged: true,
    publishable: true,
    statusValues: ["draft", "published"],
    searchFields: ["title", "slug"],
    orderBy: [{ updatedAt: "desc" }],
    listFields: ["tags"],
  },
  products: {
    key: "products",
    entity: "Product",
    model: "product",
    createSchema: productCreate,
    updateSchema: asUpdate(productCreate),
    slugged: true,
    publishable: true,
    statusValues: ["draft", "published"],
    searchFields: ["name", "slug"],
    orderBy: [{ updatedAt: "desc" }],
    listFields: ["mediaRefs"],
  },
  "team-members": {
    key: "team-members",
    entity: "TeamMember",
    model: "teamMember",
    createSchema: teamMemberCreate,
    updateSchema: asUpdate(teamMemberCreate),
    searchFields: ["name", "role"],
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
  },
  "job-listings": {
    key: "job-listings",
    entity: "JobListing",
    model: "jobListing",
    createSchema: jobListingCreate,
    updateSchema: asUpdate(jobListingCreate),
    statusValues: ["open", "closed"],
    searchFields: ["title", "department", "location"],
    orderBy: [{ updatedAt: "desc" }],
  },
  "gallery-items": {
    key: "gallery-items",
    entity: "GalleryItem",
    model: "galleryItem",
    createSchema: galleryItemCreate,
    updateSchema: asUpdate(galleryItemCreate),
    searchFields: ["caption", "category"],
    orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
  },
};

export function getResource(key: string): ResourceDef {
  const def = Object.hasOwn(RESOURCES, key) ? RESOURCES[key] : undefined;
  if (!def) throw notFound();
  return def;
}

export interface Ctx {
  actor: SessionUser;
  ip: string;
  requestId: string;
}

/**
 * Publish-state rules. Anyone with write access may create drafts and edit
 * content, but only admins may move an item between draft and published.
 * Also stamps publishDate the first time a post goes live.
 */
function applyPublishRules(def: ResourceDef, actor: SessionUser, existing: Row | null, data: Row): void {
  if (!def.publishable || data.status === undefined) return;
  const current = (existing?.status as string | undefined) ?? "draft";
  if (data.status !== current && !can(actor.role, "content:publish")) {
    throw forbidden("Only administrators can publish or unpublish content");
  }
  if (def.model === "blogPost" && data.status === "published" && !data.publishDate && !existing?.publishDate) {
    data.publishDate = new Date();
  }
}

export async function listResource(
  def: ResourceDef,
  query: ListQuery,
): Promise<{ rows: Row[]; meta: PageMeta }> {
  if (query.status && !def.statusValues?.includes(query.status)) {
    throw validationFailed([{ path: "status", message: `Must be one of: ${def.statusValues?.join(", ") ?? "(none)"}` }]);
  }

  const where: Row = { deletedAt: null };
  if (query.status) where.status = query.status;
  if (query.q) {
    where.OR = def.searchFields.map((f) => ({ [f]: { contains: query.q, mode: "insensitive" } }));
  }

  const d = delegateOf(prisma, def.model);
  const [rows, total] = await Promise.all([
    d.findMany({ where, orderBy: def.orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    d.count({ where }),
  ]);

  return {
    rows,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function getOne(def: ResourceDef, id: number): Promise<Row> {
  const row = await delegateOf(prisma, def.model).findFirst({ where: { id, deletedAt: null } });
  if (!row) throw notFound();
  return row;
}

export async function createResource(def: ResourceDef, ctx: Ctx, input: Row): Promise<Row> {
  const data: Row = { ...input };
  applyPublishRules(def, ctx.actor, null, data);
  for (const f of def.listFields ?? []) data[f] ??= [];

  return prisma.$transaction(async (tx) => {
    const row = await delegateOf(tx, def.model).create({ data });
    await writeAudit(tx, {
      actor: ctx.actor,
      action: "create",
      entity: def.entity,
      entityId: row.id as number,
      metadata: { fields: Object.keys(input) },
      ip: ctx.ip,
      requestId: ctx.requestId,
    });
    return row;
  });
}

export async function updateResource(def: ResourceDef, ctx: Ctx, id: number, input: Row): Promise<Row> {
  return prisma.$transaction(async (tx) => {
    const d = delegateOf(tx, def.model);
    const existing = await d.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw notFound();

    const data: Row = { ...input };
    applyPublishRules(def, ctx.actor, existing, data);

    const row = await d.update({ where: { id }, data });

    let action = "update";
    if (def.publishable && data.status !== undefined && data.status !== existing.status) {
      action = data.status === "published" ? "publish" : "unpublish";
    }
    await writeAudit(tx, {
      actor: ctx.actor,
      action,
      entity: def.entity,
      entityId: id,
      metadata: { fields: Object.keys(input) },
      ip: ctx.ip,
      requestId: ctx.requestId,
    });
    return row;
  });
}

/**
 * Soft delete. Slugged rows get their slug released (suffixed) so the same
 * URL can be reused by new content without violating the unique index.
 */
export async function deleteResource(def: ResourceDef, ctx: Ctx, id: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const d = delegateOf(tx, def.model);
    const existing = await d.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw notFound();

    const data: Row = { deletedAt: new Date() };
    if (def.slugged) data.slug = `${String(existing.slug)}--deleted-${id}`;
    await d.update({ where: { id }, data });

    await writeAudit(tx, {
      actor: ctx.actor,
      action: "delete",
      entity: def.entity,
      entityId: id,
      ip: ctx.ip,
      requestId: ctx.requestId,
    });
  });
}
