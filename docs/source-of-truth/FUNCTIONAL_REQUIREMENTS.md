# Functional Requirements Document: Church Management Application

## 1. Introduction

This document details the functional requirements for the Church Management Application.

---

## Part A: Client Application (`web`)

---

## A.1. Onboarding Wizard

This feature guides a new Church Administrator through the initial setup of their account. It is
triggered on the first login for a new church client and appears as a modal dialog overlaying the
main dashboard.

### A.1.1. Modal Presentation

- **FR-ONB-001:** The wizard shall appear as a modal dialog immediately after login for administrators where `onboardingComplete` is `false`.
- **FR-ONB-002:** The modal shall have consistent sizing (max-width: 4xl, max-height: 90vh) with internal scrolling for content that exceeds the viewport.
- **FR-ONB-003:** The modal shall include a progress indicator showing completion status across all steps.
- **FR-ONB-004:** The modal shall be dismissible only by completing the wizard or explicitly skipping all steps.

### A.1.2. Wizard Flow

- **FR-ONB-005:** The wizard shall consist of a series of skippable steps.
- **FR-ONB-006:** A "Skip for now" link shall be present on every step.
- **FR-ONB-007:** A setup guide or checklist shall be available on the main dashboard for admins to
  return to incomplete steps.

### A.1.3. Step 1: Welcome & Branding

- **FR-ONB-008:** The screen shall display a welcome message.
- **FR-ONB-009:** The admin shall be able to upload a church logo (e.g., JPG, PNG).
- **FR-ONB-010:** The admin shall be able to select a primary brand color.
- **FR-ONB-011:** A "Get Started" button shall advance to the next step after saving branding settings.

### A.1.4. Step 2: Define Roles

- **FR-ONB-012:** The system shall display the default roles (`Admin`, `Leader`, `Member`).
- **FR-ONB-013:** The admin shall have an interface to create new, custom roles.

### A.1.5. Step 3: Invite Core Team

- **FR-ONB-014:** The system shall provide a form to add team members with fields for `Name`,
  `Email`, and `Role` (using the roles from Step 2).
- **FR-ONB-015:** Upon completion of the wizard, the system shall send an email invitation to each
  person added in this step.

### A.1.6. Step 4: Import Member Emails

- **FR-ONB-016:** The system shall provide two methods for bulk-adding members: a text box for
  pasting emails and a CSV file upload.
- **FR-ONB-017:** Upon completion of the wizard, the system shall send an email to each imported
  email address with a unique link to a registration form.
- **FR-ONB-018:** The registration form shall allow the new member to fill in their profile details
  and create an account using either a password or a social login (Google/Facebook).

## A.2. Document Library

### A.2.1. Upload and Manage Documents (Admin)

- **FR-DOC-001:** Admins shall have access to a "Document Library" page.
- **FR-DOC-002:** The system shall provide an interface to upload files (e.g., PDF, DOCX, PNG).
- **FR-DOC-003:** For each uploaded document, the admin must provide a `Title` and can provide an
  optional `Description`.
- **FR-DOC-004:** Admins can edit the title and description of or delete any existing document.

### A.2.2. Document Permissions (Admin)

- **FR-DOC-005:** For each document, the admin must configure its visibility by selecting one or
  more roles that are permitted to view it.
- **FR-DOC-006:** The list of available roles for permissions shall be the same as those defined in
  the "Roles" configuration.

### A.2.3. View and Download Documents

- **FR-DOC-007:** Any logged-in user can access the Document Library page.
- **FR-DOC-008:** The system shall only display the documents for which the user's role has been
  granted permission.
- **FR-DOC-009:** Users can download a document by clicking on it. The system must use a secure,
  time-limited URL for the download.

---

## A.3. Prayer Wall

### A.3.1. Submit a Prayer Request (Member)

- **FR-PRAY-001:** An authenticated member shall be able to navigate to a "Prayer" page.
- **FR-PRAY-002:** The page shall contain a form to submit a new prayer request.
- **FR-PRAY-003:** The form shall include fields for a `Title` and the `Request Details`.
- **FR-PRAY-004:** The form shall include a checkbox labeled "Submit Anonymously". If checked, the
  user's name will not be attached to the request.

### A.3.2. Moderate Prayer Requests (Admin)

- **FR-PRAY-005:** Admins shall have a "Prayer Moderation" dashboard to view all `PendingApproval`
  prayer requests.
- **FR-PRAY-006:** For each pending request, the admin shall have "Approve" and "Deny" actions.
- **FR-PRAY-007:** Approving a request shall change its status to `Approved` and make it visible on
  the public Prayer Wall.

### A.3.3. View Prayer Wall (Member)

- **FR-PRAY-008:** The Prayer Wall shall display all `Approved` prayer requests.
- **FR-PRAY-009:** If a request was not submitted anonymously, the name of the member who submitted
  it shall be displayed.

## A.4. General Request Management

### A.4.1. Configure Request Types (Admin)

- **FR-REQ-001:** An admin shall be able to access a "Request Types" management page.
- **FR-REQ-002:** The admin shall be able to create new request types with a specified `Name`.
- **FR-REQ-003:** The admin shall be able to disable a request type. The system must prevent
  deletion if open requests of that type exist.

### A.4.2. Submit a Request (Member)

- **FR-REQ-004:** A member shall be able to navigate to a "Requests" page and click "New Request".
- **FR-REQ-005:** The form shall include a dropdown to select from all enabled `Request Types`.
- **FR-REQ-006:** The form shall include fields for `Title` and `Description`.

### A.4.3. Manage Requests (Admin)

- **FR-REQ-007:** An admin shall have a dashboard to view all submitted requests.
- **FR-REQ-008:** An admin can assign a request to a staff member.
- **FR-REQ-009:** An admin can update the status of a request between `Pending`, `In Progress`, and
  `Closed`.

## A.5. Event & Service Check-in

### A.5.1. View Check-in Dashboard (Admin)

- **FR-CHK-001:** An admin shall have access to a "Check-in Dashboard".
- **FR-CHK-002:** The dashboard shall display a summary of attendance for recent events and
  services.

### A.5.2. Member Check-in

- **FR-CHK-003:** The system shall record attendance when a member is checked into an event.

## A.6. Event Volunteer Management

### A.6.1. Create Event (Admin)

- **FR-EVT-001:** An admin shall be able to create new events with title, description, start/end times, location, and visibility settings.
- **FR-EVT-002:** Events can be optionally linked to specific groups.
- **FR-EVT-003:** Events shall have public or private visibility settings.

### A.6.2. Manage Volunteer Roles (Admin)

- **FR-EVT-004:** For each event, an admin shall be able to create volunteer roles with a name and number of volunteers needed.
- **FR-EVT-005:** An admin shall be able to update volunteer role names and capacity requirements.
- **FR-EVT-006:** An admin shall be able to delete volunteer roles that have no current signups.

### A.6.3. Volunteer Signup (Member)

- **FR-EVT-007:** Members shall be able to view available volunteer roles for upcoming events.
- **FR-EVT-008:** Members shall be able to sign up for volunteer roles if capacity is not exceeded.
- **FR-EVT-009:** Members shall be able to cancel their volunteer signups.
- **FR-EVT-010:** The system shall prevent duplicate signups for the same role by the same member.

### A.6.4. Volunteer Coordination Dashboard (Admin)

- **FR-EVT-011:** An admin shall have access to a volunteer coordination dashboard showing all events and their volunteer roles.
- **FR-EVT-012:** The dashboard shall display current signup counts versus capacity for each role.
- **FR-EVT-013:** The dashboard shall show which members are signed up for each role.
- **FR-EVT-014:** The dashboard shall highlight roles that are under/over capacity.

### A.6.5. Event Management (Admin)

- **FR-EVT-015:** An admin shall be able to update event details.
- **FR-EVT-016:** An admin shall be able to delete events.
- **FR-EVT-017:** Deleting an event shall also remove all associated volunteer roles and signups.

### A.6.6. Attendance Tracking

- **FR-EVT-018:** An admin shall be able to record attendance for events.
- **FR-EVT-019:** Attendance records shall include status (Present, Absent, Late) and optional notes.
- **FR-EVT-020:** An admin shall be able to export attendance data as CSV for reporting purposes.

---

_The remaining sections and Part B (System Administration) are omitted for brevity but are
understood to be included in the full document._

---

## Part B: Platform and Tenant Administration

### B.1. Super Admin Console (Platform Operator)

- **FR-SUP-001:** Provide a tenant list view including `Tenant Name`, `Plan`, `Status`, `CreatedAt`, `LastActiveAt`.
- **FR-SUP-002:** Support tenant lifecycle actions: `Provision`, `Suspend`, `Reinstate`, `Decommission` with confirmations and audit logging.
- **FR-SUP-003:** Allow editing tenant entitlements (enabled modules, user caps), effective immediately with audit trail.
- **FR-SUP-004:** Implement impersonation for troubleshooting with explicit banner, time-bound access, and immutable audit log entries.

### B.2. Platform Observability & Incidents

- **FR-SUP-005:** Expose platform health dashboard with uptime, error rates, request throughput, and dependency status.
- **FR-SUP-006:** Trigger incident workflows on threshold breaches: create incident ticket, status banner, and tenant notifications.
- **FR-SUP-007:** Maintain an incident history with timestamps, scope, impact, and remediation notes.

### B.3. Billing Alignment (High-Level)

- **FR-SUP-008:** Store billing metadata per tenant (`Plan`, `BillingStatus`, `RenewalDate`, `GraceUntil`).
- **FR-SUP-009:** On `BillingStatus=Delinquent`, move tenant to grace period and restrict access when expired.
- **FR-SUP-010:** Record billing state changes in the global audit log. Integration specifics to be defined by provider decision.

### B.4. Global Audit Trail

- **FR-SUP-011:** Record all super-admin actions (who, what, when, before/after state) with export capability (CSV/JSON).
- **FR-SUP-012:** Log tenant lifecycle events and impersonation sessions with correlation IDs.

### B.5. Tenant Administration Enhancements (Church App Admin)

- **FR-TEN-001:** Role/Permission Editor: create, edit, delete custom roles; assign granular permissions by module/action.
- **FR-TEN-002:** Data Tools: bulk import (CSV), deduplication assistance, household reassignment with preview and audit.
- **FR-TEN-003:** Configurable Dashboards: create saved views with KPIs (attendance, engagement, requests) and export/share.
- **FR-TEN-004:** Workflows: assignment, reminders, and approvals for requests/events with due dates and escalation.
- **FR-TEN-005:** Integrations: tenant-level settings for email/SMS providers and calendar exports (ICS).

### B.6. Security & Access Controls

- **FR-SEC-001:** Enforce data isolation by `churchId` across all tenant-admin features.
- **FR-SEC-002:** Support scoped access for impersonation with explicit consent/logging where policy requires.
- **FR-SEC-003:** Provide permission checks client- and server-side with a consistent authorization policy.

---

## Decision Log and Owners (Initial)

- **Billing Provider Selection:** Owner – Product/Founder; Needed to finalize FR-SUP-008..010.
- **Impersonation Policy (consent, banners, retention):** Owner – Security Lead; Affects FR-SUP-004, FR-SUP-011..012.
- **Permission Model Granularity:** Owner – Tech Lead; Affects FR-TEN-001, FR-SEC-003.
- **Notification Channels (email/SMS providers):** Owner – Product/Tech; Affects FR-TEN-005 and workflows.

---

## Part C: Persona-Specific Functional Requirements

### C.1. Board of Trustees (Governance Body)

- **FR-TRUST-001:** Trustees shall have access to a governance dashboard displaying quarterly compliance reports, financial summaries, risk registers, and safeguarding metrics.
- **FR-TRUST-002:** Secure document portal with role-based access to policy documents, audit reports, and meeting materials with versioning and acknowledgment tracking.
- **FR-TRUST-003:** Workflow tools for policy approvals, incident reviews, and decision logging with full audit trails and comment threads.
- **FR-TRUST-004:** Automated notifications for compliance deadlines, incident alerts, and quarterly reporting cycles with escalation paths.
- **FR-TRUST-005:** Time-bound access controls with explicit logging of all document views, downloads, and governance actions.

### C.2. Non-Fulltime Coordinators (Ministry Coordinators)

- **FR-COORD-001:** Volunteer scheduling interface with drag-and-drop assignments, availability conflict detection, and template reuse for recurring events.
- **FR-COORD-002:** Volunteer availability management with self-service blackout dates, skill tracking, and preference settings.
- **FR-COORD-003:** Automated reminder workflows for assignments, confirmations, and last-minute coverage requests with customizable templates.
- **FR-COORD-004:** Communication tools with ministry segmentation and message logging for volunteer coordination and announcements.
- **FR-COORD-005:** Basic analytics dashboard showing coverage rates, participation trends, volunteer retention metrics, and gap analysis.

### C.3. Church Leaders (Pastoral/Ministry Leaders)

- **FR-LEAD-001:** Ministry-specific dashboards with filtered care requests, attendance trends, engagement signals, and task assignments.
- **FR-LEAD-002:** Task management capabilities for assigning follow-ups, updating pastoral notes, and tracking completion with status workflows.
- **FR-LEAD-003:** Automated alerts for attendance dips, urgent care requests, and volunteer coverage gaps with configurable thresholds.
- **FR-LEAD-004:** Integration with communication tools respecting member privacy preferences and opt-in requirements.
- **FR-LEAD-005:** Scoped access controls limiting data visibility to assigned ministries with confidentiality boundaries and audit logging.

### C.4. Members (Registered Congregants)

- **FR-MEMB-001:** Self-service profile management with household connections, preference settings, and contact information updates.
- **FR-MEMB-002:** Event discovery and registration with filtering, recommendations, and household bulk registration capabilities.
- **FR-MEMB-003:** Personal dashboard summarizing upcoming commitments, recent interactions, and engagement history.
- **FR-MEMB-004:** Notification center with preference management across email, SMS, and push channels with opt-in/opt-out controls.
- **FR-MEMB-005:** Request submission and tracking for prayer, pastoral care, and general support needs with status updates and feedback loops.

### C.5. Non-Members (Visitors/Seekers)

- **FR-VISIT-001:** Guest-friendly public flows for event registration and information requests without account requirements.
- **FR-VISIT-002:** Automated nurture workflows with segmented communications and follow-up scheduling based on interaction history.
- **FR-VISIT-003:** Visitor-to-member conversion pathway with data continuity, consent management, and profile migration.
- **FR-VISIT-004:** Public resource access for service information, beliefs, and next steps toward membership with minimal barriers.
- **FR-VISIT-005:** Privacy controls with transparent data usage statements, consent management, and easy opt-out mechanisms.
