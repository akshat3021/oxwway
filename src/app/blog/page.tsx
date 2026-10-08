"use client";

import React from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const POSTS = [
  {
    slug: "bipedal-stability",
    id: "LOG.2024.11",
    tag: "KINEMATICS // CONTROL",
    date: "2024.11.14",
    readTime: "6 MIN READ",
    author: "DR. ARIS VANCE",
    title: "Engineering Bipedal Stability in Non-Stationary Environments",
    excerpt: "Why probabilistic generative models fail under real-world momentum perturbations, and how series-elastic feedback loops guarantee deterministic dynamic recovery.",
    content: [
      "In human environments, ground contact forces are rarely static. Slips, loose aggregate, and sudden payload displacements introduce non-stationary momentum changes that destabilize conventional gait generators.",
      "At OXWAY, we reject probabilistic guessing for core locomotion loops. Instead, our actuators incorporate series-elastic torque sensors sampled at 10 kHz. When a foot strike detects non-zero compliance variance, the trajectory generator recalculates the angular momentum manifold in sub-millisecond time.",
      "Through physical trials on 35-degree loose gravel inclines, the OX-1 platform demonstrated zero fall events over 500 consecutive test cycles, establishing a new baseline for autonomous bipedal resilience."
    ]
  },
  {
    slug: "thermal-efficiency",
    id: "LOG.2024.10",
    tag: "HARDWARE // ACTUATION",
    date: "2024.10.28",
    readTime: "8 MIN READ",
    author: "ELENA ROSTOVA",
    title: "Thermal Efficiency in High-Density Series Elastic Actuators",
    excerpt: "A deep dive into custom copper-fill winding geometry and liquid-cooled stator housing for continuous 450Nm peak torque delivery.",
    content: [
      "Torque density in electric actuators is fundamentally constrained by heat dissipation. When a humanoid robot holds a heavy static load, copper losses ($I^2R$) spike exponentially.",
      "To overcome thermal throttling in compact joint housings, our hardware team engineered a direct-conduction stator cooling jacket integrated into the structural titanium frame.",
      "The result is a 42% reduction in core winding temperature under sustained 350Nm loads, allowing OXWAY platforms to maintain peak exertion without duty-cycle degradation."
    ]
  },
  {
    slug: "realtime-neural-inference",
    id: "LOG.2024.09",
    tag: "COMPUTE // PERCEPTION",
    date: "2024.09.15",
    readTime: "5 MIN READ",
    author: "MARCUS CHEN",
    title: "Real-Time 64M Parameter Neural Inference at the Edge",
    excerpt: "Synthesizing spatial LiDAR point clouds and stereo tactile arrays directly on local 65W NPU hardware with sub-millisecond latency.",
    content: [
      "Offloading perceptual inference to cloud servers introduces non-deterministic network latency that is catastrophic for dynamic obstacle avoidance.",
      "The OX-3 compute module runs quantized 64M parameter spatial perception models locally on dedicated edge tensor units. By fusing 8K LiDAR sweeps directly with joint torque telemetry, the robot perceives its environment and plans multi-step foot placements at 1,000 Hz.",
      "This architecture guarantees deterministic execution even when completely disconnected from external network connectivity."
    ]
  }
];

export default function BlogPage() {
  const [postsList, setPostsList] = React.useState(POSTS);

  React.useEffect(() => {
    fetch('/api/public/blog')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((post: any) => ({
            slug: post.slug,
            id: `LOG.${new Date(post.createdAt || Date.now()).getFullYear()}.${String(post.id).padStart(2, '0')}`,
            tag: Array.isArray(post.tags) && post.tags.length > 0 ? post.tags.join(' // ').toUpperCase() : 'TECHNICAL LOG',
            date: post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0].replace(/-/g, '.') : new Date(post.createdAt).toISOString().split('T')[0].replace(/-/g, '.'),
            readTime: '5 MIN READ',
            author: 'OXWAY FACULTY',
            title: post.title,
            excerpt: post.excerpt || post.seoDescription || '',
            content: post.body ? [post.body] : [],
          }));
          setPostsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Header */}
      <header className="px-[5vw] mb-16 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ TECHNICAL LOGS // DISPATCHES ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          Engineering <span className="text-accent">Dispatches</span>
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          Technical papers, hardware breakdowns, and algorithmic logs directly from the OXWAY engineering team.
        </p>
      </header>

      {/* Posts List */}
      <section className="px-[5vw] pb-32 max-w-5xl mx-auto flex flex-col gap-8">
        {postsList.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="border border-foreground/10 p-8 relative group backdrop-blur-md hover:border-accent/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 mb-4 font-mono text-[10px] uppercase">
                <span className="text-accent tracking-widest">[ {post.tag} ]</span>
                <span className="opacity-40">•</span>
                <span className="opacity-50">{post.date}</span>
                <span className="opacity-40">•</span>
                <span className="opacity-50">{post.readTime}</span>
                <span className="opacity-40">•</span>
                <span className="text-foreground/70">{post.author}</span>
              </div>

              <h2 className="font-display text-3xl uppercase text-foreground mb-4 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed mb-6">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent group-hover:translate-x-1 transition-transform border-t border-foreground/10 pt-4">
              <span>Read Full Dispatch</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </section>

      <Footer />
    </div>
  );
}
