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

### 2.3. Justification for Separation

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

- **Unified API:** A single NestJS application will serve as the backend for both the `web` and
  `admin` frontends. This reduces code duplication and ensures all data modifications go through the
  same business logic and validation rules.
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
- **Database:** A single PostgreSQL database will be used, with every table containing a `churchId`
  column to ensure strict data-tenancy and isolation between church clients.

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
|                     PostgreSQL DATABASE (Single DB)                  |
|          (Strict data tenancy enforced via `churchId` column)        |
|                                                                      |
| Schema Areas:                                                       |
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

### 5.4. Data Isolation & Multi-tenancy

- **Church-Level Scoping:** All data operations are scoped by `churchId` to ensure complete isolation between church clients.
- **Soft Delete:** All entities support soft delete functionality with `deletedAt` timestamps for audit trails and data recovery.
- **Audit Logging:** All data modifications are logged to maintain compliance and operational visibility.
