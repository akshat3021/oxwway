import { requireCapability } from "@/server/auth/guard";
import { readJson } from "@/server/http/body";
import { parseId } from "@/server/http/params";
import { json, noContent } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { deleteMessage, setMessageRead } from "@/server/services/contact";
import { messageUpdate } from "@/server/validation/schemas";

type Params = { id: string };

export const PATCH = authedRoute<Params>({}, async ({ req, params, user, ip, requestId }) => {
  requireCapability(user, "messages:manage");
  const { read } = await readJson(req, messageUpdate);
  return json(await setMessageRead({ actor: user, ip, requestId }, parseId(params.id), read));
});

export const DELETE = authedRoute<Params>({}, async ({ params, user, ip, requestId }) => {
  requireCapability(user, "messages:manage");
  await deleteMessage({ actor: user, ip, requestId }, parseId(params.id));
  return noContent();
});
