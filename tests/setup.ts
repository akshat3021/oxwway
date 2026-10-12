import { vi } from "vitest";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://oxway:oxway_dev_pw@127.0.0.1:5432/oxway_test";
process.env.LOG_LEVEL = "silent";
process.env.TRUST_PROXY = "true";
process.env.LOGIN_MAX_FAILURES = "5";
process.env.LOGIN_LOCKOUT_MINUTES = "15";

// revalidatePath only works inside a Next.js request; record calls instead.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
