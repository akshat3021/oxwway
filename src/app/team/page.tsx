"use client";

import React from "react";
import { Footer } from "@/components/Footer";

const TEAM_MEMBERS = [
  {
    id: "FOUNDER.01",
    name: "DR. ARIS VANCE",
    role: "CHIEF EXECUTIVE OFFICER & FOUNDER",
    bio: "Former Director of Dynamic Locomotion at DARPA Robotics Challenge. Ph.D. in Mechanical Engineering from MIT.",
    focus: "Deterministic Kinetic Systems & Series-Elastic Architecture",
  },
  {
    id: "FOUNDER.02",
    name: "ELENA ROSTOVA",
    role: "CHIEF TECHNOLOGY OFFICER",
    bio: "Pioneered ultra-high torque-density actuator geometries and custom stator winding methodologies.",
    focus: "Actuator Thermal Dissipation & Motor Control",
  },
  {
    id: "LEAD.01",
    name: "MARCUS CHEN",
    role: "HEAD OF EDGE COGNITION",
    bio: "Specialist in real-time neural inference quantization and 1,000 Hz optical sensor fusion pipelines.",
    focus: "Spatial Perception & Local Tensor Hardware",
  },
  {
    id: "LEAD.02",
    name: "SARAH KIEL",
    role: "HEAD OF HARDWARE MANUFACTURING",
    bio: "Managed zero-defect aerospace fabrication pipelines prior to leading Lab 04 production scale.",
    focus: "Low-Volume Precision Manufacturing & QA",
  },
  {
    id: "LEAD.03",
    name: "KAIKO TAKAHASHI",
    role: "PRINCIPAL KINEMATICS ENGINEER",
    bio: "Architect of the OX-1 bipedal balance controller and 32-DOF joint trajectory matrix.",
    focus: "Bipedal Locomotion & Inertial Balance",
  },
  {
    id: "LEAD.04",
    name: "VALENTINA ORLOV",
    role: "HEAD OF SYSTEMS INTEGRATION",
    bio: "Directs hardware-software verification, triple-fault electrical safety, and industrial deployment.",
    focus: "Triple-Fault Electrical & Safety Verification",
  },
];

export default function TeamPage() {
  const [teamList, setTeamList] = React.useState(TEAM_MEMBERS);

  React.useEffect(() => {
    fetch('/api/public/team')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((m: any) => ({
            id: `MEMBER.${String(m.id).padStart(2, '0')}`,
            name: m.name.toUpperCase(),
            role: m.role.toUpperCase(),
            bio: m.bio || '',
            focus: m.role || 'Robotics Research',
          }));
          setTeamList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Header */}
      <header className="px-[5vw] mb-16 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ PERSONNEL // ENGINEERING FACULTY ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          The <span className="text-accent">Builders</span>
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          An interdisciplinary team of mechanical engineers, roboticists, and systems architects dedicated to solving hardware autonomy.
        </p>
      </header>

      {/* Team Grid */}
      <section className="px-[5vw] pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamList.map((member) => (
            <div
              key={member.id}
              className="border border-foreground/10 p-8 relative group backdrop-blur-md hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Monogram / Avatar Placeholder */}
                <div className="w-16 h-16 border border-foreground/20 bg-foreground/5 flex items-center justify-center font-display text-xl uppercase mb-6 group-hover:border-accent group-hover:text-accent transition-colors">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>

                <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">
                  [ {member.id} ]
                </div>
                
                <h2 className="font-display text-2xl uppercase text-foreground mb-1">
                  {member.name}
                </h2>
                
                <div className="font-mono text-[11px] text-accent/80 uppercase tracking-widest mb-4">
                  {member.role}
                </div>

                <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed mb-6">
                  {member.bio}
                </p>
              </div>

              <div className="border-t border-foreground/10 pt-4">
                <div className="font-mono text-[9px] opacity-40 uppercase mb-1">PRIMARY FOCUS</div>
                <div className="font-mono text-xs uppercase font-semibold text-foreground/90">
                  {member.focus}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
