import React from "react";
import Link from "next/link";
import type { LandingPost } from "@/lib/landing-types";

/** Grid span that adapts to however many posts exist (1-3). */
function spanFor(index: number, total: number): string {
  if (total === 1) return "md:col-span-12";
  if (total === 2) return "md:col-span-6";
  return index === 0 ? "md:col-span-12 lg:col-span-6" : "md:col-span-6 lg:col-span-3";
}

export function NewsPreview({ posts }: { posts: LandingPost[] }) {
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
        {posts.map((item, index) => (
          <Link
            href={`/blog/${item.slug}`}
            key={item.id} 
            className={`group flex flex-col justify-between border p-6 md:p-8 hover:-translate-y-2 hover:border-accent hover:shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_15%,transparent)] transition-all duration-500 ease-out ${spanFor(index, posts.length)}`}
            style={{ 
              backgroundColor: 'var(--glass-bg)', 
              borderColor: 'var(--glass-border)',
              boxShadow: '0 10px 40px var(--glass-shadow)'
            }}
          >
            <div className="flex justify-between items-start mb-10 md:mb-16">
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
