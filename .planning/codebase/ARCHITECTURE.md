---
last_mapped_commit: 16423a0ae31aefefda1072fc337aaa1115d819ab
last_mapped_at: 2026-11-13
---
<!-- refreshed: 2026-11-13 -->

# Architecture

**Analysis Date:** 2026-11-13

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Client UI (Browser)                             │
├─────────────────────┬─────────────────────┬─────────────────────────────────┤
│    Landing Page     │  Dashboard Views    │      Whiteboard Workspace       │
│   `app/page.tsx`    │ `app/dashboard/`    │    `app/board/[id]/page.tsx`    │
│  `components/       │ `components/        │    `components/whiteboard/`     │
│   landing/`         │  dashboard/`        │  (Excalidraw, AI Panel, Header) │
└──────────┬──────────┴──────────┬──────────┴────────────────┬────────────────┘
           │                     │                           │
           ▼                     ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Next.js 16 Server / Route Handlers                       │
│  - Middleware: `proxy.ts` (Clerk Authentication)                           │
│  - User: `app/api/user/route.ts` & `lib/user.ts`                            │
│  - Boards: `app/api/boards/route.ts` & `app/api/boards/[id]/route.ts`       │
│  - Board Actions: `app/api/boards/[id]/action/route.ts`                     │
│  - AI Generator: `app/api/ai/route.ts` & `lib/ai-canvas.ts`                 │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌───────────────────────┐ ┌───────────────┐ ┌─────────────────────────┐
│     Neon Postgres     │ │  Clerk Auth   │ │      Google Gemini      │
│  `db/index.ts`        │ │  (@clerk/     │ │   `@google/genai`       │
│  `db/schema.ts`       │ │   nextjs)     │ │   (`gemini-2.5-flash`)  │
└───────────────────────┘ └───────────────┘ └─────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `WhiteboardWorkspace` | Manages active board state, auto-save triggers, and orchestrates header/canvas/AI panels | `components/whiteboard/workspace.tsx` |
| `WhiteboardCanvas` | Client-only dynamic wrapper rendering Excalidraw and binding imperative API to store | `components/whiteboard/whiteboard-canvas.tsx` |
| `ExcalidrawWrapper` | Direct bridge to `@excalidraw/excalidraw` with SSR disabled | `components/whiteboard/excalidraw-wrapper.tsx` |
| `AssistantPanel` | Interactive prompt drawer for triggering AI diagrams, mindmaps, and mockups | `components/whiteboard/assistant-panel.tsx` |
| `WorkspaceHeader` | Board title editing, autosave indicator, export dropdown, share modal, and credit badge | `components/whiteboard/workspace-header.tsx` |
| `SharedWhiteboard` | Read-only view for public links with disabled canvas tools | `components/whiteboard/shared-whiteboard.tsx` |
| `BoardList` | Dashboard board grid/list view with search, filter scopes, and action menus | `components/dashboard/board-list.tsx` |
| `TemplatesDialog` | Template picker initiating pre-filled AI board prompts | `components/dashboard/templates.tsx` |

## Pattern Overview

**Overall:** Next.js App Router (Full-Stack Monolith) with Server Components for layout/data loading and Client Components for canvas and interactive panels.

**Key Characteristics:**

- Dynamic Client Isolation: Excalidraw canvas is dynamically imported with `ssr: false` to ensure zero hydration mismatch with browser canvas APIs (`components/whiteboard/whiteboard-canvas.tsx`).
- Debounced Local-to-Server Autosave: Canvas modifications trigger an in-memory dirty state and debounced HTTP `PATCH` save with thumbnail generation (`components/whiteboard/workspace.tsx`).
- Schema-Guided AI Generation: Gemini outputs are constrained to strict JSON schemas (`lib/ai-tools.ts`) and translated deterministically to Excalidraw scene nodes (`lib/ai-canvas.ts`).

## Layers

**Presentation Layer (Client):**

- Purpose: Render user interface, animations, Excalidraw canvas, and handle user interactions.
- Location: `app/page.tsx`, `app/dashboard/`, `app/board/`, `components/`
- Contains: React Server & Client Components, CSS styling (`app/landing.css`, `app/globals.css`), Zustand hooks.
- Depends on: Route Handlers (`/api/*`), Zustand stores (`lib/whiteboard-store.ts`), Clerk SDK.
- Used by: End users in browser.

**API / Server Layer:**

- Purpose: Authentication enforcement, request validation, business logic, AI orchestration, and database access.
- Location: `proxy.ts`, `app/api/`, `lib/boards.ts`, `lib/user.ts`
- Contains: Next.js Route Handlers (`route.ts`), Clerk middleware, schema definitions.
- Depends on: Neon Postgres via Drizzle, Google GenAI SDK.
- Used by: Presentation layer components and external browsers.

**Persistence / Integration Layer:**

- Purpose: Data storage, ORM mappings, external API connectivity.
- Location: `db/index.ts`, `db/schema.ts`
- Contains: Drizzle table schemas (`users`, `whiteboards`), Neon HTTP client factory.
- Depends on: `@neondatabase/serverless`, `@google/genai`.
- Used by: Route handlers and server components.

## Data Flow

### Primary Request Path (Canvas Editing & Autosave)

1. User modifies canvas in browser (`components/whiteboard/whiteboard-canvas.tsx:32`).
2. `onChange` triggers `useWhiteboardStore.getState().markDirty()` and calls debounced `scheduleSave()` (`components/whiteboard/workspace.tsx:102`).
3. After debounce (800ms), `captureThumbnail(api)` generates thumbnail data URL (`lib/export.ts:121`).
4. `PATCH /api/boards/[id]` sends elements, appState, files, and thumbnail (`app/api/boards/[id]/route.ts:45`).
5. Route handler validates authenticated user ownership via `getBoard(userId, id)` (`lib/boards.ts:50`).
6. Drizzle updates row in Neon Postgres (`app/api/boards/[id]/route.ts:78`).
7. Store marks status as saved: `useWhiteboardStore.getState().setSaved()` (`components/whiteboard/workspace.tsx:135`).

### AI Diagram Generation Flow

1. User enters prompt in AI panel and clicks "Generate" (`components/whiteboard/assistant-panel.tsx:82`).
2. Client places temporary placeholder elements on canvas (`components/whiteboard/assistant-panel.tsx:94`).
3. `POST /api/ai` is called with prompt and tool metadata (`app/api/ai/route.ts:24`).
4. Route handler validates user session and checks user credit balance (`credit > 0`) (`app/api/ai/route.ts:67`).
5. Calls Google Gemini `generateContent` with JSON schema enforcement (`app/api/ai/route.ts:85`).
6. On success, decrements user credits by 1 in Postgres (`app/api/ai/route.ts:110`).
7. Returns parsed diagram elements; client replaces placeholder using `diagramToElements()` (`lib/ai-canvas.ts:120`) and scrolls viewport to new diagram.

**State Management:**

- Client-side state managed via Zustand: `useWhiteboardStore` in `lib/whiteboard-store.ts` (board ID, title, dirty/saving status, Excalidraw API instance) and `useUserStore` in `lib/store.ts` (user profile and credits).
- Server-side state persisted in Neon PostgreSQL via Drizzle ORM.

## Key Abstractions

**Board Data / Summary:**

- Purpose: Typed representation of whiteboards distinguishing lightweight metadata lists from full heavy canvas state.
- Examples: `BoardSummary`, `BoardData` in `lib/types.ts`.
- Pattern: Data Transfer Object (DTO) mapper pattern (`toSummary()` and `boardToData()` in `lib/boards.ts`).

**AI Tools & Diagram Result:**

- Purpose: Structured contract between user prompt types, Gemini JSON response schema, and Excalidraw element generators.
- Examples: `AI_TOOLS`, `RESPONSE_SCHEMA`, `DiagramResult` in `lib/ai-tools.ts`.
- Pattern: Schema validation and factory mapping in `lib/ai-canvas.ts`.

**Database Client Singleton:**

- Purpose: Shared database connection pooling across serverless invocations.
- Examples: `getDb()` in `db/index.ts`.
- Pattern: Cached singleton function.

## Entry Points

**Web Application Routes:**

- Landing Page: `app/page.tsx` - Public landing experience with GSAP and Swiss-design aesthetics.
- Dashboard: `app/dashboard/page.tsx` - Authenticated hub listing boards, templates, and actions.
- Whiteboard Workspace: `app/board/[id]/page.tsx` - Authenticated full-screen canvas editor.
- Public Share: `app/share/[token]/page.tsx` - Public read-only board viewer.

**Middleware:**

- `proxy.ts` - Next.js 16 entry interceptor running `clerkMiddleware()` for route matching.

## Architectural Constraints

- **Single-Threaded Canvas Rendering:** Excalidraw renders on the browser main thread via HTML5 Canvas; large scenes (>1,000 elements) must manage element count to maintain 60fps.
- **SSR Restriction:** Excalidraw cannot be evaluated on Node.js server runtimes due to window/canvas dependencies; all canvas components must use dynamic imports with `ssr: false`.
- **Stateless Serverless Handlers:** Neon database connectivity uses HTTP fetch transport (`@neondatabase/serverless`), avoiding persistent TCP socket requirements.

## Anti-Patterns

### Inline Base64 Thumbnail Storage

**What happens:** Canvas thumbnails are captured as base64 data URLs and stored directly in the `whiteboards.thumbnail` text column in PostgreSQL (`db/schema.ts:32`, `app/api/boards/[id]/route.ts:60`).
**Why it's wrong:** Bloats database table rows and row read bandwidth when listing boards, instead of storing thumbnails in an object bucket (S3, Cloudflare R2).
**Do this instead:** Upload thumbnail image blobs to dedicated object storage and store a clean public URL reference in the database row.

### Non-Atomic Credit Check and Decrement

**What happens:** Credit balance is checked first, then Gemini is called, and finally credit is decremented with `credit: sql\`${users.credit} - 1\`` (`app/api/ai/route.ts:67-111`).
**Why it's wrong:** Under concurrent requests from the same user, multiple requests can pass the `credit <= 0` guard simultaneously before any decrement completes.
**Do this instead:** Deduct credits conditionally using an atomic SQL update (`UPDATE users SET credit = credit - 1 WHERE id = $1 AND credit > 0 RETURNING credit`) prior to triggering AI generation.

## Error Handling

**Strategy:** Defensive try/catch blocks in API routes returning JSON error payloads with standard HTTP status codes (400, 401, 404, 500, 503). Client toast notifications via Sonner.

**Patterns:**

- Authentication guards throw `UnauthorizedError` caught by API handlers returning 401 (`lib/user.ts:14`, `app/api/boards/route.ts:19`).
- AI generation errors clean up temporary canvas placeholders and alert users via toast messages (`components/whiteboard/assistant-panel.tsx:126`).

## Cross-Cutting Concerns

**Logging:** Standard console output (`console.error`, `console.log`) inside server handlers.
**Validation:** Request body parsing and type assertions in API routes; credit limits enforced before external API calls.
**Authentication:** Clerk middleware protects private routes; `requireUserId()` helper enforces identity in server-side handlers.

---

*Architecture analysis: 2026-11-13*
