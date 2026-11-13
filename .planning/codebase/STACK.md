---
last_mapped_commit: 16423a0ae31aefefda1072fc337aaa1115d819ab
last_mapped_at: 2026-11-13
---
# Technology Stack

**Analysis Date:** 2026-11-13

## Languages

**Primary:**

- TypeScript 5 (`tsconfig.json`, `package.json`) - Used across entire application: App Router routes, UI components, database queries, and client state stores.

**Secondary:**

- CSS / PostCSS (`app/globals.css`, `app/landing.css`, `components/ui/light-rays.css`) - Tailwind CSS v4 stylesheets, custom animation keyframes, and Swiss-design system variables.

## Runtime

**Environment:**

- Node.js (>=20 based on `@types/node` ^20) with ES2017 target and bundler module resolution.

**Package Manager:**

- npm
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**

- Next.js 16.4.2 (App Router with Turbopack) - Full-stack React framework, Server Components, Route Handlers, and proxy middleware.
- React 19.3.0 & React DOM 19.3.0 - UI rendering engine and hooks.

**Testing:**

- Not detected (No test runner or testing library installed in `package.json`).

**Build/Dev:**

- Turbopack via Next.js CLI (`next dev`, `next build`, `next start`)
- Tailwind CSS v4 (`@tailwindcss/turbopack`, `tailwindcss` ^4)
- ESLint 9 (`eslint.config.mjs`, `eslint-config-next` 16.4.2)
- Drizzle Kit 0.31.11 (`drizzle.config.ts`) - Database migrations and schema push tooling.

## Key Dependencies

**Critical:**

- `@excalidraw/excalidraw` (0.18.1) - Embeddable infinite whiteboard canvas engine (`components/whiteboard/excalidraw-wrapper.tsx`, `components/whiteboard/whiteboard-canvas.tsx`).
- `@clerk/nextjs` (7.9.18) - Authentication and user management middleware (`proxy.ts`, `lib/user.ts`, `app/sign-in/`, `app/sign-up/`).
- `@neondatabase/serverless` (1.0.0) - HTTP-based serverless Postgres connection driver (`db/index.ts`).
- `drizzle-orm` (0.45.3) - Type-safe SQL ORM for schema definitions and queries (`db/schema.ts`, `db/index.ts`, `lib/boards.ts`).
- `@google/genai` (2.0.0) - Google GenAI SDK for Gemini diagram and flowchart generation (`app/api/ai/route.ts`).
- `zustand` (5.0.8) - Lightweight client-side reactive store for whiteboard and user state (`lib/whiteboard-store.ts`, `lib/store.ts`).

**Infrastructure & UI:**

- `@base-ui/react` (1.9.0) - Unstyled headless accessible primitives.
- `class-variance-authority` (0.7.1) & `clsx` (1.1.1) - Variant and class management (`lib/utils.ts`, `components/ui/button.tsx`).
- `lucide-react` (1.61.0) - Icon set for interface controls and actions.
- `sonner` (2.0.8) - Toast notifications (`components/ui/sonner.tsx`).
- `jspdf` (4.2.1) - Client-side PDF generation for board export (`lib/export.ts`).
- `gsap` (3.13.0), `lenis` (1.3.27), `motion` (14.5.0) - Smooth scroll and timeline animations on the landing page (`components/landing/landing-motion.tsx`, `components/landing/board-scenes.tsx`).

## Configuration

**Environment:**

- Configured via `.env.local` for local development (sample documented in `.env.example`).
- Runtime checks in `db/index.ts` and `app/api/ai/route.ts` ensure required variables exist before execution.

**Build:**

- `next.config.ts`: Configures Turbopack rule for `@tailwindcss/turbopack` loading `*.css`.
- `tsconfig.json`: Defines `@/*` path mapping to project root `./*`, `moduleResolution: "bundler"`, and Next.js compiler plugin.
- `drizzle.config.ts`: Configures schema at `./db/schema.ts`, migration output at `./drizzle`, and connection URL from `DATABASE_URL`.
- `eslint.config.mjs`: Flat config inheriting Next.js Web Vitals and TypeScript configs with custom ignores for `.next` and `out`.

## Platform Requirements

**Development:**

- Node.js 20+, npm.
- Neon PostgreSQL database instance (`DATABASE_URL`).
- Clerk application instance (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
- Google Gemini API key (`GEMINI_API_KEY`).

**Production:**

- Vercel or Node.js server container supporting Next.js 16 App Router.
- Hosted Neon PostgreSQL database.

---

*Stack analysis: 2026-11-13*
