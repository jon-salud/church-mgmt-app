# API Documentation

This document provides a comprehensive overview of the Church Management System API.

## 1. Overview

The Church Management System API is a RESTful API that provides access to the core features of the platform. It is designed to be used by the frontend web application and any future third-party integrators.

**Base URL:** `/api/v1`

## 2. Authentication

The API is protected and requires an authenticated session. All requests must include a valid session cookie. The `@CurrentUser` decorator provides the user context, and all data is automatically scoped by the user's `churchId`.

---

## 3. API Endpoints

### Member Management

This section covers endpoints related to managing user and member profiles.

---

#### GET /users
- **Description:** Retrieves a list of all users for the church. Can be filtered by a search query.
- **Query Parameters:**
  - `q` (string, optional): A search term to filter users by name or email.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**
    ```json
    [
      {
        "id": "user-uuid-1",
        "primaryEmail": "member1@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "status": "active",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
    ```
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

---

#### GET /users/:id
- **Description:** Retrieves a single user profile by their unique ID.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the user.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**
    ```json
    {
      "id": "user-uuid-1",
      "primaryEmail": "member1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "123-456-7890",
      "address": "123 Main St",
      "notes": "Some notes about the member.",
      "status": "active",
      "roleIds": ["role-uuid-1"],
      "membershipStatus": "Active Member",
      "joinDate": "2023-01-15T00:00:00.000Z"
    }
    ```
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `404 Not Found` - If a user with the specified ID does not exist.

---

#### POST /users
- **Description:** Creates a new user. This is an admin-only endpoint.
- **Request Body:**
  ```json
  {
    "primaryEmail": "string (required, email, max: 255)",
    "firstName": "string (required, max: 100)",
    "lastName": "string (required, max: 100)",
    "phone": "string (optional, max: 50)",
    "address": "string (optional, max: 255)",
    "notes": "string (optional, max: 500)",
    "status": "string (optional, enum: 'active', 'invited')",
    "roleIds": "string[] (optional, array of role UUIDs)"
  }
  ```
- **Success Response:**
  - **Code:** `201 Created`
  - **Content:** The newly created user object.
- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body is missing required fields or contains invalid data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the authenticated user is not an admin.

---

#### PATCH /users/:id
- **Description:** Updates an existing user's profile. This is an admin-only endpoint. All fields are optional.
- **URL Parameters:**
  - `id` (string, required): The unique identifier of the user to update.
- **Request Body:**
  ```json
  {
    "primaryEmail": "string (email, max: 255)",
    "firstName": "string (max: 100)",
    "lastName": "string (max: 100)",
    "phone": "string (max: 50)",
    "address": "string (max: 255)",
    "notes": "string (max: 500)",
    "status": "string (enum: 'active', 'invited')",
    "roleIds": "string[] (array of role UUIDs)",
    "membershipStatus": "string (max: 50)",
    "joinMethod": "string (max: 50)",
    "joinDate": "string (date-time)",
    "onboardingComplete": "boolean"
  }
  ```
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** The updated user object.
- **Error Responses:**
  - **Code:** `400 Bad Request` - If the request body contains invalid data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
  - **Code:** `403 Forbidden` - If the authenticated user is not an admin.
  - **Code:** `404 Not Found` - If a user with the specified ID does not exist.

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
- **Description:** Retrieves a list of all prayer requests for the church.
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**
    ```json
    [
      {
        "id": "prayer-1",
        "churchId": "church-acc",
        "title": "Healing for my mother",
        "description": "Please pray for my mother, who is battling a serious illness. Pray for strength, comfort, and complete healing.",
        "authorName": "John D.",
        "isAnonymous": false,
        "createdAt": "2025-10-18T10:00:00.000Z"
      }
    ]
    ```
- **Error Responses:**
  - **Code:** `401 Unauthorized` - If the user is not authenticated.

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
  - **Code:** `400 Bad Request` - If the request body is missing required fields or contains invalid data.
  - **Code:** `401 Unauthorized` - If the user is not authenticated.
