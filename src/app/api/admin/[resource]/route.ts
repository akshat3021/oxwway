import { requireCapability } from "@/server/auth/guard";
import { readJson } from "@/server/http/body";
import { revalidatePublicSite } from "@/server/http/revalidate";
import { json } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { createResource, getResource, listResource } from "@/server/services/content";
import { listQuerySchema } from "@/server/validation/common";

type Params = { resource: string };

export const GET = authedRoute<Params>({}, async ({ req, params, user }) => {
  requireCapability(user, "content:read");
  const def = getResource(params.resource);
  const query = listQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const { rows, meta } = await listResource(def, query);
  return json(rows, { meta });
});

export const POST = authedRoute<Params>({}, async ({ req, params, user, ip, requestId }) => {
  requireCapability(user, "content:write");
  const def = getResource(params.resource);
  const input = await readJson(req, def.createSchema);
  const row = await createResource(def, { actor: user, ip, requestId }, input);
  revalidatePublicSite();
  return json(row, { status: 201 });
});
