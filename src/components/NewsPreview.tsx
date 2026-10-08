import React from "react";
import Link from "next/link";

const news = [
  {
    id: "01",
    title: "Version 4.2 Actuation Update Deployed",
    excerpt: "New firmware increases joint torque efficiency by 12% across all operational ranges.",
    date: "2024.10.15",
    tag: "ENGINEERING"
  },
  {
    id: "02",
    title: "Optical Array Calibration Overhaul",
    excerpt: "How we achieved sub-millimeter depth perception in low-light environments without thermal compensation.",
    date: "2024.09.28",
    tag: "RESEARCH"
  },
  {
    id: "03",
    title: "Facility Expansion: Lab 04",
    excerpt: "Scaling our stress-testing infrastructure for next-generation bipedal locomotion.",
    date: "2024.09.10",
    tag: "COMPANY"
  }
];

export function NewsPreview() {
  return (
    <section className="py-24 bg-transparent border-t border-foreground/5 px-[5vw] backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16">
        <div>
          <h2 className="font-display text-4xl uppercase text-foreground">
            Development <span className="text-accent opacity-80">Logs</span>
          </h2>
          <p className="font-mono text-xs opacity-50 uppercase tracking-widest mt-2">
            Latest Commits & Research
          </p>
        </div>
        <Link href="/blog" className="font-mono text-xs text-accent uppercase tracking-widest hover:opacity-80 transition-opacity mt-8 md:mt-0">
          [ View All Logs ]
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {news.map((item, index) => (
          <Link
            href={`/blog/${item.id}`}
            key={item.id} 
            className={`group flex flex-col justify-between border p-8 hover:-translate-y-2 hover:border-accent hover:shadow-[0_0_20px_rgba(232,52,42,0.15)] transition-all duration-500 ease-out ${
              index === 0 ? "md:col-span-12 lg:col-span-6" : "md:col-span-6 lg:col-span-3"
            }`}
            style={{ 
              backgroundColor: 'var(--glass-bg)', 
              borderColor: 'var(--glass-border)',
              boxShadow: '0 10px 40px var(--glass-shadow)'
            }}
          >
            <div className="flex justify-between items-start mb-16">
              <span className="font-mono text-[10px] text-accent tracking-widest uppercase border border-accent/30 px-2 py-1">
                {item.tag}
              </span>
              <span className="font-mono text-[10px] opacity-50 tracking-widest">
                {item.date}
              </span>
            </div>
            <div>
              <h3 className={`font-display uppercase text-foreground mb-4 ${index === 0 ? "text-3xl" : "text-xl"}`}>
                {item.title}
              </h3>
              <p className="font-mono text-xs text-foreground/60 leading-relaxed uppercase">
                {item.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
