# API Documentation

This document provides a comprehensive overview of the Church Management System API.

## 1. Overview

The Church Management System API is a RESTful API that provides access to the core features of the
platform. It is designed to be used by the frontend web application and any future third-party
integrators.

**Base URL:** `/api/v1`

## 2. Authentication

The API is protected and requires an authenticated session. All requests must include a valid
session cookie. The `@CurrentUser` decorator provides the user context, and all data is
automatically scoped by the user's `churchId`.

## 3. Configuration

### Environment Variables

The API behavior can be configured through environment variables:

- **DATA_MODE:** Controls the data storage backend
  - `mock` (default): Uses in-memory mock data for development and testing
  - `memory`: Uses high-performance in-memory data store for fast testing scenarios
  - `prisma`: Uses PostgreSQL database with Prisma ORM for production

---

## 4. API Endpoints

### Member & User Management

This section covers endpoints related to managing user and member profiles. The API distinguishes
between a `User` (the login identity) and a `Profile` (the church-specific member record).

---

#### GET /users

- **Description:** Retrieves a list of all member profiles for the church.
- **Query Parameters:**
  - `q` (string, optional): A search term to filter members by name.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    [
      {
        "id": "profile-uuid-1",
        "userId": "user-uuid-1",
        "churchId": "church-uuid-1",
        "roleId": "role-uuid-1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "member1@example.com",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

#### GET /users/:id

- **Description:** Retrieves a single member profile by their unique profile ID.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the member's profile.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "id": "profile-uuid-1",
      "userId": "user-uuid-1",
      "churchId": "church-uuid-1",
      "householdId": "household-uuid-1",
      "roleId": "role-uuid-1",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "123-456-7890",
      "address": "123 Main St",
      "birthday": "1990-01-15",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `404 Not Found` - If a profile with the specified ID does not exist.

---

#### POST /users

- **Description:** Creates a new user and their associated member profile. (Admin only)
- **Request Body:**

  ```json
  {
    "email": "string (required, email)",
    "firstName": "string (required)",
    "lastName": "string (required)",
    "roleId": "string (required, UUID)",
    "phone": "string (optional)",
    "address": "string (optional)",
    "birthday": "string (optional, YYYY-MM-DD)"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created profile object.
- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body is missing required fields or contains invalid
    data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

### Groups

_(Note: The following endpoints are planned based on the Functional Requirements but are not yet
implemented in the API.)_

---

### Households

This section covers endpoints for managing household records in the church management system.

---

#### GET /households

- **Description:** Retrieves a list of all active households for the church.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    [
      {
        "id": "household-uuid-1",
        "churchId": "church-uuid-1",
        "name": "Smith Family",
        "address": "123 Main St",
        "memberCount": 4,
        "members": [...],
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

#### GET /households/:id

- **Description:** Retrieves a single household by ID.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the household.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Single household object with members array.
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `404 Not Found` - If household does not exist.

---

#### GET /households/deleted

- **Description:** Retrieves a list of all soft-deleted (archived) households. **Requires Admin or Leader role.**
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of deleted household objects with `deletedAt` timestamp.
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.

---

#### DELETE /households/:id

- **Description:** Soft deletes a household, setting its `deletedAt` timestamp. The household is archived and excluded from default queries. **Requires Admin or Leader role.**
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the household to delete.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "id": "household-uuid-1",
      "deletedAt": "2024-11-04T10:30:00Z",
      "name": "Smith Family",
      ...
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.
  - **Code:** `404 Not Found` - If household does not exist or is already deleted.

---

#### POST /households/:id/undelete

- **Description:** Restores a soft-deleted household by clearing its `deletedAt` timestamp. **Requires Admin or Leader role.**
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the household to restore.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "id": "household-uuid-1",
      "deletedAt": null,
      "name": "Smith Family",
      ...
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.
  - **Code:** `404 Not Found` - If household does not exist or is not deleted.

---

#### POST /households/bulk-delete

- **Description:** Soft deletes multiple households in a single operation. **Requires Admin or Leader role.**
- **Request Body:**

  ```json
  {
    "householdIds": ["household-uuid-1", "household-uuid-2", "household-uuid-3"]
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "successCount": 2,
      "failedCount": 1,
      "errors": [
        {
          "id": "household-uuid-3",
          "error": "Household not found"
        }
      ]
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.
  - **Code:** `400 Bad Request` - If request body is invalid.

---

#### POST /households/bulk-undelete

- **Description:** Restores multiple soft-deleted households in a single operation. **Requires Admin or Leader role.**
- **Request Body:**

  ```json
  {
    "householdIds": ["household-uuid-1", "household-uuid-2"]
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "successCount": 2,
      "failedCount": 0,
      "errors": []
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.

---

### Events & Check-in

This section covers endpoints for children check-in management.

---

#### GET /checkin/children

- **Description:** Retrieves a list of all active children for a household.
- **Query Parameters:**
  - `householdId` (string, optional): Filter children by household ID.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of active child objects (excludes soft-deleted children).
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

#### GET /checkin/children/:id

- **Description:** Retrieves a single child by ID.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the child.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Single child object with household information.
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `404 Not Found` - If child does not exist.

---

#### GET /checkin/children/deleted

- **Description:** Retrieves a list of all soft-deleted (archived) children. **Requires Admin or Leader role.**
- **Query Parameters:**
  - `householdId` (string, optional): Filter deleted children by household ID.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of deleted child objects with `deletedAt` timestamp.
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.

---

#### DELETE /checkin/children/:id

- **Description:** Soft deletes a child, setting its `deletedAt` timestamp. The child is archived and excluded from check-in flows and default queries. **Requires Admin or Leader role.**
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the child to delete.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "id": "child-uuid-1",
      "deletedAt": "2024-11-04T10:30:00Z",
      "fullName": "Johnny Smith",
      ...
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.
  - **Code:** `404 Not Found` - If child does not exist or is already deleted.

---

#### POST /checkin/children/:id/undelete

- **Description:** Restores a soft-deleted child by clearing its `deletedAt` timestamp. **Requires Admin or Leader role.**
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the child to restore.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "id": "child-uuid-1",
      "deletedAt": null,
      "fullName": "Johnny Smith",
      ...
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.
  - **Code:** `404 Not Found` - If child does not exist or is not deleted.

---

#### POST /checkin/children/bulk-delete

- **Description:** Soft deletes multiple children in a single operation. **Requires Admin or Leader role.**
- **Request Body:**

  ```json
  {
    "childIds": ["child-uuid-1", "child-uuid-2", "child-uuid-3"]
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "successCount": 2,
      "failedCount": 1,
      "errors": [
        {
          "id": "child-uuid-3",
          "error": "Child not found"
        }
      ]
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.
  - **Code:** `400 Bad Request` - If request body is invalid.

---

#### POST /checkin/children/bulk-undelete

- **Description:** Restores multiple soft-deleted children in a single operation. **Requires Admin or Leader role.**
- **Request Body:**

  ```json
  {
    "childIds": ["child-uuid-1", "child-uuid-2"]
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "successCount": 2,
      "failedCount": 0,
      "errors": []
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an Admin or Leader.

---

- **Code:** `403 Forbidden` - If the authenticated user is not an admin.

---

#### PATCH /users/:id

- **Description:** Updates an existing member's profile. (Admin only)
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the profile to update.
- **Request Body:**

  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "roleId": "string (UUID)",
    "phone": "string",
    "address": "string",
    "birthday": "string (YYYY-MM-DD)"
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The updated profile object.
- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body contains invalid data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the authenticated user is not an admin.
  - **Code:** `404 Not Found` - If a profile with the specified ID does not exist.

---

#### DELETE /users/:id

- **Description:** Archives a user (soft delete) instead of permanently deleting them. This preserves data integrity and allows for recovery. This is an admin-only endpoint.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the user to archive.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "success": true,
      "message": "User archived successfully"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the authenticated user is not an admin.
  - **Code:** `404 Not Found` - If a user with the specified ID does not exist.

#### POST /users/:id/recover

- **Description:** Recovers an archived user, restoring them to active status. This is an admin-only endpoint.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the user to recover.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "success": true,
      "message": "User recovered successfully"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the authenticated user is not an admin.
  - **Code:** `404 Not Found` - If a user with the specified ID does not exist or is not archived.

---

### Prayer Requests

This section covers endpoints related to prayer requests.

---

#### GET /prayer/requests

- **Description:** Retrieves a list of all approved prayer requests for the church. _(Note: The
  implemented path is `/prayer/requests`. The path `/prayer-requests` is planned for future
  convention alignment.)_
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    [
      {
        "id": "prayer-1",
        "churchId": "church-acc",
        "profileId": "user-profile-uuid",
        "title": "Healing for my mother",
        "description": "Please pray for my mother, who is battling a serious illness. Pray for strength, comfort, and complete healing.",
        "isAnonymous": false,
        "status": "Approved",
        "createdAt": "2025-10-18T10:00:00.000Z"
      }
    ]
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

#### POST /prayer/requests

- **Description:** Creates a new prayer request. It will be in a `PendingApproval` state until
  reviewed by an admin.
- **Request Body:**

  ```json
  {
    "title": "string (required)",
    "description": "string (required)",
    "isAnonymous": "boolean (optional, default: false)"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created prayer request object.
- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body is missing required fields or contains invalid
    data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

### Document Library

#### GET /documents

- **Description:** Retrieves a list of documents the user has permission to view based on their assigned roles.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    [
      {
        "id": "doc-1",
        "churchId": "church-acc",
        "uploaderProfileId": "user-admin",
        "fileName": "church-bylaws.pdf",
        "fileType": "application/pdf",
        "title": "Church Bylaws 2024",
        "description": "Official church bylaws and governance documents",
        "storageKey": "documents/church-bylaws.pdf",
        "createdAt": "2025-09-27T09:00:00.000Z",
        "updatedAt": "2025-09-27T09:00:00.000Z"
      }
    ]
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

#### GET /documents/:id

- **Description:** Retrieves details for a specific document including its permissions.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "id": "doc-1",
      "churchId": "church-acc",
      "uploaderProfileId": "user-admin",
      "fileName": "church-bylaws.pdf",
      "fileType": "application/pdf",
      "title": "Church Bylaws 2024",
      "description": "Official church bylaws and governance documents",
      "storageKey": "documents/church-bylaws.pdf",
      "createdAt": "2025-09-27T09:00:00.000Z",
      "updatedAt": "2025-09-27T09:00:00.000Z",
      "permissions": ["role-admin"]
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `404 Not Found` - If the document does not exist or user lacks permission.

---

#### GET /documents/:id/download-url

- **Description:** Generates a time-limited download URL for a document (valid for 1 hour).
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "url": "/api/v1/documents/doc-1/download?token=abc123...",
      "expiresAt": "2025-10-26T20:37:00.000Z"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `404 Not Found` - If the document does not exist or user lacks permission.

---

#### GET /documents/:id/download

- **Description:** Downloads the document file.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content-Type:** `application/octet-stream`
  - **Headers:** `Content-Disposition: attachment; filename="document.pdf"`

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `404 Not Found` - If the document does not exist or user lacks permission.

---

#### POST /documents

- **Description:** Uploads a new document with metadata and role-based permissions (Admin only).
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file` (file, required): The document file to upload
  - `title` (string, required, max 200 chars): Document title
  - `description` (string, optional, max 1000 chars): Document description
  - `roleIds` (JSON array, required): Array of role IDs that can view this document

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created document object

- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request is invalid or file size exceeds 10MB.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an admin.

---

#### PATCH /documents/:id

- **Description:** Updates document metadata and permissions (Admin only).
- **Request Body:**

  ```json
  {
    "title": "string (optional, max 200 chars)",
    "description": "string (optional, max 1000 chars)",
    "roleIds": ["role-id-1", "role-id-2"]
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The updated document object

- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body contains invalid data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an admin.
  - **Code:** `404 Not Found` - If the document does not exist.

---

#### DELETE /documents/:id

- **Description:** Archives a document (soft delete, Admin only).
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "success": true,
      "message": "Document archived"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an admin.
  - **Code:** `404 Not Found` - If the document does not exist.

---

#### GET /documents/deleted

- **Description:** Lists all archived documents (Admin only).
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of archived document objects

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an admin.

---

#### POST /documents/:id/undelete

- **Description:** Restores an archived document (Admin only).
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "success": true,
      "message": "Document restored"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an admin.
  - **Code:** `404 Not Found` - If the document does not exist or is not deleted.

---

#### DELETE /documents/:id/hard

- **Description:** Permanently deletes a document (Admin only, cannot be undone).
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "success": true,
      "message": "Document permanently deleted"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the user is not an admin.
  - **Code:** `404 Not Found` - If the document does not exist.

---

### General Requests

This section covers endpoints related to general requests.

---

#### GET /requests

- **Description:** Retrieves a list of all general requests for the church.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    [
      {
        "id": "req-1",
        "churchId": "church-acc",
        "userId": "user-member-1",
        "requestTypeId": "req-type-1",
        "title": "Building maintenance issue",
        "body": "The light in the main hall is flickering.",
        "isConfidential": false,
        "createdAt": "2025-10-20T14:00:00.000Z"
      }
    ]
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

#### POST /requests

- **Description:** Creates a new general request.
- **Request Body:**

  ```json
  {
    "requestTypeId": "string (required)",
    "title": "string (required)",
    "body": "string (required)",
    "isConfidential": "boolean (optional)"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created request object.
- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body is missing required fields or contains invalid
    data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

## 4. Pastoral Care

This section covers endpoints related to confidential pastoral care ticket management for church staff.

### Pastoral Care Tickets

#### GET /pastoral-care/tickets

- **Description:** Retrieves a list of all pastoral care tickets for the church. (Staff/Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    [
      {
        "id": "ticket-uuid",
        "churchId": "church-uuid",
        "authorId": "user-uuid",
        "assigneeId": "user-uuid",
        "title": "Confidential pastoral matter",
        "description": "Detailed description of the pastoral care need",
        "status": "NEW|ASSIGNED|IN_PROGRESS|RESOLVED",
        "priority": "LOW|NORMAL|HIGH|URGENT",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
    ```

#### POST /pastoral-care/tickets

- **Description:** Creates a new pastoral care ticket. (Staff/Admin only)
- **Request Body:**

  ```json
  {
    "title": "string (required)",
    "description": "string (required)",
    "priority": "LOW|NORMAL|HIGH|URGENT (optional, defaults to NORMAL)"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created pastoral care ticket object.

#### GET /pastoral-care/tickets/:id

- **Description:** Retrieves a specific pastoral care ticket by ID. (Staff/Admin only)
- **URL Parameters:**
  - `id`: The UUID of the pastoral care ticket
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The pastoral care ticket object with full details.

#### PATCH /pastoral-care/tickets/:id

- **Description:** Updates a pastoral care ticket. (Staff/Admin only)
- **URL Parameters:**
  - `id`: The UUID of the pastoral care ticket
- **Request Body:**

  ```json
  {
    "status": "NEW|ASSIGNED|IN_PROGRESS|RESOLVED (optional)",
    "priority": "LOW|NORMAL|HIGH|URGENT (optional)",
    "assigneeId": "user-uuid (optional)"
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The updated pastoral care ticket object.

### Pastoral Care Comments

#### POST /pastoral-care/tickets/:id/comments

- **Description:** Adds a comment to a pastoral care ticket. (Staff/Admin only)
- **URL Parameters:**
  - `id`: The UUID of the pastoral care ticket
- **Request Body:**

  ```json
  {
    "body": "string (required)"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created comment object.

---

## 5. Events and Volunteer Management

This section covers endpoints related to managing church events and volunteer coordination.

### Events

#### GET /events

- **Description:** Retrieves a list of all events for the church.
- **Query Parameters:**
  - None
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    [
      {
        "id": "event-uuid-1",
        "churchId": "church-uuid-1",
        "title": "Sunday Service",
        "description": "Weekly worship service",
        "startAt": "2025-01-01T10:00:00Z",
        "endAt": "2025-01-01T11:30:00Z",
        "location": "Main Sanctuary",
        "visibility": "public",
        "groupId": null,
        "volunteerRoles": [
          {
            "id": "role-uuid-1",
            "name": "Usher",
            "needed": 4,
            "signups": [
              {
                "id": "signup-uuid-1",
                "userId": "user-uuid-1",
                "user": {
                  "id": "user-uuid-1",
                  "email": "member@example.com"
                }
              }
            ]
          }
        ],
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
    ```

#### POST /events

- **Description:** Creates a new event.
- **Request Body:**

  ```json
  {
    "title": "string (required)",
    "description": "string (optional)",
    "startAt": "ISO 8601 timestamp (required)",
    "endAt": "ISO 8601 timestamp (required)",
    "location": "string (optional)",
    "visibility": "public|private (optional, default: private)",
    "groupId": "UUID (optional)"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created event object.

#### PATCH /events/:id

- **Description:** Updates an existing event.
- **Request Body:** Same as POST, all fields optional.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The updated event object.

#### DELETE /events/:id

- **Description:** Archives an event (soft delete) instead of permanently deleting it. This preserves attendance data and allows for recovery.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Success response with archived event ID.

#### POST /events/:id/recover

- **Description:** Recovers an archived event, restoring it to active status. This is an admin-only endpoint.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the event to recover.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "success": true,
      "message": "Event recovered successfully"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the authenticated user is not an admin.
  - **Code:** `404 Not Found` - If an event with the specified ID does not exist or is not archived.

### Volunteer Roles

#### POST /events/:eventId/volunteer-roles

- **Description:** Creates a volunteer role for an event. (Admin only)
- **Request Body:**

  ```json
  {
    "name": "string (required)",
    "needed": "integer (required, min: 1)"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created volunteer role object.

#### PATCH /events/volunteer-roles/:roleId

- **Description:** Updates a volunteer role. (Admin only)
- **Request Body:**

  ```json
  {
    "name": "string (optional)",
    "needed": "integer (optional, min: 1)"
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The updated volunteer role object.

#### DELETE /events/volunteer-roles/:roleId

- **Description:** Deletes a volunteer role. (Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Success response.

### Volunteer Signups

#### POST /events/volunteer-roles/:roleId/signups

- **Description:** Signs up the authenticated user for a volunteer role.
- **Request Body:** None (user is determined from authentication)
- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created signup object.

#### DELETE /events/volunteer-signups/:signupId

- **Description:** Cancels a volunteer signup. (Owner or Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Success response.

### Attendance

#### POST /events/:id/attendance

- **Description:** Records attendance for an event.
- **Request Body:**

  ```json
  {
    "userId": "UUID (required)",
    "status": "Present|Absent|Late (required)",
    "note": "string (optional)"
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The attendance record.

#### GET /events/:id/attendance.csv

- **Description:** Exports attendance data as CSV. (Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content-Type:** `text/csv`
  - **Content:** CSV file with attendance data.

---

## Persona-Specific Endpoints

### Trustee Governance

#### GET /governance/dashboard

- **Description:** Retrieves governance dashboard data including compliance reports, document acknowledgments, and approval statuses. (Trustee/Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "complianceReports": [...],
      "pendingApprovals": [...],
      "documentAcknowledgments": [...],
      "recentActivity": [...]
    }
    ```

#### GET /governance/documents

- **Description:** Lists governance documents with acknowledgment status. (Trustee/Admin only)
- **Query Parameters:**
  - `type` (string, optional): Filter by document type
  - `acknowledged` (boolean, optional): Filter by acknowledgment status
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of governance documents.

#### POST /governance/documents/:id/acknowledge

- **Description:** Records acknowledgment of a governance document. (Trustee only)
- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** Acknowledgment record.

#### GET /governance/approvals

- **Description:** Lists governance approvals requiring trustee action. (Trustee/Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of approval requests.

#### POST /governance/approvals/:id/vote

- **Description:** Submits a vote on a governance approval. (Trustee only)
- **Request Body:**

  ```json
  {
    "vote": "Approve|Reject|Abstain",
    "comments": "Optional comments"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** Vote record.

### Coordinator Volunteer Management

#### GET /volunteers/availability

- **Description:** Retrieves volunteer availability for scheduling. (Coordinator/Admin only)
- **Query Parameters:**
  - `eventId` (UUID, optional): Filter by event
  - `dateRange` (string, optional): Date range filter
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of volunteer availability records.

#### PUT /volunteers/availability

- **Description:** Updates volunteer availability. (Member only)
- **Request Body:**

  ```json
  {
    "dayOfWeek": 0,
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true,
    "notes": "Optional notes"
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Updated availability record.

#### GET /scheduling/templates

- **Description:** Lists scheduling templates for events. (Coordinator/Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of scheduling templates.

#### POST /scheduling/generate

- **Description:** Generates volunteer assignments based on template and availability. (Coordinator/Admin only)
- **Request Body:**

  ```json
  {
    "eventId": "uuid",
    "templateId": "uuid",
    "date": "2025-01-01"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** Generated assignments.

### Leader Ministry Dashboards

#### GET /leaders/dashboard

- **Description:** Retrieves ministry-specific dashboard data. (Leader only)
- **Query Parameters:**
  - `scope` (string, optional): Ministry scope filter
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "careRequests": [...],
      "attendanceTrends": [...],
      "engagementSignals": [...],
      "assignedTasks": [...]
    }
    ```

#### GET /leaders/tasks

- **Description:** Lists tasks assigned to the leader. (Leader only)
- **Query Parameters:**
  - `status` (string, optional): Filter by task status
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of assigned tasks.

#### POST /leaders/tasks/:id/update

- **Description:** Updates task status and adds notes. (Leader only)
- **Request Body:**

  ```json
  {
    "status": "InProgress|Completed",
    "notes": "Optional update notes"
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Updated task.

#### POST /pastoral-notes

- **Description:** Creates a pastoral note for a member. (Leader only)
- **Request Body:**

  ```json
  {
    "subjectProfileId": "uuid",
    "noteType": "Care|Discipleship|Counseling|Administrative",
    "content": "Note content",
    "isConfidential": false,
    "followUpDate": "2025-01-15T10:00:00Z"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** Created pastoral note.

### Member Experience Enhancement

#### GET /notifications

- **Description:** Retrieves user notifications. (Authenticated users)
- **Query Parameters:**
  - `unreadOnly` (boolean, optional): Filter to unread notifications
  - `category` (string, optional): Filter by category
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of notifications.

#### PUT /notifications/preferences

- **Description:** Updates notification preferences. (Authenticated users)
- **Request Body:**

  ```json
  {
    "channel": "Email|SMS|Push",
    "category": "Events|Announcements|Requests|Groups|Giving",
    "isEnabled": true,
    "frequency": "Immediate|Daily|Weekly|None"
  }
  ```

- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Updated preferences.

#### GET /events/recommendations

- **Description:** Retrieves personalized event recommendations. (Members only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of recommended events with scores.

#### GET /serving/opportunities

- **Description:** Lists available serving opportunities. (Members only)
- **Query Parameters:**
  - `eventId` (UUID, optional): Filter by event
  - `skills` (string[], optional): Filter by required skills
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of serving opportunities.

### Visitor Conversion Funnel

#### POST /visitors/register

- **Description:** Registers a visitor for an event or requests information. (Public endpoint)
- **Request Body:**

  ```json
  {
    "email": "visitor@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "eventId": "uuid",
    "source": "Website|Event|Referral",
    "consentGiven": true
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** Visitor record.

#### GET /visitors/interactions

- **Description:** Retrieves visitor interaction history. (Staff/Admin only)
- **Query Parameters:**
  - `visitorId` (UUID, required): Visitor to retrieve interactions for
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of visitor interactions.

#### POST /visitors/:id/interaction

- **Description:** Records a new visitor interaction. (Staff/Admin only)
- **Request Body:**

  ```json
  {
    "interactionType": "PhoneCall|Meeting|EmailOpen",
    "details": {},
    "notes": "Optional notes"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** Interaction record.

#### POST /visitors/:id/convert

- **Description:** Converts a visitor to a full member profile. (Admin only)
- **Request Body:**

  ```json
  {
    "profileData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "member@example.com"
    }
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** New member profile with link to visitor record.

#### GET /nurture/workflows

- **Description:** Lists available nurture workflows. (Staff/Admin only)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Array of nurture workflows.

#### POST /nurture/enroll

- **Description:** Enrolls a visitor in a nurture workflow. (Staff/Admin only)
- **Request Body:**

  ```json
  {
    "visitorId": "uuid",
    "workflowId": "uuid"
  }
  ```

- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** Enrollment record.

---

## Soft Delete Common Behaviors

### Authorization
- Only Admin and Leader roles can perform soft delete operations
- Members can view active records but cannot access archived items
- Attempting soft delete as Member returns 403 Forbidden
- **Exception**: Users module requires Admin role (Leaders cannot soft delete users)

### Filtering
- All list endpoints exclude soft deleted items by default
- Use `/deleted/all` endpoint to retrieve archived items
- GET by ID checks deletedAt and returns 404 if archived
- Query pattern: `WHERE deletedAt IS NULL` for active records

### Cascade Behavior
- Soft delete does NOT cascade to related entities
- Example: Archiving household does NOT archive children
- Warning dialogs appear when archiving items with active dependents
- Users must explicitly archive dependent records
- See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md#11-soft-delete-architecture) for full cascade behavior documentation

### Audit Logging
- All soft delete operations are logged to audit system
- Includes actor, timestamp, entity type, and entity ID
- Both archive and restore actions are audited
- Bulk operations log individual item operations

### Performance
- deletedAt columns are indexed for efficient filtering
- Bulk operations are optimized for large datasets
- Typical performance: <100ms single item, <5s for 100 items
- See [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md) for performance requirements (FR-ARCH-010)

### Related Documentation
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Soft Delete Architecture
- [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md) - FR-ARCH-010
- [BUSINESS_REQUIREMENTS.md](./BUSINESS_REQUIREMENTS.md) - BR-DATA-005

---

**Document Version:** 2.1.0  
**Last Updated:** 5 November 2025  
**Status:** Complete
