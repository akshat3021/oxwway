"use client";

import React, { useState } from "react";
import { Save, Globe, Mail, MapPin, Phone, Link as LinkIcon } from "lucide-react";

export default function CompanyAdmin() {
  const [form, setForm] = useState({
    name: "OXWAY", tagline: "Engineered for Absolute Capability.",
    founded: "2022", hq: "San Francisco, CA", email: "contact@oxway.io",
    phone: "+1 (415) 000-0000", website: "https://oxway.io",
    mission: "To engineer humanoid robotics that extend human capability without limitation — precision-built, always reliable, operating at the edge of what is physically possible.",
    linkedin: "https://linkedin.com/company/oxway",
    twitter: "https://x.com/oxway",
    github: "https://github.com/oxway",
  });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const inputStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "transparent", border: "1px solid rgba(237,238,240,0.1)",
    padding: "10px 14px", fontSize: 12, color: "#EDEEF0", outline: "none",
  };

  const Field = ({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) => (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>
        {Icon && <Icon size={9} />} {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ COMPANY.SYS ]</div>
          <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>Company Info</h1>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
          style={{ borderColor: "#E8342A", color: "#E8342A" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
        >
          <Save size={12} />
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Identity */}
        <section className="border p-6" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
          <div className="text-[9px] uppercase tracking-widest mb-4" style={{ color: "#E8342A" }}>[ Identity ]</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Company Name">
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Tagline">
                <input style={inputStyle} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
              </Field>
            </div>
            <Field label="Year Founded">
              <input style={inputStyle} value={form.founded} onChange={e => setForm(f => ({ ...f, founded: e.target.value }))}
                onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
            </Field>
            <Field label="Headquarters" icon={MapPin}>
              <input style={inputStyle} value={form.hq} onChange={e => setForm(f => ({ ...f, hq: e.target.value }))}
                onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
            </Field>
          </div>
        </section>

        {/* Mission */}
        <section className="border p-6" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
          <div className="text-[9px] uppercase tracking-widest mb-4" style={{ color: "#E8342A" }}>[ Mission Statement ]</div>
          <textarea
            style={{ ...inputStyle, resize: "vertical", height: 120, lineHeight: 1.75 }}
            value={form.mission}
            onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
            onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
          />
        </section>

        {/* Contact */}
        <section className="border p-6" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
          <div className="text-[9px] uppercase tracking-widest mb-4" style={{ color: "#E8342A" }}>[ Contact ]</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" icon={Mail}>
              <input style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
            </Field>
            <Field label="Phone" icon={Phone}>
              <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
            </Field>
            <div className="col-span-2">
              <Field label="Website" icon={Globe}>
                <input style={inputStyle} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
              </Field>
            </div>
          </div>
        </section>

        {/* Social */}
        <section className="border p-6" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
          <div className="text-[9px] uppercase tracking-widest mb-4" style={{ color: "#E8342A" }}>[ Social & Links ]</div>
          <div className="flex flex-col gap-3">
            {(["linkedin", "twitter", "github"] as const).map(key => (
              <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} icon={LinkIcon}>
                <input style={inputStyle} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  onFocus={el => (el.currentTarget.style.borderColor = "#E8342A")} onBlur={el => (el.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
              </Field>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
