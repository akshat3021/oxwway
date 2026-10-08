"use client";

import React, { useId } from "react";
import { useTheme } from "./ThemeProvider";

export function BullWatermark() {
  const { theme } = useTheme();
  const maskId = useId();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* ─── Outer Container: Centered in Hero Viewport ─── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "75vw",
          maxWidth: "1050px",
          aspectRatio: "1 / 1",
        }}
      >
        {/* ─── Inner Container: Handles scroll parallax drift ─── */}
        <div className="bull-parallax w-full h-full pointer-events-none">
          <svg
            viewBox="0 0 1000 1000"
            className="w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Silhouette Mask derived from logo.jpg */}
              <mask id={maskId} x="0" y="0" width="1000" height="1000" maskUnits="userSpaceOnUse">
                <image
                  href="/logo.jpg"
                  x="0"
                  y="0"
                  width="1000"
                  height="1000"
                  style={{ filter: "invert(1) grayscale(1) contrast(3)" }}
                />
              </mask>
            </defs>

            {/* ─── Bull Head Silhouette Fill ─── */}
            <rect
              x="0"
              y="0"
              width="1000"
              height="1000"
              mask={`url(#${maskId})`}
              fill={theme === "dark" ? "#FFFFFF" : "var(--accent)"}
              opacity={theme === "dark" ? 0.12 : 0.10}
              style={{ transition: "fill 0.7s ease, opacity 0.7s ease" }}
            />

            {/* ─── Authentic Red Eye Mark (Calibrated to Real Logo Position & Shape) ─── */}
            <path
              d="M 524 326 Q 548 332 566 344 Q 546 349 528 348 Q 520 338 524 326 Z"
              fill="var(--accent)"
              opacity={theme === "dark" ? 0.95 : 0.85}
              style={{
                filter: "drop-shadow(0 0 8px var(--accent)) drop-shadow(0 0 18px rgba(232, 52, 42, 0.5))",
                transition: "opacity 0.7s ease",
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
