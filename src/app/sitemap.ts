import type { MetadataRoute } from "next";
import { NAV_ITEMS } from "@/lib/nav";
import { listPublishedPosts, listPublishedProducts } from "@/server/services/public";

export const revalidate = 3600;
const origin = () => (process.env.APP_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, products] = await Promise.all([listPublishedPosts({ pageSize: 50 }), listPublishedProducts()]);
  const base = origin();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...NAV_ITEMS.map((n) => ({ url: `${base}${n.href}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    { url: `${base}/careers`, changeFrequency: "weekly", priority: 0.5 },
    ...posts.rows.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.publishDate ?? p.createdAt, priority: 0.6 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
  ];
}
