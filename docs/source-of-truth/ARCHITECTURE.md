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
  use a role-based access control (RBAC) system that can distinguish between different user roles.
  - **Church-Level Roles (Admin, Leader, Member):** These users will have their access strictly
    scoped to their own church client's data.
  - **System-Level Roles (Super Admin):** This role will have access to platform-wide data and
    administrative endpoints that are inaccessible to all other roles.
- **Database:** A single PostgreSQL database will be used, with every table containing a `churchId`
  column to ensure strict data-tenancy and isolation between church clients.

## 4. Architectural Diagram

The following diagram illustrates the high-level structure of the system:

```txt
+---------------------------+        +---------------------------------+
|   End User (Web Browser)  |        |  System Owner (Web Browser)     |
+-------------+-------------+        +----------------+----------------+
              |                                        |
              v                                        v
+---------------------------+        +---------------------------------+
|      CLIENT APP (web)     |        |      SYSTEM ADMIN APP (admin)   |
| (Next.js / React)         |        | (Next.js / React)               |
+-------------+-------------+        +----------------+----------------+
              |                                        |
              +---------------------+------------------+
                                    |
                                    v
+----------------------------------------------------------------------+
|                                                                      |
|                        UNIFIED BACKEND API (api)                       |
|         (NestJS, Role-Based Access Control & Authorization)          |
|                                                                      |
+------------------------------------+---------------------------------+
                                     |
                                     v
+----------------------------------------------------------------------+
|                                                                      |
|                     PostgreSQL DATABASE (Single DB)                  |
|          (Strict data tenancy enforced via `churchId` column)        |
|                                                                      |
+----------------------------------------------------------------------+
```
