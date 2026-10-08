"use client";

import React, { useEffect, useRef, useState } from "react";

interface LoaderProps {
  onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const [phase, setPhase] = useState<"horns" | "fill" | "eye" | "done">("horns");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase 1: horns trace in (0–500ms)
    const t1 = setTimeout(() => setPhase("fill"), 500);
    // Phase 2: silhouette fills (500–1100ms)
    const t2 = setTimeout(() => setPhase("eye"), 1100);
    // Phase 3: eye ignites (1100–1700ms)
    const t3 = setTimeout(() => setPhase("done"), 1700);
    // Complete and hand off
    const t4 = setTimeout(() => onComplete(), 2000);

    // Progress bar tick
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 1.2, 100));
    }, 20);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ─── Brand Mark Animation ─── */}
      <div className="relative flex flex-col items-center">

        {/* Logo container */}
        <div
          className="relative mb-8 flex items-center justify-center"
          style={{ width: 120, height: 120 }}
        >
          {/* Phase 1 — Horn trace SVG paths */}
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: "visible" }}
          >
            {/* Horn left arc */}
            <path
              d="M 30 55 C 20 35, 10 20, 35 15"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 70,
                strokeDashoffset: phase === "horns" ? 70 : 0,
                transition: "stroke-dashoffset 0.45s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {/* Horn right arc */}
            <path
              d="M 90 55 C 100 35, 110 20, 85 15"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 70,
                strokeDashoffset: phase === "horns" ? 70 : 0,
                transition: "stroke-dashoffset 0.45s 0.08s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </svg>

          {/* Bull logo — fades + fills in during phase 2 */}
          <img
            src="/logo.jpg"
            alt="OXWAY"
            className="w-full h-full object-contain"
            style={{
              opacity: phase === "horns" ? 0 : phase === "fill" ? 0.7 : 0.9,
              filter:
                "invert(1) brightness(0.65) contrast(0.85)",
              transform: phase === "horns" ? "scale(0.92)" : "scale(1)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          />

          {/* Eye ignite — phase 3 */}
          <div
            className="absolute rounded-full"
            style={{
              /* approximate position of the eye within the 120×120 box */
              left: "46%",
              top: "39%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              opacity: phase === "eye" || phase === "done" ? 1 : 0,
              boxShadow:
                phase === "eye" || phase === "done"
                  ? "0 0 16px 6px rgba(232,52,42,0.7), 0 0 32px 12px rgba(232,52,42,0.35)"
                  : "none",
              transform: phase === "eye" ? "scale(1.4)" : "scale(1)",
              transition: "opacity 0.35s ease, box-shadow 0.4s ease, transform 0.4s ease",
            }}
          />
        </div>

        {/* Wordmark */}
        <div
          className="font-display text-lg font-bold uppercase tracking-[0.3em] mb-6"
          style={{
            opacity: phase === "horns" ? 0 : 1,
            transition: "opacity 0.4s ease 0.2s",
            color: "var(--text-primary)",
          }}
        >
          O<span style={{ color: "var(--accent)" }}>X</span>WAY
        </div>

        {/* Status line */}
        <div
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-5"
          style={{ color: "var(--accent)", opacity: 0.8 }}
        >
          {phase === "horns" && "Initializing..."}
          {phase === "fill" && "Loading systems..."}
          {phase === "eye" && "Systems online."}
          {phase === "done" && "Ready."}
        </div>

        {/* Progress bar */}
        <div
          className="relative overflow-hidden"
          style={{
            width: 200,
            height: 2,
            backgroundColor: "rgba(237,238,240,0.1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progress}%`,
              backgroundColor: "var(--accent)",
              transition: "width 0.08s linear",
            }}
          />
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute bottom-10 font-mono text-[10px] uppercase tracking-widest transition-colors duration-200"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)")}
      >
        [ Skip ]
      </button>
    </div>
  );
}
