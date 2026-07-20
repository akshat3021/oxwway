"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import Link from "next/link";

const team = [
  { id: 1, name: "Dr. E. Vance", role: "Lead Perception" },
  { id: 2, name: "A. Sterling", role: "Chief Actuation" },
  { id: 3, name: "M. Chen", role: "Cognitive AI" },
  { id: 4, name: "S. Rossi", role: "Safety Architecture" },
];

export function TeamTeaser() {
  return (
    <section className="py-24 bg-surface px-[5vw]">
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

function MagneticCard({ member }: { member: { name: string, role: string } }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

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

  const handleMouseLeave = () => {
    setHover(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      className="relative aspect-[3/4] bg-background border border-foreground/10 overflow-hidden group cursor-pointer"
    >
      {/* Placeholder for real team footage */}
      <div className="absolute inset-0 bg-foreground/5 mix-blend-overlay opacity-50 group-hover:opacity-100 transition-opacity duration-500 metal-gradient" />
      
      <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="font-display text-xl uppercase text-foreground">{member.name}</h3>
        <p className="font-mono text-xs text-accent uppercase tracking-widest mt-1">{member.role}</p>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500">
        <div className="w-12 h-[1px] bg-foreground/20" />
      </div>
    </motion.div>
  );
}
