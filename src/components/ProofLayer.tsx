"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ProofLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        onEnter: () => setInView(true),
        once: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { label: "UPTIME", value: 99.999, suffix: "%", decimals: 3 },
    { label: "DEGREES OF FREEDOM", value: 44, suffix: "", decimals: 0 },
    { label: "LATENCY", value: 1.2, suffix: "ms", decimals: 1 },
    { label: "ACTUATION FORCE", value: 1200, suffix: "N", decimals: 0 },
  ];

  return (
    <section ref={containerRef} className="py-32 bg-background border-b border-foreground/10 px-[5vw]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="font-display text-4xl uppercase text-foreground">
            Empirical <span className="text-accent opacity-80">Validation</span>
          </h2>
          <p className="font-mono text-xs opacity-50 uppercase tracking-widest mt-2">Verified System Metrics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="border-l border-foreground/20 pl-6">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
                [ SYS.VAL.{String(i + 1).padStart(2, "0")} ]
              </div>
              <div className="font-mono text-4xl tabular-nums text-foreground mb-2">
                {inView ? (
                  <Counter end={stat.value} decimals={stat.decimals} />
                ) : (
                  "0"
                )}
                <span className="text-lg opacity-50 ml-1">{stat.suffix}</span>
              </div>
              <div className="font-mono text-xs opacity-60 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ end, decimals }: { end: number, decimals: number }) {
  const [val, setVal] = useState(0);
  const valRef = useRef({ val: 0 });

  useEffect(() => {
    const tween = gsap.to(valRef.current, {
      val: end,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => setVal(valRef.current.val)
    });
    return () => tween.kill();
  }, [end]);

  return <>{val.toFixed(decimals)}</>;
}
