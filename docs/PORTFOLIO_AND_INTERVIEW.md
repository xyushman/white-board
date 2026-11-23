# Portfolio & Interview Kit — AI Whiteboard

This document turns the codebase into hireable material: resume bullets, portfolio copy,
a case-study outline, interview answers, and the gaps to close before you apply.

Everything here is grounded in what is actually implemented in this repo. Do not add
claims that the code cannot back up (see [What not to claim](#7-what-not-to-claim)).

---

## 1. One-liners

Pick the length that fits the space.

**Resume (one line)**
> AI Whiteboard — full-stack SaaS that pairs an Excalidraw infinite canvas with Gemini-powered diagram generation (Next.js 16, React 19, TypeScript, Postgres/Drizzle, Clerk).

**Non-technical (one line)**
> A whiteboard app where you describe a diagram in plain English and the AI draws it for you — then you can edit, organize, share, and export it.

**30-second pitch**
> I built a full-stack whiteboard SaaS from scratch. Users get an Excalidraw canvas, but the differentiator is an AI pipeline: you pick a tool — flowchart, architecture, wireframe, mind map — describe what you want, and Gemini returns a structured scene that gets converted into real, editable Excalidraw shapes and arrows. Around that I built the parts a demo usually skips: Clerk auth with per-user provisioning, Postgres persistence with autosave and thumbnails, archive/trash soft-delete lifecycles, revocable read-only share links, PNG/SVG/PDF export, and credit-based usage limits with atomic decrements and refunds. The front end is Next.js 16 App Router with a custom Swiss-style design system.

---

## 2. Resume bullets (ready to paste)

### Variant A — full-stack / product engineering

- **Built and shipped a full-stack AI whiteboard SaaS** (Next.js 16 App Router, React 19, TypeScript, Tailwind v4) with 5 REST endpoints, Clerk authentication, and a Postgres/Drizzle data layer covering board CRUD, archive/trash lifecycles, favorites, and templates.
- **Designed an AI diagram pipeline** that converts natural-language prompts into editable Excalidraw scenes using Gemini structured output (JSON response schema), 6 tool-specific prompt presets, and a deterministic converter that produces bound shapes, text, and arrows.
- **Hardened usage-based AI billing**: atomic single-statement credit decrement guarded by a balance check to prevent double-spend under concurrent requests, automatic credit refunds when the model fails or returns an unusable scene, per-user sliding-window rate limiting, and distinct 402/429/503 error semantics.
- **Implemented resilient autosave** with a 1.5s debounce, 30s thumbnail throttle, flush-on-unmount, and a `beforeunload` guard — keeping canvas edits durable without spamming the API or the database with base64 previews.
- **Built revocable public sharing** using unguessable capability URLs: token generation on demand, a read-only Excalidraw render path that bypasses auth, and hard 404s for deleted boards.
- **Delivered three client-side export formats** (PNG, SVG, PDF) from the live scene graph, with jsPDF loaded lazily to keep it out of the initial bundle, plus filename sanitization and a 2 MB thumbnail ceiling.
- **Created a scoped Swiss/editorial design system** (~1,650 lines of CSS) with GSAP ScrollTrigger + Lenis choreography, prefers-reduced-motion fallbacks, responsive layouts, and accessible nav/menu state.

Trim to 4–6 bullets per resume; keep the ones closest to the job description.

### Variant B — frontend-leaning

- Built a production-style Next.js 16 App Router interface mixing React Server Components for data/auth with client islands for the canvas, dialogs, and motion.
- Integrated Excalidraw with dynamic client-only loading, custom UI options, change-stream autosave, thumbnail capture, and three export formats.
- Designed a 1,650-line scoped CSS design system (custom properties, hairline rules, editorial grid) with GSAP ScrollTrigger + Lenis scroll choreography and reduced-motion support.
- Implemented a dashboard with search, favorites filtering, archive/trash scopes, optimistic actions, templates, and loading/empty states.
- Enforced UX consistency through typed Zustand stores, toast feedback, and explicit save-status indicators.

### Variant C — backend-leaning

- Modeled multi-tenant board data in Postgres (Drizzle/Neon) with JSONB scene storage, soft deletes via `deleted_at`/`archived_at`, unique share tokens, and owner-scoped queries on every mutation.
- Built a Gemini-backed generation endpoint with JSON-schema-constrained output, prompt-length caps, per-user rate limiting, and failure-path credit refunds.
- Prevented credit double-spend by combining the balance check and decrement into one conditional SQL `UPDATE ... WHERE credit > 0 RETURNING`.
- Kept dashboard queries lean by selecting only summary columns instead of megabytes of base64 thumbnails.

---

## 3. Metrics you can add honestly (measure, don't invent)

Recruiters like numbers. Measure these yourself and paste the real values:

| Metric | How to get it | Suggested wording |
| --- | --- | --- |
| Lighthouse Performance / A11y / Best Practices | Chrome DevTools → Lighthouse on the deployed URL | "Lighthouse: 9x performance, 9x accessibility" |
| Build output size | `npm run build` route table | "First-load JS under X kB on the landing route" |
| AI latency | Log `performance.now()` around `POST /api/ai` over 10 runs | "Median generation latency ~Xs end to end" |
| Codebase size | Count lines under `app/ components/ lib/ db/` | "~8k lines across 71 TypeScript/CSS files" |
| API surface | Route handlers | "5 REST endpoints, 2 stores, 6 AI tools, 3 export formats" |
| Dashboard payload | Compare `SELECT *` vs `summaryColumns` | "Avoids transferring base64 thumbnails on list views" |

Never claim user counts, revenue, or "production traffic" unless you actually have them.

---

## 4. Copy blocks

### GitHub repo description

> AI whiteboard SaaS — Excalidraw canvas + Gemini diagram generation, autosave, share links, templates, and PNG/SVG/PDF export. Next.js 16 · React 19 · TypeScript · Drizzle · Clerk.

### LinkedIn project entry

**AI Whiteboard — Full-Stack SaaS**  
*Next.js 16, React 19, TypeScript, Tailwind v4, Drizzle/Neon, Clerk, Google Gemini, Excalidraw*

Designed and built an AI-assisted whiteboard from the database up. The product turns natural-language prompts into editable Excalidraw diagrams via Gemini structured output, then wraps that core in the unglamorous SaaS essentials: authentication, per-user data provisioning, debounced autosave with thumbnails, archive/trash lifecycles, revocable read-only share links, credit-based usage enforcement with atomic decrements and refunds, and multi-format export. Also authored a custom Swiss/editorial design system with GSAP + Lenis motion and reduced-motion fallbacks.

### Portfolio card (short)

**AI Whiteboard** — Describe a diagram, get an editable one. Full-stack Next.js app with Gemini generation, Postgres persistence, sharing, and exports.  
`Next.js` `TypeScript` `Postgres` `Drizzle` `Clerk` `Gemini` `Excalidraw`

---

## 5. Case study outline (fill-in structure)

Use this order in a portfolio page or README "Case study" section. Each heading already has content from this repo.

### 5.1 Problem
Diagramming tools are powerful but slow to start: users face a blank canvas and dozens of shape tools. Generic chat assistants can describe a diagram, but the output is an image or text — not something you can edit.

### 5.2 Approach
Combine a proven canvas (Excalidraw) with a generation layer that produces the canvas's own data model, not a picture. Keep the AI output constrained so it is always renderable: JSON schema, node limits, spacing rules, and arrow references to real node IDs.

### 5.3 Scope decisions
| Decision | Why |
| --- | --- |
| Excalidraw instead of a custom canvas | Focus effort on the AI + SaaS layers, not shape editing |
| Structured JSON output instead of parsing prose | Deterministic conversion, far fewer broken scenes |
| Server-side credit accounting | Prevents client tampering and concurrent double-spend |
| Soft delete + archive | Matches user expectations; avoids irreversible mistakes |
| Capability URL for sharing | Simple, revocable, no new permission model needed |
| Client-side export | No server rendering cost; uses Excalidraw's own exporters |

### 5.4 Architecture
Point to `docs/PROFESSIONAL_DOCUMENTATION.md` for the full diagram. Summarize in three layers:
1. Next.js App Router — server components for auth/data, client islands for canvas and motion.
2. Route handlers — boards, AI, user; every mutation re-checks ownership.
3. Data + external services — Neon Postgres via Drizzle, Clerk, Gemini.

### 5.5 Hard problems and how they were solved
- **Credit double-spend:** two concurrent requests could both read "1 credit left". Fixed with a single conditional `UPDATE ... SET credit = credit - 1 WHERE id = ? AND credit > 0 RETURNING credit`.
- **Refunds on failure:** credits are deducted up front; every failure path (empty response, zero nodes, thrown error) restores the credit so users are not charged for broken output.
- **Autosave noise:** canvas changes fire continuously. Solved with a 1.5s debounce, a 30s thumbnail throttle, and a flush on unmount so the last edit is not lost.
- **Unbounded JSONB:** thumbnails are base64 and can be large; enforced a 2 MB ceiling and excluded them from list queries by selecting summary columns.
- **Client-only canvas:** Excalidraw touches `window` and ships heavy CSS; loaded through a client-only wrapper to keep SSR working.

### 5.6 Results
Replace with measured values: Lighthouse scores, generation latency, build size, number of flows shipped. Until then, describe capability: 5 endpoints, 6 AI tools, 3 export formats, 4 board lifecycle states (active, archived, trashed, shared).

### 5.7 What I'd do next
Be explicit and specific; it signals maturity. See section 8.

---

## 6. Interview answers

**"Walk me through the architecture."**
Next.js 16 App Router. The landing page and board/share pages are server components — they check auth and load data directly. Interactive parts are client components: the Excalidraw canvas, the dashboard list, dialogs, and the landing motion. API is five route handlers. Postgres through Drizzle with two tables; the board scene lives in JSONB because Excalidraw owns that shape. External services are Clerk for identity and Gemini for generation.

**"Why store elements as JSONB?"**
The scene is a document, not relational data. We never query inside elements; we read and write the whole array, and its shape is controlled by Excalidraw. Normalizing shapes, bindings, and text would add a lot of schema churn for zero query benefit. The tradeoff is no server-side querying of canvas content — acceptable here.

**"How do you prevent users from burning through AI credits / abusing the endpoint?"**
Three layers: auth on every request, a per-user sliding-window limiter (10 requests/minute), and a server-side credit balance. The decrement is atomic — a single `UPDATE ... WHERE credit > 0` — so two simultaneous requests cannot both pass. Prompt length is capped at 4,000 characters. If generation fails, the credit is refunded.

**"What happens if Gemini returns garbage?"**
The request uses `responseMimeType: application/json` plus a response schema, so the model is constrained at the API level. On top of that we validate that `nodes` is non-empty before returning; if it is empty or parsing fails, we refund and return a 502 with a user-facing message. The client never inserts a half-parsed scene.

**"How does autosave work?"**
`onChange` records the pending scene and resets a 1.5s timer. When it fires, we capture a thumbnail at most once every 30 seconds, PATCH the board, and update save status. On unmount we flush immediately so the last edit is persisted. There is also a `beforeunload` guard while changes are unsaved.

**"How is sharing secured?"**
Sharing is opt-in per board. Enabling it generates a random 32-character token stored uniquely on the row; the public route looks up by token, rejects deleted boards, and renders Excalidraw with `viewModeEnabled` and canvas actions disabled. Disabling clears the token, which immediately revokes the link. There is no account-level permission model because read-only link access is the whole feature.

**"Why not use server actions for everything?"**
Server actions are great for form mutations, but the canvas autosave is a high-frequency JSON payload from a client-only library, and sharing/export flows need explicit status codes. Route handlers give clearer semantics and are easy to call from the existing client code. Using both is fine; I kept the boundary simple.

**"What's the weakest part of this project?"**
No automated tests and no CI. The pure logic — diagram-to-element conversion, board mappers, credit math — is testable without a browser, and the critical flows need Playwright. I would add Vitest for units and a Playwright smoke suite for auth → create board → generate → share → export, wired into GitHub Actions.

**"What would you change at scale?"**
Move the rate limiter to Redis/Upstash because the in-memory map resets on deploy and is per-instance. Add idempotency keys on AI requests so retries do not double-charge. Switch sharing from "anyone with the link" to expiring, optionally password-protected links. And if collaboration is the goal, replace autosave with a CRDT (Yjs) and a websocket layer — the current model is last-write-wins.

---

## 7. What not to claim

Avoid these unless you actually build them:

- ❌ **"Real-time collaboration / multiplayer"** — there is no websocket or CRDT layer; autosave is last-write-wins.
- ❌ **"Payments / Stripe / subscription billing"** — the pricing section is marketing UI only; credits are seeded per user, not purchased.
- ❌ **"Team workspaces / organizations"** — Clerk handles identity, but boards are strictly single-owner.
- ❌ **"Test coverage"** — there are no tests. Say "manually verified; automated tests are next" instead.
- ❌ **"Production scale / X users / Y% faster"** — no traffic evidence; measure locally or omit.
- ❌ **"SOC 2 / enterprise security"** — not applicable.
- ❌ **"AI fine-tuning / RAG"** — this uses prompt + schema-constrained generation only.

Saying "here is what it does not do yet, and here is how I'd add it" is stronger than an inflated claim that collapses under one follow-up question.

---

## 8. Highest-leverage upgrades before you apply

Do these in order. Each one adds a concrete resume line.

1. **Automated tests + CI (biggest gap).**
   - Vitest for `diagramToElements`, `boardToData`, `toSummary`, credit-decrement query shape, and share-token validation.
   - Playwright smoke: sign in → create board → generate (mock Gemini) → share → open share page → export.
   - GitHub Actions workflow running `npm run lint`, `npm run build`, and tests. Add status badges to the README.

2. **Deploy a live demo.**
   - Vercel + Neon + real Clerk/Gemini keys; add a seeded demo account and a "Try the demo" link in the README.
   - Record a 20–30s GIF of prompt → diagram → share → export. This is what recruiters actually click.

3. **Fix two real limitations (shows you can audit your own work).**
   - `whiteboard-canvas.tsx` intentionally drops `appState` on save (`appState: {}` is sent to the API), so view background, grid, and zoom never round-trip. Either persist a safe subset or document the choice and strip ephemeral fields explicitly.
   - `listBoards` archived scope does not filter with `isNotNull(archivedAt)` in SQL — it fetches all non-deleted rows and filters in memory. Move the predicate into the query.

4. **Harden the AI endpoint.**
   - Replace the in-memory limiter with Upstash Redis (survives restarts, works across instances).
   - Add an idempotency key so retries cannot double-charge.
   - Add request/response logging with a request ID for debuggability.

5. **Add observability and error boundaries.**
   - Sentry (or similar) for client + server errors, `error.tsx` and `not-found.tsx` routes with the same design language.

6. **Only if targeting collaboration-heavy roles:** add multiplayer with Yjs/Liveblocks, presence cursors, and conflict handling. This is a large project on its own — do not claim it half-built.

7. **If you want to say "monetized":** integrate Stripe Checkout + webhooks to actually sell credit packs, and gate plans server-side. Until then, describe pricing as UI only.

---

## 9. 60-second demo script

1. **Landing (5s):** "Swiss-style marketing site with animated sections, built as a scoped CSS design system."
2. **Dashboard (10s):** "Auth-gated workspace. Search, favorites, archive and trash scopes. Templates create a board and pre-fill the AI prompt."
3. **Generate (20s):** Open a template, hit Generate. "Prompt goes to the server, credits are decremented atomically, Gemini returns a JSON scene constrained by a schema, and the client converts nodes and connections into real Excalidraw elements."
4. **Edit + autosave (10s):** Move a shape, show "Saving… → Saved". "Debounced autosave with a throttled thumbnail, so the dashboard preview stays fresh."
5. **Share (10s):** Click Share, open the link in a private window. "Read-only, no auth, revocable by clearing the token."
6. **Export (5s):** Export PDF. "Client-side export straight from the scene graph."

---

## 10. Verified numbers

From the repo at the time of writing:

| Fact | Value |
| --- | --- |
| TypeScript/TSX/CSS files in `app/ components/ lib/ db/` | 71 |
| Lines in those directories | ~8,511 |
| Route handlers | 5 (`/api/user`, `/api/ai`, `/api/boards`, `/api/boards/[id]`, `/api/boards/[id]/action`) |
| Database tables | 2 (`users`, `whiteboards`) |
| AI tools | 6 (diagram, flowchart, architecture, web mockup, mobile mockup, mind map) |
| Export formats | 3 (PNG, SVG, PDF) |
| Zustand stores | 2 (whiteboard, user) |
| Board lifecycle states | active, archived, trashed, shared (read-only) |
| Landing design-system CSS | ~1,647 lines, scoped under `.ev` |

Re-verify before quoting; the codebase changes.
