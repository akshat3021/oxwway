"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CognitiveLoop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set initial state for SVG paths (stroke-dasharray/offset)
    const paths = [path1Ref.current, path2Ref.current, path3Ref.current];
    paths.forEach(p => {
      if (p) {
        const length = p.getTotalLength();
        gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
      }
    });

    const ctx = gsap.context(() => {
      // Step 1
      gsap.to(path1Ref.current, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: "#step-1",
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      // Step 2
      gsap.to(path2Ref.current, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: "#step-2",
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      // Step 3
      gsap.to(path3Ref.current, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: "#step-3",
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-background border-b border-foreground/10 flex flex-col md:flex-row">
      
      {/* Sticky SVG Diagram Side */}
      <div className="w-full md:w-1/2 md:h-screen md:sticky top-0 flex items-center justify-center border-r border-foreground/10 p-8">
        <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto opacity-80" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Perception Node */}
          <circle cx="200" cy="80" r="20" className="text-foreground/20" />
          <text x="200" y="125" textAnchor="middle" className="text-[10px] font-mono fill-foreground/50 tracking-widest uppercase">Perception</text>
          
          {/* Decision Node */}
          <circle cx="320" cy="250" r="20" className="text-foreground/20" />
          <text x="320" y="295" textAnchor="middle" className="text-[10px] font-mono fill-foreground/50 tracking-widest uppercase">Decision Loop</text>
          
          {/* Action Node */}
          <circle cx="80" cy="250" r="20" className="text-foreground/20" />
          <text x="80" y="295" textAnchor="middle" className="text-[10px] font-mono fill-foreground/50 tracking-widest uppercase">Actuation</text>

          {/* Animated Paths Connecting them */}
          <path ref={path1Ref} d="M 200 100 Q 280 150 310 232" className="text-accent" strokeLinecap="round" />
          <path ref={path2Ref} d="M 300 260 Q 200 320 100 260" className="text-accent" strokeLinecap="round" />
          <path ref={path3Ref} d="M 90 232 Q 120 150 200 100" className="text-accent" strokeLinecap="round" />
        </svg>
      </div>

      {/* Scrolling Text Side */}
      <div className="w-full md:w-1/2 px-[10vw] md:px-[5vw] py-[30vh]">
        
        <div id="step-1" className="min-h-[70vh] flex flex-col justify-center">
          <div className="font-mono text-xs text-accent uppercase tracking-widest mb-4">[ PHASE 01 ]</div>
          <h3 className="font-display text-4xl uppercase mb-6 text-foreground">Sensory Ingestion</h3>
          <p className="font-mono text-sm text-foreground/70 leading-relaxed uppercase">
            Millions of data points stream from LiDAR, optical, and tactile sensors every millisecond. The system builds a high-fidelity semantic map of the environment instantly.
          </p>
        </div>

        <div id="step-2" className="min-h-[70vh] flex flex-col justify-center">
          <div className="font-mono text-xs text-accent uppercase tracking-widest mb-4">[ PHASE 02 ]</div>
          <h3 className="font-display text-4xl uppercase mb-6 text-foreground">Cognitive Synthesis</h3>
          <p className="font-mono text-sm text-foreground/70 leading-relaxed uppercase">
            Raw data is parsed through proprietary neural architectures. The system doesn't just see—it understands context, predicts intent, and formulates response strategies in real-time.
          </p>
        </div>

        <div id="step-3" className="min-h-[70vh] flex flex-col justify-center">
          <div className="font-mono text-xs text-accent uppercase tracking-widest mb-4">[ PHASE 03 ]</div>
          <h3 className="font-display text-4xl uppercase mb-6 text-foreground">Precision Actuation</h3>
          <p className="font-mono text-sm text-foreground/70 leading-relaxed uppercase">
            Decisions translate to physical force. Multi-axis joints engage with sub-millimeter accuracy, executing the computed motion profile safely and efficiently.
          </p>
        </div>

      </div>
    </section>
  );
}
