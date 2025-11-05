# Database Schema

## 1. Introduction

This document outlines the database schema for the Church Management SaaS Platform. It is designed
for a multi-church client environment with strict data isolation via a `churchId` on all relevant
tables.

**Soft Delete Implementation:** All tables implement soft delete functionality using a `deletedAt`
timestamp field. Records are marked as deleted rather than physically removed to maintain audit
trails and data integrity. Application queries automatically filter out deleted records unless
explicitly querying for audit/compliance purposes.

## 1.1 Soft Delete Architecture

### Overview
All major entities implement soft delete using `deletedAt` TIMESTAMP column.
Records are marked as deleted rather than physically removed to maintain audit trails and data integrity.

### Cascade Behavior
- **No auto-cascade**: Archiving an entity does NOT automatically archive related entities
- **Explicit action required**: Users must manually archive dependents
- **Warning dialogs**: UI shows active dependent counts before archiving
- **Example**: Archiving household does NOT automatically archive children

### Authorization
- **Admin and Leader roles only** can perform soft delete operations
- **Member role** cannot access soft delete functionality
- **Users exception**: Only Admin can soft delete users (not Leaders)
- **Enforced at controller level** using `ensureLeader()` or `ensureAdmin()` guards

### Performance
- **Indexed queries**: All deletedAt columns have B-tree indexes
- **Efficient filtering**: Default queries use `WHERE deletedAt IS NULL`
- **Bulk operations**: Optimized for 100+ item operations
- **Query pattern**: `prisma.findMany({ where: { deletedAt: null } })`

### Affected Tables

The following 9 tables implement soft delete:
- `users` - User accounts
- `events` - Calendar events  
- `groups` - Small groups and communities
- `announcements` - Church announcements
- `contributions` - Giving contributions/transactions
- `funds` - Giving funds/campaigns
- `households` - Family households
- `children` - Child records for check-in
- `documents` - Document library files

### Index Definitions
All soft delete enabled tables have indexes on deletedAt column:
- `@@index([deletedAt])` on all 8 tables in Prisma schema

---

## 2. Core Tables

### Table: `churches`

- `id` (UUID, Primary Key)
- `name` (Text, Not Null)
- `logoUrl` (Text)
- `brandColor` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)
- `deletedAt` (Timestamp)

### Table: `users`

- `id` (UUID, Primary Key)
- `email` (Text, Not Null, Unique)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)
- `deletedAt` (Timestamp)

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
- `deletedAt` (Timestamp)

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
- `deletedAt` (Timestamp)

### 4.3. Households and Children

### Table: `households`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)
- `deletedAt` (Timestamp) - **Soft delete timestamp**. When set, household is archived and excluded from default queries. Admin/Leader authorization required for soft delete operations. Indexed for query performance.

### Table: `children`

- `id` (UUID, Primary Key)
- `householdId` (UUID, FK -> `households.id`, Not Null)
- `fullName` (Text, Not Null)
- `dateOfBirth` (Date, Not Null)
- `allergies` (Text)
- `medicalNotes` (Text)
- `emergencyContactName` (Text)
- `emergencyContactPhone` (Text)
- `authorizedGuardians` (JSON Array of guardian contact info objects. Each object should include:
  - `name` (Text, Not Null): Guardian's full name
  - `phone` (Text, Not Null): Guardian's phone number
  - `relationship` (Text, Not Null): Relationship to child (e.g., 'parent', 'guardian', 'grandparent')
  - `userId` (UUID, Optional): Reference to user account if guardian is a registered user
  - `email` (Text, Optional): Guardian's email address
  - `isPrimary` (Boolean, Default: false): Whether this is the primary contact)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)
- `deletedAt` (Timestamp) - **Soft delete timestamp**. When set, child is archived and excluded from default queries and check-in flows. Admin/Leader authorization required for soft delete operations. Indexed for query performance.

### Table: `checkins`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `eventId` (UUID, FK -> `events.id`, Not Null)
- `childId` (UUID, FK -> `children.id`, Not Null)
- `status` (Enum: 'pending', 'confirmed', 'checked-in', 'checked-out', Not Null)
- `checkinMethod` (Enum: 'app', 'table', Not Null)
- `checkinTime` (Timestamp)
- `confirmedTime` (Timestamp)
- `confirmedBy` (UUID, FK -> `users.id`)
- `checkoutTime` (Timestamp)
- `checkedOutBy` (UUID, FK -> `users.id`)
- `parentConfirmedTime` (Timestamp)
- `confirmationDeadline` (Timestamp)
- `tagPrinted` (Boolean, Default: false)
- `tagPrintedAt` (Timestamp)
- `notificationsSent` (JSON Array of notification records)
  - Each notification record is an object with the following fields:
    - `timestamp` (Timestamp, Not Null): When the notification was sent
    - `type` (Text, Not Null): Type of notification (e.g., 'checkin-reminder', 'confirmation-request')
    - `recipient` (Text, Not Null): Recipient identifier (e.g., user ID, email, or phone number)
    - `status` (Text, Not Null): Status of the notification (e.g., 'sent', 'delivered', 'failed')
    - `channel` (Text, Optional): Channel used (e.g., 'email', 'sms', 'push')
    - `messageId` (Text, Optional): Identifier from the notification provider
    - `error` (Text, Optional): Error message if sending failed
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
- `deletedAt` (Timestamp)

### Table: `group_members` (Join Table)

- `profileId` (UUID, FK -> `profiles.id`, Primary Key)
- `groupId` (UUID, FK -> `groups.id`, Primary Key)
- `roleInGroup` (Enum: 'Leader', 'Member', Not Null, Default: 'Member')
- `joinedAt` (Timestamp, Not Null)
- `deletedAt` (Timestamp)

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
- `deletedAt` (Timestamp)

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

### Table: `pastoral_care_tickets`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `authorId` (UUID, FK -> `users.id`, Not Null)
- `assigneeId` (UUID, FK -> `users.id`)
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `status` (Enum: 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED')
- `priority` (Enum: 'LOW', 'NORMAL', 'HIGH', 'URGENT')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `pastoral_care_comments`

- `id` (UUID, Primary Key)
- `ticketId` (UUID, FK -> `pastoral_care_tickets.id`, Not Null)
- `authorId` (UUID, FK -> `users.id`, Not Null)
- `body` (Text, Not Null)
- `createdAt` (Timestamp, Not Null)

---

## 5. Persona-Specific Tables

### 5.1. Trustee Governance

### Table: `governance_documents`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `title` (Text, Not Null)
- `description` (Text)
- `documentType` (Enum: 'Policy', 'AuditReport', 'MeetingMinutes', 'ComplianceReport')
- `fileUrl` (Text, Not Null)
- `version` (Text, Not Null)
- `isActive` (Boolean, Not Null, Default: true)
- `requiresAcknowledgment` (Boolean, Not Null, Default: false)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `document_acknowledgments`

- `id` (UUID, Primary Key)
- `documentId` (UUID, FK -> `governance_documents.id`, Not Null)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `acknowledgedAt` (Timestamp, Not Null)
- `ipAddress` (Text)
- `userAgent` (Text)

### Table: `governance_approvals`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `title` (Text, Not Null)
- `description` (Text, Not Null)
- `approvalType` (Enum: 'PolicyChange', 'BudgetApproval', 'IncidentReview', 'StrategicDecision')
- `status` (Enum: 'Draft', 'Pending', 'Approved', 'Rejected', 'Expired')
- `initiatorProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `decision` (Text)
- `decisionDate` (Timestamp)
- `expiresAt` (Timestamp)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `approval_votes`

- `id` (UUID, Primary Key)
- `approvalId` (UUID, FK -> `governance_approvals.id`, Not Null)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `vote` (Enum: 'Approve', 'Reject', 'Abstain')
- `comments` (Text)
- `votedAt` (Timestamp, Not Null)

### 5.2. Coordinator Volunteer Management

### Table: `volunteer_availability`

- `id` (UUID, Primary Key)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `dayOfWeek` (Integer, 0-6, Not Null) -- 0 = Sunday
- `startTime` (Time, Not Null)
- `endTime` (Time, Not Null)
- `isAvailable` (Boolean, Not Null, Default: true)
- `notes` (Text)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `volunteer_blackout_dates`

- `id` (UUID, Primary Key)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `startDate` (Date, Not Null)
- `endDate` (Date, Not Null)
- `reason` (Text)
- `createdAt` (Timestamp, Not Null)

### Table: `scheduling_templates`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `description` (Text)
- `eventType` (Text, Not Null) -- e.g., 'SundayService', 'CommunityEvent'
- `isActive` (Boolean, Not Null, Default: true)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `template_assignments`

- `id` (UUID, Primary Key)
- `templateId` (UUID, FK -> `scheduling_templates.id`, Not Null)
- `roleName` (Text, Not Null)
- `requiredCount` (Integer, Not Null)
- `preferredSkills` (Text[]) -- Array of skill requirements
- `createdAt` (Timestamp, Not Null)

### Table: `reminder_configs`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `eventType` (Text, Not Null)
- `reminderType` (Enum: 'Email', 'SMS', 'Push')
- `timing` (Interval, Not Null) -- e.g., '24 hours', '1 week'
- `template` (Text, Not Null)
- `isActive` (Boolean, Not Null, Default: true)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 5.3. Leader Ministry Dashboards

### Table: `ministry_scopes`

- `id` (UUID, Primary Key)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `scopeType` (Enum: 'Group', 'MinistryArea', 'AgeGroup', 'Geographic')
- `scopeValue` (Text, Not Null) -- e.g., group ID, ministry name
- `permissions` (Text[], Not Null) -- Array of allowed actions
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `leader_tasks`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `assigneeProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `assignerProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `title` (Text, Not Null)
- `description` (Text)
- `priority` (Enum: 'Low', 'Normal', 'High', 'Urgent')
- `status` (Enum: 'Assigned', 'InProgress', 'Completed', 'Cancelled')
- `dueDate` (Timestamp)
- `relatedEntityType` (Text) -- e.g., 'Profile', 'Group', 'Event'
- `relatedEntityId` (UUID)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `pastoral_notes`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `subjectProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `authorProfileId` (UUID, FK -> `profiles.id`, Not Null)
- `ministryScopeId` (UUID, FK -> `ministry_scopes.id`)
- `noteType` (Enum: 'Care', 'Discipleship', 'Counseling', 'Administrative')
- `content` (Text, Not Null)
- `isConfidential` (Boolean, Not Null, Default: false)
- `followUpDate` (Timestamp)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `alert_configs`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `alertType` (Enum: 'AttendanceDip', 'UrgentRequest', 'VolunteerGap', 'EngagementChange')
- `threshold` (JSONB, Not Null) -- Flexible configuration for alert conditions
- `isActive` (Boolean, Not Null, Default: true)
- `lastTriggered` (Timestamp)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 5.4. Member Experience Enhancement

### Table: `notification_preferences`

- `id` (UUID, Primary Key)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `channel` (Enum: 'Email', 'SMS', 'Push', Not Null)
- `category` (Enum: 'Events', 'Announcements', 'Requests', 'Groups', 'Giving')
- `isEnabled` (Boolean, Not Null, Default: true)
- `frequency` (Enum: 'Immediate', 'Daily', 'Weekly', 'None')
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `notifications`

- `id` (UUID, Primary Key)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `title` (Text, Not Null)
- `message` (Text, Not Null)
- `category` (Enum: 'Events', 'Announcements', 'Requests', 'Groups', 'Giving')
- `channel` (Enum: 'Email', 'SMS', 'Push', Not Null)
- `isRead` (Boolean, Not Null, Default: false)
- `actionUrl` (Text) -- Optional link to take action
- `sentAt` (Timestamp, Not Null)
- `readAt` (Timestamp)

### Table: `event_recommendations`

- `id` (UUID, Primary Key)
- `profileId` (UUID, FK -> `profiles.id`, Not Null)
- `eventId` (UUID, FK -> `events.id`, Not Null)
- `score` (Decimal, 0-1, Not Null) -- Recommendation confidence score
- `reason` (Text) -- Why this event was recommended
- `isDismissed` (Boolean, Not Null, Default: false)
- `createdAt` (Timestamp, Not Null)

### Table: `serving_opportunities`

- `id` (UUID, Primary Key)
- `eventId` (UUID, FK -> `events.id`, Not Null)
- `roleName` (Text, Not Null)
- `description` (Text)
- `requiredSkills` (Text[])
- `timeCommitment` (Interval)
- `isFilled` (Boolean, Not Null, Default: false)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### 5.5. Visitor Conversion Funnel

### Table: `visitors`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `email` (Text)
- `phone` (Text)
- `firstName` (Text)
- `lastName` (Text)
- `source` (Enum: 'Website', 'Event', 'Referral', 'SocialMedia', 'Other')
- `interestLevel` (Enum: 'Casual', 'Interested', 'Committed', 'Converted')
- `consentGiven` (Boolean, Not Null, Default: false)
- `consentDate` (Timestamp)
- `convertedToProfileId` (UUID, FK -> `profiles.id`) -- Links to member profile after conversion
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `visitor_interactions`

- `id` (UUID, Primary Key)
- `visitorId` (UUID, FK -> `visitors.id`, Not Null)
- `interactionType` (Enum: 'WebsiteVisit', 'EventRSVP', 'EmailOpen', 'FormSubmission', 'PhoneCall', 'Meeting')
- `details` (JSONB) -- Flexible data for different interaction types
- `notes` (Text)
- `staffProfileId` (UUID, FK -> `profiles.id`) -- Staff member who handled interaction
- `createdAt` (Timestamp, Not Null)

### Table: `nurture_workflows`

- `id` (UUID, Primary Key)
- `churchId` (UUID, FK -> `churches.id`, Not Null)
- `name` (Text, Not Null)
- `description` (Text)
- `trigger` (Enum: 'NewVisitor', 'EventInterest', 'FollowUpNeeded', 'Manual')
- `isActive` (Boolean, Not Null, Default: true)
- `createdAt` (Timestamp, Not Null)
- `updatedAt` (Timestamp, Not Null)

### Table: `nurture_steps`

- `id` (UUID, Primary Key)
- `workflowId` (UUID, FK -> `nurture_workflows.id`, Not Null)
- `stepNumber` (Integer, Not Null)
- `actionType` (Enum: 'SendEmail', 'SendSMS', 'ScheduleCall', 'SendResource', 'Wait')
- `delay` (Interval) -- Time to wait before executing this step
- `templateId` (Text) -- Reference to email/SMS template
- `content` (Text) -- For simple actions
- `createdAt` (Timestamp, Not Null)

### Table: `visitor_nurture_enrollments`

- `id` (UUID, Primary Key)
- `visitorId` (UUID, FK -> `visitors.id`, Not Null)
- `workflowId` (UUID, FK -> `nurture_workflows.id`, Not Null)
- `currentStep` (Integer, Not Null)
- `status` (Enum: 'Active', 'Completed', 'Paused', 'Cancelled')
- `enrolledAt` (Timestamp, Not Null)
- `completedAt` (Timestamp)
- `nextActionAt` (Timestamp)

---

## Change Log

### Version 2.1.0 - 5 November 2025
- Completed soft delete implementation across 8 major tables
- Added indexes on deletedAt columns for all affected tables
- No cascade delete behavior - explicit archiving required
- Role-based authorization (Admin/Leader only, Admin-only for Users)
- Complete audit trail for all soft delete operations
- Sprint: Soft Delete Main Sprint (feature/soft-delete-main-sprint)
- Total commits: 486 commits
- Start date: October 18, 2025

### Version 2.0.0 - October 2025
- Initial schema design
- Multi-tenancy implementation with churchId
- Core modules: Users, Events, Groups, Giving, Households, Children
