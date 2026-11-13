---
last_mapped_commit: 16423a0ae31aefefda1072fc337aaa1115d819ab
last_mapped_at: 2026-11-13
---
# External Integrations

**Analysis Date:** 2026-11-13

## APIs & External Services

**Generative AI:**

- Google Gemini API - Generates diagram structures, flowcharts, architectures, mockups, and mindmaps.
  - SDK/Client: `@google/genai` (`GoogleGenAI` class)
  - Auth: `GEMINI_API_KEY`
  - Implementation: `app/api/ai/route.ts` specifies structured JSON response schemas (`lib/ai-tools.ts`) and inserts generated shapes into Excalidraw scenes (`lib/ai-canvas.ts`).
  - Model: Default `gemini-2.5-flash`, overridable via `GEMINI_MODEL` env variable.

## Data Storage

**Databases:**

- Neon Serverless PostgreSQL
  - Connection: `DATABASE_URL`
  - Client: `drizzle-orm/neon-http` with `@neondatabase/serverless` HTTP driver (`db/index.ts`).
  - Migrations / Schema: Managed by Drizzle Kit (`drizzle.config.ts`, `db/schema.ts`).
  - Tables: `users` (id, name, email, credit, timestamps) and `whiteboards` (id, user_id, title, elements, app_state, files, thumbnail, share_token, favorited, deleted_at, archived_at, timestamps).

**File Storage:**

- Database JSON & In-Memory Blobs: Board elements, app state, and files are stored directly as JSONB in PostgreSQL. Canvas thumbnails are stored as base64 data URLs in `whiteboards.thumbnail`. Exported images (PNG, SVG, PDF) are generated entirely client-side via browser `Blob` and `URL.createObjectURL` (`lib/export.ts`).

**Caching:**

- Module-level in-memory singleton cache for the Drizzle client (`cached` in `db/index.ts`). No external cache layer (Redis/Memcached) is configured.

## Authentication & Identity

**Auth Provider:**

- Clerk (`@clerk/nextjs`)
  - Implementation: `proxy.ts` implements Next.js 16 Clerk middleware `clerkMiddleware()`.
  - Server validation: `lib/user.ts` uses `auth()` and `currentUser()` from `@clerk/nextjs/server` to resolve `userId` and sync with the Postgres `users` table via `getDbUserOrUpsert()`.
  - Client UI: Pre-built Clerk authentication pages at `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`.

## Monitoring & Observability

**Error Tracking:**

- None detected. No external Sentry, Datadog, or OpenTelemetry SDK is configured.

**Logs:**

- Application-level `console.error` and `console.log` statements inside API route handlers (`app/api/ai/route.ts`, `app/api/boards/route.ts`).

## CI/CD & Deployment

**Hosting:**

- Targeted for Vercel or modern Node.js serverless platforms compatible with Next.js 16 App Router.

**CI Pipeline:**

- None configured in repository (no `.github/workflows` directory detected).

## Environment Configuration

**Required env vars:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk frontend publishable key.
- `CLERK_SECRET_KEY` - Clerk backend authentication secret.
- `DATABASE_URL` - Neon Postgres database connection URL.
- `GEMINI_API_KEY` - Google AI Gemini API access key.

**Optional env vars:**

- `GEMINI_MODEL` - Gemini model identifier (defaults to `gemini-2.5-flash`).
- `NEXT_PUBLIC_APP_URL` - Base application URL for shareable links (falls back to `window.location.origin`).

**Secrets location:**

- Stored locally in `.env.local` (uncommitted, listed in `.gitignore`).
- Documented in template `.env.example`.
- Production credentials configured in deployment provider environment dashboards.

## Webhooks & Callbacks

**Incoming:**

- None. (Clerk user sync is currently handled lazily on-request via `upsertDbUser` in `lib/user.ts` rather than webhook receivers).

**Outgoing:**

- None.

---

*Integration audit: 2026-11-13*
