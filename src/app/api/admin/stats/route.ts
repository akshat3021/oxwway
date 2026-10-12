import { requireCapability } from "@/server/auth/guard";
import { json } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { dashboardStats } from "@/server/services/reports";

export const GET = authedRoute({}, async ({ user }) => {
  requireCapability(user, "content:read");
  return json(await dashboardStats());
});
