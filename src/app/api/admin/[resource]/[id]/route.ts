import { requireCapability } from "@/server/auth/guard";
import { readJson } from "@/server/http/body";
import { parseId } from "@/server/http/params";
import { revalidatePublicSite } from "@/server/http/revalidate";
import { json, noContent } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { deleteResource, getOne, getResource, updateResource } from "@/server/services/content";

type Params = { resource: string; id: string };

export const GET = authedRoute<Params>({}, async ({ params, user }) => {
  requireCapability(user, "content:read");
  return json(await getOne(getResource(params.resource), parseId(params.id)));
});

export const PATCH = authedRoute<Params>({}, async ({ req, params, user, ip, requestId }) => {
  requireCapability(user, "content:write");
  const def = getResource(params.resource);
  const input = await readJson(req, def.updateSchema);
  const row = await updateResource(def, { actor: user, ip, requestId }, parseId(params.id), input);
  revalidatePublicSite();
  return json(row);
});

export const DELETE = authedRoute<Params>({}, async ({ params, user, ip, requestId }) => {
  requireCapability(user, "content:delete");
  const def = getResource(params.resource);
  await deleteResource(def, { actor: user, ip, requestId }, parseId(params.id));
  revalidatePublicSite();
  return noContent();
});
