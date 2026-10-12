import { beforeEach, describe, expect, it } from "vitest";
import * as audit from "@/app/api/admin/audit/route";
import * as meCookiePassword from "@/app/api/admin/me/password/route";
import * as me from "@/app/api/auth/me/route";
import * as users from "@/app/api/admin/users/route";
import * as userItem from "@/app/api/admin/users/[id]/route";
import * as userPassword from "@/app/api/admin/users/[id]/password/route";
import { prisma } from "@/server/db/prisma";
import { updateUser } from "@/server/services/users";
import { bodyOf, loginCookie, makeRequest, makeUser, resetDb, seg, TEST_PASSWORD } from "../helpers";

type Json = Record<string, unknown>;
const NEW_PW = "another-long-passphrase-42";

let adminUser: Awaited<ReturnType<typeof makeUser>>;
let admin: string;

beforeEach(async () => {
  await resetDb();
  adminUser = await makeUser("admin");
  admin = await loginCookie(adminUser.email);
});

const createUser = (json: unknown, cookie = admin) => users.POST(makeRequest("POST", "/api/admin/users", { cookie, json }));
const patchUser = (id: string, json: unknown, cookie = admin) =>
  userItem.PATCH(makeRequest("PATCH", `/api/admin/users/${id}`, { cookie, json }), seg({ id }));
const eraseUser = (id: string, cookie = admin) =>
  userItem.DELETE(makeRequest("DELETE", `/api/admin/users/${id}`, { cookie }), seg({ id }));
const meStatus = async (cookie: string) => (await me.GET(makeRequest("GET", "/api/auth/me", { cookie }))).status;

describe("user administration", () => {
  it("is admin-only", async () => {
    const editor = await loginCookie((await makeUser("editor")).email);
    expect((await users.GET(makeRequest("GET", "/api/admin/users", { cookie: editor }))).status).toBe(403);
    expect((await createUser({ email: "x@y.co", name: "X", role: "admin", password: NEW_PW }, editor)).status).toBe(403);
    expect((await users.GET(makeRequest("GET", "/api/admin/users"))).status).toBe(401);
  });

  it("never returns password hashes", async () => {
    const res = await users.GET(makeRequest("GET", "/api/admin/users", { cookie: admin }));
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("passwordHash");
    expect(text).not.toContain("argon2");
  });

  it("enforces the password policy and unique emails (case-insensitive)", async () => {
    expect((await createUser({ email: "n@oxway.test", name: "N", role: "editor", password: "short" })).status).toBe(422);
    expect((await createUser({ email: "n@oxway.test", name: "N", role: "editor", password: "password1234" })).status).toBe(422);
    const ok = await createUser({ email: "New@Oxway.test", name: "N", role: "editor", password: NEW_PW });
    expect(ok.status).toBe(201);
    expect((await createUser({ email: "new@oxway.test", name: "N2", role: "editor", password: NEW_PW })).status).toBe(409);
    // the new user can really sign in
    expect(await meStatus(await loginCookie("new@oxway.test", NEW_PW))).toBe(200);
  });

  it("rejects attempts to set fields like passwordHash directly", async () => {
    const res = await createUser({ email: "n@oxway.test", name: "N", role: "editor", password: NEW_PW, passwordHash: "x", isActive: true });
    expect(res.status).toBe(422);
  });

  it("stops admins from changing or deleting their own account", async () => {
    expect((await patchUser(adminUser.id, { role: "editor" })).status).toBe(403);
    expect((await patchUser(adminUser.id, { isActive: false })).status).toBe(403);
    expect((await eraseUser(adminUser.id)).status).toBe(403);
  });

  it("refuses to remove the last active admin (defence in depth)", async () => {
    const ghostActor = { id: "11111111-1111-1111-1111-111111111111", email: "g@x.y", name: "g", role: "admin" as const, sessionId: "s" };
    await expect(updateUser({ actor: ghostActor, ip: "1.1.1.1", requestId: "r" }, adminUser.id, { role: "editor" })).rejects.toMatchObject({ status: 409 });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: adminUser.id } })).role).toBe("admin");
  });

  it("revokes sessions immediately on deactivation or role change", async () => {
    const e = await makeUser("editor");
    const cookie = await loginCookie(e.email);
    expect(await meStatus(cookie)).toBe(200);
    expect((await patchUser(e.id, { isActive: false })).status).toBe(200);
    expect(await meStatus(cookie)).toBe(401);
  });

  it("admin password reset invalidates old password and old sessions", async () => {
    const e = await makeUser("editor");
    const cookie = await loginCookie(e.email);
    const res = await userPassword.POST(makeRequest("POST", `/api/admin/users/${e.id}/password`, { cookie: admin, json: { newPassword: NEW_PW } }), seg({ id: e.id }));
    expect(res.status).toBe(204);
    expect(await meStatus(cookie)).toBe(401);
    await expect(loginCookie(e.email, TEST_PASSWORD)).rejects.toThrow();
    expect(await meStatus(await loginCookie(e.email, NEW_PW))).toBe(200);
  });

  it("rejects a malformed user id with 404", async () => {
    expect((await patchUser("not-a-uuid", { name: "x" })).status).toBe(404);
  });
});

describe("changing your own password", () => {
  const change = (cookie: string, json: unknown) =>
    meCookiePassword.POST(makeRequest("POST", "/api/admin/me/password", { cookie, json }));

  it("requires the current password and a policy-compliant new one", async () => {
    expect((await change(admin, { currentPassword: "wrong-wrong-wrong", newPassword: NEW_PW })).status).toBe(401);
    expect((await change(admin, { currentPassword: TEST_PASSWORD, newPassword: "short" })).status).toBe(422);
  });

  it("keeps this session but signs out every other device", async () => {
    const otherDevice = await loginCookie(adminUser.email);
    expect((await change(admin, { currentPassword: TEST_PASSWORD, newPassword: NEW_PW })).status).toBe(204);
    expect(await meStatus(admin)).toBe(200);
    expect(await meStatus(otherDevice)).toBe(401);
    expect(await meStatus(await loginCookie(adminUser.email, NEW_PW))).toBe(200);
  });
});

describe("account erasure (privacy)", () => {
  it("anonymises the user, scrubs their email from the audit trail, and blocks sign-in", async () => {
    const e = await makeUser("editor", { email: "leaver@oxway.test" });
    const cookie = await loginCookie(e.email);
    expect(await prisma.auditLog.count({ where: { actorEmail: "leaver@oxway.test" } })).toBeGreaterThan(0);

    expect((await eraseUser(e.id)).status).toBe(204);

    const row = await prisma.user.findUniqueOrThrow({ where: { id: e.id } });
    expect(row.deletedAt).toBeInstanceOf(Date);
    expect(row.email).not.toContain("leaver");
    expect(row.name).toBe("Deleted user");
    expect(await prisma.auditLog.count({ where: { actorEmail: "leaver@oxway.test" } })).toBe(0);
    expect(await meStatus(cookie)).toBe(401);
    await expect(loginCookie("leaver@oxway.test")).rejects.toThrow();

    const listed = await bodyOf<{ data: Json[] }>(await users.GET(makeRequest("GET", "/api/admin/users", { cookie: admin })));
    expect(listed.data.map((u) => u.id)).not.toContain(e.id);
  });
});

describe("audit log endpoint", () => {
  it("is admin-only and lists real events", async () => {
    const editor = await loginCookie((await makeUser("editor")).email);
    expect((await audit.GET(makeRequest("GET", "/api/admin/audit", { cookie: editor }))).status).toBe(403);
    const res = await audit.GET(makeRequest("GET", "/api/admin/audit", { cookie: admin, query: "?action=login" }));
    const body = await bodyOf<{ data: { action: string }[]; meta: { total: number } }>(res);
    expect(body.meta.total).toBeGreaterThan(0);
    expect(body.data.every((r) => r.action === "login")).toBe(true);
  });
});
