import "server-only";
import type { Role } from "@prisma/client";
import { forbidden, unauthorized } from "../http/errors";
import { can, type Capability } from "./permissions";
import { readSessionToken } from "./cookie";
import { getSessionUser, type SessionUser } from "./session";

/** Resolve the session from a Request's Cookie header (testable, no next/headers). */
export async function authenticate(req: Request): Promise<SessionUser | null> {
  const token = readSessionToken(req.headers.get("cookie"));
  return token ? getSessionUser(token) : null;
}

export async function requireUser(req: Request): Promise<SessionUser> {
  const user = await authenticate(req);
  if (!user) throw unauthorized();
  return user;
}

export function requireRole(user: SessionUser, roles: readonly Role[]): void {
  if (!roles.includes(user.role)) throw forbidden();
}

/** Capability check (single source of truth: auth/permissions.ts). */
export function requireCapability(user: SessionUser, capability: Capability): void {
  if (!can(user.role, capability)) throw forbidden();
}
