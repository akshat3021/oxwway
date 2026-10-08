"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Crosshair, BrainCircuit, Gauge, ShieldCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const capabilities = [
  { id: "01", icon: Crosshair, title: "KINETIC PRECISION", desc: "Sub-millimeter actuation accuracy in dynamic environments." },
  { id: "02", icon: BrainCircuit, title: "ADAPTIVE COGNITION", desc: "Real-time decision loops parsing 64M parameters per second." },
  { id: "03", icon: Gauge, title: "BIOMECHANICAL EFFICIENCY", desc: "Extended operational uptime via energy-recovering joint mechanics." },
  { id: "04", icon: ShieldCheck, title: "FAIL-SAFE REDUNDANCY", desc: "Hardware-level override ensuring absolute operational safety." }
];

export function CapabilityStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollWrapperRef.current) return;

    const mm = gsap.matchMedia();

    // Desktop/tablet: pinned horizontal scroll-jack (768px and up only —
    // this pattern fights native touch-scroll gestures on mobile, so it
    // never runs below that breakpoint).
    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        const scrollWidth = scrollWrapperRef.current!.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        const xTranslate = scrollWidth - clientWidth;

        const tween = gsap.to(scrollWrapperRef.current, {
          x: -xTranslate,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${xTranslate}`,
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Recalculate on resize instead of leaving stale measurements —
        // this was the cause of cards bleeding off-edge when the viewport
        // changed size after mount.
        const handleResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      }, containerRef);

      return () => ctx.revert();
    });

    // Mobile: no scroll-jacking at all — native horizontally swipeable
    // strip with snap points instead, which respects normal touch
    // scrolling and can never leave partial content bleeding off-screen.
    mm.add("(max-width: 767px)", () => {
      if (scrollWrapperRef.current) {
        gsap.set(scrollWrapperRef.current, { x: 0, clearProps: "transform" });
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen md:h-screen bg-transparent border-t border-b border-foreground/5 overflow-hidden flex items-center"
    >
      <div className="w-full h-full overflow-hidden flex items-center">
        <div
          ref={scrollWrapperRef}
          className="flex px-[6vw] md:px-[10vw] space-x-8 md:space-x-16 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-hide"
        >
          <div className="w-[85vw] md:w-[30vw] flex-shrink-0 flex flex-col justify-center snap-start">
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-4 text-foreground leading-tight">
              Engineered for <br/> Absolute <span className="text-accent">Capability</span>
            </h2>
            <p className="font-mono text-xs opacity-50 uppercase tracking-widest">
              <span className="md:hidden">Swipe to Inspect</span>
              <span className="hidden md:inline">Scroll to Inspect</span>
            </p>
          </div>

          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
            <div 
              key={cap.id} 
              className="w-[80vw] md:w-[40vw] min-h-[240px] md:min-h-[280px] h-auto group flex-shrink-0 border p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 hover:border-accent transition-all duration-500 ease-out snap-start"
              style={{ 
                backgroundColor: 'var(--glass-bg)', 
                borderColor: 'var(--glass-border)',
                boxShadow: '0 10px 40px var(--glass-shadow)'
              }}
            >
              <div className="flex justify-between items-start mb-12">
                <div className="font-mono text-xs text-accent uppercase tracking-widest">
                  [ CAP.SYS.{cap.id} ]
                </div>
                <Icon className="w-6 h-6 text-foreground/40 group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-2xl uppercase mb-2 text-foreground group-hover:text-accent transition-colors duration-300">
                  {cap.title}
                </h3>
                <p className="font-mono text-sm text-foreground/60 leading-relaxed uppercase group-hover:text-foreground/80 transition-colors duration-300">
                  {cap.desc}
                </p>
              </div>
            </div>
            );
          })}
          
          {/* Spacer to allow scrolling past the last card nicely */}
          <div className="w-[6vw] md:w-[10vw] flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}
