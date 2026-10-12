import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/PublicPage";
import { SafeMarkdown } from "@/components/SafeMarkdown";
import { formatDate } from "@/server/services/landing";
import { getPublishedPost } from "@/server/services/public";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublishedPost((await params).slug);
  if (!p) return { title: "Post not found" };
  const description = p.seoDescription ?? p.excerpt ?? undefined;
  return {
    title: p.seoTitle ?? p.title,
    description,
    openGraph: { title: p.seoTitle ?? p.title, description, type: "article", publishedTime: p.publishDate?.toISOString(), images: p.coverImage ? [p.coverImage] : undefined },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPublishedPost((await params).slug);
  if (!post) notFound();
  const date = post.publishDate ?? post.createdAt;

  return (
    <PageFrame>
      <article className="px-[5vw] pb-24 max-w-3xl">
        <Link href="/blog" className="font-mono text-[10px] uppercase tracking-widest text-accent hover:opacity-80">← All dispatches</Link>
        <header className="mt-6 mb-10">
          <div className="flex flex-wrap gap-x-4 font-mono text-[10px] uppercase tracking-widest mb-4">
            {post.tags.map((t) => <span key={t} className="text-accent">{t}</span>)}
            <time dateTime={date.toISOString()} className="text-foreground/40">{formatDate(date)}</time>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl uppercase text-foreground leading-[0.95]">{post.title}</h1>
        </header>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" decoding="async" className="w-full aspect-[16/9] object-cover border border-foreground/10 mb-10" />
        )}
        {post.body ? <SafeMarkdown source={post.body} /> : <p className="font-mono text-xs text-foreground/50">No content yet.</p>}
      </article>
    </PageFrame>
  );
}
