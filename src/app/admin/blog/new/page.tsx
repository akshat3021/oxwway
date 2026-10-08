"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, ArrowLeft, Tag, Calendar, User } from "lucide-react";

const CATEGORIES = ["Engineering", "Technology", "Design", "Research", "Company", "Deployment"];

export default function NewBlogPost() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", category: "Engineering", tags: "", excerpt: "", content: "", status: "draft",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (status: "draft" | "published") => {
    setForm(f => ({ ...f, status }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.4)" }}>{label}</label>
      {children}
    </div>
  );

  const inputStyle = {
    width: "100%", backgroundColor: "transparent", border: "1px solid rgba(237,238,240,0.1)",
    padding: "10px 14px", fontSize: 12, color: "#EDEEF0", outline: "none",
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "#EDEEF0" }}>
          <ArrowLeft size={12} /> Back
        </button>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ CONTENT.EDITOR ]</div>
          <h1 className="text-xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>
            New Blog Post
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-[10px] uppercase tracking-widest" style={{ color: "#34C97A" }}>Saved ✓</span>}
          <button
            onClick={() => handleSave("draft")}
            className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
            style={{ borderColor: "rgba(237,238,240,0.15)", color: "rgba(237,238,240,0.6)" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(237,238,240,0.4)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(237,238,240,0.15)"}
          >
            <Save size={12} /> Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
            style={{ borderColor: "#E8342A", color: "#E8342A" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
          >
            <Send size={12} /> Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main editor — 2/3 width */}
        <div className="col-span-2 flex flex-col gap-4">
          <Field label="Post Title">
            <input
              style={inputStyle}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Enter a compelling title..."
              onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
            />
          </Field>

          <Field label="Excerpt">
            <textarea
              style={{ ...inputStyle, resize: "none", height: 72 }}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="A short one-line description shown in listings..."
              onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
            />
          </Field>

          <Field label="Content (Markdown)">
            <textarea
              style={{ ...inputStyle, resize: "vertical", height: 380, fontFamily: "monospace", lineHeight: 1.7 }}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={"# Heading\n\nWrite your content in markdown...\n\n## Section\n\nParagraph text here."}
              onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
            />
          </Field>
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          <div className="border p-4" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
            <div className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "rgba(237,238,240,0.4)" }}>Status</div>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: form.status === "published" ? "#34C97A" : "#F5A623" }}
              />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "#EDEEF0" }}>{form.status}</span>
            </div>
          </div>

          {/* Category */}
          <div className="border p-4" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
            <div className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "rgba(237,238,240,0.4)" }}>Category</div>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-transparent text-xs py-1 outline-none"
              style={{ color: "#EDEEF0", borderBottom: "1px solid rgba(237,238,240,0.1)" }}
            >
              {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: "#0D0E11" }}>{c}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="border p-4" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest mb-3" style={{ color: "rgba(237,238,240,0.4)" }}>
              <Tag size={9} /> Tags
            </div>
            <input
              style={{ ...inputStyle, padding: "6px 10px" }}
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="robotics, ai, motors..."
              onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
            />
            <div className="text-[9px] mt-1.5" style={{ color: "rgba(237,238,240,0.25)" }}>Comma-separated</div>
          </div>

          {/* Author */}
          <div className="border p-4" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest mb-3" style={{ color: "rgba(237,238,240,0.4)" }}>
              <User size={9} /> Author
            </div>
            <div className="text-[10px]" style={{ color: "rgba(237,238,240,0.6)" }}>admin@oxway.io</div>
          </div>

          {/* Publish date */}
          <div className="border p-4" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest mb-3" style={{ color: "rgba(237,238,240,0.4)" }}>
              <Calendar size={9} /> Publish Date
            </div>
            <input
              type="date"
              className="w-full bg-transparent text-xs outline-none"
              style={{ color: "#EDEEF0", colorScheme: "dark" }}
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
