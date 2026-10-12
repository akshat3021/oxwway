import { readJson } from "@/server/http/body";
import { json } from "@/server/http/response";
import { publicRoute } from "@/server/http/route";
import { submitContact } from "@/server/services/contact";
import { contactSubmit } from "@/server/validation/schemas";

// 5 submissions per IP per 10 minutes (per-instance; see http/rate-limit.ts).
export const POST = publicRoute(
  { rateLimit: { key: "contact", limit: 5, windowMs: 10 * 60_000 } },
  async ({ req }) => {
    const input = await readJson(req, contactSubmit);
    await submitContact(input);
    return json({ received: true }, { status: 202 });
  },
);
