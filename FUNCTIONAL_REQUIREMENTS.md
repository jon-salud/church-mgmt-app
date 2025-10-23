# Functional Requirements Document: Church Management Application

## 1. Introduction
This document details the functional requirements for the Church Management Application, expanding on the BRD to define specific behaviors and system rules.

---

## Part A: Client Application (`web`)

This part details requirements for the main, client-facing application.

---

## A.1. Member Directory and Household Management

### A.1.1. View Member List (Admin)
*   **FR-MEM-001:** The system shall display a paginated list of all members.
*   **FR-MEM-002:** The list must be sortable and searchable by name and email.

### A.1.2. Create and Edit Member Profile
*   **FR-MEM-003 (Admin):** Admins can create and edit member profiles with fields for `firstName`, `lastName`, `email`, etc. Custom profile fields defined in the settings shall also appear here.
*   **FR-MEM-004 (Member):** Members can edit a subset of their own profile fields.
*   **FR-MEM-005:** All profile changes must be audited.

## A.2. Groups and Ministries

### A.2.1. Create and Manage Groups (Admin)
*   **FR-GRP-001:** Admins can create and edit groups.
*   **FR-GRP-002:** The `type` of the group must be selected from a list of customizable group types managed in the settings.

### A.2.2. Manage Group Membership (Admin/Leader)
*   **FR-GRP-003:** Admins and Leaders can add or remove members from groups they manage.

## A.3. Events and Attendance

### A.3.1. Create and Manage Events (Admin/Leader)
*   **FR-EVT-001:** Admins and Leaders can create and edit events.

### A.3.2. Record Attendance (Admin/Leader)
*   **FR-EVT-002:** The attendance interface shall allow marking status for each member. For child check-in events, a list of configurable check-in locations must be available.

## A.4. Giving and Contribution Tracking

### A.4.1. Manage Funds (Admin)
*   **FR-GIV-001:** Admins can create, view, edit, and archive customizable contribution funds.

### A.4.2. Record a Contribution (Admin)
*   **FR-GIV-002:** The contribution form shall allow selection of a member, amount, date, and a fund from the list of active, customizable funds.

## A.5. Pastoral Care, Prayer, and Requests

### A.5.1. Unified Request Form (Member)
*   **FR-REQ-001:** The request form shall include a dropdown of customizable request types managed in the settings.

## A.6. Application Configuration (Admin)

This section details the requirements for the settings area where Admins configure the application.

### A.6.1. Manage Custom Member Profile Fields
*   **FR-CNF-001:** The system shall provide an interface for Admins to create, view, edit, and delete custom profile fields.
*   **FR-CNF-002:** Each custom field must have a `name` (e.g., "Baptism Date") and a `type` (Text, Date, Boolean).

### A.6.2. Manage Custom Group Types
*   **FR-CNF-003:** The system shall provide an interface for Admins to create, view, edit, and delete group types.
*   **FR-CNF-004:** A group type cannot be deleted if it is currently in use by any group.

### A.6.3. Manage Giving Funds
*   **FR-CNF-005:** This is an alias for the requirements in `A.2.1`.

### A.6.4. Manage Custom Request Types
*   **FR-CNF-006:** The system shall provide an interface for Admins to create, view, edit, and enable/disable request types.
*   **FR-CNF-007:** A request type cannot be deleted if it is currently in use by any request.

### A.6.5. Manage Child Check-In Locations
*   **FR-CNF-008:** The system shall provide an interface for Admins to create, view, edit, and delete check-in locations.

## A.7. Other Features
*   Requirements for Announcements, Child Check-In, Dashboards, and GDPR compliance are as previously defined.

---

## Part B: System Administration Application (`admin`)

This part details requirements for the separate application used by the SaaS Product Owner.

---

## B.1. System Owner Dashboard (Observability)

### B.1.1. Key Visualizations
*   **FR-SADM-001:** The dashboard shall display a **Table View** of `Church Client Metrics` (Member Count, Data Storage, etc.).
*   **FR-SADM-002:** The dashboard shall display a **Stacked Area Chart** of `Total API Calls by Client`.
*   **FR-SADM-003:** The dashboard shall display a **Bar Chart** of `Feature Usage by Module`.
*   **FR-SADM-004:** The dashboard shall display **Line Charts** for `Overall API Error Rate` and `Average API Response Time`.
