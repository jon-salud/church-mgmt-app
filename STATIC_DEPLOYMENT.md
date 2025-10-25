# Static Deployment Strategy for ChurchApp

## Overview

This document outlines the strategy for maintaining two versions of the ChurchApp:

- **Main branch**: Full-featured Next.js application with server-side capabilities
- **Static branch**: GitHub Pages compatible static export version

## Branch Strategy

### Main Branch (`main`)

- **Purpose**: Full server-side Next.js application
- **Features**: Authentication, API routes, Server Actions, database integration
- **Deployment**: Traditional server deployment (Vercel, self-hosted, etc.)
- **Development**: All new features developed here first

### Static Branch (`make-static-pages`)

- **Purpose**: GitHub Pages compatible static site
- **Features**: Demo data, client-side only, offline-capable
- **Deployment**: Automated GitHub Pages deployment
- **Limitations**: No authentication, no data persistence, demo-only

## Creating a Static Deployment Branch

### Step 1: Create Branch from Main

```bash
git checkout main
git pull origin main
git checkout -b make-static-pages
```

### Step 2: Configure Next.js for Static Export

Update `web/next.config.js` to enable conditional static export:

```javascript
const nextConfig = {
  reactStrictMode: true,
  // Only enable static export for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Configure for GitHub Pages deployment
  basePath: process.env.NODE_ENV === 'production' ? '/church-mgmt-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/church-mgmt-app/' : '',
};
```

### Step 3: Remove Server-Side Dependencies

#### API Routes

Delete all API route files:

- `web/app/api/auth/[...auth0]/route.ts`
- `web/app/api/events/[eventId]/attendance/csv/route.ts`
- `web/app/api/giving/contributions/csv/route.ts`

#### Server Actions

Replace Server Actions with dummy implementations in `web/app/actions.ts`:

```typescript
export const logoutAction = () => {};
export const loginAction = () => {};
// ... other actions as empty functions
```

#### Authentication Middleware

Remove or disable authentication middleware that depends on cookies.

### Step 4: Replace API Calls with Demo Data

#### Create Static API File

Create `web/lib/api.static.ts` with demo data implementations:

```typescript
export const api = {
  async dashboardSummary() {
    return {
      memberCount: 42,
      groupCount: 8,
      eventCount: 12,
      contributionTotal: 15420.50
    };
  },
  // ... other API functions with demo data
};
```

#### Update Page Imports

Replace `web/lib/api.server.ts` imports with `web/lib/api.static.ts`:

```typescript
// Before
import { api } from '@/lib/api.server';

// After
import { api } from '@/lib/api.static';
```

### Step 5: Handle Dynamic Routes

#### Add generateStaticParams

For all dynamic routes, add `generateStaticParams` functions:

```typescript
export async function generateStaticParams() {
  // Return array of params for static generation
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    // ... more IDs
  ];
}
```

#### Remove Search Params

Replace `searchParams` usage with demo data since it causes dynamic rendering:

```typescript
// Before
const { searchParams } = await props.searchParams;
const filters = searchParams.get('filters');

// After
const filters = null; // or demo filters
```

### Step 6: Fix Authentication Dependencies

#### Remove Cookie-Based Functions

Replace functions that use `cookies()` or `headers()`:

```typescript
// Before
import { cookies } from 'next/headers';
export async function currentUser() {
  const session = cookies().get('session_token');
  // ...
}

// After
export async function currentUser() {
  return demoUser; // static demo user
}
```

#### Update Login/Auth Pages

Simplify authentication pages for demo mode:

```typescript
// Remove searchParams and action props
export default function LoginPage() {
  return <DemoLoginForm />;
}
```

### Step 7: Configure GitHub Actions

#### Update Deployment Workflow

Modify `.github/workflows/deploy.yml` to trigger only on the static branch:

```yaml
on:
  push:
    branches:
      - make-static-pages  # Only deploy from this branch
  workflow_dispatch:
```

#### Build Configuration

The workflow uses:

```yaml
- name: Build web app
  run: pnpm -C web export
  env:
    NODE_ENV: production
```

### Step 8: Handle Form Submissions

#### Remove Action Props

Remove `action` props from forms since Server Actions are disabled:

```typescript
// Before
<form action={createAnnouncementAction}>
  {/* form fields */}
</form>
// After
<form onSubmit={handleSubmit}>
  {/* form fields */}
</form>
```

#### Add Client-Side Handlers

Implement client-side form handling with demo feedback:

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Show success message or demo feedback
  alert('Demo mode: Form submission simulated');
};
```

## Maintaining Both Branches

### Development Workflow

1. **Develop on Main**: All new features developed on `main` branch
2. **Sync to Static**: Periodically merge `main` into static branch
3. **Apply Static Fixes**: Re-apply static export modifications after merge
4. **Test Static Build**: Ensure static export still works
5. **Deploy Static**: Push static branch to trigger deployment

### Merge Conflicts Resolution

When merging `main` into static branch:

1. **API Imports**: Revert to `api.static` imports
2. **Authentication**: Re-apply demo authentication
3. **Server Actions**: Re-apply dummy implementations
4. **Dynamic Routes**: Re-apply `generateStaticParams`
5. **Search Params**: Re-apply demo data replacements

### Automated Sync Script

Consider creating a script to automate the static modifications:

```bash
#!/bin/bash
# sync-static.sh
git checkout make-static-pages
git merge main
# Apply static modifications automatically
# ... script to replace imports, etc.
```

## Testing Strategy

### Static Branch Testing

- **Build Test**: `pnpm -C web build` (should generate 43 pages)
- **Export Test**: `pnpm -C web export` (production build)
- **Accessibility**: Run accessibility tests
- **Performance**: Test loading speeds

### Main Branch Testing

- **Full Integration**: API routes, authentication, database
- **E2E Tests**: Complete user workflows
- **Server Actions**: Form submissions and data persistence

## Deployment URLs

- **Static Version**: `https://jon-salud.github.io/church-mgmt-app/`
- **Main Version**: Deploy separately (Vercel, etc.)

## Limitations of Static Version

- ❌ No user authentication
- ❌ No data persistence
- ❌ No real-time features
- ❌ No email notifications
- ❌ No file uploads
- ✅ Offline-capable with service worker
- ✅ Fast loading (pre-generated pages)
- ✅ No server costs

## Future Considerations

### Feature Flags

Consider using feature flags to conditionally enable/disable features:

```typescript
const IS_STATIC = process.env.NODE_ENV === 'production';
if (!IS_STATIC) {
  // Server-only features
}
```

### Automated Deployment

Set up automated branch synchronization and deployment testing.

### Documentation Updates

Keep this document updated as the project evolves and new static modifications are needed.<

```txt
/Users/<user>/Github/ChurchApp/STATIC_DEPLOYMENT.md
```
