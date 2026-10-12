import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** 256 bits of CSPRNG entropy, URL/cookie safe. */
export const generateToken = (): string => randomBytes(32).toString("base64url");

/** Only the hash is stored; the raw token lives solely in the user's cookie. */
export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");
