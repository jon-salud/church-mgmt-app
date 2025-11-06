# Architecture Design Document

## 1. Overview

This document outlines the high-level architecture for the Church Management SaaS Platform. The
primary goal of this architecture is to create a secure, scalable, and maintainable system that can
serve multiple church clients effectively.

The architecture is designed around the principle of **Separation of Concerns**, which isolates
different parts of the system to reduce complexity and improve security. This is achieved by cleanly
separating the user-facing applications from the backend services and by providing distinct
applications for different user personas (church clients vs. system administrators).

The key principles guiding this architecture are:

- **Security:** Creating strong boundaries between applications and implementing robust access
  control at the API level.
- **Scalability:** Ensuring the system can grow to support many church clients with increasing data
  and traffic.
- **Maintainability:** Making the system easy to understand, modify, and deploy, allowing for
  independent updates to different components.

## 2. Frontend Architecture

The system will feature two distinct frontend applications to serve its two primary user bases: the
church clients and the system owner.

### 2.1. Client Application (`web`)

- **Purpose:** This is the core application that will be used by church members, leaders, and
  administrators for their day-to-day ministry and church management tasks.
- **Users:** Church Admins, Leaders, Members.
- **Scope:** Contains all features related to member management, groups, events, giving, pastoral
  care, etc.
- **Authentication:** Uses Next.js middleware to enforce route-level protection. All application
  routes require authentication, with unauthenticated users automatically redirected to the login
  page. Session management is handled via HTTP-only cookies for security.

### 2.2. System Administration Application (`admin`)

- **Purpose:** This is a separate, secure application for the SaaS product owner to manage church
  client accounts, monitor platform health, and access system-level analytics.
- **Users:** System Owner / Super Admin.
- **Scope:** Contains features for observability, client resource management, billing/subscription
  management, and platform-wide notifications.

### 2.3. UI/Design System Architecture

The frontend applications implement a comprehensive design system built on modern web standards with accessibility and consistency as core principles.

#### 2.3.1. Technology Stack

- **Styling Framework:** Tailwind CSS 3.4+ - Utility-first CSS framework providing the foundation for all styling
- **Component Library:** Flowbite React 0.12.10 - React component library with 20+ wrapper components in `web/components/ui-flowbite/`
- **Design Token System:** CSS custom properties in HSL color space defined in `web/app/globals.css` (50+ tokens)
- **Icon Library:** Lucide React 0.546.0 - Consistent iconography across the application
- **Utility Libraries:** clsx, tailwind-merge, class-variance-authority for dynamic styling and component variants

#### 2.3.2. Design Token System

The design system uses CSS custom properties (CSS variables) for all design tokens, enabling theme consistency and dark mode support:

- **Color Tokens:** Semantic color system with HSL values
  - Background/foreground pairs: `--background`, `--foreground`, `--card`, `--card-foreground`
  - Semantic colors: `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`
  - Interactive states: `--ring` (focus), `--border`, `--input`
  - Popover/modal: `--popover`, `--popover-foreground`
- **Shadow Scale:** Tailwind's built-in shadow utilities (`shadow-sm` through `shadow-2xl`)
- **Border Radius:** Five-level scale from `--radius-sm` (0.125rem) to `--radius-full` (9999px)
- **Typography Scale:** Eleven utility classes from `.heading-display` (72px) to `.caption-text-xs` (10px)
- **Spacing:** Tailwind's default spacing scale (0.25rem base unit)

**Dark Mode Implementation:**
- System preference detection with manual toggle override
- HSL color space enables precise lightness adjustments between themes
- Background/card contrast: 8% lightness difference for visual hierarchy
- All color tokens have light and dark mode variants

#### 2.3.3. Component Library Architecture

All UI components are located in `web/components/ui-flowbite/` and follow a wrapper pattern:

**Wrapper Pattern Benefits:**
- Maintains consistent API across component library migrations
- Encapsulates Flowbite-specific implementation details
- Enables gradual component enhancements without breaking changes
- Provides type-safe React component interfaces

**Core Components:**
- **Button:** 5 variants (default, outline, secondary, ghost, destructive) mapped to Flowbite color system
- **Card:** Elevation system using Tailwind shadows (sm: resting, md: default, lg: hover, xl: modal)
- **Input/Textarea:** Error state support, focus indicators, consistent styling
- **Form Components:** Select, Checkbox, Label with WCAG-compliant markup
- **Overlay Components:** Dialog, Modal, Dropdown with focus trap and keyboard navigation
- **Data Display:** Table, Progress, Alert with responsive design
- **Layout:** PageHeader for consistent page structure

**Component Design Principles:**
- Design tokens over hardcoded values
- Backward compatibility maintained through wrapper API
- TypeScript strict mode for type safety
- Composition patterns for flexibility
- Progressive enhancement for advanced features

#### 2.3.4. Accessibility Architecture

WCAG 2.1 AA compliance is achieved through systematic implementation:

**Focus Management:**
- Universal focus-visible styling: 2px solid ring with 2px offset
- Custom ring color via `--ring` CSS variable
- Focus trap in modals and overlays
- Skip links for keyboard navigation

**Color Contrast:**
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text (18pt+)
- Verified against both light and dark mode backgrounds
- Design token system ensures compliant color pairings

**Motion Preferences:**
- `prefers-reduced-motion` media query support
- Disables animations and transitions for users who prefer reduced motion
- Fallback to instant state changes

**Semantic HTML:**
- Proper heading hierarchy (h1 → h6)
- ARIA labels on icon-only buttons
- ARIA live regions for dynamic content
- Landmark regions for screen reader navigation

**Keyboard Navigation:**
- Full keyboard access to all interactive elements
- Logical tab order across forms and pages
- Escape key support for closing modals/dropdowns
- Enter/Space activation for custom controls

#### 2.3.5. Design System Documentation

Comprehensive documentation ensures developer adoption and consistency:

- **DESIGN_SYSTEM.md:** Authoritative design system reference (800+ lines)
  - Complete token reference with code examples
  - Component usage guidelines and variants
  - Accessibility requirements and patterns
  - Migration guide for adopting design system
- **CODING_STANDARDS.md Section 5.6:** Practical implementation guidelines (276 lines)
  - Design token usage rules
  - Component variant selection guide
  - Layout patterns and code examples
  - Testing checklists for UI changes
  - Common mistakes and best practices

#### 2.3.6. Design System Maturity

Current maturity level: **Level 3** (Documented Design System)
- ✅ Consistent component library with defined patterns
- ✅ Comprehensive documentation for developers
- ✅ Design token system with semantic naming
- ✅ Accessibility compliance verified
- ⏳ Future Level 4: Automated token generation, Storybook, visual regression testing

**References:**
- Design System Documentation: `docs/DESIGN_SYSTEM.md`
- Coding Standards: `docs/CODING_STANDARDS.md` (Section 5.6)
- Component Library: `web/components/ui-flowbite/`
- Design Tokens: `web/app/globals.css`
- Tailwind Configuration: `web/tailwind.config.ts`
- Flowbite Migration: `docs/FLOWBITE_MIGRATION.md`

### 2.4. Justification for Separation

This dual-application approach was chosen for several key reasons:

- **Enhanced Security:** It creates a strong security boundary. The code and logic for system-level
  administration do not exist in the client-facing application, drastically reducing the attack
  surface.
- **Separation of Concerns:** It keeps the client application focused and optimized for its users,
  while the admin application is tailored specifically to the operational needs of the product
  owner.
- **Independent Deployment:** The two applications can be developed, tested, and deployed
  independently. This allows for rapid iteration on administrative features without any risk of
  impacting the stability of the client application.

## 3. Backend Architecture

The system will be powered by a single, unified backend API. This API-first approach ensures that
all business logic is centralized, consistent, and can be consumed by any number of frontend
applications.

## 3. Backend Architecture

The system will be powered by a single, unified backend API. This API-first approach ensures that
all business logic is centralized, consistent, and can be consumed by any number of frontend
applications.

- **Unified API:** A single NestJS application will serve as the backend for both the `web` and
  `admin` frontends. This reduces code duplication and ensures all data modifications go through the
  same business logic and validation rules.
- **Multi-tenant Architecture:** The system implements physical data segregation with separate PostgreSQL databases per tenant for maximum security and GDPR compliance. A system metadata database manages tenant lifecycle, settings, and cross-tenant analytics.
- **Robust Authorization:** The API will be responsible for enforcing all access control. It will
  use a role-based access control (RBAC) system that can distinguish between different user roles
  with granular permissions and data scoping.
  - **Church-Level Roles (Admin, Leader, Member):** These users will have their access strictly
    scoped to their own church client's data.
  - **Specialized Church Roles (Trustee, Coordinator):** These roles provide elevated access to
    specific functional areas (governance, volunteer management) while maintaining church data
    isolation.
  - **Ministry-Scoped Roles:** Leaders can be assigned to specific ministry areas with filtered
    access to relevant member data and care requests.
  - **System-Level Roles (Super Admin):** This role will have access to platform-wide data and
    administrative endpoints that are inaccessible to all other roles.
- **Data Scoping:** Beyond basic church-level isolation, the system implements ministry-specific
  and functional-area scoping to ensure users only access data relevant to their responsibilities.
  This includes time-bound access for governance functions and privacy-preserving data filtering.
- **Database Architecture:** 
  - **System Metadata Database:** PostgreSQL database containing tenant management, settings, usage metrics, and system audit logs
  - **Tenant Databases:** Separate PostgreSQL databases per tenant, ensuring complete data isolation and GDPR compliance
  - **Connection Management:** Tenant-aware Prisma clients with connection pooling and automatic database routing

## 4. Architectural Diagram

The following diagram illustrates the high-level structure of the system with persona-specific functional areas:

```txt
+---------------------------+        +---------------------------------+
|   End User (Web Browser)  |        |  System Owner (Web Browser)     |
+-------------+-------------+        +----------------+----------------+
              |                                        |
              v                                        v
+---------------------------+        +---------------------------------+
|      CLIENT APP (web)     |        |      SYSTEM ADMIN APP (admin)   |
| (Next.js / React)         |        | (Next.js / React)               |
|                           |        |                                 |
| Features:                 |        | Features:                       |
| • Member Portal           |        | • Platform Monitoring          |
| • Governance Portal       |        | • Tenant Management            |
| • Volunteer Coordination  |        | • Billing Integration          |
| • Ministry Dashboards     |        | • Global Audit Trail           |
| • Event Registration      |        |                                 |
| • Notification Center     |        +----------------+----------------+
+---------------------------+        +---------------------------------+
              |                                        |
              +---------------------+------------------+
                                    |
                                    v
+----------------------------------------------------------------------+
|                                                                      |
|                        UNIFIED BACKEND API (api)                       |
|         (NestJS, Role-Based Access Control & Authorization)          |
|                                                                      |
| Modules:                                                            |
| • Core (Users, Groups, Events)                                      |
| • Governance (Documents, Approvals, Compliance)                     |
| • Volunteer Mgmt (Scheduling, Availability, Reminders)              |
| • Ministry Care (Scoped Dashboards, Tasks, Notes)                   |
| • Member Experience (Notifications, Recommendations)                |
| • Visitor Funnel (Registration, Nurture, Conversion)                |
|                                                                      |
+------------------------------------+---------------------------------+
                                     |
                                     v
+----------------------------------------------------------------------+
|                                                                      |
|                     PostgreSQL DATABASES (Multi-tenant)             |
|          (Physical segregation: System DB + Per-tenant DBs)          |
|                                                                      |
| System Metadata Database:                                           |
| • Tenant Management (Tenant, TenantSettings, TenantUsage)           |
| • System Users & Audit Logs (SystemUser, SystemAuditLog)            |
| • Cross-tenant Analytics & Billing Data                             |
|                                                                      |
| Tenant Databases (1 per church):                                    |
| • Core Entities (Users, Profiles, Groups, Events)                   |
| • Governance (Documents, Approvals, Acknowledgments)                |
| • Volunteer (Availability, Templates, Assignments)                  |
| • Ministry (Scopes, Tasks, Pastoral Notes, Alerts)                  |
| • Member (Notifications, Recommendations, Opportunities)            |
| • Visitor (Profiles, Interactions, Nurture Workflows)               |
+----------------------------------------------------------------------+
```

## 5. Data Layer Architecture

The system implements a flexible data layer abstraction that supports multiple storage backends for different environments and use cases.

### 5.1. DataStore Interface

- **Purpose:** Provides a unified interface for all data operations across the application, ensuring consistent API regardless of the underlying storage mechanism.
- **Implementation:** The `DataStore` interface wraps all `MockDatabaseService` methods with Promise-based async operations, enabling seamless switching between storage backends.
- **Benefits:** Allows for easy testing, development, and future migration to different database systems without changing business logic.

### 5.2. Storage Backends

The system supports multiple data store implementations controlled by the `DATA_MODE` environment variable:

- **Mock Mode (`DATA_MODE=mock`):** Default development mode using in-memory data structures pre-populated with canonical seeded test data (see `mock-data.ts`). This mode is ideal for local development and manual testing, as it provides a predictable, repeatable dataset and supports features like soft delete and audit logging. Data is reset to the seed state on each server restart.
- **Memory Mode (`DATA_MODE=memory`):** High-performance, empty in-memory implementation intended for automated CI/CD testing and scenarios requiring fast, isolated data operations without persistence or seeded data. Unlike Mock Mode, Memory Mode starts with no preloaded data, ensuring a clean slate for each test run. Data is ephemeral and lost on server restart.
- **Prisma Mode (`DATA_MODE=prisma`):** Production-ready PostgreSQL database integration using Prisma ORM for persistent data storage and complex queries.

### 5.3. Repository Pattern

The system implements repository abstractions for domain-specific data access:

- **Purpose:** Decouples business logic from data access patterns, enabling easier testing and future database migrations.
- **Implementation:** Each domain (Users, Documents, Groups) has dedicated repository interfaces with dependency injection tokens.
- **Benefits:** Provides clean separation of concerns, improved testability, and flexible data access strategies.

-### 5.4. Data Isolation & Multi-tenancy

- **Physical Data Segregation:** Each tenant (church) has its own dedicated PostgreSQL database, ensuring complete isolation and GDPR compliance.
- **System Metadata Database:** Central database for tenant management, settings, usage tracking, and cross-tenant operations.
- **Tenant-Aware Data Access:** Prisma services automatically route database operations to the correct tenant database based on request context.
- **Connection Pooling:** Efficient connection management with pgBouncer for optimal performance across multiple tenant databases.
- **Soft Delete:** All entities support soft delete functionality with `deletedAt` timestamps for audit trails and data recovery.
- **Audit Logging:** All data modifications are logged to maintain compliance and operational visibility.
