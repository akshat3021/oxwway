import type { Role } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";

export const TEST_PASSWORD = "correct-horse-battery-staple";

export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE "AuditLog","Session","LoginAttempt","User","HomepageContent","CompanyInfo","SiteSettings",
     "Product","GalleryItem","BlogPost","TeamMember","JobListing","ContactMessage" RESTART IDENTITY CASCADE`,
  );
}

let counter = 0;
export async function makeUser(role: Role, overrides: Partial<{ email: string; isActive: boolean; name: string }> = {}) {
  counter += 1;
  const email = overrides.email ?? `${role}${counter}@oxway.test`;
  const user = await prisma.user.create({
    data: {
      email,
      name: overrides.name ?? `Test ${role} ${counter}`,
      role,
      isActive: overrides.isActive ?? true,
      passwordHash: await hashPassword(TEST_PASSWORD),
    },
  });
  return user;
}

interface ReqOptions {
  json?: unknown;
  cookie?: string;
  headers?: Record<string, string>;
  /** Pass null to send no Origin header at all. */
  origin?: string | null;
  query?: string;
}

export function makeRequest(method: string, path: string, opts: ReqOptions = {}): Request {
  const headers = new Headers({ host: "localhost", ...opts.headers });
  if (opts.origin !== null) headers.set("origin", opts.origin ?? "http://localhost");
  if (opts.cookie) headers.set("cookie", opts.cookie);
  let body: string | undefined;
  if (opts.json !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(opts.json);
  }
  return new Request(`http://localhost${path}${opts.query ?? ""}`, { method, headers, body });
}

export const seg = <P>(params: P) => ({ params: Promise.resolve(params) });

/** Log in through the real login route and return a ready-to-send Cookie header. */
export async function loginCookie(email: string, password = TEST_PASSWORD): Promise<string> {
  const { POST } = await import("@/app/api/auth/login/route");
  const res = await POST(makeRequest("POST", "/api/auth/login", { json: { email, password } }));
  if (res.status !== 200) throw new Error(`login failed in test helper: ${res.status}`);
  const setCookie = res.headers.get("set-cookie") ?? "";
  return setCookie.split(";")[0];
}

export async function bodyOf<T = unknown>(res: Response): Promise<T> {
  return (await res.json()) as T;
}
