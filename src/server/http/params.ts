import "server-only";
import { notFound } from "./errors";

/** Parse a numeric path id; anything else is simply "not found". */
export function parseId(raw: string): number {
  if (!/^\d{1,9}$/.test(raw)) throw notFound();
  const id = Number(raw);
  if (id < 1) throw notFound();
  return id;
}
