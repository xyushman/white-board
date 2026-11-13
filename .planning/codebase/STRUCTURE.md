---
last_mapped_commit: 16423a0ae31aefefda1072fc337aaa1115d819ab
last_mapped_at: 2026-11-13
---
# Codebase Structure

**Analysis Date:** 2026-11-13

## Directory Layout

```
Ai-WhiteBoard/
├── app/                  # Next.js App Router pages, layouts, and API handlers
│   ├── api/              # Server route handlers (/api/ai, /api/boards, /api/user)
│   ├── board/[id]/       # Authenticated whiteboard workspace editor
│   ├── dashboard/        # Authenticated dashboard views and layout
│   ├── share/[token]/    # Public read-only board viewer
│   ├── sign-in/          # Clerk authentication sign-in catch-all route
│   ├── sign-up/          # Clerk authentication sign-up catch-all route
│   ├── globals.css       # Tailwind CSS base and theme rules
│   ├── landing.css       # Swiss/Evenkeel custom stylesheet for landing
│   ├── layout.tsx        # Root HTML layout with ClerkProvider & Toaster
│   ├── page.tsx          # Public marketing landing page
│   └── provider.tsx      # Client context wrapper
├── components/           # Reusable React components
│   ├── animations/       # GSAP/Framer motion reveal and scroll animations
│   ├── dashboard/        # Board grid, templates dialog, and credit badges
│   ├── landing/          # Landing sections (scenes, motion, pricing, FAQ)
│   ├── ui/               # Base UI and shadcn UI primitives (dialog, button, dropdown)
│   └── whiteboard/       # Workspace, Excalidraw canvas, header, assistant drawer
├── db/                   # Database schemas and connection factories
│   ├── index.ts          # Drizzle client instance for Neon PostgreSQL
│   └── schema.ts         # Table definitions for users and whiteboards
├── docs/                 # Extended technical documentation
├── hooks/                # Custom React hooks (e.g. use-in-view)
├── lib/                  # Application core logic, stores, and utilities
│   ├── ai-canvas.ts      # Excalidraw element builders and coordinate mappers
│   ├── ai-tools.ts       # Gemini prompt definitions and JSON response schemas
│   ├── boards.ts         # Board queries, filters, and serialization helpers
│   ├── export.ts         # Client-side PNG, SVG, PDF, and thumbnail exports
│   ├── pricing.ts        # Subscription pricing constants
│   ├── store.ts          # Zustand user and credit store
│   ├── types.ts          # TypeScript domain interfaces and DTOs
│   ├── user.ts           # Clerk auth checking and database user sync
│   ├── utils.ts          # UI styling helper (cn utility)
│   └── whiteboard-store.ts # Zustand store for active board canvas and save state
├── public/               # Static assets (SVGs and brand assets)
├── drizzle.config.ts     # Drizzle Kit database configuration
├── eslint.config.mjs     # ESLint flat configuration
├── next.config.ts        # Next.js compiler and Turbopack settings
├── package.json          # Node dependencies, scripts, and project metadata
├── proxy.ts              # Next.js 16 Clerk middleware
└── tsconfig.json         # TypeScript compiler path aliases and compiler options
```

## Directory Purposes

**`app/`:**

- Purpose: Application routing, server rendering, route layout trees, and API endpoints.
- Contains: Next.js pages, layouts, CSS files, and route handlers.
- Key files: `app/layout.tsx`, `app/page.tsx`, `app/board/[id]/page.tsx`, `app/api/ai/route.ts`, `app/api/boards/route.ts`.

**`components/`:**

- Purpose: Client and server React components split into feature domains.
- Contains: Whiteboard canvas wrappers, dashboard elements, landing page animations, and UI primitives.
- Key files: `components/whiteboard/workspace.tsx`, `components/whiteboard/whiteboard-canvas.tsx`, `components/whiteboard/assistant-panel.tsx`, `components/dashboard/board-list.tsx`.

**`db/`:**

- Purpose: Database configuration and PostgreSQL table schema models.
- Contains: Schema definitions and database connection factories.
- Key files: `db/schema.ts`, `db/index.ts`.

**`lib/`:**

- Purpose: Pure utilities, domain services, store definitions, and export helpers.
- Contains: Business logic independent of component JSX.
- Key files: `lib/boards.ts`, `lib/ai-canvas.ts`, `lib/ai-tools.ts`, `lib/whiteboard-store.ts`, `lib/user.ts`, `lib/export.ts`.

**`hooks/`:**

- Purpose: Shared React custom hooks for DOM events and view tracking.
- Contains: Custom hooks.
- Key files: `hooks/use-in-view.ts`.

## Key File Locations

**Entry Points:**

- `app/page.tsx`: Application home and landing experience.
- `app/board/[id]/page.tsx`: Whiteboard editor workspace entry point.
- `app/dashboard/page.tsx`: User dashboard entry point.
- `app/share/[token]/page.tsx`: Public shared whiteboard viewer.
- `proxy.ts`: Next.js 16 middleware entry point running Clerk route protection.

**Configuration:**

- `next.config.ts`: Next.js configuration and Turbopack CSS rules.
- `tsconfig.json`: TypeScript compiler options with `@/*` path mapping.
- `drizzle.config.ts`: Drizzle ORM migration configuration.
- `eslint.config.mjs`: ESLint flat configuration.

**Core Logic:**

- `lib/ai-canvas.ts`: Converts AI structured diagram outputs into Excalidraw element definitions.
- `lib/ai-tools.ts`: Defines prompt templates and Gemini JSON schema specifications.
- `lib/boards.ts`: Encapsulates board queries and status mapping.
- `lib/whiteboard-store.ts`: Reactive state management for canvas interactions and autosave.

**Testing:**

- Not detected (No tests present in codebase).

## Naming Conventions

**Files:**

- Kebab-case for general components and library files: `assistant-panel.tsx`, `ai-canvas.ts`, `whiteboard-store.ts`.
- Next.js conventions for route segments: `page.tsx`, `layout.tsx`, `route.ts`, `[id]`, `[token]`, `[[...sign-in]]`.

**Directories:**

- Kebab-case for general directories: `components/whiteboard`, `components/ui`.
- Next.js dynamic folders: `[id]`, `[token]`, `[[...sign-in]]`, `[[...sign-up]]`.

## Where to Add New Code

**New Feature (e.g. Collaboration / Realtime):**

- Primary server code: Create new route in `app/api/<feature>/route.ts`.
- Domain service: Add helpers to `lib/<feature>.ts`.
- UI Components: Add components under `components/<feature>/`.
- Types: Add domain interfaces to `lib/types.ts`.

**New Canvas AI Tool:**

- Tool definition & schema: Add new entry to `AI_TOOLS` in `lib/ai-tools.ts`.
- Generator logic: Add layout handling to `lib/ai-canvas.ts`.
- UI Integration: Register tool in `components/whiteboard/assistant-panel.tsx` and `components/dashboard/templates.tsx`.

**New Database Entity / Migration:**

- Table Schema: Add table definitions to `db/schema.ts`.
- Migration: Run `npm run db:generate` to produce migrations or `npm run db:push` to apply directly to Neon.

**Utilities:**

- Shared helpers: Add to `lib/utils.ts` or create focused utility file in `lib/`.

## Special Directories

**`.next/`:**

- Purpose: Next.js compilation cache and build outputs.
- Generated: Yes.
- Committed: No (in `.gitignore`).

**`.planning/`:**

- Purpose: GSD workflow planning, project specifications, and codebase maps.
- Generated: Yes.
- Committed: Yes.

**`drizzle/`:**

- Purpose: Drizzle Kit SQL migrations directory.
- Generated: Yes (when running `npm run db:generate`).
- Committed: Yes.

---

*Structure analysis: 2026-11-13*
