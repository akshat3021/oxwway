import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/server/auth/current-user";
import { AdminShell } from "../_components/AdminShell";

/**
 * The real admin gate: validates the session against the database on every
 * request. Everything under (panel) is unreachable without a live session.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return <AdminShell user={{ email: user.email, name: user.name, role: user.role }}>{children}</AdminShell>;
}
