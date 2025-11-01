# Church Management App - Complete Tech Stack

## 🏗️ Architecture Overview

**Monorepo Structure** with pnpm workspaces:
- `api/` - NestJS backend with Fastify
- `web/` - Next.js 14+ frontend with App Router
- `docs/` - Source of truth documentation
- `scripts/` - Build and test automation

---

## 🔧 Core Technologies

### Package Manager & Monorepo
- **pnpm** v9.0.0 - Fast, disk-space efficient package manager
- **pnpm workspaces** - Monorepo management

### Backend Stack

#### Framework & Runtime
- **NestJS** v10.0.0 - Progressive Node.js framework with TypeScript
- **Fastify** v4.26.2 - High-performance web framework
- **Node.js** v18+ (LTS)

#### Database & ORM
- **Prisma** v5.20.0 - Type-safe ORM with schema migration
- **PostgreSQL** - Production database (configurable)
- **In-Memory Mock Store** - Development/testing (no DB required)

#### API & Documentation
- **OpenAPI/Swagger** v7.1.21 - Auto-generated API documentation
- **class-validator** v0.14.0 - Data validation decorators
- **class-transformer** v0.5.1 - Object serialization
- **zod** v3.23.8 - Schema validation

#### Authentication & Authorization
- **Passport.js** v0.7.0 - Flexible authentication middleware
  - Google OAuth v20
  - Facebook OAuth
  - JWT strategy
- **jsonwebtoken** v9.0.2 - JWT token management
- **jwks-rsa** v3.1.0 - JWKS client for Auth0

#### API File Handling
- **@fastify/multipart** v8.0.0 - Multipart form data handling
- **form-data** v4.0.4 - FormData builder
- **@fastify/static** v7.0.2 - Static file serving

#### Testing
- **Vitest** v4.0.5 - Ultra-fast unit testing framework
- **@nestjs/testing** v10.0.0 - NestJS testing module
- **@vitest/coverage-v8** - V8 coverage reporting
- **Playwright** v1.48.2 - E2E browser testing

#### Observability & Monitoring
- **OpenTelemetry** - Distributed tracing & metrics
  - `@opentelemetry/sdk-node` v0.207.0
  - `@opentelemetry/api` v1.9.0
  - `@opentelemetry/exporter-prometheus` - Prometheus metrics export
  - `@opentelemetry/exporter-jaeger` - Jaeger distributed tracing
  - `@opentelemetry/auto-instrumentations-node` - Auto instrumentation
- **Pino** v9.0.0 - Structured logging
- **Prometheus** - Metrics collection & visualization (via prom-client v15.1.3)
- **Sentry** v7.120.2 - Error tracking & performance monitoring

#### Push Notifications
- **web-push** v3.6.7 - Web Push Protocol implementation

#### Utilities
- **remeda** v2.32.0 - Functional utility library
- **tsconfig-paths** v4.2.0 - TypeScript path resolution
- **tsc-alias** v1.8.16 - TypeScript path alias resolution

### Frontend Stack

#### Framework & Build
- **Next.js** v14.2.9 - React framework with App Router
- **React** v18.3.1 - UI library
- **React DOM** v18.3.1 - React rendering

#### UI Components & Styling
- **Tailwind CSS** v3.4.13 - Utility-first CSS framework
- **shadcn/ui** - Headless component library (Radix UI based)
  - `@radix-ui/react-dialog` - Modal dialogs
  - `@radix-ui/react-dropdown-menu` - Dropdown menus
  - `@radix-ui/react-select` - Select components
  - `@radix-ui/react-label` - Labels
  - `@radix-ui/react-checkbox` - Checkboxes
- **Lucide React** v0.546.0 - Beautiful icons
- **class-variance-authority** v0.7.1 - Component variant management
- **clsx** v2.1.1 - Conditional className utility
- **tailwind-merge** v3.3.1 - Tailwind class merging

#### Theming & Personalization
- **next-themes** v0.4.6 - Light/dark theme support

#### State Management
- **Zustand** v4.5.2 - Lightweight state management

#### Authentication
- **Auth0** v3.8.0 - OAuth identity provider integration

#### Utilities & Helpers
- **date-fns** v3.6.0 - Date manipulation utilities

#### Drag & Drop
- **react-beautiful-dnd** v13.1.1 - Accessible drag-and-drop

#### Testing
- **Playwright** v1.48.2 - E2E browser automation
- **axe-core** v4.11.0 - Accessibility testing
- **hint** v7.1.13 - Web hint linting (accessibility)

### Code Quality & Development

#### TypeScript
- **TypeScript** v5.5.4 - Typed JavaScript
- **tsconfig-paths** v4.2.0 - Path resolution

#### Linting & Formatting
- **ESLint** v9.38.0 - JavaScript linting
- **@typescript-eslint/parser** v8.46.2 - TypeScript parsing
- **@typescript-eslint/eslint-plugin** v8.46.2 - TypeScript rules
- **Prettier** v3.6.2 - Code formatting
- **eslint-plugin-prettier** v5.5.4 - Prettier integration
- **eslint-config-prettier** v10.1.8 - Prettier config
- **husky** v9.1.7 - Git hooks management

#### Build Tools
- **@nestjs/cli** v10.4.5 - NestJS CLI
- **ts-jest** v29.4.5 - Jest/TypeScript compiler (legacy dependency)
- **ts-node** v10.9.2 - TypeScript execution
- **autoprefixer** v10.4.20 - CSS vendor prefixes
- **postcss** v8.4.47 - CSS transformation

---

## 📊 Key Architectural Decisions

### Data Layer Abstraction
```
├─ DataStore (Interface)
│  ├─ MockDataStore (In-memory, development default)
│  ├─ PrismaDataStore (PostgreSQL)
│  └─ PrismaMultiTenantDataStore (Multi-tenant PostgreSQL)
└─ Configurable via DATA_MODE env var
```

### Testing Strategy
1. **Unit Tests** - Vitest with mocked dependencies (fast)
2. **Integration Tests** - TestAppModule with in-process NestJS (deterministic)
3. **E2E Tests** - Playwright against running API (complete workflows)

### Authentication Flow
```
OAuth Provider (Google/Facebook/Auth0)
    ↓
Passport.js Strategy
    ↓
JWT Token Issuance
    ↓
API Request with Bearer Token
    ↓
AuthGuard Validation
```

### Multi-Tenancy
- All entities scoped by `churchId`
- Automatic tenant isolation at data layer
- Soft delete for audit trails (all entities have `deletedAt`)

### API Documentation
- Auto-generated OpenAPI spec from Swagger decorators
- Type-safe DTOs with class-validator
- Real-time API docs available at `/api-docs`

---

## 🚀 Development Environment

### Commands
```bash
# Install dependencies
pnpm install

# Development servers
pnpm dev:api:mock      # API on port 3001 (with mock data)
pnpm -C web dev        # Web on port 3000

# Build
pnpm build             # Build both packages

# Testing
pnpm -C api test       # API unit/integration tests (Vitest)
pnpm test:e2e:mock    # E2E tests (Playwright)

# Code Quality
pnpm lint              # Check linting issues
pnpm lint:fix          # Auto-fix linting issues
pnpm format            # Format code with Prettier
pnpm format:check      # Check formatting compliance
pnpm pre-commit        # Run all pre-commit checks manually
```

### Environment Modes
```bash
# Development (default - in-memory mock data, no DB)
DATA_MODE=mock pnpm dev:api:mock

# With PostgreSQL
DATA_MODE=prisma pnpm dev:api:prisma

# Testing (mock data, fast, deterministic)
NODE_ENV=test pnpm -C api test
```

### Cross-Platform Development
The project includes guardrails for consistent development across macOS, Windows, and Linux:

- **Line Ending Normalization**: `.gitattributes` ensures consistent LF line endings
- **Pre-commit Hooks**: Husky manages automatic code quality checks before commits
- **CI Pipeline**: Encoding and line ending validation
- **Platform Scripts**: Use `run-e2e.sh` (Unix/macOS) or `run-e2e.ps1` (Windows) for E2E testing

When transferring files between platforms, run `pnpm format` to fix encoding issues.

---

## 📦 Notable Features & Patterns

### Dependency Injection (NestJS)
- `@Injectable()` services with automatic resolution
- Module-based organization with imports/exports
- Repository pattern for data access abstraction
- Provider tokens for multi-implementation support

### Domain-Driven Design
- Domain entities with factory methods
- Value objects (ChurchId, UserId, Email, etc.)
- Immutability with readonly arrays and deep freeze
- CQRS for complex operations (Audit Log)

### Advanced Patterns
- **CQRS** - Command/Query Responsibility Segregation
- **Circuit Breaker** - Resilience for external calls
- **Event Sourcing** - Complete audit trail of all changes
- **Repository Pattern** - Abstract data access layer

### API Security
- JWT token validation on every request
- Role-based access control (RBAC) with permissions
- OAuth2 integration with Google/Facebook
- Active account enforcement

### Observability
- Structured logging with Pino
- Distributed tracing with OpenTelemetry/Jaeger
- Prometheus metrics endpoint
- Sentry error tracking
- Complete audit logging of all entity changes

---

## 🔐 Security Considerations

### Authentication
- OAuth2 / OpenID Connect for identity
- JWT tokens with configurable expiration
- Secure cookie handling in browser
- Active session validation

### Authorization
- Role-based access control (Admin, Leader, Member)
- Granular permissions per role
- Route guards at controller level
- Database-level multi-tenancy enforcement

### Data Protection
- Soft deletes for audit compliance
- Encrypted sensitive data in transit (HTTPS)
- SQL injection prevention via Prisma ORM
- CORS properly configured

---

## 📈 Performance Optimizations

### Backend
- Fastify (3x faster than Express)
- Database query optimization with Prisma
- Connection pooling for PostgreSQL
- In-memory mock data for development speed
- Lazy loading of modules

### Frontend
- Next.js server-side rendering (SSR)
- Incremental Static Regeneration (ISR)
- Code splitting with dynamic imports
- Image optimization built-in
- Zustand for lightweight state management

### Testing
- Vitest for ultra-fast unit tests (~13s for 284 tests)
- Parallel test execution
- Coverage reporting with v8

---

## 🛠️ Deployment Ready

### CI/CD Integration
- GitHub Actions workflows
- Automated linting & formatting checks
- Unit & integration test execution
- E2E test suite for critical paths
- Coverage reporting

### Production Deployment
- Docker containerization ready
- Environment variable configuration
- Health check endpoints
- Graceful shutdown handling
- Database migration support

### Monitoring & Observability
- OpenTelemetry metrics export
- Prometheus scrape endpoint
- Sentry error tracking
- Structured logging for log aggregation
- Audit trail for compliance

---

## 📚 Documentation

### Source of Truth
Located in `docs/source-of-truth/`:
- `API_DOCUMENTATION.md` - Complete API reference
- `API_REFERENCE.md` - OpenAPI spec details
- `ARCHITECTURE.md` - System design
- `BUSINESS_REQUIREMENTS.md` - Feature requirements
- `DATABASE_SCHEMA.md` - Entity relationships
- `FUNCTIONAL_REQUIREMENTS.md` - User features
- `personas/` - User personas and journeys

### Developer Resources
- `SETUP.md` - Local development setup
- `CODING_STANDARDS.md` - Code quality guidelines
- `USER_MANUAL.md` - End-user documentation
- `NAVIGATION.md` - Feature routes and flows

---

## 🎯 Technology Highlights

### Why These Choices?

**NestJS + Fastify**
- Enterprise-grade framework with TypeScript
- Dependency injection for testability
- Fastify for performance
- Rich ecosystem of modules

**Vitest**
- 10x faster than Jest
- ESM native (modern JavaScript)
- Same API as Jest for easy migration
- Vite integration for dev/build consistency

**Next.js**
- File-based routing (App Router)
- Server and client components
- Built-in API routes
- Automatic code splitting
- Framework unifying frontend & backend

**Prisma**
- Type-safe database access
- Auto-generated migrations
- Visual schema explorer
- Developer experience focused

**OpenTelemetry**
- Vendor-neutral observability
- Distributed tracing across services
- Metrics collection (Prometheus)
- Flexible exporters (Jaeger, DataDog, etc.)

---

## 📋 Version Pinning Strategy

- **Minor versions pinned** for stability (`^` in package.json)
- **Regular dependency updates** for security patches
- **Testing on major upgrades** before applying
- **Backward compatibility maintained** across versions

---

This tech stack provides a **production-ready, scalable, and maintainable** foundation for a comprehensive church management system with enterprise-grade observability, testing, and security.
