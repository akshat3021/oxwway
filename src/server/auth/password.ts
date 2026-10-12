import "server-only";
import { hash, verify } from "@node-rs/argon2";

/**
 * Password hashing with argon2id (OWASP first choice), minimum OWASP profile:
 * m=19 MiB, t=2, p=1. Each hash embeds its salt and parameters, so parameters
 * can be raised later without a migration (old hashes keep verifying).
 */
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string): Promise<string> => hash(password, OPTIONS);

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false; // malformed hash: treat as mismatch, never throw to the caller
  }
}

let dummyHash: Promise<string> | undefined;

/**
 * Burn the same CPU time as a real verification. Used when the account does
 * not exist so response timing does not reveal which emails are registered.
 */
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummyHash ??= hashPassword("oxway-timing-equalisation-placeholder");
  await verifyPassword(await dummyHash, password);
}

const COMMON = new Set([
  "password1234", "passwordpassword", "123456789012", "1234567890123",
  "qwertyuiop12", "qwertyuiopasdf", "administrator", "adminadminadmin",
  "letmeinletmein", "iloveyou1234", "welcome12345", "changeme1234", "oxwayoxway12",
]);

/**
 * Length-first policy (NIST SP 800-63B): long passphrases beat arbitrary
 * composition rules. Returns a list of problems; empty means acceptable.
 */
export function passwordProblems(password: string, context: { email?: string } = {}): string[] {
  const problems: string[] = [];
  if (password.length < 12) problems.push("Must be at least 12 characters");
  if (password.length > 128) problems.push("Must be at most 128 characters");
  if (/^(.)\1+$/.test(password)) problems.push("Must not be a single repeated character");
  if (COMMON.has(password.toLowerCase())) problems.push("Is too common");
  const local = context.email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) {
    problems.push("Must not contain your email name");
  }
  return problems;
}
