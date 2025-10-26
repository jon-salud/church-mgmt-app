# Church Management System: User Manual

## 1. Introduction

Welcome to the Church Management System! This manual is your guide to using the platform, whether
you are a Church Administrator responsible for managing your church's community or a Member looking
to connect and engage. Our goal is to provide you with an intuitive and powerful set of tools to
streamline church operations and enhance your ministry.

## 2. Getting Started

### 2.1. Logging In

To access the Church Management System, you must first authenticate using one of the available login methods:

- **OAuth Login:** Click "Continue with Google" or "Continue with Facebook" to sign in using your existing social media accounts. This is the recommended method for production use.
- **Demo Mode:** For testing and exploration, click the "Explore demo mode" button to access the system with a pre-configured administrator account.

Once authenticated, you will be redirected to the main dashboard. If you were trying to access a specific page before logging in, you will be automatically redirected there after authentication.

### 2.2. First-Time Setup (New Administrators)

If you are logging in as a new church administrator for the first time, you will see an onboarding wizard modal that guides you through the initial setup of your church management system. This modal includes:

- **Welcome & Branding:** Set up your church logo and brand colors
- **Define Roles:** Configure roles for your church members
- **Invite Core Team:** Add your key team members
- **Import Members:** Bulk import your church members

You can skip any step by clicking "Skip for now" or complete the entire setup process. The wizard will only appear once - after completion, `onboardingComplete` is set to `true` and won't show again.

### 2.3. Main Dashboard

When you log in for the first time, you will be greeted by the main dashboard, which provides a
quick overview of key church activities. The main navigation menu on the left side of the screen is
your primary tool for accessing all the features described in this manual.

---

## 3. For Church Administrators

This section details the features and administrative functions available to users with the
**Administrator** role.

### 3.1. How to Manage Members and Households

The **Member Directory** is your central hub for all community data. Here, you can:

- View a complete list of all members and their households.
- Manually add new members or create new household groups to reflect family structures.
- Click on any member to view their profile, edit their information, or assign them to a different
  household.

#### Archiving and Recovering Members

The system uses "soft delete" functionality to preserve data integrity and maintain audit trails. Instead of permanently deleting members, you can archive them:

- **Archive a Member:** From the member detail page, click "Archive Member" to remove them from active lists while preserving all their data and relationships.
- **View Archived Members:** Check the "Show archived members" checkbox to see members who have been archived.
- **Recover a Member:** For archived members, click the "Recover" button to restore them to active status. This action is only available to administrators.

### 3.2. How to Configure Application Settings

You have the ability to customize parts of the application to fit your church's specific needs.

- **Custom Member Fields:** In the settings area, you can define additional data fields for member
  profiles. For example, you could add a "Baptism Date" field or a checkbox to indicate a "Volunteer
  Interest." These fields will then be available for all member records.
- **Custom Request Types:** You can define the types of requests that members can submit. To do
  this, navigate to the **Settings > Request Types** page. Here, you can create new types (e.g.,
  "Pastoral Visit," "Building Maintenance") or disable existing ones.

### 3.3. How to Moderate the Prayer Wall

To ensure the Prayer Wall remains a safe and supportive space, all prayer requests must be reviewed
before they are made public.

1. Navigate to the **Prayer > Moderation** page.
2. Here, you will see a list of all prayer requests that are pending approval.
3. For each request, you can review the content and choose to either **Approve** or **Deny** it.
4. Approved requests will immediately become visible to all members on the main Prayer Wall.

### 3.4. How to Manage and Track General Requests

The **Requests** dashboard is your tool for managing all non-prayer-related submissions from
members.

1. From the dashboard, you can see a list of all requests and their current status (`Pending`,
   `In Progress`, or `Closed`).
2. Click on a request to view its details.
3. You can assign the request to a specific staff member to delegate responsibility.
4. As you work on the request, be sure to update its status so that everyone is aware of its
   progress.

### 3.5. How to Use the Event Check-in System

The **Check-in** feature allows you to track attendance for any church event, from Sunday services
to classes and small groups.

- The **Check-in Dashboard** provides a high-level overview of attendance trends.
- The system is designed to be simple: as members arrive at an event, you can quickly and easily
  mark them as "Checked-in," providing valuable data for your church's planning and outreach
  efforts.

#### Managing Events with Archive Functionality

Events can be archived instead of permanently deleted to maintain historical records:

- **Archive an Event:** From the events page, click "Archive Event" to remove it from active event lists while preserving all attendance data.
- **View Archived Events:** Use the event filters to show archived events.
- **Recover an Event:** Administrators can recover archived events to make them active again.

### 3.6. How to Manage Roles and Permissions

The system allows you to define custom roles for your church members with specific permissions.

#### Archiving and Recovering Roles

Roles can be archived when no longer needed while preserving historical data:

- **Archive a Role:** From the roles management page, click "Archive Role" to remove it from active role assignments.
- **View Archived Roles:** Check the "Show archived roles" option to see roles that have been archived.
- **Recover a Role:** Administrators can recover archived roles to make them available for assignment again.

## 4. For Members

This section is for all church members. It explains how you can use the platform to manage your
information and engage with the church community.

### 4.1. How to Manage Your Personal Profile

- From the main menu, click on your name or profile icon to access your personal profile.
- Here, you can update your contact information (phone, address), add a profile picture, and fill in
  any other fields that your church administrator has made available. Keeping your profile
  up-to-date helps church staff stay connected with you.

### 4.2. How to Submit a Prayer Request

1. Navigate to the **Prayer** page.
2. Click the "New Prayer Request" button to open the submission form.
3. Fill in a title and the details of your prayer request.
4. If you wish for your request to be anonymous, check the **"Submit Anonymously"** box.
5. Once submitted, your request will be sent to the church administrators for review before it is
   posted on the Prayer Wall.

### 4.3. How to View the Prayer Wall

Navigate to the **Prayer** page to view the public Prayer Wall. Here, you can see all the prayer
requests that have been approved by the church staff.

### 4.4. How to Submit Other Types of Requests

If you need to contact church staff for any reason, you can use the general request system.

1. Navigate to the **Requests** page and click "New Request."
2. Select the appropriate **Request Type** from the dropdown menu.
3. Provide a clear title and a detailed description of your request.
4. After submitting, you can return to this page to check the status of your request.
