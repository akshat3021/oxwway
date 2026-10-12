import type { FieldDef } from "./resources";

/** Form state is plain strings; conversion to/from API shapes lives here (pure, unit tested). */
export type FormState = Record<string, string>;

export class FormParseError extends Error {
  constructor(readonly field: string, message: string) {
    super(message);
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}

/** ISO string -> value for <input type="datetime-local"> in the user's timezone. */
export function toLocalInput(iso: unknown): string {
  if (typeof iso !== "string" && !(iso instanceof Date)) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const shifted = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

export function parseSpecs(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [i, raw] of text.split("\n").entries()) {
    const line = raw.trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 1 || idx === line.length - 1) {
      throw new FormParseError("specs", `Line ${i + 1} must look like "Name: value"`);
    }
    out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

const lines = (s: string): string[] => s.split("\n").map((l) => l.trim()).filter(Boolean);
const commaList = (s: string): string[] => s.split(",").map((t) => t.trim()).filter(Boolean);

export function fieldToText(field: FieldDef, value: unknown): string {
  if (value === null || value === undefined) return field.type === "number" ? "0" : "";
  switch (field.type) {
    case "tags": return Array.isArray(value) ? value.join(", ") : "";
    case "urls": return Array.isArray(value) ? value.join("\n") : "";
    case "datetime": return toLocalInput(value);
    case "number": return String(value);
    case "specs":
      return value && typeof value === "object"
        ? Object.entries(value as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`).join("\n")
        : "";
    default: return String(value);
  }
}

export function initialState(fields: FieldDef[], row?: Record<string, unknown> | null): FormState {
  const state: FormState = {};
  for (const f of fields) {
    const defaultValue = f.type === "select" ? (f.options?.[0]?.value ?? "") : undefined;
    state[f.name] = row ? fieldToText(f, row[f.name]) : (defaultValue ?? fieldToText(f, undefined));
  }
  return state;
}

export function toPayload(fields: FieldDef[], state: FormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    const v = state[f.name] ?? "";
    switch (f.type) {
      case "number": payload[f.name] = Number.isFinite(Number(v)) && v.trim() !== "" ? Math.trunc(Number(v)) : 0; break;
      case "tags": payload[f.name] = commaList(v); break;
      case "urls": payload[f.name] = lines(v); break;
      case "datetime": payload[f.name] = v ? new Date(v).toISOString() : null; break;
      case "specs": { const s = parseSpecs(v); payload[f.name] = Object.keys(s).length ? s : null; break; }
      default: payload[f.name] = v;
    }
  }
  return payload;
}

/** Immutable "object without this key" (avoids unused-variable destructuring). */
export function omitKey<T extends Record<string, unknown>>(obj: T, key: string): T {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key)) as T;
}
