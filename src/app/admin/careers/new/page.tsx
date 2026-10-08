"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";

const DEPTS = ["Engineering", "Research", "Operations", "Design", "Sales", "Marketing"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const LOCATIONS = ["San Francisco, CA", "Austin, TX", "New York, NY", "Remote", "Hybrid"];

export default function NewJobPost() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", dept: "Engineering", type: "Full-time", location: "Remote",
    salary: "", description: "", requirements: "", status: "open",
  });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const inputStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "transparent", border: "1px solid rgba(237,238,240,0.1)",
    padding: "10px 14px", fontSize: 12, color: "#EDEEF0", outline: "none",
  };
  const selectStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "#0D0E11", border: "1px solid rgba(237,238,240,0.1)",
    padding: "10px 14px", fontSize: 12, color: "#EDEEF0", outline: "none",
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "#EDEEF0" }}>
          <ArrowLeft size={12} /> Back
        </button>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ CAREERS.EDITOR ]</div>
          <h1 className="text-xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>New Job Listing</h1>
        </div>
        <div className="flex gap-3">
          {saved && <span className="text-[10px] uppercase tracking-widest" style={{ color: "#34C97A" }}>Saved ✓</span>}
          <button onClick={save} className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest" style={{ borderColor: "rgba(237,238,240,0.15)", color: "rgba(237,238,240,0.6)" }}>
            <Save size={12} /> Save Draft
          </button>
          <button onClick={save} className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest" style={{ borderColor: "#E8342A", color: "#E8342A" }}>
            <Send size={12} /> Publish
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 border p-8" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>Job Title</label>
            <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Robotics Engineer"
              onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>Department</label>
            <select style={selectStyle} value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>Employment Type</label>
            <select style={selectStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>Location</label>
            <select style={selectStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>Salary Range</label>
            <input style={inputStyle} value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. $140k – $180k"
              onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>Job Description</label>
          <textarea style={{ ...inputStyle, resize: "vertical", height: 160, lineHeight: 1.7 }} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the role and responsibilities..."
            onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>Requirements</label>
          <textarea style={{ ...inputStyle, resize: "vertical", height: 130, lineHeight: 1.7, fontFamily: "monospace" }} value={form.requirements}
            onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} placeholder={"• 5+ years robotics experience\n• Proficient in ROS2\n• Strong C++ / Python skills"}
            onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")} onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")} />
        </div>
      </div>
    </div>
  );
}
