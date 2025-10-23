# Business Requirements Document: Church Management Application

## 1. Introduction

This document outlines the business requirements for the Church Management Application, a modern, secure, and user-friendly platform designed to streamline church operations and enhance community engagement. The application provides a centralized system for managing member information, organizing groups and events, facilitating communication, and tracking key administrative tasks.

## 2. Vision

The vision for the Church Management Application is to empower churches with a lightweight, accessible, and comprehensive tool that supports their ministry and operational needs. By providing a modern, API-first platform with a progressive web application (PWA), the application aims to be a central hub for church administration and community interaction, accessible from any device.

## 3. User Roles and Permissions

The application supports multiple church clients and provides a flexible role-based access control system to ensure that users have appropriate access to information and functionality. The following roles are defined by default:

*   **Admin:** This role is for church administrative staff and provides full access to all features within their church's instance of the application. Admins can manage members, groups, events, announcements, and giving records. They can also configure roles and permissions for other users.

*   **Leader:** This role is for individuals who lead groups or ministries within the church. Leaders have all the permissions of a Member, and in addition, they can manage the members of their assigned groups and record attendance for events associated with their groups.

*   **Member:** This is the default role for all users. Members can view their own profile, see announcements, RSVP to events, and view the groups they are a part of.

Church Admins have the ability to create, edit, and delete custom roles to fit their specific needs. The system-protected "Admin" role, however, cannot be modified or deleted, ensuring that there is always at least one user with full administrative privileges.

## 4. Core Features

The Church Management Application is comprised of several key features designed to meet the diverse needs of a church community:

### 4.1. Member Directory and Household Management

A centralized directory for managing all member information. Admins can create, edit, and search for members, while individual members can view and update their own profiles. The system also supports a household data model, allowing for the grouping of family members and providing a more holistic view of the church community.

### 4.2. Groups and Ministries

This feature enables the creation and management of various groups within the church, such as small groups, volunteer teams, and ministry departments. Leaders can manage their group's membership, and members can view the rosters of the groups they belong to. The system supports different types of groups, including:

*   Geographical Ministry
*   Service Ministry
*   Volunteer Team
*   Small Group

### 4.3. Events and Attendance

Create and manage church events, from services to social gatherings. Admins and Leaders can create events, and members can view event details. The system also includes functionality for recording attendance, allowing for accurate tracking of event participation.

### 4.4. Announcements and Communication

A simple yet effective tool for one-to-many communication. Admins can post announcements that are visible to all members or target specific groups. Members can view these announcements in an in-app feed, ensuring they stay informed about the latest news and updates.

### 4.5. Giving and Contribution Tracking

A secure and straightforward system for manually recording and tracking member giving. Admins can record contributions, manage different funds (e.g., General, Missions), and generate reports. Members can view their own giving history, providing them with a personal record of their contributions.

### 4.6. Pastoral Care and Prayer Requests

This feature provides a dedicated space for spiritual support and care. It includes a public prayer wall where members can submit and view prayer requests, as well as a confidential system for submitting pastoral care requests directly to the church staff. The pastoral care system allows staff to manage and track these requests, ensuring that every need is addressed.

### 4.7. Child Check-In and Safety

A comprehensive feature designed to ensure the safety and security of children during church events and services. Parents or guardians can manage their children's information, including allergies and medical notes. The system provides a secure check-in and check-out process, with real-time tracking and notifications for parents.

### 4.8. Unified Request Form

A centralized form that allows members to submit various types of requests, such as prayer requests, benevolence requests, or general inquiries. This streamlines the request process and ensures that all requests are routed to the appropriate staff for review and follow-up.

### 4.9. User-Friendly Interface and Theming

The application features a modern and intuitive interface with support for both light and dark themes. The navigation is designed to be user-friendly, with icons and clear labels to help users quickly find the information they need. All interactive elements are designed to be easily identifiable and accessible, ensuring a positive user experience.

## 5. High-Level Technical Overview

The Church Management Application is built using a modern, robust, and scalable technology stack to ensure a high-quality user experience and long-term maintainability.

*   **Architecture:** The application is built with an "API-first" approach, which means that the backend (the "engine" of the application) is separate from the frontend (the user interface). This allows for greater flexibility and scalability, and makes it easier to develop future mobile applications that can connect to the same engine.

*   **Backend:** The backend is powered by NestJS, a modern and efficient framework for building reliable server-side applications. It uses a PostgreSQL database, a powerful and trusted open-source database, to store all of the application's data.

*   **Frontend:** The user interface is a Progressive Web Application (PWA) built with Next.js and React. This means that it can be accessed like a normal website, but can also be "installed" on a user's phone or computer for a more app-like experience, including some offline capabilities.

*   **Security:** Security is a top priority. The application uses modern authentication methods, including social logins with Google and Facebook, to ensure that user accounts are secure. All data is protected both in transit and at rest, and the system is designed to comply with privacy best practices.
