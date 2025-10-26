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

---

## 3. API Endpoints

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

### Events & Check-in

_(Note: The following endpoints are planned based on the Functional Requirements but are not yet
implemented in the API.)_

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

- **Description:** Deletes a user. This is an admin-only endpoint.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the user to delete.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**

    ```json
    {
      "success": true,
      "message": "User deleted successfully"
    }
    ```

- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the authenticated user is not an admin.
  - **Code:** `404 Not Found` - If a user with the specified ID does not exist.

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

_(Note: The following endpoints are planned based on the Functional Requirements but are not yet
implemented in the API.)_

---

#### GET /documents

- **Description:** Retrieves a list of documents the user has permission to view.

---

#### POST /documents

- **Description:** Uploads a new document. (Admin only)

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

## 4. Events and Volunteer Management

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

- **Description:** Deletes an event.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** Success response with deleted event ID.

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
