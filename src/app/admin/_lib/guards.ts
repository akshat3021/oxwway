import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import type { SessionUser } from "@/server/auth/session";

/**
 * Server-side page guard. The panel layout already requires a session; admin
 * -only pages call this again so each page enforces its own rule instead of
 * relying on the layout (defence in depth, and safe if layouts are reorganised).
 */
export async function requirePage(role: "any" | "admin" = "any"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin");
  return user;
}
