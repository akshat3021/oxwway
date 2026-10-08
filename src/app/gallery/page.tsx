"use client";

import React, { useState } from "react";
import { Footer } from "@/components/Footer";

const MEDIA_ITEMS = [
  {
    id: "MEDIA.01",
    title: "Actuator Stress Testing — Lab 04",
    type: "HIGH-SPEED TELEMETRY",
    date: "2024.11.02",
    ratio: "aspect-[16/9]",
    desc: "Series-elastic torque response measured under 450Nm dynamic impact load.",
  },
  {
    id: "MEDIA.02",
    title: "OX-1 Alpha Terrain Traversal",
    type: "UNCONTROLLED FIELD RUN",
    date: "2024.10.18",
    ratio: "aspect-[4/3]",
    desc: "Untethered bipedal locomotion test over 35° loose aggregate inclines.",
  },
  {
    id: "MEDIA.03",
    title: "Sub-Millimeter End-Effector Precision",
    type: "OPTICAL KINEMATICS",
    date: "2024.09.29",
    ratio: "aspect-[4/3]",
    desc: "Tactile micro-actuation testing executing circuit component positioning.",
  },
  {
    id: "MEDIA.04",
    title: "OX-2 Sentinel Thermal Audit Run",
    type: "INFRARED SENSOR ARRAY",
    date: "2024.08.14",
    ratio: "aspect-[16/9]",
    desc: "Autonomous structural inspection inside active high-temperature furnace chamber.",
  },
  {
    id: "MEDIA.05",
    title: "OX-3 Compute Node Thermal Dissipation",
    type: "CHASSIS BENCHMARK",
    date: "2024.07.03",
    ratio: "aspect-[16/9]",
    desc: "Passive liquid-cooling loop heat map during continuous 64M parameter neural inference.",
  },
  {
    id: "MEDIA.06",
    title: "OX-4 Heavy Material Transport",
    type: "PAYLOAD VERIFICATION",
    date: "2024.06.21",
    ratio: "aspect-[4/3]",
    desc: "120kg payload transport stability sweep in automated logistics warehouse.",
  },
];

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [itemsList, setItemsList] = useState(MEDIA_ITEMS);

  React.useEffect(() => {
    fetch('/api/public/gallery')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: `MEDIA.${String(item.id).padStart(2, '0')}`,
            title: item.caption || item.category || `Media ${item.id}`,
            type: (item.category || "GALLERY").toUpperCase(),
            date: new Date(item.createdAt).toISOString().split('T')[0].replace(/-/g, '.'),
            ratio: "aspect-[16/9]",
            desc: item.caption || item.mediaRef || "Visual telemetry recording.",
          }));
          setItemsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Header */}
      <header className="px-[5vw] mb-16 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ MEDIA ARCHIVE // VISUAL LOGS ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          System <span className="text-accent">Telemetry & Media</span>
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          Visual documentation of kinetic trials, thermal stress benchmarks, and field deployments captured across OXWAY research facilities.
        </p>

        {/* Filter Buttons */}
        <div className="flex gap-4 mt-8 font-mono text-xs uppercase">
          {["ALL", "LAB TRIALS", "FIELD DEPLOYMENT", "COMPUTE"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 border transition-all ${
                selectedFilter === filter
                  ? "border-accent text-accent bg-accent/10"
                  : "border-foreground/20 text-foreground/60 hover:text-foreground hover:border-foreground/40"
              }`}
            >
              [ {filter} ]
            </button>
          ))}
        </div>
      </header>

      {/* Media Grid */}
      <section className="px-[5vw] pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {itemsList.map((item) => (
            <div
              key={item.id}
              className="border border-foreground/10 p-6 relative group backdrop-blur-md hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              {/* Media Container Placeholder */}
              <div className={`w-full ${item.ratio} bg-foreground/5 border border-foreground/10 mb-6 relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,52,42,0.08),transparent)] pointer-events-none" />
                
                {/* Tech Grid Pattern overlay */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                {/* Placeholder Logo / Watermark Icon */}
                <div className="text-center z-10 p-4">
                  <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">
                    [ {item.type} ]
                  </div>
                  <div className="font-mono text-xs opacity-50 uppercase">
                    [ MEDIA CAPTURE FEED ACTIVE ]
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 font-mono text-[9px] opacity-40 uppercase">
                  RECORDED: {item.date}
                </div>
              </div>

              {/* Text Info */}
              <div>
                <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">
                  [ {item.id} ]
                </div>
                <h3 className="font-display text-2xl uppercase text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
