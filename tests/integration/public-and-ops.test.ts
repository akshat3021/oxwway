import { beforeEach, describe, expect, it } from "vitest";
import * as health from "@/app/api/health/route";
import * as ready from "@/app/api/ready/route";
import * as messages from "@/app/api/admin/messages/route";
import * as message from "@/app/api/admin/messages/[id]/route";
import * as contact from "@/app/api/public/contact/route";
import { prisma } from "@/server/db/prisma";
import { resetRateLimitsForTests } from "@/server/http/rate-limit";
import { bodyOf, loginCookie, makeRequest, makeUser, resetDb, seg } from "../helpers";

const submit = (json: unknown, ip = "198.51.100.7") =>
  contact.POST(makeRequest("POST", "/api/public/contact", { json, headers: { "x-forwarded-for": ip } }));
const valid = { name: "Ada", email: "ada@example.com", message: "Hello OXWAY" };

beforeEach(async () => {
  await resetDb();
  resetRateLimitsForTests();
});

describe("public contact form", () => {
  it("stores a valid message", async () => {
    expect((await submit(valid)).status).toBe(202);
    expect(await prisma.contactMessage.count()).toBe(1);
  });

  it("silently drops honeypot submissions (bots think it worked)", async () => {
    expect((await submit({ ...valid, website: "http://spam.example" })).status).toBe(202);
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it("validates input", async () => {
    expect((await submit({ ...valid, email: "nope" })).status).toBe(422);
    expect((await submit({ ...valid, message: "" })).status).toBe(422);
    expect((await submit({ ...valid, role: "admin" })).status).toBe(422);
  });

  it("rate-limits one IP but not another", async () => {
    for (let i = 0; i < 5; i++) expect((await submit(valid)).status).toBe(202);
    const blocked = await submit(valid);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    expect((await submit(valid, "203.0.113.50")).status).toBe(202);
  });

  it("rejects cross-site posts", async () => {
    const res = await contact.POST(makeRequest("POST", "/api/public/contact", { json: valid, origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("stores text verbatim and the API never executes or echoes it back unsafely", async () => {
    await submit({ ...valid, message: "<script>alert(1)</script>" });
    const stored = await prisma.contactMessage.findFirstOrThrow();
    expect(stored.message).toBe("<script>alert(1)</script>"); // escaped at render time, not mangled here
  });
});

describe("contact inbox (admin)", () => {
  it("is admin-only", async () => {
    const editor = await loginCookie((await makeUser("editor")).email);
    expect((await messages.GET(makeRequest("GET", "/api/admin/messages", { cookie: editor }))).status).toBe(403);
    expect((await messages.GET(makeRequest("GET", "/api/admin/messages"))).status).toBe(401);
  });

  it("lists, marks read, and hard-deletes (erasure request)", async () => {
    const admin = await loginCookie((await makeUser("admin")).email);
    await submit(valid);
    const id = (await prisma.contactMessage.findFirstOrThrow()).id;

    const list = await bodyOf<{ data: unknown[] }>(await messages.GET(makeRequest("GET", "/api/admin/messages", { cookie: admin, query: "?status=unread" })));
    expect(list.data).toHaveLength(1);

    const read = await message.PATCH(makeRequest("PATCH", `/api/admin/messages/${id}`, { cookie: admin, json: { read: true } }), seg({ id: String(id) }));
    expect(read.status).toBe(200);
    expect((await prisma.contactMessage.findUniqueOrThrow({ where: { id } })).readAt).toBeInstanceOf(Date);

    const del = await message.DELETE(makeRequest("DELETE", `/api/admin/messages/${id}`, { cookie: admin }), seg({ id: String(id) }));
    expect(del.status).toBe(204);
    expect(await prisma.contactMessage.count()).toBe(0); // truly gone, not soft-deleted
    expect(await prisma.auditLog.count({ where: { entity: "ContactMessage", action: "delete" } })).toBe(1);
  });
});

describe("health endpoints", () => {
  it("liveness answers without touching dependencies", async () => {
    const res = await health.GET(makeRequest("GET", "/api/health"));
    expect(res.status).toBe(200);
    expect((await bodyOf<{ data: { status: string } }>(res)).data.status).toBe("ok");
  });
  it("readiness verifies the database and carries a request id", async () => {
    const res = await ready.GET(makeRequest("GET", "/api/ready"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });
});

describe("feature flags", () => {
  it("returns the stored value, and the fallback for unknown or malformed flags", async () => {
    const { getFlag } = await import("@/server/services/flags");
    expect(await getFlag("newCheckout")).toBe(false); // no settings row yet
    await prisma.siteSettings.create({ data: { flags: { newCheckout: true, broken: "yes" } } });
    expect(await getFlag("newCheckout")).toBe(true);
    expect(await getFlag("missing")).toBe(false);
    expect(await getFlag("missing", true)).toBe(true);
    expect(await getFlag("broken")).toBe(false); // non-boolean is ignored
  });
});
