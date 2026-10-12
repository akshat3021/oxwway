import { describe, expect, it } from "vitest";
import { hashPassword, passwordProblems, verifyPassword } from "@/server/auth/password";

describe("password hashing", () => {
  it("produces an argon2id hash that verifies, and rejects a wrong password", async () => {
    const hash = await hashPassword("a-long-enough-passphrase");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword(hash, "a-long-enough-passphrase")).toBe(true);
    expect(await verifyPassword(hash, "a-long-enough-passphrasX")).toBe(false);
  });

  it("salts: the same password hashes differently each time", async () => {
    expect(await hashPassword("same-password-123")).not.toBe(await hashPassword("same-password-123"));
  });

  it("treats a malformed stored hash as a mismatch instead of throwing", async () => {
    expect(await verifyPassword("not-a-hash", "anything")).toBe(false);
    expect(await verifyPassword("!", "anything")).toBe(false);
  });
});

describe("password policy", () => {
  it("accepts a long passphrase", () => {
    expect(passwordProblems("correct horse battery staple")).toEqual([]);
  });
  it.each([
    ["short", "Must be at least 12 characters"],
    ["aaaaaaaaaaaaaaaa", "Must not be a single repeated character"],
    ["password1234", "Is too common"],
  ])("rejects %s", (pw, message) => {
    expect(passwordProblems(pw)).toContain(message);
  });
  it("rejects passwords containing the email name", () => {
    expect(passwordProblems("xx-alexander-xx", { email: "alexander@oxway.io" })).toContain(
      "Must not contain your email name",
    );
  });
  it("rejects absurdly long passwords (hashing DoS guard)", () => {
    expect(passwordProblems("x".repeat(500) + "y")).toContain("Must be at most 128 characters");
  });
});
