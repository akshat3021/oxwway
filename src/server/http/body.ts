import "server-only";
import type { ZodType } from "zod";
import { badRequest, payloadTooLarge, unsupportedMediaType } from "./errors";

const MAX_BODY_BYTES = 1_000_000; // 1 MB: generous for text content, hostile to abuse.

/**
 * Read and validate a JSON body: content type, a size cap checked on the
 * actual bytes (not just the header), then schema validation. Validation
 * errors surface as 422 through errorResponse.
 */
export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) throw unsupportedMediaType();

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) throw payloadTooLarge();

  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) throw payloadTooLarge();

  let raw: unknown;
  try {
    raw = text.length === 0 ? {} : JSON.parse(text);
  } catch {
    throw badRequest("Request body is not valid JSON");
  }
  return schema.parse(raw);
}
