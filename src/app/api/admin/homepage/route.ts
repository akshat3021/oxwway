import { requireCapability } from "@/server/auth/guard";
import { readJson } from "@/server/http/body";
import { revalidatePublicSite } from "@/server/http/revalidate";
import { json } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { getSingletonDef, readSingleton, updateSingleton } from "@/server/services/singleton";

const def = getSingletonDef("homepage");

export const GET = authedRoute({}, async ({ user }) => {
  requireCapability(user, "content:read");
  return json(await readSingleton(def));
});

export const PUT = authedRoute({}, async ({ req, user, ip, requestId }) => {
  requireCapability(user, def.writeCapability);
  const input = await readJson(req, def.schema);
  const row = await updateSingleton(def, { actor: user, ip, requestId }, input);
  revalidatePublicSite();
  return json(row);
});
