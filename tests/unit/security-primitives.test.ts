import { afterEach, describe, expect, it, vi } from "vitest";
import { buildClearedSessionCookie, buildSessionCookie, readSessionToken } from "@/server/auth/cookie";
import { can } from "@/server/auth/permissions";
import { generateToken, hashToken } from "@/server/auth/tokens";
import { assertSameOrigin } from "@/server/http/origin";
import { rateLimit, resetRateLimitsForTests } from "@/server/http/rate-limit";
import { AppError } from "@/server/http/errors";
import { errorResponse } from "@/server/http/response";
import { z } from "zod";

describe("session tokens", () => {
  it("are 256-bit, unique, and stored only as a hash", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(Buffer.from(a, "base64url")).toHaveLength(32);
    expect(hashToken(a)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(a)).not.toContain(a);
    expect(hashToken(a)).toBe(hashToken(a));
  });
});

describe("session cookie", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is HttpOnly + SameSite=Lax; Secure and __Host- prefixed in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const c = buildSessionCookie("tok", 3600);
    expect(c).toMatch(/^__Host-oxway_session=tok;/);
    for (const attr of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/", "Max-Age=3600"]) {
      expect(c).toContain(attr);
    }
    expect(c).not.toContain("Domain=");
  });

  it("is not Secure outside production (so http://localhost works)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(buildSessionCookie("tok", 60)).not.toContain("Secure");
  });

  it("clearing expires immediately", () => {
    expect(buildClearedSessionCookie()).toContain("Max-Age=0");
  });

  it("reads the token among other cookies and ignores look-alikes", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(readSessionToken("a=1; oxway_session=abc123; b=2")).toBe("abc123");
    expect(readSessionToken("xoxway_session=evil")).toBeNull();
    expect(readSessionToken("oxway_session=")).toBeNull();
    expect(readSessionToken(`oxway_session=${"a".repeat(500)}`)).toBeNull();
    expect(readSessionToken(null)).toBeNull();
  });
});

describe("permission matrix", () => {
  it("lets editors write but not publish, delete or administer", () => {
    expect(can("editor", "content:write")).toBe(true);
    expect(can("editor", "content:publish")).toBe(false);
    expect(can("editor", "content:delete")).toBe(false);
    expect(can("editor", "users:manage")).toBe(false);
    expect(can("editor", "audit:read")).toBe(false);
    expect(can("editor", "settings:write")).toBe(false);
  });
  it("gives admins everything", () => {
    for (const c of ["content:publish", "content:delete", "users:manage", "audit:read", "settings:write"] as const) {
      expect(can("admin", c)).toBe(true);
    }
  });
});

describe("CSRF origin check", () => {
  const req = (h: Record<string, string>) =>
    new Request("http://app.test/api/x", { method: "POST", headers: { host: "app.test", ...h } });

  it("allows a same-origin request", () => {
    expect(() => assertSameOrigin(req({ origin: "http://app.test" }))).not.toThrow();
  });
  it("blocks a cross-site origin", () => {
    expect(() => assertSameOrigin(req({ origin: "https://evil.example" }))).toThrow(AppError);
  });
  it("blocks a lookalike host", () => {
    expect(() => assertSameOrigin(req({ origin: "http://app.test.evil.example" }))).toThrow(AppError);
  });
  it("blocks a malformed origin", () => {
    expect(() => assertSameOrigin(req({ origin: "not a url" }))).toThrow(AppError);
  });
  it("blocks when neither Origin nor a same-origin Fetch-Metadata signal exists", () => {
    expect(() => assertSameOrigin(req({}))).toThrow(AppError);
  });
  it("accepts Sec-Fetch-Site same-origin when Origin is absent", () => {
    expect(() => assertSameOrigin(req({ "sec-fetch-site": "same-origin" }))).not.toThrow();
  });
  it("rejects Sec-Fetch-Site cross-site", () => {
    expect(() => assertSameOrigin(req({ "sec-fetch-site": "cross-site" }))).toThrow(AppError);
  });
});

describe("in-memory rate limiter", () => {
  it("allows up to the limit, then blocks with a Retry-After, then recovers", () => {
    resetRateLimitsForTests();
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 60_000, t0 + i);
    try {
      rateLimit("k", 3, 60_000, t0 + 10);
      throw new Error("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).status).toBe(429);
      expect((e as AppError).headers?.["Retry-After"]).toBeDefined();
    }
    expect(() => rateLimit("k", 3, 60_000, t0 + 61_000)).not.toThrow();
    expect(() => rateLimit("other", 3, 60_000, t0 + 10)).not.toThrow();
  });
});

describe("error responses", () => {
  it("maps AppError to its status/code with a request id", async () => {
    const res = errorResponse(new AppError(409, "CONFLICT", "dup"), "rid-1");
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: { code: "CONFLICT", message: "dup", requestId: "rid-1" } });
  });
  it("maps validation errors to 422 with field paths", async () => {
    const r = z.object({ a: z.string() }).safeParse({ a: 1 });
    const res = errorResponse(r.error, "rid-2");
    expect(res.status).toBe(422);
    const body = (await res.json()) as { error: { details: { path: string }[] } };
    expect(body.error.details[0].path).toBe("a");
  });
  it("never leaks internals for unexpected errors", async () => {
    const res = errorResponse(new Error("connection string postgres://user:SECRET@host"), "rid-3");
    expect(res.status).toBe(500);
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("SECRET");
    expect(text).not.toContain("postgres://");
    expect(text).toContain("INTERNAL_ERROR");
  });
});
