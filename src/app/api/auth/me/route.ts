import { json } from "@/server/http/response";
import { authedRoute } from "@/server/http/route";

export const GET = authedRoute({}, async ({ user }) =>
  json({ id: user.id, email: user.email, name: user.name, role: user.role }),
);
