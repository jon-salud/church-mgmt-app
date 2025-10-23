# Functional Requirements Document: Church Management Application

## 1. Introduction

This document provides a detailed breakdown of the functional requirements for the Church Management Application. It expands upon the high-level business needs outlined in the Business Requirements Document (BRD) and defines the specific behaviors, user interactions, and system rules required for implementation.

This document is intended to serve as a comprehensive guide for the development, testing, and quality assurance teams to ensure the final product aligns with the business objectives. Each section corresponds to a core feature and details the specific functionality from the perspective of the different user roles.

---

## Part A: Client Application (`web`)

This part of the document details the functional requirements for the main, client-facing application used by churches.

---

## A.1. Member Directory and Household Management

### A.1.1. View Member List (Admin)
*   **FR-MEM-001:** The system shall display a paginated list of all members.
*   **FR-MEM-002:** Each row shall display the member's First Name, Last Name, and Email.
*   **FR-MEM-003:** The list must be sortable by First Name, Last Name, and Email.
*   **FR-MEM-004:** A search bar shall be provided to filter the list by name or email.

### A.1.2. Create New Member (Admin)
*   **FR-MEM-005:** The system shall provide a form to create a new member with fields for `firstName` (Required), `lastName` (Required), `email` (Required, Unique), and optional fields for `phone`, `address`, `birthday`, and `notes`.
*   **FR-MEM-006:** Upon successful creation, the system shall redirect to the new member's detail page.

### A.1.3. Edit Member Profile
*   **FR-MEM-007 (Admin):** Admins can edit all fields on any member's profile.
*   **FR-MEM-008 (Member):** Members can edit their own `phone` and `address`.
*   **FR-MEM-009:** All profile changes must be recorded in the audit log.

## A.2. Giving and Contribution Tracking

### A.2.1. Manage Funds (Admin)
*   **FR-GIV-001:** Admins can create, view, edit, and archive contribution funds.
*   **FR-GIV-002:** Archived funds shall not be available for new contributions.

### A.2.2. Record a Contribution (Admin)
*   **FR-GIV-003:** The system shall provide a form to record a contribution with fields for `memberId`, `date`, `amount` (Required, Positive), `method`, `fundId`, and `note`.
*   **FR-GIV-004:** The creation of a contribution must be recorded in the audit log.

### A.2.3. View Giving History
*   **FR-GIV-005 (Admin):** Admins can view a report of all contributions, filterable by date, member, and fund, and export it to CSV.
*   **FR-GIV-006 (Member):** Members can view a list of their own past contributions.

## A.3. Groups and Ministries

### A.3.1. Create and Manage Groups (Admin)
*   **FR-GRP-001:** Admins can create and edit groups with fields for `name` (Required), `description`, `type`, `meetingDay`, and `meetingTime`.
*   **FR-GRP-002:** The group `type` must be selected from a predefined list (GeographicalMinistry, ServiceMinistry, etc.).

### A.3.2. Manage Group Membership (Admin/Leader)
*   **FR-GRP-003:** Admins and Leaders can add or remove members from groups they manage.

## A.4. Events and Attendance

### A.4.1. Create and Manage Events (Admin/Leader)
*   **FR-EVT-001:** Admins and Leaders can create and edit events with fields for `title` (Required), `description`, `startAt` (Required), `endAt` (Required), `location`, and an optional `groupId`.

### A.4.2. Record Attendance (Admin/Leader)
*   **FR-EVT-002:** For each event, an interface shall be provided to mark attendance status ('Checked In', 'Absent', 'Excused') for each member.

## A.5. Announcements and Communication

### A.5.1. Create and Manage Announcements (Admin)
*   **FR-ANN-001:** Admins can create, edit, and delete announcements with fields for `title`, `body`, `audience` ('All Members' or 'Selected Groups'), `publishAt`, and `expireAt`.

### A.5.2. View Announcements (Member)
*   **FR-ANN-002:** The system shall display a feed of active announcements relevant to the member.
*   **FR-ANN-003:** Members can mark announcements as "read."

## A.6. Pastoral Care and Prayer Requests

### A.6.1. Public Prayer Wall
*   **FR-PRAY-001:** Any user can submit a prayer request, which enters a `PENDING_APPROVAL` state.
*   **FR-PRAY-002 (Admin):** Admins can `APPROVE` or `DENY` requests from a moderation queue.
*   **FR-PRAY-003:** The public wall only displays `APPROVED` requests.

### A.6.2. Confidential Pastoral Care Tickets
*   **FR-PST-001 (Member):** Members can submit confidential tickets with a `title`, `description`, and `priority`.
*   **FR-PST-002 (Admin):** Admins can view, assign, and add private comments to tickets.

## A.7. Child Check-In and Safety

### A.7.1. Manage Child Information (Parent/Guardian)
*   **FR-CHK-001:** Parents/Guardians can manage their children's information, including `fullName`, `dateOfBirth`, `allergies`, and `medicalNotes`.

### A.7.2. Check-In/Check-Out Process
*   **FR-CHK-002 (Parent/Staff):** A child can be checked into an event. Parent self-check-ins require staff confirmation.
*   **FR-CHK-003 (Staff):** Staff can view a dashboard of all checked-in children and can check them out, triggering a notification to the parent.

## A.8. Leadership Dashboard and Reporting

### A.8.1. Visualizations
*   **FR-DSH-001:** The dashboard shall display a **Line Chart** for "Total Members Over Time".
*   **FR-DSH-002:** The dashboard shall display a **Bar Chart** for "Average Weekly Attendance".
*   **FR-DSH-003:** The dashboard shall display a **Donut Chart** for "Group Membership Breakdown".
*   **FR-DSH-004:** The dashboard shall display a **Combined Bar and Line Chart** for "Monthly Giving vs. Budget".
*   **FR-DSH-005:** The dashboard shall display a **Horizontal Bar Chart** for "Member Age Distribution".

## A.9. Data Privacy and Compliance (GDPR)

### A.9.1. Data Export and Deletion
*   **FR-CMP-001 (Admin):** Admins shall have a mechanism to export all data for a specific member in a machine-readable format.
*   **FR-CMP-002 (Admin):** Admins shall have a mechanism to anonymize a member's PII, disassociating their identity from historical records (giving, attendance, etc.), which are retained for statistical purposes.

---

## Part B: System Administration Application (`admin`)

This part of the document details the functional requirements for the separate, secure application used by the SaaS Product Owner (System Owner).

---

## B.1. System Owner Dashboard (Observability)

This dashboard provides the System Owner with visibility into the health and resource consumption of the entire platform.

### B.1.1. Church Client Metrics Table
*   **FR-SADM-001:** The dashboard shall display a **Table View** titled "Church Client Metrics".
*   **FR-SADM-002:** The table must be sortable by any column.
*   **FR-SADM-003:** The table shall contain a row for each church client with the following columns:
    *   `Church Name`
    *   `Member Count`
    *   `Data Storage (MB/GB)`
    *   `Active Users (Last 30 Days)`
    *   `API Calls (Last 30 Days)`
    *   `Status` (e.g., Active, Trial)

### B.1.2. Platform-Wide Usage Trends Graph
*   **FR-SADM-004:** The dashboard shall display a **Stacked Area Chart** titled "Total API Calls by Client".
*   **FR-SADM-005:** The x-axis shall represent time (e.g., last 30 days).
*   **FR-SADM-006:** The y-axis shall represent the total number of API calls.
*   **FR-SADM-007:** Each church client's API call volume shall be represented as a colored layer in the stack.

### B.1.3. Feature Adoption Graph
*   **FR-SADM-008:** The dashboard shall display a **Bar Chart** titled "Feature Usage by Module".
*   **FR-SADM-009:** The x-axis shall list the core application modules (Giving, Events, Groups, etc.).
*   **FR-SADM-010:** The y-axis shall represent a count of key actions within that module (e.g., number of events created).

### B.1.4. System Health & Performance Panel
*   **FR-SADM-011:** The dashboard shall display a **Line Chart** for "Overall API Error Rate (%)".
*   **FR-SADM-012:** The dashboard shall display a **Line Chart** for "Average API Response Time (ms)".
