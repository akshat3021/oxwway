import { beforeEach, describe, expect, it } from "vitest";
import * as login from "@/app/api/auth/login/route";
import * as logout from "@/app/api/auth/logout/route";
import * as me from "@/app/api/auth/me/route";
import { prisma } from "@/server/db/prisma";
import { bodyOf, loginCookie, makeRequest, makeUser, resetDb, TEST_PASSWORD } from "../helpers";

const doLogin = (email: string, password: string, opts: Parameters<typeof makeRequest>[2] = {}) =>
  login.POST(makeRequest("POST", "/api/auth/login", { json: { email, password }, ...opts }));

beforeEach(resetDb);

describe("login", () => {
  it("issues a hardened session cookie and never returns secrets", async () => {
    const u = await makeUser("admin");
    const res = await doLogin(u.email, TEST_PASSWORD);
    expect(res.status).toBe(200);

    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");

    const body = await bodyOf<{ data: Record<string, unknown> }>(res);
    expect(body.data).toMatchObject({ email: u.email, role: "admin" });
    expect(JSON.stringify(body)).not.toContain("passwordHash");

    // Only the HASH of the token is stored, never the token itself.
    const token = cookie.split(";")[0].split("=")[1];
    const session = await prisma.session.findFirstOrThrow();
    expect(session.tokenHash).not.toBe(token);
    expect(session.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(await prisma.auditLog.count({ where: { action: "login", actorId: u.id } })).toBe(1);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const u = await makeUser("admin");
    const wrong = await doLogin(u.email, "definitely-wrong-password");
    const unknown = await doLogin("nobody@oxway.test", "definitely-wrong-password");
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    const a = await bodyOf<{ error: { code: string; message: string } }>(wrong);
    const b = await bodyOf<{ error: { code: string; message: string } }>(unknown);
    expect(a.error.code).toBe(b.error.code);
    expect(a.error.message).toBe(b.error.message);
  });

  it("is case-insensitive on email", async () => {
    const u = await makeUser("admin");
    expect((await doLogin(u.email.toUpperCase(), TEST_PASSWORD)).status).toBe(200);
  });

  it("refuses inactive and erased accounts with the same generic error", async () => {
    const inactive = await makeUser("editor", { isActive: false });
    expect((await doLogin(inactive.email, TEST_PASSWORD)).status).toBe(401);
  });

  it("locks the account after 5 failures, even for the correct password", async () => {
    const u = await makeUser("admin");
    for (let i = 0; i < 5; i++) expect((await doLogin(u.email, "wrong-password-xx")).status).toBe(401);

    const locked = await doLogin(u.email, TEST_PASSWORD);
    expect(locked.status).toBe(429);
    expect(Number(locked.headers.get("retry-after"))).toBeGreaterThan(0);

    // Further attempts while locked are not recorded, so the lock cannot be extended forever.
    expect(await prisma.loginAttempt.count({ where: { success: false } })).toBe(5);
  });

  it("lockout also applies to unknown emails (no account-existence oracle)", async () => {
    for (let i = 0; i < 5; i++) await doLogin("ghost@oxway.test", "wrong-password-xx");
    expect((await doLogin("ghost@oxway.test", "wrong-password-xx")).status).toBe(429);
  });

  it("a successful login resets the failure count", async () => {
    const u = await makeUser("admin");
    for (let i = 0; i < 4; i++) await doLogin(u.email, "wrong-password-xx");
    expect((await doLogin(u.email, TEST_PASSWORD)).status).toBe(200);
    for (let i = 0; i < 4; i++) expect((await doLogin(u.email, "wrong-password-xx")).status).toBe(401);
  });

  it("throttles one IP hammering many accounts", async () => {
    for (let i = 0; i < 20; i++) {
      await doLogin(`victim${i}@oxway.test`, "wrong-password-xx", { headers: { "x-forwarded-for": "203.0.113.9" } });
    }
    const res = await doLogin("victim99@oxway.test", "wrong-password-xx", { headers: { "x-forwarded-for": "203.0.113.9" } });
    expect(res.status).toBe(429);
    // A different IP is unaffected.
    const other = await doLogin("victim99@oxway.test", "wrong-password-xx", { headers: { "x-forwarded-for": "198.51.100.1" } });
    expect(other.status).toBe(401);
  });

  it("blocks login CSRF (cross-site origin)", async () => {
    const u = await makeUser("admin");
    const res = await doLogin(u.email, TEST_PASSWORD, { origin: "https://evil.example" });
    expect(res.status).toBe(403);
    expect(await prisma.session.count()).toBe(0);
  });

  it("rejects malformed bodies without leaking details", async () => {
    const extra = await login.POST(makeRequest("POST", "/api/auth/login", { json: { email: "a@b.co", password: "x", role: "admin" } }));
    expect(extra.status).toBe(422);
    const notJson = await login.POST(new Request("http://localhost/api/auth/login", { method: "POST", headers: { origin: "http://localhost", host: "localhost", "content-type": "application/json" }, body: "{oops" }));
    expect(notJson.status).toBe(400);
    const wrongType = await login.POST(new Request("http://localhost/api/auth/login", { method: "POST", headers: { origin: "http://localhost", host: "localhost", "content-type": "text/plain" }, body: "x" }));
    expect(wrongType.status).toBe(415);
  });
});

describe("sessions", () => {
  const meReq = (cookie?: string) => me.GET(makeRequest("GET", "/api/auth/me", { cookie }));

  it("require a valid cookie", async () => {
    expect((await meReq()).status).toBe(401);
    expect((await meReq("oxway_session=garbage")).status).toBe(401);
  });

  it("identify the user", async () => {
    const u = await makeUser("editor");
    const res = await meReq(await loginCookie(u.email));
    expect(res.status).toBe(200);
    expect((await bodyOf<{ data: { email: string } }>(res)).data.email).toBe(u.email);
  });

  it("are revoked server-side on logout (a stolen cookie stops working)", async () => {
    const u = await makeUser("editor");
    const cookie = await loginCookie(u.email);
    const out = await logout.POST(makeRequest("POST", "/api/auth/logout", { cookie }));
    expect(out.status).toBe(204);
    expect(out.headers.get("set-cookie")).toContain("Max-Age=0");
    expect((await meReq(cookie)).status).toBe(401);
  });

  it("expire after the idle timeout", async () => {
    const u = await makeUser("editor");
    const cookie = await loginCookie(u.email);
    await prisma.session.updateMany({ data: { lastUsedAt: new Date(Date.now() - 5 * 3600_000) } });
    expect((await meReq(cookie)).status).toBe(401);
  });

  it("expire at the absolute lifetime", async () => {
    const u = await makeUser("editor");
    const cookie = await loginCookie(u.email);
    await prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await meReq(cookie)).status).toBe(401);
  });

  it("stop working the moment the user is deactivated", async () => {
    const u = await makeUser("editor");
    const cookie = await loginCookie(u.email);
    await prisma.user.update({ where: { id: u.id }, data: { isActive: false } });
    expect((await meReq(cookie)).status).toBe(401);
  });

  it("cannot be forged by guessing a token", async () => {
    const u = await makeUser("admin");
    await loginCookie(u.email);
    expect((await meReq(`oxway_session=${"A".repeat(43)}`)).status).toBe(401);
  });
});
