import { requireCapability } from "@/server/auth/guard";
import { json } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { listAudit } from "@/server/services/reports";
import { listQuerySchema } from "@/server/validation/common";

export const GET = authedRoute({}, async ({ req, user }) => {
  requireCapability(user, "audit:read");
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const query = listQuerySchema.parse(sp);
  const { rows, meta } = await listAudit({
    ...query,
    entity: typeof sp.entity === "string" ? sp.entity.slice(0, 40) : undefined,
    action: typeof sp.action === "string" ? sp.action.slice(0, 40) : undefined,
  });
  return json(rows, { meta });
});
