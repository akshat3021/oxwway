import Link from "next/link";
import { BullWatermark } from "@/components/BullWatermark";
import { HeroCapabilityCards } from "@/components/HeroCapabilityCards";
import type { LandingHero } from "@/lib/landing";

/** Landing hero. Server-rendered so the headline is in the initial HTML. */
export function HeroSection({ hero }: { hero: LandingHero }) {
  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex flex-col overflow-hidden pt-16"
    >
      <BullWatermark />

      <div className="relative flex-1 flex items-center z-10 px-6 md:px-16 lg:px-24 py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">
          {/* LEFT */}
          <div className="flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] mb-5 flex items-center gap-3 text-accent">
              <span className="w-4 h-px bg-accent" />
              {hero.statusLabel}
            </div>

            <h1
              className="font-display uppercase leading-[0.88] tracking-tighter mb-6"
              style={{
                fontSize: "clamp(3.25rem, 10vw, 9.5rem)",
                color: "var(--text-primary)",
              }}
            >
              {hero.headline}
              <br />
              <span
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px var(--accent)",
                }}
              >
                {hero.subheadline}
              </span>
            </h1>

            <p
              className="font-sans font-medium leading-relaxed mb-8 max-w-[360px] uppercase tracking-[0.06em]"
              style={{
                fontSize: "clamp(0.8rem, 1.1vw, 1rem)",
                color: "var(--text-secondary)",
              }}
            >
              {hero.description}
            </p>

            <div className="flex items-center gap-6">
              <Link
                href={hero.ctaLink}
                className="group flex items-center gap-4 border border-accent text-accent font-mono text-xs uppercase tracking-[0.18em] px-5 py-3 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
              >
                <span className="font-mono text-[10px] opacity-60">[</span>
                <span>{hero.ctaLabel}</span>
                <span className="w-4 h-4 border border-current flex items-center justify-center text-[10px] transition-transform duration-200 group-hover:rotate-90">
                  +
                </span>
                <span className="font-mono text-[10px] opacity-60">]</span>
              </Link>
            </div>

            <div
              className="mt-auto pt-16 md:pt-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: "var(--text-secondary)" }}
            >
              <div
                className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: "var(--text-secondary)" }}
              >
                <div
                  className="w-1 h-1 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--text-secondary)" }}
                />
              </div>
              <span>— Scroll to explore</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-2">
            <HeroCapabilityCards />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 right-6 md:right-16 font-mono text-[10px] uppercase tracking-[0.18em] z-10"
        style={{ color: "var(--text-secondary)" }}
      >
        Access Level: <span className="text-accent">{hero.accessLevel}</span>
      </div>
    </section>
  );
}
