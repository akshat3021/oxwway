import { z } from "zod";
import {
  emailSchema,
  isoDate,
  optionalSafeUrl,
  optionalText,
  requiredText,
  safeUrl,
  slug,
} from "./common";

/**
 * Request schemas. All are `.strict()`: unknown keys are REJECTED rather than
 * ignored, so a client can never smuggle in fields like id, deletedAt or
 * createdAt (mass-assignment protection).
 *
 * "Create" schemas define required fields. "Update" schemas are the same shape
 * made partial (PATCH semantics). No `.default()` here: defaults belong to the
 * database/service, otherwise a PATCH would silently reset untouched fields.
 */

// ── Content resources ──────────────────────────────────────────────────────

const contentStatus = z.enum(["draft", "published"]);

const tag = requiredText(40);

export const blogPostCreate = z
  .object({
    title: requiredText(200),
    slug,
    excerpt: optionalText(500),
    body: optionalText(100_000),
    coverImage: optionalSafeUrl,
    tags: z.array(tag).max(10),
    publishDate: isoDate.nullable(),
    seoTitle: optionalText(70),
    seoDescription: optionalText(160),
    status: contentStatus,
  })
  .partial({ excerpt: true, body: true, coverImage: true, tags: true, publishDate: true, seoTitle: true, seoDescription: true, status: true })
  .strict();

const specs = z
  .record(z.string().min(1).max(60), z.union([z.string().max(300), z.number(), z.boolean()]))
  .refine((o) => Object.keys(o).length <= 40, "At most 40 specs");

export const productCreate = z
  .object({
    name: requiredText(120),
    slug,
    tagline: optionalText(200),
    description: optionalText(10_000),
    specs: specs.nullable(),
    mediaRefs: z.array(safeUrl).max(20),
    status: contentStatus,
  })
  .partial({ tagline: true, description: true, specs: true, mediaRefs: true, status: true })
  .strict();

export const teamMemberCreate = z
  .object({
    name: requiredText(100),
    role: requiredText(100),
    bio: optionalText(2000),
    photoRef: optionalSafeUrl,
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .partial({ bio: true, photoRef: true, displayOrder: true })
  .strict();

export const jobListingCreate = z
  .object({
    title: requiredText(120),
    department: optionalText(80),
    location: optionalText(80),
    description: optionalText(10_000),
    status: z.enum(["open", "closed"]),
  })
  .partial({ department: true, location: true, description: true, status: true })
  .strict();

export const galleryItemCreate = z
  .object({
    mediaRef: safeUrl,
    caption: optionalText(300),
    category: optionalText(60),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .partial({ caption: true, category: true, displayOrder: true })
  .strict();

/** PATCH variant: every field optional. */
export const asUpdate = <T extends z.ZodObject>(schema: T) => schema.partial().strict();

// ── Singletons ─────────────────────────────────────────────────────────────

export const homepageUpdate = z
  .object({
    heroHeadline: optionalText(60),
    heroSubheadline: optionalText(60),
    heroDescription: optionalText(200),
    ctaLabel: optionalText(40),
    ctaLink: optionalSafeUrl,
    systemStatusLabel: optionalText(40),
    scrollCueText: optionalText(60),
    accessLevelReadout: optionalText(30),
  })
  .strict();

export const companyUpdate = z
  .object({
    aboutContent: optionalText(20_000),
    visionStatement: optionalText(5_000),
    contactDetails: optionalText(2_000),
    socialLinks: z.record(z.string().min(1).max(30), safeUrl).refine((o) => Object.keys(o).length <= 20).nullable().optional(),
  })
  .strict();

export const settingsUpdate = z
  .object({
    showBullWatermark: z.boolean().optional(),
    flags: z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/), z.boolean()).refine((o) => Object.keys(o).length <= 50).optional(),
  })
  .strict();

// ── Auth & users ───────────────────────────────────────────────────────────

export const loginSchema = z
  .object({ email: emailSchema, password: z.string().min(1).max(128) })
  .strict();

export const userCreate = z
  .object({
    email: emailSchema,
    name: requiredText(100),
    role: z.enum(["admin", "editor"]),
    password: z.string().min(1).max(128),
  })
  .strict();

export const userUpdate = z
  .object({
    name: requiredText(100).optional(),
    role: z.enum(["admin", "editor"]).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const changeOwnPassword = z
  .object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(1).max(128) })
  .strict();

export const resetPassword = z.object({ newPassword: z.string().min(1).max(128) }).strict();

// ── Public ─────────────────────────────────────────────────────────────────

export const contactSubmit = z
  .object({
    name: requiredText(100),
    email: emailSchema,
    message: requiredText(5000),
    /** Honeypot: real users never see or fill this. */
    website: z.string().max(200).optional(),
  })
  .strict();

export const messageUpdate = z.object({ read: z.boolean() }).strict();
