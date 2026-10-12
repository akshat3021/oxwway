import { z } from "zod";

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Trim and strip control characters (a NUL byte would make Postgres reject the row). */
const clean = (s: string): string => s.replace(CONTROL_CHARS, "").trim();

/** Required text: 1..max characters after cleaning. */
export const requiredText = (max: number) =>
  z.string().max(max * 2).transform(clean).pipe(z.string().min(1, "Required").max(max));

/** Optional text: empty string / null clears the field (stored as null). */
export const optionalText = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform(clean)
    .pipe(z.string().max(max))
    .transform((s) => (s === "" ? null : s))
    .nullable()
    .optional();

export const slug = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

/**
 * Media / link references: either a same-site path ("/uploads/a.png") or an
 * https URL. Everything else (javascript:, data:, http:, //host) is rejected,
 * which removes the usual stored-XSS-via-URL vector.
 */
export function isSafeUrlOrPath(value: string): boolean {
  if (value.length > 2048 || /[\s\\]/.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const safeUrl = z
  .string()
  .max(2048)
  .refine(isSafeUrlOrPath, "Must be an https:// URL or a site path starting with /");

export const optionalSafeUrl = z
  .string()
  .max(2048)
  .transform((s) => s.trim())
  .refine((s) => s === "" || isSafeUrlOrPath(s), "Must be an https:// URL or a site path starting with /")
  .transform((s) => (s === "" ? null : s))
  .nullable()
  .optional();

export const emailSchema = z
  .string()
  .max(254)
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().email("Enter a valid email address"));

export const isoDate = z
  .string()
  .datetime({ offset: true })
  .transform((s) => new Date(s));

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  status: z.string().trim().max(20).optional(),
});
export type ListQuery = z.infer<typeof listQuerySchema>;
