import { Fragment, type ReactNode } from "react";
import { parseMarkdown, type Inline } from "@/lib/markdown";

function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.t) {
      case "text": return <Fragment key={i}>{n.v}</Fragment>;
      case "strong": return <strong key={i} className="text-foreground font-semibold">{renderInline(n.c)}</strong>;
      case "em": return <em key={i}>{renderInline(n.c)}</em>;
      case "code": return <code key={i} className="font-mono text-[0.9em] px-1 bg-foreground/10">{n.v}</code>;
      case "link": {
        const external = /^https?:/.test(n.href);
        return (
          <a key={i} href={n.href} className="text-accent underline underline-offset-4 hover:opacity-80"
            {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
            {renderInline(n.c)}
          </a>
        );
      }
    }
  });
}

/** Renders author Markdown as React elements. Contains no raw-HTML escape hatch. */
export function SafeMarkdown({ source, className = "" }: { source: string; className?: string }) {
  const blocks = parseMarkdown(source);
  return (
    <div className={`flex flex-col gap-5 text-foreground/75 leading-relaxed ${className}`}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h": {
            const cls = "font-display uppercase text-foreground " + (b.level === 1 ? "text-3xl mt-6" : b.level === 2 ? "text-2xl mt-4" : "text-xl mt-2");
            return b.level === 1 ? <h2 key={i} className={cls}>{renderInline(b.c)}</h2> : b.level === 2 ? <h3 key={i} className={cls}>{renderInline(b.c)}</h3> : <h4 key={i} className={cls}>{renderInline(b.c)}</h4>;
          }
          case "p": return <p key={i}>{renderInline(b.c)}</p>;
          case "ul": return <ul key={i} className="list-disc pl-6 flex flex-col gap-1.5">{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
          case "ol": return <ol key={i} className="list-decimal pl-6 flex flex-col gap-1.5">{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>;
          case "quote": return <blockquote key={i} className="border-l-2 border-accent pl-5 italic text-foreground/60">{renderInline(b.c)}</blockquote>;
          case "code": return <pre key={i} className="overflow-x-auto border border-foreground/10 bg-foreground/5 p-4 font-mono text-xs"><code>{b.v}</code></pre>;
          case "hr": return <hr key={i} className="border-foreground/10" />;
        }
      })}
    </div>
  );
}
