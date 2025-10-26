# Application Navigation

This document outlines the primary navigation paths for the client-facing `web` application, based
on the features defined in the project's requirements.

## Authentication

All routes in the application require user authentication. Unauthenticated users are automatically
redirected to the login page (`/login`). The login page provides options for OAuth authentication
(Google/Facebook) and a demo mode for testing purposes.

## Core Features

### Member & Community

- **/dashboard**: The main landing page for authenticated users.
- **/members**: The central directory for managing members and households.
- **/groups**: The hub for managing small groups and ministries.

### Engagement & Outreach

- **/prayer**: The public Prayer Wall where members can view and submit prayer requests.
  - **/prayer/moderation**: The dashboard for administrators to approve or deny pending prayer
    requests.
- **/requests**: The unified form for members to submit various types of requests to the church
  staff.
  - **/requests/dashboard**: The dashboard for administrators to manage and track all submitted
    requests.
- **/events**: A calendar or list of upcoming church events and services.

### Administrative & Configuration

- **/checkin/dashboard**: The dashboard for managing child check-ins and monitoring attendance for
  events.
- **/documents**: The Document Library for secure, role-based file sharing.
- **/settings**: The central area for application configuration, including:
  - **/settings/roles**: Manage user roles and permissions.
  - **/settings/request-types**: Configure the types of requests members can submit.
  - **/settings/profile-fields**: Customize the data fields available for member profiles.

### Archive & Recovery

Admin users can access archived (soft-deleted) records for recovery:

- **/members/archived**: View and recover archived member records.
- **/events/archived**: View and recover archived event records.
- **/settings/roles/archived**: View and recover archived role records.

---

## Change Records

### v1.0.0 - Archive Navigation

- **Date**: 2025-10-27
- **Changes**:
  - Added Archive & Recovery section with navigation paths
  - Documented routes for viewing archived members, events, and roles
  - Added admin-only recovery functionality paths
