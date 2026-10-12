import { describe, expect, it } from "vitest";
import { isSafeHref, parseInline, parseMarkdown } from "@/lib/markdown";

describe("markdown safety", () => {
  it("keeps HTML as inert text, never as markup", () => {
    const blocks = parseMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    expect(blocks).toEqual([
      { t: "p", c: [{ t: "text", v: "<script>alert(1)</script>" }] },
      { t: "p", c: [{ t: "text", v: "<img src=x onerror=alert(1)>" }] },
    ]);
  });

  it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>1</script>", "vbscript:x", "//evil.example", "http-ish"])(
    "neutralises the link target %s",
    (href) => {
      expect(isSafeHref(href)).toBe(false);
      const nodes = parseInline(`[click me](${href})`);
      expect(nodes.some((n) => n.t === "link")).toBe(false);
      expect(nodes).toEqual([{ t: "text", v: "click me" }]);
    },
  );

  it.each(["https://example.com/a", "mailto:hi@example.com", "/products", "#section"])("allows %s", (href) => {
    expect(isSafeHref(href)).toBe(true);
    expect(parseInline(`[x](${href})`)[0]).toMatchObject({ t: "link", href });
  });
});

describe("markdown parsing", () => {
  it("parses headings, lists, quotes, code, rules", () => {
    const md = "# Title\n\nHello **bold** and *it* and `code`.\n\n- a\n- b\n\n1. one\n2. two\n\n> quoted\n\n---\n\n```\nlet x = 1;\n```";
    const kinds = parseMarkdown(md).map((b) => b.t);
    expect(kinds).toEqual(["h", "p", "ul", "ol", "quote", "hr", "code"]);
  });

  it("joins soft-wrapped lines into one paragraph", () => {
    expect(parseMarkdown("one\ntwo\nthree")).toEqual([{ t: "p", c: [{ t: "text", v: "one two three" }] }]);
  });

  it("handles empty input and a huge unterminated fence without hanging", () => {
    expect(parseMarkdown("")).toEqual([]);
    expect(parseMarkdown("```\n" + "x\n".repeat(50_000)).length).toBe(1);
  });
});
