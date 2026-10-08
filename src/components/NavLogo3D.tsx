"use client";

import React from "react";

export function NavLogo3D() {
  return (
    <div className="relative w-16 h-16 pointer-events-auto group" title="OXWAY Core Systems">
      {/* 
        The original logo is black on white. 
        Invert makes it white on black.
        Mix-blend-screen removes the black background, leaving the pure white silhouette.
        This perfectly preserves 100% of the original shape without redrawing it.
      */}
      <img 
        src="/logo.jpg" 
        alt="OXWAY" 
        className="absolute inset-0 w-full h-full object-contain filter invert mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
      />
      
      {/* Holographic scanner effect constrained over the logo area */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent mix-blend-overlay opacity-0 group-hover:opacity-50 animate-scan transition-opacity duration-500 pointer-events-none" />
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
