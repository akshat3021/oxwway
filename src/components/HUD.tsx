"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { RadialNav } from "./RadialNav";

export function HUD({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [isRadialOpen, setIsRadialOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="relative min-h-screen selection:bg-accent/20"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
        transition: "background-color 0.7s cubic-bezier(0.25,1,0.5,1), color 0.7s cubic-bezier(0.25,1,0.5,1)",
      }}
    >

      {/* ─── Navigation Bar ─── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 md:px-10 h-16 justify-between"
        style={{
          borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
          backgroundColor: scrolled ? "var(--glass-bg)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          transition: "background-color 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Left: Bull mark + Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-7 h-7 overflow-hidden rounded-none flex-shrink-0">
            <img
              src="/logo.jpg"
              alt="OXWAY bull"
              className="w-full h-full object-contain"
              style={{
                filter: theme === "dark"
                  ? "invert(1) brightness(0.7)"
                  : "brightness(0.15)",
                transition: "filter 0.7s ease",
              }}
            />
          </div>
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "var(--text-primary)", letterSpacing: "0.18em" }}>
            O<span style={{ color: "var(--accent)" }}>X</span>WAY
          </span>
        </Link>

        {/* Right: Status + Upper-Right Radial Nav Trigger + Theme toggle */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {/* Status Readout */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span>SYS.OP.01 / ONLINE</span>
          </div>

          {/* Upper Right Radial Nav Trigger */}
          <button
            onClick={() => setIsRadialOpen(!isRadialOpen)}
            aria-label="Toggle Radial Navigation Menu"
            className="font-mono text-[10px] uppercase tracking-widest border px-3 py-1.5 transition-all duration-200 flex items-center gap-2 group"
            style={{
              color: isRadialOpen ? "var(--accent)" : "var(--text-secondary)",
              borderColor: isRadialOpen ? "var(--accent)" : "var(--glass-border)",
              backgroundColor: isRadialOpen ? "rgba(232, 52, 42, 0.08)" : "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              if (!isRadialOpen) {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--glass-border)";
              }
            }}
          >
            {/* Target Reticle Icon */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
              <circle cx="12" cy="12" r="7" className="opacity-50" />
              <circle cx="12" cy="12" r="2.5" className="fill-current" />
              <line x1="12" y1="1" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="23" />
              <line x1="1" y1="12" x2="5" y2="12" />
              <line x1="20" y1="12" x2="23" y2="12" />
            </svg>
            <span>[ {isRadialOpen ? "NAV.CLOSE" : "NAV.MENU"} ]</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="font-mono text-[10px] uppercase tracking-widest border px-3 py-1.5 transition-all duration-200 flex items-center gap-2"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--glass-border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--glass-border)";
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme === "dark" ? "#444" : "var(--accent)" }}
            />
            {theme === "dark" ? "DARK" : "LIGHT"}
          </button>
        </div>
      </header>

      {/* ─── HUD Corner Brackets ─── */}
      <div className="fixed top-[72px] left-4 w-6 h-6 border-t border-l z-40 pointer-events-none" style={{ borderColor: "var(--glass-border)" }} />
      <div className="fixed top-[72px] right-4 w-6 h-6 border-t border-r z-40 pointer-events-none" style={{ borderColor: "var(--glass-border)" }} />
      <div className="fixed bottom-4 left-4 w-6 h-6 border-b border-l z-40 pointer-events-none" style={{ borderColor: "var(--glass-border)" }} />
      <div className="fixed bottom-4 right-4 w-6 h-6 border-b border-r z-40 pointer-events-none" style={{ borderColor: "var(--glass-border)" }} />

      {/* ─── Global Radial Navigation Modal ─── */}
      <RadialNav isOpen={isRadialOpen} setIsOpen={setIsRadialOpen} />

      {/* ─── Main Content ─── */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}
