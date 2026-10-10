"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { NAV_ITEMS } from "@/lib/nav";


function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeSector(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const innerStart = polarToCartesian(x, y, innerRadius, startAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, endAngle);
  const outerStart = polarToCartesian(x, y, outerRadius, startAngle);
  const outerEnd = polarToCartesian(x, y, outerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", innerStart.x, innerStart.y,
    "L", outerStart.x, outerStart.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, outerEnd.x, outerEnd.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, innerStart.x, innerStart.y,
    "Z"
  ].join(" ");
}

interface RadialNavProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function RadialNav({ isOpen, setIsOpen }: RadialNavProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Find initial active index matching current path
  useEffect(() => {
    const idx = NAV_ITEMS.findIndex((item) => pathname.startsWith(item.href));
    if (idx !== -1) {
      setSelectedIndex(idx);
    }
  }, [pathname]);

  const handleNavigate = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router, setIsOpen]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % NAV_ITEMS.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + NAV_ITEMS.length) % NAV_ITEMS.length);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const activeIdx = hoveredIndex !== null ? hoveredIndex : selectedIndex;
        handleNavigate(NAV_ITEMS[activeIdx].href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hoveredIndex, selectedIndex, handleNavigate, setIsOpen]);

  if (!isOpen) return null;

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const activeItem = NAV_ITEMS[activeIndex];

  const totalSegments = NAV_ITEMS.length;
  const segmentAngle = 360 / totalSegments;
  const gap = 1.2;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-300"
      style={{
        backgroundColor: theme === "dark" ? "rgba(13, 14, 16, 0.85)" : "rgba(245, 246, 248, 0.85)",
      }}
      onClick={() => setIsOpen(false)}
    >
      {/* Container stop click propagation */}
      <div
        className="relative flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Telemetry Header */}
        <div className="font-mono text-[10px] text-accent tracking-[0.25em] uppercase mb-6 text-center">
          [ RADIAL TELEMETRY NAVIGATOR // KEYBOARD ENABLED ]
        </div>

        {/* ─── DESKTOP RADIAL WHEEL (md:flex) ─── */}
        <div className="hidden md:flex relative items-center justify-center w-[520px] h-[520px]">
          <svg
            viewBox="0 0 600 600"
            className="w-full h-full pointer-events-auto"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="radial-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Reticle Ring */}
            <circle
              cx="300"
              cy="300"
              r="265"
              fill="none"
              stroke="var(--glass-border)"
              strokeWidth="1"
              strokeDasharray="4 8"
              className="opacity-40"
            />

            {/* 7 Sectors */}
            {NAV_ITEMS.map((item, idx) => {
              const startAngle = idx * segmentAngle + gap / 2;
              const endAngle = (idx + 1) * segmentAngle - gap / 2;
              const sectorPath = describeSector(300, 300, 105, 250, startAngle, endAngle);

              const midAngle = (startAngle + endAngle) / 2;
              const labelPos = polarToCartesian(300, 300, 178, midAngle);
              const isHovered = hoveredIndex === idx;
              const isSelected = selectedIndex === idx && hoveredIndex === null;
              const isActive = isHovered || isSelected;

              return (
                <g
                  key={item.code}
                  className="transition-all duration-200"
                  onMouseEnter={() => {
                    setHoveredIndex(idx);
                    setSelectedIndex(idx);
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleNavigate(item.href)}
                >
                  {/* Sector Arc Path */}
                  <path
                    d={sectorPath}
                    fill={
                      isActive
                        ? theme === "dark"
                          ? "rgba(232, 52, 42, 0.25)"
                          : "rgba(232, 52, 42, 0.18)"
                        : theme === "dark"
                        ? "rgba(255, 255, 255, 0.03)"
                        : "rgba(0, 0, 0, 0.03)"
                    }
                    stroke={isActive ? "var(--accent)" : "var(--glass-border)"}
                    strokeWidth={isActive ? "2" : "1"}
                    filter={isActive ? "url(#radial-glow)" : undefined}
                    style={{ transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />

                  {/* Label Group */}
                  <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-mono text-[11px] uppercase tracking-widest font-semibold"
                      fill={isActive ? "var(--accent)" : "var(--text-primary)"}
                      style={{ transition: "fill 0.2s ease" }}
                    >
                      {item.label}
                    </text>
                    <text
                      y="14"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-mono text-[8px] uppercase tracking-widest opacity-50"
                      fill="var(--text-secondary)"
                    >
                      {item.code}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* ─── Center Hub ─── */}
            <circle
              cx="300"
              cy="300"
              r="95"
              fill="var(--bg-base)"
              stroke={hoveredIndex !== null ? "var(--accent)" : "var(--glass-border)"}
              strokeWidth="2"
              style={{ transition: "stroke 0.3s ease" }}
            />

            {/* Center Hub Telemetry Display */}
            <g transform="translate(300, 300)">
              <text
                y="-22"
                textAnchor="middle"
                className="font-mono text-[9px] uppercase tracking-[0.2em]"
                fill="var(--accent)"
              >
                [ {activeItem.code} ]
              </text>
              <text
                y="4"
                textAnchor="middle"
                className="font-display text-xl uppercase font-bold tracking-wider"
                fill="var(--text-primary)"
              >
                {activeItem.label}
              </text>
              <text
                y="24"
                textAnchor="middle"
                className="font-mono text-[8px] uppercase tracking-widest opacity-60"
                fill="var(--text-secondary)"
              >
                {activeItem.desc}
              </text>
            </g>
          </svg>
        </div>

        {/* ─── MOBILE FALLBACK LIST (md:hidden) ─── */}
        <div className="flex md:hidden flex-col gap-3 w-full max-w-xs">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={item.code}
                onClick={() => handleNavigate(item.href)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className="flex items-center justify-between p-4 border text-left font-mono text-xs uppercase tracking-widest transition-all"
                style={{
                  borderColor: isActive ? "var(--accent)" : "var(--glass-border)",
                  backgroundColor: isActive ? "rgba(232, 52, 42, 0.1)" : "var(--glass-bg)",
                  color: isActive ? "var(--accent)" : "var(--text-primary)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] opacity-60">[ {item.code} ]</span>
                  <span className="font-semibold">{item.label}</span>
                </div>
                <span>→</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Keyboard Telemetry Legend */}
        <div className="mt-6 font-mono text-[9px] uppercase tracking-widest opacity-50 flex items-center gap-4 text-center">
          <span>ARROWS: ROTATE</span>
          <span>•</span>
          <span>ENTER: SELECT</span>
          <span>•</span>
          <span>ESC: CLOSE</span>
        </div>
      </div>
    </div>
  );
}
