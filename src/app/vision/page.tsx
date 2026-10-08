"use client";

import React from "react";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const tenets = [
  {
    id: "TENET.01",
    title: "Physics Before Probability",
    statement: "Uncertainty in dynamic control loops leads to failure. We build deterministic mechanical systems anchored directly in Newton-Euler dynamics rather than statistical guesswork."
  },
  {
    id: "TENET.02",
    title: "High Torque-Density Density",
    statement: "Strength without speed is static; speed without torque is fragile. OXWAY actuators achieve industry-leading power-to-mass ratios for instantaneous kinetic response."
  },
  {
    id: "TENET.03",
    title: "Zero-Latency Edge Inference",
    statement: "Robots operating in human environments cannot rely on cloud round-trips. Perception, trajectory synthesis, and joint control execute locally at sub-millisecond intervals."
  },
  {
    id: "TENET.04",
    title: "Industrial Autonomy",
    statement: "Humanoid systems must exist to extend human capability in extreme, hazardous, and high-precision environments with zero compromise on operator safety."
  }
];

export default function VisionPage() {
  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Header */}
      <header className="px-[5vw] mb-20 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ MANIFESTO // VISION STATEMENT ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          The Architecture <span className="text-accent">Of Autonomy</span>
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          We are defining the next era of humanoid robotics. A future built on verifiable physical laws, extreme structural tolerance, and edge-computed intelligence.
        </p>
      </header>

      {/* Tenets List */}
      <section className="px-[5vw] mb-28 max-w-6xl mx-auto">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-8">
          [ CORE TENETS ]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tenets.map((tenet) => (
            <div
              key={tenet.id}
              className="border border-foreground/10 p-8 relative backdrop-blur-md hover:border-accent/40 transition-all group"
            >
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
                [ {tenet.id} ]
              </div>
              <h2 className="font-display text-2xl uppercase text-foreground mb-4">
                {tenet.title}
              </h2>
              <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed">
                {tenet.statement}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Roadmap */}
      <section className="px-[5vw] pb-32 max-w-6xl mx-auto">
        <div className="border border-foreground/10 p-10 backdrop-blur-md relative overflow-hidden">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
            [ HORIZON 2026 - 2030 ]
          </div>
          <h2 className="font-display text-3xl md:text-4xl uppercase text-foreground mb-6">
            Autonomous Deployment Scale
          </h2>
          <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed max-w-3xl mb-8">
            From single-purpose industrial actuation to fully autonomous multi-modal humanoid units capable of continuous 24/7 operation in unmapped environments.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-4 border font-mono text-xs uppercase tracking-[0.18em] px-6 py-3 transition-all duration-200 border-accent text-accent hover:bg-accent/10"
          >
            <span>Initiate Deployment Inquiry</span>
            <span className="w-4 h-4 border border-current flex items-center justify-center text-[10px]">
              +
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
