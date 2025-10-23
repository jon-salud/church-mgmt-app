# Functional Requirements Document: Church Management Application

## 1. Introduction

This document provides a detailed breakdown of the functional requirements for the Church Management Application. It expands upon the high-level business needs outlined in the Business Requirements Document (BRD) and defines the specific behaviors, user interactions, and system rules required for implementation.

This document is intended to serve as a comprehensive guide for the development, testing, and quality assurance teams to ensure the final product aligns with the business objectives. Each section corresponds to a core feature and details the specific functionality from the perspective of the different user roles.

## 2. Member Directory and Household Management

This section details the functional requirements for managing member profiles and their household relationships.

### 2.1. View Member List (Admin)
*   **FR-MEM-001:** The system shall display a paginated list of all members within the church client's database.
*   **FR-MEM-002:** Each row in the member list must display the member's First Name, Last Name, and Email address.
*   **FR-MEM-003:** The member list must be sortable by First Name, Last Name, and Email address in both ascending and descending order.
*   **FR-MEM-004:** The system shall provide a search bar to filter the member list by name or email.

### 2.2. Create New Member (Admin)
*   **FR-MEM-005:** The system shall provide a form to create a new member profile.
*   **FR-MEM-006:** The create member form must include the following fields:
    *   `firstName` (Required, Text)
    *   `lastName` (Required, Text)
    *   `email` (Required, Valid Email Format)
    *   `phone` (Optional, Text)
    *   `address` (Optional, Text)
    *   `birthday` (Optional, Date Picker)
    *   `notes` (Optional, Text Area)
*   **FR-MEM-007:** The system must validate that the `email` address is unique within the church client's database before saving.
*   **FR-MEM-008:** Upon successful creation, the system shall redirect the Admin to the newly created member's detail page.

### 2.3. View Member Details
*   **FR-MEM-009 (Admin):** Admins shall be able to view the full profile details for any member, including all fields listed in FR-MEM-006.
*   **FR-MEM-010 (Member):** Members shall be able to view their own profile details.

### 2.4. Edit Member Profile
*   **FR-MEM-011 (Admin):** Admins shall be able to edit all fields on any member's profile.
*   **FR-MEM-012 (Member):** Members shall be able to edit a limited set of fields on their own profile: `phone`, `address`. They cannot edit their own name or email.
*   **FR-MEM-013:** All changes to a member's profile must be recorded in the audit log, capturing the field changed, the old value, the new value, the actor, and the timestamp.

## 3. Giving and Contribution Tracking

This section details the functional requirements for the manual recording of member contributions.

### 3.1. Manage Funds (Admin)
*   **FR-GIV-001:** The system shall allow Admins to create, view, edit, and archive contribution funds (e.g., "General Fund", "Missions", "Building Fund").
*   **FR-GIV-002:** Each fund must have a `name` (Required, Text) and a `status` ('Active' or 'Archived').
*   **FR-GIV-003:** Archived funds should not appear in the "Fund" dropdown when recording a new contribution.

### 3.2. Record a Contribution (Admin)
*   **FR-GIV-004:** The system shall provide a form to manually record a new contribution.
*   **FR-GIV-005:** The new contribution form must include the following fields:
    *   `memberId` (Required, searchable dropdown of members)
    *   `date` (Required, Date Picker, defaults to the current date)
    *   `amount` (Required, Numeric, must be a positive value)
    *   `method` (Required, Dropdown: 'Cash', 'Bank Transfer', 'Other')
    *   `fundId` (Required, Dropdown of active funds)
    *   `note` (Optional, Text Area)
*   **FR-GIV-006:** Upon successful submission, the system shall record the contribution and associate it with the selected member.
*   **FR-GIV-007:** The creation of a contribution must be recorded in the audit log.

### 3.3. View Giving History
*   **FR-GIV-008 (Admin):** The system shall provide a report of all contributions, filterable by date range, member, and fund.
*   **FR-GIV-009 (Admin):** The system shall allow Admins to export the filtered contribution report to a CSV file.
*   **FR-GIV-010 (Member):** Members shall be able to view a list of their own past contributions, sorted by date in descending order.
*   **FR-GIV-011 (Member):** Each entry in the member's giving history must display the Date, Amount, Fund, and Method.

## 4. Groups and Ministries

This section details the functional requirements for creating and managing groups.

### 4.1. Create and Manage Groups (Admin)
*   **FR-GRP-001:** The system shall provide a form for Admins to create a new group.
*   **FR-GRP-002:** The create group form must include the following fields:
    *   `name` (Required, Text)
    *   `description` (Optional, Text Area)
    *   `type` (Required, Dropdown, see FR-GRP-008)
    *   `meetingDay` (Optional, Dropdown: Sunday-Saturday)
    *   `meetingTime` (Optional, Time Picker)
*   **FR-GRP-003:** Admins shall be able to edit all fields of an existing group.
*   **FR-GRP-004:** The creation and modification of groups must be recorded in the audit log.

### 4.2. Manage Group Membership (Admin/Leader)
*   **FR-GRP-005:** The system shall allow Admins and Leaders to add members to groups they manage.
*   **FR-GRP-006:** A member can belong to multiple groups simultaneously.
*   **FR-GRP-007:** The system shall allow Admins and Leaders to remove members from groups they manage.

### 4.3. View Groups
*   **FR-GRP-008 (Admin):** Admins shall see a list of all groups within the church client.
*   **FR-GRP-009 (Leader):** Leaders shall see a list of all groups, with emphasis on the groups they lead.
*   **FR-GRP-010 (Member):** Members shall see a list of the groups they are a part of.
*   **FR-GRP-011 (All Roles):** The group detail page shall display the group's information and a roster of its current members.

### 4.4. Group Taxonomy
*   **FR-GRP-012:** The `type` field for a group must be selected from a predefined list:
    *   'GeographicalMinistry'
    *   'ServiceMinistry'
    *   'VolunteerTeam'
    *   'SmallGroup'
    *   'Other'

## 5. Events and Attendance

This section details the functional requirements for creating events and recording attendance.

### 5.1. Create and Manage Events (Admin/Leader)
*   **FR-EVT-001:** The system shall provide a form for Admins and Leaders to create a new event.
*   **FR-EVT-002:** The create event form must include the following fields:
    *   `title` (Required, Text)
    *   `description` (Optional, Text Area)
    *   `startAt` (Required, DateTime Picker)
    *   `endAt` (Required, DateTime Picker)
    *   `location` (Optional, Text)
    *   `groupId` (Optional, Dropdown of groups)
*   **FR-EVT-003:** Admins and Leaders shall be able to edit events they have created.
*   **FR-EVT-004:** The creation and modification of events must be recorded in the audit log.

### 5.2. Record Attendance (Admin/Leader)
*   **FR-EVT-005:** For each event, the system shall provide an interface to record attendance.
*   **FR-EVT-006:** The attendance interface shall list the members of the associated group (if any) or provide a way to search for members to add to the attendance list.
*   **FR-EVT-007:** For each member, the attendance status can be marked as 'Checked In', 'Absent', or 'Excused'.
*   **FR-EVT-008:** The system shall allow an optional note to be added for each attendee.
*   **FR-EVT-009:** All attendance records must be auditable, with a timestamp and the actor who recorded it.

### 5.3. View Events
*   **FR-EVT-010 (All Roles):** The system shall display a list or calendar of upcoming events.
*   **FR-EVT-011 (All Roles):** Users shall be able to view the details of an event, including its title, description, time, and location.
*   **FR-EVT-012 (Admin):** Admins shall be able to export an attendance report for any event to a CSV file.

## 6. Announcements and Communication

This section details the functional requirements for the in-app announcement system.

### 6.1. Create and Manage Announcements (Admin)
*   **FR-ANN-001:** The system shall provide a form for Admins to create a new announcement.
*   **FR-ANN-002:** The create announcement form must include the following fields:
    *   `title` (Required, Text)
    *   `body` (Required, Rich Text/Markdown)
    *   `audience` (Required, Radio Buttons: 'All Members', 'Selected Groups')
    *   `groupIds` (Conditional, shown if 'Selected Groups' is chosen, Multi-select list of groups)
    *   `publishAt` (Required, DateTime Picker, defaults to now)
    *   `expireAt` (Optional, DateTime Picker)
*   **FR-ANN-003:** Admins shall be able to edit or delete existing announcements.
*   **FR-ANN-004:** The creation and modification of announcements must be recorded in the audit log.

### 6.2. View Announcements (Member)
*   **FR-ANN-005:** The system shall display a feed of active and relevant announcements to logged-in members.
*   **FR-ANN-006:** An announcement is considered active if the current date is after `publishAt` and before `expireAt`.
*   **FR-ANN-007:** An announcement is considered relevant if its audience is 'All Members' or if the member belongs to one of the selected `groupIds`.
*   **FR-ANN-008:** The system shall allow members to mark an announcement as "read".
*   **FR-ANN-009:** The system shall visually distinguish between read and unread announcements in the feed.

## 7. Pastoral Care and Prayer Requests

This section details the functional requirements for spiritual support features.

### 7.1. Public Prayer Wall
*   **FR-PRAY-001 (User):** The system shall provide a form for any user (member or anonymous) to submit a prayer request.
*   **FR-PRAY-002:** The prayer request form must include a `title` (Required), `description` (Required), and an option to submit anonymously.
*   **FR-PRAY-003:** All submitted prayer requests must have a default status of `PENDING_APPROVAL` and will not be publicly visible.
*   **FR-PRAY-004 (Admin):** The system shall provide a moderation queue for Admins to view all prayer requests with a `PENDING_APPROVAL` status.
*   **FR-PRAY-005 (Admin):** Admins can change the status of a prayer request to `APPROVED` or `DENIED`.
*   **FR-PRAY-006 (Member):** The public prayer wall shall only display requests with an `APPROVED` status.
*   **FR-PRAY-007 (Member):** Members can click an "I'm praying" button on a request, which increments a publicly visible counter.
*   **FR-PRAY-008 (Original Poster):** The original poster can update the status of their request to `ANSWERED`.

### 7.2. Confidential Pastoral Care Tickets
*   **FR-PST-001 (Member):** The system shall provide a form for members to submit a confidential request for pastoral care.
*   **FR-PST-002:** The form must include a clear message stating that the request is confidential.
*   **FR-PST-003:** The form must include `title` (Required), `description` (Required), and an optional `priority` level ('Low', 'Normal', 'High', 'Urgent').
*   **FR-PST-004 (Admin):** The system shall provide a dashboard for Admins to view and manage all pastoral care tickets.
*   **FR-PST-005 (Admin):** The dashboard must be sortable and filterable by ticket `status` ('New', 'In Progress', 'Resolved') and `priority`.
*   **FR-PST-006 (Admin):** Admins can assign tickets to specific staff members.
*   **FR-PST-007 (Admin):** Admins can add private, time-stamped comments to a ticket to track progress and communication.

## 8. Child Check-In and Safety

This section details the functional requirements for the child check-in and safety features.

### 8.1. Manage Child Information (Parent/Guardian)
*   **FR-CHK-001:** The system shall allow parents or guardians to add and manage their children's information.
*   **FR-CHK-002:** Children must be linked to a `Household` to support multiple guardians.
*   **FR-CHK-003:** The child information form must include the following fields:
    *   `fullName` (Required, Text)
    *   `dateOfBirth` (Required, Date Picker)
    *   `allergies` (Optional, Text Area)
    *   `medicalNotes` (Optional, Text Area)

### 8.2. Check-In Process
*   **FR-CHK-004 (Parent/Staff):** The system shall allow a child to be checked into an event by a parent or a staff member.
*   **FR-CHK-005 (Parent):** Self-check-ins by parents create a `PENDING_CONFIRMATION` record that requires staff confirmation.
*   **FR-CHK-006 (Staff):** Staff-initiated check-ins are confirmed immediately.
*   **FR-CHK-007:** The system must record the check-in timestamp and the staff member who confirmed it.

### 8.3. Check-In Dashboard (Staff)
*   **FR-CHK-008:** The system shall provide a dashboard for staff to manage check-ins.
*   **FR-CHK-009:** The dashboard must list children with statuses: `Pending Confirmation`, `Checked In`, `Checked Out`.
*   **FR-CHK-010:** Each row must display the child's name, age, allergies, medical notes, event/group, and check-in/check-out times.
*   **FR-CHK-011:** The dashboard must be filterable and searchable by status, event/group, or child's name.

### 8.4. Check-Out Process
*   **FR-CHK-012 (Staff):** The system shall allow staff to check a child out.
*   **FR-CHK-013:** The system must record the check-out timestamp and the staff member who performed the action.
*   **FR-CHK-014:** The system shall send a notification to the parent's device upon checkout.
*   **FR-CHK-015:** All check-in, check-out, and confirmation actions must be recorded in the audit log.

## 9. Unified Request Form

This section details the functional requirements for the unified request submission form.

### 9.1. Request Submission (Member)
*   **FR-REQ-001:** The system shall provide a single form for members to submit various types of requests.
*   **FR-REQ-002:** The form must include a dropdown to select from a list of admin-configurable request types.
*   **FR-REQ-003:** The form's placeholder text and description shall dynamically update based on the selected request type.
*   **FR-REQ-004:** All submissions shall be routed to the Pastoral Care dashboard for review.

### 9.2. Request Management (Admin)
*   **FR-REQ-005:** The Pastoral Care dashboard table shall include a "Type" column to distinguish between different request types.
*   **FR-REQ-006:** The dashboard must provide a "View Details" modal to display the full details of each request.

### 9.3. Request Type Configuration (Admin)
*   **FR-REQ-007:** The system shall provide a settings page for Admins to create, edit, archive, and reorder custom request types.
*   **FR-REQ-008:** Built-in request types can be enabled or disabled by Admins.
*   **FR-REQ-009:** Admins shall not be able to delete a request type if there are open requests associated with it.

## 10. Data Privacy and Compliance (GDPR)

This section details the functional requirements for ensuring compliance with data privacy regulations.

### 10.1. Data Export (Admin)
*   **FR-CMP-001:** The system shall provide a mechanism for Admins to export all data associated with a specific member upon request.
*   **FR-CMP-002:** The data export must include the member's profile information, group memberships, attendance records, and giving history.
*   **FR-CMP-003:** The export format shall be a machine-readable format, such as CSV or JSON.

### 10.2. Right to be Forgotten (Admin)
*   **FR-CMP-004:** The system shall provide a mechanism for Admins to process a member's "right to be forgotten" request.
*   **FR-CMP-005:** This process shall involve the anonymization of the member's personal data (First Name, Last Name, Email, Phone, Address) in their profile.
*   **FR-CMP-006:** A record of the anonymization action, including the date and the requesting admin, must be stored for auditing purposes. Historical records (such as giving history, attendance, and group membership) will be retained for legal and statistical purposes but will be disassociated from the anonymized user's personal identity.
*   **FR-CMP-007:** The anonymization action must be recorded in the audit log.

## 11. Dashboard and Reporting

This section details the functional requirements for the main Admin dashboard. The dashboard will provide at-a-glance visual insights into key church health metrics.

### 11.1. Membership Growth Graph
*   **FR-DSH-001:** The dashboard shall display a **Line Chart** titled "Total Members Over Time".
*   **FR-DSH-002:** The x-axis shall represent the last 12 months.
*   **FR-DSH-003:** The y-axis shall represent the total number of members.
*   **FR-DSH-004:** The chart shall plot a point for each month, showing the total member count at the end of that month.

### 11.2. Attendance Trends Graph
*   **FR-DSH-005:** The dashboard shall display a **Bar Chart** titled "Average Weekly Attendance (Last 6 Months)".
*   **FR-DSH-006:** The x-axis shall represent the last 6 months.
*   **FR-DSH-007:** The y-axis shall represent the average number of attendees per week.
*   **FR-DSH-008:** Each bar shall represent a month, with its height corresponding to the average weekly attendance calculated from all events within that month.

### 11.3. Community Engagement Graph
*   **FR-DSH-009:** The dashboard shall display a **Donut Chart** titled "Group Membership Breakdown".
*   **FR-DSH-010:** The chart shall be divided into segments, each representing a different group type (Small Group, Volunteer Team, Service Ministry, etc.).
*   **FR-DSH-011:** The size of each segment shall represent the percentage of total members who are part of at least one group of that type.
*   **FR-DSH-012:** Hovering over a segment shall display the group type and the exact percentage.

### 11.4. Financial Health Graph
*   **FR-DSH-013:** The dashboard shall display a **Combined Bar and Line Chart** titled "Monthly Giving vs. Budget".
*   **FR-DSH-014:** The x-axis shall represent the last 12 months.
*   **FR-DSH-015:** The y-axis shall represent the monetary amount in the church client's currency.
*   **FR-DSH-016:** For each month, a bar shall represent the total giving received.
*   **FR-DSH-017:** A configurable, straight line representing the monthly budget target shall be overlaid on the chart.

### 11.5. Age Demographics Graph
*   **FR-DSH-018:** The dashboard shall display a **Horizontal Bar Chart** titled "Member Age Distribution".
*   **FR-DSH-019:** The y-axis shall list predefined age brackets (e.g., 0-10, 11-18, 19-30, 31-45, 46-60, 60+).
*   **FR-DSH-020:** The x-axis shall represent the number of members.
*   **FR-DSH-021:** The length of the bar for each bracket shall correspond to the number of members whose current age falls within that bracket.
