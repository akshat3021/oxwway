"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const STORAGE_KEY = "oxway-theme";

/**
 * The <html> class is the single source of truth. An inline script in
 * layout.tsx sets it before first paint (no flash); this provider just
 * subscribes to it, so there is no state-copy-in-effect and no hydration gate.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // keep multiple tabs in sync
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

const getSnapshot = (): Theme =>
  document.documentElement.classList.contains("light") ? "light" : "dark";
const getServerSnapshot = (): Theme => "dark";

function applyTheme(next: Theme): void {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode / storage disabled: theme still applies for this visit */
  }
  listeners.forEach((l) => l());
}

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggleTheme = useCallback(() => applyTheme(getSnapshot() === "dark" ? "light" : "dark"), []);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
