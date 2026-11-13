---
last_mapped_commit: 16423a0ae31aefefda1072fc337aaa1115d819ab
last_mapped_at: 2026-11-13
---
# Codebase Concerns

**Analysis Date:** 2026-11-13

## Tech Debt

**Thumbnail Storage in Relational Database:**

- Issue: Canvas thumbnails are captured as base64 data URLs via `captureThumbnail()` and stored directly in the `whiteboards.thumbnail` PostgreSQL text column.
- Files: `db/schema.ts`, `lib/boards.ts`, `app/api/boards/[id]/route.ts`, `components/whiteboard/workspace.tsx`
- Impact: High database storage consumption, increased row size, and bloated JSON payloads when querying board summaries on the dashboard.
- Fix approach: Upload thumbnail images to S3/Cloudflare R2 or an object storage bucket and store the CDN URL in the database column.

**Re-exporting `cn` Dependency:**

- Issue: `lib/utils.ts` re-exports `cn` from a standalone npm package `cn` (`export { cn } from "cn"`), while `clsx` is also installed in `package.json`.
- Files: `lib/utils.ts`, `package.json`
- Impact: Inconsistent class merging behavior compared to the standard `clsx` + `tailwind-merge` pattern used by shadcn/ui.
- Fix approach: Replace `cn` package with `tailwind-merge` + `clsx` inside `lib/utils.ts`.

## Known Bugs

**Non-Atomic Credit Check & Decrement:**

- Symptoms: Users can bypass credit limits under concurrent requests, generating diagrams even with insufficient credits.
- Files: `app/api/ai/route.ts` (lines 67–112)
- Trigger: Issuing multiple simultaneous AI generation requests when user credit is 1.
- Workaround: None currently in place.
- Fix approach: Execute an atomic conditional decrement query in SQL (`UPDATE users SET credit = credit - 1 WHERE id = $1 AND credit > 0 RETURNING credit`) before calling the Gemini API.

## Security Considerations

**Unrevoked Public Share Links:**

- Risk: Public share tokens generated for whiteboards do not have expiration timestamps or token rotation capabilities.
- Files: `db/schema.ts`, `app/api/boards/[id]/route.ts`, `app/share/[token]/page.tsx`
- Current mitigation: Users can toggle sharing off (`PATCH /api/boards/[id]` with `{ share: "disable" }`), which sets `shareToken` to null.
- Recommendations: Add `shareExpiresAt` column and allow setting optional password protection or access expirations.

**Error Message Leakage:**

- Risk: External model or database exceptions may leak internal details to clients in response payloads.
- Files: `app/api/ai/route.ts`, `app/api/boards/[id]/route.ts`
- Current mitigation: Generic error strings are returned for known error cases.
- Recommendations: Ensure caught exceptions are logged on the server and return sanitized messages to the client.

## Performance Bottlenecks

**Autosave Thumbnail Generation Overhead:**

- Problem: `captureThumbnail(api)` is invoked on every autosave tick (debounced to 800ms) and runs client-side canvas rendering.
- Files: `components/whiteboard/workspace.tsx`, `lib/export.ts`
- Cause: Rendering heavy Excalidraw scenes (hundreds of elements) into a canvas element and encoding to a data URL blocks the main UI thread.
- Improvement path: Only generate thumbnails on explicit save/unload, or run thumbnail rendering inside a Web Worker.

**Dashboard Board List Data Transfer:**

- Problem: Loading `/dashboard` fetches all active whiteboards with their full base64 thumbnail strings.
- Files: `app/api/boards/route.ts`, `lib/boards.ts`
- Cause: `select()` in Drizzle fetches all columns including the large `thumbnail` text column.
- Improvement path: Paginate board queries and select only minimal columns (`id`, `title`, `updatedAt`, `favorited`) for the dashboard grid.

## Fragile Areas

**Excalidraw Element Geometry Conversion:**

- Files: `lib/ai-canvas.ts`
- Why fragile: Contains manual geometric coordinate calculations translating Gemini JSON schemas to Excalidraw element coordinate trees (nodes, arrows, bounding boxes). Unexpected schemas or missing labels from the LLM can result in malformed or overlapping elements.
- Safe modification: Add comprehensive unit tests verifying coordinate generation with various mock LLM outputs before modifying layout formulas.
- Test coverage: Zero tests currently exist.

**Dynamic Excalidraw Client Boundary:**

- Files: `components/whiteboard/excalidraw-wrapper.tsx`, `components/whiteboard/whiteboard-canvas.tsx`
- Why fragile: Relies on `next/dynamic` with `ssr: false` and Excalidraw imperative API lifecycle hooks. Minor version bumps in `@excalidraw/excalidraw` can break canvas event handlers or styling.
- Safe modification: Lock `@excalidraw/excalidraw` to exact version in `package.json` without caret.

## Scaling Limits

**Postgres JSONB Document Storage:**

- Current capacity: Stores raw JSON elements array and appState in PostgreSQL `jsonb` columns.
- Limit: PostgreSQL tuples have a max size limit (typically 1GB toast, but queries slow drastically above a few megabytes per board).
- Scaling path: For very large boards, store chunked element state in object storage (S3) and retain only metadata in PostgreSQL.

**Single-User Whiteboard Locks:**

- Current capacity: Single-user editing per board.
- Limit: Concurrent edits by multiple users or multiple browser tabs overwrite each other on autosave (last write wins).
- Scaling path: Introduce WebSockets / Liveblocks / Yjs CRDT for multi-cursor real-time collaboration.

## Dependencies at Risk

**Pre-1.0 Excalidraw Dependency:**

- Package: `@excalidraw/excalidraw` (`^0.18.1`)
- Risk: Rapid breaking API changes between minor versions.
- Impact: Potential compilation failures or canvas runtime exceptions during package updates.
- Migration plan: Pin package version exactly and isolate behind `components/whiteboard/excalidraw-wrapper.tsx`.

## Missing Critical Features

**Credit Purchase / Billing Integration:**

- Problem: Users receive 3 initial credits on account creation, but there is no Stripe / payment checkout integration to purchase additional credits once exhausted.
- Blocks: Monetization and continued AI diagram generation for active users.

**Real-Time Collaborative Editing:**

- Problem: Whiteboard lacks live multiplayer presence (cursors, shared live canvas).
- Blocks: Team collaboration use cases.

## Test Coverage Gaps

**Geometry Conversion Logic:**

- What's not tested: `diagramToElements()` and shape generator functions in `lib/ai-canvas.ts`.
- Files: `lib/ai-canvas.ts`
- Risk: Malformed AI output causes runtime crashes on canvas update.
- Priority: High

**Board CRUD & Permission Scopes:**

- What's not tested: `listBoards()`, `getBoard()`, and ownership authorization in route handlers.
- Files: `lib/boards.ts`, `app/api/boards/route.ts`, `app/api/boards/[id]/route.ts`
- Risk: Unauthorized board access or broken archive/trash operations.
- Priority: High

**Credit Enforcement & Decrement:**

- What's not tested: Credit deduction logic in `app/api/ai/route.ts`.
- Files: `app/api/ai/route.ts`
- Risk: Users generating diagrams without sufficient credits.
- Priority: Medium

---

*Concerns audit: 2026-11-13*
