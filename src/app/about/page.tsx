"use client";

import React from "react";
import { Footer } from "@/components/Footer";

const milestones = [
  {
    version: "v1.0.0",
    date: "2021.03.14",
    hash: "a4f89b2",
    title: "Project Initialization & Core Philosophy",
    desc: "Initial repository commit. Core vision established for deterministic, physics-first bipedal actuation, rejecting unconstrained generative models for critical motion loops."
  },
  {
    version: "v1.5.0",
    date: "2022.08.22",
    hash: "c9e21a0",
    title: "Series-Elastic Actuator Mk I",
    desc: "First successful deployment of proprietary series-elastic torque modules. Exceeded target torque-density by 14% while maintaining sub-millimeter positioning precision."
  },
  {
    version: "v2.0.0",
    date: "2023.11.05",
    hash: "f7d3c41",
    title: "Untethered Bipedal Walking",
    desc: "OX-1 platform achieved first untethered steps across uneven terrain. Real-time perception mapped and navigated 30% grade inclines without prior environmental telemetry."
  },
  {
    version: "v3.2.0",
    date: "2024.10.12",
    hash: "b2a19f8",
    title: "Low-Volume Production Facility",
    desc: "Transitioned from rapid prototyping to low-volume manufacturing at Lab 04. Automated QA protocols and stress-testing pipelines operational."
  }
];

export default function AboutPage() {
  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Hero Header */}
      <header className="px-[5vw] mb-20 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ ENTITY OVERVIEW // MISSION ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          Engineered For <span className="text-accent">Absolute</span> Capability
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          OXWAY designs, builds, and deploys high-performance humanoid robotic systems. We prioritize deterministic physics, structural integrity, and real-time cognitive loops over probabilistic approximation.
        </p>
      </header>

      {/* Core Principles Grid */}
      <section className="px-[5vw] mb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-foreground/10 p-6 relative group backdrop-blur-md hover:border-accent/40 transition-all">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">[ CORE.SYS.01 ]</div>
            <h3 className="font-display text-xl uppercase text-foreground mb-3">Deterministic Actuation</h3>
            <p className="font-mono text-xs opacity-60 uppercase leading-relaxed">Sub-millimeter positioning accuracy engineered directly into joint-level kinetic hardware.</p>
          </div>
          <div className="border border-foreground/10 p-6 relative group backdrop-blur-md hover:border-accent/40 transition-all">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">[ CORE.SYS.02 ]</div>
            <h3 className="font-display text-xl uppercase text-foreground mb-3">Edge Cognition</h3>
            <p className="font-mono text-xs opacity-60 uppercase leading-relaxed">Neural perception and trajectory synthesis running on 64M parameter local hardware loops.</p>
          </div>
          <div className="border border-foreground/10 p-6 relative group backdrop-blur-md hover:border-accent/40 transition-all">
            <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">[ CORE.SYS.03 ]</div>
            <h3 className="font-display text-xl uppercase text-foreground mb-3">System Redundancy</h3>
            <p className="font-mono text-xs opacity-60 uppercase leading-relaxed">Triple-fault resistant power distribution and sensor arrays ensuring zero-downtime mission execution.</p>
          </div>
        </div>
      </section>

      {/* Build Log Timeline */}
      <section className="px-[5vw] pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-12">
            [ CHRONOLOGY // BUILD MILESTONES ]
          </div>
          <div className="border-l border-foreground/20 pl-8 relative">
            {milestones.map((ms, i) => (
              <div key={i} className="mb-16 relative group">
                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-background border-2 border-foreground/30 group-hover:border-accent transition-colors" />
                <div className="flex flex-wrap gap-4 items-center mb-4">
                  <span className="font-mono text-xs bg-accent/10 text-accent px-2 py-1 uppercase tracking-widest border border-accent/30">
                    {ms.version}
                  </span>
                  <span className="font-mono text-xs opacity-50 tracking-widest">
                    {ms.date}
                  </span>
                  <span className="font-mono text-[10px] text-foreground/40 tracking-widest">
                    commit: {ms.hash}
                  </span>
                </div>
                <h2 className="font-display text-2xl uppercase text-foreground mb-3">
                  {ms.title}
                </h2>
                <p className="font-mono text-xs text-foreground/70 leading-relaxed uppercase max-w-2xl">
                  {ms.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
