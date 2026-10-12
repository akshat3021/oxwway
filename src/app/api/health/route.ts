import { publicRoute } from "@/server/http/route";
import { json } from "@/server/http/response";

/** Liveness: the process is up and serving. Does not touch dependencies. */
export const GET = publicRoute({}, async () =>
  json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) }),
);
