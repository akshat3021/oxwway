import { requireCapability } from "@/server/auth/guard";
import { readJson } from "@/server/http/body";
import { json } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { createUser, listUsers } from "@/server/services/users";
import { listQuerySchema } from "@/server/validation/common";
import { userCreate } from "@/server/validation/schemas";

export const GET = authedRoute({}, async ({ req, user }) => {
  requireCapability(user, "users:manage");
  const query = listQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const { rows, meta } = await listUsers(query);
  return json(rows, { meta });
});

export const POST = authedRoute({}, async ({ req, user, ip, requestId }) => {
  requireCapability(user, "users:manage");
  const input = await readJson(req, userCreate);
  return json(await createUser({ actor: user, ip, requestId }, input), { status: 201 });
});
