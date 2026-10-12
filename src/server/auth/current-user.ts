import "server-only";
import { cookies } from "next/headers";
import { sessionCookieName } from "./cookie";
import { getSessionUser, type SessionUser } from "./session";

/** For Server Components / layouts: the signed-in user or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;
  return token ? getSessionUser(token) : null;
}
