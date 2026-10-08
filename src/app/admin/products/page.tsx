"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Star } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "OX-1 Atlas",      category: "Humanoid", status: "active",      version: "v2.4",  price: "$180,000", updated: "2025-07-20" },
  { id: 2, name: "OX-1 Compact",    category: "Humanoid", status: "active",      version: "v1.8",  price: "$120,000", updated: "2025-07-15" },
  { id: 3, name: "OX-Arm Pro",      category: "Appendage",status: "active",      version: "v3.1",  price: "$42,000",  updated: "2025-07-01" },
  { id: 4, name: "OX-Sense Array",  category: "Sensor",   status: "active",      version: "v1.2",  price: "$18,500",  updated: "2025-06-22" },
  { id: 5, name: "OX-1 Prototype",  category: "Humanoid", status: "development", version: "v0.9",  price: "TBD",      updated: "2025-07-25" },
  { id: 6, name: "OX-Core Module",  category: "Component",status: "deprecated",  version: "v1.0",  price: "$9,000",   updated: "2025-04-10" },
];

const STATUS_COLOR: Record<string, string> = {
  active:      "#34C97A",
  development: "#F5A623",
  deprecated:  "rgba(237,238,240,0.3)",
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState(PRODUCTS);

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ PRODUCTS.SYS ]</div>
          <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>Products</h1>
          <p className="text-[10px] mt-1" style={{ color: "rgba(237,238,240,0.4)" }}>
            {products.filter(p => p.status === "active").length} active · {products.filter(p => p.status === "development").length} in development
          </p>
        </div>
        <button
          className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
          style={{ borderColor: "#E8342A", color: "#E8342A" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
        >
          <Plus size={12} /> Add Product
        </button>
      </div>

      <div className="border" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
        <div
          className="grid text-[9px] uppercase tracking-widest px-5 py-3 border-b"
          style={{ gridTemplateColumns: "2fr 120px 110px 80px 100px 90px 80px", borderColor: "rgba(237,238,240,0.07)", color: "rgba(237,238,240,0.35)", backgroundColor: "#0D0E11" }}
        >
          <span>Product</span><span>Category</span><span>Status</span><span>Version</span><span>Price</span><span>Updated</span><span className="text-right">Actions</span>
        </div>
        {products.map(p => (
          <div
            key={p.id}
            className="grid items-center px-5 py-4 border-b hover:bg-white/[0.015] transition-colors"
            style={{ gridTemplateColumns: "2fr 120px 110px 80px 100px 90px 80px", borderColor: "rgba(237,238,240,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border flex items-center justify-center flex-shrink-0" style={{ borderColor: "rgba(237,238,240,0.1)" }}>
                <Star size={12} style={{ color: "#E8342A" }} />
              </div>
              <span className="text-xs" style={{ color: "#EDEEF0" }}>{p.name}</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.45)" }}>{p.category}</span>
            <span>
              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 border" style={{ color: STATUS_COLOR[p.status], borderColor: `${STATUS_COLOR[p.status]}40`, backgroundColor: `${STATUS_COLOR[p.status]}12` }}>
                {p.status}
              </span>
            </span>
            <span className="text-[10px] font-mono" style={{ color: "rgba(237,238,240,0.5)" }}>{p.version}</span>
            <span className="text-[10px]" style={{ color: "rgba(237,238,240,0.7)" }}>{p.price}</span>
            <span className="text-[9px]" style={{ color: "rgba(237,238,240,0.35)" }}>{p.updated}</span>
            <div className="flex items-center gap-2 justify-end">
              <button className="opacity-40 hover:opacity-100 transition-opacity"><Edit2 size={13} /></button>
              <button onClick={() => setProducts(prev => prev.filter(x => x.id !== p.id))} className="opacity-40 hover:text-red-400 hover:opacity-100 transition-all"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
