"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(new Date().toISOString());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-background border-t border-foreground/10 py-12 px-[5vw]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-0">
        
        <div className="flex flex-col">
          <div className="font-display text-2xl uppercase tracking-widest text-foreground mb-4">
            OXWAY
          </div>
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">
            SYS_STATUS: ONLINE
          </div>
          <div className="font-mono text-[10px] opacity-50 tracking-widest">
            UTC {time}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs opacity-40 uppercase tracking-widest mb-2">Systems</span>
            <Link href="/product" className="font-mono text-xs uppercase hover:text-accent transition-colors">Products</Link>
            <Link href="/technology" className="font-mono text-xs uppercase hover:text-accent transition-colors">Technology</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs opacity-40 uppercase tracking-widest mb-2">Entity</span>
            <Link href="/about" className="font-mono text-xs uppercase hover:text-accent transition-colors">About</Link>
            <Link href="/careers" className="font-mono text-xs uppercase hover:text-accent transition-colors">Careers</Link>
            <Link href="/blog" className="font-mono text-xs uppercase hover:text-accent transition-colors">Logs</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs opacity-40 uppercase tracking-widest mb-2">Legal</span>
            <Link href="/privacy" className="font-mono text-xs uppercase hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="font-mono text-xs uppercase hover:text-accent transition-colors">Terms</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs opacity-40 uppercase tracking-widest mb-2">Connect</span>
            <a href="#" className="font-mono text-xs uppercase hover:text-accent transition-colors">GitHub</a>
            <a href="#" className="font-mono text-xs uppercase hover:text-accent transition-colors">X</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
