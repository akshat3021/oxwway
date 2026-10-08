"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import Link from "next/link";

const team = [
  { id: 1, name: "Dr. E. Vance", role: "Lead Perception", initials: "EV" },
  { id: 2, name: "A. Sterling", role: "Chief Actuation", initials: "AS" },
  { id: 3, name: "M. Chen", role: "Cognitive AI", initials: "MC" },
  { id: 4, name: "S. Rossi", role: "Safety Architecture", initials: "SR" },
];

export function TeamTeaser() {
  return (
    <section className="py-24 bg-transparent px-[5vw]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16">
        <div>
          <h2 className="font-display text-4xl uppercase text-foreground">
            Assembled by <span className="text-accent opacity-80">Experts</span>
          </h2>
          <p className="font-mono text-xs opacity-50 uppercase tracking-widest mt-2">
            The minds behind the machine
          </p>
        </div>
        <Link href="/about" className="font-mono text-xs text-accent uppercase tracking-widest hover:opacity-80 transition-opacity mt-8 md:mt-0">
          [ View Full Roster ]
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {team.map((member) => (
          <MagneticCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

function MagneticCard({ member }: { member: { name: string, role: string, initials: string } }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(y, [-50, 50], [5, -5]);
  const rotateY = useTransform(x, [-50, 50], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    x.set(0);
    y.set(0);
    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--glass-border)';
    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 40px var(--glass-shadow)';
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(232,52,42,0.45)";
    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 20px rgba(232,52,42,0.10)";
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX, 
        rotateY,
        backgroundColor: 'var(--glass-bg)', 
        borderColor: 'var(--glass-border)',
        boxShadow: '0 10px 40px var(--glass-shadow)'
      }}
      className="relative aspect-[3/4] border overflow-hidden group hover:-translate-y-2 transition-all duration-500 ease-out p-6 flex flex-col justify-between"
    >
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-foreground/5 mix-blend-overlay opacity-30 group-hover:opacity-70 transition-opacity duration-500 metal-gradient" />
      
      {/* Monogram fallback in center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-mono text-7xl font-bold tracking-tighter text-foreground/20 group-hover:text-accent/30 transition-colors duration-500">
          {member.initials}
        </span>
      </div>

      {/* Top tag */}
      <div className="relative z-10 font-mono text-[10px] text-accent uppercase tracking-widest">
        [ MEMBER.0{member.initials} ]
      </div>
      
      {/* Name and role text at bottom */}
      <div className="relative z-10">
        <h3 className="font-display text-xl uppercase text-foreground group-hover:text-accent transition-colors duration-300">
          {member.name}
        </h3>
        <p className="font-mono text-xs text-foreground/70 uppercase tracking-widest mt-1 group-hover:text-foreground transition-colors duration-300">
          {member.role}
        </p>
      </div>
    </motion.div>
  );
}
