"use client";

import React, { useState } from "react";
import { Loader } from "@/components/Loader";
import { BullWatermark } from "@/components/BullWatermark";
import { HeroCapabilityCards } from "@/components/HeroCapabilityCards";
import { CapabilityStrip } from "@/components/CapabilityStrip";
import { CognitiveLoop } from "@/components/CognitiveLoop";
import { ProofLayer } from "@/components/ProofLayer";
import { TeamTeaser } from "@/components/TeamTeaser";
import { NewsPreview } from "@/components/NewsPreview";
import { ClosingCTA } from "@/components/ClosingCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [booting, setBooting] = useState(true);
  const [cmsData, setCmsData] = useState<{
    heroHeadline?: string;
    heroSubheadline?: string;
    heroDescription?: string;
    systemStatusLabel?: string;
    accessLevelReadout?: string;
  } | null>(null);

  React.useEffect(() => {
    fetch('/api/public/homepage')
      .then(res => res.json())
      .then(data => { if (data && Object.keys(data).length > 0) setCmsData(data); })
      .catch(() => {});
  }, []);

  return (
    <>
      {booting && <Loader onComplete={() => setBooting(false)} />}

      {!booting && (
        <div className="relative">

          {/* ═══════════════════════════════════════════
              HERO SECTION — Full viewport, two-column
          ═══════════════════════════════════════════ */}
          <section
            id="hero-section"
            className="relative min-h-screen flex flex-col overflow-hidden"
            style={{ paddingTop: "64px" }} /* clear the fixed nav */
          >
            {/* Background: Bull watermark + global architectural grid */}
            <BullWatermark />

            {/* ─── Two-Column Content ─── */}
            <div className="relative flex-1 flex items-center z-10 px-8 md:px-16 lg:px-24 py-12">
              <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">

                {/* ── LEFT COLUMN ── */}
                <div className="flex flex-col">

                  {/* Tag */}
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.25em] mb-5 flex items-center gap-3"
                    style={{ color: "var(--accent)" }}
                  >
                    <span className="w-4 h-[1px]" style={{ backgroundColor: "var(--accent)" }} />
                    {cmsData?.systemStatusLabel || "SYSTEM STATUS"}
                  </div>

                  {/* Headline */}
                  <h1
                    className="font-display uppercase leading-[0.88] tracking-tighter mb-6"
                    style={{
                      fontSize: "clamp(4rem, 10vw, 9.5rem)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {cmsData?.heroHeadline || "OXWAY"}
                    <br />
                    <span
                      style={{
                        color: "transparent",
                        WebkitTextStroke: "2px var(--accent)",
                      }}
                    >
                      {cmsData?.heroSubheadline || "CORE"}
                    </span>
                  </h1>

                  {/* Description */}
                  <p
                    className="font-sans font-medium leading-relaxed mb-8 max-w-[360px]"
                    style={{
                      fontSize: "clamp(0.8rem, 1.1vw, 1rem)",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {cmsData?.heroDescription || "Engineered for absolute capability."}
                  </p>

                  {/* CTA — Mechanical bracket style */}
                  <div className="flex items-center gap-6">
                    <button
                      className="group flex items-center gap-4 border font-mono text-xs uppercase tracking-[0.18em] px-5 py-3 transition-all duration-200"
                      style={{
                        borderColor: "var(--accent)",
                        color: "var(--accent)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                      }}
                    >
                      <span className="font-mono text-[10px] opacity-60">[</span>
                      <span>Initiate Sequence</span>
                      <span className="w-4 h-4 border border-current flex items-center justify-center text-[10px] transition-transform duration-200 group-hover:rotate-90">
                        +
                      </span>
                      <span className="font-mono text-[10px] opacity-60">]</span>
                    </button>
                  </div>

                  {/* Bottom-left scroll cue */}
                  <div
                    className="mt-auto pt-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em]"
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

                {/* ── RIGHT COLUMN — Capability Cards ── */}
                <div className="flex flex-col gap-2">
                  <HeroCapabilityCards />
                </div>
              </div>
            </div>

            {/* Bottom-right HUD readout */}
            <div
              className="absolute bottom-6 right-8 md:right-16 font-mono text-[10px] uppercase tracking-[0.18em] z-10"
              style={{ color: "var(--text-secondary)" }}
            >
              Access Level:{" "}
              <span style={{ color: "var(--accent)" }}>Alpha</span>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              BELOW-HERO SECTIONS — unchanged
          ═══════════════════════════════════════════ */}
          <CapabilityStrip />
          <CognitiveLoop />
          <ProofLayer />
          <TeamTeaser />
          <NewsPreview />
          <ClosingCTA />
          <Footer />
        </div>
      )}
    </>
  );
}
