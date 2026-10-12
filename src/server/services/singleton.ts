import "server-only";
import type { Prisma } from "@prisma/client";
import type { ZodType } from "zod";
import { prisma } from "../db/prisma";
import type { Capability } from "../auth/permissions";
import { notFound } from "../http/errors";
import { companyUpdate, homepageUpdate, settingsUpdate } from "../validation/schemas";
import { writeAudit } from "./audit";
import type { Ctx } from "./content";

type Row = Record<string, unknown>;

interface SingletonDelegate {
  findFirst(args: object): Promise<Row | null>;
  create(args: object): Promise<Row>;
  update(args: object): Promise<Row>;
}
type SingletonModel = "homepageContent" | "companyInfo" | "siteSettings";
type Db = Prisma.TransactionClient | typeof prisma;

const delegateOf = (db: Db, key: SingletonModel): SingletonDelegate =>
  (db as unknown as Record<SingletonModel, SingletonDelegate>)[key];

export interface SingletonDef {
  name: string;
  entity: string;
  model: SingletonModel;
  schema: ZodType<Row>;
  writeCapability: Capability;
}

export const SINGLETONS: Record<string, SingletonDef> = {
  homepage: { name: "homepage", entity: "HomepageContent", model: "homepageContent", schema: homepageUpdate, writeCapability: "singleton:write" },
  company: { name: "company", entity: "CompanyInfo", model: "companyInfo", schema: companyUpdate, writeCapability: "singleton:write" },
  settings: { name: "settings", entity: "SiteSettings", model: "siteSettings", schema: settingsUpdate, writeCapability: "settings:write" },
};

export function getSingletonDef(name: string): SingletonDef {
  const def = Object.hasOwn(SINGLETONS, name) ? SINGLETONS[name] : undefined;
  if (!def) throw notFound();
  return def;
}

/**
 * Always operate on the lowest-id row. If two first-time requests race and
 * both insert, the extra row is simply ignored: every read/write picks row #1.
 */
async function getOrCreate(db: Db, def: SingletonDef): Promise<Row> {
  const d = delegateOf(db, def.model);
  return (await d.findFirst({ orderBy: { id: "asc" } })) ?? (await d.create({ data: {} }));
}

export const readSingleton = (def: SingletonDef): Promise<Row> => getOrCreate(prisma, def);

export async function updateSingleton(def: SingletonDef, ctx: Ctx, input: Row): Promise<Row> {
  return prisma.$transaction(async (tx) => {
    const existing = await getOrCreate(tx, def);
    const row = await delegateOf(tx, def.model).update({ where: { id: existing.id }, data: input });
    await writeAudit(tx, {
      actor: ctx.actor,
      action: "update",
      entity: def.entity,
      entityId: existing.id as number,
      metadata: { fields: Object.keys(input) },
      ip: ctx.ip,
      requestId: ctx.requestId,
    });
    return row;
  });
}
