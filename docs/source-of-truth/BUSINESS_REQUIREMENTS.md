# Business Requirements Document (BRD) for Church Management System

## 1. Executive Summary

### 1.1. Project Purpose

The purpose of this document is to outline the business requirements for the Church Management
System, a modern, cloud-based software-as-a-service (SaaS) platform. This platform is designed to
provide church leadership and administration with the tools they need to manage their community
effectively, streamline administrative processes, and foster member engagement. The system will be
designed to support multiple, distinct church clients, ensuring that each client's data and
operations remain private and secure.

### 1.2. Business Goals and Objectives

- **Improve Administrative Efficiency:** Automate and simplify common administrative tasks such as
  member management, request tracking, and attendance monitoring.
- **Enhance Member Engagement:** Provide intuitive, accessible tools for members to connect with the
  church, submit requests, and participate in community activities like a shared prayer wall.
- **Provide Actionable Insights:** Offer church leadership clear dashboards and data to understand
  trends in attendance, member needs, and community health.
- **Ensure Scalability and Security:** Build a robust platform that can grow with a church's needs
  while ensuring the highest standards of data privacy and security for each church client.

## 2. Project Scope

### 2.1. In-Scope Features (Initial Release)

The initial release of the platform will focus on the following core functionalities:

- **Multi-Client Architecture:** The system will be architected to serve multiple church clients,
  with complete data isolation between them.
- **Member & Household Management:** A central directory of all church members, organized by
  households to reflect family structures.
- **Prayer Request System:** A moderated module for members to submit prayer requests and for the
  community to view approved requests.
- **General Request Management:** A flexible system for managing various internal requests from
  members to church staff (e.g., pastoral care, information).
- **Event & Service Check-in:** A simple-to-use check-in system for tracking attendance at services,
  classes, and events.
- **Onboarding Wizard:** A guided setup process for new Church Administrators.
- **Document Library:** A secure, role-based repository for file sharing.
- **Small Group Resource Sharing:** Basic functionality for small groups to share resources via web
  links.
- **Theming:** The user interface will support both light and dark themes for improved accessibility
  and user preference.

### 2.2. Persona-Driven Business Requirements (Priority Focus)

The following persona-focused requirements refine platform and tenant administration needs and guide
subsequent functional specifications. These complement, not replace, existing modules.

#### 2.2.1. Super Admin (Platform Operator)

- Tenant lifecycle management (provision, suspend, decommission) with plan/entitlement controls.
- Platform health and observability dashboards (uptime, error rates, request volumes) with incident workflows.
- Billing alignment (integration or manual workflows) including trials, renewals, delinquency handling, and receipts.
- Global audit trail for super-admin actions and tenant lifecycle events.
- Impersonation/safe troubleshooting mechanism with explicit logging and revocation.

#### 2.2.2. Church App Admin (Tenant Administrator)

- Role/permission management with templated roles (Admin, Staff, Leader, Volunteer, Member) and custom roles.
- Configurable dashboards (attendance, engagement, requests) and export/sharing capabilities.
- Data management tools (bulk import, deduplication, household management) with audit trails.
- Workflow support for assignments, reminders, and approvals across requests and events.
- Integration controls for tenant-level communications (email/SMS) and calendars.

#### 2.2.3. Board of Trustees (Governance Body)

- Governance dashboard with quarterly compliance reports, financial summaries, risk registers, and safeguarding metrics.
- Secure document portal for policy documents, audit reports, and meeting materials with versioning and acknowledgment tracking.
- Workflow tools for policy approvals, incident reviews, and decision logging with full audit trails.
- Automated notifications for compliance deadlines, incident alerts, and quarterly reporting cycles.
- Time-bound access controls with explicit logging of all document views and downloads.

#### 2.2.4. Non-Fulltime Coordinators (Ministry Coordinators)

- Volunteer scheduling interface with drag-and-drop assignments, availability conflict detection, and template reuse.
- Volunteer availability management with self-service blackout dates and skill tracking.
- Automated reminder workflows for assignments, confirmations, and last-minute coverage requests.
- Communication tools with ministry segmentation and message logging for volunteer coordination.
- Basic analytics dashboard showing coverage rates, participation trends, and volunteer retention metrics.

#### 2.2.5. Church Leaders (Pastoral/Ministry Leaders)

- Ministry-specific dashboards with filtered care requests, attendance trends, and engagement signals.
- Task management capabilities for assigning follow-ups, updating pastoral notes, and tracking completion.
- Automated alerts for attendance dips, urgent care requests, and volunteer coverage gaps.
- Integration with communication tools respecting member privacy preferences and opt-in requirements.
- Scoped access to member data limited to assigned ministries with confidentiality controls.

#### 2.2.6. Members (Registered Congregants)

- Self-service profile management with household connections and preference settings.
- Event discovery and registration with filtering, recommendations, and household bulk registration.
- Personal dashboard summarizing upcoming commitments, recent interactions, and engagement history.
- Notification center with preference management across email, SMS, and push channels.
- Request submission and tracking for prayer, pastoral care, and general support needs.

#### 2.2.7. Non-Members (Visitors/Seekers)

- Guest-friendly public flows for event registration and information requests without account requirements.
- Automated nurture workflows with segmented communications and follow-up scheduling.
- Visitor-to-member conversion pathway with data continuity and consent management.
- Public resource access for service information, beliefs, and next steps toward membership.
- Privacy controls with transparent data usage and easy opt-out mechanisms.

### 2.3. Out-of-Scope Features (Future Releases)

The following features are identified as valuable but will be considered for development after the
initial release:

- **Advanced Content Management System (CMS):** A full-featured CMS for managing public-facing
  website content.
- **Integrated File Hosting:** Direct file uploading and storage for small group resources (e.g.,
  integration with Google Drive or similar services).
- **Volunteer Management:** Dedicated modules for scheduling and communicating with volunteers.
- **Child Check-in Security:** Advanced features for child check-in, such as security tags and
  parent notifications.
- **Financial & Giving Management:** Tools for tracking donations, pledges, and church finances.

## 3. Business Requirements

### 3.1. User Personas

- **Church Administrator:** Responsible for the overall management of the church's data within the
  platform. This user will have the highest level of access to configure settings, manage member
  data, and oversee all functional modules.
- **Member:** A general user from the church congregation. This user can manage their own profile,
  submit prayer and other requests, and interact with community features.

Additional documented personas are available in `docs/source-of-truth/personas/` and inform
cross-cutting requirements (e.g., Trustees governance views, Household Leaders updates,
Non-Members onboarding, Volunteer Coordinators scheduling). These are used to prioritize and phase
capabilities without altering data isolation or privacy commitments.

### 3.2. Functional Requirements

#### 3.2.1. Member Management

- **Household Model:** The system shall group individual members into households.
- **Customizable Profiles:** Church Administrators shall be able to configure which optional data
  fields are available for member profiles, allowing each church client to tailor the system to
  their specific needs.
- **Member Directory:** Church Administrators shall be able to view, add, and manage all member and
  household records.

#### 3.2.2. Prayer Wall

- **Request Submission:** Authenticated members shall be able to submit new prayer requests.
- **Moderation/Approval:** Church Administrators shall be able to review all submitted prayer
  requests and must approve them before they are visible to the broader church community.
- **Public Visibility:** Approved prayer requests shall be displayed on a "Prayer Wall" accessible
  to all authenticated members.

#### 3.2.3. General Request Management

- **Configurable Request Types:** Church Administrators shall be able to define custom types of
  requests that members can submit (e.g., "Pastoral Visit," "Request Information," "Building
  Maintenance").
- **Confidentiality:** When defining a request type, Administrators shall be able to specify if the
  request includes a field for confidential information, ensuring it is handled with appropriate
  privacy.
- **Request Lifecycle Tracking:** The system shall track the status of each request. The status will
  transition between three states:
  - **Pending:** The initial state when a request is first submitted.
  - **In Progress:** The state when an administrator has acknowledged and begun working on the
    request.
  - **Closed:** The state when the request has been fulfilled.
- **Deletion Prevention:** The system shall prevent a request type from being deleted if there are
  any open requests of that type. This ensures data integrity.

#### 3.2.4. Events, Volunteer Management & Check-in

- **Event Management:** Church Administrators shall be able to create, update, and delete events with details including title, description, date/time, location, and visibility settings.
- **Volunteer Coordination:** Administrators shall be able to define volunteer roles for each event, specifying the number of volunteers needed for each role.
- **Volunteer Signup:** Members shall be able to view available volunteer opportunities and sign up for roles, with the system preventing over-subscription.
- **Volunteer Dashboard:** Administrators shall have access to a dashboard showing volunteer signup status, capacity tracking, and member assignments for each event.
- **Check-in Dashboard:** Church Administrators shall have access to a dashboard for monitoring check-in and attendance data.
- **Attendance Tracking:** The system shall record attendance for members who are checked into a service or event, providing historical data for administrators.
- **Reporting:** Administrators shall be able to export attendance and volunteer data for reporting and analysis.

### 3.3. Non-Functional Requirements

- **Usability:** The user interface must be modern, clean, and intuitive, requiring minimal training
  for both administrators and members. The design shall follow established conventions for web
  applications.
- **Security:**
  - **Authentication:** All access to the application shall be restricted to authenticated users.
  - **Data Isolation:** Each church client's data must be strictly segregated and inaccessible to
    any other client.
  - **Soft Delete Implementation:** All data entities shall implement soft delete functionality
    (adding `deletedAt` timestamp) instead of hard deletes to maintain audit trails and data
    integrity. Deleted records shall be excluded from normal queries but remain accessible for
    compliance and auditing purposes.
- **Scalability:** The platform must be designed to accommodate growth in the number of church
  clients and the number of members within each client without degradation in performance.
- **Accessibility:** The application will support both light and dark themes to accommodate user
  preferences and different lighting conditions.

## 4. Assumptions

- All users will have access to a modern web browser and a stable internet connection.
- The initial version will not include native mobile applications for iOS or Android.
- Each church client is responsible for its own user management and data entry.
