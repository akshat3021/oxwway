"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export function Footer() {
  const [time, setTime] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const update = () => {
      setTime(new Date().toISOString());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-transparent backdrop-blur-md border-t border-foreground/5 py-12 px-[5vw]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-0">
        
        <div className="flex flex-col">
          <div className="w-48 h-auto mb-4 cursor-pointer">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className={`w-full h-full object-contain ${
                theme === 'light' 
                  ? 'opacity-80 mix-blend-multiply' 
                  : 'opacity-40 mix-blend-screen invert'
              }`} 
            />
          </div>
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">
            SYS_STATUS: ONLINE
          </div>
          <div className="font-mono text-[10px] opacity-50 tracking-widest">
            UTC {time}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs opacity-40 uppercase tracking-widest mb-2">Systems</span>
            <Link href="/products" className="font-mono text-xs uppercase hover:text-accent transition-colors">Products</Link>
            <Link href="/vision" className="font-mono text-xs uppercase hover:text-accent transition-colors">Vision</Link>
            <Link href="/gallery" className="font-mono text-xs uppercase hover:text-accent transition-colors">Gallery</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs opacity-40 uppercase tracking-widest mb-2">Entity</span>
            <Link href="/about" className="font-mono text-xs uppercase hover:text-accent transition-colors">About</Link>
            <Link href="/team" className="font-mono text-xs uppercase hover:text-accent transition-colors">Team</Link>
            <Link href="/careers" className="font-mono text-xs uppercase hover:text-accent transition-colors">Careers</Link>
            <Link href="/blog" className="font-mono text-xs uppercase hover:text-accent transition-colors">Blog</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs opacity-40 uppercase tracking-widest mb-2">Connect</span>
            <Link href="/contact" className="font-mono text-xs uppercase hover:text-accent transition-colors">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
