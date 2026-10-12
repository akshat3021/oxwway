import type { Metadata } from "next";
import Link from "next/link";
import { card, EmptyNote, PageFrame, PageHeader } from "@/components/PublicPage";
import { listPublishedProducts } from "@/server/services/public";

export const revalidate = 60;
export const metadata: Metadata = { title: "Products", description: "Our robotic platforms." };

export default async function ProductsPage() {
  const products = await listPublishedProducts();
  return (
    <PageFrame>
      <PageHeader tag="PLATFORMS // CATALOG" title="Robotic" accent="Platforms" />
      {products.length === 0 ? (
        <EmptyNote title="No products published yet." hint="Check back soon." />
      ) : (
        <section className="px-[5vw] pb-24">
          <ul className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className={`${card} group flex flex-col h-full p-6 focus-visible:outline focus-visible:outline-accent`}>
                  {p.mediaRefs[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.mediaRefs[0]} alt="" loading="lazy" decoding="async" className="w-full aspect-[4/3] object-cover mb-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                  )}
                  <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">[ PLATFORM.{String(i + 1).padStart(2, "0")} ]</div>
                  <h2 className="font-display text-2xl uppercase text-foreground mb-2">{p.name}</h2>
                  {p.tagline && <p className="font-mono text-xs text-foreground/60 uppercase leading-relaxed">{p.tagline}</p>}
                  <span className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-widest text-accent">View specifications →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
