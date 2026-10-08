"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { POSTS } from "../page";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-32 pb-32 text-center min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="font-mono text-xs text-accent tracking-widest uppercase mb-4">[ 404 // DISPATCH NOT FOUND ]</div>
        <h1 className="font-display text-4xl uppercase mb-8">Article Log Unavailable</h1>
        <Link href="/blog" className="font-mono text-xs uppercase border border-accent text-accent px-6 py-3">
          ← Return To Blog Index
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Back Link */}
      <div className="px-[5vw] mb-8 max-w-4xl mx-auto">
        <Link
          href="/blog"
          className="font-mono text-xs uppercase tracking-widest text-foreground/50 hover:text-accent transition-colors"
        >
          ← Back to All Dispatches
        </Link>
      </div>

      {/* Article Header */}
      <header className="px-[5vw] mb-12 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 mb-6 font-mono text-[10px] uppercase">
          <span className="text-accent tracking-widest">[ {post.tag} ]</span>
          <span className="opacity-40">•</span>
          <span className="opacity-50">{post.date}</span>
          <span className="opacity-40">•</span>
          <span className="opacity-50">{post.readTime}</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl uppercase text-foreground leading-[0.95] mb-6">
          {post.title}
        </h1>

        <div className="font-mono text-xs text-foreground/50 uppercase tracking-widest border-b border-foreground/10 pb-6">
          AUTHOR: <span className="text-accent">{post.author}</span> // OXWAY RESEARCH LAB 04
        </div>
      </header>

      {/* Article Content */}
      <article className="px-[5vw] pb-32 max-w-4xl mx-auto">
        <div className="border border-foreground/10 p-8 md:p-12 backdrop-blur-md flex flex-col gap-8 font-mono text-xs text-foreground/80 leading-relaxed uppercase">
          {post.content.map((paragraph, i) => (
            <p key={i} className="leading-relaxed tracking-wide">
              {paragraph}
            </p>
          ))}

          {/* Code/Telemetry Box Placeholder */}
          <div className="bg-foreground/5 border border-foreground/10 p-6 mt-4 font-mono text-[11px] text-accent">
            <div className="opacity-50 text-foreground uppercase mb-2">// TELEMETRY LOG SNIPPET [ {post.id} ]</div>
            <div>STATUS: VERIFIED_DETERMINISTIC_EXECUTION</div>
            <div>CONTROL_LOOP_HZ: 1000.00</div>
            <div>TORQUE_VARIANCE_PCT: &lt;0.02%</div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
