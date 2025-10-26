# Database Schema

## 1. Introduction

This document outlines the database schema for the Church Management SaaS Platform. It is designed
for a multi-church client environment with strict data isolation via a `churchId` on all relevant
tables.

---

## 2. Core Tables

### Table: `churches`

- `id` (UUID, Primary Key)
- `name` (Text, Not Null)
- `logoUrl` (Text)
- `brandColor` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `users`

- `id` (UUID, Primary Key)
- `email` (Text, Not Null, Unique)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `profiles`

- `id` (UUID, Primary Key)
- `userId` (UUID, FK -> `users.id`, Not Null)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `householdId` (UUID, FK -> `households.id`)
- `roleId` (UUID, FK -> `roles.id`, Not Null)
- `firstName` (Text, Not Null)
- `lastName` (Text, Not Null)
- `phone` (Text)
- `address` (Text)
- `birthday` (Date)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

## 3. Configuration Tables

### Table: `roles`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `isSystemRole` (Boolean, Not Null, Default: false)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `custom_profile_fields`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `type` (Enum: 'Text', 'Date', 'Boolean', Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `custom_profile_field_values`

- `profileId` (UUID, FK -> `profiles.id`, Primary Key)
- `fieldId` (UUID, FK -> `custom_profile_fields.id`, Primary Key)
- `value` (Text, Not Null)

### Table: `group_types`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `checkin_locations`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

## 4. Feature Tables

### 4.1. Onboarding and Invitations

### Table: `invitations`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `email` (Text, Not Null)
- `roleId` (UUID, FK -> `roles.id`, Not Null)
- `invitationToken` (Text, Unique, Not Null)
- `expiresAt` (Timestamp, Not Null)
- `status` (Enum: 'Pending', 'Accepted', 'Expired', Not Null, Default: 'Pending')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 4.2. Document Library

### Table: `documents`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `uploaderProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `fileName` (Text, Not Null)
- `fileType` (Text)
- `storageKey` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `document_permissions` (Join Table)

- `documentId` (UUID, FK -> `documents.id`, Primary Key)
- `roleId` (UUID, FK -> `roles.id`, Primary Key)

### 4.3. Households and Children

### Table: `households`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `children`

- `id` (UUID, Primary Key)
- `householdId` (UUID, FK -> `households.id`, Not Null)
- `fullName` (Text, Not Null)
- `dateOfBirth` (Date, Not Null)
- `allergies` (Text)
- `medicalNotes` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 4.4. Groups and Ministries

### Table: `groups`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `groupTypeId` (UUID, FK -> `group_types.id`, Not Null)
- `name` (Text, Not Null)
- `description` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `group_members` (Join Table)

- `profileId` (UUID, FK -> `profiles.id`, Primary Key)
- `groupId` (UUID, FK -> `groups.id`, Primary Key)
- `roleInGroup` (Enum: 'Leader', 'Member', Not Null, Default: 'Member')
- `joinedAt` (Timestamp, Not Null)

### Table: `group_resources`

- `id` (UUID, Primary Key)
- `groupId` (UUID, FK -> `groups.id`, Not Null)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `title` (Text, Not Null)
- `url` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 4.5. Events and Attendance

### Table: `events`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `groupId` (UUID, FK -> `groups.id`)
- `title` (Text, Not Null)
- `description` (Text)
- `startAt` (Timestamp, Not Null)
- `endAt` (Timestamp, Not Null)
- `location` (Text)
- `visibility` (Enum: 'public', 'private', Default: 'private')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `attendances`

- `id` (UUID, Primary Key)
- `eventId` (UUID, FK -> `events.id`, Not Null)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `status` (Enum: 'Present', 'Absent', 'Late')
- `note` (Text)
- `recordedByProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 4.6. Giving and Contributions

### Table: `funds`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `isArchived` (Boolean, Not Null, Default: false)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `contributions`

- `id` (UUID, Primary Key)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `fundId` (UUID, FK -> `funds.id`, Not Null)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `amount` (Decimal, Not Null)
- `date` (Date, Not Null)
- `method` (Enum: 'Cash', 'BankTransfer', 'Other')
- `note` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 4.7. Announcements

### Table: `announcements`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `authorProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `title` (Text, Not Null)
- `body` (Text)
- `publishAt` (Timestamp, Not Null)
- `expireAt` (Timestamp)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `announcement_audiences` (Join Table)

- `announcementId` (UUID, FK -> `announcements.id`, Primary Key)
- `groupId` (UUID, FK -> `groups.id`, Primary Key)

### 4.8. Pastoral Care, Prayer, and Requests

### Table: `request_types`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `isEnabled` (Boolean, Not Null, Default: true)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `prayer_requests`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `profileId` (UUID, FK -> `profiles.id`)
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `isAnonymous` (Boolean, Not Null, Default: false)
- `status` (Enum: 'PendingApproval', 'Approved', 'Answered', 'Denied')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `requests`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `requestorProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `assigneeProfileId` (UUID, FK -> `profiles.id`)
- `requestTypeId` (UUID, FK -> `request_types.id`)
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `priority` (Enum: 'Low', 'Normal', 'High', 'Urgent')
- `status` (Enum: 'Pending', 'InProgress', 'Closed')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)
