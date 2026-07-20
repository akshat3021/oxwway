"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  { id: "01", title: "KINETIC PRECISION", desc: "Sub-millimeter actuation accuracy in dynamic environments." },
  { id: "02", title: "ADAPTIVE COGNITION", desc: "Real-time decision loops parsing 4M parameters per second." },
  { id: "03", title: "BIOMECHANICAL EFFICIENCY", desc: "Extended operational uptime via energy-recovering joint mechanics." },
  { id: "04", title: "FAIL-SAFE REDUNDANCY", desc: "Hardware-level override ensuring absolute operational safety." }
];

export function CapabilityStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollWrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Calculate how far to translate the wrapper horizontally
      const scrollWidth = scrollWrapperRef.current!.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const xTranslate = scrollWidth - clientWidth;

      gsap.to(scrollWrapperRef.current, {
        x: -xTranslate,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${xTranslate}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen bg-surface border-t border-b border-foreground/10 overflow-hidden flex items-center"
    >
      <div 
        ref={scrollWrapperRef} 
        className="flex px-[10vw] space-x-16"
      >
        <div className="w-[30vw] flex-shrink-0 flex flex-col justify-center">
          <h2 className="font-display text-4xl uppercase mb-4 text-foreground leading-tight">
            Engineered for <br/> Absolute <span className="text-accent">Capability</span>
          </h2>
          <p className="font-mono text-xs opacity-50 uppercase tracking-widest">Scroll to Inspect</p>
        </div>

        {capabilities.map((cap) => (
          <div 
            key={cap.id} 
            className="w-[40vw] flex-shrink-0 bg-background border border-foreground/10 p-8 flex flex-col justify-between"
          >
            <div className="font-mono text-xs text-accent uppercase tracking-widest mb-16">
              [ CAP.SYS.{cap.id} ]
            </div>
            <div>
              <h3 className="font-display text-2xl uppercase mb-2 text-foreground">
                {cap.title}
              </h3>
              <p className="font-mono text-sm text-foreground/50 leading-relaxed uppercase">
                {cap.desc}
              </p>
            </div>
          </div>
        ))}
        
        {/* Spacer to allow scrolling past the last card nicely */}
        <div className="w-[10vw] flex-shrink-0" />
      </div>
    </section>
  );
}
