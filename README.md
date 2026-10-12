# OXWAY

Marketing website and content-management admin for OXWAY, built with Next.js (App Router), PostgreSQL and Prisma.

| Area | What it is |
|---|---|
| **Public site** | Server-rendered pages (home, about, vision, products, gallery, blog, team, careers, contact). Static + refreshed every 60 s and instantly after any admin edit. |
| **Admin** (`/admin`) | Session-authenticated CMS for non-technical staff: edit homepage text, manage blog/products/team/careers/gallery, read contact messages, manage users, view the audit log. |
| **API** (`/api/*`) | Thin route handlers over a service layer. One error/response contract. |

## Quick start (local)

Requirements: **Node 22+**, **Docker** (for PostgreSQL), npm.

```bash
cp .env.example .env              # then set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (12+ chars)
docker compose up -d              # PostgreSQL on 127.0.0.1:5432
npm ci
npm run db:migrate                # apply migrations
npm run db:seed                   # create the first administrator (safe to re-run)
npm run dev                       # http://localhost:3000  ·  admin at /admin
```

After seeding, remove `SEED_ADMIN_PASSWORD` from `.env`.

## Everyday commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run lint` · `npm run typecheck` | Static checks |
| `npm test` | Unit + integration tests (needs the dev PostgreSQL; uses `TEST_DATABASE_URL` or `oxway_test`) |
| `npm run e2e` | Playwright browser tests (needs a built app + seeded admin, see CI) |
| `npm run build` · `npm start` | Production build / server |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run db:migrate:dev` | Create a new migration while developing |
| `npm run db:prune` | Data-retention job (run daily) |
| `npm run admin:reset` | Break-glass admin password recovery (see docs/OPERATIONS.md) |
| `npm run smoke -- <url>` | Post-deploy smoke test against a running server |

Create the test database once: `createdb oxway_test` (or point `TEST_DATABASE_URL` at any empty database), then run `npm run db:migrate` against it by temporarily setting `DATABASE_URL`.

## Project layout

```
prisma/                 schema.prisma + SQL migrations (source of truth for the data model)
src/
  app/                  Routes. Public pages = Server Components. Thin route handlers.
    admin/              Admin UI. (auth)/login, (panel)/… guarded by a server-side session check.
      _components/ _lib/   Admin-only code (lint blocks importing public components, and vice-versa)
    api/                auth, admin/*, public/contact, health, ready
  components/           Public-site UI
  lib/                  Client-safe helpers (nav list, markdown parser, shared types)
  server/               ALL server-only code (enforced by `server-only`)
    config/             validated environment
    db/                 the single Prisma client
    auth/               password hashing, sessions, cookies, permissions, login/lockout
    http/               route wrapper (auth, CSRF, rate limit, errors, logging), response contract
    services/           business rules: content CRUD, users, contact, audit, public reads, flags
    validation/         strict zod request schemas
scripts/                seed, prune, smoke
tests/                  unit/, integration/ (real PostgreSQL), e2e/ (Playwright)
docs/                   ARCHITECTURE, SECURITY, PRIVACY, OPERATIONS
```

**Rule of thumb:** routes call services; only services touch the database; only `src/server` may import `@/server/db`. Adding a content type = a Prisma model + a zod schema + one entry in `server/services/content.ts` + one entry in `app/admin/_lib/resources.ts`.

## Deploying (Vercel + managed PostgreSQL)

1. Create a PostgreSQL database per environment (e.g. Neon, Supabase, RDS).
2. In Vercel → Settings → Environment Variables set `DATABASE_URL`, `APP_ORIGIN` (e.g. `https://oxway.io`), `APP_ENV` (`staging`/`production`). Optional: see `.env.example`.
3. From a trusted machine/CI with that `DATABASE_URL`: `npm run db:migrate`, then `npm run db:seed` (once, with `SEED_ADMIN_*`).
4. Deploy. Verify with `SMOKE_ADMIN_EMAIL=… SMOKE_ADMIN_PASSWORD=… npm run smoke -- https://your-domain`.
5. Schedule `npm run db:prune` daily. See [docs/OPERATIONS.md](docs/OPERATIONS.md).

Do **not** use GitHub Pages: it only hosts static files, and this app needs a server (database, API, admin).

## Further reading

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): design decisions and trade-offs
- [docs/SECURITY.md](docs/SECURITY.md): controls, threat notes, known gaps
- [docs/PRIVACY.md](docs/PRIVACY.md): personal data inventory, retention, erasure
- [docs/OPERATIONS.md](docs/OPERATIONS.md): environments, migrations, backups, monitoring, rollback
