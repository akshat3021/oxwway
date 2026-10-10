import Link from "next/link";

/**
 * Closing call-to-action. Previously mounted a full WebGL scene (three.js)
 * just to draw a barely visible silhouette; now a pure-CSS accent glow, which
 * is lighter, theme-aware and renders on the server.
 */
export function ClosingCTA() {
  return (
    <section className="relative py-24 md:py-32 bg-transparent border-t border-foreground/5 overflow-hidden flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 50%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h2 className="font-display text-5xl md:text-7xl uppercase text-foreground mb-12">
          Ready to <br />
          <span className="text-accent opacity-80">Engage</span>
        </h2>

        <Link
          href="/contact"
          className="group relative inline-flex items-center justify-center px-12 py-4 border border-accent/50 bg-accent/10 hover:bg-accent/20 transition-colors"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-accent" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent" />
          <span className="font-mono text-sm uppercase tracking-widest text-accent">
            Get in touch
          </span>
        </Link>
      </div>
    </section>
  );
}
