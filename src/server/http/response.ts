import "server-only";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { logger } from "../logging/logger";

/**
 * Response contract (every API route follows it):
 *   success: { data: T, meta?: { ... } }
 *   failure: { error: { code, message, details?, requestId } }
 */
export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function json<T>(
  data: T,
  init: { status?: number; meta?: PageMeta | Record<string, unknown>; headers?: HeadersInit } = {},
): Response {
  const body = init.meta ? { data, meta: init.meta } : { data };
  return Response.json(body, { status: init.status ?? 200, headers: init.headers });
}

export const noContent = (headers?: HeadersInit): Response =>
  new Response(null, { status: 204, headers });

function body(code: string, message: string, requestId: string, details?: unknown) {
  return { error: { code, message, requestId, ...(details === undefined ? {} : { details }) } };
}

/** Map any thrown value to a safe HTTP response. Never leaks internals. */
export function errorResponse(err: unknown, requestId: string): Response {
  if (err instanceof AppError) {
    return Response.json(body(err.code, err.message, requestId, err.details), {
      status: err.status,
      headers: err.headers,
    });
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return Response.json(
      body("VALIDATION_ERROR", "The request data is invalid", requestId, details),
      { status: 422 },
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return Response.json(body("CONFLICT", "A record with this value already exists", requestId), {
        status: 409,
      });
    }
    if (err.code === "P2025") {
      return Response.json(body("NOT_FOUND", "Resource not found", requestId), { status: 404 });
    }
  }

  // Unknown failure: log everything, tell the client nothing.
  logger.error({ err, requestId }, "unhandled error");
  return Response.json(body("INTERNAL_ERROR", "An unexpected error occurred", requestId), {
    status: 500,
  });
}
