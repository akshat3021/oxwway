"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On mount, sync React state with the stored preference (default dark)
  useEffect(() => {
    const stored = localStorage.getItem("oxway-theme") as Theme | null;
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    setMounted(true);
  }, []);

  // Apply theme class to <html> and persist
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("oxway-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Children always render (server-side too). The correct theme class is
  // applied to <html> before first paint by the inline script in layout.tsx,
  // so there is no flash and no need to hide the page until hydration.
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
