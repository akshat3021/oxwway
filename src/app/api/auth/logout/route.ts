import { buildClearedSessionCookie, readSessionToken } from "@/server/auth/cookie";
import { revokeSessionByToken } from "@/server/auth/session";
import { noContent } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";
import { prisma } from "@/server/db/prisma";
import { writeAudit } from "@/server/services/audit";

export const POST = authedRoute({}, async ({ req, user, ip, requestId }) => {
  const token = readSessionToken(req.headers.get("cookie"));
  if (token) await revokeSessionByToken(token);
  await writeAudit(prisma, { actor: user, action: "logout", entity: "Session", ip, requestId });
  return noContent({ "Set-Cookie": buildClearedSessionCookie() });
});
