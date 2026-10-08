"use client";

import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Film, FileText, Trash2, Copy, Check } from "lucide-react";

const MEDIA = [
  { id: 1, name: "ox1-hero.jpg",          type: "image", size: "2.4 MB", date: "2025-07-20", url: "/logo.jpg" },
  { id: 2, name: "actuation-diagram.png", type: "image", size: "890 KB", date: "2025-07-18", url: "/logo.jpg" },
  { id: 3, name: "lab-04-tour.mp4",        type: "video", size: "84 MB",  date: "2025-07-10", url: null        },
  { id: 4, name: "ox-arm-spec.pdf",        type: "doc",   size: "1.1 MB", date: "2025-07-05", url: null        },
  { id: 5, name: "team-photo-2025.jpg",   type: "image", size: "3.2 MB", date: "2025-06-30", url: "/logo.jpg" },
  { id: 6, name: "core-module.png",       type: "image", size: "1.5 MB", date: "2025-06-22", url: "/logo.jpg" },
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "image") return <ImageIcon size={20} style={{ color: "#4A9EFF" }} />;
  if (type === "video") return <Film size={20} style={{ color: "#34C97A" }} />;
  return <FileText size={20} style={{ color: "#F5A623" }} />;
};

export default function MediaAdmin() {
  const [media, setMedia] = useState(MEDIA);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyUrl = (id: number, url: string | null) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ MEDIA.SYS ]</div>
          <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>Media Library</h1>
          <p className="text-[10px] mt-1" style={{ color: "rgba(237,238,240,0.4)" }}>{media.length} files</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          {(["grid", "list"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="border px-3 py-2 text-[9px] uppercase tracking-widest transition-all"
              style={{ borderColor: view === v ? "#E8342A" : "rgba(237,238,240,0.1)", color: view === v ? "#E8342A" : "rgba(237,238,240,0.45)" }}
            >{v}</button>
          ))}
          <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
            style={{ borderColor: "#E8342A", color: "#E8342A" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
          >
            <Upload size={12} /> Upload
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed flex flex-col items-center justify-center py-10 mb-6 transition-colors"
        style={{ borderColor: "rgba(237,238,240,0.1)" }}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = "#E8342A"; }}
        onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(237,238,240,0.1)"; }}
      >
        <Upload size={24} className="mb-3" style={{ color: "rgba(237,238,240,0.3)" }} />
        <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.35)" }}>Drop files here or click Upload</div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map(item => (
            <div key={item.id} className="group border relative overflow-hidden" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
              <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: "#111315" }}>
                {item.url ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                ) : (
                  <TypeIcon type={item.type} />
                )}
              </div>
              <div className="p-2.5">
                <div className="text-[10px] truncate mb-0.5" style={{ color: "#EDEEF0" }}>{item.name}</div>
                <div className="text-[9px]" style={{ color: "rgba(237,238,240,0.35)" }}>{item.size}</div>
              </div>
              {/* Hover actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(10,11,13,0.7)" }}>
                <button onClick={() => copyUrl(item.id, item.url)} className="p-2 border transition-all" style={{ borderColor: "rgba(237,238,240,0.2)", color: "#EDEEF0" }}>
                  {copied === item.id ? <Check size={13} style={{ color: "#34C97A" }} /> : <Copy size={13} />}
                </button>
                <button onClick={() => setMedia(m => m.filter(x => x.id !== item.id))} className="p-2 border transition-all" style={{ borderColor: "rgba(232,52,42,0.4)", color: "#E8342A" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="border" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
          {media.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 border-b hover:bg-white/[0.015] transition-colors" style={{ borderColor: "rgba(237,238,240,0.05)" }}>
              <TypeIcon type={item.type} />
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate" style={{ color: "#EDEEF0" }}>{item.name}</div>
                <div className="text-[9px]" style={{ color: "rgba(237,238,240,0.35)" }}>{item.date}</div>
              </div>
              <div className="text-[10px]" style={{ color: "rgba(237,238,240,0.4)" }}>{item.size}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyUrl(item.id, item.url)} className="opacity-40 hover:opacity-100 transition-opacity">
                  {copied === item.id ? <Check size={13} style={{ color: "#34C97A" }} /> : <Copy size={13} />}
                </button>
                <button onClick={() => setMedia(m => m.filter(x => x.id !== item.id))} className="opacity-40 hover:text-red-400 hover:opacity-100 transition-all"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
