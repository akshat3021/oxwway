/** Serialisable shapes shared between the server loader and client components. */
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
  scrollCue: string;
  accessLevel: string;
  ctaLabel: string;
  ctaLink: string;
}
