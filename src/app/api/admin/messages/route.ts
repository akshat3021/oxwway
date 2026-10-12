import { requireCapability } from "@/server/auth/guard";
import { json } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { listMessages } from "@/server/services/contact";
import { listQuerySchema } from "@/server/validation/common";

export const GET = authedRoute({}, async ({ req, user }) => {
  requireCapability(user, "messages:manage");
  const query = listQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const { rows, meta } = await listMessages(query);
  return json(rows, { meta });
});
