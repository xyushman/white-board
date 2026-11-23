# Chapter 23 — Technical Interview Questions and Answers

**Goal:** Practice answering interviewer questions with answers that are grounded in this repository. Every answer below gives the detailed technical answer, a beginner explanation, a real example from the code, likely follow-ups, and a short answer you can say aloud.

---

## 23.1 Basic project questions

### Q1. What does this project do?

- **Detailed answer ([IMPLEMENTED]):** `app/page.tsx` → `LandingPage` markets an "infinite canvas" where prompts become diagrams; `components/whiteboard/assistant-panel.tsx` → `handleGenerate` posts a prompt to `app/api/ai/route.ts` → `POST`; `lib/ai-canvas.ts` → `diagramToElements` converts the response into Excalidraw elements; `components/whiteboard/whiteboard-canvas.tsx` → `flush` persists them.
- **Simple explanation:** You type a sentence, the AI draws editable shapes, and your edits save themselves.
- **Real example from this project:** Selecting the "Flowchart" preset in `lib/ai-tools.ts` → `AI_TOOLS` sends a prompt that requests diamonds for decisions and Yes/No labels.
- **Possible follow-ups:** "Editable how?" → `lib/ai-canvas.ts` → `makeNode` creates real `text` elements bound to shape containers. "Is it an image?" → No: `makeArrow` builds `points` and `startBinding`/`endBinding`.
- **Strong interview-ready answer:** "It is a Next.js SaaS where Gemini returns structured diagram data, not pixels, which `diagramToElements` turns into native Excalidraw shapes, text, and arrows; then autosave, sharing, exports, and credits make it behave like a real product."

### Q2. What are the main features?

- **Detailed answer ([IMPLEMENTED]):** Dashboard CRUD and scopes in `components/dashboard/board-list.tsx` → `BoardListInner`; six AI presets in `lib/ai-tools.ts` → `AI_TOOLS`; autosave in `whiteboard-canvas.tsx` → `handleChange`; sharing in `workspace-header.tsx` → `toggleShare`; exports in `lib/export.ts` → `exportBoardToPng`, `exportBoardToSvg`, `exportBoardToPdf`; templates in `components/dashboard/templates.tsx` → `start`.
- **Simple explanation:** Create boards, generate diagrams, save automatically, organize, share a link, export files.
- **Real example from this project:** `templates.tsx` → `start` creates a board then pushes `/board/${id}?template=${tool}&prompt=${prompt}`; `assistant-panel.tsx` reads those with `useSearchParams`.
- **Possible follow-ups:** "Which is most complex?" → The generation pipeline plus credit correctness. "Which is missing?" → Tests, payments, multiplayer.
- **Strong interview-ready answer:** "Five user-visible groups: board management, AI generation, autosave, collaboration-in-a-read-only-sense via share links, and export; plus invisible plumbing like credits and ownership checks."

---

## 23.2 Technology stack questions

### Q3. Why Next.js 16 and React 19?

- **Detailed answer ([IMPLEMENTED]):** `package.json` pins `"next": "16.4.6"` and `"react": "19.3.0"`. `app/board/[id]/page.tsx` → `BoardPage` is an async server component that awaits `params` and calls `auth()`, while `components/whiteboard/workspace.tsx` is a client island. `proxy.ts` uses `clerkMiddleware` — the Next.js 16 replacement for `middleware.ts` (also noted in `README.md`).
- **Simple explanation:** Server code handles login and database reads; browser code handles the interactive canvas — one deployable app.
- **Real example from this project:** `app/dashboard/layout.tsx` → `DashboardLayout` redirects unauthenticated users on the server before rendering the page shell.
- **Possible follow-ups:** "Why async params?" → Next.js 16 passes `params` as a `Promise`, typed as `PageProps<"/board/[id]">` in `app/board/[id]/page.tsx`.
- **Strong interview-ready answer:** "I used the App Router so auth checks and board loads happen on the server, with client components only where interactivity is needed; Next 16's async params and `proxy.ts` are handled explicitly in `app/board/[id]/page.tsx` and `proxy.ts`."

### Q4. Why Excalidraw, Gemini, Drizzle, and Neon together?

- **Detailed answer ([IMPLEMENTED]):** `package.json` lists `@excalidraw/excalidraw`, `@google/genai`, `drizzle-orm`, `@neondatabase/serverless`. `db/index.ts` → `createDatabase` builds `neon(url)` and `drizzle({ client, schema })`. `app/api/ai/route.ts` → `POST` sets `responseMimeType: "application/json"` and `responseSchema`.
- **Simple explanation:** Excalidraw saves me building a drawing engine; Gemini writes structured data; Drizzle gives typed queries; Neon suits serverless HTTP.
- **Real example from this project:** `components/whiteboard/excalidraw-wrapper.tsx` → `Excalidraw` uses `dynamic(..., { ssr: false })` because the canvas needs browser APIs.
- **Possible follow-ups:** "Why not a custom canvas?" → [EVIDENCE GAP] no such comparison exists; answer as a scope decision inferred from the wrapper's existence. "Why JSONB?" → Chapter 11.
- **Strong interview-ready answer:** "Each tool removes a whole class of work: Excalidraw supplies the element model and exporters, Gemini's schema keeps output renderable, and Neon plus Drizzle give typed, HTTP-based persistence without managing sockets."

---

## 23.3 Architecture questions

### Q5. Walk me through the architecture.

- **Detailed answer ([IMPLEMENTED]):** Three layers appear in the tree: browser surfaces (`app/page.tsx`, `components/dashboard/*`, `components/whiteboard/*`, `app/share/[token]/page.tsx`), server layer (`proxy.ts`, server pages, five route handlers under `app/api/`, helpers `lib/user.ts` and `lib/boards.ts`), and external systems (Clerk, Neon, Gemini).
- **Simple explanation:** Pages show data, API routes change data, helpers keep rules in one place.
- **Real example from this project:** `lib/boards.ts` → `getBoard`, `listBoards`, `getBoardByShareToken`, `boardToData` are reused by pages and routes.
- **Possible follow-ups:** "Is it microservices?" → No; it is a single Next.js deployment.
- **Strong interview-ready answer:** "It is a full-stack monolith: React Server Components guard routes and load data, client islands run the canvas and dashboard, route handlers own mutations, and `lib/` holds shared domain helpers over a two-table Postgres schema."

### Q6. Where does business logic live?

- **Detailed answer ([IMPLEMENTED]):** There is no controller/service class hierarchy. Rules are expressed directly in route handlers (`app/api/boards/route.ts` → `POST` for credit debit, `app/api/ai/route.ts` → `POST` for rate limits/refunds) and small helpers (`lib/user.ts` → `requireUserId`, `lib/boards.ts` → `getBoard`).
- **Simple explanation:** Small functions next to the routes, not a heavy enterprise layer.
- **Real example from this project:** `app/api/boards/[id]/action/route.ts` → `POST` validates `["archive", "unarchive", "restore"]` in the route itself.
- **Possible follow-ups:** "Is that a weakness?" → [SUGGESTED IMPROVEMENT] extract a service layer if rules multiply; today it keeps the code readable.
- **Strong interview-ready answer:** "Logic lives in route handlers plus `lib/` helpers. The tradeoff is simplicity now versus a cleaner service layer later if the rules grow."

---

## 23.4 Frontend questions

### Q7. Why is Excalidraw loaded dynamically?

- **Detailed answer ([IMPLEMENTED]):** `components/whiteboard/excalidraw-wrapper.tsx` → `Excalidraw` uses `next/dynamic` with `ssr: false` and imports `@excalidraw/excalidraw/index.css` at line 3. The exported `ExcalidrawProps` type describes the subset used by the app.
- **Simple explanation:** The editor only exists in the browser; trying to render it on the server would fail.
- **Real example from this project:** `components/whiteboard/shared-whiteboard.tsx` has its own `dynamic` import with `{ ssr: false }` for the read-only view.
- **Possible follow-ups:** "What does the user see while loading?" → The wrapper's `loading` callback renders a spinner and "Loading canvas…".
- **Strong interview-ready answer:** "It touches browser APIs and ships heavy CSS, so I isolate it behind a client-only dynamic import with a loading state; both the editable and shared views use that boundary."

### Q8. How does autosave work?

- **Detailed answer ([IMPLEMENTED]):** `components/whiteboard/whiteboard-canvas.tsx` → `handleChange` stores the scene in `pending.current`, calls `markDirty()`, clears and restarts a 1,500 ms timer (`AUTOSAVE_DELAY`), and `flush` captures a thumbnail at most once per 30,000 ms (`THUMBNAIL_THROTTLE_MS`) before `PATCH /api/boards/${board.id}`. `components/whiteboard/workspace.tsx` → `WhiteboardWorkspace` adds a `beforeunload` guard while dirty.

```ts
// components/whiteboard/whiteboard-canvas.tsx (handleChange)
void appState;
pending.current = { elements, appState: {}, files };
markDirty();
if (timer.current) clearTimeout(timer.current);
timer.current = setTimeout(() => {
  void flush();
}, AUTOSAVE_DELAY);
```

- **Simple explanation:** Wait until drawing pauses, then send the scene; don't send transient UI state.
- **Real example from this project:** `appState: {}` is the literal payload — that is the verified behaviour, not a general Excalidraw recommendation.
- **Possible follow-ups:** "What if the tab closes early?" → The unmount effect calls `flush(true)`; `beforeunload` warns the user. "Conflict handling?" → [PARTIAL] last write wins; no version vector.
- **Strong interview-ready answer:** "A 1.5-second debounce coalesces the change stream, thumbnails are throttled to 30 seconds, unmount flushes, and the payload deliberately saves `appState: {}` plus elements and files."

---

## 23.5 Backend questions

### Q9. How is an authenticated request handled?

- **Detailed answer ([IMPLEMENTED]):** `proxy.ts` → `clerkMiddleware()` with a matcher; server pages call `auth()` (`app/dashboard/layout.tsx`, `app/board/[id]/page.tsx`); routes call `getDbUserOrUpsert()` in `lib/user.ts`, which delegates to `requireUserId()` → `UnauthorizedError` when no `userId` exists. Route handlers translate that error into 401.
- **Simple explanation:** Clerk answers "who are you?"; our helpers answer "do we have a local row for you?"
- **Real example from this project:** `app/api/user/route.ts` → `POST` calls `upsertDbUser()`; `GET` calls `getDbUserOrUpsert()`.
- **Possible follow-ups:** "Why upsert lazily everywhere?" → `app/provider.tsx` does an eager `POST /api/user` on sign-in, but routes still upsert for robustness.
- **Strong interview-ready answer:** "Middleware refreshes the session, `auth()` supplies `userId`, and `lib/user.ts` converts that into a database user — lazily in every route and eagerly once in `AppProvider`."

### Q10. How do you prevent credit double-spend?

- **Detailed answer ([IMPLEMENTED]):** Both `app/api/boards/route.ts` → `POST` and `app/api/ai/route.ts` → `POST` use one conditional update:

```ts
// app/api/boards/route.ts (POST)
const [deducted] = await db
  .update(schema.users)
  .set({ credit: sql`${schema.users.credit} - 1` })
  .where(and(eq(schema.users.id, user.id), gt(schema.users.credit, 0)))
  .returning({ credit: schema.users.credit });

if (!deducted) {
```

- **Simple explanation:** Read-and-subtract in one database statement means two simultaneous clicks cannot both succeed with one credit left.
- **Real example from this project:** Empty `deducted` returns 402 with "You've used all your board credits…" in the boards route and "Insufficient credits…" in the AI route.
- **Possible follow-ups:** "What about refunds?" → `app/api/ai/route.ts` → `POST` refunds on empty text, empty nodes, and thrown errors. "What about board creation failure after debit?" → [SUGGESTED IMPROVEMENT] wrap in a transaction.
- **Strong interview-ready answer:** "I use `UPDATE ... SET credit = credit - 1 WHERE id = ? AND credit > 0 RETURNING credit` in both spending paths; the database decides the winner, and AI failures explicitly add the credit back."

---

## 23.6 Database questions

### Q11. Why store the canvas in JSONB?

- **Detailed answer ([IMPLEMENTED]):** `db/schema.ts` → `whiteboards` declares `elements: jsonb(...).$type<unknown[]>()`, `appState: jsonb(...)`, `files: jsonb(...)`, all with defaults. `lib/boards.ts` → `boardToData` maps them into `BoardData` in `lib/types.ts`.
- **Simple explanation:** The canvas is one document whose shape belongs to Excalidraw; we never query inside it.
- **Real example from this project:** `components/whiteboard/whiteboard-canvas.tsx` → `handleApi` restores `board.elements` via `api.updateScene` and images via `api.addFiles`.
- **Possible follow-ups:** "Cost?" → No server-side querying of element content; whole-array rewrites. "Why not a table per shape?" → Schema churn with no query benefit here.
- **Strong interview-ready answer:** "JSONB matches the document nature of an Excalidraw scene and avoids modelling bindings and seeds relationally; the tradeoff is that I read and write the whole scene."

### Q12. How are soft delete and archive represented?

- **Detailed answer ([IMPLEMENTED]):** `db/schema.ts` → `whiteboards.deletedAt` and `archivedAt` are nullable timestamps. `lib/boards.ts` → `listBoards` filters with `isNull(...)` per scope and maps booleans in `toSummary`. `app/api/boards/[id]/route.ts` → `DELETE` sets `deletedAt` unless `?permanent=1`; `app/api/boards/[id]/action/route.ts` → `POST` sets/clears `archivedAt` and restores by clearing both.
- **Simple explanation:** Deleting marks a date; the trash tab shows marked rows; "delete forever" really removes the row.
- **Real example from this project:** `app/share/[token]/page.tsx` → `SharePage` returns `notFound()` when `row.deletedAt` is set, so trashed boards stop being shareable.
- **Possible follow-ups:** "Scheduled purge?" → [SUGGESTED IMPROVEMENT] not implemented; would need a cron job.
- **Strong interview-ready answer:** "Two nullable timestamps drive three scopes, with permanent delete only on an explicit query flag; deleted boards also 404 on the public share route."

---

## 23.7 API questions

### Q13. List the API surface and status codes.

- **Detailed answer ([IMPLEMENTED]):** `app/api/user/route.ts` (GET/POST user), `app/api/boards/route.ts` (GET list, POST create), `app/api/boards/[id]/route.ts` (PATCH, DELETE), `app/api/boards/[id]/action/route.ts` (POST action), `app/api/ai/route.ts` (POST generation). Observed statuses: 200/201 success, 400 invalid input, 401 unauthorized, 402 out of credits, 404 not found, 429 rate limited, 502 bad model output, 500/503 server or configuration errors.
- **Simple explanation:** Five endpoints cover users, boards, board actions, and AI.
- **Real example from this project:** `app/api/ai/route.ts` → `POST` returns 429 from `isRateLimited(userId)` before touching Gemini.
- **Possible follow-ups:** "Why 402 for credits?" → It mirrors 'payment required' semantics even though payments are not implemented ([PARTIAL]).
- **Strong interview-ready answer:** "Five route handlers with explicit error semantics: 401 auth, 402 credits, 429 rate limit, 502 unusable model output, and 404 for ownership misses."

### Q14. How does sharing work end to end?

- **Detailed answer ([IMPLEMENTED]):** `workspace-header.tsx` → `toggleShare` sends `PATCH { share: "enable" }`; `app/api/boards/[id]/route.ts` → `PATCH` generates `randomUUID().replace(/-/g, "")` — 32 hex characters — and stores it in `whiteboards.shareToken`; the client copies `${origin}/share/${token}`; `app/share/[token]/page.tsx` → `SharePage` looks it up with `getBoardByShareToken` and `components/whiteboard/shared-whiteboard.tsx` renders with `viewModeEnabled`.
- **Simple explanation:** A long random URL acts like a key; disabling sharing deletes the key.
- **Real example from this project:** `db/schema.ts` → `shareToken: text("share_token").unique()` prevents collisions at the database level.
- **Possible follow-ups:** "Expiry?" → [EVIDENCE GAP] no expiry column or logic. "Can viewers edit?" → No, `viewModeEnabled` plus disabled canvas actions.
- **Strong interview-ready answer:** "It is a revocable capability URL: a unique 32-hex token created on demand, checked by a public server page, rendered read-only, and invalidated by nulling the column."

---

## 23.8 Authentication and security questions

### Q15. How do you stop user A from reading user B's board?

- **Detailed answer ([IMPLEMENTED]):** `lib/boards.ts` → `getBoard` uses `and(eq(whiteboards.id, boardId), eq(whiteboards.userId, userId))`; mutations in `app/api/boards/[id]/route.ts` and `action/route.ts` additionally scope their `WHERE` clauses by `userId`; `app/board/[id]/page.tsx` → `notFound()` on a miss.
- **Simple explanation:** Ownership is part of every lookup, not a later check.
- **Real example from this project:** `listBoards(userId, scope)` begins with `const base = eq(schema.whiteboards.userId, userId);`.
- **Possible follow-ups:** "Why 404 not 403?" → Avoids confirming that the id exists.
- **Strong interview-ready answer:** "Authorization lives inside the query predicate on every board read and write; a foreign id returns no row and therefore a 404."

### Q16. What security headers and secret practices exist?

- **Detailed answer ([IMPLEMENTED]):** `next.config.ts` → `securityHeaders` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy`, applied via `headers()` to `/(.*)`. `.env.example` lists key *names* only; `README.md` → Notes warns to rotate previously exposed Clerk keys. [EVIDENCE GAP] No key values are repeated in these chapters.
- **Simple explanation:** Browser-level guardrails plus "secrets live in environment variables".
- **Real example from this project:** `db/index.ts` → `createDatabase` throws a descriptive error when `DATABASE_URL` is missing.
- **Possible follow-ups:** "CSRF?" → [SUGGESTED IMPROVEMENT] no explicit token; same-origin cookie-based Clerk auth and JSON bodies are the current posture.
- **Strong interview-ready answer:** "Four global headers, environment-only configuration, and a fail-fast DB client; I would add CSRF defence and secret scanning as hardening steps."

---

## 23.9 Methodology and design pattern questions

### Q17. What methodology did you follow?

- **Detailed answer ([EVIDENCE GAP]):** No Scrum/Kanban board or ADRs are committed. [IMPLEMENTED] What is observable is iterative hardening: `db/index.ts` → `getDb` caches a singleton; `lib/boards.ts` → `summaryColumns` avoids heavy payloads; `app/api/ai/route.ts` → `POST` has rate limiting and refunds. `README.md` documents setup; `.planning/codebase/*.md` is stale and predates hardening.
- **Simple explanation:** Build the happy path, then fix correctness and performance issues one by one.
- **Real example from this project:** The thumbnail ceiling in `app/api/boards/[id]/route.ts` → `PATCH` (`body.thumbnail.length <= 2_000_000`) is a hardening change.
- **Possible follow-ups:** "How do you know the planning docs are stale?" → Chapter 1 and `docs/LEARNING_GUIDE.md` note they predate the hardening commit.
- **Strong interview-ready answer:** "No formal methodology is recorded; the code shows iterative hardening — atomic credits, payload trimming, throttling — and I treat the planning docs as historical."

### Q18. Which design patterns appear?

- **Detailed answer ([IMPLEMENTED]):** Singleton/cached client (`db/index.ts` → `getDb`), DTO mapping (`lib/boards.ts` → `toSummary`, `boardToData`, types in `lib/types.ts`), client-only wrapper/proxy (`excalidraw-wrapper.tsx`), debounce and throttle (`whiteboard-canvas.tsx` → `AUTOSAVE_DELAY`, `THUMBNAIL_THROTTLE_MS`), optimistic UI (`workspace-header.tsx` → `toggleFavorite`), capability token (`app/api/boards/[id]/route.ts` → `PATCH`).
- **Simple explanation:** Reusable shapes that make the code easier to reason about, not textbook pattern names for their own sake.
- **Real example from this project:** `lib/store.ts` → `useUserStore` and `lib/whiteboard-store.ts` → `useWhiteboardStore` are two small Zustand stores instead of prop drilling.
- **Possible follow-ups:** "Why two stores?" → User/session data vs. editor-transient state have different lifetimes.
- **Strong interview-ready answer:** "The practical patterns are a cached DB client, DTO mappers, a client-only wrapper, debounce/throttle, optimistic UI, and a capability token — all visible in named functions."

---

## 23.10 Performance questions

### Q19. What did you do to keep the app fast?

- **Detailed answer ([IMPLEMENTED]):** `lib/boards.ts` → `summaryColumns` selects eight columns instead of base64-heavy rows; `whiteboard-canvas.tsx` debounces 1.5 s and throttles thumbnails to 30 s; `lib/export.ts` → `exportBoardToPdf` uses `await import("jspdf")`; `excalidraw-wrapper.tsx` defers the canvas bundle with `ssr: false`; `lib/export.ts` → `captureThumbnail` scales output to a 400 px maximum.
- **Simple explanation:** Send less data, do expensive work less often, load heavy code only when needed.
- **Real example from this project:** `captureThumbnail` computes `Math.min(max / width, max / height, 1)` with `max = 400`.
- **Possible follow-ups:** "Measured numbers?" → [EVIDENCE GAP] no Lighthouse or latency report is committed; do not invent metrics.
- **Strong interview-ready answer:** "Optimisations are payload-level and client-level: summary selects, debounced writes, throttled thumbnails, dynamic canvas and lazy jsPDF; I have not committed measurements, so I would not claim numbers."

### Q20. What happens at 100k users?

- **Detailed answer ([PARTIAL]):** `app/api/ai/route.ts` → `aiRateMap` is an in-memory `Map` with a comment that it resets on restart and recommends Redis for multi-instance. `db/index.ts` → `neon(url)` is HTTP-based; `getDb` caches per process. `users.credit` updates are atomic per row. [EVIDENCE GAP] no queue, no connection pooling config, no CDN/cache layer committed.
- **Simple explanation:** It works for one instance; several instances need shared rate-limit state.
- **Real example from this project:** `AI_RATE_LIMIT = 10` and `AI_RATE_WINDOW_MS = 60_000` in `app/api/ai/route.ts`.
- **Possible follow-ups:** "What breaks first?" → Per-process rate limits and unbounded JSONB scene sizes.
- **Strong interview-ready answer:** "The rate limiter is explicitly process-local, so I would move it to Redis first; the DB client is serverless-friendly and credits are safe per row, but there is no queue or cache layer yet."

---

## 23.11 Testing and debugging questions

### Q21. How do you test this project?

- **Detailed answer ([EVIDENCE GAP]):** `package.json` → `scripts` contains `dev`, `build`, `start`, `lint`, and Drizzle scripts only — no `test`. No `*.test.*` files, no CI workflow, no monitoring SDK. [IMPLEMENTED] Available verification is `npm run lint` (ESLint 9 flat config in `eslint.config.mjs`), `npm run build` (type-check via `tsconfig.json` → `strict: true`), and manual flows.
- **Simple explanation:** Today you verify by building, linting, and clicking through the app.
- **Real example from this project:** A manual credit test: set `credit = 1`, click "New board" twice, expect 201 then 402 from `app/api/boards/route.ts` → `POST`.
- **Possible follow-ups:** "What would you add first?" → Chapter 17: unit tests for `diagramToElements` and `isRateLimited`, then route integration tests.
- **Strong interview-ready answer:** "There is no automated test suite; I rely on lint, strict type-checking during build, and scripted manual checks. My first tests would target the converter and the credit/rate-limit logic."

---

## 23.12 Deployment and DevOps questions

### Q22. How is this deployed and configured?

- **Detailed answer ([PARTIAL]):** `package.json` provides `dev`, `build`, `start`; `next.config.ts` applies headers and a Turbopack CSS loader; `drizzle.config.ts` → `defineConfig` loads `.env.local` and points `out: "./drizzle"`; `README.md` documents `npm run db:push`. [EVIDENCE GAP] no `vercel.json`, Dockerfile, CI workflow, or monitoring config is committed.
- **Simple explanation:** Standard Next.js build/start with environment variables; deployment platform is not encoded in the repo.
- **Real example from this project:** `app/layout.tsx` → `metadata.metadataBase` falls back to `https://ai-whiteboard.local` when `NEXT_PUBLIC_APP_URL` is unset.
- **Possible follow-ups:** "Database migrations?" → `npm run db:generate` exists, but no generated `drizzle/` directory is committed.
- **Strong interview-ready answer:** "It has deploy-ready scripts and headers, but no platform-specific config; I would add a CI workflow, migrations, and monitoring before calling it production-grade."

---

## 23.13 Advanced system design questions

### Q23. Why not generate the diagram entirely on the client?

- **Detailed answer ([IMPLEMENTED]):** `app/api/ai/route.ts` → `POST` keeps `GEMINI_API_KEY` server-side, applies `isRateLimited` and the atomic debit, and validates output before the client sees it; the client only converts with `lib/ai-canvas.ts` → `diagramToElements`.
- **Simple explanation:** Secrets, limits, and billing must be server-controlled.
- **Real example from this project:** `MAX_PROMPT_LENGTH = 4000` is enforced in the route before the model call.
- **Possible follow-ups:** "Could the client forge a credit response?" → It could lie locally, but the next server request re-checks the DB balance.
- **Strong interview-ready answer:** "Client-side generation would expose the key and make credits advisory; the server is the only place where auth, rate limits, debits, and refunds can be enforced."

### Q24. What is the weakest part of the design, and how would you rebuild it?

- **Detailed answer ([SUGGESTED IMPROVEMENT]):** Three honest weak points grounded in code: (1) `app/api/boards/route.ts` → `POST` debits before inserting a board without a transaction; (2) `app/api/ai/route.ts` → `isRateLimited` is process-local; (3) `whiteboard-canvas.tsx` → `flush` is last-write-wins with no version check. A rebuild would add a transaction around debit+insert, Redis rate limiting, and an `updatedAt` precondition (or CRDT) for concurrent edits.
- **Simple explanation:** Credit accounting and collaboration are the places where the current simplicity has a cost.
- **Real example from this project:** The refund code uses `.catch(() => {})`, so a failed refund is logged only indirectly — a durable ledger would be safer.
- **Possible follow-ups:** "Would you add a queue?" → For long Gemini calls, yes: enqueue generation, return a job id, notify the client. [EVIDENCE GAP] none exists today.
- **Strong interview-ready answer:** "I would keep the architecture but harden three seams: transactional credit spending, shared rate-limit state, and optimistic concurrency for autosave; then add tests and observability."

---

## 23.14 Revision summary

- Answer structure: detailed answer → simple explanation → real example → follow-ups → strong one-paragraph answer.
- Core differentiator: `DiagramResult` → `diagramToElements` produces editable Excalidraw elements.
- Two atomic credit paths: `POST /api/boards` and `POST /api/ai`; AI failures refund.
- Autosave facts: 1,500 ms debounce, 30,000 ms thumbnail throttle, `appState: {}`, flush on unmount.
- Security: ownership inside `getBoard` and mutation `WHERE` clauses; 32-hex revocable share token.
- Honest gaps: no tests, CI, monitoring, payments, multiplayer, expiry, or measured metrics.
- Memory hook: five route handlers, two tables, six AI tools, three export formats.

## 23.15 Knowledge checks

1. Which exact function turns `DiagramResult` into Excalidraw elements, and what extra elements does it create for each node?
2. Why is `appState: {}` sent by autosave, and which two timing constants control the write?
3. What does `getBoard(userId, boardId)` do that a lookup by id alone would not?
4. List the status codes used for out-of-credits, rate-limited, and unusable-model-output responses, with the file that emits them.
5. Name three [EVIDENCE GAP] items you must not claim in an interview.

## 23.16 Practical exercises

1. **Q&A drill:** Pick Q10 and Q20. Write the six required fields for each in your own words, then say only the "strong interview-ready answer" aloud twice.
2. **Follow-up chain:** For Q14 (sharing), have a partner ask three successive "why?" questions. Answer each with a file path and symbol before speaking.
3. **Evidence audit:** Open `package.json`, `next.config.ts`, and `app/api/ai/route.ts`. Write a table of five claims you could defend and five that would be fabrications.

## 23.17 Interview questions

1. "Explain the project in 60 seconds using the words 'structured output' and 'atomic'."
2. "Which part of the code would you point to when explaining why autosave does not spam the database?"
3. "How do you answer the question 'Do you have tests?' without overstating what exists?"
4. "What is the difference between a revocable share token and an expiring one in this implementation?"
5. "If asked to scale this to 100,000 users, which process-local component would you replace first?"
