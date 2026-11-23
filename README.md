# Ai-WhiteBoard

A full-stack AI-powered whiteboard SaaS built with Next.js 16, React 19, Tailwind CSS v4, and Excalidraw. It features a Swiss/Evenkeel-inspired landing page, a polished dashboard, and an interactive whiteboard with AI diagram generation, autosave, shareable read-only links, templates, favorites/search, and multi-format exports.

## Tech Stack

- **Framework**: Next.js 16.4.6 (Turbopack), React 19.3.0, TypeScript 5
- **Styling**: Tailwind CSS v4, shadcn/ui (Base UI)
- **Auth**: [Clerk](https://clerk.com/) (@clerk/nextjs@7.9.18)
- **Database**: [Neon](https://neon.tech/) Postgres + [Drizzle ORM](https://orm.drizzle.team/)
- **Canvas**: [Excalidraw](https://excalidraw.com/) (@excalidraw/excalidraw@0.18.1)
- **AI**: [Google Gemini](https://ai.google.dev/) (@google/genai@2.30.0)
- **State**: Zustand
- **Animation**: GSAP + Lenis + Motion
- **Utils**: jspdf, sonner, lucide-react

## Features

- **Swiss/Evenkeel Landing**: Minimal black-on-white design with a single red accent (`#d12a1e`), hairline rules, GSAP ScrollTrigger + Lenis choreography, and Clerk auth CTAs.
- **Dashboard**: Board grid with search, favorites filter, tabs (Active / Archived / Trash), templates dialog, and CRUD actions.
- **Whiteboard**: Excalidraw canvas with autosave, thumbnails, AI assistant panel, share/favorite/export controls, and unsaved-change guard.
- **AI Generation**: Generate diagrams, flowcharts, architecture, wireframes, mind maps, and mockups from a prompt using Gemini with credit tracking.
- **Shareable Links**: Generate a public read-only share link per board (`/share/[token]`) with Excalidraw in view mode.
- **Templates Gallery**: Start from curated templates (retro, onboarding flow, architecture, wireframe, mind map, mobile) that create a board and pre-fill the AI helper.
- **Exports**: Export boards as PNG, SVG, or PDF from the workspace header.
- **Favorites & Search**: Star boards and filter by favorites or title search.
- **Credits System**: One shared pool of per-user credits; creating a board and generating with AI each spend 1 credit atomically, and AI failures refund it.
- **Soft Delete / Archive**: Move boards to trash or archive from the dashboard.

## Getting Started

### Prerequisites

- Node.js 18+ 
- A [Neon](https://neon.tech/) Postgres database
- [Clerk](https://clerk.com/) application (publishable + secret keys)
- [Google Gemini](https://aistudio.google.com/apikey) API key

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
npm install
```

### Database Setup

Push the schema to your Neon database:

```bash
npm run db:push
```

Or generate migrations and apply them with drizzle-kit directly (there is no `db:migrate` npm script):

```bash
npm run db:generate
npx drizzle-kit migrate
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Lint

```bash
npm run build
npm run lint
```

## Project Structure

```
app/                    # Next.js App Router
  page.tsx             # Swiss landing page
  dashboard/           # Dashboard
  board/[id]/          # Whiteboard workspace
  share/[token]/       # Public read-only share page
  api/                 # API routes (boards, AI, user)
components/
  landing/             # Landing motion and sections
  dashboard/           # Board list, templates, credit badge
  whiteboard/          # Canvas, header, assistant panel, shared view
  ui/                  # shadcn/ui components
db/                    # Drizzle schema and client
lib/                   # Types, utils, AI tools, export, stores
```

## Study Documentation

A complete, source-grounded 26-chapter study guide is included:

- **Combined PDF:** [`docs/AI-Whiteboard-Study-Guide.pdf`](docs/AI-Whiteboard-Study-Guide.pdf)
- **Master index / Phase 1 analysis:** [`docs/LEARNING_GUIDE.md`](docs/LEARNING_GUIDE.md)
- **Chapters:** [`docs/chapters/`](docs/chapters/) — 01 Project Overview → 26 Final Revision and Cheat Sheet
- **Interview prep:** [`docs/PORTFOLIO_AND_INTERVIEW.md`](docs/PORTFOLIO_AND_INTERVIEW.md)

Regenerate the PDF after editing any chapter with `node scripts/generate-study-pdf.mjs` (requires Google Chrome).

## Notes

- Next.js 16 uses `proxy.ts` for Clerk middleware (replacing `middleware.ts`).
- Excalidraw CSS is imported from `@excalidraw/excalidraw/index.css`.
- The landing page uses `.ev` scoped styles in `app/landing.css` with GSAP ScrollTrigger and Lenis.
- Clerk publishable/secret keys should be rotated if they were previously exposed.

## License

MIT
