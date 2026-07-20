import React from "react";

export function HUD({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-accent/30">
      {/* HUD Corner Brackets */}
      <div className="fixed top-4 left-4 w-8 h-8 border-t border-l border-foreground/20 z-50 pointer-events-none" />
      <div className="fixed top-4 right-4 w-8 h-8 border-t border-r border-foreground/20 z-50 pointer-events-none" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-b border-l border-foreground/20 z-50 pointer-events-none" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-b border-r border-foreground/20 z-50 pointer-events-none" />

      {/* Top Left Coordinate / System Status */}
      <div className="fixed top-6 left-16 text-xs font-mono text-foreground/50 z-50 pointer-events-none">
        SYS.OP.01 / <span className="text-accent animate-pulse">ONLN</span>
      </div>

      {/* Bottom Right Scroll Progress Bar Placeholder */}
      <div className="fixed bottom-6 right-16 w-32 h-[2px] bg-foreground/10 z-50 pointer-events-none overflow-hidden">
        <div className="h-full bg-foreground/40 w-1/3" />
      </div>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}
