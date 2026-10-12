import { z } from "zod";
import { requireCapability } from "@/server/auth/guard";
import { readJson } from "@/server/http/body";
import { notFound } from "@/server/http/errors";
import { noContent } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { resetUserPassword } from "@/server/services/users";
import { resetPassword } from "@/server/validation/schemas";

export const POST = authedRoute<{ id: string }>({}, async ({ req, params, user, ip, requestId }) => {
  requireCapability(user, "users:manage");
  const id = z.string().uuid().safeParse(params.id);
  if (!id.success) throw notFound();
  const { newPassword } = await readJson(req, resetPassword);
  await resetUserPassword({ actor: user, ip, requestId }, id.data, newPassword);
  return noContent();
});
