"use client";

import React from "react";
import { Footer } from "@/components/Footer";

const pillars = [
  {
    id: "01",
    title: "Perception Architecture",
    tagline: "Omnidirectional sensory integration",
    desc: "A custom multi-modal sensor fusion engine combining 4x 8K LiDAR, thermal imaging, and high-frequency tactile feedback. The system generates a volumetric environment map with sub-millimeter precision in real-time, operating efficiently in zero-light and atmospherically complex environments.",
    theme: "bg-surface"
  },
  {
    id: "02",
    title: "Kinetic Actuation",
    tagline: "Biomimetic force delivery",
    desc: "Proprietary series-elastic actuators provide human-level dexterity with industrial-grade force output. By utilizing energy-recovery mechanics during deceleration phases, the system achieves a 30% reduction in thermal output compared to standard robotic joints.",
    theme: "bg-background"
  },
  {
    id: "03",
    title: "Cognitive Engine",
    tagline: "Deterministic decision loops",
    desc: "Unlike probabilistic generative models, our core cognitive loop relies on a deterministic physics engine combined with a highly constrained neural planner. This guarantees predictable, safe, and verifiable behavior in chaotic real-world scenarios.",
    theme: "bg-surface"
  },
  {
    id: "04",
    title: "Fail-Safe Protocol",
    tagline: "Hardware-level security",
    desc: "Every critical system features mechanical redundancy and independent power delivery. A hard-wired override layer operates entirely outside the software stack, ensuring the platform can instantly arrest motion regardless of computing state.",
    theme: "bg-background"
  }
];

export default function TechnologyPage() {
  return (
    <div className="pt-24 min-h-screen bg-background">
      
      <header className="px-[5vw] mb-32">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-6">
          [ CORE PILLARS ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9]">
          Engineering <br/> <span className="text-accent opacity-80">Philosophy</span>
        </h1>
      </header>

      {pillars.map((pillar, index) => (
        <section 
          key={pillar.id}
          className={`${pillar.theme} border-t border-foreground/10 py-32 px-[5vw] flex flex-col md:flex-row gap-12 items-center`}
        >
          {/* Visual Element Placeholder (would be unique for each in a real build) */}
          <div className={`w-full md:w-1/2 aspect-square max-h-[500px] border border-foreground/20 flex items-center justify-center p-8 ${index % 2 !== 0 ? 'md:order-last' : ''}`}>
             <div className="w-full h-full border border-foreground/10 metal-gradient mix-blend-screen opacity-30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:20px_20px]" />
                <span className="font-mono text-xs opacity-50">[ VISUAL_{pillar.id} ]</span>
             </div>
          </div>

          {/* Text Content */}
          <div className="w-full md:w-1/2">
            <div className="font-mono text-xs text-accent uppercase tracking-widest mb-6">
              [ PILLAR_{pillar.id} ]
            </div>
            <h2 className="font-display text-4xl uppercase text-foreground mb-2">
              {pillar.title}
            </h2>
            <h3 className="font-mono text-sm opacity-50 uppercase tracking-widest mb-8">
              {pillar.tagline}
            </h3>
            <p className="font-mono text-sm text-foreground/70 leading-relaxed uppercase max-w-xl">
              {pillar.desc}
            </p>
          </div>
        </section>
      ))}

      <Footer />
    </div>
  );
}
