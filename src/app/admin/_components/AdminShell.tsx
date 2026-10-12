"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Building2, FileText, Home, ImageIcon, Inbox, LayoutDashboard, LogOut, Menu, Package,
  Briefcase, ScrollText, Settings, UserCircle, Users, X, type LucideIcon,
} from "lucide-react";
import { api } from "../_lib/api";

interface NavEntry { label: string; href: string; icon: LucideIcon; adminOnly?: boolean }

const NAV: NavEntry[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Blog & News", href: "/admin/blog", icon: FileText },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Careers", href: "/admin/careers", icon: Briefcase },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Company", href: "/admin/company", icon: Building2 },
  { label: "Messages", href: "/admin/messages", icon: Inbox, adminOnly: true },
  { label: "Users", href: "/admin/users", icon: Users, adminOnly: true },
  { label: "Audit log", href: "/admin/audit", icon: ScrollText, adminOnly: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, adminOnly: true },
  { label: "Account", href: "/admin/account", icon: UserCircle },
];

export function AdminShell({ user, children }: { user: { email: string; name: string; role: "admin" | "editor" }; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const items = NAV.filter((n) => !n.adminOnly || user.role === "admin");
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const current = items.find((n) => isActive(n.href))?.label ?? "Admin";

  const signOut = async () => {
    setSigningOut(true);
    try { await api("/api/auth/logout", { method: "POST", json: {} }); } catch { /* fall through: leave anyway */ }
    window.location.assign("/admin/login");
  };

  const nav = (
    <nav aria-label="Admin" className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
      {items.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 border-l-2 text-xs uppercase tracking-widest transition-colors ${active ? "border-accent text-accent bg-accent/10" : "border-transparent text-foreground/55 hover:text-foreground"}`}>
            <Icon size={15} aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );

  const identity = (
    <div className="border-t border-foreground/10 p-4">
      <div className="text-[11px] text-foreground/60 truncate" title={user.email}>{user.email}</div>
      <div className="text-[10px] uppercase tracking-widest text-accent mb-3">{user.role}</div>
      <button onClick={() => void signOut()} disabled={signingOut} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-foreground/50 hover:text-red-400 disabled:opacity-50">
        <LogOut size={12} aria-hidden /> {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex text-sm font-mono">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-2 focus:left-2 focus:bg-accent focus:text-white focus:px-3 focus:py-2">Skip to content</a>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col border-r border-foreground/10 bg-surface">
        <div className="h-16 flex items-center px-5 border-b border-foreground/10 text-xs font-bold uppercase tracking-[0.2em]">
          O<span className="text-accent">X</span>WAY <span className="text-foreground/40 ml-2">/ Admin</span>
        </div>
        {nav}
        {identity}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-surface border-r border-foreground/10">
            <div className="h-14 flex items-center justify-between px-5 border-b border-foreground/10 text-xs font-bold uppercase tracking-[0.2em]">
              <span>O<span className="text-accent">X</span>WAY</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            {nav}
            {identity}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 flex items-center gap-4 px-4 md:px-8 border-b border-foreground/10 bg-surface">
          <button className="md:hidden p-1" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={18} /></button>
          <div className="text-[10px] uppercase tracking-widest text-foreground/50"><span className="text-accent">SYS.ADMIN</span> / {current}</div>
          <Link href="/" target="_blank" rel="noopener" className="ml-auto text-[10px] uppercase tracking-widest text-foreground/50 hover:text-accent">View site ↗</Link>
        </header>
        <main id="admin-main" tabIndex={-1} className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
