---
last_mapped_commit: 16423a0ae31aefefda1072fc337aaa1115d819ab
last_mapped_at: 2026-11-13
---
# Testing Patterns

**Analysis Date:** 2026-11-13

## Test Framework

**Runner:**

- Not detected (No test runner currently installed in `package.json`).
- Recommended framework: Vitest for unit/integration tests and Playwright for browser E2E canvas tests.

**Assertion Library:**

- None installed.

**Run Commands:**

```bash

# Current available check command:

npm run lint           # Runs ESLint across project

# Recommended commands once test runner is introduced:

# npx vitest run       # Run unit and integration tests

# npx vitest --watch   # Watch mode during development

# npx vitest --coverage# Generate code coverage report

```

## Test File Organization

**Location:**

- Currently: No test files exist in the codebase.
- Recommended pattern: Co-located unit tests adjacent to source files (`lib/boards.test.ts`, `lib/ai-canvas.test.ts`) and end-to-end tests under an `e2e/` root directory.

**Naming:**

- Standard recommended pattern: `*.test.ts`, `*.test.tsx`, `*.spec.ts`.

**Structure:**

```
Ai-WhiteBoard/
├── e2e/                     # Recommended for Playwright end-to-end tests
│   ├── auth.spec.ts
│   ├── board-crud.spec.ts
│   └── canvas.spec.ts
├── lib/
│   ├── ai-canvas.ts
│   └── ai-canvas.test.ts    # Co-located unit tests
└── components/
    └── whiteboard/
        ├── assistant-panel.tsx
        └── assistant-panel.test.tsx
```

## Test Structure

**Suite Organization Pattern (Recommended for Vitest):**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { boardToData } from "@/lib/boards";

describe("boardToData", () => {
  it("correctly converts database row to BoardData DTO", () => {
    const mockRow = {
      id: "board-1",
      userId: "user-1",
      title: "Test Board",
      elements: [{ id: "elem-1", type: "rectangle" }],
      appState: { viewBackgroundColor: "#ffffff" },
      files: {},
      thumbnail: null,
      shareToken: null,
      favorited: false,
      deletedAt: null,
      archivedAt: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    };

    const result = boardToData(mockRow);
    expect(result.id).toBe("board-1");
    expect(result.title).toBe("Test Board");
    expect(result.elements).toHaveLength(1);
  });
});
```

## Mocking

**Framework:** Recommended: Vitest (`vi.mock()`).

**Recommended Mocking Patterns:**

**Mocking Clerk Auth (`lib/user.ts`):**

```typescript
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "mock-user-id" }),
  currentUser: vi.fn().mockResolvedValue({
    firstName: "Test",
    lastName: "User",
    emailAddresses: [{ emailAddress: "test@example.com" }],
  }),
}));
```

**Mocking Neon Database Client (`db/index.ts`):**

```typescript
vi.mock("@/db", () => ({
  getDb: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  }),
  schema: {},
}));
```

**Mocking Gemini AI API (`app/api/ai/route.ts`):**

```typescript
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            title: "Test Diagram",
            description: "Generated test",
            elements: [],
          }),
        }),
      },
    })),
    Type: {},
  };
});
```

**What to Mock:**

- Network boundaries: Neon PostgreSQL HTTP client, Clerk API services, Google Gemini GenAI SDK.
- Browser Canvas context when running in headless Node.js test environments.

**What NOT to Mock:**

- Pure functions in `lib/ai-canvas.ts` (element coordinate math, bounding box calculations).
- DTO conversion helpers in `lib/boards.ts`.
- Utility string manipulation functions in `lib/utils.ts`.

## Coverage

**Requirements:** None enforced.
**View Coverage:** Not configured.

## Test Types

**Unit Tests:**

- Not implemented. Priority candidates: `lib/ai-canvas.ts` (geometry calculation tests) and `lib/boards.ts` (data mapping and filter conditions).

**Integration Tests:**

- Not implemented. Priority candidates: API route handlers (`app/api/boards/route.ts`, `app/api/ai/route.ts`) with mock database and Clerk session.

**E2E Tests:**

- Not implemented. Priority candidates: Full board creation, Excalidraw element drawing, share link generation, and client export flows.

---

*Testing analysis: 2026-11-13*
