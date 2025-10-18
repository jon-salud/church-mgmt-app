# Setup (Monorepo)

## Prereqs

- Node.js 20+
- pnpm (`corepack enable`)
- PostgreSQL (optional – mock data is served in-memory for the MVP demo)

## Install

```bash
corepack enable
pnpm install
```

## API (mock data)

```bash
pnpm dev:api:mock
```

## Web

```bash
cp web/.env.example web/.env
pnpm -C web dev
```

## CI (optional)

- See `.github/workflows/ci.yml`

## Notes

- Demo login via `/auth/login` issues mock OAuth tokens (see README).
- The API honours `DATA_MODE` (`mock` by default). Future persistence work will plug in additional modes without breaking mock demos.
- Prisma schema remains for future Postgres wiring but is not required for the demo today.
- Playwright smoke test in `web/e2e` targets the dashboard page.
