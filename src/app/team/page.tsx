import type { Metadata } from "next";
import { card, EmptyNote, PageFrame, PageHeader } from "@/components/PublicPage";
import { initialsOf } from "@/server/services/landing";
import { listTeam } from "@/server/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Team", description: "The people building OXWAY." };

export default async function TeamPage() {
  const team = await listTeam();
  return (
    <PageFrame>
      <PageHeader tag="FACULTY // BUILDERS" title="The Minds Behind" accent="The Machine" />
      {team.length === 0 ? (
        <EmptyNote title="Team profiles are coming soon." />
      ) : (
        <section className="px-[5vw] pb-24">
          <ul className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((m) => (
              <li key={m.id} className={`${card} p-6 flex flex-col`}>
                <div className="relative aspect-[4/5] mb-5 bg-foreground/5 overflow-hidden flex items-center justify-center">
                  {m.photoRef ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoRef} alt={m.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <span aria-hidden className="font-mono text-6xl font-bold text-foreground/15">{initialsOf(m.name)}</span>
                  )}
                </div>
                <h2 className="font-display text-xl uppercase text-foreground">{m.name}</h2>
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mt-1">{m.role}</p>
                {m.bio && <p className="font-mono text-xs text-foreground/60 mt-4 leading-relaxed">{m.bio}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
