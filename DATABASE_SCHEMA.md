# Database Schema

## 1. Introduction
This document outlines the database schema for the Church Management SaaS Platform, designed for a multi-church client environment with strict data isolation via a `churchId` on relevant tables.

---

## 2. Core Tables

### Table: `churches`
- `id` (UUID, PK), `name` (Text), `createdAt`, `updatedAt`

### Table: `users`
- `id` (UUID, PK), `email` (Text, Unique), `createdAt`, `updatedAt`

### Table: `profiles`
- `id` (UUID, PK), `userId` (UUID, FK->`users`), `churchId` (UUID, FK->`churches`), `householdId` (UUID, FK->`households`), `firstName`, `lastName`, `role`, `phone`, `address`, `birthday`, `createdAt`, `updatedAt`

---

## 3. Configuration Tables

### Table: `custom_profile_fields`
- `id` (UUID, PK), `churchId` (UUID, FK->`churches`), `name`, `type` (Enum: 'Text', 'Date', 'Boolean')

### Table: `custom_profile_field_values`
- `profileId` (UUID, FK->`profiles`, PK), `fieldId` (UUID, FK->`custom_profile_fields`, PK), `value` (Text)

### Table: `group_types`
- `id` (UUID, PK), `churchId` (UUID, FK->`churches`), `name`

### Table: `checkin_locations`
- `id` (UUID, PK), `churchId` (UUID, FK->`churches`), `name`

### Table: `roles`
Stores admin-configurable roles for a church.
- `id` (UUID, PK)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `isSystemRole` (Boolean, Default: false)

---

## 4. Feature Tables

### 4.1. Onboarding and Invitations

### Table: `invitations`
Stores pending invitations for new users to join a church.
- `id` (UUID, PK)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `email` (Text, Not Null)
- `roleId` (UUID, FK -> `roles.id`, Not Null)
- `invitationToken` (Text, Unique, Not Null)
- `expiresAt` (Timestamp, Not Null)
- `status` (Enum: 'Pending', 'Accepted', 'Expired', Default: 'Pending')

### 4.2. Document Library

### Table: `documents`
Stores metadata for uploaded files.
- `id` (UUID, PK)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `uploaderProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `fileName` (Text, Not Null)
- `fileType` (Text)
- `storageKey` (Text, Not Null) - *The unique key for the file in the object storage (e.g., S3 key).*
- `createdAt`, `updatedAt`

### Table: `document_permissions` (Join Table)
Connects documents to roles to control visibility.
- `documentId` (UUID, FK -> `documents.id`, PK)
- `roleId` (UUID, FK -> `roles.id`, PK)

### 4.3. Households and Children
- **`households`**: `id` (PK), `churchId`, `name`
- **`children`**: `id` (PK), `householdId`, `churchId`, `fullName`, `dateOfBirth`, `allergies`, `medicalNotes`

### 4.4. Groups and Ministries
- **`groups`**: `id` (PK), `churchId`, `groupTypeId` (FK->`group_types`), `name`, `description`
- **`group_members`**: `profileId` (FK->`profiles`, PK), `groupId` (FK->`groups`, PK), `roleInGroup`

### 4.5. Events and Attendance
- **`events`**: `id` (PK), `churchId`, `groupId` (FK->`groups`), `title`, `startAt`, `endAt`, `location`
- **`attendance`**: `id` (PK), `eventId`, `churchId`, `profileId` (FK->`profiles`), `childId` (FK->`children`), `checkinLocationId` (FK->`checkin_locations`), `status`

### 4.6. Giving and Contributions
- **`funds`**: `id` (PK), `churchId`, `name`, `isArchived`
- **`contributions`**: `id` (PK), `profileId` (FK->`profiles`), `fundId` (FK->`funds`), `churchId`, `amount`, `date`, `method`

### 4.7. Announcements
- **`announcements`**: `id` (PK), `churchId`, `authorProfileId`, `title`, `body`, `publishAt`
- **`announcement_audiences`**: `announcementId` (FK->`announcements`, PK), `groupId` (FK->`groups`, PK)

### 4.8. Pastoral Care, Prayer, and Requests
- **`request_types`**: `id` (PK), `churchId`, `name`, `isEnabled`
- **`prayer_requests`**: `id` (PK), `churchId`, `profileId` (FK->`profiles`), `title`, `isAnonymous`, `status`
- **`pastoral_care_tickets`**: `id` (PK), `churchId`, `requestorProfileId`, `assigneeProfileId`, `requestTypeId`, `title`, `priority`, `status`
