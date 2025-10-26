# Product Requirements Document (PRD)

## 1. Introduction

### 1.1. Document Purpose

This document provides a high-level overview of the Church Management System, a modern, cloud-based
Software-as-a-Service (SaaS) platform. It is intended to serve as a central summary, linking to more
detailed documents for specific requirements, technical architecture, and user guidance.

For a complete understanding of the project, this document should be read in conjunction with the
detailed documentation suite.

### 1.2. Project Vision

The project's vision is to equip churches with a secure, modern, and intuitive system to manage
their community, streamline administrative tasks, and foster member engagement.

## 2. Business Context

### 2.1. Business Goals

The primary business goals for this platform are:

- **Improve Administrative Efficiency:** Automate and simplify common administrative tasks.
- **Enhance Member Engagement:** Provide tools for members to connect with the church community.
- **Provide Actionable Insights:** Offer leadership clear data to understand community trends.
- **Ensure Scalability and Security:** Build a robust, multi-client platform with high standards for
  data privacy.

> For a detailed breakdown of the business case, project scope, and user personas, please refer to
> the **[Business Requirements Document (BRD)](./source-of-truth/BUSINESS_REQUIREMENTS.md)**.

## 3. Core Features (Initial Release)

The initial release of the platform will focus on the following core functionalities:

- **Multi-Client Architecture:** The system is architected to serve multiple church clients with
  complete data isolation.
- **Member & Household Management:** A central directory of all church members, organized by
  households.
- **Prayer Request System:** A moderated module for members to submit and view prayer requests.
- **General Request Management:** A flexible system for managing various internal requests from
  members to church staff.
- **Event & Service Check-in:** A system for tracking attendance at services and events.
- **Child Check-in and Safety:** A comprehensive child check-in system with household management and safety features.
- **Soft Delete Functionality:** Archive members, events, and roles instead of permanent deletion to maintain data integrity and audit trails.
- **Onboarding Wizard:** A guided setup process for new Church Administrators.
- **Document Library:** A secure, role-based repository for file sharing.
- **Small Group Resource Sharing:** Functionality for small groups to share resources via web links.
- **Theming:** The user interface supports both light and dark themes.

> For a complete list of features and their detailed functional requirements, please see the
> **[Functional Requirements Document (FRD)](./source-of-truth/FUNCTIONAL_REQUIREMENTS.md)**. To understand how
> these features are used from an end-user perspective, refer to the
> **[User Manual](./USER_MANUAL.md)**.

## 4. Technical Overview

### 4.1. Architecture

The platform is built with a modern, decoupled architecture, consisting of two Next.js frontend
applications (a client-facing app and a system admin app) that both communicate with a single,
unified NestJS backend API. The database is PostgreSQL, with a multi-client data strategy enforced
by a `churchId` on all relevant tables.

> For a detailed explanation of the system's structure and a component diagram, please consult the
> **[Architecture Document](./source-of-truth/ARCHITECTURE.md)**.

### 4.2. Technology Stack

- **Backend:** NestJS (TypeScript)
- **Frontend:** Next.js (React, TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS with shadcn/ui
- **Testing:** Jest (backend), Playwright (end-to-end)

### 4.3. Data Model

The database schema is designed to support the core features with a relational structure that
ensures data integrity and supports multi-tenancy.

> For a comprehensive view of all tables, columns, and relationships, please refer to the
> **[Database Schema Document](./source-of-truth/DATABASE_SCHEMA.md)**.

### 4.4. API

The system exposes a versioned RESTful API for all frontend communication.

> For detailed information on all available endpoints, request/response schemas, and usage, see the
> **[API Documentation](./source-of-truth/API_DOCUMENTATION.md)**.

### 4.5. Coding Standards

The project adheres to a strict set of coding standards to ensure the codebase is clean, consistent,
and maintainable.

> For guidelines on code style, architecture patterns, and Git conventions, please review the
> **[Coding Standards Document](./CODING_STANDARDS.md)**.

## 5. Roadmap (Post-Initial Release)

The following features are planned for future releases and are not part of the core product
described in this document:

- Advanced Content Management System (CMS)
- Integrated File Hosting (e.g., Google Drive)
- Volunteer Management and Scheduling
- Advanced Child Check-in Security Features (biometric identification, security tags)
- Financial & Giving Management

> This roadmap is managed and tracked in the **[Tasks Document](./TASKS.md)**.
