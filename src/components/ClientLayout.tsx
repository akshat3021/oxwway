"use client";

import { HUD } from "./HUD";
import { ThemeProvider } from "./ThemeProvider";
import { usePathname } from "next/navigation";
import React from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <ThemeProvider>
      {isAdmin ? (
        <div
          className="relative min-h-screen"
          style={{
            backgroundColor: "var(--bg-base)",
            color: "var(--text-primary)",
          }}
        >
          <main className="relative z-10">{children}</main>
        </div>
      ) : (
        <HUD>{children}</HUD>
      )}
    </ThemeProvider>
  );
}
