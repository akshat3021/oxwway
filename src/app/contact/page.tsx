"use client";

import React, { useState } from "react";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    inquiryType: "DEPLOYMENT",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Header */}
      <header className="px-[5vw] mb-16 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ COMMUNICATIONS // DIRECT LINK ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-8">
          Initiate <span className="text-accent">Contact</span>
        </h1>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-2xl">
          Direct inquiries to OXWAY Lab 04 engineering faculty. For platform deployments, technical evaluations, or press access.
        </p>
      </header>

      {/* Contact Form Section */}
      <section className="px-[5vw] pb-32 max-w-4xl mx-auto">
        <div className="border border-foreground/10 p-8 md:p-12 backdrop-blur-md relative">
          
          {submitted ? (
            <div className="text-center py-12">
              <div className="font-mono text-xs text-accent tracking-widest uppercase mb-4">
                [ TRANSMISSION RECEIVED // STATUS 200 ]
              </div>
              <h2 className="font-display text-4xl uppercase text-foreground mb-4">
                Transmission Logging Complete
              </h2>
              <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed max-w-md mx-auto mb-8">
                Your telemetry packet has been routed to the appropriate engineering division. Response SLA is 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="font-mono text-xs uppercase border border-accent text-accent px-6 py-3 hover:bg-accent/10"
              >
                [ Send Another Transmission ]
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">
                [ TELEMETRY FORM // DISPATCH PACKET ]
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs opacity-50 uppercase tracking-widest">
                    OPERATOR NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ENTER NAME"
                    className="bg-foreground/5 border border-foreground/10 p-4 font-mono text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-colors uppercase"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs opacity-50 uppercase tracking-widest">
                    TELEMETRY ADDRESS / EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="OPERATOR@ORGANIZATION.COM"
                    className="bg-foreground/5 border border-foreground/10 p-4 font-mono text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-colors uppercase"
                  />
                </div>

                {/* Organization */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs opacity-50 uppercase tracking-widest">
                    ORGANIZATION / ENTITY
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="COMPANY / LAB NAME"
                    className="bg-foreground/5 border border-foreground/10 p-4 font-mono text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-colors uppercase"
                  />
                </div>

                {/* Inquiry Type */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs opacity-50 uppercase tracking-widest">
                    INQUIRY PROTOCOL
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="bg-foreground/5 border border-foreground/10 p-4 font-mono text-xs text-foreground focus:outline-none focus:border-accent transition-colors uppercase cursor-pointer"
                  >
                    <option value="DEPLOYMENT" className="bg-background text-foreground">PLATFORM DEPLOYMENT</option>
                    <option value="RESEARCH" className="bg-background text-foreground">RESEARCH COLLABORATION</option>
                    <option value="PRESS" className="bg-background text-foreground">PRESS / MEDIA</option>
                    <option value="CAREERS" className="bg-background text-foreground">CAREER APPLICATION</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs opacity-50 uppercase tracking-widest">
                  TRANSMISSION PACKET / MESSAGE *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="DESCRIBE PLATFORM REQUIREMENTS OR INQUIRY SPECIFICATIONS..."
                  className="bg-foreground/5 border border-foreground/10 p-4 font-mono text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-colors uppercase resize-none"
                />
              </div>

              {/* Mechanical Bracket Submit Button */}
              <div className="pt-4 flex items-center gap-6">
                <button
                  type="submit"
                  className="group flex items-center gap-4 border font-mono text-xs uppercase tracking-[0.18em] px-6 py-4 transition-all duration-200"
                  style={{
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  <span className="font-mono text-[10px] opacity-60">[</span>
                  <span>SEND TRANSMISSION</span>
                  <span className="w-4 h-4 border border-current flex items-center justify-center text-[10px] transition-transform duration-200 group-hover:rotate-90">
                    +
                  </span>
                  <span className="font-mono text-[10px] opacity-60">]</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
