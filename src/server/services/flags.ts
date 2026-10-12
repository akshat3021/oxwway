import "server-only";
import { getSiteSettings } from "./public";

/**
 * Feature flags, editable by admins under Admin → Settings.
 *
 *   if (await getFlag("newCheckout")) { ... }
 *
 * Unknown or malformed flags return `fallback` (default false), so shipping
 * code that references a flag before it exists is always safe. For a real
 * rollout system (percentages, targeting) swap this module for a provider such
 * as GrowthBook/LaunchDarkly; callers do not change.
 */
export async function getFlag(name: string, fallback = false): Promise<boolean> {
  const flags = (await getSiteSettings())?.flags;
  if (flags && typeof flags === "object" && !Array.isArray(flags)) {
    const value = (flags as Record<string, unknown>)[name];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}
