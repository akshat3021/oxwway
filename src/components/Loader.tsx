"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INITIALIZING CORE...");

  useEffect(() => {
    const sequence = [
      { p: 15, text: "CALIBRATING SENSORS...", delay: 200 },
      { p: 42, text: "LOADING PERCEPTION MODELS...", delay: 600 },
      { p: 78, text: "ENGAGING ACTUATORS...", delay: 1000 },
      { p: 100, text: "SYSTEM ONLINE", delay: 1500 },
    ];

    let timer: NodeJS.Timeout;

    const runSequence = async () => {
      for (const step of sequence) {
        await new Promise((res) => {
          timer = setTimeout(res, step.delay - (progress * 10));
        });
        setProgress(step.p);
        setStatus(step.text);
      }
      
      setTimeout(() => {
        onComplete();
      }, 300);
    };

    runSequence();

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground"
      >
        <div className="w-64">
          <div className="text-xs font-mono mb-2 text-foreground/50 uppercase tracking-widest">
            {status}
          </div>
          <div className="h-[1px] w-full bg-foreground/20 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
          <div className="text-right text-xs font-mono mt-2 text-foreground/80">
            {progress}%
          </div>
        </div>
        <button
          onClick={onComplete}
          className="absolute bottom-16 text-xs font-mono text-foreground/40 hover:text-foreground transition-colors uppercase tracking-widest"
        >
          [ Skip Calibration ]
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
