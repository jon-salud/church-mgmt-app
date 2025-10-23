# Database Schema

## 1. Introduction

This document outlines the database schema for the Church Management SaaS Platform. The design is based on a relational model to ensure data integrity and is optimized for a multi-church client environment. Every table that contains client-specific data includes a `churchId` column to enforce strict data isolation.

---

## 2. Core Tables

These tables form the foundation of the user and client management system.

### Table: `churches`
Stores the information for each church client.
- `id` (UUID, Primary Key)
- `name` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

### Table: `users`
Stores the core login identity for each individual across the entire platform.
- `id` (UUID, Primary Key)
- `email` (Text, Not Null, Unique)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

### Table: `profiles`
Stores the church-specific profile for a user.
- `id` (UUID, Primary Key)
- `userId` (UUID, FK -> `users.id`, Not Null)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `householdId` (UUID, FK -> `households.id`) - *Optional link to a household.*
- `firstName` (Text, Not Null)
- `lastName` (Text, Not Null)
- `role` (Enum: 'Admin', 'Leader', 'Member', Not Null)
- `phone` (Text)
- `address` (Text)
- `birthday` (Date)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

## 3. Configuration Tables

These tables allow administrators to customize the application for their church's specific needs.

### Table: `custom_profile_fields`
Defines a custom field that can be applied to member profiles.
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null) - e.g., "Baptism Date"
- `type` (Enum: 'Text', 'Date', 'Boolean', Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `custom_profile_field_values`
Stores the value of a custom field for a specific member profile.
- `profileId` (UUID, FK -> `profiles.id`, Primary Key)
- `fieldId` (UUID, FK -> `custom_profile_fields.id`, Primary Key)
- `value` (Text, Not Null) - *The value is stored as text and cast to the correct type in the application layer.*

### Table: `group_types`
Stores the admin-configurable types for groups.
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null) - e.g., "Discipleship Group"
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `checkin_locations`
Stores the admin-configurable locations for child check-in.
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null) - e.g., "Nursery (Ages 0-2)"
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

---

## 4. Feature Tables

### 4.1. Households and Children

### Table: `households`
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `children`
- `id` (UUID, Primary Key)
- `householdId` (UUID, FK -> `households.id`, Not Null)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `fullName` (Text, Not Null)
- `dateOfBirth` (Date)
- `allergies` (Text)
- `medicalNotes` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 4.2. Groups and Ministries

### Table: `groups`
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `groupTypeId` (UUID, FK -> `group_types.id`, Not Null) - *Links to the configurable group type.*
- `name` (Text, Not Null)
- `description` (Text)
- `meetingDay` (Enum: 'Sunday', 'Monday', etc.)
- `meetingTime` (Time)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `group_members` (Join Table)
- `profileId` (UUID, FK -> `profiles.id`, Primary Key)
- `groupId` (UUID, FK -> `groups.id`, Primary Key)
- `roleInGroup` (Enum: 'Leader', 'Member', Not Null, Default: 'Member')

### 4.3. Events and Attendance

### Table: `events`
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `groupId` (UUID, FK -> `groups.id`) - *Optional link to a specific group.*
- `title` (Text, Not Null)
- `description` (Text)
- `startAt` (Timestamp, Not Null)
- `endAt` (Timestamp, Not Null)
- `location` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `attendance`
- `id` (UUID, Primary Key)
- `eventId` (UUID, FK -> `events.id`, Not Null)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `profileId` (UUID, FK -> `profiles.id`) - *Used for adult attendance.*
- `childId` (UUID, FK -> `children.id`) - *Used for child check-in.*
- `checkinLocationId` (UUID, FK -> `checkin_locations.id`) - *Optional link to a specific check-in room.*
- `status` (Enum: 'CheckedIn', 'Absent', 'Excused', Not Null)
- `note` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 4.4. Giving and Contributions

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

### 4.5. Announcements

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

### 4.6. Pastoral Care, Prayer, and Requests

### Table: `request_types`
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `isBuiltIn` (Boolean, Not Null, Default: false)
- `isEnabled` (Boolean, Not Null, Default: true)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `prayer_requests`
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `profileId` (UUID, FK -> `profiles.id`) - *Null if anonymous.*
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `isAnonymous` (Boolean, Not Null, Default: false)
- `status` (Enum: 'PendingApproval', 'Approved', 'Answered', 'Denied')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `pastoral_care_tickets`
- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `requestorProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `assigneeProfileId` (UUID, FK -> `profiles.id`)
- `requestTypeId` (UUID, FK -> `request_types.id`)
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `priority` (Enum: 'Low', 'Normal', 'High', 'Urgent')
- `status` (Enum: 'New', 'InProgress', 'Resolved')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)
