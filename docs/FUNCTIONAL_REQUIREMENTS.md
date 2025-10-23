# Functional Requirements Document: Church Management Application

## 1. Introduction
This document details the functional requirements for the Church Management Application.

---

## Part A: Client Application (`web`)

---

## A.1. Onboarding Wizard

This feature guides a new Church Administrator through the initial setup of their account. It is triggered on the first login for a new church client.

### A.1.1. Wizard Flow
*   **FR-ONB-001:** The wizard shall consist of a series of skippable steps.
*   **FR-ONB-002:** A "Skip for now" link shall be present on every step.
*   **FR-ONB-003:** A setup guide or checklist shall be available on the main dashboard for admins to return to incomplete steps.

### A.1.2. Step 1: Welcome & Branding
*   **FR-ONB-004:** The screen shall display a welcome message.
*   **FR-ONB-005:** The admin shall be able to upload a church logo (e.g., JPG, PNG).
*   **FR-ONB-006:** The admin shall be able to select a primary brand color.

### A.1.3. Step 2: Define Roles
*   **FR-ONB-007:** The system shall display the default roles (`Admin`, `Leader`, `Member`).
*   **FR-ONB-008:** The admin shall have an interface to create new, custom roles.

### A.1.4. Step 3: Invite Core Team
*   **FR-ONB-009:** The system shall provide a form to add team members with fields for `Name`, `Email`, and `Role` (using the roles from Step 2).
*   **FR-ONB-010:** Upon completion of the wizard, the system shall send an email invitation to each person added in this step.

### A.1.5. Step 4: Import Member Emails
*   **FR-ONB-011:** The system shall provide two methods for bulk-adding members: a text box for pasting emails and a CSV file upload.
*   **FR-ONB-012:** Upon completion of the wizard, the system shall send an email to each imported email address with a unique link to a registration form.
*   **FR-ONB-013:** The registration form shall allow the new member to fill in their profile details and create an account using either a password or a social login (Google/Facebook).

## A.2. Document Library

### A.2.1. Upload and Manage Documents (Admin)
*   **FR-DOC-001:** Admins shall have access to a "Document Library" page.
*   **FR-DOC-002:** The system shall provide an interface to upload files (e.g., PDF, DOCX, PNG).
*   **FR-DOC-003:** For each uploaded document, the admin must provide a `Title` and can provide an optional `Description`.
*   **FR-DOC-004:** Admins can edit the title and description of or delete any existing document.

### A.2.2. Document Permissions (Admin)
*   **FR-DOC-005:** For each document, the admin must configure its visibility by selecting one or more roles that are permitted to view it.
*   **FR-DOC-006:** The list of available roles for permissions shall be the same as those defined in the "Roles" configuration.

### A.2.3. View and Download Documents
*   **FR-DOC-007:** Any logged-in user can access the Document Library page.
*   **FR-DOC-008:** The system shall only display the documents for which the user's role has been granted permission.
*   **FR-DOC-009:** Users can download a document by clicking on it. The system must use a secure, time-limited URL for the download.

---
## A.3. Prayer Wall

### A.3.1. Submit a Prayer Request (Member)
*   **FR-PRAY-001:** An authenticated member shall be able to navigate to a "Prayer" page.
*   **FR-PRAY-002:** The page shall contain a form to submit a new prayer request.
*   **FR-PRAY-003:** The form shall include fields for a `Title` and the `Request Details`.
*   **FR-PRAY-004:** The form shall include a checkbox labeled "Submit Anonymously". If checked, the user's name will not be attached to the request.

### A.3.2. Moderate Prayer Requests (Admin)
*   **FR-PRAY-005:** Admins shall have a "Prayer Moderation" dashboard to view all `PendingApproval` prayer requests.
*   **FR-PRAY-006:** For each pending request, the admin shall have "Approve" and "Deny" actions.
*   **FR-PRAY-007:** Approving a request shall change its status to `Approved` and make it visible on the public Prayer Wall.

### A.3.3. View Prayer Wall (Member)
*   **FR-PRAY-008:** The Prayer Wall shall display all `Approved` prayer requests.
*   **FR-PRAY-009:** If a request was not submitted anonymously, the name of the member who submitted it shall be displayed.

## A.4. General Request Management

### A.4.1. Configure Request Types (Admin)
*   **FR-REQ-001:** An admin shall be able to access a "Request Types" management page.
*   **FR-REQ-002:** The admin shall be able to create new request types with a specified `Name`.
*   **FR-REQ-003:** The admin shall be able to disable a request type. The system must prevent deletion if open requests of that type exist.

### A.4.2. Submit a Request (Member)
*   **FR-REQ-004:** A member shall be able to navigate to a "Requests" page and click "New Request".
*   **FR-REQ-005:** The form shall include a dropdown to select from all enabled `Request Types`.
*   **FR-REQ-006:** The form shall include fields for `Title` and `Description`.

### A.4.3. Manage Requests (Admin)
*   **FR-REQ-007:** An admin shall have a dashboard to view all submitted requests.
*   **FR-REQ-008:** An admin can assign a request to a staff member.
*   **FR-REQ-009:** An admin can update the status of a request between `Pending`, `In Progress`, and `Closed`.

## A.5. Event & Service Check-in

### A.5.1. View Check-in Dashboard (Admin)
*   **FR-CHK-001:** An admin shall have access to a "Check-in Dashboard".
*   **FR-CHK-002:** The dashboard shall display a summary of attendance for recent events and services.

### A.5.2. Member Check-in
*   **FR-CHK-003:** The system shall record attendance when a member is checked into an event.

---
*The remaining sections and Part B (System Administration) are omitted for brevity but are understood to be included in the full document.*
