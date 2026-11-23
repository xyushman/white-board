# Chapter 20 — Challenges Faced and Solutions

**Goal:** You can name ten concrete technical problems this codebase visibly addresses, point to the exact code that addresses each, state the tradeoff, and distinguish what is proven in source from what is only inferred intent.

---

## 20.1 How to read this chapter

I was not present when the code was written, so there are no anecdotes here. "Proven" means the mechanism is visible in a named file and function. "Inferred" means the motivation is a reasonable reading of the code, not a recorded decision. Every item carries one of the required status labels; several carry both an implementation label and an evidence-gap note where the fix is incomplete or risky.

| # | Problem | Status | Proven mechanism |
| --- | --- | --- | --- |
| 1 | SSR-incompatible canvas | `[IMPLEMENTED]` proven | `next/dynamic`, `ssr: false` |
| 2 | Unconstrained LLM output | `[IMPLEMENTED]` proven | JSON schema + rules + node validation |
| 3 | Overlapping generated nodes | `[PARTIAL]` proven intent, no enforced geometry | Prompt rule + placement heuristic |
| 4 | Concurrency overspend | `[IMPLEMENTED]` proven; gap noted | Atomic conditional `UPDATE` |
| 5 | Heavy thumbnails in list queries | `[PARTIAL]` proven | Caps, throttle, column projection |
| 6 | Stale UI after credit spend | `[IMPLEMENTED]` proven | Response values pushed into Zustand |
| 7 | Unsaved-change loss | `[IMPLEMENTED]` + `[EVIDENCE GAP]` | Debounce, unmount flush, `beforeunload` |
| 8 | Share revocation | `[IMPLEMENTED]` proven | Token nulling + token lookup 404 |
| 9 | DB not configured locally | `[IMPLEMENTED]` proven | Loud throw + actionable UI message |
| 10 | Stale planning documents | `[IMPLEMENTED]` fixes; `[EVIDENCE GAP]` freshness | Current source supersedes audit claims |

---

## 20.2 SSR-incompatible canvas

**Symptom.** Excalidraw touches browser APIs and ships browser-only CSS. Rendering it on the server breaks hydration or throws.

**Evidence (proven).** `components/whiteboard/excalidraw-wrapper.tsx:8-17` wraps the library:

```ts
export const Excalidraw = dynamic(
  () =>
    import("@excalidraw/excalidraw").then((mod) => {
      const Comp = mod.Excalidraw as unknown as React.ComponentType<
        ExcalidrawProps
      >;
      return { default: Comp };
    }),
  {
    ssr: false,
```

The share view repeats the boundary at `components/whiteboard/shared-whiteboard.tsx:8-11` with `{ ssr: false }`. CSS is imported client-side at `excalidraw-wrapper.tsx:3`.

**Solution.** Isolate the library behind one wrapper so the rest of the app never imports it directly.

**Tradeoff.** A "Loading canvas…" spinner appears (`excalidraw-wrapper.tsx:18-24`), and no canvas HTML is server-rendered. That is acceptable for an editor and a token-gated share page — inferred, but consistent with the routes in `app/board/[id]/page.tsx` and `app/share/[token]/page.tsx`.

**Interview phrasing:** *"Excalidraw is browser-only, so I put it behind a `next/dynamic` wrapper with `ssr: false` and a typed props surface. That keeps server rendering working for auth and data loading."* `[IMPLEMENTED]`

---

## 20.3 Unconstrained LLM output

**Symptom.** A model asked for "a diagram" may return prose, markdown, or JSON with invented field names that the converter cannot consume.

**Evidence (proven).** `lib/ai-tools.ts:67-77` defines `CANVAS_RULES`, including:

```ts
Canvas generation rules:
- The scene width should be roughly 1200-1400 pixels, height around 800 pixels.
- Do NOT exceed 25 nodes total. Prefer fewer, clearer nodes.
- Every node must have unique id, x, y, width, height, and a short label.
- Nodes must not overlap; leave at least 40px of horizontal and vertical spacing.
```

`RESPONSE_SCHEMA` at `lib/ai-tools.ts:103-142` declares required fields (`title`, `width`, `height`, `nodes`, `connections`) and shapes. `app/api/ai/route.ts:119-125` passes `responseMimeType: "application/json"` and `responseSchema` to Gemini. Post-parse checks at `:127-150` refund the credit if `text` is empty or `nodes` is empty.

**Solution.** Constrain at three levels: prompt rules, provider-side schema, and server-side validation.

**Tradeoff.** The schema constrains *shape*, not *geometry* or semantic quality. A model can still emit overlapping coordinates within a valid schema — see §20.4. `[PARTIAL]`

**Interview phrasing:** *"I don't parse free-form model text. Gemini is asked for JSON matching a declared schema, and the route rejects an empty response or zero nodes before the client ever inserts anything."* `[IMPLEMENTED]`

---

## 20.4 Overlapping nodes

**Symptom.** Even with "do not overlap" in the prompt, generated boxes can collide.

**Evidence (proven intent, partial fix).** The rule is in `CANVAS_RULES` at `lib/ai-tools.ts:73`. `findEmptyCanvasPosition` at `lib/ai-canvas.ts:304-319` places the **whole generated block** to the right of existing content:

```ts
  return { x: maxRight + 150, y: minTop };
```

`diagramToElements` (`:181-202`) then adds `originX`/`originY` to every node, so the AI's internal layout is preserved as-is. There is no pairwise rectangle-intersection check anywhere in `lib/ai-canvas.ts`.

**Solution today.** Prompt guidance plus collision avoidance *between generations*, not *within* a generation.

**Tradeoff.** Good enough for a demo; a rigorous fix needs validation or a layout pass (e.g., force-directed placement) before element creation. This is one of the highest-value unit-test targets from Chapter 17 — Testing Strategy.

**Interview phrasing:** *"Overlap is currently prevented by prompt rules and by placing new diagrams to the right of existing content. I'd be honest that there's no geometric collision validator inside a generated diagram yet."* `[PARTIAL]`

---

## 20.5 Concurrency overspend

**Symptom.** Two simultaneous requests each read "1 credit left" and both proceed — the classic read-then-write race.

**Evidence (proven).** `app/api/boards/route.ts:38-43`:

```ts
    // Atomic credit decrement — prevents concurrent requests from both passing.
    const [deducted] = await db
      .update(schema.users)
      .set({ credit: sql`${schema.users.credit} - 1` })
      .where(and(eq(schema.users.id, user.id), gt(schema.users.credit, 0)))
      .returning({ credit: schema.users.credit });
```

`app/api/ai/route.ts:89-96` uses the same conditional `UPDATE` before calling Gemini. The database decides which request wins because the balance check lives inside the `WHERE` clause.

**Solution.** Move the invariant into one SQL statement instead of a JavaScript read followed by a write.

**Tradeoff / gap `[EVIDENCE GAP]`.** In the board route, the debit at `:39-43` and the board insert at `:55-58` are **not** wrapped in a transaction; if the insert fails, the credit is not returned. The AI route does refund on Gemini failures (`:127-169`). The stale `.planning/codebase/CONCERNS.md:27-33` still calls this "non-atomic" — that claim is outdated.

**Interview phrasing:** *"Both credit paths use a single conditional `UPDATE ... WHERE credit > 0 RETURNING credit`, so two concurrent requests can't both pass. The remaining gap is that board creation isn't transactional with the insert."* `[IMPLEMENTED]`

---

## 20.6 Heavy thumbnails in list queries

**Symptom.** A naive `SELECT *` on `whiteboards` ships the full JSONB scene plus a base64 preview to the dashboard for every board.

**Evidence (proven).** `lib/boards.ts:5-10` comments the intent and declares `summaryColumns`; `listBoards` selects it at `:57-63`. `lib/export.ts:154-165` caps previews at 400px, and `app/api/boards/[id]/route.ts:46-53` enforces a 2MB ceiling. `components/whiteboard/whiteboard-canvas.tsx:11` throttles capture to 30 seconds.

**Solution.** Avoid the largest JSONB columns, bound the preview size, and reduce capture frequency.

**Tradeoff `[PARTIAL]`.** `thumbnail` is still selected at `lib/boards.ts:10`, so base64 bytes still travel. The 2MB guard silently ignores oversized previews rather than rejecting them with feedback. Stale planning concerns about "full thumbnails in list queries" are fixed in spirit but not eliminated.

**Interview phrasing:** *"I project only summary columns and cap thumbnails at 400px and 2MB; the preview is still in the list because the card renders it, so a CDN URL would be the next step."* `[PARTIAL]`

---

## 20.7 Stale UI after credit spend

**Symptom.** The server deducts a credit, but the header badge keeps showing the old number until reload.

**Evidence (proven).** `components/dashboard/board-list.tsx:103` calls `setCredit(data.credit)` after board creation; `:70` does the same after listing; `components/whiteboard/assistant-panel.tsx:88` does it after generation. `components/dashboard/credit-badge.tsx:6` reads `useUserStore((s) => s.user?.credit)`.

**Solution.** Treat the route response as the source of truth for the post-mutation balance and push it into the shared Zustand store (`lib/store.ts:21-24`).

**Tradeoff.** Other tabs stay stale — there is no websocket or cross-tab sync. `[IMPLEMENTED]`

**Interview phrasing:** *"Each mutation returns the authoritative credit value and the client writes it into Zustand, so the badge updates immediately without a second fetch."* `[IMPLEMENTED]`

---

## 20.8 Unsaved-change loss

**Symptom.** Excalidraw fires continuous changes; a user can close the tab or navigate before a save completes.

**Evidence (proven).** `components/whiteboard/whiteboard-canvas.tsx:71-86` debounces 1500ms; `:88-93` calls `flush(true)` on unmount; `components/whiteboard/workspace.tsx:42-50` installs `beforeunload` while `dirty`. The store flag is defined in `lib/whiteboard-store.ts:37,45-46`.

**Solution.** Coalesce changes into one PATCH, flush on component teardown, and warn on tab close.

**Tradeoff / risk `[EVIDENCE GAP]`.** `beforeunload` cannot guarantee an async fetch completes, and a hard crash still loses up to 1.5s of edits. More seriously, reading `flush` shows this guard at `:38`:

```ts
    if (!data && !currentApi) return;
```

but the PATCH body at `:59-61` is:

```ts
          elements: data?.elements ?? [],
          appState: data?.appState ?? {},
          files: data?.files ?? {},
```

If `pending.current` is `null` while `apiRef.current` is set — exactly the state after a successful save followed by unmount — the forced flush could PATCH an **empty scene**. This is an unverified risk identified from source, not an observed incident; it needs a regression test (Chapter 17 — Testing Strategy) before being asserted as a bug.

**Interview phrasing:** *"Autosave debounces, flushes on unmount, and warns on unload. I've also spotted an edge case in the forced flush where a null pending snapshot defaults to an empty array, and I'd test that before claiming it's safe."* `[IMPLEMENTED]` with `[EVIDENCE GAP]`

---

## 20.9 Share revocation

**Symptom.** A link must be shareable without adding an account system for viewers, yet the owner must be able to cut access.

**Evidence (proven).** `app/api/boards/[id]/route.ts:55-60`:

```ts
    if (body.share === "enable" && !board.shareToken) {
      update.shareToken = randomUUID().replace(/-/g, "");
    }
    if (body.share === "disable") {
      update.shareToken = null;
    }
```

`randomUUID()` yields 32 hex characters after hyphen removal; `db/schema.ts:33` makes the token unique. `getBoardByShareToken` (`lib/boards.ts:92-104`) looks up by token, and `app/share/[token]/page.tsx:18` calls `notFound()` for missing or deleted boards. `components/whiteboard/shared-whiteboard.tsx:41` sets `viewModeEnabled`.

**Solution.** Capability URL: possession of the token is the authorization, and revocation is a single null write.

**Tradeoff.** No expiry, no password, no per-recipient tokens. Revoked links immediately 404 because no row matches. `[IMPLEMENTED]`

**Interview phrasing:** *"Sharing is a revocable capability URL — a unique 32-hex token, read-only rendering, and token nulling to revoke."* `[IMPLEMENTED]`

---

## 20.10 Database not configured locally

**Symptom.** A fresh clone without `.env.local` would fail opaquely deep inside a driver.

**Evidence (proven).** `db/index.ts:9-13` throws a targeted error naming `.env.local` and `.env.example` (quoted in Chapter 19 — Deployment and DevOps). `app/provider.tsx:26-28` deliberately swallows the bootstrap failure so the UI still renders; `components/dashboard/board-list.tsx:72-77` converts a failed list request into: "Could not reach the database. Add DATABASE_URL to .env.local to load boards."

**Solution.** Fail loudly at the boundary, stay quiet in the non-critical bootstrap effect, and give the user an actionable message.

**Tradeoff.** "UI-only mode" is not a real product mode — boards cannot be saved or generated without the database. `[IMPLEMENTED]`

**Interview phrasing:** *"Missing configuration produces a named error at the DB boundary and a specific dashboard message instead of a generic 500."* `[IMPLEMENTED]`

---

## 20.11 Stale planning documents

**Symptom.** `.planning/codebase/CONCERNS.md` reports the non-atomic credit bug (`:27-33`) and "bloated JSON payloads when querying board summaries" (`:11-16`), which could mislead a reader about the current app.

**Evidence (proven).** The file header at `.planning/codebase/CONCERNS.md:1-4` says `last_mapped_commit: 16423a0`, and `docs/LEARNING_GUIDE.md:17` explains that the audit predates the hardening work. Current source uses the atomic `UPDATE` (`app/api/boards/route.ts:38-43`, `app/api/ai/route.ts:89-96`) and a projected select (`lib/boards.ts:5-16`).

**Solution.** Treat `.planning/codebase/*.md` as historical; use `docs/LEARNING_GUIDE.md` and the source as truth.

**Tradeoff / gap `[EVIDENCE GAP]`.** Nothing automatically regenerates or version-marks those audit files, so they will drift again.

**Interview phrasing:** *"I found an older codebase map that flagged issues already fixed in the current source; I treat it as a historical snapshot rather than current documentation."* `[IMPLEMENTED]` fixes; `[EVIDENCE GAP]` freshness process

---

## 20.12 Revision summary

- `[IMPLEMENTED]` Excalidraw is isolated behind `next/dynamic` with `ssr: false`; both editor and share page use the boundary.
- `[IMPLEMENTED]` Gemini output is constrained by prompt rules, `RESPONSE_SCHEMA`, JSON MIME type, and empty-node validation.
- `[PARTIAL]` Overlap is addressed by prompt text plus whole-block placement; there is no intra-diagram collision checker.
- `[IMPLEMENTED]` Credit double-spend is prevented by one conditional SQL `UPDATE` in both spending routes; board debit is not transactional with the insert.
- `[PARTIAL]` Thumbnail costs are bounded by 400px, 2MB, and 30s throttling, but the base64 column is still selected on the dashboard.
- `[IMPLEMENTED]` Credit spend, unsaved flags, revocable tokens, and missing-env messages all have explicit client/server wiring; the forced unmount flush has an `[EVIDENCE GAP]` worth testing.
- `[EVIDENCE GAP]` The `.planning/codebase` audit is stale by its own header; its "non-atomic" and "full thumbnail" claims are already fixed in current source.

## 20.13 Knowledge checks

1. Which file isolates the browser-only canvas, and what would break if the `ssr: false` option were removed?
2. Name the three layers that constrain Gemini output and state which one rejects a zero-node response.
3. Why does `findEmptyCanvasPosition` solve a different overlap problem than the `CANVAS_RULES` spacing instruction?
4. Quote the condition that makes the credit decrement atomic and explain why two requests cannot both pass.
5. What is the difference between a *proven* mechanism and an *inferred* motivation in this chapter? Give one example of each.

## 20.14 Practical exercises

1. **Evidence table:** Pick four challenges from §20.1. For each, copy the exact 3–6 line snippet that proves the solution and write one sentence on the tradeoff.
2. **Risk investigation:** Using `components/whiteboard/whiteboard-canvas.tsx:35-69,88-93`, describe the exact state required for the forced unmount flush to send `elements: []`. Propose the smallest code change that would remove the risk without losing the last edit.
3. **Interview drill:** For "What was the hardest problem you solved?", write two 30-second answers: one about atomic credits and one about the client-only canvas. Mark which claims are proven and which are inferred.

## 20.15 Interview questions

1. How do you prevent two simultaneous requests from spending the same last credit?
2. What happens when Gemini returns valid JSON but no nodes, and who pays for that failure?
3. How do you keep a browser-only canvas library from breaking server rendering?
4. Why is the dashboard list query smaller than `SELECT *`, and what did you deliberately keep in it?
5. How can you tell that a documentation file is outdated, and what do you do when it contradicts the source?
