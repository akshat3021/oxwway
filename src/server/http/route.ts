import "server-only";
import { randomUUID } from "node:crypto";
import type { Role } from "@prisma/client";
import { getEnv } from "../config/env";
import { authenticate } from "../auth/guard";
import type { SessionUser } from "../auth/session";
import { logger, type Logger } from "../logging/logger";
import { assertSameOrigin, isUnsafeMethod } from "./origin";
import { getClientIp } from "./client-ip";
import { forbidden, unauthorized } from "./errors";
import { rateLimit } from "./rate-limit";
import { errorResponse } from "./response";

export interface RouteContext<P> {
  req: Request;
  params: P;
  /** Non-null whenever `auth: true`. */
  user: SessionUser | null;
  ip: string;
  requestId: string;
  log: Logger;
}

export interface RouteOptions {
  /** Require a valid session. Default false (public endpoint). */
  auth?: boolean;
  /** Restrict to these roles (implies auth). */
  roles?: readonly Role[];
  /** Per-IP in-memory rate limit for public endpoints. */
  rateLimit?: { key: string; limit: number; windowMs: number };
}

type Segment<P> = { params: Promise<P> };

/**
 * Wraps every API handler with the same safety net, in this order:
 *   request id -> CSRF origin check (unsafe methods) -> rate limit ->
 *   authentication -> role check -> handler -> uniform error mapping ->
 *   structured access log.
 * Handlers just return a Response; they cannot forget any of the above.
 */
function build<P>(
  options: RouteOptions,
  handler: (ctx: RouteContext<P>) => Promise<Response>,
) {
  return async (req: Request, segment?: Segment<P>): Promise<Response> => {
    const started = Date.now();
    const requestId = req.headers.get("x-request-id")?.slice(0, 64) || randomUUID();
    const path = new URL(req.url).pathname;
    const ip = getClientIp(req, safeTrustProxy());
    const log = logger.child({ requestId, method: req.method, path });
    let user: SessionUser | null = null;
    let response: Response;

    try {
      if (isUnsafeMethod(req.method)) assertSameOrigin(req);
      if (options.rateLimit) {
        rateLimit(`${options.rateLimit.key}:${ip}`, options.rateLimit.limit, options.rateLimit.windowMs);
      }

      if (options.auth || options.roles) {
        user = await authenticate(req);
        if (!user) throw unauthorized();
        if (options.roles && !options.roles.includes(user.role)) throw forbidden();
      }

      const params = (segment ? await segment.params : {}) as P;
      response = await handler({ req, params, user, ip, requestId, log });
    } catch (err) {
      response = errorResponse(err, requestId);
    }

    response.headers.set("x-request-id", requestId);
    if (options.auth || options.roles) response.headers.set("Cache-Control", "no-store");

    log.info(
      { status: response.status, durationMs: Date.now() - started, userId: user?.id },
      "request",
    );
    return response;
  };
}

function safeTrustProxy(): boolean {
  try {
    return getEnv().TRUST_PROXY;
  } catch {
    return true;
  }
}

/** Public endpoint (no session). CSRF + optional rate limit still apply. */
export function publicRoute<P = Record<string, never>>(
  options: Omit<RouteOptions, "auth" | "roles">,
  handler: (ctx: RouteContext<P>) => Promise<Response>,
) {
  return build<P>(options, handler);
}

/** Authenticated endpoint: `ctx.user` is guaranteed non-null. */
export function authedRoute<P = Record<string, never>>(
  options: Omit<RouteOptions, "auth">,
  handler: (ctx: RouteContext<P> & { user: SessionUser }) => Promise<Response>,
) {
  return build<P>({ ...options, auth: true }, (ctx) =>
    handler(ctx as RouteContext<P> & { user: SessionUser }),
  );
}
