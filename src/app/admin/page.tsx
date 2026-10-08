"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, FileText, Briefcase, Eye, ArrowUpRight, Activity, Package, Users } from "lucide-react";

const STATS = [
  { label: "Page Views",      value: "124.5k", delta: "+12%", icon: Eye,       color: "#E8342A" },
  { label: "Published Logs",  value: "24",     delta: "+3",   icon: FileText,  color: "#4A9EFF" },
  { label: "Open Roles",      value: "8",      delta: "+2",   icon: Briefcase, color: "#34C97A" },
  { label: "Active Products", value: "6",      delta: "0",    icon: Package,   color: "#F5A623" },
];

const ACTIVITY = [
  { time: "2025-07-25 12:30", user: "admin@oxway.io",  action: "PUBLISH",  target: "/blog/actuation-update-v4-2", color: "#34C97A" },
  { time: "2025-07-25 11:15", user: "editor@oxway.io", action: "UPDATE",   target: "/products/ox-1",              color: "#4A9EFF" },
  { time: "2025-07-24 09:05", user: "admin@oxway.io",  action: "CREATE",   target: "/careers/hardware-qa",        color: "#F5A623" },
  { time: "2025-07-23 16:42", user: "admin@oxway.io",  action: "DELETE",   target: "/team/member-07",             color: "#E8342A" },
  { time: "2025-07-23 14:20", user: "editor@oxway.io", action: "DRAFT",    target: "/blog/depth-perception-tech", color: "rgba(237,238,240,0.4)" },
];

const QUICK = [
  { label: "New Blog Post",   href: "/admin/blog/new",     icon: FileText  },
  { label: "Add Job Listing", href: "/admin/careers/new",  icon: Briefcase },
  { label: "Add Team Member", href: "/admin/team",         icon: Users     },
  { label: "Upload Media",    href: "/admin/media",        icon: Activity  },
];

function StatCard({ label, value, delta, icon: Icon, color }: typeof STATS[0]) {
  const positive = !delta.startsWith("-") && delta !== "0";
  return (
    <div
      className="border p-6 flex flex-col gap-4"
      style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}
    >
      <div className="flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.4)" }}>{label}</div>
        <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-light tabular-nums" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>{value}</div>
        {delta !== "0" && (
          <div className="flex items-center gap-1 text-[10px]" style={{ color: positive ? "#34C97A" : "#E8342A" }}>
            <TrendingUp size={10} />
            {delta} this month
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ SYS.ADMIN.01 ]</div>
        <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>
          Dashboard Overview
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(237,238,240,0.4)" }}>
          OXWAY Operating System — Control Center
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 border" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.5)" }}>Audit Log</div>
            <Link href="/admin/settings" className="text-[9px] uppercase tracking-widest flex items-center gap-1 transition-colors" style={{ color: "#E8342A" }}>
              View all <ArrowUpRight size={9} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(237,238,240,0.05)" }}>
            {ACTIVITY.map((row, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.015] transition-colors">
                <span className="text-[9px] tabular-nums w-32 flex-shrink-0" style={{ color: "rgba(237,238,240,0.3)" }}>{row.time}</span>
                <span
                  className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 flex-shrink-0"
                  style={{ color: row.color, backgroundColor: `${row.color}18`, border: `1px solid ${row.color}40` }}
                >
                  {row.action}
                </span>
                <span className="text-[10px] truncate" style={{ color: "rgba(237,238,240,0.65)" }}>{row.target}</span>
                <span className="ml-auto text-[9px] flex-shrink-0" style={{ color: "rgba(237,238,240,0.3)" }}>{row.user.split("@")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.5)" }}>Quick Actions</div>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {QUICK.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 border transition-all duration-150"
                style={{ borderColor: "rgba(237,238,240,0.07)", color: "rgba(237,238,240,0.6)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E8342A";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#E8342A";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(232,52,42,0.05)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(237,238,240,0.07)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(237,238,240,0.6)";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                }}
              >
                <Icon size={13} />
                <span className="text-[10px] uppercase tracking-widest">{label}</span>
                <ArrowUpRight size={11} className="ml-auto" />
              </Link>
            ))}
          </div>

          {/* System Status */}
          <div className="mx-4 mb-4 p-4 border" style={{ borderColor: "rgba(52,201,122,0.3)", backgroundColor: "rgba(52,201,122,0.04)" }}>
            <div className="text-[9px] uppercase tracking-widest mb-3" style={{ color: "rgba(237,238,240,0.4)" }}>System Status</div>
            {[
              { label: "Web Server",   ok: true },
              { label: "Database",     ok: true },
              { label: "Media CDN",    ok: true },
              { label: "Auth Service", ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.45)" }}>{label}</span>
                <span className="flex items-center gap-1 text-[9px]" style={{ color: ok ? "#34C97A" : "#E8342A" }}>
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: ok ? "#34C97A" : "#E8342A" }} />
                  {ok ? "Nominal" : "Error"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
