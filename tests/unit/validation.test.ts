import { describe, expect, it } from "vitest";
import { isSafeUrlOrPath } from "@/server/validation/common";
import { asUpdate, blogPostCreate, contactSubmit, homepageUpdate, loginSchema, productCreate } from "@/server/validation/schemas";

describe("URL safety", () => {
  it.each(["https://cdn.example.com/a.png", "/uploads/a.png"])("accepts %s", (u) => {
    expect(isSafeUrlOrPath(u)).toBe(true);
  });
  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "http://insecure.example.com/a.png",
    "//evil.example.com/a.png",
    "/ok\\..\\evil",
    "https://a.com/has space",
    "vbscript:x",
    "",
  ])("rejects %s", (u) => {
    expect(isSafeUrlOrPath(u)).toBe(false);
  });
});

describe("blog post schema", () => {
  const valid = { title: "Hello", slug: "hello-world" };

  it("accepts a minimal valid post", () => {
    expect(blogPostCreate.safeParse(valid).success).toBe(true);
  });
  it("REJECTS unknown fields (mass-assignment protection)", () => {
    for (const evil of [{ deletedAt: null }, { id: 1 }, { createdAt: "2020-01-01T00:00:00Z" }, { authorId: "x" }]) {
      expect(blogPostCreate.safeParse({ ...valid, ...evil }).success).toBe(false);
    }
  });
  it("rejects bad slugs", () => {
    for (const slug of ["Has Caps", "has_underscore", "-lead", "trail-", "a/b", "x"]) {
      expect(blogPostCreate.safeParse({ ...valid, slug }).success).toBe(false);
    }
  });
  it("rejects javascript: cover images", () => {
    expect(blogPostCreate.safeParse({ ...valid, coverImage: "javascript:alert(1)" }).success).toBe(false);
  });
  it("strips control characters and trims", () => {
    const r = blogPostCreate.parse({ title: "  Hel\u0000lo\u0007  ", slug: "hello" });
    expect(r.title).toBe("Hello");
  });
  it("treats an empty optional string as null (clears the field)", () => {
    expect(blogPostCreate.parse({ ...valid, excerpt: "   " }).excerpt).toBeNull();
  });
  it("converts publishDate to a Date and rejects junk", () => {
    expect(blogPostCreate.parse({ ...valid, publishDate: "2026-01-02T03:04:05Z" }).publishDate).toBeInstanceOf(Date);
    expect(blogPostCreate.safeParse({ ...valid, publishDate: "tomorrow" }).success).toBe(false);
  });
  it("update variant is partial and does NOT inject defaults", () => {
    const r = asUpdate(blogPostCreate).parse({ title: "Only title" });
    expect(Object.keys(r)).toEqual(["title"]);
  });
  it("limits tag count and status values", () => {
    expect(blogPostCreate.safeParse({ ...valid, tags: Array(11).fill("t") }).success).toBe(false);
    expect(blogPostCreate.safeParse({ ...valid, status: "archived" }).success).toBe(false);
  });
});

describe("other schemas", () => {
  it("product specs must be a flat map", () => {
    expect(productCreate.safeParse({ name: "X", slug: "x1", specs: { weight: "5kg", dof: 42 } }).success).toBe(true);
    expect(productCreate.safeParse({ name: "X", slug: "x1", specs: { nested: { a: 1 } } }).success).toBe(false);
  });
  it("login normalises the email and bounds the password length", () => {
    expect(loginSchema.parse({ email: "  Admin@OXWAY.io ", password: "x" }).email).toBe("admin@oxway.io");
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x".repeat(129) }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x", role: "admin" }).success).toBe(false);
  });
  it("contact form requires a real email and bounds the message", () => {
    expect(contactSubmit.safeParse({ name: "A", email: "nope", message: "hi" }).success).toBe(false);
    expect(contactSubmit.safeParse({ name: "A", email: "a@b.co", message: "x".repeat(5001) }).success).toBe(false);
    expect(contactSubmit.safeParse({ name: "A", email: "a@b.co", message: "hi" }).success).toBe(true);
  });
  it("homepage CTA link must be a safe URL", () => {
    expect(homepageUpdate.safeParse({ ctaLink: "javascript:alert(1)" }).success).toBe(false);
    expect(homepageUpdate.safeParse({ ctaLink: "/products" }).success).toBe(true);
  });
});
