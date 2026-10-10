/**
 * Single source of truth for site navigation.
 * Used by the top bar (HUD), the radial navigator and anywhere else
 * that needs the list of primary pages.
 */
export interface NavItem {
  label: string;
  href: string;
  code: string;
  desc: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "/about", code: "NAV.01", desc: "Entity story & build log" },
  { label: "Vision", href: "/vision", code: "NAV.02", desc: "Core philosophy & tenets" },
  { label: "Products", href: "/products", code: "NAV.03", desc: "Robotic platforms catalog" },
  { label: "Gallery", href: "/gallery", code: "NAV.04", desc: "Telemetry & media archive" },
  { label: "Blog", href: "/blog", code: "NAV.05", desc: "Engineering dispatches" },
  { label: "Team", href: "/team", code: "NAV.06", desc: "Engineering faculty & builders" },
  { label: "Contact", href: "/contact", code: "NAV.07", desc: "Initiate direct link" },
];
