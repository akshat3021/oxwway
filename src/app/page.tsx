"use client";

import React, { useState } from "react";
import { Loader } from "@/components/Loader";
import { HeroCanvas } from "@/components/HeroCanvas";
import { CapabilityStrip } from "@/components/CapabilityStrip";
import { CognitiveLoop } from "@/components/CognitiveLoop";
import { ProofLayer } from "@/components/ProofLayer";
import { TeamTeaser } from "@/components/TeamTeaser";
import { NewsPreview } from "@/components/NewsPreview";
import { ClosingCTA } from "@/components/ClosingCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [booting, setBooting] = useState(true);

  return (
    <>
      {booting && <Loader onComplete={() => setBooting(false)} />}
      
      <div className="relative min-h-[200vh]">
        {/* The 3D Canvas sits behind/interleaves with text */}
        {!booting && <HeroCanvas />}

        {/* Scrollable Content Layer */}
        <div id="hero-section" className="relative h-screen flex items-center justify-center pointer-events-none z-10">
          <div className="text-center px-4 mix-blend-difference text-foreground">
            <h1 className="font-display text-[var(--text-fluid-h1)] uppercase leading-[0.8] tracking-tighter">
              The Future <br />
              <span className="text-accent opacity-80">Assembled</span>
            </h1>
            <p className="font-mono mt-8 text-xs uppercase tracking-[0.2em] opacity-50">
              Not a simulation. Step into the lab.
            </p>
          </div>
        </div>

        {/* Phase 2: Capability Strip */}
        <CapabilityStrip />

        {/* Phase 2: Cognitive Loop */}
        <CognitiveLoop />

        {/* Phase 3: Proof Layer */}
        <ProofLayer />

        {/* Phase 3: Team Teaser */}
        <TeamTeaser />

        {/* Phase 3: News Preview */}
        <NewsPreview />

        {/* Phase 3: Closing CTA */}
        <ClosingCTA />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
