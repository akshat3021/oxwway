import Link from "next/link";
import { requirePage } from "../_lib/guards";
import { dashboardStats } from "@/server/services/reports";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requirePage();
  const s = await dashboardStats();
  const isAdmin = user.role === "admin";

  const cards = [
    { label: "Published posts", value: s.publishedPosts, href: "/admin/blog" },
    { label: "Draft posts", value: s.draftPosts, href: "/admin/blog" },
    { label: "Live products", value: s.publishedProducts, href: "/admin/products" },
    { label: "Open roles", value: s.openRoles, href: "/admin/careers" },
    { label: "Team members", value: s.teamMembers, href: "/admin/team" },
    ...(isAdmin ? [{ label: "Unread messages", value: s.unreadMessages, href: "/admin/messages" }] : []),
  ];

  return (
    <>
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-2">[ SYS.ADMIN.01 ]</div>
        <h1 className="text-2xl font-display uppercase tracking-wide">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="text-xs text-foreground/50 mt-1">Everything here is live data from the website.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-10">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="border border-foreground/10 bg-surface p-4 hover:border-accent transition-colors focus-visible:outline focus-visible:outline-accent">
            <div className="text-[10px] uppercase tracking-widest text-foreground/50 mb-3">{c.label}</div>
            <div className="text-3xl tabular-nums">{c.value}</div>
          </Link>
        ))}
      </div>

      {isAdmin && (
        <section aria-labelledby="activity" className="border border-foreground/10 bg-surface">
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
            <h2 id="activity" className="text-[10px] uppercase tracking-widest text-foreground/60">Recent activity</h2>
            <Link href="/admin/audit" className="text-[10px] uppercase tracking-widest text-accent">View all →</Link>
          </div>
          {s.recentActivity.length === 0 ? (
            <p className="p-4 text-xs text-foreground/40">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-foreground/5 text-xs">
              {s.recentActivity.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
                  <span className="tabular-nums text-foreground/40">{a.createdAt.toLocaleString("en-GB", { timeZone: "UTC" })} UTC</span>
                  <span className="font-mono text-accent">{a.action}</span>
                  <span>{a.entity}</span>
                  <span className="text-foreground/40 ml-auto truncate">{a.actorEmail}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
