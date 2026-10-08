"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Briefcase, Package,
  Users, Image, Settings, Building2, LogOut,
  ChevronRight, Bell, Search, Menu, X
} from "lucide-react";

const NAV = [
  { label: "Dashboard",    href: "/admin",          icon: LayoutDashboard },
  { label: "Blog & News",  href: "/admin/blog",     icon: FileText },
  { label: "Careers",      href: "/admin/careers",  icon: Briefcase },
  { label: "Products",     href: "/admin/products", icon: Package },
  { label: "Team",         href: "/admin/team",     icon: Users },
  { label: "Media",        href: "/admin/media",    icon: Image },
  { label: "Company",      href: "/admin/company",  icon: Building2 },
  { label: "Settings",     href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    // Live clock
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    // Load session for UI display if present (no redirect)
    const session = localStorage.getItem("oxway-admin-session");
    if (session) {
      try { setUser(JSON.parse(session)); } catch {}
    }
    return () => clearInterval(t);
  }, []);


  const handleSignOut = () => {
    localStorage.removeItem("oxway-admin-session");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex text-sm" style={{ backgroundColor: "#0A0B0D", color: "#EDEEF0", fontFamily: "var(--font-mono, monospace)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col border-r transition-all duration-300 flex-shrink-0"
        style={{
          width: sidebarOpen ? 240 : 64,
          borderColor: "rgba(237,238,240,0.07)",
          backgroundColor: "#0D0E11",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b flex-shrink-0" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
          <img src="/logo.jpg" alt="OXWAY" className="w-7 h-7 object-contain flex-shrink-0" style={{ filter: "invert(1) brightness(0.7)" }} />
          {sidebarOpen && (
            <span className="font-bold text-xs uppercase tracking-[0.2em]">
              O<span style={{ color: "#E8342A" }}>X</span>WAY <span style={{ color: "rgba(237,238,240,0.4)" }}>/ ADMIN</span>
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="ml-auto opacity-40 hover:opacity-100 transition-opacity"
          >
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150"
                style={{
                  backgroundColor: active ? "rgba(232,52,42,0.1)" : "transparent",
                  color: active ? "#E8342A" : "rgba(237,238,240,0.55)",
                  borderLeft: active ? "2px solid #E8342A" : "2px solid transparent",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "#EDEEF0"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(237,238,240,0.55)"; }}
              >
                <Icon size={15} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-xs uppercase tracking-widest">{label}</span>}
                {sidebarOpen && active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        {sidebarOpen && (
          <div className="border-t p-4 flex-shrink-0" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
            <div className="text-[10px] mb-1" style={{ color: "rgba(237,238,240,0.5)" }}>
              {user?.email ?? "admin@oxway.io"}
            </div>
            <div className="text-[10px] mb-3" style={{ color: "#E8342A" }}>
              {user?.role ?? "SUPER_ADMIN"}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-red-400 transition-all"
            >
              <LogOut size={11} /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <header
          className="h-16 flex items-center px-6 gap-4 flex-shrink-0 border-b"
          style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.4)" }}>
            <span style={{ color: "#E8342A" }}>SYS.ADMIN</span>
            <ChevronRight size={10} />
            <span style={{ color: "#EDEEF0" }}>
              {NAV.find(n => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href)))?.label ?? "Dashboard"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Clock */}
            <span className="text-[10px] tabular-nums" style={{ color: "rgba(237,238,240,0.35)" }}>{time}</span>
            {/* Status pill */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#E8342A" }} />
              Online
            </div>
            {/* Bell */}
            <button className="opacity-40 hover:opacity-100 transition-opacity relative">
              <Bell size={14} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "#E8342A" }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: "#0A0B0D" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
