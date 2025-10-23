# Business Requirements Document: Church Management Application

## 1. Introduction

This document outlines the business requirements for the Church Management Application, a modern, secure, and user-friendly Software-as-a-Service (SaaS) platform designed to streamline church operations and enhance community engagement. The application is capable of hosting multiple church clients, providing each with a centralized system for managing member information, organizing groups and events, facilitating communication, and tracking key administrative tasks.

## 2. Vision

The vision for the Church Management Application is to empower churches with a lightweight, accessible, and comprehensive tool that supports their ministry and operational needs. By providing a modern, API-first platform, the application aims to be a central hub for church administration and community interaction, accessible from any device.

## 3. User Roles and Permissions

The application supports a flexible role-based access control system to ensure that users have appropriate access to information and functionality. The following roles are defined:

### Client-Facing Roles
*   **Admin:** This role is for church administrative staff and provides full access to all features within their church's instance of the application. Admins can manage members, groups, events, announcements, and giving records.
*   **Leader:** This role is for individuals who lead groups or ministries. They have all the permissions of a Member, plus the ability to manage their assigned groups and record attendance.
*   **Member:** This is the default role for all users. Members can view their own profile, see announcements, RSVP to events, and view the groups they belong to.

### System-Level Roles
*   **System Owner / Super Admin:** This role is for the SaaS product owner. This user has access to a separate System Administration application to monitor platform health, manage client accounts, and view platform-wide analytics.

## 4. Core Features

The features of the application are divided based on the intended application.

### 4.A: Client Application Features (for Church Clients)

#### 4.A.1. Member Directory and Household Management
A centralized directory for managing all member information. Admins can create, edit, and search for members, while individual members can view and update their own profiles.

#### 4.A.2. Groups and Ministries
This feature enables the creation and management of various groups within the church, such as small groups, volunteer teams, and ministry departments.

#### 4.A.3. Events and Attendance
Create and manage church events, from services to social gatherings. The system also includes functionality for recording attendance.

#### 4.A.4. Announcements and Communication
A simple tool for one-to-many communication. Admins can post announcements that are visible to all members or target specific groups.

#### 4.A.5. Giving and Contribution Tracking
A secure system for manually recording and tracking member giving. Admins can record contributions, manage funds, and generate reports. Members can view their own giving history.

#### 4.A.6. Pastoral Care and Prayer Requests
This feature provides a dedicated space for spiritual support, including a public prayer wall and a confidential system for submitting pastoral care requests to staff.

#### 4.A.7. Child Check-In and Safety
A comprehensive feature designed to ensure the safety of children during church events, including managing children's information and a secure check-in/check-out process.

#### 4.A.8. Unified Request Form
A centralized form that allows members to submit various types of requests, streamlining the process and ensuring requests are routed appropriately.

#### 4.A.9. Leadership Dashboard and Reporting
The application provides a dashboard for church leadership (Admins) to gain at-a-glance insights into the health of their congregation through graphs and charts visualizing key metrics like membership growth, attendance, and financial health.

#### 4.A.10. Application Configuration
A key strength of the platform is its flexibility. Church administrators have access to a dedicated settings area where they can customize the application to fit their specific needs and terminology. This includes the ability to define custom profile fields, group types, giving funds, request types, and child check-in locations.

#### 4.A.11. Onboarding Wizard
To ensure a smooth setup process for new church clients, the application includes a guided, skippable onboarding wizard for administrators. This wizard helps with initial setup tasks, including church branding, defining roles, inviting the core team, and importing an initial list of member emails to kick-start the community.

#### 4.A.12. Document Library
The application provides a centralized and secure Document Library for each church client. Administrators can upload important documents (e.g., policy manuals, Bible study notes) and use a role-based permission system to control which documents are visible to which user roles (Admins, Leaders, or all Members).

### 4.B: System Administration Features (for the SaaS Owner)

#### 4.B.1. System Owner Dashboard (Observability)
A dedicated dashboard for the System Owner to monitor the health, resource consumption, and activity of the entire SaaS platform. This includes:
*   **Client Resource Overview:** A summary of key metrics per church client, such as member count, data storage usage, active users, and API call volume. This is critical for cost management.
*   **Platform-Wide Trends:** Visualizations of aggregate data, such as total API calls over time, to understand overall platform growth.
*   **Feature Adoption Metrics:** Analytics on which features are most and least used across all clients, providing insights for product strategy.
*   **System Health Monitoring:** High-level technical performance indicators, such as API error rates and response times.

## 5. High-Level Technical Overview

*   **Architecture:** The application follows a dual-frontend approach, as defined in the `ARCHITECTURE.md` document, with a unified backend API.
*   **Backend:** The backend is powered by NestJS and uses a PostgreSQL database.
*   **Frontend:** The client application is a Progressive Web Application (PWA) built with Next.js and React. The system administration application will be a separate Next.js/React application.
*   **Security and Compliance:** Security is a top priority. The system uses modern authentication and is designed to comply with privacy best practices, including the principles of the General Data Protection Regulation (GDPR), providing tools for data export and the "right to be forgotten."
