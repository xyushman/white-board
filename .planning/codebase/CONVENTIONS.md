---
last_mapped_commit: 16423a0ae31aefefda1072fc337aaa1115d819ab
last_mapped_at: 2026-11-13
---
# Coding Conventions

**Analysis Date:** 2026-11-13

## Naming Patterns

**Files:**

- Kebab-case for source files and components: `assistant-panel.tsx`, `ai-canvas.ts`, `whiteboard-store.ts`.
- Next.js reserved file conventions: `page.tsx`, `layout.tsx`, `route.ts`, `proxy.ts`, `globals.css`.

**Functions:**

- camelCase for helper functions, utilities, and queries: `getBoard()`, `toSummary()`, `requireUserId()`, `captureThumbnail()`, `diagramToElements()`.
- PascalCase for React component functions: `WhiteboardWorkspace()`, `AssistantPanel()`, `WorkspaceHeader()`, `BoardList()`.

**Variables:**

- camelCase for variables, object properties, and state: `boardId`, `userInput`, `finalPrompt`, `lastSavedAt`.
- SCREAMING_SNAKE_CASE for top-level module constants and schemas: `CANVAS_RULES`, `RESPONSE_SCHEMA`, `AI_TOOLS`, `MODEL`.

**Types:**

- PascalCase for TypeScript type aliases and interfaces: `BoardSummary`, `BoardData`, `DiagramResult`, `AiTool`, `User`, `Whiteboard`.

## Code Style

**Formatting:**

- Indentation: 2 spaces.
- Semicolons: Always used.
- Quotes: Double quotes preferred for strings and JSX attributes.

**Linting:**

- Tool: ESLint 9 using Flat Config format (`eslint.config.mjs`).
- Configurations extended: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
- Command: `npm run lint`.

## Import Organization

**Order:**

1. React / Next.js core imports (`react`, `next/server`, `next/dynamic`, `@clerk/nextjs`).
2. Third-party dependencies (`drizzle-orm`, `@neondatabase/serverless`, `@google/genai`, `zustand`, `lucide-react`).
3. Internal project modules using the `@/*` alias (`@/db`, `@/lib/*`, `@/components/*`).
4. Type-only imports using `import type { ... }` syntax.

**Path Aliases:**

- Configured in `tsconfig.json`: `@/*` maps to `./*`. Always use `@/` for imports across directories instead of deep relative paths (`../../`).

## Error Handling

**Patterns:**

- Custom typed errors for specific domain failures, such as `UnauthorizedError` in `lib/user.ts:14`.
- Server Route Handlers wrap operations in try/catch blocks and return uniform JSON error objects:
  ```typescript
  try {
    const userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```
- Standard HTTP status codes used:
  - `400` Bad Request (missing or invalid payload)
  - `401` Unauthorized (missing Clerk session)
  - `402` Payment / Credits Required (insufficient user credits)
  - `404` Not Found (board not found or user lacks ownership)
  - `502` Bad Gateway (Gemini API empty response or model failure)
  - `503` Service Unavailable (missing API keys)
- Client-side notifications use `toast.error(message)` from `sonner`.

## Logging

**Framework:** Native Node.js `console` methods.

**Patterns:**

- `console.error` inside catch blocks in route handlers (`app/api/ai/route.ts:121`, `app/api/boards/[id]/route.ts:40`).
- No production logging framework (Pino/Winston) currently attached.

## Comments

**When to Comment:**

- Minimal prose comments; code is structured to be self-explanatory.
- Comments are used to clarify non-obvious canvas element geometry calculations (`lib/ai-canvas.ts`).

**JSDoc/TSDoc:**

- Primarily standard TypeScript interfaces rather than extensive JSDoc comment blocks.

## Function Design

**Size:**

- Single-responsibility functions under 50 lines where possible. Complex canvas rendering in `lib/ai-canvas.ts` breaks layout into discrete helper generators (`generateFlowchart`, `generateArchitecture`, etc.).

**Parameters:**

- Functions with more than 2 parameters use typed destructured options objects.

**Return Values:**

- Explicit return types on exported functions (`Promise<BoardSummary[]>`, `Promise<User>`).

## Module Design

**Exports:**

- Named exports preferred for domain services, UI components, and stores.
- Default exports used strictly where required by Next.js conventions (`app/**/page.tsx`, `app/**/layout.tsx`, `proxy.ts`, `next.config.ts`).

**Barrel Files:**

- Avoid large barrel files. Modules are imported directly from their specific locations (`@/lib/boards`, `@/lib/user`, `@/lib/export`).

---

*Convention analysis: 2026-11-13*
