# Church Management App - API Reference

This document provides a quick reference for the Church Management App API endpoints.

## Base URL

```text
http://localhost:3001/api/v1
```

## Authentication

The demo uses automatic authentication with the `demo-admin` token. No manual login required.

## Core Endpoints

### Dashboard

- `GET /dashboard/summary` - Church overview statistics
- `GET /dashboard/overview` - Detailed dashboard data

### Members & Users

- `GET /users` - List all church members
- `GET /users/:id` - Get specific member details
- `POST /users` - Create new member
- `PATCH /users/:id` - Update member information
- `DELETE /users/:id` - Remove member

### Households

- `GET /households` - List all households
- `GET /households/:id` - Get household details
- `POST /households` - Create new household

### Groups & Ministries

- `GET /groups` - List all groups
- `GET /groups/:id` - Get group details
- `GET /groups/:id/members` - Get group members
- `POST /groups/:id/members` - Add member to group
- `PATCH /groups/:groupId/members/:userId` - Update member role
- `DELETE /groups/:groupId/members/:userId` - Remove member from group

### Events

- `GET /events` - List all events
- `GET /events/:id` - Get event details
- `POST /events` - Create new event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/:id/attendance` - Record attendance
- `GET /events/:id/attendance.csv` - Export attendance as CSV

### Announcements

- `GET /announcements` - List announcements
- `POST /announcements` - Create announcement
- `PATCH /announcements/:id` - Update announcement
- `POST /announcements/:id/read` - Mark as read

### Pastoral Care

- `GET /pastoral-care/tickets` - List care tickets
- `POST /pastoral-care/tickets` - Create new ticket
- `GET /pastoral-care/tickets/:id` - Get ticket details
- `PATCH /pastoral-care/tickets/:id` - Update ticket
- `POST /pastoral-care/tickets/:id/comments` - Add comment

### Prayer Requests

- `GET /prayer/requests` - List prayer requests
- `POST /prayer/requests` - Submit prayer request

### Child Check-in

- `POST /checkin/children` - Register new child
- `GET /checkin/households/:householdId/children` - Get household children
- `PATCH /checkin/children/:id` - Update child info
- `DELETE /checkin/children/:id` - Remove child
- `POST /checkin/app/initiate` - Parent app check-in initiation
- `POST /checkin/table/initiate` - Volunteer table check-in
- `POST /checkin/confirm` - Volunteer confirmation of check-in
- `POST /checkin/tag/print` - Mark tag as printed
- `GET /checkin` - View current check-ins with status
- `GET /checkin/pending` - Get pending confirmations
- `GET /checkin/overdue` - Get overdue confirmations
- `POST /checkin/checkout/initiate` - Volunteer checkout initiation
- `POST /checkin/checkout/confirm` - Parent confirmation of checkout
- `GET /checkin/emergency/:childId` - Get emergency contact info (volunteer only)
- `POST /checkin/notifications/send` - Send notifications for check-in events
- `GET /checkin/settings` - Get check-in configuration settings
- `PUT /checkin/settings` - Update check-in configuration settings

### Giving & Finances

- `GET /giving/funds` - List giving funds
- `GET /giving/contributions` - List contributions
- `POST /giving/contributions` - Record contribution
- `PATCH /giving/contributions/:id` - Update contribution
- `GET /giving/reports/summary` - Financial summary
- `GET /giving/contributions.csv` - Export contributions

### Settings & Administration

- `GET /settings/:churchId` - Get church settings
- `PUT /settings/:churchId` - Update settings
- `GET /settings/:churchId/request-types` - Get request types
- `POST /settings/:churchId/request-types` - Add request type
- `PUT /settings/:churchId/request-types/:id` - Update request type
- `DELETE /settings/:churchId/request-types/:id` - Delete request type

### Roles & Permissions

- `GET /roles` - List user roles
- `POST /roles` - Create new role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

### Audit & Monitoring

- `GET /audit` - View audit logs
- `GET /metrics` - System metrics

### Trustee Governance

- `GET /governance/dashboard` - Governance dashboard data
- `GET /governance/documents` - List governance documents
- `POST /governance/documents/:id/acknowledge` - Acknowledge document
- `GET /governance/approvals` - List approval requests
- `POST /governance/approvals/:id/vote` - Submit approval vote

### Coordinator Volunteer Management

- `GET /volunteers/availability` - Get volunteer availability
- `PUT /volunteers/availability` - Update personal availability
- `GET /scheduling/templates` - List scheduling templates
- `POST /scheduling/generate` - Generate volunteer assignments

### Leader Ministry Dashboards

- `GET /leaders/dashboard` - Ministry dashboard data
- `GET /leaders/tasks` - Assigned tasks
- `POST /leaders/tasks/:id/update` - Update task status
- `POST /pastoral-notes` - Create pastoral note

### Member Experience Enhancement

- `GET /notifications` - User notifications
- `PUT /notifications/preferences` - Update notification preferences
- `GET /events/recommendations` - Event recommendations
- `GET /serving/opportunities` - Serving opportunities

### Visitor Conversion Funnel

- `POST /visitors/register` - Register visitor
- `GET /visitors/interactions` - Visitor interaction history
- `POST /visitors/:id/interaction` - Record visitor interaction
- `POST /visitors/:id/convert` - Convert visitor to member
- `GET /nurture/workflows` - List nurture workflows
- `POST /nurture/enroll` - Enroll visitor in workflow

## Data Formats

All API responses use JSON format. Request bodies should be JSON for POST/PATCH/PUT operations.

### Success Response

```json
{
  "data": { ... },
  "message": "Success",
  "statusCode": 200
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Interactive Documentation

For a complete interactive API reference with request/response examples:

**Visit: <http://localhost:3001/docs>**

This Swagger UI interface allows you to:

- Browse all endpoints
- See request/response schemas
- Test API calls directly
- View authentication details

## Mock Data

All endpoints work with realistic mock data, so you can test any functionality without affecting
real data. The mock database includes:

- 50+ church members
- Multiple households and families
- 10+ active groups and ministries
- Upcoming events and services
- Sample announcements and prayer requests
- Complete financial contribution history
- Child check-in records

## Development

The API is built with:

- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **OpenAPI/Swagger** - API documentation
- **Mock Database** - In-memory data store for demo

For production deployment, the app can be configured to use PostgreSQL with Prisma ORM.
