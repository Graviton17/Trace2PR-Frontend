# Trace2PR Frontend

React app for Trace2PR: production errors become triaged incidents, verified fixes and draft pull
requests that you review in one click.

## Stack

- React 19 + TypeScript, Vite (with the React Compiler)
- Tailwind CSS v4, themed through the tokens in `src/index.css`
- TanStack Query for server state, React Router v7
- Supabase JS for sign-in (GitHub or Google OAuth)
- Lucide icons

## Getting started

Requires Node.js 20+ and npm 10+.

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:5173
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE=http://localhost:8000/api
```

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

## Project structure

Data flows one way: **`api/` → `hooks/` → `components/` and `pages/`**. Components never call
`fetch` or `useQuery` directly.

```
src/
├── main.tsx, App.tsx        # root, providers and routes
├── index.css                # design tokens (colors, fonts) mapped into Tailwind
├── api/                     # typed REST client, one module per backend resource
├── hooks/                   # TanStack Query hooks per resource, plus useInbox
├── context/AuthContext.tsx  # Supabase session
├── lib/                     # pure helpers: nav config, time, activity feed, cn()
├── components/
│   ├── ui/                  # primitives: Button, Card, Input, Dialog, toasts/confirm
│   ├── common/              # shared building blocks: badges, split view, empty/error states
│   ├── layout/              # dashboard shell: sidebar, top bar
│   ├── command/             # ⌘K command palette
│   ├── inbox/  incidents/  prs/  fixes/  settings/   # feature components
│   └── landing/             # landing page sections + landing.css
└── pages/                   # one default-exported component per route
```

Conventions: components use named exports, route pages use default exports. Colors come from the
tokens (`bg-surface`, `text-muted`, `border-line`, `text-acid`…), never raw hex.

## Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/login`, `/auth/callback` | OAuth sign-in |
| `/onboarding` | First-run setup: GitHub → repositories → monitoring |
| `/dashboard` | Inbox: draft PRs to review, incidents to decide on, new alerts |
| `/dashboard/incidents[/:id]` | Incidents, list + detail split view |
| `/dashboard/alerts[/:alertId]` | Alerts, list + detail split view |
| `/dashboard/prs[/:id]` | Pull requests, list + diff and review |
| `/dashboard/knowledge` | Past incidents and fixes |
| `/dashboard/settings/:section` | Integrations, repositories, SDK keys, sandbox, profile, notifications, account |

`/dashboard/integrations` and `/dashboard/sandbox` redirect into Settings (keeping the query string
Composio adds when it returns from a connection). The dashboard opens only once onboarding is
complete. Press ⌘K / Ctrl+K anywhere in the dashboard to jump to a page, incident or PR.

## Backend

The FastAPI backend lives in the sibling `Trace2PR` repository. Every request to `VITE_API_BASE`
carries the Supabase access token (see `src/api/client.ts`).
