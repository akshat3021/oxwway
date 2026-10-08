"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit2, Trash2, ArrowUpRight } from "lucide-react";

const POSTS = [
  { id: 1, title: "Version 4.2: Actuation Update Deployed",         status: "published", category: "Engineering", date: "2025-07-20", views: 4820 },
  { id: 2, title: "How We Achieve Sub-Millimeter Depth Perception",  status: "published", category: "Technology",  date: "2025-07-14", views: 3104 },
  { id: 3, title: "Facility Expansion: Lab 04 Now Online",           status: "published", category: "Company",    date: "2025-07-08", views: 1870 },
  { id: 4, title: "OXWAY Core — Design Philosophy Explained",        status: "draft",     category: "Design",     date: "2025-07-25", views: 0    },
  { id: 5, title: "Neural Architecture in Real-Time Systems",        status: "draft",     category: "Research",   date: "2025-07-22", views: 0    },
  { id: 6, title: "Q3 Deployment Summary",                           status: "archived",  category: "Company",    date: "2025-06-30", views: 2210 },
];

const STATUS_COLOR: Record<string, string> = {
  published: "#34C97A",
  draft:     "#F5A623",
  archived:  "rgba(237,238,240,0.3)",
};

export default function BlogAdmin() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = POSTS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ CONTENT.SYS ]</div>
          <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>
            Blog & News
          </h1>
          <p className="text-[10px] mt-1" style={{ color: "rgba(237,238,240,0.4)" }}>
            {POSTS.filter(p => p.status === "published").length} published · {POSTS.filter(p => p.status === "draft").length} drafts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
          style={{ borderColor: "#E8342A", color: "#E8342A" }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(232,52,42,0.08)")}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent")}
        >
          <Plus size={12} /> New Post
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(237,238,240,0.3)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-transparent border px-9 py-2.5 text-xs outline-none"
            style={{ borderColor: "rgba(237,238,240,0.1)", color: "#EDEEF0" }}
            onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
          />
        </div>
        {["all", "published", "draft", "archived"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-[10px] uppercase tracking-widest px-3 py-2 border transition-all"
            style={{
              borderColor: filter === f ? "#E8342A" : "rgba(237,238,240,0.1)",
              color: filter === f ? "#E8342A" : "rgba(237,238,240,0.45)",
              backgroundColor: filter === f ? "rgba(232,52,42,0.06)" : "transparent",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
        <div
          className="grid text-[9px] uppercase tracking-widest px-5 py-3 border-b"
          style={{ gridTemplateColumns: "1fr 120px 100px 80px 100px", borderColor: "rgba(237,238,240,0.07)", color: "rgba(237,238,240,0.35)", backgroundColor: "#0D0E11" }}
        >
          <span>Title</span><span>Category</span><span>Status</span><span>Views</span><span className="text-right">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-[10px]" style={{ color: "rgba(237,238,240,0.3)" }}>No posts found.</div>
        )}
        {filtered.map(post => (
          <div
            key={post.id}
            className="grid items-center px-5 py-4 border-b hover:bg-white/[0.015] transition-colors"
            style={{ gridTemplateColumns: "1fr 120px 100px 80px 100px", borderColor: "rgba(237,238,240,0.05)" }}
          >
            <div>
              <div className="text-xs mb-0.5 truncate pr-4" style={{ color: "#EDEEF0" }}>{post.title}</div>
              <div className="text-[9px]" style={{ color: "rgba(237,238,240,0.35)" }}>{post.date}</div>
            </div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.45)" }}>{post.category}</div>
            <div>
              <span
                className="text-[9px] uppercase tracking-widest px-2 py-0.5 border"
                style={{ color: STATUS_COLOR[post.status], borderColor: `${STATUS_COLOR[post.status]}40`, backgroundColor: `${STATUS_COLOR[post.status]}12` }}
              >
                {post.status}
              </span>
            </div>
            <div className="text-[10px] tabular-nums" style={{ color: "rgba(237,238,240,0.5)" }}>
              {post.views > 0 ? post.views.toLocaleString() : "—"}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button className="opacity-40 hover:opacity-100 transition-opacity"><Eye size={13} /></button>
              <Link href={`/admin/blog/new?edit=${post.id}`} className="opacity-40 hover:opacity-100 transition-opacity"><Edit2 size={13} /></Link>
              <button className="opacity-40 hover:text-red-400 hover:opacity-100 transition-all"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
