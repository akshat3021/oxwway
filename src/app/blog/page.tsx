import type { Metadata } from "next";
import Link from "next/link";
import { card, EmptyNote, PageFrame, PageHeader } from "@/components/PublicPage";
import { formatDate } from "@/server/services/landing";
import { listPublishedPosts } from "@/server/services/public";

export const metadata: Metadata = { title: "Blog", description: "Engineering dispatches and news." };

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const raw = Number((await searchParams).page);
  const page = Number.isInteger(raw) && raw >= 1 && raw <= 1000 ? raw : 1;
  const { rows, totalPages } = await listPublishedPosts({ page, pageSize: 9 });

  return (
    <PageFrame>
      <PageHeader tag="TECHNICAL LOGS // DISPATCHES" title="Engineering" accent="Dispatches" />
      {rows.length === 0 ? (
        <EmptyNote title={page > 1 ? "No more posts." : "No posts published yet."} hint={page > 1 ? undefined : "Check back soon."} />
      ) : (
        <section className="px-[5vw] pb-24">
          <ul className="max-w-5xl flex flex-col gap-4">
            {rows.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.slug}`} className={`${card} group block p-6 md:p-8 focus-visible:outline focus-visible:outline-accent`}>
                  <div className="flex flex-wrap items-center gap-x-4 font-mono text-[10px] uppercase tracking-widest mb-3">
                    <span className="text-accent">{(p.tags[0] ?? "NEWS").toUpperCase()}</span>
                    <time dateTime={(p.publishDate ?? p.createdAt).toISOString()} className="text-foreground/40">{formatDate(p.publishDate ?? p.createdAt)}</time>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl uppercase text-foreground group-hover:text-accent transition-colors mb-3">{p.title}</h2>
                  {p.excerpt && <p className="font-mono text-xs text-foreground/60 leading-relaxed max-w-3xl">{p.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <nav aria-label="Pagination" className="max-w-5xl flex justify-between mt-8 font-mono text-xs uppercase tracking-widest">
              {page > 1 ? <Link className="text-accent" href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}>← Newer</Link> : <span />}
              {page < totalPages && <Link className="text-accent" href={`/blog?page=${page + 1}`}>Older →</Link>}
            </nav>
          )}
        </section>
      )}
    </PageFrame>
  );
}
