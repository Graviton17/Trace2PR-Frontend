# Trace2PR frontend

The Trace2PR frontend is a React landing experience for an incident-response workflow that turns production signals into evidence-backed, reviewable pull requests.

It presents the product flow without collecting or sending credentials:

1. Receive an incident signal.
2. Correlate evidence and repository context.
3. Validate a focused fix in a sandbox.
4. Send a pull request for human review.

## Stack

- React 19 + TypeScript
- Vite
- CSS design tokens and responsive CSS Grid
- Lucide React icons
- Framer Motion (available for product UI components)

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer

## Getting started

```bash
cd Trace2PR-frontend
npm install
npm run dev
```

Vite serves the app locally at the address printed in the terminal, normally `http://localhost:5173`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Type-check and create a production build in `dist/`. |
| `npm run preview` | Serve the latest production build locally. |
| `npm run lint` | Run ESLint across the frontend source. |

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Project structure

```text
src/
├── App.tsx                         # Application entry component
├── index.css                       # Global design tokens and responsive styles
├── main.tsx                        # React root
└── components/
    └── landing/
        ├── LandingPage.tsx         # Page composition
        ├── LandingHeader.tsx       # Navigation and primary CTA
        ├── BrandMark.tsx           # Shared Trace2PR mark
        ├── AgentPreview.tsx        # Hero incident-run preview
        ├── IntegrationSection.tsx  # Interactive integration explorer
        ├── WorkflowSection.tsx     # Scroll-driven operating-level workflow
        └── FeatureSection.tsx      # PR-readiness and assurance section
```

## Landing-page design system

The global stylesheet uses reusable CSS custom properties instead of component-local color values:

- **Content frame:** 1280px maximum for the page, with a tighter 1160px workflow interaction.
- **Color system:** deep forest surfaces, high-contrast off-white text, and an acid-green primary action color.
- **Spacing:** compact 8px-based increments, with responsive section spacing.
- **Typography:** Manrope for interface and editorial copy; DM Mono for operational metadata.
- **Accessibility:** visible keyboard focus, semantic landmarks, reduced-motion support, responsive reflow, and accessible tab/tabpanel behavior.

## Interactive sections

### Integrations

The integrations explorer mirrors the services currently supported by the backend integration resolver:

- Datadog
- Sentry
- PagerDuty
- Grafana
- CloudWatch
- GitHub

Selecting a service updates the incident role and the credential shape required by the backend verifier. The **Connect** button is intentionally presentational at this stage: it changes local UI state only and does not accept, store, or submit credentials.

### Workflow

The “How it works” section is a scroll-driven operating-level walkthrough:

- Manual
- Assisted
- Supervised
- Autonomous

On desktop, its content panel remains in view while normal page scrolling advances the selected level. The stage controls are also keyboard and pointer accessible. On mobile, the component becomes a regular, non-sticky selectable panel.

## Backend relationship

The related FastAPI application lives in `../Trace2PR-backend`. It exposes route groups for alerts, incidents, analysis, sandbox execution, fixes, pull requests, integrations, and settings.

This frontend currently focuses on the public landing page and does not yet make API requests. When app screens are added, keep API clients, request/response types, and authentication concerns in dedicated modules rather than placing them inside presentational components.

## Contributing

- Keep page sections modular under `src/components/landing/`.
- Add shared visual values to `src/index.css` as tokens before reusing them.
- Preserve keyboard behavior and `prefers-reduced-motion` support when adding interactions.
- Avoid adding real credentials, API keys, or private service URLs to frontend code or commits.
