import { readJson } from "@/server/http/body";
import { noContent } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { changeOwnPassword } from "@/server/services/users";
import { changeOwnPassword as schema } from "@/server/validation/schemas";

export const POST = authedRoute({}, async ({ req, user, ip, requestId }) => {
  const { currentPassword, newPassword } = await readJson(req, schema);
  await changeOwnPassword({ actor: user, ip, requestId }, currentPassword, newPassword);
  return noContent();
});
