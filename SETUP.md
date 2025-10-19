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

- Swagger docs live at `http://localhost:3001/docs` (OpenAPI 3.1) for quick endpoint discovery.
- Metrics endpoint: `http://localhost:3001/api/v1/metrics`.

## Web

```bash
cp web/.env.example web/.env
pnpm -C web dev
```

### OAuth configuration

1. Copy the API env template and populate the secrets:

   ```bash
   cp api/.env.example api/.env
   ```

2. Register Google and Facebook apps and fill in:

   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
   - `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_CALLBACK_URL`
   - `WEB_APP_URL` (defaults to `http://localhost:3000` for dev)
   - `JWT_SECRET` *(change from the default before deploying)*

3. Restart the API so the new environment variables are picked up.

The login page links to `/auth/google` and `/auth/facebook`. Successful callbacks redirect to
`WEB_APP_URL/(auth)/oauth/callback`, which stores the JWT inside an httpOnly `session_token` cookie.

### Observability extras

- `LOG_LEVEL` tunes the structured pino logger (`debug` in dev, `info`+ in prod).
- Provide `SENTRY_DSN` (and optional `SENTRY_TRACES_SAMPLE_RATE`) to forward 5xx errors and traces to Sentry automatically.
- Audit entries now persist to disk by default (`storage/audit-log.json`); override with `AUDIT_LOG_FILE` or disable via `AUDIT_LOG_PERSIST=false`.
- Prometheus scrapers can read metrics from `/api/v1/metrics` (request counts + latency histograms).

## CI (optional)

- See `.github/workflows/ci.yml`

## Notes

- OAuth login is now the default. Demo logins remain available and issue JWTs alongside the historical mock tokens.
- The API honours `DATA_MODE` (`mock` by default). Future persistence work will plug in additional modes without breaking mock demos.
- Prisma schema remains for future Postgres wiring but is not required for the demo today.
- Playwright smoke test in `web/e2e` targets the dashboard page.
- API unit/integration suite: `pnpm -C api test` (append `-- --coverage` for reports).
- E2E smoke (mock data): `pnpm test:e2e:mock` (boots API+Web automatically).
