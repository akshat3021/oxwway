"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const CARDS = [
  {
    id: "01",
    tag: "CAP.SYS.01",
    title: "Kinetic Precision",
    desc: "Sub-millimeter actuation accuracy in dynamic environments.",
  },
  {
    id: "02",
    tag: "CAP.SYS.02",
    title: "Adaptive Cognition",
    desc: "Real-time decision loops parsing 64M parameters per second.",
  },
  {
    id: "03",
    tag: "CAP.SYS.03",
    title: "System Integrity",
    desc: "Redundant architecture ensures mission continuity.",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function HeroCapabilityCards() {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-3 w-full">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.id}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative group overflow-hidden"
          style={{
            border: "1px solid",
            borderColor: theme === "dark"
              ? "rgba(237,238,240,0.08)"
              : "rgba(20,21,23,0.14)",
            backgroundColor: theme === "dark"
              ? "rgba(255,255,255,0.02)"
              : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(12px)",
            padding: "20px 22px 18px",
            transition: "border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(232,52,42,0.45)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 20px rgba(232,52,42,0.10)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = theme === "dark"
              ? "rgba(237,238,240,0.08)"
              : "rgba(20,21,23,0.14)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {/* Large faint number — top right */}
          <span
            className="absolute top-2 right-4 font-display font-bold select-none pointer-events-none"
            style={{
              fontSize: "clamp(2.5rem, 4vw, 4rem)",
              lineHeight: 1,
              color: theme === "dark"
                ? "rgba(237,238,240,0.04)"
                : "rgba(20,21,23,0.06)",
              transition: "color 0.7s ease",
            }}
          >
            {card.id}
          </span>

          {/* Category tag */}
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--accent)" }}
          >
            [ {card.tag} ]
          </div>

          {/* Title */}
          <h3
            className="font-display text-sm font-bold uppercase tracking-[0.08em] mb-1.5 transition-colors duration-200"
            style={{ color: "var(--text-primary)" }}
          >
            {card.title}
          </h3>

          {/* Description */}
          <p
            className="font-mono text-[11px] leading-relaxed uppercase tracking-[0.04em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {card.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
