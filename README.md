# Church Management — Demo-Ready MVP

This monorepo packages a complete walkthrough of the PRD using mock data only. You get:

| Surface | Highlights |
| ------- | ---------- |
| **API** | NestJS (Fastify), in-memory mock store, OAuth-style demo login, OpenAPI docs |
| **Web** | Next.js App Router + React + Tailwind + PWA service worker + shadcn-style UI seeds |
| **Data** | Members, groups, events, announcements, giving, seeded sessions (no Postgres required) |
| **Tests** | Jest (API smoke) and Playwright (dashboard e2e) |

---

## Prerequisites

- Node.js 20+
- `pnpm` (recommended via `corepack enable`)
- macOS/Linux/WSL (windows works via WSL2)

> The Prisma schema remains in the repo for future Postgres wiring, but the MVP runs entirely from the mock store. You do **not** need a database to demo the product.

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

---

## Run the Stacks (mock data)

In two terminals:

```bash
# API (NestJS + Fastify, in-memory store)
pnpm dev:api:mock

# Web (Next.js PWA)
pnpm -C web dev
```

Both servers hot-reload. The API serves Swagger docs at [http://localhost:3001/docs](http://localhost:3001/docs). The web app lives at [http://localhost:3000](http://localhost:3000).

---

## Data Modes

The API chooses its backing store via `DATA_MODE`:

- `mock` *(default)* – uses the in-memory `MockDatabaseService`. This is what CI and the Playwright smoke suite run against.
- Additional modes (e.g. `prisma`) will be wired up as the persistent layer lands. Choosing an unsupported value currently throws a helpful error so you know to keep the flag on `mock`.

Examples:

```bash
# Unix/macOS
DATA_MODE=mock pnpm -C api dev          # explicit mock mode

# Windows (PowerShell)
$Env:DATA_MODE = "mock"; pnpm -C api dev
```

The helper scripts (`pnpm dev:api:mock`, `pnpm test:e2e:mock`) wrap those exports for convenience.

---

## Demo Authentication

- POST `/auth/login` with `{ email, provider, role }` to obtain a mock JWT.
- Pre-seeded accounts (also shown on the login screen):
  - `admin@example.com` (provider: `google`, token: `demo-admin`)
  - `leader@example.com` (provider: `facebook`, token: `demo-leader`)
  - `member1@example.com` (provider: `google`, token: `demo-member`)
- If no token is supplied, the API falls back to `demo-admin` to keep the demo browseable.
- The Next.js login form stores the token in an httpOnly cookie so server components render with the correct role.

---

## Feature Walkthrough

- **Dashboard** – snapshot cards (members, groups, events, giving), next events, unread announcements, and recent contributions.
- **Member Directory** – search by name/email, view profiles with groups, attendance history, giving records.
- **Groups** – roster, meeting schedule, taxonomy, linked upcoming events.
- **Events & Attendance** – event list with inline attendance form (writes back to the mock store).
- **Announcements** – feed with read tracking and basic audience metadata.
- **Giving** – manual ledger with create form and seeded funds.
- **Audit Log** – admin-only view of recent activity with filters for entity, actor, and date range.
- **Auth** – mock Google/Facebook flows with role assignment.
- **PWA** – manifest + service worker pre-cache key routes for offline dashboard snapshots (install via browser menu).

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

| Action | Command |
| ------ | ------- |
| Start API dev server (mock) | `pnpm dev:api:mock` |
| Build API | `pnpm -C api build` |
| Run API tests (Jest smoke) | `pnpm -C api test` |
| Start web dev server | `pnpm -C web dev` |
| Build web for prod | `pnpm -C web build` |
| Install Playwright browsers | `pnpm -C web exec playwright install` |
| Run Playwright smoke (mock) | `pnpm test:e2e:mock` |
| One-shot E2E (boot API/Web + test) | `pnpm test:e2e` |

---

## Mock Data Source

- Canonical seed data lives in `api/src/mock/mock-data.ts`.
- By default (`DATA_MODE=mock`), runtime operations go through the in-memory data store so the app “feels real” without a database.

---

## Styling & UI

- Tailwind CSS is configured globally (`web/app/globals.css`, `tailwind.config.ts`).
- A starter shadcn-style `<Button />` lives in `web/components/ui/button.tsx`.
- Mix and match your own component library on top of the Tailwind foundation.

---

## PWA Notes

- Manifest (`web/public/manifest.json`) and service worker (`web/public/service-worker.js`) are included.
- The service worker caches core read screens for offline demos.
- Install the app via your browser menu to experience the PWA shell.

---

## Accessibility

- Global skip link lets keyboard and assistive tech users bypass navigation.
- Primary and secondary navigation landmarks expose descriptive `aria-label`s.
- Listings tables now ship with captions and scoped column headers for screen readers.
- Search inputs include associated labels (visually hidden) to satisfy WCAG form requirements.
- Playwright E2E suite includes automated checks for skip link focus, labelled navigation, and table captions (`pnpm -C web test:e2e`).

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `@fastify/static` missing | Run `pnpm -C api install` (already in `package.json`). |
| TypeScript packages missing in web | `pnpm -C web install` ensures `@types/node`, `@types/react`, `@types/react-dom` are present. |
| API shows ESM module errors | Ensure `api/tsconfig.json` still targets `"module": "commonjs"` and rerun `pnpm -C api dev`. |
| Playwright needs browsers | `pnpm -C web exec playwright install` installs the chromium snapshot. |

Enjoy the demo, and feel free to swap the mock layer for Prisma + Postgres when you’re ready for production data.
