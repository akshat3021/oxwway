"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";

const POSITIONS = [
  {
    id: "POS.HARDWARE.01",
    title: "Senior Actuator Control Engineer",
    division: "HARDWARE DIVISION // LAB 04",
    location: "BOSTON, MA / HYBRID",
    type: "FULL-TIME",
    desc: "Lead dynamic control loop design for series-elastic motor modules operating at 10 kHz sampling frequencies.",
    reqs: [
      "5+ years in high-frequency electric motor control or dynamic robotics",
      "Expertise in C/C++, Real-Time Linux / RTOS, and CAN FD bus interfaces",
      "Deep understanding of field-oriented control (FOC) and thermal modeling",
    ]
  },
  {
    id: "POS.SOFTWARE.02",
    title: "Real-Time Systems Architect",
    division: "SOFTWARE SYSTEMS DIVISION",
    location: "REMOTE / BOSTON, MA",
    type: "FULL-TIME",
    desc: "Architect sub-millisecond local message-passing bus and low-latency IPC for 64M parameter edge neural inference.",
    reqs: [
      "Proven track record in low-latency systems programming (Rust / C++)",
      "Experience with GPU/NPU memory management and DMA hardware pipelines",
      "Familiarity with ROS2 / custom robotics middleware architectures",
    ]
  },
  {
    id: "POS.ROBOTICS.03",
    title: "Perception & Sensor Fusion Lead",
    division: "COGNITIVE SYSTEMS DIVISION",
    location: "BOSTON, MA / LAB 04",
    type: "FULL-TIME",
    desc: "Synthesize 8K LiDAR point clouds and tactile micro-arrays into 3D spatial occupancies for dynamic bipedal navigation.",
    reqs: [
      "Ph.D. or M.S. in Robotics, Computer Vision, or Spatial Perception",
      "Experience deploying quantized neural networks on edge NPU accelerators",
      "Strong publication or industry record in real-time SLAM & obstacle avoidance",
    ]
  },
  {
    id: "POS.KINEMATICS.04",
    title: "Mechanical Kinematics Specialist",
    division: "HARDWARE DIVISION // FABRICATION",
    location: "BOSTON, MA / LAB 04",
    type: "FULL-TIME",
    desc: "Design zero-backlash joint geometry, titanium link structures, and strain-gauge force sensing assemblies.",
    reqs: [
      "Expertise in FEA structural optimization, harmonic drive integration, and CAD",
      "Hands-on experience with CNC machining, titanium alloys, and composite bonding",
      "Background in aerospace or high-performance humanoid mechanism design",
    ]
  }
];

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [jobsList, setJobsList] = useState(POSITIONS);

  React.useEffect(() => {
    fetch('/api/public/careers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((job: any) => ({
            id: `POS.${(job.department || 'RECRUITMENT').toUpperCase()}.${String(job.id).padStart(2, '0')}`,
            title: job.title,
            division: `${(job.department || 'ENGINEERING').toUpperCase()} DIVISION`,
            location: (job.location || 'BOSTON, MA / HYBRID').toUpperCase(),
            type: (job.status || 'FULL-TIME').toUpperCase(),
            desc: job.description || '',
            reqs: [
              "Relevant industry or academic experience in robotics or engineering",
              "Proven technical competency and hardware/software problem-solving skills"
            ]
          }));
          setJobsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Header */}
      <header className="px-[5vw] mb-16 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ RECRUITMENT // JOIN FACULTY ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          Build The <span className="text-accent">Unbuilt</span>
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          We are seeking engineers, roboticists, and systems architects who demand rigor over hype. Join us in engineering deterministic physical autonomy.
        </p>
      </header>

      {/* Roles List */}
      <section className="px-[5vw] pb-32 max-w-6xl mx-auto flex flex-col gap-6">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">
          [ OPEN RECRUITMENT REQUISITIONS ]
        </div>

        {jobsList.map((pos) => (
          <div
            key={pos.id}
            className="border border-foreground/10 p-8 relative backdrop-blur-md hover:border-accent/40 transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
              <div>
                <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-1">
                  [ {pos.id} ] — {pos.division}
                </div>
                <h2 className="font-display text-2xl uppercase text-foreground">
                  {pos.title}
                </h2>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase">
                <span className="border border-foreground/20 px-3 py-1 text-foreground/70">
                  {pos.location}
                </span>
                <span className="bg-accent/10 border border-accent/30 text-accent px-3 py-1">
                  {pos.type}
                </span>
              </div>
            </div>

            <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed mb-6 max-w-3xl">
              {pos.desc}
            </p>

            {/* Expanded Reqs */}
            <div className="border-t border-foreground/10 pt-4 mb-6">
              <div className="font-mono text-[9px] opacity-40 uppercase mb-3">KEY REQUISITES</div>
              <ul className="flex flex-col gap-2 font-mono text-xs text-foreground/80 uppercase">
                {pos.reqs.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border font-mono text-xs uppercase tracking-widest px-5 py-2.5 border-accent text-accent hover:bg-accent/10 transition-colors"
            >
              <span>Submit Dossier / Apply</span>
              <span>→</span>
            </Link>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
