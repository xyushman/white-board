# Chapter 3 — Requirements Analysis

**Goal:** By the end of this chapter you can read any feature request, map it to the exact file that implements it, say whether it is fully or partially met, and name the test evidence that is missing.

---

## 3.1 Beginner framing: what a "requirement" means here

A requirement is a promise you can check. "The app should feel fast" is not checkable. "The autosave waits 1500 ms after the last change" is checkable because `components/whiteboard/whiteboard-canvas.tsx:10` says `const AUTOSAVE_DELAY = 1500`.

Because this repository has no requirements document, the requirements below are **[IMPLEMENTED] reverse-engineered from source** or **[EVIDENCE GAP] identified as missing**. That distinction matters: you must never tell an interviewer "we required X" if all you have is a line of code.

**[EVIDENCE GAP]** No PRD, ADR, issue tracker export, or acceptance-criteria file exists in the checkout. `README.md:17-28` is the closest thing to a feature list.

---

## 3.2 Functional requirements

Each row states the behaviour, then the exact implementation site.

| ID | Requirement | Implementation | Status |
| --- | --- | --- | --- |
| FR-1 | A signed-in user is mirrored into the app database | `lib/user.ts:21-42` `upsertDbUser()`; invoked eagerly in `app/provider.tsx:19-25` and lazily via `getDbUserOrUpsert()` in routes | **[IMPLEMENTED]** |
| FR-2 | Unauthenticated users cannot reach the dashboard/editor | `app/dashboard/layout.tsx:12-13` and `app/board/[id]/page.tsx:10-11` call `auth()` then `redirect("/sign-in")` | **[IMPLEMENTED]** |
| FR-3 | A user can create a named board | `POST /api/boards:26-74`; UI in `components/dashboard/board-list.tsx:91-113` | **[IMPLEMENTED]** |
| FR-4 | A board costs one credit to create | `POST /api/boards:39-53` atomic conditional update + 402 error | **[IMPLEMENTED]** |
| FR-5 | Dashboard lists boards by scope (active/archived/trashed) | `lib/boards.ts:43-72` `listBoards()`; `GET /api/boards:7-24`; tabs in `board-list.tsx:183-204` | **[IMPLEMENTED]** |
| FR-6 | Dashboard can search and filter favorites **client-side** | `board-list.tsx:133-142` `filteredBoards` useMemo over already-fetched summaries | **[IMPLEMENTED]** with scope limit: no server-side query, no pagination |
| FR-7 | A user can rename a board | `workspace-header.tsx:32-48` 800 ms debounce → `PATCH { title }`; `api/boards/[id]/route.ts:38-40` trims and slices to 120 chars | **[IMPLEMENTED]** |
| FR-8 | Canvas edits autosave | `whiteboard-canvas.tsx:35-93`: 1.5 s debounce, pending snapshot, thumbnail throttle, unmount flush | **[IMPLEMENTED]** |
| FR-9 | Autosave deliberately drops app state | `whiteboard-canvas.tsx:77-78` `void appState; pending.current = { elements, appState: {}, files }` | **[IMPLEMENTED]** |
| FR-10 | Thumbnail is generated and stored | `lib/export.ts:137-170` `captureThumbnail()` (max 400 px); `PATCH` stores it | **[PARTIAL]** stored as base64 text in Postgres; no object storage |
| FR-11 | Board can be favorited | `workspace-header.tsx:67-83` toggle; `PATCH { favorited }` at `api/boards/[id]/route.ts:54` | **[IMPLEMENTED]** |
| FR-12 | Board can be archived, restored, trashed, permanently deleted | `POST /api/boards/[id]/action:10-65`; `DELETE /api/boards/[id]:96-153` with `?permanent=1` | **[IMPLEMENTED]** |
| FR-13 | Templates can seed a board and prefill the AI helper | `components/dashboard/templates.tsx:26-110`: creates board, pushes `/board/[id]?template=&prompt=`; `assistant-panel.tsx:27-34` reads params | **[IMPLEMENTED]** |
| FR-14 | AI tools offer six prompt presets | `lib/ai-tools.ts:10-65` `AI_TOOLS` (diagram, flowchart, architecture, web/mobile mockup, mindmap) | **[IMPLEMENTED]** |
| FR-15 | A prompt produces a constrained JSON diagram | `api/ai/route.ts:105-125` composes prompt + `CANVAS_RULES` + `RESPONSE_SCHEMA` with `responseMimeType: "application/json"` | **[IMPLEMENTED]** |
| FR-16 | Generated JSON becomes editable Excalidraw elements | `lib/ai-canvas.ts:181-202` `diagramToElements()`; inserted in `assistant-panel.tsx:90-103` | **[IMPLEMENTED]** |
| FR-17 | AI generation costs one credit and refunds on failure | `api/ai/route.ts:89-103` debit; `:129-163` three refund paths | **[IMPLEMENTED]** |
| FR-18 | AI generation is rate limited | `api/ai/route.ts:25-43, 53-58` per-user sliding window | **[PARTIAL]** process-local map, resets on restart, not multi-instance safe |
| FR-19 | Sharing produces a revocable read-only link | `api/boards/[id]/route.ts:55-60`; `app/share/[token]/page.tsx:9-30`; `shared-whiteboard.tsx:41` `viewModeEnabled` | **[IMPLEMENTED]** |
| FR-20 | Export PNG, SVG, PDF | `lib/export.ts:7,46,81`; buttons in `workspace-header.tsx:177-188` | **[IMPLEMENTED]** client-side only |
| FR-21 | Feedback for async outcomes | `toast` in `assistant-panel.tsx:65,105,109` and `workspace-header.tsx:96,108,112`; `Toaster` mounted in `app/layout.tsx:49` | **[IMPLEMENTED]** |
| FR-22 | Users can purchase more credits / upgrade | `lib/pricing.ts` is constants; `components/landing/pricing-section.tsx` links to `/sign-up` only | **[EVIDENCE GAP]** not implemented (no checkout, webhook, or entitlement update) |
| FR-23 | Usage analytics for Team plan | Advertised in `lib/pricing.ts:65`; no analytics table/SDK | **[EVIDENCE GAP]** not implemented |

---

## 3.3 Non-functional requirements

Non-functional requirements (NFRs) describe *how well* the system behaves. Here they are unusually concrete because the hardening work left visible constants.

| ID | NFR | Code evidence | Why it exists | Status |
| --- | --- | --- | --- | --- |
| NFR-1 | Authentication on protected pages | `auth()` + `redirect` in `dashboard/layout.tsx:12-13`, `board/[id]/page.tsx:10-11` | Server-side gate before any board HTML is sent | **[IMPLEMENTED]** |
| NFR-2 | Ownership enforced in the query, not after it | `lib/boards.ts:74-90` `getBoard(userId, id)`; `and(eq(id,...), eq(userId,...))` in all PATCH/DELETE/action updates | Guessing an ID cannot reveal another user's board | **[IMPLEMENTED]** |
| NFR-3 | Atomic credit debit | `sql\`${users.credit} - 1\`` with `gt(users.credit, 0)` and `RETURNING` in both `api/boards/route.ts` and `api/ai/route.ts` | Database arbitrates concurrent requests | **[IMPLEMENTED]** |
| NFR-4 | No charge on AI failure | three refund branches in `api/ai/route.ts` | Commercial trust | **[IMPLEMENTED]** best-effort in the catch path (`.catch(() => {})`) |
| NFR-5 | Rate limiting | 10 requests / 60 000 ms in `api/ai/route.ts:27-43` | Protects an expensive external API | **[PARTIAL]** in-memory; comment itself says "Upgrade to Redis if running multi-instance" |
| NFR-6 | Payload caps | prompt ≤ 4000 chars (`api/ai/route.ts:23,74-79`); title ≤ 120 (`api/boards/[id]/route.ts:39`); thumbnail ≤ 2 000 000 chars (`api/boards/[id]/route.ts:47-50`) | Prevents oversized AI bills and oversized DB rows | **[PARTIAL]** `elements`/`files` arrays have no explicit size cap |
| NFR-7 | Input validation and sanitized errors | invalid JSON → 400, invalid action → 400, generic 500 text in all routes; `request.json().catch(() => ({}))` | Avoid leaking internal exceptions | **[IMPLEMENTED]** |
| NFR-8 | Reduced-motion support | `landing-motion.tsx:10-15` and `:340-341`; `app/landing.css:645,1633` media queries | Accessibility for motion-sensitive users | **[IMPLEMENTED]** landing only; animation libs are not gated elsewhere |
| NFR-9 | Client-only canvas | `excalidraw-wrapper.tsx:8-25` `dynamic(..., { ssr: false })`; same pattern in `shared-whiteboard.tsx:8-11` | Excalidraw needs browser APIs | **[IMPLEMENTED]** |
| NFR-10 | Efficient dashboard payload | `summaryColumns` in `lib/boards.ts:7-16` selects 8 columns, not `elements`/`files` | Avoids transferring megabytes of scene/thumbnail data | **[IMPLEMENTED]** |
| NFR-11 | Security headers | `next.config.ts:3-8,22-24`: `nosniff`, `X-Frame-Options: DENY`, referrer policy, permissions policy | Baseline browser hardening | **[IMPLEMENTED]** |
| NFR-12 | Configuration fails loudly where it matters | `db/index.ts:8-13` throws without `DATABASE_URL`; `api/ai/route.ts:81-87` returns 503 without `GEMINI_API_KEY` | Distinguishes misconfiguration from bugs | **[IMPLEMENTED]** |
| NFR-13 | Observability | `console.error` in route handlers; no structured logging, tracing, or alerting | — | **[EVIDENCE GAP]** unmet |
| NFR-14 | Regression safety | No test script, no test files, no CI workflow | — | **[EVIDENCE GAP]** unmet |
| NFR-15 | Deterministic state updates | Zustand stores expose explicit setters (`lib/store.ts`, `lib/whiteboard-store.ts`) | Avoids scattered `setState` calls | **[PARTIAL]** optimistic UI updates are not rolled back on failed PATCH |

The last row is worth memorising. For example, `toggleFavorite()` flips local state *before* the fetch and only reverts in `catch` (`workspace-header.tsx:70-82`). If the server returns 500 without throwing, the UI can drift from the database.

---

## 3.4 Constraints and dependencies

| Constraint | Source | Effect on requirements |
| --- | --- | --- |
| Clerk is the identity provider | `ClerkProvider` in `app/layout.tsx:42`; `auth()` throughout server code | App user IDs are Clerk IDs (`db/schema.ts:11`); no local password flow |
| Neon HTTP driver, not a persistent socket | `db/index.ts:1-2,14-15` `neon(url)` + `drizzle({ client, schema })` | Each query is an HTTP round trip; connection pooling is the vendor's job |
| Gemini output must fit one schema | `RESPONSE_SCHEMA` in `lib/ai-tools.ts:103-142` | New tool types must fit nodes/connections or the converter breaks (Chapter 14) |
| Excalidraw owns the element model | `lib/ai-canvas.ts` hand-builds element fields | Version upgrades of `@excalidraw/excalidraw` are a compatibility risk |
| Single-region, in-memory rate state | `api/ai/route.ts:25-29` | Horizontal scaling would weaken NFR-5 |
| No migrations committed | `drizzle.config.ts:8` points to `./drizzle`; directory absent | Deployment must run `npm run db:push` or generate migrations first |
| No test/CI/monitoring tooling | `package.json:5-49` | NFR-13/14 cannot be claimed as met |

```ts
// app/api/ai/route.ts:27-43
const aiRateMap = new Map<string, number[]>();
const AI_RATE_LIMIT = 10; // requests
const AI_RATE_WINDOW_MS = 60_000; // per minute

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (aiRateMap.get(userId) ?? []).filter(
    (t) => now - t < AI_RATE_WINDOW_MS,
  );
  if (timestamps.length >= AI_RATE_LIMIT) {
    aiRateMap.set(userId, timestamps);
    return true;
  }
  timestamps.push(now);
  aiRateMap.set(userId, timestamps);
  return false;
}
```

**Line-level reading:** line 27 holds timestamps in process memory; 28-29 set the limits; 33-35 discard older timestamps (sliding window); 36-39 reject and store the trimmed list; 40-42 accept and record the request. The limitation is architectural, not a typo: two serverless instances have two maps.

---

## 3.5 Traceability matrix

This is the table to use when someone asks "where is feature X implemented?" or "what breaks if I change Y?".

| Requirement | UI entry point | Route handler | Helper / store | DB or external | Verification available |
| --- | --- | --- | --- | --- | --- |
| FR-1 / FR-2 | `app/provider.tsx`, `dashboard/layout.tsx` | `api/user/route.ts` | `lib/user.ts` | Clerk + `users` | **[EVIDENCE GAP]** none automated |
| FR-3 / FR-4 | `board-list.tsx:createBoard`, `templates.tsx:start` | `POST /api/boards` | `getDbUserOrUpsert` | `users.credit`, `whiteboards` | **[EVIDENCE GAP]** manual only |
| FR-5 / FR-6 | `board-list.tsx` tabs/search | `GET /api/boards` | `listBoards`, `toSummary` | `whiteboards` summary columns | **[EVIDENCE GAP]** |
| FR-7 / FR-10 / FR-11 | `workspace-header.tsx`, `whiteboard-canvas.tsx` | `PATCH /api/boards/[id]` | `captureThumbnail`, `useWhiteboardStore` | `whiteboards` JSONB | **[EVIDENCE GAP]** |
| FR-8 / FR-9 | `whiteboard-canvas.tsx` `handleChange` | same PATCH | `useWhiteboardStore.markDirty` | JSONB (`appState: {}`) | **[EVIDENCE GAP]** |
| FR-12 | `board-list.tsx:act/remove` | `action/route.ts`, `DELETE /api/boards/[id]` | `getBoard` | `deletedAt`, `archivedAt` | **[EVIDENCE GAP]** |
| FR-13 | `templates.tsx` | `POST /api/boards` | `AI_TOOLS` lookup | URL query params | **[EVIDENCE GAP]** |
| FR-14 / FR-15 | `assistant-panel.tsx` | `POST /api/ai` | `lib/ai-tools.ts` | Gemini API | **[EVIDENCE GAP]** |
| FR-16 | `assistant-panel.tsx:handleGenerate` | response consumer | `diagramToElements` | Excalidraw API | **[EVIDENCE GAP]** |
| FR-17 / NFR-3 / NFR-4 | `CreditBadge` | `POST /api/ai`, `POST /api/boards` | `useUserStore.setCredit` | `users.credit` | **[EVIDENCE GAP]** |
| FR-18 / NFR-5 | none (server rejects with 429) | `api/ai/route.ts` | `isRateLimited` | process memory | **[EVIDENCE GAP]** |
| FR-19 | `workspace-header.tsx:toggleShare` | `PATCH { share }` | `getBoardByShareToken` | `share_token` unique column | **[EVIDENCE GAP]** |
| FR-20 | `workspace-header.tsx:handleExport` | none (client-only) | `lib/export.ts` | browser download | **[EVIDENCE GAP]** |
| FR-21 | all async actions | error responses | `sonner` Toaster | — | **[EVIDENCE GAP]** |
| FR-22 / FR-23 | `pricing-section.tsx` (display) | none | `lib/pricing.ts` | — | **[EVIDENCE GAP]** not implemented |
| NFR-8 | `LandingMotion` | none | `reduceMotion()` | CSS media queries | **[EVIDENCE GAP]** |
| NFR-11 | none | none | `next.config.ts` | HTTP headers | **[EVIDENCE GAP]** |

**[EVIDENCE GAP]** The entire "Verification available" column is empty because there are no tests. This is not a judgement about code quality; it is a traceability fact. Chapter 17 proposes how to fill it.

---

## 3.6 Revision summary

- Requirements were reverse-engineered from source because no PRD exists in the checkout.
- FR-1 to FR-21 are implemented; FR-10, FR-18, FR-22, and FR-23 are partially or wholly unmet.
- NFRs are concrete: ownership in queries, atomic credit decrements, three payload caps, reduced motion, and security headers.
- NFR-5 is only partial because the rate limiter is an in-memory `Map` that resets on restart.
- `appState: {}` in autosave is an implemented requirement with an explicit scope limit.
- Every requirement has a UI/route/helper/DB path in the traceability matrix, but no automated verification exists.
- The biggest design constraints are Clerk identity, Neon HTTP, the Gemini JSON schema, and Excalidraw's element model.

## 3.7 Knowledge checks

1. Why is `getBoard(userId, boardId)` a better enforcement point than checking ownership after fetching a board by ID alone?
2. Which three payload caps can you point to in code, and which payload is *not* capped?
3. Explain the difference between FR-17's atomic debit and NFR-4's refund paths.
4. Why is NFR-5 marked partial even though `isRateLimited()` works correctly in one process?
5. Trace FR-16 from the UI click to the Excalidraw scene, naming four files in order.

## 3.8 Practical exercises

1. **Cap audit:** Grep every route handler for `length`, `slice`, and numeric literals used as limits. Build a table of caps and note which ones lack an explicit error response.
2. **Traceability drill:** Pick FR-12. Follow it from the dropdown menu in `board-list.tsx` through the HTTP call to the SQL column it changes, then write down what a manual verification sequence would be.
3. **Partial-requirement proposal:** For FR-18, write a short design note describing what would change if the rate limiter moved to a shared store. List the files affected and the requirement ID whose status would improve.

## 3.9 Interview questions

1. "How did you turn an existing codebase into a requirements specification?"
2. "Which non-functional requirement was hardest to satisfy, and what evidence proves it?"
3. "Why do you say the rate limiter is only partially implemented?"
4. "What is the difference between a functional requirement and a traceability matrix entry in your project?"
5. "If you had to add a new requirement tomorrow, which matrix row would grow the most and why?"
