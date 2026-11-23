# Chapter 4 — Technology Stack

**Goal:** By the end of this chapter you can recite the exact versions in `package.json`, explain each dependency's job from source, separate runtime from build-time tools, and state confidently which technologies are *not* in this project.

---

## 4.1 Beginner framing: what "stack" means here

A stack is the set of tools that work together to deliver the product. Think of it in three buckets:

1. **Runtime dependencies** — shipped into the app and needed while it runs.
2. **Dev dependencies** — used to build, type-check, lint, and generate database files.
3. **External services** — not npm packages at all, but reachable through keys: Clerk, Neon, Gemini, Google Fonts, Unsplash (landing images).

The authoritative version list is `package.json`. **[EVIDENCE GAP]** No architecture decision record (ADR) exists, so every "why we chose X over Y" in this chapter is an *analytical* comparison reasoned from how the library is used, not a recorded author decision. Where README and code disagree, code wins.

```json
// package.json:5-13
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
},
```

**Line-level reading:** no `test` script and no `db:migrate` script exist, even though `README.md:69-71` documents `npm run db:migrate`. That mismatch is an evidence gap, not a hidden feature.

---

## 4.2 Runtime dependencies (verbatim versions)

| Package | Version in `package.json` | Where it is used | Label |
| --- | --- | --- | --- |
| `next` | **16.4.6** (exact pin) | App Router, server components, route handlers, `proxy.ts`, Turbopack | **[IMPLEMENTED]** |
| `react` / `react-dom` | **19.3.0** (exact pin) | All UI; RSC model in server pages | **[IMPLEMENTED]** |
| `@clerk/nextjs` | `^7.9.18` | `ClerkProvider`, `auth()`, `currentUser()`, `SignIn`, `SignUp`, `Show`, `UserButton` | **[IMPLEMENTED]** |
| `@excalidraw/excalidraw` | `^0.18.1` | Canvas, exporters, element types (`excalidraw-wrapper.tsx`, `lib/export.ts`, `lib/ai-canvas.ts`) | **[IMPLEMENTED]** |
| `@google/genai` | `^2.0.0` | `GoogleGenAI` + `Type` in `app/api/ai/route.ts:2,115` | **[IMPLEMENTED]** |
| `@neondatabase/serverless` | `^1.0.0` | `neon(url)` in `db/index.ts:1,14` | **[IMPLEMENTED]** |
| `drizzle-orm` | `^0.45.3` | `pgTable` schema, query builders, `sql` for atomic decrements | **[IMPLEMENTED]** |
| `zustand` | `^5.0.8` | `useUserStore` (`lib/store.ts:17`) and `useWhiteboardStore` (`lib/whiteboard-store.ts:31`) | **[IMPLEMENTED]** |
| `@base-ui/react` | `^1.9.0` | Headless primitives behind `components/ui/*` (e.g. `button.tsx:1`, `dialog.tsx`) | **[IMPLEMENTED]** |
| `class-variance-authority` | `^0.7.1` | `cva()` in `components/ui/button.tsx:2,5` and `badge.tsx`/`tabs.tsx` | **[IMPLEMENTED]** |
| `cn` | `^0.5.0` | Re-exported by `lib/utils.ts:1`; imported directly by many `components/ui/*` | **[IMPLEMENTED]** |
| `clsx` | `^1.1.1` | Installed but no source import found | **[EVIDENCE GAP]** unused direct dependency |
| `lucide-react` | `^1.61.0` | All icons in dashboard/header/panel | **[IMPLEMENTED]** |
| `sonner` | `^2.0.8` | `Toaster` wrapper in `components/ui/sonner.tsx` | **[IMPLEMENTED]** |
| `next-themes` | `^0.4.6` | `useTheme()` inside `components/ui/sonner.tsx:3,8` | **[IMPLEMENTED]** |
| `gsap` | `^3.13.0` | ScrollTrigger choreography in `landing-motion.tsx:4-8` | **[IMPLEMENTED]** |
| `lenis` | `^1.3.27` | Smooth wheel scrolling in `landing-motion.tsx:6,25-34` | **[IMPLEMENTED]** |
| `motion` | `^14.5.0` | `motion/react` in `components/animations/*`, `pricing-section.tsx`, several `ui/*` | **[IMPLEMENTED]** but mostly in components not imported by rendered routes |
| `ogl` | `^1.0.11` | WebGL renderer in `components/ui/light-rays.tsx:4` | **[IMPLEMENTED]** in an unreferenced UI component |
| `jspdf` | `^4.2.1` | Dynamic import only in `lib/export.ts:110` | **[IMPLEMENTED]** |
| `tw-animate-css` | `^1.4.0` | Animation utility CSS (dependency; imported via global styles) | **[IMPLEMENTED]** |
| `shadcn` | `^4.22.1` | CLI package; `components.json` configures generated components | **[IMPLEMENTED]** as tooling, not runtime UI |

---

## 4.3 Dev dependencies (verbatim versions)

| Package | Version | Job | Label |
| --- | --- | --- | --- |
| `typescript` | `^5` | Strict type checking; `tsconfig.json:7` `"strict": true` | **[IMPLEMENTED]** |
| `@types/node` | `^20` | Node typings (`crypto`, `process`) | **[IMPLEMENTED]** |
| `@types/react` / `@types/react-dom` | `^19` | React 19 typings | **[IMPLEMENTED]** |
| `tailwindcss` | `^4` | Utility CSS; `globals.css` uses v4 tokens | **[IMPLEMENTED]** |
| `@tailwindcss/turbopack` | `^4` | Turbopack CSS loader in `next.config.ts:14-21` | **[IMPLEMENTED]** |
| `eslint` | `^9` | `npm run lint` | **[IMPLEMENTED]** |
| `eslint-config-next` | `16.4.6` | Flat configs imported in `eslint.config.mjs:2-3` | **[IMPLEMENTED]** |
| `drizzle-kit` | `^0.31.11` | `db:generate`, `db:push`, `db:studio`; config in `drizzle.config.ts` | **[IMPLEMENTED]** |
| `dotenv` | `^17.4.2` | Loads `.env.local` for Drizzle Kit (`drizzle.config.ts:1,4`) | **[IMPLEMENTED]** |

**[EVIDENCE GAP]** There is no test runner, test framework, CI tool, bundler analyzer, Sentry SDK, or instrumentation dependency anywhere in `package.json`.

---

## 4.4 Why the current choices fit the evidence

**[EVIDENCE GAP]** The following comparisons are analytical, not documented decisions.

| Choice | What the code needs | Alternative (analytical) | Why the current choice fits the observed design |
| --- | --- | --- | --- |
| Next.js 16.4.6 App Router | Server-side auth + DB reads, client islands, one deployable | Separate Express API + Vite SPA | `app/board/[id]/page.tsx` runs `auth()` and `getBoard()` on the server before rendering; one codebase shares `lib/` with route handlers |
| React 19.3.0 | RSC + hooks | React 18 | App Router's `PageProps<"/board/[id]">` typing depends on the Next/React 19 generated types; `next-env.d.ts` is present |
| Excalidraw 0.18.1 | Editable canvas, element model, exporters | Fabric.js / Konva / hand-rolled SVG | `lib/export.ts:3` imports Excalidraw's own `exportToBlob`/`exportToSvg`, and `lib/ai-canvas.ts` targets its element shape |
| Gemini via `@google/genai` | Constrained JSON output | OpenAI SDK, self-hosted LLM | `api/ai/route.ts:119-124` sets `responseMimeType` and `responseSchema`; the SDK's `Type` is imported at line 2 |
| Neon HTTP + Drizzle | Serverless Postgres access with typed SQL | `pg` pool + Prisma | `db/index.ts:14-15` uses `neon(url)` with `drizzle({ client, schema })`; `sql` template used for atomic decrements |
| Clerk | Hosted auth UI + server session | Auth.js / custom JWT | `app/layout.tsx:42` wraps everything; `auth()` returns `userId` used directly as `users.id` |
| Zustand | Cross-component signals (API handle, save state, credit) | Redux Toolkit / React Context | `useWhiteboardStore` is read directly from non-React code in `lib/export.ts:11` via `getState()` |
| GSAP + Lenis | Scroll-scrubbed marketing choreography | CSS scroll-driven animations / Motion One | `landing-motion.tsx:144-163` uses a scrub ScrollTrigger to drive a CSS variable and task classes |
| Motion | Declarative component reveals | CSS transitions only | `components/animations/*` uses `motion/react`; however these are not imported by `app/page.tsx` — **[EVIDENCE GAP]** |
| Tailwind v4 + scoped CSS | Fast app UI + a bespoke landing design system | CSS modules / styled-components | `next.config.ts:14-21` wires the Turbopack loader, while `app/landing.css` is 1,647 lines of `.ev`-scoped styles |
| jsPDF | PDF from a rendered PNG blob | pdf-lib / browser print | `lib/export.ts:110-125` dynamically imports jsPDF, creates a jsPDF instance sized to the image, and calls `save()` |

Two choices have a documented hardening rationale in comments rather than an ADR:

```ts
// app/api/ai/route.ts:25-26
// ponytail: simple in-memory sliding-window rate limiter per userId.
// Ceiling: resets on deploy / restart. Upgrade to Redis if running multi-instance.
```

```ts
// lib/boards.ts:5-6
// Select only the columns dashboard needs — avoids transferring potentially
// megabytes of base64 thumbnail data per page load.
```

**[IMPLEMENTED]** Both comments describe the current code accurately. **[SUGGESTED IMPROVEMENT]** The first explicitly names Redis as the upgrade path; nothing in this repository implements it.

---

## 4.5 What is NOT used

Memorise this list; it prevents invented answers.

| Not used | Evidence | Label |
| --- | --- | --- |
| Stripe, PayPal, or any payment SDK | No dependency; `lib/pricing.ts` is display constants; no webhook route | **[EVIDENCE GAP]** |
| WebSockets, Yjs, Liveblocks, CRDT | No dependency; autosave is last-write-wins | **[EVIDENCE GAP]** |
| Redis / shared rate-limit store | `Map` in `api/ai/route.ts:27`; comment names Redis as future work | **[EVIDENCE GAP]** |
| Tests (unit/E2E) and CI workflows | No test script/deps; no `.github/workflows` directory | **[EVIDENCE GAP]** |
| Monitoring, tracing, analytics SDKs | Only `console.error` in route handlers | **[EVIDENCE GAP]** |
| Object storage for thumbnails/boards | Thumbnail is base64 text in `whiteboards.thumbnail` (`db/schema.ts:32`) | **[EVIDENCE GAP]** |
| `html-to-image` | `README.md:15` claims it, but `package.json` has no such dependency; exports use Excalidraw (`lib/export.ts:3`) | **[EVIDENCE GAP]** documentation drift |
| `middleware.ts` | Next.js 16 uses `proxy.ts` (`README.md:108`) | **[IMPLEMENTED]** |
| Tailwind v3 config file | `components.json:7` has `"config": ""`; Tailwind v4 uses CSS config | **[IMPLEMENTED]** |
| `clsx` in application code | Installed, but imports use `cn` from `cn` package or `@/lib/utils` | **[EVIDENCE GAP]** unused |
| i18n / localization library | Single `lang="en"` in `app/layout.tsx:44` | **[EVIDENCE GAP]** |

Version note: `README.md:12` says `@google/genai@2.30.0`, while `package.json:18` declares `^2.0.0`. **[EVIDENCE GAP]** The lockfile resolves the concrete version; the README number should not be quoted as authoritative.

---

## 4.6 Dependency-purpose quick reference

Beginner rule: if a dependency is **not** in the table above, do not claim the project uses it.

- **Serve & render:** `next`, `react`, `react-dom`
- **Auth:** `@clerk/nextjs`
- **Persist & query:** `@neondatabase/serverless`, `drizzle-orm`
- **Canvas & export:** `@excalidraw/excalidraw`, `jspdf`
- **AI:** `@google/genai`
- **Client state:** `zustand`
- **UI primitives & styling:** `@base-ui/react`, `class-variance-authority`, `cn`, `clsx` (installed), `lucide-react`, `tailwindcss`, `tw-animate-css`, `next-themes`, `sonner`
- **Motion:** `gsap`, `lenis`, `motion`, `ogl`
- **Build/quality:** `typescript`, `eslint`, `eslint-config-next`, `drizzle-kit`, `dotenv`, `@types/*`, `@tailwindcss/turbopack`, `shadcn`

**Why the split matters for rebuilding (Chapter 25):** you can delete all `devDependencies` from a production image only if you ship prebuilt output; you cannot delete `@excalidraw/excalidraw` without losing the product's core surface.

---

## 4.7 Revision summary

- Authoritative versions come from `package.json`: Next.js **16.4.6**, React **19.3.0**, TypeScript **5**, Tailwind **4**.
- Runtime dependencies are 23 packages; dev dependencies are 10; `clsx` appears to be installed but unused.
- Clerk, Neon, Gemini, Google Fonts, and Unsplash are external services, not npm modules.
- The stack fits the code because it keeps auth/data on the server and the canvas in the browser (`dynamic(..., { ssr: false })`).
- No ADR exists: library "alternatives" are analytical comparisons, explicitly marked as evidence gaps.
- Confirmed absences include payments, multiplayer, Redis, tests/CI, monitoring, object storage, and `html-to-image` despite the README claim.
- `jspdf` is dynamically imported, showing a deliberate bundle-size decision inside the export path.

## 4.8 Knowledge checks

1. Which two dependencies are pinned to exact versions, and why does that matter when upgrading?
2. Name the runtime dependency that is installed but has no source import, and the documentation that names a package not installed.
3. Why do Neon and Drizzle appear together, and what exact line in `db/index.ts` proves the transport?
4. Which three packages power the landing motion, and which one is used in a component that `app/page.tsx` does not import?
5. Explain why `jspdf` is dynamically imported and what would change if it were a static import.

## 4.9 Practical exercises

1. **Version audit:** Open `package.json` and `README.md` side by side. List every version discrepancy and decide which source you would trust in an incident report.
2. **Dependency removal drill:** Choose `@excalidraw/excalidraw`. Grep every import of it and write down the first thing that would fail to compile or render if the package vanished.
3. **Stack replacement note:** Pick one analytical alternative from §4.4 and write a half-page migration note listing the exact files that would change. Mark the note `[SUGGESTED IMPROVEMENT]`.

## 4.10 Interview questions

1. "Walk me through your runtime stack from browser to database."
2. "Why did you use Excalidraw instead of building a canvas engine yourself?"
3. "How is the Gemini SDK constrained so the output is usable?"
4. "Which dependency would you remove first if the bundle were too large, and why?"
5. "What technologies does your project deliberately not use, and how do you know?"
