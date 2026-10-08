"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eye, Cpu, Activity } from "lucide-react";

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
    <section ref={containerRef} className="relative py-32 bg-transparent border-t border-b border-foreground/5 overflow-hidden flex flex-col md:flex-row">
      
      {/* Sticky SVG Diagram Side */}
      <div className="w-full md:w-1/2 md:h-screen md:sticky top-0 flex items-center justify-center border-r border-foreground/10 p-8">
        <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto" fill="none" stroke="currentColor">
          {/* Background Guide Loop Lines */}
          <path d="M 200 98 Q 285 150 320 232" className="stroke-foreground/10" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 292 260 L 108 260" className="stroke-foreground/10" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 80 232 Q 115 150 200 98" className="stroke-foreground/10" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Animated Paths Connecting the Nodes */}
          <path ref={path1Ref} d="M 200 98 Q 285 150 320 232" className="stroke-[var(--accent)]" strokeWidth="2.5" strokeLinecap="round" />
          <path ref={path2Ref} d="M 292 260 L 108 260" className="stroke-[var(--accent)]" strokeWidth="2.5" strokeLinecap="round" />
          <path ref={path3Ref} d="M 80 232 Q 115 150 200 98" className="stroke-[var(--accent)]" strokeWidth="2.5" strokeLinecap="round" />

          {/* Perception Node */}
          <circle cx="200" cy="70" r="28" className="fill-background stroke-foreground/30" strokeWidth="1.5" />
          <foreignObject x="186" y="56" width="28" height="28">
            <Eye className="w-7 h-7 text-accent" strokeWidth={1.5} />
          </foreignObject>
          <text x="200" y="122" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-mono, monospace)" letterSpacing="0.15em" className="uppercase font-semibold">Perception</text>
          
          {/* Decision Node */}
          <circle cx="320" cy="260" r="28" className="fill-background stroke-foreground/30" strokeWidth="1.5" />
          <foreignObject x="306" y="246" width="28" height="28">
            <Cpu className="w-7 h-7 text-accent" strokeWidth={1.5} />
          </foreignObject>
          <text x="320" y="312" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-mono, monospace)" letterSpacing="0.15em" className="uppercase font-semibold">Decision Loop</text>
          
          {/* Action Node */}
          <circle cx="80" cy="260" r="28" className="fill-background stroke-foreground/30" strokeWidth="1.5" />
          <foreignObject x="66" y="246" width="28" height="28">
            <Activity className="w-7 h-7 text-accent" strokeWidth={1.5} />
          </foreignObject>
          <text x="80" y="312" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontFamily="var(--font-mono, monospace)" letterSpacing="0.15em" className="uppercase font-semibold">Actuation</text>
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
