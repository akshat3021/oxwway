import "server-only";
import type { LandingHero, LandingPost, LandingTeamMember } from "@/lib/landing-types";
import { getHomepage, getSiteSettings, listPublishedPosts, listTeam } from "./public";

export const HERO_DEFAULTS: LandingHero = {
  headline: "OXWAY",
  subheadline: "CORE",
  description: "Engineered for absolute capability.",
  statusLabel: "SYSTEM STATUS",
  scrollCue: "Scroll to explore",
  accessLevel: "Alpha",
  ctaLabel: "Explore Products",
  ctaLink: "/products",
};

export function initialsOf(name: string): string {
  const parts = name.replace(/^(dr|mr|ms|mrs|prof)\.?\s+/i, "").split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Everything the landing page needs, in one parallel round trip. */
export async function getLandingData(): Promise<{
  hero: LandingHero;
  team: LandingTeamMember[];
  posts: LandingPost[];
  showWatermark: boolean;
}> {
  const [home, settings, team, posts] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
    listTeam(4),
    listPublishedPosts({ pageSize: 3 }),
  ]);

  return {
    hero: {
      headline: home?.heroHeadline || HERO_DEFAULTS.headline,
      subheadline: home?.heroSubheadline || HERO_DEFAULTS.subheadline,
      description: home?.heroDescription || HERO_DEFAULTS.description,
      statusLabel: home?.systemStatusLabel || HERO_DEFAULTS.statusLabel,
      scrollCue: home?.scrollCueText || HERO_DEFAULTS.scrollCue,
      accessLevel: home?.accessLevelReadout || HERO_DEFAULTS.accessLevel,
      ctaLabel: home?.ctaLabel || HERO_DEFAULTS.ctaLabel,
      ctaLink: home?.ctaLink || HERO_DEFAULTS.ctaLink,
    },
    showWatermark: settings?.showBullWatermark ?? true,
    team: team.slice(0, 4).map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      initials: initialsOf(m.name),
      photoRef: m.photoRef,
    })),
    posts: posts.rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? "",
      tag: (p.tags[0] ?? "NEWS").toUpperCase(),
      date: formatDate(p.publishDate ?? p.createdAt),
    })),
  };
}
