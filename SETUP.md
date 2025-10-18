# Setup (Monorepo)

## Prereqs

- Node.js 20+
- pnpm (`corepack enable`)
- PostgreSQL (local or managed)

## Install

```bash
corepack enable
pnpm install
```

## API

```bash
cp api/.env.example api/.env
pnpm -C api prisma:generate
pnpm -C api prisma:migrate
pnpm -C api prisma:seed
pnpm -C api dev
```

## Web

```bash
cp web/.env.example web/.env
pnpm -C web dev
```

## CI (optional)

- See `.github/workflows/ci.yml`

## Notes

- Auth0 wiring included (configure envs).
- Prisma schema reflects multi-group membership & taxonomy.
- Playwright smoke test in `web/e2e`.
