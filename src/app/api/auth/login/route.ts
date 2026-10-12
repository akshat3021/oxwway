import { login } from "@/server/auth/login";
import { buildSessionCookie } from "@/server/auth/cookie";
import { readJson } from "@/server/http/body";
import { json } from "@/server/http/response";
import { publicRoute } from "@/server/http/route";
import { loginSchema } from "@/server/validation/schemas";

export const POST = publicRoute({}, async ({ req, ip, requestId }) => {
  const input = await readJson(req, loginSchema);
  const result = await login({
    ...input,
    ip,
    userAgent: req.headers.get("user-agent"),
    requestId,
  });
  return json(result.user, {
    headers: { "Set-Cookie": buildSessionCookie(result.token, result.maxAgeSeconds) },
  });
});
