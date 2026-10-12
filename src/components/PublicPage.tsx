import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";

/** Shared frame + header so every public page keeps the same visual language. */
export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="pt-24 min-h-screen bg-background">
      {children}
      <Footer />
    </div>
  );
}

export function PageHeader({ tag, title, accent, intro }: { tag: string; title: string; accent?: string; intro?: string }) {
  return (
    <header className="px-[5vw] mb-12 md:mb-16 max-w-5xl">
      <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">[ {tag} ]</div>
      <h1 className="font-display text-4xl sm:text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-6">
        {title} {accent && <span className="text-accent">{accent}</span>}
      </h1>
      {intro && <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">{intro}</p>}
    </header>
  );
}

export function EmptyNote({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-[5vw] pb-24">
      <div className="max-w-3xl border border-dashed border-foreground/15 p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">{title}</p>
        {hint && <p className="font-mono text-[11px] text-foreground/40 mt-2">{hint}</p>}
      </div>
    </div>
  );
}

export const card =
  "border border-foreground/10 backdrop-blur-md hover:border-accent/40 transition-colors";
