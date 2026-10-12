/**
 * Tiny, dependency-free Markdown parser that produces a plain data tree
 * (never HTML strings). The renderer turns it into React elements, so author
 * text can never become markup: there is no HTML injection path at all.
 *
 * Supported: #/##/### headings, paragraphs, - / * / 1. lists, > quotes,
 * ``` code fences, --- rules, **bold**, *italic*, `code`, [text](url).
 */
export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: Inline[] };

export type Block =
  | { t: "h"; level: 1 | 2 | 3; c: Inline[] }
  | { t: "p"; c: Inline[] }
  | { t: "ul"; items: Inline[][] }
  | { t: "ol"; items: Inline[][] }
  | { t: "quote"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "hr" };

/** Links may only be https, mailto, site-relative, or in-page anchors. */
export function isSafeHref(href: string): boolean {
  if (href.startsWith("/")) return !href.startsWith("//") && !/[\\\s]/.test(href);
  if (href.startsWith("#")) return !/\s/.test(href);
  try {
    const u = new URL(href);
    return u.protocol === "https:" || u.protocol === "mailto:";
  } catch {
    return false;
  }
}

const INLINE = /(`([^`]+)`)|(\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\))|(\*\*([^*]+)\*\*)|(\*([^*\s][^*]*)\*)/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const index = m.index ?? 0;
    if (index > last) out.push({ t: "text", v: text.slice(last, index) });
    if (m[1]) out.push({ t: "code", v: m[2] });
    else if (m[3]) {
      const label = parseInline(m[4]);
      // Unsafe URL (javascript:, data:, ...) degrades to its visible label.
      if (isSafeHref(m[5])) out.push({ t: "link", href: m[5], c: label });
      else out.push(...label);
    } else if (m[6]) out.push({ t: "strong", c: parseInline(m[7]) });
    else if (m[8]) out.push({ t: "em", c: parseInline(m[9]) });
    last = index + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isBlockStart = (l: string) =>
    /^(#{1,3})\s/.test(l) || /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l) || /^>\s?/.test(l) || /^```/.test(l) || /^-{3,}\s*$/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }

    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      blocks.push({ t: "code", v: buf.join("\n") });
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) { blocks.push({ t: "h", level: h[1].length as 1 | 2 | 3, c: parseInline(h[2].trim()) }); i++; continue; }
    if (/^-{3,}\s*$/.test(line)) { blocks.push({ t: "hr" }); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ t: "quote", c: parseInline(buf.join(" ")) });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(parseInline(lines[i++].replace(/^\s*[-*]\s+/, "")));
      blocks.push({ t: "ul", items });
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(parseInline(lines[i++].replace(/^\s*\d+\.\s+/, "")));
      blocks.push({ t: "ol", items });
      continue;
    }

    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !isBlockStart(lines[i])) buf.push(lines[i++].trim());
    blocks.push({ t: "p", c: parseInline(buf.join(" ")) });
  }
  return blocks;
}
