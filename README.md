# Church Management — Starter Monorepo

Tech stack:
- **API:** NestJS (Fastify) + Prisma (PostgreSQL), OpenAPI
- **Web (PWA):** Next.js (App Router) + React + Tailwind + shadcn/ui (scaffold hook)
- **Tests:** Jest (API unit/integration) + Playwright (web e2e)
- **Auth (placeholder):** OAuth (Google/Facebook) via Passport or Auth0 — stubs included

> This is a scaffold aligned with the PRD. It compiles once dependencies are installed.

## Quickstart

```bash
# Node 20+ recommended
corepack enable

# Install workspaces
pnpm install

# Environment
cp api/.env.example api/.env

# Dev: run API and Web
pnpm -C api prisma:generate
pnpm -C api dev
pnpm -C web dev
```

## Structure
```
.
├─ package.json               # workspaces root
├─ pnpm-workspace.yaml
├─ .github/workflows/ci.yml
├─ api/                       # NestJS + Prisma
└─ web/                       # Next.js PWA
```


## Auth0 Setup (Quick)
1. Create an Auth0 tenant and Application (Regular Web App).
2. Set allowed callback/logout URLs to `http://localhost:3000/api/auth/callback` and `http://localhost:3000/`.
3. Copy envs into `web/.env` and `api/.env`:
   - WEB: `AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET`
   - API: `AUTH0_ISSUER, AUTH0_AUDIENCE`
4. Start web: `pnpm -C web dev` → Login using `/api/auth/login`.
5. The API expects Bearer JWTs issued by Auth0 (RS256). Protect routes via `@UseGuards(AuthGuard('jwt'))`.

## Tailwind & UI
- Tailwind is configured. Use classes in components.
- A minimal shadcn-style `<Button />` component is included in `components/ui/button.tsx`.
- Add more components as needed.

## Prisma Seed
- Run `pnpm -C api prisma:migrate` then `pnpm -C api prisma:seed`.
- Seeds a church, admin user (`admin@example.com`), worship team group, event, and initial announcement.
