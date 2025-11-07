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

### 2.4. How to Customize Your Theme Preferences

The Church Management System allows you to personalize your visual experience by selecting your preferred color theme and dark mode setting. Your theme preferences are saved to your account and will persist across all your devices and browser sessions.

#### Accessing Theme Settings

To customize your theme:

1. Click your profile menu in the top-right corner of the page
2. Select **Settings** from the dropdown menu
3. You will see the **User Preferences** section at the top of the settings page
4. Find the **Theme Preferences** card within this section

#### Choosing a Theme Preset

The system offers four carefully designed theme presets, each optimized for readability and accessibility:

**Original (Default)**
- A clean, professional design with emerald green accents
- Balanced colors suitable for all-day use
- Recommended for users who prefer subtle, understated styling

**Vibrant Blue**
- Bold blue accents with high visual impact
- Energetic and modern appearance
- Ideal for users who prefer stronger color contrast

**Teal Accent**
- Calming teal tones with a contemporary feel
- Softer than Vibrant Blue while maintaining visual interest
- Great for reducing eye strain during extended sessions

**Warm Accent**
- Orange and amber tones for a welcoming atmosphere
- Friendly and approachable visual style
- Perfect for users who prefer warmer color palettes

To select a theme:

1. View the theme preview cards displaying each color scheme
2. Each card shows three color swatches representing the theme's color palette:
   - **Background color** (left swatch)
   - **Primary action color** (middle swatch)
   - **Alert/destructive color** (right swatch)
3. Click on any theme card to select it
4. The theme will apply immediately across the entire application
5. Your selection is automatically saved to your account

#### Dark Mode

Independent of your color theme choice, you can toggle between light and dark modes:

- **Light Mode:** Traditional bright background with dark text (default)
- **Dark Mode:** Dark background with light text, reducing eye strain in low-light environments

The dark mode toggle is located in the top navigation bar (next to the search bar). Click the moon/sun icon to switch between modes. Your preference is saved automatically.

**How Dark Mode Works with Themes:**
- Each theme preset has been designed to work beautifully in both light and dark modes
- The color swatches in the theme preview cards update in real-time to show how each theme looks in your current dark mode setting
- You can freely switch between light and dark modes without losing your theme preference

#### Theme Persistence

Your theme preferences are stored in your user account and will:

- Apply automatically whenever you log in
- Sync across all devices where you access the system
- Persist across browser sessions (even after closing your browser)
- Remain active even if your device's system-level dark mode preference changes

**Note for New Users:** If you haven't selected a theme yet, the system will use the "Original" theme with your device's system-level dark mode preference.

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

### 3.5. How to Manage Pastoral Care Tickets

The **Pastoral Care** system provides a confidential way for church staff to manage sensitive matters and support needs. This feature is only available to users with Administrator or Leader roles.

#### Creating Pastoral Care Tickets

1. Navigate to the **Pastoral Care** page from the main menu.
2. Click the **"New Ticket"** button (only visible to staff/admin users).
3. Fill out the ticket form with:
   - **Title:** A brief summary of the matter
   - **Description:** Detailed information about the situation
   - **Priority:** Set the urgency level (Low, Normal, High, Urgent)
4. Click **"Create Ticket"** to submit the confidential ticket.

#### Managing Pastoral Care Tickets

1. From the **Pastoral Care** dashboard, you can view all tickets and their current status.
2. Click on any ticket to view its details and add comments for internal staff communication.
3. Update ticket status as you work on resolving the matter.
4. All pastoral care tickets are completely confidential and only visible to staff members.

### 3.6. How to Use the Event Check-in System

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

### 3.7. How to Manage Roles and Permissions

Roles and permissions are central to how the Church Management System controls access to features and information. A **role** defines a set of responsibilities or access rights (such as "Administrator," "Group Leader," or "Member"), while **permissions** determine what actions users in each role can perform—like managing events, viewing giving records, or editing group memberships. Administrators can create custom roles tailored to their church's needs and assign them to members, ensuring that everyone has the appropriate level of access and responsibility.

#### Archiving and Recovering Roles

Roles can be archived when no longer needed while preserving historical data:

- **Archive a Role:** From the roles management page, click "Archive Role" to remove it from active role assignments.
- **View Archived Roles:** Check the "Show archived roles" option to see roles that have been archived.
- **Recover a Role:** Administrators can recover archived roles to make them available for assignment again.

### 3.8. How to Manage Group Resources

Church administrators and group leaders can share useful resources (links to articles, videos, study materials, etc.) with their small groups.

#### Adding Resources to a Group

1. Navigate to the **Groups** page and click on a specific group to view its details.
2. In the "Resources" section, click the "Add Resource" button.
3. Enter a descriptive title for the resource.
4. Provide the URL of the resource.
5. Click "Save" to add the resource to the group.

#### Managing Group Resources

- **View Resources:** All group members can see the list of shared resources on the group details page.
- **Edit Resources:** Group leaders and administrators can edit resource titles and URLs by clicking the edit icon next to each resource.
- **Delete Resources:** Resources can be removed by clicking the delete icon. This action is restricted to group leaders and administrators.
- **Access Resources:** Click on any resource title to open the link in a new browser tab.

Resources are automatically organized by group, ensuring that each small group has access to its own relevant materials while maintaining separation between different groups.

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
