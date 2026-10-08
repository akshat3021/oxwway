"use client";

import React from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const PRODUCTS = [
  {
    slug: "ox-1-alpha",
    id: "01",
    tag: "PROD.SYS.01",
    name: "OX-1 Alpha",
    category: "Full Humanoid Actuation Platform",
    desc: "Bipedal platform with 32 degrees of freedom, series-elastic actuators, and real-time kinetic balance controllers.",
    specs: [
      { label: "Max Payload", val: "45 KG" },
      { label: "Operating Time", val: "14 HRS" },
      { label: "Sensor Array", val: "4x 8K LiDAR" },
    ]
  },
  {
    slug: "ox-2-sentinel",
    id: "02",
    tag: "PROD.SYS.02",
    name: "OX-2 Sentinel",
    category: "Autonomous Industrial Inspection Unit",
    desc: "Heavy-duty quad-limbed unit engineered for hazardous industrial inspection, radiation zones, and structural audit.",
    specs: [
      { label: "Max Payload", val: "85 KG" },
      { label: "Operating Time", val: "20 HRS" },
      { label: "Thermal Rating", val: "-40°C to +85°C" },
    ]
  },
  {
    slug: "ox-3-core",
    id: "03",
    tag: "PROD.SYS.03",
    name: "OX-3 Compute Node",
    category: "Edge Cognitive Inference Unit",
    desc: "Modular 64M parameter neural processing unit designed for local sub-millisecond motion synthesis and vision parsing.",
    specs: [
      { label: "Inference Latency", val: "<0.8 MS" },
      { label: "Power Draw", val: "65W TDP" },
      { label: "Interconnect", val: "100Gbps Optical" },
    ]
  },
  {
    slug: "ox-4-heavy",
    id: "04",
    tag: "PROD.SYS.04",
    name: "OX-4 Heavy",
    category: "Logistics & Material Handling Biped",
    desc: "Reinforced titanium chassis designed for heavy material transport, factory automation, and pallet management.",
    specs: [
      { label: "Max Payload", val: "120 KG" },
      { label: "Operating Time", val: "16 HRS" },
      { label: "Actuation Torque", val: "450 Nm" },
    ]
  }
];

export default function ProductsPage() {
  const [productsList, setProductsList] = React.useState(PRODUCTS);

  React.useEffect(() => {
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p: any) => ({
            slug: p.slug,
            id: String(p.id).padStart(2, '0'),
            tag: `PROD.SYS.${String(p.id).padStart(2, '0')}`,
            name: p.name,
            category: p.tagline || 'Robotic Platform',
            desc: p.description || '',
            specs: Array.isArray(p.specs) ? p.specs : [
              { label: "Status", val: p.status || "Draft" }
            ]
          }));
          setProductsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Header */}
      <header className="px-[5vw] mb-16 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ CATALOG // SYSTEM MODELS ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          Robotic <span className="text-accent">Platforms</span>
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          Hardware and compute platforms engineered for extreme physical environments. Select a model to inspect technical specifications.
        </p>
      </header>

      {/* Products Grid */}
      <section className="px-[5vw] pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {productsList.map((prod) => (
            <Link
              key={prod.slug}
              href={`/products/${prod.slug}`}
              className="border border-foreground/10 p-8 relative group backdrop-blur-md hover:border-accent/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Tag + Number */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-[10px] text-accent tracking-widest uppercase">
                    [ {prod.tag} ]
                  </span>
                  <span className="font-display text-3xl opacity-20 font-bold group-hover:opacity-40 transition-opacity">
                    {prod.id}
                  </span>
                </div>

                <h2 className="font-display text-3xl uppercase text-foreground mb-2">
                  {prod.name}
                </h2>
                <div className="font-mono text-xs text-accent/80 uppercase tracking-widest mb-4">
                  {prod.category}
                </div>
                <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed mb-8">
                  {prod.desc}
                </p>
              </div>

              {/* Specs Bar */}
              <div>
                <div className="grid grid-cols-3 gap-2 border-t border-foreground/10 pt-4 mb-6">
                  {prod.specs.map((s, idx) => (
                    <div key={idx}>
                      <div className="font-mono text-[9px] opacity-40 uppercase">{s.label}</div>
                      <div className="font-mono text-xs font-semibold uppercase">{s.val}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent group-hover:translate-x-1 transition-transform">
                  <span>Inspect Model Specification</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
