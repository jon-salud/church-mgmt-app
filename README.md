# Church Management — Demo-Ready MVP

This monorepo packages a complete walkthrough of the PRD using mock data only. You get:

| Surface   | Highlights                                                                             |
| --------- | -------------------------------------------------------------------------------------- |
| **API**   | NestJS (Fastify), in-memory mock store, OAuth-style demo login, OpenAPI docs           |
| **Web**   | Next.js App Router + React + Tailwind + PWA service worker + shadcn-style UI seeds     |
| **Data**  | Members, groups, events, announcements, giving, seeded sessions (no Postgres required) |
| **Tests** | Jest (API smoke) and Playwright (dashboard e2e), with CI linting and formatting checks |

---

## 🚀 Quick Demo (GitHub Codespaces)

For the fastest demo experience, use GitHub Codespaces:

1. Click the **"Code"** button above → **"Create codespace on main"**
2. Wait for the environment to build (5-10 minutes) - dependencies will be installed automatically
3. **Start the demo servers** using one of these methods:

   ### Option A: Use the start script (Recommended)

   ```bash
   ./start-demo.sh
   ```

   ### Option B: Use VS Code Tasks
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Tasks: Run Task" and select it
   - Choose "Start Full Demo"

   ### Option C: Manual startup
   - Open a terminal and run: `cd api && DATA_MODE=mock pnpm dev`
   - Open another terminal and run: `cd web && pnpm dev`

4. **Find the Ports panel**: Look at the bottom of VS Code for a "PORTS" tab (next to TERMINAL,
   OUTPUT, etc.)

   ### Option A: Automatic Port Forwarding (Recommended)
   - Click the globe icons (🌐) next to ports 3000 and 3001 to open them in new browser tabs

   ### Option B: Manual Port Forwarding (if globe icons don't appear)
   - Click the **"Forward a Port"** button in the PORTS panel
   - Enter `3000` and press Enter (for the web app)
   - Enter `3001` and press Enter (for the API)
   - Click the globe icons that appear next to the forwarded ports

5. Start exploring the app!

**Demo Documentation**: See [docs/DEMO.md](docs/DEMO.md) for a comprehensive guide to all features.

**API Reference**: See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for complete API documentation.

**Demo URLs:**

**Demo URLs:**

- **Frontend**: <http://localhost:3000>
- **API**: <http://localhost:3001>
- **API Docs**: <http://localhost:3001/docs>

---

## Local Development

- Node.js 20+
- `pnpm` (recommended via `corepack enable`)
- macOS/Linux/WSL (windows works via WSL2)

> The Prisma schema remains in the repo for future Postgres wiring, but the MVP runs entirely from
> the mock store. You do **not** need a database to demo the product.

---

## Installation & Environment

```bash
corepack enable             # if pnpm is not already available
pnpm install                # install workspace dependencies

# Optional – API .env (currently only used for future secrets)
cp api/.env.example api/.env

# Optional – Web env overrides (defaults already point to local API)
cp web/.env.example web/.env
```

The web env template exposes:

- `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL` – defaults to `http://localhost:3001/api/v1`
- `DEMO_DEFAULT_TOKEN` – defaults to `demo-admin`, used when no cookie token is present.

API runtime toggles:

- `LOG_LEVEL` controls pino structured log verbosity (`debug`, `info`, `warn`, `error`).
- `SENTRY_DSN` and optional `SENTRY_TRACES_SAMPLE_RATE` enable error reporting to Sentry.
- `AUDIT_LOG_FILE` overrides the persisted audit trail location (`storage/audit-log.json` by
  default).
- `AUDIT_LOG_PERSIST=false` disables audit log writes (automatically disabled during Jest runs).

---

## Run the Stacks (mock data)

In two terminals:

```bash
# API (NestJS + Fastify, in-memory store)
pnpm dev:api:mock

# Web (Next.js PWA)
pnpm -C web dev
```

Both servers hot-reload. The API serves Swagger docs at
[http://localhost:3001/docs](http://localhost:3001/docs). The web app lives at
[http://localhost:3000](http://localhost:3000).

---

## API Docs

- Swagger now enumerates every controller (auth, users, households, groups, events, announcements,
  giving, dashboard, audit).
- DTOs include type metadata for request/response bodies; try the “Try it out” button on any route
  at `http://localhost:3001/docs`.
- Generic schemas are used for nested mock payloads so the docs stay useful even as the backing
  store swaps between mock and future Prisma modes.

---

## Data Modes

The API chooses its backing store via `DATA_MODE`:

- `mock` _(default)_ – uses the in-memory `MockDatabaseService`. This is what CI and the Playwright
  smoke suite run against.
- Additional modes (e.g. `prisma`) will be wired up as the persistent layer lands. Choosing an
  unsupported value currently throws a helpful error so you know to keep the flag on `mock`.

Examples:

```bash
# Unix/macOS
DATA_MODE=mock pnpm -C api dev          # explicit mock mode

# Windows (PowerShell)
$Env:DATA_MODE = "mock"; pnpm -C api dev
```

The helper scripts (`pnpm dev:api:mock`, `pnpm test:e2e:mock`) wrap those exports for convenience.

---

## Authentication

- **Production flows:** `/auth/google` and `/auth/facebook` perform real OAuth handshakes (Passport
  strategies) and issue signed JWT access tokens. Configure the providers with:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
  - `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_CALLBACK_URL`
  - `JWT_SECRET`, `JWT_EXPIRES_IN` _(optional, defaults to 1h)_
  - `WEB_APP_URL` _(used to send users back to the Next.js app on success)_
- **Demo shortcut:** POST `/auth/login` with `{ email, provider, role }` still works for the seeded
  accounts and returns both the historical mock token and a JWT. The login screen also exposes a
  “demo mode” button that sets the `demo-admin` session without leaving the app.
- If no Bearer token is provided and demo mode is enabled, the API falls back to `demo-admin` so
  unauthenticated users can still explore the UI.
- The Next.js callback route stores the JWT in an httpOnly `session_token` cookie; a companion
  `session_provider` cookie (non-HTTP-only) lets the UI surface which path the user took.

---

## Feature Walkthrough

- **Dashboard** – snapshot cards (members, groups, events, giving), next events, unread
  announcements, and recent contributions.
- **Member Directory** – search by name/email, view profiles with groups, attendance history, giving
  records.
- **Groups** – roster, meeting schedule, taxonomy, linked upcoming events.
- **Events & Attendance** – event list with inline attendance form (writes back to the mock store).
- **Announcements** – feed with read tracking and basic audience metadata.
- **Giving** – manual ledger with create form and seeded funds.
- **Audit Log** – admin-only view of recent activity with filters for entity, actor, and date range.
- **Auth** – mock Google/Facebook flows with role assignment.
- **Households** – household listing and detail views.
- **PWA** – manifest + service worker pre-cache key routes for offline dashboard snapshots (install
  via browser menu).
- **Theming** – switch between light and dark modes.
- **Requests** – a unified form for members to submit various types of requests (Prayer,
  Benevolence, Improvements/Suggestions).

---

## Project Structure

```sh
.
├─ package.json               # workspace root scripts
├─ pnpm-workspace.yaml
├─ .github/workflows/ci.yml
├─ api/                       # NestJS API (mock store + modules)
└─ web/                       # Next.js PWA client
```

---

## Useful Commands

| Action                             | Command                               |
| ---------------------------------- | ------------------------------------- |
| Build all packages                 | `pnpm -r build`                       |
| Start API dev server (mock)        | `pnpm dev:api:mock`                   |
| Build API                          | `pnpm -C api build`                   |
| Run API unit/integration tests     | `pnpm -C api test`                    |
| Run API tests with coverage        | `pnpm -C api test -- --coverage`      |
| Start web dev server               | `pnpm -C web dev`                     |
| Build web for prod                 | `pnpm -C web build`                   |
| Install Playwright browsers        | `pnpm -C web exec playwright install` |
| Run Playwright smoke (mock)        | `pnpm test:e2e:mock`                  |
| One-shot E2E (boot API/Web + test) | `pnpm test:e2e`                       |
| Lint code                          | `pnpm lint`                           |
| Auto-fix linting issues            | `pnpm lint:fix`                       |
| Format code                        | `pnpm format`                         |
| Check code formatting              | `pnpm format:check`                   |

---

## Mock Data Source

- Canonical seed data lives in `api/src/mock/mock-data.ts`.
- By default (`DATA_MODE=mock`), runtime operations go through the in-memory data store so the app
  “feels real” without a database.

---

## Styling & UI

- **Theming**: The application supports both **light and dark themes**. A theme switcher is located
  in the header.
- **Component Library**: UI components are built with Tailwind CSS and follow the conventions of
  `shadcn/ui`. Core components can be found in `web/components/ui`.
- **Sidebar Navigation**: The main navigation sidebar now includes icons for each item to improve
  usability. The active page is highlighted.
- **UI Automation IDs**: All interactive elements have a unique `id` attribute for testability.

---

## Observability

- Structured JSON logging via `pino`; adjust verbosity with `LOG_LEVEL`.
  - Local tail: `pnpm dev:api:mock | pino-pretty` (or any JSON log viewer) to watch request
    lifecycle and bootstrap events.
  - Each entry includes `service`, `environment`, and contextual payloads so you can ship logs
    straight to ELK/Loki.
- Global HTTP error filter returns consistent payloads and forwards 5xx responses to Sentry when
  `SENTRY_DSN` is set.
  - Configure `SENTRY_DSN` (+ optional `SENTRY_TRACES_SAMPLE_RATE`) in `api/.env`, restart the API,
    and verify by hitting a failing route—the error shows up in Sentry with method/path metadata.
- Prometheus-friendly metrics live at `/api/v1/metrics` (request counts and latency histogram).
  - Curl locally: `curl http://localhost:3001/api/v1/metrics`.
  - Prometheus scrape example:

    ```yaml
    scrape_configs:
      - job_name: 'church-api'
        static_configs:
          - targets: ['localhost:3001']
        metrics_path: /api/v1/metrics
    ```

  - Grafana tips: plot `rate(church_app_http_requests_total[5m])` for throughput, and
    `histogram_quantile(0.95, sum(rate(church_app_http_request_duration_seconds_bucket[5m])) by (le,route))`
    for latency.

---

## PWA Notes

- Manifest (`web/public/manifest.json`) and service worker (`web/public/service-worker.js`) are
  included.
- The service worker caches core read screens for offline demos.
- Install the app via your browser menu to experience the PWA shell.

---

## Accessibility

- Global skip link lets keyboard and assistive tech users bypass navigation.
- Primary and secondary navigation landmarks expose descriptive `aria-label`s.
- Listings tables now ship with captions and scoped column headers for screen readers.
- Search inputs include associated labels (visually hidden) to satisfy WCAG form requirements.
- Playwright E2E suite includes automated checks for skip link focus, labelled navigation, and table
  captions (`pnpm -C web test:e2e`).

---

## Troubleshooting

| Symptom                            | Fix                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `@fastify/static` missing          | Run `pnpm -C api install` (already in `package.json`).                                       |
| TypeScript packages missing in web | `pnpm -C web install` ensures `@types/node`, `@types/react`, `@types/react-dom` are present. |
| API shows ESM module errors        | Ensure `api/tsconfig.json` still targets `"module": "commonjs"` and rerun `pnpm -C api dev`. |
| Playwright needs browsers          | `pnpm -C web exec playwright install` installs the chromium snapshot.                        |

Enjoy the demo, and feel free to swap the mock layer for Prisma + Postgres when you’re ready for
production data.
