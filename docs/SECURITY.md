# Security

## Controls in place

| Threat | Control | Where / how verified |
|---|---|---|
| Password theft from a DB leak | argon2id (OWASP params), per-hash salt; hashes never leave the server | `server/auth/password.ts`; unit tests |
| Session theft/forgery | 256-bit random token; **only its SHA-256 is stored**; `HttpOnly`, `SameSite=Lax`, `Secure` + `__Host-` prefix in production; idle + absolute expiry; server-side revocation | `auth/session.ts`, `cookie.ts`; integration tests |
| Brute force / credential stuffing | DB-backed lockout per account (default 5 fails / 15 min) and per-IP ceiling; identical response for unknown user vs wrong password; dummy hash to equalise timing | `auth/login.ts`; tests incl. unknown-email lockout |
| CSRF | `SameSite=Lax` **plus** Origin/Fetch-Metadata check on every state-changing request (including login) | `http/origin.ts`; tests |
| Broken access control | Capability matrix (`auth/permissions.ts`), checked server-side per request; editors cannot publish, delete, or touch settings/users/audit/messages | integration + smoke tests |
| Mass assignment | Every request schema is `.strict()`; client cannot set `id`, `deletedAt`, `passwordHash`, … | tests |
| Injection (SQL) | Prisma parameterised queries only; no raw SQL with user input (`$queryRaw` is used only for `SELECT 1`) | code review + search-term test |
| Stored XSS | React escaping; Markdown through a data-tree renderer with **no raw-HTML path**; URLs restricted to https/mailto/site paths; contact messages rendered as text | unit + smoke tests |
| Clickjacking / sniffing / downgrade | CSP `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, HSTS, strict referrer policy, COOP | `next.config.ts`; smoke test |
| Info leakage | Uniform error contract; unexpected errors return a generic 500 with a request id, details only in logs; secrets are redacted from logs | tests |
| Abuse of public form | Honeypot + per-IP rate limit (in-memory) + size/type limits | tests |
| Unsafe config | Environment validated at boot (fails fast); secrets only via env | `config/env.ts`, `instrumentation.ts` |
| Supply chain | CI blocks on any **critical** advisory in production deps; weekly Dependabot PRs; lockfile committed; exact-pinned `next` | `.github/workflows/ci.yml`, `dependabot.yml` |
| Admin discoverability | `/admin` is `noindex`, disallowed in robots.txt, never linked from the public site | smoke test |

## Known gaps and trade-offs (read these)

1. **No two-factor authentication yet.** Strongly recommended for admins before launch (TOTP). Not implemented.
2. **CSP allows `'unsafe-inline'` scripts** (Next.js bootstrap + theme script). A nonce-based CSP would forbid it but forces fully dynamic rendering. Other directives are strict.
3. **Contact-form rate limiting is per server instance** (in memory). Login throttling is global (database). Use Redis/Upstash if the form is abused.
4. **No password-breach (HIBP) check, no self-service "forgot password".** Admins reset passwords for users; there is no email service configured.
5. **`SameSite=Lax`, not `Strict`**, so links from other sites keep you signed in. CSRF is covered by the Origin check.
6. **Audit log is not tamper-evident.** A database administrator can alter it. Ship logs to an external store if that matters.
7. **No malware scanning / uploads**: media is URL-based by design.
8. **Per-account lockout can be abused to temporarily lock a known email** (5 failures / 15 min). Accepted for a small admin team; all attempts are audited.
9. **Not penetration-tested.** Automated tests are not a substitute. Commission a review before handling sensitive data.

## Dependency audit status (reviewed 2026-10-11)

Next.js was upgraded 16.2.10 → 16.4.0 because the former sat in a range with critical advisories (including ISR cache poisoning and `next/og` issues). `npm audit` still reports high/moderate findings, all in **build/migration/lint tooling that does not run in the deployed site**:

| Package | Pulled in by | Why accepted |
|---|---|---|
| `deepmerge-ts` (stack exhaustion) | Prisma CLI config loader | Only merges our own config file at build/migrate time |
| `find-my-way`, `valibot`, `mysql2` | `prisma dev` local server | Feature unused; we use PostgreSQL, not MySQL |
| `baseline-browser-mapping`, `fast-glob` | ESLint / Next build tooling | Dev/build time only |

The only available "fix" is a *downgrade* to Prisma 6 or a Prisma 8 **release candidate**; neither is appropriate for production. Revisit when Prisma 8 is stable. Run `npm audit` after each dependency update.

## Reporting a vulnerability

Email the maintainers privately; do not open a public issue.
