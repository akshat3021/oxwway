# Architecture & decisions

## Request flow

```
Browser ──► Next.js ──► route handler ──► route() wrapper ──► service ──► Prisma ──► PostgreSQL
                         (thin)            request id · CSRF    business     (single
                                           rate limit · authN   rules +      client)
                                           authZ · error map ·  audit
                                           access log
```

* **Public pages** are Server Components reading through `server/services/public.ts` (published, non-deleted rows only; no writes). They are statically generated and revalidated every 60 s; every admin write also calls `revalidatePath("/", "layout")` so edits go live immediately.
* **Admin pages** are dynamic and guarded in two places: `proxy.ts` (cheap redirect, UX only) and `(panel)/layout.tsx` + each page (real session check against the database).
* **Mutations** go through `server/http/route.ts`, so no endpoint can forget authentication, the CSRF origin check, validation, error mapping or logging.

## Data model

See `prisma/schema.prisma` (comments explain each model). Key choices:

* **Soft delete** (`deletedAt`) on content; every read path filters it in one place. Slugs of deleted rows are suffixed so URLs can be reused.
* **Audit log is append-only with no foreign keys to content**, so history outlives the content it describes. It records *which fields* changed, never their values.
* **Singletons** (homepage, company, settings) are single rows read via lowest-id, so a creation race can never produce ambiguity.
* **Indexes** match the actual query shapes (status + deletedAt + publishDate, displayOrder lists, audit by time/actor/entity, login attempts by email/ip + time).

## Decisions & trade-offs

| Decision | Why | Cost / alternative |
|---|---|---|
| Own session auth (opaque token, hash stored) instead of JWT or a hosted provider | Instant revocation (logout, deactivation, password change) and no third-party dependency | We own the code; mitigated by tests. Swap for an IdP/SSO later by replacing `server/auth`. |
| Generic content CRUD driven by a registry | Five resources share identical rules; one tested implementation | A narrow `Delegate` cast in `content.ts` (documented). If resources diverge a lot, split them. |
| Offset pagination | Simple, fine at this scale | Use keyset pagination if tables reach 100k+ rows. |
| ISR (60 s) + on-demand revalidation | Fast static pages, instant edits | Multiple server instances each revalidate their own cache; on Vercel this is handled by the platform. |
| Public data functions throw on DB errors | With ISR a failed refresh keeps serving the last good page instead of caching an empty one | A build with an unreachable/unmigrated database fails loudly (intended). |
| Images are referenced by https URL, not uploaded | No file-storage service chosen yet; avoids upload attack surface | Add object storage (S3/R2/Supabase Storage) behind a signed-upload endpoint when needed. |
| `<img>` instead of `next/image` for CMS images | Image hosts are arbitrary, so `remotePatterns` can't be fixed in advance | No automatic resizing. Constrain hosts, then switch to `next/image`. |
| Markdown rendered through our own safe parser | No raw-HTML path exists, so stored XSS is impossible by construction | Limited syntax (headings, lists, links, code, quotes). |

## Extending

* **New content type**: Prisma model → migration → zod schema in `validation/schemas.ts` → entry in `RESOURCES` (`services/content.ts`) → entry in `admin/_lib/resources.ts` → public page using a function in `services/public.ts`.
* **Feature flags**: Admin → Settings, read with `await getFlag("name")` (`server/services/flags.ts`).
* **Analytics / monitoring**: the CSP (`next.config.ts`) is the single place that controls which third-party hosts may load; `logger` output is structured JSON, and `instrumentation.ts` is the hook for an error tracker (e.g. Sentry). Add the SDK there and the host to the CSP.
