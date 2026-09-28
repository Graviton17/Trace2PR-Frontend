# Trace2PR Frontend

The Trace2PR frontend is a React application for incident response workflow that turns production signals into evidence-backed, reviewable pull requests.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (design tokens)
- Lucide React icons
- Framer Motion
- React Router v7
- Supabase JS Client (Auth)

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer

## Getting Started

```bash
cd Trace2PR-frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Vite serves the app at `http://localhost:5173`.

## Environment Variables

Create `.env.local` with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE=http://localhost:8000/api
```

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and create production build in `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── App.tsx                    # Application entry with routing
├── main.tsx                   # React root
├── index.css                  # Global design tokens
├── lib/
│   ├── utils.ts               # Utility functions (cn, etc.)
│   └── supabase.ts            # Supabase client + API helpers
├── context/
│   └── AuthContext.tsx        # Authentication provider + hooks
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   └── landing/
│       ├── LandingPage.tsx
│       ├── LandingHeader.tsx
│       ├── BrandMark.tsx
│       ├── AgentPreview.tsx
│       ├── IntegrationSection.tsx
│       ├── WorkflowSection.tsx
│       └── FeatureSection.tsx
└── pages/
    ├── LoginPage.tsx          # Email/password + OAuth + Magic link
    ├── AuthCallbackPage.tsx   # OAuth callback handler
    ├── DashboardHome.tsx
    ├── IncidentsPage.tsx
    ├── IncidentDetailPage.tsx
    ├── AlertsPage.tsx
    ├── PRsPage.tsx
    ├── IntegrationsPage.tsx   # Composio OAuth integrations
    ├── KnowledgePage.tsx
    ├── SandboxPage.tsx
    └── SettingsPage.tsx       # Profile, notifications, appearance
```

## Authentication Flow

### Login Page (`/login`)

Supports multiple auth methods:
- **Email/Password** - Traditional signup/signin
- **Magic Link** - Passwordless email authentication
- **OAuth** - GitHub and Google via Supabase

### Auth Callback (`/auth/callback`)

Handles OAuth redirects from Supabase. Automatically exchanges auth code for session and redirects to intended page.

### Protected Routes

All `/dashboard/*` routes require authentication. Unauthenticated users are redirected to `/login` with `state.from` preserved for post-login redirect.

```tsx
// Usage in components
const { user, session, signIn, signOut } = useAuth();
```

## Integrations Page

The Integrations page (`/dashboard/integrations`) uses **Composio** for OAuth:

1. **Catalog** - Shows available integrations (Datadog, Sentry, GitHub, etc.)
2. **Connect** - Initiates Composio OAuth flow
3. **Status** - Real-time connection verification
4. **Webhook URL** - Auto-generated for monitoring tool configuration

### Adding New Integrations

1. Add to `INTEGRATION_CATALOG` in `IntegrationsPage.tsx`
2. Add to `COMPOSIO_APP_MAP` in `backend/trace2pr/integrations/composio_service.py`
3. Configure in Composio dashboard

## Design System

CSS custom properties in `index.css`:

```css
:root {
  --ink: #fafafa;           /* Primary text */
  --muted: #888;            /* Secondary text */
  --muted-strong: #aaa;     /* Stronger secondary */
  --acid: #a3e635;          /* Primary action color */
  --danger: #ef4444;        /* Error/destructive */
  --warning: #fbbf24;       /* Warning/pending */
  --surface: #111;          /* Card backgrounds */
  --surface-raised: #1a1a1a; /* Elevated surfaces */
  --page: #090909;          /* Page background */
  --page-deep: #0f0f0f;     /* Input backgrounds */
  --line: #2a2a2a;          /* Borders */
  --sans: 'Manrope', sans-serif;
  --mono: 'DM Mono', monospace;
}
```

## API Integration

Use the `api` object from `lib/supabase.ts`:

```typescript
import { api } from '../lib/supabase';

// Integrations
const catalog = await api.getCatalog();
const integrations = await api.listIntegrations();
const result = await api.connectIntegration('datadog', 'observability');

// Incidents
const incidents = await api.listIncidents({ status: 'open' });

// Auth
const { user } = await api.getCurrentUser();
```

All requests automatically include the Supabase access token.

## Deployment

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or any static host
```

### Production Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE=https://your-api.com/api
```

## Contributing

- Keep page sections modular under `src/pages/`
- Add shared visual values to `src/index.css` as tokens
- Preserve keyboard behavior and `prefers-reduced-motion` support
- Never commit real credentials or API keys

## Backend Relationship

The FastAPI backend lives in `../Trace2PR-backend`. API routes:
- `/api/auth/*` - Authentication
- `/api/integrations/*` - Composio integrations
- `/api/webhooks/*` - Webhook receivers
- `/api/incidents/*` - Incident management
- `/api/prs/*` - Pull requests
- `/api/knowledge/*` - Knowledge base