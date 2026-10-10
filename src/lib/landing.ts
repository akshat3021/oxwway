import { prisma } from "@/lib/prisma";

export interface LandingTeamMember {
  id: number;
  name: string;
  role: string;
  initials: string;
  photoRef: string | null;
}

export interface LandingPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
}

export interface LandingHero {
  headline: string;
  subheadline: string;
  description: string;
  statusLabel: string;
  accessLevel: string;
  ctaLabel: string;
  ctaLink: string;
}

export const HERO_DEFAULTS: LandingHero = {
  headline: "OXWAY",
  subheadline: "CORE",
  description: "Engineered for absolute capability.",
  statusLabel: "SYSTEM STATUS",
  accessLevel: "Alpha",
  ctaLabel: "Explore Products",
  ctaLink: "/products",
};

function initialsOf(name: string): string {
  const parts = name.replace(/^(dr|mr|ms|mrs|prof)\.?\s+/i, "").split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/**
 * Everything the landing page needs, read straight from the database on the
 * server. Any failure (e.g. database unreachable) degrades to defaults and
 * empty lists, so the page itself always renders.
 */
export async function getLandingData(): Promise<{
  hero: LandingHero;
  team: LandingTeamMember[];
  posts: LandingPost[];
}> {
  try {
    const [home, team, posts] = await Promise.all([
      prisma.homepageContent.findFirst(),
      prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" }, take: 4 }),
      prisma.blogPost.findMany({
        where: { status: "published" },
        orderBy: [{ publishDate: "desc" }, { id: "desc" }],
        take: 3,
      }),
    ]);

    return {
      hero: {
        headline: home?.heroHeadline || HERO_DEFAULTS.headline,
        subheadline: home?.heroSubheadline || HERO_DEFAULTS.subheadline,
        description: home?.heroDescription || HERO_DEFAULTS.description,
        statusLabel: home?.systemStatusLabel || HERO_DEFAULTS.statusLabel,
        accessLevel: home?.accessLevelReadout || HERO_DEFAULTS.accessLevel,
        ctaLabel: home?.ctaLabel || HERO_DEFAULTS.ctaLabel,
        ctaLink: home?.ctaLink || HERO_DEFAULTS.ctaLink,
      },
      team: team.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        initials: initialsOf(m.name),
        photoRef: m.photoRef,
      })),
      posts: posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt ?? "",
        tag: (p.tags[0] ?? "NEWS").toUpperCase(),
        date: formatDate(p.publishDate ?? p.createdAt),
      })),
    };
  } catch {
    return { hero: HERO_DEFAULTS, team: [], posts: [] };
  }
}
