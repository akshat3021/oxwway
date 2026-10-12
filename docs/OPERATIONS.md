# Operations

## Environments

| | development | staging | production |
|---|---|---|---|
| `APP_ENV` | development | staging | production |
| Database | local Docker | own DB | own DB (never shared) |
| `APP_ORIGIN` | http://localhost:3000 | https://staging… | https://oxway.io |
| Seeding | `db:seed` | `db:seed` once | `db:seed` once (`SEED_ALLOW_PRODUCTION=true`) |

Secrets live only in the host's environment settings. `.env` is git-ignored.

## Releasing

1. CI (`.github/workflows/ci.yml`) must be green: lint, typecheck, migrations apply to a clean DB, **no schema drift**, tests, build, audit, E2E.
2. Apply migrations **before** deploying code: `DATABASE_URL=… npm run db:migrate`.
3. Deploy. 4. Run `npm run smoke -- <url>`.

**Zero-downtime migrations:** make every migration backward-compatible with the *previous* release (expand → deploy → contract): add columns/tables first; remove or rename only in a later release once no running code uses them.

**Rollback:** redeploy the previous build (Vercel → Promote previous). Because migrations are additive, the older build keeps working. Never edit an applied migration; add a new one.

## Health & monitoring

* `GET /api/health`: liveness (process is up). `GET /api/ready`: readiness (database reachable, 503 otherwise). Point uptime monitors/load balancers here.
* Logs are one JSON object per line with `requestId`, `method`, `path`, `status`, `durationMs`, `userId`. The same `requestId` is returned to clients in `x-request-id` and error bodies, so a user-reported id finds the exact log line.
* Error tracking: add the SDK (e.g. Sentry) in `src/instrumentation.ts`; unhandled errors are already funnelled through one function (`errorResponse`).

## Scheduled jobs

* `npm run db:prune`: daily (Vercel Cron, a GitHub Actions `schedule`, or system cron) with `DATABASE_URL` set.

## Backups & recovery

Enable point-in-time recovery on the managed PostgreSQL. Test a restore into a scratch database at least once. Content tables are soft-deleted, so most "oops" deletions are recoverable by clearing `deletedAt`.

## First admin & lost access

* First admin: `npm run db:seed` (does nothing once any user exists).
* **Every admin locked out / password lost**: from any shell that has the deployment's `DATABASE_URL`:
  `ADMIN_EMAIL=you@company.com NEW_PASSWORD='long passphrase' npm run admin:reset`
  This re-activates the account, restores the admin role, sets the password, revokes all sessions, clears the login lockout, and records an `admin_reset` audit entry. Protect shell/DB access accordingly: it is the break-glass path.
* A single locked user (not the last admin): another admin can reset their password under Admin → Users.

## Cost notes

Runs on small managed tiers: a serverless host plus one small PostgreSQL. Static public pages are served from the CDN; the database is only hit on revalidation and admin use. The pool size is capped (`DB_POOL_MAX`, default 5) to fit serverless connection limits.
