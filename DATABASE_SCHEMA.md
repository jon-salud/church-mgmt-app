# Database Schema

## 1. Introduction

This document outlines the database schema for the Church Management SaaS Platform. The design is based on a relational model to ensure data integrity and is optimized for a multi-church client environment. Every table that contains client-specific data includes a `churchId` column to enforce strict data isolation.

---

## 2. Core Tables

These tables form the foundation of the user and client management system.

### Table: `churches`
Stores the information for each church client. This is the top-level table for data isolation.
- `id` (UUID, Primary Key)
- `name` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

### Table: `users`
Stores the core login identity for each individual across the entire platform. This table contains no church-specific data.
- `id` (UUID, Primary Key)
- `email` (Text, Not Null, Unique)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

### Table: `profiles`
Stores the personal, church-specific information related to a user. A single user can have profiles in multiple churches, allowing them to be part of different communities with one login.
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key -> `users.id`, Not Null) - *Links to the core user login.*
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null) - *Ensures data is scoped to the correct church.*
- `householdId` (UUID, Foreign Key -> `households.id`) - *Optional link to a household.*
- `firstName` (Text, Not Null)
- `lastName` (Text, Not Null)
- `role` (Enum: 'Admin', 'Leader', 'Member', Not Null)
- `phone` (Text)
- `address` (Text)
- `birthday` (Date)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

## 3. Feature Tables

### 3.1. Households and Children

### Table: `households`
Represents a family unit within a church.
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `name` (Text, Not Null) - e.g., "The Smith Family"
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `children`
Stores information about children, linked to a household for parental management.
- `id` (UUID, Primary Key)
- `householdId` (UUID, Foreign Key -> `households.id`, Not Null)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `fullName` (Text, Not Null)
- `dateOfBirth` (Date)
- `allergies` (Text)
- `medicalNotes` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 3.2. Groups and Ministries

### Table: `groups`
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `description` (Text)
- `type` (Enum: 'GeographicalMinistry', 'ServiceMinistry', 'VolunteerTeam', 'SmallGroup', 'Other')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `group_members` (Join Table)
Connects profiles to groups, establishing a many-to-many relationship.
- `profileId` (UUID, Foreign Key -> `profiles.id`, Primary Key)
- `groupId` (UUID, Foreign Key -> `groups.id`, Primary Key)
- `roleInGroup` (Enum: 'Leader', 'Member', Not Null, Default: 'Member')

### 3.3. Events and Attendance

### Table: `events`
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `groupId` (UUID, Foreign Key -> `groups.id`) - *Optional link to a specific group.*
- `title` (Text, Not Null)
- `description` (Text)
- `startAt` (Timestamp, Not Null)
- `endAt` (Timestamp, Not Null)
- `location` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `attendance`
- `id` (UUID, Primary Key)
- `eventId` (UUID, Foreign Key -> `events.id`, Not Null)
- `profileId` (UUID, Foreign Key -> `profiles.id`, Not Null)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `status` (Enum: 'CheckedIn', 'Absent', 'Excused', Not Null)
- `note` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 3.4. Giving and Contributions

### Table: `funds`
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `isArchived` (Boolean, Not Null, Default: false)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `contributions`
- `id` (UUID, Primary Key)
- `profileId` (UUID, Foreign Key -> `profiles.id`, Not Null)
- `fundId` (UUID, Foreign Key -> `funds.id`, Not Null)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `amount` (Decimal, Not Null)
- `date` (Date, Not Null)
- `method` (Enum: 'Cash', 'BankTransfer', 'Other')
- `note` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 3.5. Announcements

### Table: `announcements`
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `authorProfileId` (UUID, Foreign Key -> `profiles.id`, Not Null)
- `title` (Text, Not Null)
- `body` (Text)
- `publishAt` (Timestamp, Not Null)
- `expireAt` (Timestamp)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `announcement_audiences` (Join Table)
Connects announcements to groups to target specific audiences. If an announcement is for 'All Members', this table would have no entries for that announcement.
- `announcementId` (UUID, Foreign Key -> `announcements.id`, Primary Key)
- `groupId` (UUID, Foreign Key -> `groups.id`, Primary Key)

### 3.6. Pastoral Care, Prayer, and Requests

### Table: `request_types`
Stores the admin-configurable types for the unified request form.
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `isBuiltIn` (Boolean, Not Null, Default: false)
- `isEnabled` (Boolean, Not Null, Default: true)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `prayer_requests`
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `profileId` (UUID, Foreign Key -> `profiles.id`) - *Null if anonymous.*
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `isAnonymous` (Boolean, Not Null, Default: false)
- `status` (Enum: 'PendingApproval', 'Approved', 'Answered', 'Denied')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `pastoral_care_tickets`
- `id` (UUID, Primary Key)
- `churchId` (UUID, Foreign Key -> `churches.id`, Not Null)
- `requestorProfileId` (UUID, Foreign Key -> `profiles.id`, Not Null)
- `assigneeProfileId` (UUID, Foreign Key -> `profiles.id`)
- `requestTypeId` (UUID, Foreign Key -> `request_types.id`)
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `priority` (Enum: 'Low', 'Normal', 'High', 'Urgent')
- `status` (Enum: 'New', 'InProgress', 'Resolved')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)
