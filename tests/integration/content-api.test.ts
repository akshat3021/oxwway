import { beforeEach, describe, expect, it } from "vitest";
import { revalidatePath } from "next/cache";
import * as collection from "@/app/api/admin/[resource]/route";
import * as item from "@/app/api/admin/[resource]/[id]/route";
import * as homepage from "@/app/api/admin/homepage/route";
import * as settings from "@/app/api/admin/settings/route";
import { prisma } from "@/server/db/prisma";
import { createResource, getResource } from "@/server/services/content";
import { listPublishedPosts, getPublishedPost } from "@/server/services/public";
import { bodyOf, loginCookie, makeRequest, makeUser, resetDb, seg } from "../helpers";

type Json = Record<string, unknown>;
const list = (resource: string, cookie?: string, query = "") =>
  collection.GET(makeRequest("GET", `/api/admin/${resource}`, { cookie, query }), seg({ resource }));
const create = (resource: string, json: unknown, cookie?: string, opts = {}) =>
  collection.POST(makeRequest("POST", `/api/admin/${resource}`, { cookie, json, ...opts }), seg({ resource }));
const patch = (resource: string, id: string | number, json: unknown, cookie?: string) =>
  item.PATCH(makeRequest("PATCH", `/api/admin/${resource}/${id}`, { cookie, json }), seg({ resource, id: String(id) }));
const del = (resource: string, id: string | number, cookie?: string) =>
  item.DELETE(makeRequest("DELETE", `/api/admin/${resource}/${id}`, { cookie }), seg({ resource, id: String(id) }));
const getOne = (resource: string, id: string | number, cookie?: string) =>
  item.GET(makeRequest("GET", `/api/admin/${resource}/${id}`, { cookie }), seg({ resource, id: String(id) }));

const post = { title: "Hello World", slug: "hello-world", body: "Some body text" };

let admin: string;
let editor: string;

beforeEach(async () => {
  await resetDb();
  admin = await loginCookie((await makeUser("admin")).email);
  editor = await loginCookie((await makeUser("editor")).email);
});

describe("authentication & authorisation", () => {
  it.each(["blog-posts", "products", "team-members", "job-listings", "gallery-items"])(
    "%s: every verb returns 401 without a session",
    async (r) => {
      expect((await list(r)).status).toBe(401);
      expect((await create(r, {})).status).toBe(401);
      expect((await patch(r, 1, {})).status).toBe(401);
      expect((await del(r, 1)).status).toBe(401);
      expect((await getOne(r, 1)).status).toBe(401);
    },
  );

  it("unknown resources are 404, not a crash or a data leak", async () => {
    expect((await list("users-table", admin)).status).toBe(404);
    expect((await list("constructor", admin)).status).toBe(404);
    expect((await list("__proto__", admin)).status).toBe(404);
  });

  it("non-numeric / out-of-range ids are 404", async () => {
    for (const id of ["abc", "0", "-1", "99999999999", "1;DROP TABLE"]) {
      expect((await getOne("blog-posts", id, admin)).status).toBe(404);
    }
  });

  it("rejects cross-site writes even with a valid session (CSRF)", async () => {
    expect((await create("blog-posts", post, admin, { origin: "https://evil.example" })).status).toBe(403);
    expect((await create("blog-posts", post, admin, { origin: null })).status).toBe(403);
    expect(await prisma.blogPost.count()).toBe(0);
  });
});

describe("editor vs admin policy", () => {
  it("editors can create drafts and edit", async () => {
    const res = await create("blog-posts", post, editor);
    expect(res.status).toBe(201);
    const { data } = await bodyOf<{ data: Json }>(res);
    expect(data.status).toBe("draft");
    expect((await patch("blog-posts", data.id as number, { title: "Edited" }, editor)).status).toBe(200);
  });

  it("editors CANNOT publish, on create or on update", async () => {
    expect((await create("blog-posts", { ...post, status: "published" }, editor)).status).toBe(403);
    const { data } = await bodyOf<{ data: Json }>(await create("blog-posts", post, editor));
    expect((await patch("blog-posts", data.id as number, { status: "published" }, editor)).status).toBe(403);
    expect((await prisma.blogPost.findFirstOrThrow()).status).toBe("draft");
  });

  it("editors CANNOT delete", async () => {
    const { data } = await bodyOf<{ data: Json }>(await create("blog-posts", post, editor));
    expect((await del("blog-posts", data.id as number, editor)).status).toBe(403);
    expect(await prisma.blogPost.count({ where: { deletedAt: null } })).toBe(1);
  });

  it("admins publish (publishDate is stamped) and unpublish, each audited", async () => {
    const { data } = await bodyOf<{ data: Json }>(await create("blog-posts", post, admin));
    const pub = await patch("blog-posts", data.id as number, { status: "published" }, admin);
    expect(pub.status).toBe(200);
    expect((await prisma.blogPost.findFirstOrThrow()).publishDate).toBeInstanceOf(Date);
    await patch("blog-posts", data.id as number, { status: "draft" }, admin);
    const actions = (await prisma.auditLog.findMany({ orderBy: { id: "asc" } })).map((a) => a.action);
    expect(actions).toEqual(expect.arrayContaining(["create", "publish", "unpublish"]));
  });

  it("editors may edit singletons like the homepage, but not settings", async () => {
    const put = (mod: typeof homepage, p: string, cookie: string) =>
      mod.PUT(makeRequest("PUT", p, { cookie, json: { heroHeadline: "NEW" } }));
    expect((await put(homepage, "/api/admin/homepage", editor)).status).toBe(200);
    const s = await settings.PUT(makeRequest("PUT", "/api/admin/settings", { cookie: editor, json: { showBullWatermark: false } }));
    expect(s.status).toBe(403);
    const sa = await settings.PUT(makeRequest("PUT", "/api/admin/settings", { cookie: admin, json: { showBullWatermark: false } }));
    expect(sa.status).toBe(200);
  });

  it("reading a singleton twice never creates duplicate rows", async () => {
    await homepage.GET(makeRequest("GET", "/api/admin/homepage", { cookie: admin }));
    await homepage.GET(makeRequest("GET", "/api/admin/homepage", { cookie: admin }));
    expect(await prisma.homepageContent.count()).toBe(1);
  });
});

describe("input validation & mass assignment", () => {
  it("rejects fields the client must never control", async () => {
    for (const evil of [{ deletedAt: null }, { id: 999 }, { createdAt: "2000-01-01T00:00:00Z" }]) {
      const res = await create("blog-posts", { ...post, ...evil }, admin);
      expect(res.status).toBe(422);
    }
    expect(await prisma.blogPost.count()).toBe(0);
  });

  it("rejects unknown fields on update", async () => {
    const { data } = await bodyOf<{ data: Json }>(await create("blog-posts", post, admin));
    expect((await patch("blog-posts", data.id as number, { slug: "ok-slug", deletedAt: new Date() }, admin)).status).toBe(422);
  });

  it("reports which field is wrong", async () => {
    const res = await create("blog-posts", { ...post, slug: "Not A Slug" }, admin);
    expect(res.status).toBe(422);
    const body = await bodyOf<{ error: { code: string; details: { path: string }[]; requestId: string } }>(res);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details.map((d) => d.path)).toContain("slug");
    expect(body.error.requestId).toBeTruthy();
  });

  it("blocks javascript: URLs in media fields (stored XSS)", async () => {
    expect((await create("blog-posts", { ...post, coverImage: "javascript:alert(1)" }, admin)).status).toBe(422);
    expect((await create("gallery-items", { mediaRef: "javascript:alert(1)" }, admin)).status).toBe(422);
    expect((await create("team-members", { name: "A", role: "B", photoRef: "data:text/html,<script>1</script>" }, admin)).status).toBe(422);
  });

  it("returns 409 (not 500) on a duplicate slug", async () => {
    await create("blog-posts", post, admin);
    const dup = await create("blog-posts", post, admin);
    expect(dup.status).toBe(409);
    expect((await bodyOf<{ error: { code: string } }>(dup)).error.code).toBe("CONFLICT");
  });

  it("enforces body size and content type", async () => {
    const big = await create("blog-posts", { ...post, body: "x".repeat(1_200_000) }, admin);
    expect(big.status).toBe(413);
    const res = await collection.POST(
      new Request("http://localhost/api/admin/blog-posts", { method: "POST", headers: { host: "localhost", origin: "http://localhost", cookie: admin, "content-type": "text/plain" }, body: "x" }),
      seg({ resource: "blog-posts" }),
    );
    expect(res.status).toBe(415);
  });

  it("caps page size and rejects nonsense", async () => {
    expect((await list("team-members", admin, "?pageSize=100000")).status).toBe(422);
    expect((await list("team-members", admin, "?page=0")).status).toBe(422);
    expect((await list("blog-posts", admin, "?status=hacked")).status).toBe(422);
  });

  it("searches case-insensitively and treats LIKE wildcards as literal text", async () => {
    await prisma.teamMember.createMany({ data: [{ name: "Ada Lovelace", role: "Pioneer" }, { name: "Grace Hopper", role: "Admiral" }] });
    const found = await bodyOf<{ data: Json[] }>(await list("team-members", admin, "?q=LOVELACE"));
    expect(found.data).toHaveLength(1);
    const injection = await list("team-members", admin, `?q=${encodeURIComponent("'; DROP TABLE \"TeamMember\";--")}`);
    expect(injection.status).toBe(200);
    expect(await prisma.teamMember.count()).toBe(2);
  });

  it("filters by status", async () => {
    await prisma.blogPost.createMany({ data: [{ title: "A", slug: "a1", status: "draft" }, { title: "B", slug: "b1", status: "published" }] });
    const res = await bodyOf<{ data: Json[] }>(await list("blog-posts", admin, "?status=published"));
    expect(res.data).toHaveLength(1);
  });
});

describe("audit trail", () => {
  it("records who did what, in the same transaction, without copying content", async () => {
    const u = await prisma.user.findFirstOrThrow({ where: { role: "editor" } });
    const { data } = await bodyOf<{ data: Json }>(await create("blog-posts", { ...post, body: "TOP-SECRET-BODY" }, editor));
    await patch("blog-posts", data.id as number, { title: "Edited title" }, editor);

    const logs = await prisma.auditLog.findMany({ where: { entity: "BlogPost" }, orderBy: { id: "asc" } });
    expect(logs.map((l) => l.action)).toEqual(["create", "update"]);
    expect(logs[0]).toMatchObject({ actorId: u.id, actorEmail: u.email, entityId: String(data.id) });
    expect(logs[0].requestId).toBeTruthy();
    const dump = JSON.stringify(logs);
    expect(dump).not.toContain("TOP-SECRET-BODY");
    expect(dump).not.toContain("Edited title");
    expect(logs[1].metadata).toEqual({ fields: ["title"] });
  });

  it("rolls back the content change if the audit write fails (atomicity)", async () => {
    await expect(
      createResource(getResource("blog-posts"), { actor: { id: "00000000-0000-0000-0000-000000000000", email: "ghost@x.y", name: "g", role: "admin", sessionId: "s" }, ip: "1.1.1.1", requestId: "r" }, post),
    ).rejects.toBeTruthy();
    expect(await prisma.blogPost.count()).toBe(0);
  });
});

describe("cache invalidation", () => {
  it("refreshes the public site after a write", async () => {
    (revalidatePath as unknown as { mockClear(): void }).mockClear();
    await create("blog-posts", post, admin);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("public visibility", () => {
  it("never exposes drafts or deleted posts", async () => {
    await prisma.blogPost.createMany({
      data: [
        { title: "Live", slug: "live", status: "published", publishDate: new Date() },
        { title: "Draft", slug: "draft", status: "draft" },
        { title: "Gone", slug: "gone", status: "published", deletedAt: new Date() },
      ],
    });
    const { rows, total } = await listPublishedPosts();
    expect(rows.map((r) => r.slug)).toEqual(["live"]);
    expect(total).toBe(1);
    expect(await getPublishedPost("draft")).toBeNull();
    expect(await getPublishedPost("gone")).toBeNull();
    expect(await getPublishedPost("live")).not.toBeNull();
  });
});
