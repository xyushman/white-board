# Chapter 2 — Problem Statement and Objectives

**Goal:** By the end of this chapter you can separate what the project *claims* from what the code *proves*, state the business and user objectives, and defend success criteria using exact files rather than opinions.

---

## 2.1 The problem, explained simply

Imagine you have an idea for a flowchart. You open a normal drawing tool and face an empty grid. You must place every rectangle, type every label, and drag every arrow yourself. Or you ask a chatbot, which gives you a paragraph *describing* the flowchart — but you cannot move its boxes because it is only text.

AI Whiteboard is built around a different idea: **describe the diagram in one sentence, receive editable canvas objects, then keep working.** The marketing page states this as a slogan:

```tsx
// app/page.tsx:512-517
<blockquote className="m-text-2 pc-q">
  <span className="pc-l l-a">If you can</span>
  <span className="pc-l l-b">describe it,</span>
  <span className="pc-l l-a">you can</span>
  <span className="pc-l l-b pc-in">draw it<span className="pc-dot">.</span></span>
</blockquote>
```

In plain language, that is the product thesis. In professional terms, it is a *natural-language-to-structured-document* system: a prompt is transformed into an Excalidraw scene (`elements`, `files`, and a deliberately limited `appState`) that stays user-editable.

**[IMPLEMENTED]** The mechanism exists: `lib/ai-tools.ts` defines `DiagramResult` as `{ title, width, height, nodes, connections }`; `lib/ai-canvas.ts:181` `diagramToElements()` converts that result into native Excalidraw element objects; and `components/whiteboard/assistant-panel.tsx:99-102` writes them into the live scene through `api.updateScene()`.

---

## 2.2 Stated objectives (from the repository's own copy)

"Stated" means the author wrote the intent down in a file we can quote. It does **not** mean the intent is fully implemented.

| Stated objective | Exact evidence | Status |
| --- | --- | --- |
| Turn a sentence into a diagram on the canvas | `app/page.tsx:340-343`: "prompt the assistant to turn a sentence into a diagram, flowchart, architecture map, mockup or mindmap — right on the same canvas" | **[IMPLEMENTED]** via `app/api/ai/route.ts` and `lib/ai-canvas.ts` |
| Output stays editable | `app/page.tsx:177-179` (FAQ: "ordinary canvas elements — every shape, label and arrow is fully editable by hand") | **[IMPLEMENTED]** `makeNode()` and `makeArrow()` in `lib/ai-canvas.ts` produce plain elements |
| No install, browser-only | `app/page.tsx:173-175` | **[IMPLEMENTED]** web routes in `app/`; no desktop package in `package.json` |
| Cloud autosave | `app/page.tsx:181-183`: "Boards autosave to the cloud as you work" | **[IMPLEMENTED]** debounced `PATCH` in `components/whiteboard/whiteboard-canvas.tsx:35-69` |
| Export PNG | `app/page.tsx:185-187` | **[IMPLEMENTED]** `exportBoardToPng()` in `lib/export.ts:7` |
| Three paid tiers and credit packs | `app/page.tsx:110-150` (`PLANS`), `lib/pricing.ts:15-75` (`PLANS`, `CREDIT_PACKS`) | **[PARTIAL]** prices/copy are display data only; no checkout route or payment SDK exists |
| "Unlimited boards" on Free | `app/page.tsx:116`, `lib/pricing.ts:27` | **[PARTIAL]** contradicted by `POST /api/boards:39-53`, which spends one credit per board |

The last row is the single most important contradiction to remember in an interview. The FAQ says one credit = one AI scene (`app/page.tsx:169-171`), but board creation also decrements credit:

```ts
// app/api/boards/route.ts:38-43
// Atomic credit decrement — prevents concurrent requests from both passing.
const [deducted] = await db
  .update(schema.users)
  .set({ credit: sql`${schema.users.credit} - 1` })
  .where(and(eq(schema.users.id, user.id), gt(schema.users.credit, 0)))
  .returning({ credit: schema.users.credit });
```

**[EVIDENCE GAP]** No product requirements document records whether board creation was *meant* to cost a credit. The code is authoritative; the pricing copy is not.

---

## 2.3 Inferred objectives (from code, not from prose)

These objectives have no dedicated statement in the repository. They are inferred from what the implementation protects against.

1. **[IMPLEMENTED] Make ownership unforgeable.** Every board read and write is scoped by `userId`: `getBoard(userId, boardId)` in `lib/boards.ts:74-90`, and the `WHERE id = ? AND userId = ?` clauses in `app/api/boards/[id]/route.ts:63-72` and `action/route.ts:43-52`. Why: an incrementing board ID would otherwise be guessable.
2. **[IMPLEMENTED] Never charge for a model failure.** `app/api/ai/route.ts:129-133`, `141-149`, and `157-163` each refund `credit + 1`. Why: trust — a failed request should not consume a paid generation.
3. **[IMPLEMENTED] Make the database the concurrency referee.** Both credit gates use one conditional `UPDATE ... WHERE credit > 0 RETURNING credit` rather than read-then-write. Why: two simultaneous requests must not both spend the last credit (Chapter 11 covers the SQL).
4. **[IMPLEMENTED] Keep the marketing surface cheap to animate but safe for reduced-motion users.** `components/landing/landing-motion.tsx:10-15` checks `prefers-reduced-motion: reduce`, skips GSAP/Lenis setup, and at line 341 makes the clipped hero visible. `app/landing.css` also has `@media (prefers-reduced-motion: no-preference)` guards (lines 645, 1633).
5. **[IMPLEMENTED] Keep heavy UI out of the initial bundle.** `components/whiteboard/excalidraw-wrapper.tsx:8-25` uses `dynamic(..., { ssr: false })`; `lib/export.ts:110` dynamically imports `jspdf` only for PDF export.
6. **[IMPLEMENTED] Fail soft when infrastructure is absent.** `app/provider.tsx:26-28` silently ignores a failed `/api/user` fetch; `components/dashboard/board-list.tsx:72-77` shows a configuration hint instead of crashing.

**[EVIDENCE GAP]** There is no recorded reason for choosing these designs. They are inferred from behaviour; Chapter 4 revisits the same gap for library choices.

---

## 2.4 Business objectives versus user goals

A useful distinction for interviews: a *business objective* protects the commercial model; a *user goal* is what a person wants from the product.

| Layer | Objective | Code that serves it | Label |
| --- | --- | --- | --- |
| Business | Acquire sign-ups without a card | `app/page.tsx:311-313` CTA "Start free — 3 credits"; `db/schema.ts:14` default `credit = 3` | **[IMPLEMENTED]** |
| Business | Constrain expensive Gemini usage | `app/api/ai/route.ts:22-29` model/rate constants; `:92-96` atomic debit | **[IMPLEMENTED]** |
| Business | Present upgrade paths | `lib/pricing.ts` and `components/landing/pricing-section.tsx` | **[PARTIAL]** display only |
| Business | Understand usage/retention | No analytics SDK or event table | **[EVIDENCE GAP]** |
| User | Start from a blank board or a template | `board-list.tsx:91-113` `createBoard()`; `templates.tsx:89-110` `start()` | **[IMPLEMENTED]** |
| User | Get an editable draft quickly | `assistant-panel.tsx:62-113` `handleGenerate()` | **[IMPLEMENTED]** |
| User | Never lose work | `whiteboard-canvas.tsx:71-93` debounce + unmount flush; `workspace.tsx:42-50` unsaved-change guard | **[PARTIAL]** last-write-wins; no offline queue or conflict resolution |
| User | Organize and recover boards | `listBoards()` scope filter; `action/route.ts` archive/restore; `DELETE ...?permanent=1` | **[IMPLEMENTED]** |
| User | Show work to someone without an account | `PATCH { share: "enable" }` → `/share/[token]` | **[IMPLEMENTED]** |
| User | Take the work elsewhere | `lib/export.ts` PNG/SVG/PDF | **[PARTIAL]** FAQ promises "high-resolution PNG"; only PNG/SVG/PDF exist, no "export project" round-trip |

---

## 2.5 Success criteria you can observe in code

A strong success criterion is *falsifiable*: you can point to a line and say "if this changes, the criterion fails."

| # | Observable criterion | Where to verify | Label |
| --- | --- | --- | --- |
| SC-1 | A new DB user starts with 3 credits | `db/schema.ts:14` `integer("credit").notNull().default(3)` | **[IMPLEMENTED]** |
| SC-2 | Board creation and AI generation each spend exactly 1 | `api/boards/route.ts:39-43`; `api/ai/route.ts:92-96` | **[IMPLEMENTED]** |
| SC-3 | AI failures refund 1 credit | `api/ai/route.ts:129-133, 141-149, 157-163` | **[IMPLEMENTED]** |
| SC-4 | Rate limit is 10 requests/minute per user | `api/ai/route.ts:27-43` `AI_RATE_LIMIT`, `AI_RATE_WINDOW_MS` | **[PARTIAL]** in-memory map resets on restart; not shared across instances |
| SC-5 | App state does not round-trip through autosave | `whiteboard-canvas.tsx:77-78`: `void appState; pending.current = { elements, appState: {}, files }` | **[IMPLEMENTED]** |
| SC-6 | Share tokens are 32 hex chars, revocable, non-expiring | `api/boards/[id]/route.ts:55-60` `randomUUID().replace(/-/g, "")`, `null` on disable; `db/schema.ts:33` no expiry column | **[IMPLEMENTED]** |
| SC-7 | Dashboard lists do not fetch full scene JSON | `lib/boards.ts:7-16` `summaryColumns` | **[IMPLEMENTED]** |
| SC-8 | Thumbnails are capped and throttled | `api/boards/[id]/route.ts:47-50` 2,000,000 chars; `whiteboard-canvas.tsx:11` 30,000 ms | **[IMPLEMENTED]** |
| SC-9 | Reduced-motion users get a static but visible landing | `landing-motion.tsx:10-15, 340-341` | **[IMPLEMENTED]** |
| SC-10 | Correctness is regression-protected | No test script, no test files, no CI workflow | **[EVIDENCE GAP]** not observable; see Chapter 17 |
| SC-11 | Production behaviour is observable | `console.error` only in routes; no monitoring SDK | **[EVIDENCE GAP]** see Chapter 19 |

Why SC-5 matters for the problem statement: the product promises "your board comes back exactly as you left it", but the implementation intentionally drops `appState` (viewport, selection, active tool) and saves only elements and files. **[IMPLEMENTED]** with a scope limit — Chapter 15 traces the consequences.

---

## 2.6 Non-goals (things deliberately or factually absent)

Be precise: "not built" is different from "explicitly rejected". No rejection record exists, so these are labelled by evidence, not intent.

| Non-goal | Evidence | Label |
| --- | --- | --- |
| Multiplayer / presence / CRDT | No websocket or CRDT dependency in `package.json`; autosave is last-write-wins | **[EVIDENCE GAP]** not implemented |
| Payments / subscription billing | `lib/pricing.ts` is plain data; no Stripe dependency, checkout, or webhook route | **[EVIDENCE GAP]** not implemented |
| Team workspaces / shared ownership | `whiteboards.userId` is one owner column (`db/schema.ts:22-24`) | **[EVIDENCE GAP]** not implemented |
| Tests, CI, monitoring, analytics | `package.json:5-13` scripts contain no test; no `.github/workflows`; no SDK imports | **[EVIDENCE GAP]** not implemented |
| Share-link expiry / password | `db/schema.ts` has `shareToken` but no expiry or password column; tokens are revocable only | **[IMPLEMENTED]** revocation; **[EVIDENCE GAP]** expiry |
| Fine-tuning / RAG / image generation | `api/ai/route.ts:105-125` is prompt + JSON schema only | **[EVIDENCE GAP]** not implemented |
| Migrations committed to repo | `drizzle.config.ts:8` outputs to `./drizzle`, but no `drizzle/` directory exists in the checkout | **[EVIDENCE GAP]** setup relies on `npm run db:push` |

---

## 2.7 Assumptions and evidence gaps to confirm with the author

1. **[EVIDENCE GAP]** Is charging 1 credit for *board creation* intentional? The error text says "You've used all your board credits" (`api/boards/route.ts:48-50`), which suggests yes, while the FAQ says credits are for AI scenes.
2. **[EVIDENCE GAP]** What currency and billing period do the plans use? `app/page.tsx:120,134,147` shows `£0 / £9 / £24`, while `lib/pricing.ts:37,38,55,56` has USD-style numbers (12 monthly, 9 yearly; 29 monthly, 24 yearly), and `components/landing/pricing-section.tsx:88` renders `$`. No checkout resolves the difference.
3. **[EVIDENCE GAP]** Is `components/landing/pricing-section.tsx` and `faq-section.tsx` intentionally unused? `app/page.tsx:4` imports only `LandingMotion`; the pricing and FAQ sections are hard-coded inside `app/page.tsx` itself.
4. **[EVIDENCE GAP]** README line 15 lists `html-to-image`, but `package.json` does not; exports use Excalidraw's own `exportToBlob`/`exportToSvg` (`lib/export.ts:3`).
5. **[EVIDENCE GAP]** No live database/Gemini verification is recorded; `.env.example` documents the needed variables but the study guide cannot claim a production run happened.

**Why this matters:** a requirement you cannot trace to a file is a requirement you cannot debug. Chapters 3 and 6 turn these observations into a traceability matrix and a file map.

---

## 2.8 Revision summary

- The core problem: blank canvases and text-only AI output; the thesis is "describe it, get editable elements".
- Objectives are split into **stated** (landing copy, FAQ, pricing) and **inferred** (ownership, refunds, atomic credits, reduced motion).
- Business objectives (acquisition, usage control, upgrade presentation) are partly implemented; monetization itself is not.
- User goals (create, generate, autosave, organize, share, export) are implemented with scope limits, not promises.
- Eleven success criteria are falsifiable from source, including the 3-credit default, atomic debits/refunds, `appState: {}`, and 32-hex share tokens.
- Six non-goals are confirmed absent; the most important are payments, multiplayer, tests/CI, and monitoring.
- Major evidence gaps: credit semantics, pricing currency, unused landing components, README dependency mismatch, no live verification.

## 2.9 Knowledge checks

1. Which exact line proves a new user starts with three credits, and why is that a business rather than purely technical decision?
2. State the contradiction between `app/page.tsx` pricing copy and `POST /api/boards`, and explain which one the working software follows.
3. Give two inferred objectives that are enforced in server code rather than advertised in marketing copy, naming the files.
4. What makes SC-5 (`appState: {}`) both an implemented behaviour and a limitation of the "comes back exactly as you left it" promise?
5. Name three non-goals and cite the file evidence that proves each is absent rather than merely undocumented.

## 2.10 Practical exercises

1. **Evidence sort:** Take the six FAQ answers in `app/page.tsx:167-192`. For each, mark `[IMPLEMENTED]`, `[PARTIAL]`, or `[EVIDENCE GAP]` and write the verifying file path next to it.
2. **Criteria audit:** Rewrite SC-4 and SC-10 as tests you could run manually with two browser tabs and no test runner. Describe the exact UI observation that would fail each criterion.
3. **Objective repair:** Choose one contradiction from §2.7 (credit semantics or pricing). Write a one-paragraph product decision and list the exact files that would need editing to make copy and code agree. Do not change code.

## 2.11 Interview questions

1. "What problem does this project solve, and which part of your solution is the most technically interesting?"
2. "Which of your objectives are evidenced by code, and which are only claimed by marketing copy?"
3. "Why does creating a board consume a credit even though the FAQ says credits are for AI generations?"
4. "Name a success criterion you can verify in one line of code and one you cannot verify at all."
5. "What are your project's explicit non-goals, and how did you decide what to leave out?"
