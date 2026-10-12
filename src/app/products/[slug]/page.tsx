import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/PublicPage";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { getPublishedProduct } from "@/server/services/public";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublishedProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  return { title: p.name, description: p.tagline ?? undefined, openGraph: { title: p.name, description: p.tagline ?? undefined, images: p.mediaRefs[0] ? [p.mediaRefs[0]] : undefined } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getPublishedProduct((await params).slug);
  if (!product) notFound();
  const specs = product.specs && typeof product.specs === "object" && !Array.isArray(product.specs) ? Object.entries(product.specs as Record<string, unknown>) : [];

  return (
    <PageFrame>
      <article className="px-[5vw] pb-24 max-w-6xl">
        <Link href="/products" className="font-mono text-[10px] uppercase tracking-widest text-accent hover:opacity-80">← All platforms</Link>
        <header className="mt-6 mb-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-4">{product.name}</h1>
          {product.tagline && <p className="font-mono text-sm text-foreground/70 uppercase max-w-2xl">{product.tagline}</p>}
        </header>

        {product.mediaRefs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {product.mediaRefs.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt={i === 0 ? product.name : ""} loading={i === 0 ? "eager" : "lazy"} decoding="async" className="w-full aspect-[4/3] object-cover border border-foreground/10" />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          <div>{product.description ? <SafeMarkdown source={product.description} /> : null}</div>
          {specs.length > 0 && (
            <aside aria-labelledby="specs-h">
              <h2 id="specs-h" className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">[ SPECIFICATIONS ]</h2>
              <dl className="border border-foreground/10 divide-y divide-foreground/10">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-4 py-3 font-mono text-xs">
                    <dt className="uppercase tracking-widest text-foreground/50">{k}</dt>
                    <dd className="text-foreground text-right">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </article>
    </PageFrame>
  );
}
