# AI Whiteboard - Professional Technical Documentation

**Version:** 1.0.0  
**Date:** October 24, 2026  
**Repository:** [https://github.com/xyushman/white-board](https://github.com/xyushman/white-board)  
**License:** MIT

---

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Objectives](#2-objectives)
- [3. System Architecture](#3-system-architecture)
- [4. Technology Stack](#4-technology-stack)
- [5. Project Structure](#5-project-structure)
- [6. Database Design](#6-database-design)
- [7. Authentication & Authorization](#7-authentication--authorization)
- [8. Core Features & Implementation](#8-core-features--implementation)
- [9. API Reference](#9-api-reference)
- [10. Frontend Architecture](#10-frontend-architecture)
- [11. AI Integration](#11-ai-integration)
- [12]([[docs/PROFESSIONAL_DOCUMENTATION.md]]#12-exports--sharing)
- [13. State Management](#13-state-management)
- [14. Design System & Styling](#14-design-system--styling)
- [15. Configuration & Environment](#15-configuration--environment)
- [16. Build, Deployment & CI/CD](#16-build-deployment--ci-cd)
- [17. Testing & Quality Assurance](#17-testing--quality-assurance)
- [18. Security Considerations](#18-security-considerations)
- [19. Performance Optimization](#19-performance-optimization)
- [20. Troubleshooting & Maintenance](#20-troubleshooting--maintenance)
- [21. Appendix](#21-appendix)

---

## 1. Executive Summary

AI Whiteboard is a modern, full-stack Software-as-a-Service (SaaS) application that combines an infinite canvas whiteboard powered by Excalidraw with AI-driven diagram generation capabilities. Built with Next.js 16, React 19, and TypeScript, the platform enables users to create, visualize, and share ideas through interactive diagrams, flowcharts, wireframes, and mind maps with intelligent automation.

The application emphasizes minimal design following Swiss/International Typographic Style principles, delivering a clean, professional user experience focused on productivity and creativity.

## 2. Objectives

- **Visual Collaboration**: Provide an intuitive infinite canvas for diagramming and brainstorming
- **AI Acceleration**: Generate professional diagrams from natural language descriptions using Google Gemini
- **Seamless Workflow**: Enable quick creation via templates, autosave functionality, and organized board management
- **Accessibility**: Offer shareable read-only links for stakeholder review without authentication
- **Professional Exports**: Support multiple export formats (PNG, SVG, PDF) for documentation and presentations
- **Scalable Architecture**: Build on modern, type-safe technologies with clear separation of concerns

## 3. System Architecture

### 3.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Landing[Landing Page]
        Dashboard[Dashboard]
        Workspace[Whiteboard Workspace]
        Share[Share Page]
    end
    
    subgraph "Application Layer"
        NextJS[Next.js 16 App Router]
        Middleware[Clerk Middleware - proxy.ts]
        RSC[React Server Components]
        RCC[React Client Components]
    end
    
    subgraph "API Layer"
        BoardAPI[Boards API]
        AIAPI[AI Generation API]
        UserAPI[User API]
    end
    
    subgraph "Service Layer"
        AuthService[Clerk Auth]
        DBService[Drizzle ORM]
        AISvc[Google Gemini API]
        ExportSvc[Export Utilities]
    end
    
    subgraph "Data Layer"
        NeonDB[(Neon PostgreSQL)]
    end
    
    Browser --> NextJS
    NextJS --> Middleware
    Middleware --> AuthService
    NextJS --> RSC
    NextJS --> RCC
    RSC --> BoardAPI
    RCC --> BoardAPI
    RCC --> AIAPI
    BoardAPI --> DBService
    AIAPI --> AISvc
    AIAPI --> DBService
    UserAPI --> DBService
    DBService --> NeonDB
```

### 3.2 Request Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant M as Middleware
    participant P as Page/Route
    participant API as API Route
    participant DB as Database
    participant AI as Gemini API
    
    U->>C: Access Application
    C->>M: Request with Session
    M->>M: Validate with Clerk
    alt Authenticated
        M->>P: Allow Access
        P->>DB: Fetch Data
        DB->>P: Return Data
        P->>C: Render Page
    else Not Authenticated
        M->>C: Redirect to Sign In
    end
    
    U->>C: Generate AI Diagram
    C->>API: POST /api/ai
    API->>DB: Check User Credits
    API->>AI: Generate Content
    AI->>API: Return Diagram JSON
    API->>DB: Deduct Credits
    API->>C: Return Diagram Data
    C->>C: Insert into Canvas
```

## 4. Technology Stack

### 4.1 Core Technologies

| Category | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Next.js | 16.4.2 | Full-stack React framework with App Router |
| **Library** | React | 19.3.0 | UI library with Server Components |
| **Language** | TypeScript | 5.x | Static type checking |
| **Build Tool** | Turbopack | Built-in | Fast development and builds |

### 4.2 Frontend

| Technology | Version | Purpose |
| --- | --- | --- |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| shadcn/ui | Latest | Component library built on Radix UI |
| @base-ui/react | Latest | Headless UI primitives |
| Lucide React | Latest | Icon library |
| Motion | 14.5.0 | Animation library |
| GSAP | 3.13.0 | Advanced animations for landing page |
| Lenis | 1.3.27 | Smooth scroll library |
| Sonner | Latest | Toast notifications |

### 4.3 Backend & Data

| Technology | Version | Purpose |
| --- | --- | --- |
| @clerk/nextjs | 7.9.18 | Authentication and user management |
| Drizzle ORM | 0.45.4 | Type-safe SQL ORM |
| @neondatabase/serverless | 1.2.0 | Serverless PostgreSQL driver |
| Drizzle Kit | 0.31.11 | Schema migrations and management |

### 4.4 Canvas & AI

| Technology | Version | Purpose |
| --- | --- | --- |
| @excalidraw/excalidraw | 0.18.1 | Infinite canvas and diagramming |
| @google/genai | 2.30.0 | Google Gemini AI SDK |
| html-to-image | Latest | HTML to image conversion |
| jsPDF | Latest | PDF generation |

### 4.5 State & Utilities

| Technology | Version | Purpose |
| --- | --- | --- |
| Zustand | 5.0.8 | Lightweight state management |
| clsx | Latest | Conditional classnames |
| tailwind-merge | Latest | Merge Tailwind classes |
| date-fns | Latest | Date formatting utilities |

## 5. Project Structure

```
ai-whiteboard/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── provider.tsx             # Global providers
│   ├── landing.css              # Landing page styles
│   ├── proxy.ts                 # Clerk middleware
│   ├── dashboard/               # Dashboard routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── board/[id]/              # Whiteboard editor
│   │   └── page.tsx
│   ├── share/[token]/           # Public share
│   │   └── page.tsx
│   ├── sign-in/[[...sign-in]]/  # Auth routes
│   ├── sign-up/[[...sign-up]]/
│   └── api/                     # API routes
│       ├── user/route.ts
│       ├── ai/route.ts
│       └── boards/
│           ├── route.ts
│           └── [id]/
│               ├── route.ts
│               └── action/route.ts
├── components/                   # React components
│   ├── landing/                 # Landing page components
│   │   ├── landing-motion.tsx
│   │   └── sections/
│   ├── dashboard/               # Dashboard components
│   │   ├── board-list.tsx
│   │   ├── templates.tsx
│   │   └── credit-badge.tsx
│   ├── whiteboard/              # Whiteboard components
│   │   ├── workspace.tsx
│   │   ├── workspace-header.tsx
│   │   ├── whiteboard-canvas.tsx
│   │   ├── assistant-panel.tsx
│   │   └── shared-whiteboard.tsx
│   └── ui/                      # UI primitives
├── db/                          # Database
│   ├── index.ts
│   └── schema.ts
├── lib/                         # Utilities and logic
│   ├── boards.ts
│   ├── types.ts
│   ├── user.ts
│   ├── ai-tools.ts
│   ├── ai-canvas.ts
│   ├── export.ts
│   ├── whiteboard-store.ts
│   ├── store.ts
│   └── utils.ts
├── docs/                        # Documentation
├── public/                      # Static assets
└── [config files]              # package.json, tsconfig, etc.
```

## 6. Database Design

### 6.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ WHITEBOARDS : owns
    
    USERS {
        text id PK "Clerk User ID"
        text name "Full Name"
        text email UK "Email Address"
        integer credit "AI Credits (default 3)"
        timestamp created_at "Creation Time"
    }
    
    WHITEBOARDS {
        text id PK "Board ID"
        text user_id FK "References users.id"
        text title "Board Title"
        jsonb elements "Excalidraw Elements"
        jsonb app_state "Excalidraw App State"
        jsonb files "Excalidraw Files"
        text thumbnail "Base64 Thumbnail"
        text share_token UK "Share Token"
        boolean favorited "Favorite Flag"
        timestamp deleted_at "Soft Delete"
        timestamp archived_at "Archive Time"
        timestamp created_at "Creation Time"
        timestamp updated_at "Last Update"
    }
```

### 6.2 Schema Implementation

**Users Table** (`db/schema.ts`):
```typescript
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  credit: integer("credit").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
```

**Whiteboards Table**:
```typescript
export const whiteboards = pgTable("whiteboards", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  elements: jsonb("elements").$type<unknown[]>().notNull().default([]),
  appState: jsonb("app_state").$type<Record<string, unknown>>().notNull().default({}),
  files: jsonb("files").$type<Record<string, unknown>>().notNull().default({}),
  thumbnail: text("thumbnail"),
  shareToken: text("share_token").unique(),
  favorited: boolean("favorited").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

**Indexes & Constraints:**
- Primary keys on `id` fields
- Unique constraint on `users.email` and `whiteboards.share_token`
- Foreign key with cascade delete on `whiteboards.user_id`
- Soft delete via nullable timestamps
- Default values for critical fields

## 7. Authentication & Authorization

### 7.1 Authentication Flow

1. **Initial Access**: User visits site, `proxy.ts` middleware evaluates route
2. **Public Routes**: Landing (`/`), share (`/share/[token]`), auth pages accessible
3. **Protected Routes**: Dashboard (`/dashboard`), whiteboard (`/board/[id]`) require authentication
4. **Sign In/Up**: Clerk handles authentication flow with social/email options
5. **Session Management**: Clerk manages JWT sessions, middleware validates tokens
6. **User Provisioning**: First authenticated request triggers user creation in database

### 7.2 Authorization Logic

```typescript
// Server-side protection
export default async function BoardPage({ params }: PageProps<"/board/[id]">) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  
  const board = await getBoard(userId, id);
  if (!board || board.deletedAt) notFound();
  
  return <WhiteboardWorkspace board={boardToData(board)} />;
}
```

**Authorization Rules:**
- Board access restricted to owner only (checked via `userId` match)
- API routes validate ownership before mutations
- Share links provide read-only access without authentication
- Trash/deleted boards inaccessible via normal routes
- Credit checks enforced server-side for AI generation

## 8. Core Features & Implementation

### 8.1 Landing Page

**Location:** `app/page.tsx`, `components/landing/*`, `app/landing.css`

**Features:**
- Swiss/Evenkeel design aesthetic
- GSAP ScrollTrigger animations
- Lenis smooth scrolling
- Hero section with CTA to dashboard
- Feature showcase
- Pricing section
- FAQ accordion
- Responsive design
- Clerk authentication CTAs

**Key Implementation:**
```typescript
// landing-motion.tsx
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
// Choreographed animations across sections
```

### 8.2 Dashboard

**Location:** `app/dashboard/`, `components/dashboard/board-list.tsx`

**Features:**
- Board grid with thumbnails
- Tab navigation (Active/Archived/Trash)
- Search functionality
- Favorites filter
- Create new board
- Templates dialog
- Credit display
- Board actions (archive, trash, restore, delete)

**Implementation Details:**
- Client-side filtering and search
- Optimistic UI updates
- Loading skeletons
- Empty states
- Responsive grid layout

### 8.3 Whiteboard Workspace

**Location:** `components/whiteboard/workspace.tsx`, `components/whiteboard/whiteboard-canvas.tsx`

**Features:**
- Full-screen Excalidraw canvas
- Autosave (800ms debounce)
- Thumbnail generation
- Unsaved changes warning
- AI assistant panel
- Export controls
- Share functionality
- Favorite toggle
- Title editing

**Autosave Flow:**
```typescript
const scheduleSave = useCallback((api: ExcalidrawImperativeAPI) => {
  if (saveTimeout.current) clearTimeout(saveTimeout.current);
  markDirty();
  setSaving(true);
  
  saveTimeout.current = setTimeout(async () => {
    const elements = api.getSceneElements();
    const appState = api.getAppState();
    const files = api.getFiles();
    const snapshot = JSON.stringify({ elements, appState, files });
    
    if (snapshot === lastSavedRef.current) {
      setSaved();
      return;
    }
    
    const thumbnail = await captureThumbnail(api);
    await fetch(`/api/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elements, appState, files, thumbnail }),
    });
    
    lastSavedRef.current = snapshot;
    setSaved();
  }, 800);
}, []);
```

### 8.4 Templates System

**Location:** `components/dashboard/templates.tsx`

**Predefined Templates:**
| Template | Tool | Purpose |
| --- | --- | --- |
| Sprint Retro | mindmap | Retrospective with columns |
| User Onboarding Flow | flowchart | Signup journey with decisions |
| System Architecture | architecture | Scalable app architecture |
| Landing Page Wireframe | web-mockup | Desktop wireframe |
| Idea Mind Map | mindmap | Brainstorming structure |
| Mobile App Screen | mobile-mockup | Dashboard screen |

**Flow:**
1. User selects template
2. Creates new board via API
3. Navigates with query params (`?template=tool&prompt=...`)
4. AI panel auto-opens with pre-filled data
5. User generates diagram

## 9. API Reference

### 9.1 User API

#### GET `/api/user`
Get current authenticated user information.

**Response:**
```json
{
  "user": {
    "id": "user_...",
    "name": "John Doe",
    "email": "john@example.com",
    "credit": 3
  }
}
```

**Status Codes:** 200, 401

### 9.2 Boards API

#### POST `/api/boards`
Create a new board.

**Request Body:**
```json
{
  "title": "Untitled board" // optional
}
```

**Response:**
```json
{
  "board": {
    "id": "board_...",
    "title": "Untitled board",
    "createdAt": "2026-10-24T..."
  },
  "credit": 3
}
```

#### GET `/api/boards?scope=active|archived|trashed`
List boards by scope.

**Response:**
```json
{
  "boards": [
    {
      "id": "board_...",
      "title": "My Board",
      "thumbnail": "data:image/png;base64,...",
      "favorited": false,
      "archived": false,
      "deleted": false,
      "trashed": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "credit": 3
}
```

#### GET `/api/boards/[id]`
Get specific board (owner only).

#### PATCH `/api/boards/[id]`
Update board content.

**Request Body:**
```json
{
  "title": "New Title",
  "elements": [...],
  "appState": {...},
  "files": {...},
  "thumbnail": "data:...",
  "favorited": true,
  "share": "enable" | "disable"
}
```

#### DELETE `/api/boards/[id]?permanent=1`
Delete board (soft delete by default, permanent with flag).

#### POST `/api/boards/[id]/action`
Perform board actions.

**Request Body:**
```json
{
  "action": "archive" | "unarchive" | "restore"
}
```

### 9.3 AI API

#### POST `/api/ai`
Generate diagram using AI.

**Request Body:**
```json
{
  "userInput": "Create a user flow diagram",
  "tool": {
    "id": "flowchart",
    "name": "Flowchart",
    "prompt": "..."
  }
}
```

**Response:**
```json
{
  "diagram": {
    "title": "User Flow",
    "width": 1200,
    "height": 800,
    "nodes": [...],
    "connections": [...]
  },
  "credit": 2
}
```

**Error Responses:**
- 401: Unauthorized
- 402: Insufficient credits
- 400: Invalid request
- 500: Generation failed

## 10. Frontend Architecture

### 10.1 Component Hierarchy

```mermaid
graph TD
    RootLayout[app/layout.tsx]
    RootLayout --> ClerkProvider[Clerk Provider]
    RootLayout --> Toaster[Sonner Toaster]
    
    Landing[app/page.tsx]
    Dashboard[app/dashboard/page.tsx]
    BoardPage[app/board/[id]/page.tsx]
    SharePage[app/share/[token]/page.tsx]
    
    Dashboard --> DashboardLayout
    DashboardLayout --> BoardList
    BoardList --> TemplatesDialog
    
    BoardPage --> WhiteboardWorkspace
    WhiteboardWorkspace --> WorkspaceHeader
    WhiteboardWorkspace --> WhiteboardCanvas
    WhiteboardWorkspace --> AssistantPanel
    
    SharePage --> SharedWhiteboard
```

### 10.2 Client/Server Component Strategy

| Type | Usage | Examples |
| --- | --- | --- |
| **Server Components** | Data fetching, auth checks, SEO | `app/page.tsx`, `app/board/[id]/page.tsx`, `app/share/[token]/page.tsx` |
| **Client Components** | Interactivity, hooks, browser APIs | Canvas, forms, modals, animations |
| **Dynamic Imports** | Heavy client components | Excalidraw (`ssr: false`) |

### 10.3 Routing

- **App Router**: File-system based routing
- **Dynamic Routes**: `[id]`, `[token]` for boards and shares
- **Catch-all Routes**: `[[...sign-in]]` for Clerk auth
- **Route Handlers**: API endpoints in `app/api/`

## 11. AI Integration

### 11.1 AI Tools Configuration

**Location:** `lib/ai-tools.ts`

```typescript
export const AI_TOOLS: AiTool[] = [
  { id: "diagram", name: "Diagram", ... },
  { id: "flowchart", name: "Flowchart", ... },
  { id: "architecture", name: "Architecture", ... },
  { id: "web-mockup", name: "Web mockup", ... },
  { id: "mobile-mockup", name: "Mobile mockup", ... },
  { id: "mindmap", name: "Mind map", ... },
];
```

### 11.2 Prompt Engineering

**System Prompt Structure:**
```typescript
const systemPrompt = `${tool.prompt}

${CANVAS_RULES}

Generate a diagram based on the user's description.`;
```

**Canvas Rules:**
- Scene dimensions: 1200-1400 x 800px
- Max 25 nodes
- Unique IDs, positions, dimensions
- No overlapping nodes (min 40px spacing)
- Arrows reference existing node IDs
- Labels under 4 words
- Output JSON matching schema

### 11.3 Schema Validation

**Response Schema (Gemini):**
```typescript
export const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    width: { type: "number" },
    height: { type: "number" },
    nodes: { /* array of node objects */ },
    connections: { /* array of connections */ },
  },
  required: ["title", "width", "height", "nodes", "connections"],
} as const;
```

### 11.4 Canvas Conversion

**Location:** `lib/ai-canvas.ts`

Converts AI-generated diagram to Excalidraw elements:
- Creates rectangle/ellipse/diamond shapes for nodes
- Generates text elements for labels
- Creates arrow elements for connections
- Positions elements based on coordinates
- Applies styling (colors, fonts)

```typescript
export function diagramToElements(diagram: DiagramResult, offsetX = 0, offsetY = 0): ExcalidrawElement[] {
  // Convert nodes to shapes and text
  // Convert connections to arrows
  // Apply offsets
  return elements;
}
```

## 12. Exports & Sharing

### 12.1 Export Implementation

**Location:** `lib/export.ts`

#### PNG Export
```typescript
export async function exportBoardToPng(fileName: string, scale = 2): Promise<void> {
  const api = useWhiteboardStore.getState().api;
  if (!api) return;
  
  const blob = await exportToBlob({
    elements: api.getSceneElements(),
    files: api.getFiles(),
    appState: { ...api.getAppState(), exportWithDarkMode: false, exportBackground: true },
    mimeType: "image/png",
    quality: 1,
    exportPadding: 24,
    getDimensions: (w, h) => ({ width: w * scale, height: h * scale, scale }),
  });
  
  // Trigger download
}
```

#### SVG Export
```typescript
export async function exportBoardToSvg(api: ExcalidrawImperativeAPI | null, fileName: string): Promise<void> {
  const svg = await exportToSvg({ elements, files, appState, exportPadding: 24 });
  const svgStr = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  // Download
}
```

#### PDF Export
```typescript
export async function exportBoardToPdf(api: ExcalidrawImperativeAPI | null, fileName: string): Promise<void> {
  const blob = await exportToBlob({ /* PNG export */ });
  const dataUrl = await blobToDataUrl(blob);
  const img = new Image();
  await loadImage(img, dataUrl);
  
  const pdf = new jsPDF({
    orientation: img.width >= img.height ? "landscape" : "portrait",
    unit: "px",
    format: [img.width, img.height],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
  pdf.save(`${sanitizeFilename(fileName)}.pdf`);
}
```

### 12.2 Sharing Implementation

**Share Token Generation:**
```typescript
import { randomUUID } from "crypto";

// In API route
if (body.share === "enable" && !board.shareToken) {
  update.shareToken = randomUUID().replace(/-/g, "");
}
```

**Public Share Page:**
```typescript
// app/share/[token]/page.tsx
export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  const row = await getBoardByShareToken(token);
  if (!row || row.deletedAt) notFound();
  
  return <SharedWhiteboard board={{ ... }} />;
}
```

**Read-Only Configuration:**
```typescript
<Excalidraw
  initialData={initialData}
  viewModeEnabled
  theme="light"
  UIOptions={{
    canvasActions: {
      loadScene: false,
      saveToActiveFile: false,
      export: false,
      saveAsImage: false,
    },
  }}
/>
```

## 13. State Management

### 13.1 Whiteboard Store

**Location:** `lib/whiteboard-store.ts`

```typescript
type WhiteboardStore = {
  boardId: string | null;
  title: string;
  api: ExcalidrawImperativeAPI | null;
  saving: boolean;
  lastSavedAt: number | null;
  dirty: boolean;
  favorited: boolean;
  shareToken: string | null;
  exporting: boolean;
  aiRunning: boolean;
  
  setBoardId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setApi: (api: ExcalidrawImperativeAPI | null) => void;
  markDirty: () => void;
  setSaving: (saving: boolean) => void;
  setSaved: () => void;
  setFavorited: (favorited: boolean) => void;
  setShareToken: (shareToken: string | null) => void;
  setExporting: (exporting: boolean) => void;
  setAiRunning: (aiRunning: boolean) => void;
};
```

### 13.2 User Store

**Location:** `lib/store.ts`

```typescript
type UserStore = {
  user: { id: string; name: string; email: string; credit: number } | null;
  credit: number;
  setUser: (user: UserStore["user"]) => void;
  setCredit: (credit: number) => void;
};
```

**Usage Pattern:**
- Global client state for cross-component communication
- Minimal state footprint
- Direct state updates without complex reducers
- Type-safe with TypeScript

## 14. Design System & Styling

### 14.1 Color Palette

| Color | Hex | Usage |
| --- | --- | --- |
| Background | `#ffffff` | Primary background |
| Ink/Text | `#0b0b0b` | Primary text |
| Surface | `#f2f2f2` | Subtle backgrounds |
| Muted Text | `#6b6b6b`, `#8f8f8f` | Secondary text |
| Borders/Rules | `#dadada` | Dividers, borders |
| Accent | `#d12a1e` | CTAs, highlights, active states |

### 14.2 Typography

**Font:** Host Grotesk (Variable Font)
- Loaded via `next/font/local`
- Weights: Variable
- Usage: All text elements
- Fallback: system-ui, -apple-system, sans-serif

### 14.3 Spacing System

Following Tailwind's spacing scale with custom adjustments for Swiss aesthetic:
- Tight, generous whitespace
- Consistent padding/margins
- Hairline rules (1px borders)

### 14.4 Component Patterns

**Buttons:**
```typescript
// Primary CTA
className="h-9 rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-[#d12a1e]"

// Secondary
className="h-9 rounded-full border border-black/20 px-5 text-sm"

// Ghost
className="hover:bg-black/5"
```

**Cards:**
```typescript
className="group relative overflow-hidden border border-[#dadada] bg-white transition-colors hover:border-black"
```

**Inputs:**
```typescript
className="h-9 rounded-full border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/40"
```

### 14.5 Landing Page Styles

**Location:** `app/landing.css` (scoped under `.ev`)

**Key Features:**
- CSS custom properties for theming
- Grid-based layouts
- Responsive breakpoints
- Animation classes
- Scroll-driven animations
- Reduced motion support considerations

## 15. Configuration & Environment

### 15.1 Environment Variables

Create `.env.local` in project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# AI
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 15.2 Next.js Configuration

**Location:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // Standard Next.js 16 config
  // Turbopack enabled by default
};
```

### 15.3 TypeScript Configuration

**Location:** `tsconfig.json`
- Strict mode enabled
- Path aliases: `@/*` → project root
- Module resolution: bundler
- JSX: preserve

### 15.4 Drizzle Configuration

**Location:** `drizzle.config.ts`

```typescript
export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 15.5 Package Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## 16. Build, Deployment & CI/CD

### 16.1 Build Process

```bash
# Install dependencies
npm install

# Type checking and build
npm run build
```

**Build Output:**
- Optimized production bundle
- Static pages prerendered where possible
- Dynamic routes server-rendered on demand
- Turbopack for fast builds

### 16.2 Deployment Platforms

**Recommended:** Vercel (optimal for Next.js)

**Requirements:**
- Node.js 18+ runtime
- Environment variables configured
- PostgreSQL database accessible
- External API keys (Clerk, Gemini)

### 16.3 Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations (`db:push` or `db:migrate`)
- [ ] Configure Clerk allowed domains
- [ ] Test authentication flow
- [ ] Verify AI generation works
- [ ] Test share functionality
- [ ] Check exports
- [ ] Run build locally (`npm run build`)
- [ ] Run lint (`npm run lint`)

### 16.4 Vercel Configuration

No special `vercel.json` required. Next.js 16 auto-configured.

**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

## 17. Testing & Quality Assurance

### 17.1 Code Quality

**Linting:**
```bash
npm run lint
```

Uses ESLint 9 with Next.js config.

**Type Checking:**
TypeScript strict mode enforced. Build process includes type checking.

### 17.2 Manual Testing Checklist

**Authentication:**
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Protected route redirects
- [ ] User created in database

**Dashboard:**
- [ ] Create new board
- [ ] View board list
- [ ] Search boards
- [ ] Filter favorites
- [ ] Switch tabs (Active/Archived/Trash)
- [ ] Archive/restore/trash/delete boards
- [ ] Use templates

**Whiteboard:**
- [ ] Open board
- [ ] Edit canvas
- [ ] Autosave works
- [ ] Title editing
- [ ] Unsaved warning on close
- [ ] Favorite toggle
- [ ] Share enable/disable/copy
- [ ] Export PNG/SVG/PDF
- [ ] AI generation
- [ ] Credits update

**Sharing:**
- [ ] Generate share link
- [ ] Access public link
- [ ] Read-only mode
- [ ] Deleted board returns 404
- [ ] Disable sharing

**AI:**
- [ ] Select different tools
- [ ] Generate diagram
- [ ] Placeholder appears and removed
- [ ] Elements inserted correctly
- [ ] Credits deducted
- [ ] Error handling

### 17.3 Performance Testing

- **Lighthouse**: Target 90+ performance
- **Bundle Size**: Monitor with Next.js build output
- **Canvas Performance**: Test with complex diagrams
- **Image Loading**: Thumbnails optimized

## 18. Security Considerations

### 18.1 Authentication Security

- **Clerk**: Industry-standard authentication
- **Session Management**: Secure HTTP-only cookies
- **Middleware Protection**: Route-level protection
- **Token Validation**: Server-side verification

### 18.2 Authorization Security

- **Ownership Checks**: All board operations verify `userId` ownership
- **API Validation**: Server-side validation on all endpoints
- **Share Links**: Token-based, non-guessable (UUID), read-only only
- **Soft Deletes**: Prevent accidental data loss

### 18.3 Data Security

- **SQL Injection**: Prevented by Drizzle ORM parameterized queries
- **XSS**: React automatic escaping, no dangerouslySetInnerHTML
- **CSRF**: Next.js App Router built-in protection
- **Environment Variables**: Secrets server-side only
- **Database**: SSL required for Neon connection

### 18.4 API Security

- **Rate Limiting**: Consider adding for production
- **Input Validation**: Validate request bodies
- **Error Handling**: Don't leak sensitive information
- **Credit Enforcement**: Server-side checks

### 18.5 Known Security Notes

⚠️ **Important:** 
- Clerk keys were exposed in development chat - must rotate in production
- Never commit `.env.local` to version control
- Use strong, unique secrets
- Regularly update dependencies

## 19. Performance Optimization

### 19.1 Frontend Optimization

- **Code Splitting**: Automatic with Next.js App Router
- **Dynamic Imports**: Excalidraw loaded client-side only
- **Image Optimization**: Next.js Image component where applicable
- **Font Optimization**: Local fonts with `next/font`
- **CSS Optimization**: Tailwind CSS purging

### 19.2 Backend Optimization

- **Server Components**: Reduce client JS bundle
- **Database Queries**: Efficient Drizzle queries
- **Connection Pooling**: Neon serverless driver
- **Caching**: Consider for static content

### 19.3 Canvas Optimization

- **Debounced Autosave**: 800ms delay reduces API calls
- **Thumbnail Generation**: Only on save
- **Lazy Loading**: Excalidraw dynamic import
- **Snapshot Comparison**: Skip save if unchanged

### 19.4 Recommended Improvements

- [ ] Add Redis caching for frequently accessed data
- [ ] Implement rate limiting on API routes
- [ ] Add image compression for thumbnails
- [ ] Optimize bundle with bundle analyzer
- [ ] Add service worker for offline capabilities

## 20. Troubleshooting & Maintenance

### 20.1 Common Issues

| Issue | Symptoms | Solution |
| --- | --- | --- |
| **Database Connection** | Boards not loading, API errors | Check `DATABASE_URL`, run `npm run db:push` |
| **Auth Issues** | Redirect loops, 401 errors | Verify Clerk keys, check middleware config |
| **AI Generation Fails** | Errors in assistant panel | Check `GEMINI_API_KEY`, verify credits, check API quota |
| **Canvas Not Loading** | Blank canvas, console errors | Check Excalidraw CSS import, browser compatibility |
| **Build Errors** | TypeScript/ESLint errors | Run `npm run lint`, fix type issues |
| **Share Link 404** | Public link doesn't work | Verify token exists, board not deleted |

### 20.2 Debugging

**Development Tools:**
- Next.js DevTools
- React DevTools
- Browser Console
- Drizzle Studio: `npm run db:studio`
- Network tab for API calls

**Logging:**
- Console errors in development
- API route error logging
- Check server logs in production

### 20.3 Maintenance Tasks

**Regular:**
- Update dependencies (`npm update`)
- Check for security vulnerabilities (`npm audit`)
- Monitor database usage
- Review API quotas (Clerk, Gemini)
- Clean up old thumbnails

**Periodic:**
- Database backups
- Review user feedback
- Performance audits
- Security reviews

## 21. Appendix

### 21.1 Useful Commands

```bash
# Development
npm run dev

# Build
npm run build
npm start

# Database
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio

# Code Quality
npm run lint

# Git
git add .
git commit -m "message"
git push origin main
```

### 21.2 Key Files Reference

| File | Purpose |
| --- | --- |
| `app/layout.tsx` | Root layout, fonts, providers |
| `app/proxy.ts` | Clerk middleware |
| `db/schema.ts` | Database schema |
| `lib/boards.ts` | Board data access |
| `lib/ai-tools.ts` | AI configuration |
| `components/whiteboard/workspace.tsx` | Main whiteboard |
| `components/landing/landing-motion.tsx` | Landing animations |
| `app/landing.css` | Landing styles |

### 21.3 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Excalidraw Documentation](https://docs.excalidraw.com)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Neon Documentation](https://neon.tech/docs)

### 21.4 Glossary

| Term | Definition |
| --- | --- |
| **App Router** | Next.js routing system using file-system based routing in `app/` directory |
| **RSC** | React Server Components - components rendered on the server |
| **RCC** | React Client Components - components rendered on the client |
| **Soft Delete** | Marking records as deleted without removing from database |
| **Autosave** | Automatic saving of changes without manual save action |
| **Thumbnail** | Small preview image of board content |
| **Share Token** | Unique identifier for public read-only board access |
| **Credits** | Usage quota for AI generation features |
| **Turbopack** | Next.js bundler for faster development builds |

---

**Document Status:** Complete and up-to-date  
**Maintained By:** Development Team  
**Last Review:** October 24, 2026

*This documentation is intended for developers, contributors, and stakeholders involved in the AI Whiteboard project.*
