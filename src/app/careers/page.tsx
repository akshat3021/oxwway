import type { Metadata } from "next";
import Link from "next/link";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { card, EmptyNote, PageFrame, PageHeader } from "@/components/PublicPage";
import { listOpenJobs } from "@/server/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Careers", description: "Open roles at OXWAY." };

export default async function CareersPage() {
  const jobs = await listOpenJobs();
  return (
    <PageFrame>
      <PageHeader tag="RECRUITMENT // OPEN ROLES" title="Build The" accent="Future" />
      {jobs.length === 0 ? (
        <EmptyNote title="No open roles right now." hint="Check back soon, or introduce yourself via the contact page." />
      ) : (
        <section className="px-[5vw] pb-24">
          <ul className="max-w-4xl flex flex-col gap-4">
            {jobs.map((j) => (
              <li key={j.id}>
                <details className={`${card} group`}>
                  <summary className="flex flex-wrap items-center justify-between gap-3 p-6 cursor-pointer list-none focus-visible:outline focus-visible:outline-accent">
                    <div>
                      <h2 className="font-display text-xl uppercase text-foreground">{j.title}</h2>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 mt-1">{[j.department, j.location].filter(Boolean).join(" // ")}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent group-open:hidden">Details +</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent hidden group-open:inline">Close −</span>
                  </summary>
                  <div className="px-6 pb-6 border-t border-foreground/10 pt-6">
                    {j.description ? <SafeMarkdown source={j.description} /> : <p className="font-mono text-xs text-foreground/50">Details coming soon.</p>}
                    <Link href="/contact" className="inline-block mt-6 border border-accent text-accent px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-accent/10">Apply via contact</Link>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
