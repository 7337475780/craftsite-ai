# CraftSite

A full-stack AI website builder. Give it a prompt, get a working website. Then edit it visually, manage content, invite teammates, and publish — all from one place.

---

## What is this

CraftSite started as an experiment to see how far you could push AI-generated frontends. It's grown into something closer to a headless website builder: you describe what you want, the AI generates a multi-page Next.js site, and then you can tweak it in a visual editor, manage content through a CMS, handle form submissions, track analytics, and deploy.

It's a monorepo. The backend is Express + Prisma on PostgreSQL. The frontend is Next.js 16 with React 19. They talk over REST and Socket.IO.

---

## Stack

**Backend** (`apps/api`)
- Node.js + Express
- Prisma ORM → PostgreSQL (Supabase)
- Socket.IO for realtime collaboration
- JWT auth with Google + GitHub OAuth
- Razorpay for billing
- Vitest for tests

**Frontend** (`apps/web`)
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Zustand for state
- @dnd-kit for drag and drop
- Framer Motion
- Sandpack for in-browser code preview

**Shared** (`packages/shared`)
- TypeScript types shared between the two apps
- Builder schema definitions (nodes, sections, themes, collections)

**Infrastructure**
- Turborepo for monorepo task orchestration
- pnpm workspaces
- Deployed on Render (API) + Vercel (Web)

---

## Features

### AI Generation
- Describe a website in plain text, get back a full multi-page React app
- Multiple AI providers: Gemini 2.5 Flash, OpenRouter (Qwen Coder), Groq, Mistral, Together
- The system picks the best available provider automatically, with fallback logic and per-model cooldowns
- Edit with follow-up prompts — the AI understands the current state of your site and makes targeted changes

### Visual Builder
- Canvas-based editor for editing generated sites without touching code
- Recursive node tree — every element on the page is a `BuilderNode` you can select, move, and edit
- Layer panel showing the full DOM-like hierarchy
- Property Inspector to edit any node's content, classes, and custom props
- Responsive viewport switching (desktop / tablet / mobile)
- Undo/redo with bounded history
- Live preview mode that hides the editing chrome

### Multi-Page Sites
- Create, rename, duplicate, delete, and reorder pages
- Each page has its own SEO settings (title, description, OG tags)
- Nested pages supported
- Navigation builder for managing navbar and footer menus
- Shared layouts, headers, and footers across pages

### CMS
- Create content collections (Blog Posts, Portfolio items, Products, anything)
- Define custom field schemas per collection
- Manage items with draft/published status
- Published items are included in the exported Next.js app as static list + detail pages
- Public API endpoints for reading collection data without authentication

### Asset Library
- Upload images, videos, and documents from the builder sidebar
- Assets stored per-project
- One-click URL copy for pasting into node props

### Form Submissions
- Any form on a published site can POST to the forms API
- Submissions land in an inbox in the builder
- Filter by status (New / Read / Archived)
- Mark submissions as read or archive them
- Full submission detail view with field-by-field display

### Collaboration
- Workspaces for teams — invite members by email
- Role-based permissions (owner, admin, member)
- Realtime presence — see who else is editing the same project via Socket.IO
- Comments and @mentions on projects
- Activity feed per project

### Publishing & Deployment
- One-click publish with a generated share URL (`/share/your-slug`)
- Deployment tracking with build logs and status
- Custom domain support with DNS verification
- Environment variables manager per project
- Export the entire project as a downloadable Next.js app (zip)

### Billing
- Credit-based system for AI generations
- Razorpay integration for payments
- Webhook handling for payment events
- Free / Pro plan distinction

### Admin
- Admin dashboard for managing users, blocking accounts, reviewing analytics
- Usage logs per user

### Analytics
- Per-project analytics: page views, share views
- Platform-wide event tracking

---

## Project Structure

```
craftsite-ai/
├── apps/
│   ├── api/                    # Express backend
│   │   ├── prisma/
│   │   │   └── schema.prisma   # All database models
│   │   └── src/
│   │       ├── routes/         # One file per resource
│   │       ├── services/       # Business logic + AI providers
│   │       │   └── ai/         # Gemini, OpenRouter, Groq, Mistral, etc.
│   │       ├── middleware/      # Auth, rate limiting
│   │       ├── realtime/       # Socket.IO server + presence
│   │       ├── lib/            # Prisma singleton, JWT helpers
│   │       └── config/         # Environment validation
│   │
│   └── web/                    # Next.js frontend
│       ├── app/                # App Router pages
│       │   ├── dashboard/
│       │   ├── generate/
│       │   ├── projects/[id]/
│       │   ├── share/[slug]/
│       │   ├── workspaces/
│       │   ├── billing/
│       │   ├── admin/
│       │   └── settings/
│       ├── components/
│       │   ├── builder/        # All visual editor components
│       │   ├── ui/             # Shared UI primitives (Button, Card, etc.)
│       │   └── share/          # Public preview components
│       ├── stores/             # Zustand state (builder, auth)
│       └── lib/                # API client, export utilities
│
└── packages/
    └── shared/                 # TypeScript types shared by api + web
        └── src/
            └── builder-schema.ts
```

---

## Database Models

| Model | Purpose |
|---|---|
| `User` | Auth, credits, plan, roles |
| `Project` | The root entity. Owns everything else |
| `ProjectVersion` | Snapshot history for undo/versioning |
| `Page` | Individual pages within a project |
| `Section` | Sections within a page (legacy) |
| `Layout` | Shared header/footer layouts |
| `Navigation` + `MenuItem` | Navbar/footer link trees |
| `Collection` + `CollectionItem` | CMS collections and their content |
| `Media` | Asset library per project |
| `FormSubmission` | Form data from published sites |
| `Deployment` | Deployment history and status |
| `Domain` | Custom domain records |
| `EnvironmentVariable` | Per-project env vars |
| `Workspace` + `WorkspaceMember` | Team management |
| `WorkspaceInvitation` | Email-based invites |
| `Notification` | In-app notifications |
| `ProjectComment` + `CommentMention` | Collaboration comments |
| `ProjectActivity` | Activity feed |
| `Payment` | Billing records |
| `UsageLog` + `AnalyticsEvent` | Usage and analytics tracking |

---

## API Routes

All routes under `/api/projects/:projectId/` are scoped to a project and require authentication.

| Route prefix | What it handles |
|---|---|
| `/api/auth` | Sign up, sign in, OAuth, token refresh |
| `/api/generate` | AI code generation |
| `/api/projects` | CRUD for projects |
| `/api/projects/:id/builder` | Visual builder data, compile, export |
| `/api/projects/:id/pages` | Page management |
| `/api/projects/:id/navigation` | Navbar/footer menus |
| `/api/projects/:id/cms` | Collections and items |
| `/api/projects/:id/media` | Asset library |
| `/api/projects/:id/forms` | Form submissions inbox |
| `/api/projects/:id/deployments` | Deployment management |
| `/api/projects/:id/domains` | Custom domains |
| `/api/projects/:id/environment` | Environment variables |
| `/api/projects/:id/analytics` | Per-project analytics |
| `/api/public/projects/:slug` | Public project view (no auth) |
| `/api/public/projects/:slug/collections` | Public CMS data |
| `/api/workspaces` | Team workspace management |
| `/api/billing` | Plans and payments |
| `/api/admin` | Admin-only operations |
| `/api/usage` | Credit usage |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A PostgreSQL database (the project uses Supabase, any Postgres works)

### Clone and install

```bash
git clone https://github.com/7337475780/craftsite-ai.git
cd craftsite-ai
pnpm install
```

### Set up environment variables

Copy `.env.example` to `.env` in `apps/api/`:

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in:

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d

# AI Providers (at least one required)
GEMINI_API_KEY=your-gemini-key
OPENROUTER_API_KEY=your-openrouter-key

# OAuth (optional but nice to have)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Razorpay (optional, for billing)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

For the web app, create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Run the database migrations

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### Start everything

From the repo root:

```bash
pnpm dev
```

This runs both the API (port 5000) and the web app (port 3000) in parallel via Turborepo.

Or start them individually:

```bash
# API
cd apps/api && pnpm dev

# Web
cd apps/web && pnpm dev
```

---

## Running Tests

```bash
# API tests (Vitest)
cd apps/api && pnpm test

# API with coverage
cd apps/api && pnpm test:coverage
```

---

## Building for Production

```bash
# From repo root
pnpm build

# Or individually
cd apps/api && pnpm build
cd apps/web && pnpm build
```

The API compiles TypeScript to `apps/api/dist/`. The web app builds to `.next/`.

---

## AI Provider System

The generation system isn't tied to a single API. It has a provider registry that tries each configured provider in priority order and falls back automatically if one fails or hits a rate limit.

Providers live in `apps/api/src/services/ai/`:

- `gemini.provider.ts` — Google Gemini (default, best quality)
- `openai-compatible.provider.ts` — base class for OpenAI-compatible APIs
- `openrouter.provider.ts` — OpenRouter (routes to many models)
- `groq.provider.ts` — Groq (fast)
- `mistral.provider.ts` — Mistral
- `together.provider.ts` — Together AI
- `mock.provider.ts` — used in tests

Set `AI_PROVIDER=auto` to let the system pick, or set it to a specific provider name.

---

## Visual Builder Architecture

The builder stores everything in a `BuilderProject` object (defined in `packages/shared/src/builder-schema.ts`). This gets saved to the `builderData` JSON column on the `Project` model.

A `BuilderProject` contains:
- `theme` — colors, fonts, border radius, spacing scale
- `pages[]` — each page has `sections[]` (legacy) and `nodes[]` (new)
- `collections[]` — CMS collection references
- `navigation[]` — menu structures

The `BuilderNode` type is the new rendering primitive. It's a recursive tree:

```ts
type BuilderNode = {
  id: string;
  type: "section" | "component" | "element";
  name: string;           // HTML tag name or component name
  props: Record<string, any>;
  children: BuilderNode[];
  parentId: string | null;
};
```

The canvas renders this tree recursively. Each node is independently selectable, hoverable, and editable.

When you hit **Export**, the `compileProjectToAppRouter()` function in `builder-compiler.service.ts` walks the entire project and generates a real Next.js app you can download and deploy anywhere.

---

## Deployment

The API is designed to run on Render (or any Node.js host). The web app deploys to Vercel.

See `DEPLOYMENT.md` for the full deployment checklist including environment variables, database setup, and CORS configuration.

---

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-thing`)
3. Make your changes
4. Run `pnpm test` and make sure nothing breaks
5. Open a PR

If you're adding a new API route, follow the pattern in existing route files — use `Router({ mergeParams: true })`, validate your inputs with Zod, and let Prisma handle the queries.

If you're adding a builder component, add the type to `builder-schema.ts` in the shared package, handle it in `RenderNodeContent` in `BuilderCanvas.tsx`, and add a compiler case in `builder-compiler.service.ts`.

---

## License

MIT
