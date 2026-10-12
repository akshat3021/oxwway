import { z } from "zod";
import { requireCapability } from "@/server/auth/guard";
import { readJson } from "@/server/http/body";
import { notFound } from "@/server/http/errors";
import { json, noContent } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { eraseUser, updateUser } from "@/server/services/users";
import { userUpdate } from "@/server/validation/schemas";

type Params = { id: string };
const uuid = z.string().uuid();
const parseUserId = (raw: string): string => {
  const parsed = uuid.safeParse(raw);
  if (!parsed.success) throw notFound();
  return parsed.data;
};

export const PATCH = authedRoute<Params>({}, async ({ req, params, user, ip, requestId }) => {
  requireCapability(user, "users:manage");
  const input = await readJson(req, userUpdate);
  return json(await updateUser({ actor: user, ip, requestId }, parseUserId(params.id), input));
});

export const DELETE = authedRoute<Params>({}, async ({ params, user, ip, requestId }) => {
  requireCapability(user, "users:manage");
  await eraseUser({ actor: user, ip, requestId }, parseUserId(params.id));
  return noContent();
});
