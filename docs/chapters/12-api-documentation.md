# Chapter 12 — API Documentation

**Goal:** By the end of this chapter you can describe every HTTP endpoint in the project — its auth rule, inputs, outputs, status codes and exact error bodies — and explain why the API looks the way it does, using only the five `route.ts` files as evidence.

---

## 12.1 The API surface in plain language

The browser never talks to the database directly: it calls `/api` URLs. Each is a **route handler** (`route.ts`) running on the server in Next.js 16.4.6 (`package.json`, `next`).

[IMPLEMENTED] There are exactly **five** route handler files, exporting **eight** HTTP methods:

| # | Method + path | Purpose (one line) | Implementation file |
| --- | --- | --- | --- |
| 1 | `POST /api/user` | Create or refresh the current user's DB row | `app/api/user/route.ts` |
| 2 | `GET /api/user` | Read the current user's DB row, creating it if absent | `app/api/user/route.ts` |
| 3 | `GET /api/boards` | List boards for one scope + return current credit | `app/api/boards/route.ts` |
| 4 | `POST /api/boards` | Create a board and atomically spend 1 credit | `app/api/boards/route.ts` |
| 5 | `PATCH /api/boards/[id]` | Update title/scene/favorite/share/thumbnail | `app/api/boards/[id]/route.ts` |
| 6 | `DELETE /api/boards/[id]` | Soft-delete (trash) or permanently delete a board | `app/api/boards/[id]/route.ts` |
| 7 | `POST /api/boards/[id]/action` | Archive, unarchive or restore a board | `app/api/boards/[id]/action/route.ts` |
| 8 | `POST /api/ai` | Generate a diagram and atomically spend 1 credit | `app/api/ai/route.ts` |

[IMPLEMENTED] All responses are JSON produced with `NextResponse.json(...)`; there is no separate serialization layer. [EVIDENCE GAP] There is no OpenAPI/Swagger file, no `/v1` prefix, no Zod schema library, and no generated client — clients hand-write `fetch` calls (e.g. `createBoard()` in `components/dashboard/board-list.tsx`).

Professionally: a **resource-oriented RPC hybrid** — board endpoints are CRUD nouns, `/api/ai` is a command. Contracts are implicit TypeScript types (`PatchBody`, `ActionBody`, `Body`) erased at runtime.

---

## 12.2 Auth conventions you must know before reading endpoints

[IMPLEMENTED] Two helper functions in `lib/user.ts` provide two different auth guarantees:

```ts
// lib/user.ts
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}
```

**Line-level reading:** L2 `auth()` reads the Clerk session on the server; L3–L5 throw a typed error when there is no session; L8–L13 define the sentinel class that route handlers use to distinguish "not signed in" (401) from "something else broke" (500).

[IMPLEMENTED] `getDbUserOrUpsert()` (`lib/user.ts`) calls `getDbUser()` first and only upserts when no row exists, using `.onConflictDoUpdate({ target: schema.users.id, set: { name, email } })`. So **every board endpoint implicitly provisions the user** on first use.

[PARTIAL] Auth is enforced inside handlers, not by the middleware: `proxy.ts` exports `clerkMiddleware()` with no `.protect()` call. See Chapter 13.

---

## 12.3 `POST /api/user` and `GET /api/user`

### `POST /api/user`

| Field | Value |
| --- | --- |
| Purpose | Upsert the signed-in Clerk user into the `users` table |
| Auth | Required — via `upsertDbUser()` → `requireUserId()` |
| Params / body | None. The handler signature is `POST()` with no `request` argument |
| Success | `200` with `{ user }` |
| Errors | `401 {"error":"Unauthorized"}`, `500 {"error":"Internal error"}` |
| File | `app/api/user/route.ts` |

```ts
// app/api/user/route.ts
export async function POST() {
  try {
    const user = await upsertDbUser();
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/user failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Line-level:** L4 calls `upsertDbUser()`; L5 returns the whole row; L7–L9 map `UnauthorizedError` to 401; L10–L11 log other errors and return a generic 500.

[IMPLEMENTED] Real response (fields come from `db/schema.ts`, `users`; `credit` defaults to 3):

```json
{
  "user": {
    "id": "user_2abc123def456",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "credit": 3,
    "createdAt": "2026-11-23T10:00:00.000Z"
  }
}
```

**Why:** `app/provider.tsx` calls it once Clerk reports `isSignedIn` and stores `id/name/email/credit` in `lib/store.ts`; `createdAt` is ignored.

### `GET /api/user`

[IMPLEMENTED] Same contract and error bodies, but calls `getDbUserOrUpsert()`: it returns the existing row unchanged instead of rewriting `name` and `email`. Used by `components/whiteboard/workspace.tsx` to re-sync the credit badge when a board opens.

---

## 12.4 `GET /api/boards` and `POST /api/boards`

### `GET /api/boards`

| Field | Value |
| --- | --- |
| Purpose | List the current user's boards in one scope and return their credit |
| Auth | Required via `getDbUserOrUpsert()` |
| Query param | `scope` = `active` (default), `archived`, `trashed`; anything else silently becomes `active` |
| Body | None |
| Success | `200 { boards: BoardSummary[], credit: number }` |
| Errors | `401`, `500` with the standard bodies |
| File | `app/api/boards/route.ts` (handler `GET`) |

```ts
// app/api/boards/route.ts
const user = await getDbUserOrUpsert();
const scopeParam = new URL(request.url).searchParams.get("scope");
const scope =
  scopeParam === "archived" || scopeParam === "trashed"
    ? scopeParam
    : "active";
const boards = await listBoards(user.id, scope);
return NextResponse.json({ boards, credit: user.credit });
```

**Line-level:** L1 guarantees a DB user; L2–L5 whitelist `scope`; L6 calls `listBoards()`; L7 returns summaries plus credit.

[IMPLEMENTED] `listBoards()` selects only `summaryColumns`, so scene JSON is not shipped to the dashboard; `toSummary()` derives `archived`, `deleted`, `trashed` from the two timestamps.

[IMPLEMENTED] Real response for `GET /api/boards?scope=active`:

```json
{
  "boards": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "title": "Sprint retro",
      "thumbnail": "data:image/png;base64,iVBORw0KGgoAAA...",
      "favorited": true,
      "archived": false,
      "deleted": false,
      "trashed": false,
      "createdAt": "2026-11-23T10:00:00.000Z",
      "updatedAt": "2026-11-23T10:04:11.000Z"
    }
  ],
  "credit": 2
}
```

### `POST /api/boards`

| Field | Value |
| --- | --- |
| Purpose | Create one board and spend exactly one credit |
| Auth | Required via `getDbUserOrUpsert()` |
| Query param | None |
| Body | `{ "title"?: string }` — parsed with `request.json().catch(() => ({}))`, so invalid/missing JSON is tolerated |
| Success | `201` with `{ board, credit }` |
| Errors | `401`, `402 {"error":"You've used all your board credits. Upgrade to create more whiteboards."}`, `500` |
| File | `app/api/boards/route.ts` (handler `POST`) |

```ts
// app/api/boards/route.ts
    // Atomic credit decrement — prevents concurrent requests from both passing.
    const [deducted] = await db
      .update(schema.users)
      .set({ credit: sql`${schema.users.credit} - 1` })
      .where(and(eq(schema.users.id, user.id), gt(schema.users.credit, 0)))
      .returning({ credit: schema.users.credit });

    if (!deducted) {
      return NextResponse.json(
        {
          error:
            "You've used all your board credits. Upgrade to create more whiteboards.",
        },
        { status: 402 },
      );
    }
```

**Line-level:** L1 introduces the atomic debit; L2–L6 are one conditional SQL `UPDATE ... WHERE credit > 0 ... RETURNING`; L8–L16 turn "no row returned" into 402. Just above this excerpt, the title is trimmed/defaulted and `crypto.randomUUID()` creates the id; the `whiteboards` insert happens only after the debit.

[IMPLEMENTED] Request/response example:

```json
// Request
{ "title": "Sprint retro" }
```
```json
// 201 response
{
  "board": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "title": "Sprint retro",
    "thumbnail": null,
    "archived": false,
    "deleted": false,
    "createdAt": "2026-11-23T10:00:00.000Z",
    "updatedAt": "2026-11-23T10:00:00.000Z"
  },
  "credit": 2
}
```

[PARTIAL] The response omits `favorited`, `shareToken` and `trashed`; the editor page (`app/board/[id]/page.tsx` → `boardToData()`) supplies those fields.

---

## 12.5 `PATCH /api/boards/[id]` and `DELETE /api/boards/[id]`

### `PATCH /api/boards/[id]`

| Field | Value |
| --- | --- |
| Purpose | One endpoint for rename, autosave, favorite, and share toggling |
| Auth | Required; ownership checked twice (see below) |
| Path param | `id` — must be a non-empty string (`{ params }: RouteContext`, awaited because Next.js 16 params are a Promise) |
| Body | `PatchBody`: `title`, `elements`, `appState`, `files`, `thumbnail`, `favorited`, `share` |
| Success | `200` with `{ board }` |
| Errors | `400 {"error":"Invalid board ID"}`, `401`, `404 {"error":"Not found"}`, `500` |
| File | `app/api/boards/[id]/route.ts` |

```ts
// app/api/boards/[id]/route.ts (PATCH)
    const board = await getBoard(user.id, id);
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as PatchBody;
    const update: Partial<typeof schema.whiteboards.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.title === "string" && body.title.trim()) {
      update.title = body.title.trim().slice(0, 120);
    }
```

**Line-level:** L1 is owner-filtered `getBoard()`; L2–L4 turn "missing/not mine" into 404 (never 403); L6 tolerates invalid JSON as `{}`; L7–L9 bump `updatedAt`; L11–L13 trim and cap the title at 120 chars.

All seven body fields are optional: `elements` replaces the JSONB array, `appState`/`files` replace their JSONB objects (autosave deliberately sends `appState: {}` from `whiteboard-canvas.tsx`), `thumbnail` stores a base64 data URL or is cleared with `null`, and `favorited` sets the boolean. Runtime checks are in the validation table (12.8); invalid values are silently skipped rather than rejected.

[IMPLEMENTED] Share generation and the update that enforces ownership:

```ts
    if (body.share === "enable" && !board.shareToken) {
      update.shareToken = randomUUID().replace(/-/g, "");
    }
    if (body.share === "disable") {
      update.shareToken = null;
    }
```

**Line-level:** L1–L2 make enabling idempotent (an existing token is never rotated); L4–L5 revoke by nulling. The subsequent SQL (`.where(and(eq(whiteboards.id, id), eq(whiteboards.userId, user.id)))`) repeats the owner predicate on the write itself, closing a check-then-write race.

[IMPLEMENTED] Request/response example:

```json
// Request: PATCH /api/boards/9b1deb4d-... with { "share": "enable" }
{
  "board": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "title": "Sprint retro",
    "thumbnail": null,
    "favorited": true,
    "shareToken": "a1b2c3d4e5f60718293a4b5c6d7e8f90",
    "archived": false,
    "deleted": false,
    "createdAt": "2026-11-23T10:00:00.000Z",
    "updatedAt": "2026-11-23T10:06:00.000Z"
  }
}
```

[PARTIAL] Unknown body keys are ignored, and invalid values for a known key are **silently skipped** rather than rejected — e.g. a 3 MB thumbnail produces `200` with no thumbnail change.

### `DELETE /api/boards/[id]`

| Field | Value |
| --- | --- |
| Purpose | Trash a board, or permanently delete it with `?permanent=1` |
| Auth | Required; `getBoard(user.id, id)` then owner-scoped `delete`/`update` |
| Query param | `permanent=1` (exact string `"1"`) switches to hard delete |
| Body | None |
| Success | `200 {"ok":true}` for permanent; `200 {"board":{...}}` for trash |
| Errors | `400`, `401`, `404`, `500` |
| File | `app/api/boards/[id]/route.ts` (handler `DELETE`) |

```ts
    const permanent = new URL(request.url).searchParams.get("permanent") === "1";
    const db = getDb();

    if (permanent) {
      await db
        .delete(schema.whiteboards)
        .where(
          and(
            eq(schema.whiteboards.id, id),
            eq(schema.whiteboards.userId, user.id),
          ),
        );
      return NextResponse.json({ ok: true });
    }
```

**Line-level:** L1 parses the flag; L4–L13 are a hard delete guarded by both id and owner; L14 returns `{ok:true}`. The following (omitted) branch runs `db.update(...).set({ deletedAt: new Date(), updatedAt: new Date() })` with the same owner predicate. Because `deletedAt` is read by `app/share/[token]/page.tsx`, trashing invalidates the public link.

---

## 12.6 `POST /api/boards/[id]/action`

| Field | Value |
| --- | --- |
| Purpose | Move a board between active / archived / trash scopes |
| Auth | Required via `getDbUserOrUpsert()` + `getBoard(user.id, id)` |
| Path param | `id`, validated as a non-empty string |
| Body | `{ "action": "archive" \| "unarchive" \| "restore" }` |
| Success | `200 { board }` (same shape as `PATCH`, without `shareToken`) |
| Errors | `400 {"error":"Invalid board ID"}`, `400 {"error":"Invalid or missing action. Allowed: archive, unarchive, restore"}`, `401`, `404`, `500` |
| File | `app/api/boards/[id]/action/route.ts` |

```ts
    const action = body.action;
    if (!action || !["archive", "unarchive", "restore"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid or missing action. Allowed: archive, unarchive, restore" },
        { status: 400 },
      );
    }

    const user = await getDbUserOrUpsert();
    const board = await getBoard(user.id, id);
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
```

**Line-level:** L2–L6 validate the enum at runtime (TypeScript types are erased); L8–L12 check auth/ownership → 404. Later lines set `archivedAt = new Date()` for archive, `null` for unarchive, and clear **both** timestamps for restore.

[IMPLEMENTED] Request/response example:

```json
// Request
{ "action": "restore" }
```
```json
// 200 response
{
  "board": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "title": "Sprint retro",
    "thumbnail": null,
    "favorited": false,
    "archived": false,
    "deleted": false,
    "createdAt": "2026-11-23T10:00:00.000Z",
    "updatedAt": "2026-11-23T10:09:00.000Z"
  }
}
```

---

## 12.7 `POST /api/ai`

| Field | Value |
| --- | --- |
| Purpose | Call Gemini with a tool prompt + canvas rules, return a diagram, spend/refund 1 credit |
| Auth | Required via `requireUserId()`; 401 uses a bare `catch` rather than `UnauthorizedError` |
| Body | `{ userInput?: string, tool?: Pick<AiTool,"id"\|"name"\|"prompt">, systemPrompt?: string }` |
| Runtime | `export const runtime = "nodejs"` in `app/api/ai/route.ts` |
| Success | `200 { success: true, diagram: DiagramResult, credit: number }` |
| Errors | `400`, `401`, `402`, `429`, `500`, `502`, `503` (see table below) |
| File | `app/api/ai/route.ts` |

```ts
  const userInput = (body.userInput ?? "").trim();
  if (!userInput) {
    return NextResponse.json(
      { error: "Describe what you want to generate." },
      { status: 400 },
    );
  }
  if (userInput.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters).` },
      { status: 400 },
    );
  }
```

**Line-level:** L1 trims; L2–L6 reject empty input; L7–L11 enforce `MAX_PROMPT_LENGTH = 4000`. These guards run **after** the rate-limit check, so invalid requests still consume a slot.

[IMPLEMENTED] Model and credit logic:

```ts
  // Atomic credit decrement — deduct BEFORE calling Gemini so concurrent
  // requests can't both pass the balance check.
  const db = getDb();
  const [deducted] = await db
    .update(users)
    .set({ credit: sql`${users.credit} - 1` })
    .where(and(eq(users.id, userId), gt(users.credit, 0)))
    .returning({ credit: users.credit });

  if (!deducted) {
    return NextResponse.json(
      { error: "Insufficient credits. You have used all of your generations." },
      { status: 402 },
    );
  }
```

**Line-level:** L1–L2 explain the ordering; L4–L8 repeat board creation's atomic conditional update; L10–L14 return 402 at zero balance. The debit precedes the Gemini call; failures refund with `credit + 1`. `MODEL` is `process.env.GEMINI_MODEL ?? "gemini-2.5-flash"` (line 22 of the same file).

[IMPLEMENTED] Real success response (shape from `DiagramResult` in `lib/ai-tools.ts`):

```json
{
  "success": true,
  "diagram": {
    "title": "Onboarding flow",
    "width": 1200,
    "height": 800,
    "nodes": [
      { "id": "n1", "x": 100, "y": 100, "width": 180, "height": 70, "label": "Landing", "shape": "rectangle" }
    ],
    "connections": [
      { "fromId": "n1", "toId": "n2", "label": "Yes" }
    ]
  },
  "credit": 1
}
```

[IMPLEMENTED] Error bodies (verbatim strings from `app/api/ai/route.ts`):

| Status | Body | Trigger |
| --- | --- | --- |
| 401 | `{"error":"Unauthorized"}` | `requireUserId()` throws |
| 429 | `{"error":"Too many requests. Please wait a moment."}` | `isRateLimited(userId)` — 10 requests per 60 000 ms |
| 400 | `{"error":"Invalid JSON"}` | `req.json()` throws |
| 400 | `{"error":"Describe what you want to generate."}` | blank `userInput` |
| 400 | `{"error":"Prompt is too long (max 4000 characters)."}` | length > 4000 |
| 503 | `{"error":"AI generation is temporarily unavailable."}` | `GEMINI_API_KEY` missing |
| 402 | `{"error":"Insufficient credits. You have used all of your generations."}` | atomic debit returned no row |
| 502 | `{"error":"The model returned an empty response."}` | `response.text` falsy — refunded |
| 502 | `{"error":"The model did not produce any nodes. Try a more specific prompt."}` | `diagram.nodes?.length` falsy — refunded |
| 500 | `{"error":"AI generation failed. Please try again."}` | thrown error / `JSON.parse` failure — best-effort refund |

---

## 12.8 Non-API routes, status table and validation table

[IMPLEMENTED] **Sharing is not an API endpoint.** `/share/[token]` is a Server Component page (`app/share/[token]/page.tsx`) calling `getBoardByShareToken(token)` and rendering `SharedWhiteboard` with `viewModeEnabled`. No `route.ts`, no JSON, no session check — the token is the capability (Chapter 13). Missing, trashed, or DB-error rows yield `notFound()`.

[IMPLEMENTED] Complete status-code map:

| Code | Meaning here | Endpoints that emit it |
| --- | --- | --- |
| 200 | JSON success | all GET/PATCH/DELETE/action/AI success, `POST /api/user` |
| 201 | Board created | `POST /api/boards` |
| 400 | Bad id, bad action, bad/empty/long JSON input | board `[id]`, action, AI |
| 401 | No Clerk session | all eight |
| 402 | No credits | `POST /api/boards`, `POST /api/ai` |
| 404 | Board not found or not owned | PATCH, DELETE, action; share page |
| 429 | AI rate limit | `POST /api/ai` |
| 500 | Unhandled server error | all five files |
| 502 | Gemini produced unusable output | `POST /api/ai` (refunded) |
| 503 | Gemini key not configured | `POST /api/ai` |

[IMPLEMENTED] Validation inventory — exact checks:

| Input | Rule | Where |
| --- | --- | --- |
| Board `id` (path) | non-empty string | `PATCH`/`DELETE`/`action` route handlers |
| Board `title` | trim, then `.slice(0, 120)` | `PATCH` in `[id]/route.ts` |
| Create title | trim, default `"Untitled board"` | `POST /api/boards` |
| `scope` | only `archived`/`trashed`, else `active` | `GET /api/boards` |
| `permanent` | query value exactly `"1"` | `DELETE` |
| `action` | one of 3 strings | `POST /api/boards/[id]/action` |
| `share` | `"enable"`/`"disable"` | `PATCH` |
| Thumbnail | string with `length <= 2_000_000` or `null` | `PATCH` |
| `elements` | `Array.isArray` | `PATCH` |
| `appState`, `files` | truthy object | `PATCH` |
| AI `userInput` | trim; non-empty; `<= 4000` chars | `POST /api/ai` |
| AI JSON | must parse | `POST /api/ai` (`req.json()` catch) |
| AI rate | 10 per 60 000 ms per Clerk user id | `isRateLimited()` in `app/api/ai/route.ts` |

[SUGGESTED IMPROVEMENT] Replace per-handler casts with a shared validator so invalid values return 400 instead of being silently dropped, and publish a machine-readable contract. [EVIDENCE GAP] No request IDs, no `Retry-After` header on 429, no idempotency keys, and no automated contract tests exist in the repository.

## 12.9 Revision summary

- There are five `route.ts` files implementing eight HTTP methods; all return `NextResponse.json`.
- `requireUserId()` throws `UnauthorizedError`; handlers translate that to 401 and unexpected errors to 500.
- `getDbUserOrUpsert()` makes board endpoints self-provisioning for a signed-in Clerk user.
- `POST /api/boards` and `POST /api/ai` each decrement credit with one conditional SQL update and return 402 when it fails.
- `PATCH /api/boards/[id]` is a multi-purpose endpoint: rename, scene autosave, favorite, and revocable share token.
- `DELETE` soft-deletes by default; only `?permanent=1` removes the row.
- `/share/[token]` is a Server Component page, not an API — there is no share route handler.

## 12.10 Knowledge checks

1. Which helper does `GET /api/boards` call for auth, and how does it differ from the helper used by `POST /api/ai`?
2. What exact JSON body and status does `POST /api/boards` return when the user has zero credits?
3. Why does `PATCH /api/boards/[id]` check ownership twice — once via `getBoard()` and once in the SQL `WHERE`?
4. List the three possible `action` values and state what `restore` changes in the database.
5. Name three 400-level AI error bodies and one 5xx error that triggers a credit refund.

## 12.11 Practical exercises

1. **Contract table:** Open all five `route.ts` files and build your own one-page table with columns method, path, success status, error statuses and file. Then add a column naming the exact `lib/` function each handler calls.
2. **Curl the happy path:** With a local dev server and valid Clerk credentials, issue `POST /api/boards` with `{"title":"API practice"}`, then `PATCH /api/boards/<id>` with `{"favorited":true}` and `{"share":"enable"}`. Record the two different JSON shapes and identify which field appears only in the PATCH response.
3. **Break it deliberately:** Send `POST /api/ai` with a 4001-character `userInput` and with `{}`. Compare the two 400 bodies, then send 11 rapid requests and record the 429 body. Explain which guard runs first.

## 12.12 Interview questions

1. How would you document and version this API if the team grew to five developers?
2. Why is `PATCH /api/boards/[id]` used for both autosave and sharing instead of separate endpoints?
3. What are the consequences of returning 404 instead of 403 for a board that belongs to someone else?
4. How does the atomic `UPDATE ... WHERE credit > 0 RETURNING` pattern prevent overspending, and what database property makes it safe?
5. Which endpoint is most likely to fail in production, and what would you add to its contract to make failures diagnosable?
