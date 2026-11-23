# Chapter 6 — Folder Structure and Codebase Explanation

**Goal:** By the end of this chapter you can navigate every important file, explain why it is where it is, predict the first breakage if it were deleted, and spot documentation that no longer matches the code.

---

## 6.1 Beginner framing: folders are a map of responsibility

Folders encode responsibility here: `app/` owns URLs and server boundaries; `components/` owns UI by feature; `db/` owns schema/connection; `lib/` holds non-JSX logic; `hooks/` holds reusable effects; `docs/` is human-only.

**[IMPLEMENTED]** Imports use the `@/*` alias in `tsconfig.json:21-23` (`"@/*": ["./*"]`), so `@/lib/boards` resolves to `lib/boards.ts`.

---

## 6.2 Full annotated tree

```text
Ai-WhiteBoard/
├── AGENTS.md                    Next.js agent rules (re-added by next dev)
├── components.json              shadcn config (base-nova, aliases)
├── drizzle.config.ts            Drizzle Kit: schema, ./drizzle out, dialect
├── eslint.config.mjs            ESLint 9 flat config
├── next-env.d.ts                Generated types (gitignored)
├── next.config.ts               Turbopack CSS loader + security headers
├── package.json                 Versions, scripts, dependency split
├── package-lock.json            Locked dependency graph
├── proxy.ts                     Clerk middleware (Next.js 16 name)
├── tsconfig.json                Strict TS, bundler resolution, @/* alias
├── tsconfig.tsbuildinfo         Build cache (gitignored)
├── .env.example                 Template: Clerk/Neon/Gemini variables
├── .env.local                   Local secrets (gitignored)
├── .gitignore                   Ignores node_modules, .next, .env*, cache
├── app/
│   ├── favicon.ico              Tab icon
│   ├── globals.css              Tailwind v4 app tokens (167 lines)
│   ├── landing.css              .ev-scoped landing CSS (1,647 lines)
│   ├── layout.tsx               ClerkProvider, fonts, metadata, provider, Toaster
│   ├── provider.tsx             "use client"; POST /api/user on sign-in
│   ├── page.tsx                 Public landing (data arrays + sections)
│   ├── global-error.tsx         "use client"; 500 UI with reset
│   ├── not-found.tsx            404 UI
│   ├── dashboard/
│   │   ├── layout.tsx           Server auth guard + header
│   │   └── page.tsx             Renders <BoardList />
│   ├── board/[id]/page.tsx      Auth + getBoard + editor
│   ├── share/[token]/page.tsx   Public token lookup → read-only view
│   ├── sign-in/[[...sign-in]]/page.tsx   Clerk <SignIn />
│   ├── sign-up/[[...sign-up]]/page.tsx   Clerk <SignUp />
│   └── api/
│       ├── user/route.ts        POST upsert, GET get-or-upsert
│       ├── boards/route.ts      GET summaries, POST create (1 credit)
│       ├── boards/[id]/route.ts PATCH scene/title/favorite/share; DELETE
│       ├── boards/[id]/action/route.ts   archive/unarchive/restore
│       └── ai/route.ts          rate limit → debit → Gemini → refund
├── components/
│   ├── landing/                 landing-motion.tsx used; 4 others unreferenced
│   ├── dashboard/               board-list, templates, credit-badge
│   ├── whiteboard/              workspace, header, canvas, wrapper, assistant, shared
│   ├── animations/              magnetic button, mask/stagger reveal, velocity scroll
│   └── ui/                      Base UI primitives (button, dialog, tabs, Toaster…)
├── db/
│   ├── index.ts                 Cached Neon+Drizzle; throws without DATABASE_URL
│   └── schema.ts                users + whiteboards tables, inferred types
├── lib/
│   ├── ai-canvas.ts             "use client"; JSON → Excalidraw elements
│   ├── ai-tools.ts              6 tools, canvas rules, RESPONSE_SCHEMA
│   ├── boards.ts                Ownership queries, summary columns, DTO mappers
│   ├── export.ts                "use client"; PNG/SVG/PDF + thumbnail
│   ├── pricing.ts               Display-only PLANS + CREDIT_PACKS
│   ├── store.ts                 useUserStore (credit display copy)
│   ├── types.ts                 BoardSummary / BoardData DTOs
│   ├── user.ts                  requireUserId, upsert/get helpers
│   ├── utils.ts                 cn re-export + splitTextToWords
│   └── whiteboard-store.ts      "use client"; api, dirty, status store
├── hooks/use-in-view.ts         IntersectionObserver hook
├── public/                      robots.txt + starter SVGs
├── scripts/generate-study-pdf.mjs  Builds the study PDF
├── docs/
│   ├── chapters/01-project-overview.md  First teaching chapter
│   ├── chapters/02…06-*.md              Assigned chapters
│   ├── LEARNING_GUIDE.md           Master index (do not edit here)
│   ├── DETAILED_DOCUMENTATION.md   Reference manual
│   ├── PROFESSIONAL_DOCUMENTATION.md Reference manual
│   ├── PORTFOLIO_AND_INTERVIEW.md  Interview framing
│   └── AI-Whiteboard-Study-Guide.pdf Generated artifact
└── .planning/codebase/*.md      STALE map (pre-hardening) — see §6.4
```

**[EVIDENCE GAP]** Several files in the tree are generated or untracked in practice: `next-env.d.ts` and `*.tsbuildinfo` are ignored at `.gitignore:40-41`; `.env.local` is ignored at line 34.

---

## 6.3 Conventions actually observed

| Convention | Evidence | Why it matters |
| --- | --- | --- |
| Route segments are Next.js reserved names | `page.tsx`, `layout.tsx`, `route.ts`, `[id]`, `[token]`, `[[...sign-in]]` | Renaming them silently changes routes |
| Dynamic routes use bracket folders | `app/board/[id]/`, `app/share/[token]/` | `params` is now a Promise (`PageProps<"/board/[id]">` in `board/[id]/page.tsx:8`, explicit type in `share/[token]/page.tsx:5-7`) |
| Kebab-case for non-route files | `assistant-panel.tsx`, `ai-canvas.ts`, `whiteboard-store.ts` | Predictable imports |
| `"use client"` at the top of interactive files | `board-list.tsx:1`, `workspace.tsx:1`, `assistant-panel.tsx:1`, `export.ts:1`, `landing-motion.tsx:1` | Server pages stay server-only by default |
| Path alias everywhere | `@/lib/...`, `@/components/...` | Moving a file requires only updating the target, not relative depth |
| Colored accent literal repeated | `#d12a1e` in `app/landing.css:10` and header/button classes | No shared TS colour constant; visual consistency by convention |
| Server helpers are plain functions | `lib/user.ts`, `lib/boards.ts` | No classes/DI; functions are imported directly by handlers |
| Stores expose named setters | `lib/store.ts:17-25`, `lib/whiteboard-store.ts:31-53` | State transitions are greppable |
| Route handlers export HTTP verbs | `export async function GET/POST/PATCH/DELETE` | Next.js maps them automatically |
| Errors use HTTP status + generic text | 400/401/402/404/429/500/503 across routes | See Chapter 16 |

---

## 6.4 Stale `.planning/` warning

**[EVIDENCE GAP]** `docs/LEARNING_GUIDE.md:17` states that `.planning/codebase/*.md` was generated at commit `16423a0`, **before** the hardening commit `1793a84`. Do not use it as current truth. Concrete contradictions:

| Stale claim | Where it says it | Current source |
| --- | --- | --- |
| "Non-atomic credit check & decrement" | `.planning/codebase/CONCERNS.md:27-33` | `api/ai/route.ts:92-96` and `api/boards/route.ts:39-43` do one conditional `UPDATE ... WHERE credit > 0 RETURNING credit` |
| "Dashboard fetches full base64 thumbnails" | `CONCERNS.md:60-65` | `lib/boards.ts:7-16` `summaryColumns` selects only 8 lightweight columns |
| "Autosave debounce 800 ms, thumbnail every tick" | `CONCERNS.md:51-58` | `whiteboard-canvas.tsx:10-11` uses 1500 ms and a 30,000 ms thumbnail throttle |
| "Next.js 16.4.2 / `@google/genai` 2.0.0" | `.planning/codebase/STACK.md:34,56` | `package.json:29,18` says `16.4.6` and `^2.0.0` |
| "drizzle/ migrations committed" | `.planning/codebase/STRUCTURE.md:166-170` | No `drizzle/` directory exists in the checkout |

**[IMPLEMENTED]** Items that remain accurate (e.g. no tests, no Stripe, no multiplayer) are still safer to verify in current files than to quote from `.planning/`.

---

## 6.5 Important files: role, interactions, removal impact

Statuses below describe the *file's presence*, not its quality. "First break" means the earliest user-visible or compile-time symptom.

| File | Role / why | Interactions → first break if removed | Status |
| --- | --- | --- | --- |
| `package.json` | Versions and scripts | npm/Next/Drizzle Kit cannot install or run | **[IMPLEMENTED]** |
| `tsconfig.json` | Strict TS + `@/*` alias | Every `@/...` import fails | **[IMPLEMENTED]** |
| `next.config.ts` | CSS loader + security headers | No Tailwind processing; headers vanish | **[IMPLEMENTED]** |
| `proxy.ts` | Clerk middleware on matched routes | Session refresh changes; page guards still run | **[IMPLEMENTED]** |
| `eslint.config.mjs` | Lint rules | `npm run lint` fails | **[IMPLEMENTED]** |
| `drizzle.config.ts` | Schema/out/dialect/credentials | Migrations cannot be generated | **[IMPLEMENTED]** |
| `components.json` | shadcn aliases/style | New primitives generated wrongly | **[IMPLEMENTED]** |
| `app/layout.tsx` | Root providers, fonts, metadata | Clerk hooks throw; no CSS/toasts | **[IMPLEMENTED]** |
| `app/provider.tsx` | Eager DB-user provisioning | Credit badge can stay `–` | **[IMPLEMENTED]** |
| `app/page.tsx` | Landing copy/FAQ/pricing/CTA | `/` 404s | **[IMPLEMENTED]** |
| `app/landing.css` | 1,647-line `.ev` design system | Landing unstyled | **[IMPLEMENTED]** |
| `app/globals.css` | Tailwind v4 app tokens | App shell unstyled | **[IMPLEMENTED]** |
| `app/global-error.tsx`, `not-found.tsx` | 500/404 boundaries | Raw framework errors | **[IMPLEMENTED]** |
| `app/dashboard/layout.tsx` | Auth guard + header | Unauthenticated users reach children | **[IMPLEMENTED]** |
| `app/dashboard/page.tsx` | Renders BoardList | Blank dashboard | **[IMPLEMENTED]** |
| `app/board/[id]/page.tsx` | Auth + ownership + editor entry | Editor 404s entirely | **[IMPLEMENTED]** |
| `app/share/[token]/page.tsx` | Token lookup → read-only view | All share links 404 | **[IMPLEMENTED]** |
| `app/sign-in/...`, `sign-up/...` | Clerk hosted UI | Auth CTAs lead to 404 | **[IMPLEMENTED]** |
| `app/api/user/route.ts` | Provision/read user | Provider/workspace fetches fail | **[IMPLEMENTED]** |
| `app/api/boards/route.ts` | List + credit-gated create | Dashboard cannot load/create | **[IMPLEMENTED]** |
| `app/api/boards/[id]/route.ts` | Owned PATCH/DELETE | Autosave/share/favorite/delete fail | **[IMPLEMENTED]** |
| `app/api/boards/[id]/action/route.ts` | Archive/restore | Those actions fail | **[IMPLEMENTED]** |
| `app/api/ai/route.ts` | Limit → debit → Gemini → refund | AI panel always errors | **[IMPLEMENTED]** |
| `components/dashboard/board-list.tsx` | Fetch, tabs, search, cards | Dashboard has no UI | **[IMPLEMENTED]** |
| `components/dashboard/templates.tsx` | Templates → board + prefill | Templates button disappears | **[IMPLEMENTED]** |
| `components/dashboard/credit-badge.tsx` | Shows store credit | Credit invisible | **[IMPLEMENTED]** |
| `components/whiteboard/workspace.tsx` | Orchestrator + dirty guard | Editor renders nothing | **[IMPLEMENTED]** |
| `components/whiteboard/workspace-header.tsx` | Title/status/share/export UI | Controls unreachable | **[IMPLEMENTED]** |
| `components/whiteboard/whiteboard-canvas.tsx` | Autosave + hydration | Edits never persist | **[IMPLEMENTED]** |
| `components/whiteboard/excalidraw-wrapper.tsx` | `ssr: false` boundary | SSR breaks canvas | **[IMPLEMENTED]** |
| `components/whiteboard/assistant-panel.tsx` | Prompt/placeholder/generate | AI unreachable | **[IMPLEMENTED]** |
| `components/whiteboard/shared-whiteboard.tsx` | Read-only canvas | Share page empty | **[IMPLEMENTED]** |
| `components/landing/landing-motion.tsx` | GSAP/Lenis + menu | Static landing, menu dead | **[IMPLEMENTED]** |
| `components/landing/board-scenes.tsx` | SVG mock scenes | No importer → no break | **[EVIDENCE GAP]** |
| `components/landing/faq-section.tsx` | Alternate FAQ | No importer; `page.tsx` has its own | **[EVIDENCE GAP]** |
| `components/landing/pricing-section.tsx` | Alternate pricing from `lib/pricing.ts` | No importer; conflicts with `page.tsx` | **[EVIDENCE GAP]** |
| `components/landing/reveal.tsx` | IO reveal wrapper | No importer → no break | **[EVIDENCE GAP]** |
| `components/animations/*.tsx` (4) | Motion helpers | No rendered route changes | **[EVIDENCE GAP]** |
| `hooks/use-in-view.ts` | IntersectionObserver hook | Two animation components fail | **[IMPLEMENTED]** |
| `db/schema.ts` | Two tables + inferred types | Queries/migrations fail | **[IMPLEMENTED]** |
| `db/index.ts` | Cached client; env check | Every DB route throws | **[IMPLEMENTED]** |
| `lib/user.ts` | Clerk ID → DB user | Auth/upsert duplicated or absent | **[IMPLEMENTED]** |
| `lib/boards.ts` | Owned queries + DTOs | Raw rows leak; ownership lost | **[IMPLEMENTED]** |
| `lib/types.ts` | DTO contracts | Typing errors spread | **[IMPLEMENTED]** |
| `lib/ai-tools.ts` | Tools/schema/rules | Unconstrained AI output | **[IMPLEMENTED]** |
| `lib/ai-canvas.ts` | JSON → elements | AI result undrawable | **[IMPLEMENTED]** |
| `lib/export.ts` | PNG/SVG/PDF + thumbnail | Exports/thumbnails break | **[IMPLEMENTED]** |
| `lib/store.ts` | Display user/credit | Credit UI never updates | **[IMPLEMENTED]** |
| `lib/whiteboard-store.ts` | Board/save/AI status | Components cannot share API/status | **[IMPLEMENTED]** |
| `lib/pricing.ts` | Display constants | No runtime break | **[PARTIAL]** |
| `lib/utils.ts` | `cn` + word splitter | Class merging/animations break | **[IMPLEMENTED]** |
| `components/ui/button.tsx` | Base UI Button + `cva` | Many imports fail | **[IMPLEMENTED]** |
| `components/ui/sonner.tsx` | Toaster wrapper | `toast.*` renders nowhere | **[IMPLEMENTED]** |
| `components/ui/dialog.tsx` | Modal primitive | Templates modal breaks | **[IMPLEMENTED]** |
| `components/ui/dropdown-menu.tsx` | Board action menu | Per-board actions unavailable | **[IMPLEMENTED]** |
| `components/ui/tabs.tsx` | Scope tabs | Tabs break | **[IMPLEMENTED]** |
| `components/ui/badge.tsx`, `skeleton.tsx`, `textarea.tsx` | Badge/loading/prompt field | Minor UI breakage | **[IMPLEMENTED]** |
| `components/ui/avatar.tsx`, `card.tsx`, `button-cta.tsx`, `container-scroll.tsx`, `input.tsx`, `label.tsx`, `switch.tsx` | Extra primitives | No importer → no break | **[EVIDENCE GAP]** |
| `components/ui/lamp.tsx`, `light-rays.tsx`, `spotlight.tsx`, `scroll-progress-bar.tsx`, `zoom-parallax.tsx`, `separator.tsx`, `tooltip.tsx`, `light-rays.css` | Decorative/motion/WebGL (`ogl`) | No importer → no break | **[EVIDENCE GAP]** |
| `public/*` | robots.txt + starter SVGs | Missing static assets | **[IMPLEMENTED]** |
| `scripts/generate-study-pdf.mjs` | Builds study PDF | PDF cannot be regenerated | **[IMPLEMENTED]** |
| `docs/LEARNING_GUIDE.md` | Master index + gap register | Study map lost | **[IMPLEMENTED]** |
| `.planning/codebase/*.md` | Historical analysis | Nothing runtime; stale — see §6.4 | **[EVIDENCE GAP]** |
| `.env.example` | Documents required env vars | Setup guesswork | **[IMPLEMENTED]** |

**[EVIDENCE GAP]** "No importer found" means a grep of `.tsx` imports did not locate the component in any rendered route. These files may be intentional design-system inventory, but they are not part of the live UI as currently wired.

---

## 6.6 How to navigate when debugging

1. **404/wrong URL:** `app/` route folders, then `proxy.ts`.
2. **Wrong data/ownership:** `lib/boards.ts`, then the handler's `WHERE`.
3. **Credit:** `db/schema.ts:14` → both atomic `UPDATE`s → `lib/store.ts` (display copy).
4. **Canvas not saving:** `whiteboard-canvas.tsx:35-93` → `PATCH /api/boards/[id]`.
5. **Bad AI shape:** `lib/ai-tools.ts` schema → `lib/ai-canvas.ts` geometry.
6. **Landing motion:** `landing-motion.tsx` selectors depend on class names in `app/page.tsx`/`landing.css` — untyped coupling.

Cross-references: Chapter 5 explains the boundaries these files implement; Chapter 25 uses this map to plan a rebuild; Chapter 21 covers the stale/unused surface as technical debt.

---

## 6.7 Revision summary

- `app/` owns routes and server boundaries; `components/`, `db/`, `lib/`, and `hooks/` own everything else.
- Imports use the `@/*` alias from `tsconfig.json`; dynamic route folders use `[id]`, `[token]`, and `[[...sign-in]]`.
- Interactive files declare `"use client"` at line 1; server pages stay server-only.
- The five API handlers, two stores, and two database tables cover all runtime state transitions.
- Several landing/animation/UI files are present but unreferenced by rendered routes — an evidence gap, not a feature.
- `.planning/codebase/*.md` is stale: its atomic-credit, thumbnail-transfer, autosave-timing, and version notes contradict current source.
- Deleting `db/schema.ts`, `lib/boards.ts`, `excalidraw-wrapper.tsx`, or `api/ai/route.ts` breaks core features immediately; deleting unreferenced UI primitives does not.

## 6.8 Knowledge checks

1. Why does `app/board/[id]/page.tsx` await `params`, and which type declares that contract?
2. Name three files that are safe-ish to delete with no immediate user-visible effect, and explain what evidence supports that claim.
3. Which two files must agree for a GSAP scroll animation to fire, and why is that coupling fragile?
4. What does `lib/store.ts` hold versus `lib/whiteboard-store.ts`, and which file reads the whiteboard store from outside React?
5. Give two concrete ways `.planning/codebase/CONCERNS.md` is out of date, citing current source lines.

## 6.9 Practical exercises

1. **Tree reconstruction:** From memory, write the `app/` subtree including all five API routes and explain the job of each in one line. Compare with §6.2.
2. **Blast-radius table:** Pick `lib/user.ts`. List every importer, then write what fails first if `requireUserId()` starts returning an empty string.
3. **Staleness audit:** Read one `.planning/codebase/*.md` file and rewrite three of its claims using current source paths and line numbers. Mark each rewritten claim `[IMPLEMENTED]` or `[EVIDENCE GAP]`.

## 6.10 Interview questions

1. "Walk me through your repository structure as if I were a new developer."
2. "Which file would you open first to debug a credit bug, and why?"
3. "How do you know which components are actually in the live UI?"
4. "What conventions did you follow for naming and client/server boundaries?"
5. "How do you keep documentation from drifting away from the code?"
