import type { Role } from "@prisma/client";

/**
 * Role -> capability matrix. Authorisation decisions go through `can()`;
 * never compare role strings ad hoc elsewhere.
 *
 * Policy:
 *  - Editors write drafts and may edit live content, but only admins change
 *    publish state or delete (an editor mistake can never lose content, and
 *    nothing goes live without an admin).
 *  - Settings, users, audit log and contact messages are admin-only.
 */
export type Capability =
  | "content:read"
  | "content:write"
  | "content:publish"
  | "content:delete"
  | "singleton:write"
  | "settings:write"
  | "users:manage"
  | "audit:read"
  | "messages:manage";

const MATRIX: Record<Role, ReadonlySet<Capability>> = {
  admin: new Set<Capability>([
    "content:read", "content:write", "content:publish", "content:delete",
    "singleton:write", "settings:write", "users:manage", "audit:read", "messages:manage",
  ]),
  editor: new Set<Capability>(["content:read", "content:write", "singleton:write"]),
};

export const can = (role: Role, capability: Capability): boolean => MATRIX[role].has(capability);
