# Functional Requirements Document: Church Management Application

## 1. Introduction

This document details the functional requirements for the Church Management Application.

## 📋 Change Record

| Date | Version | Change Description | Author |
|------|---------|-------------------|---------|
| 2025-10-27 | 1.2 | Updated FR-EVT-017 terminology from "delete/remove" to "archive" for consistency | AI Assistant |
| 2025-10-27 | 1.1 | Updated terminology from "delete" to "archive" for soft delete implementation across all entities | AI Assistant |
| 2025-10-27 | 1.0 | Initial document creation | Original Author |

---

## Part A: Client Application (`web`)

---

## A.0. UI/Design System Requirements

These requirements establish the foundational user interface design system that applies across all features and pages in the application.

### A.0.1. Design Token System

- **FR-UI-001:** The system shall use CSS custom properties (CSS variables) for all color tokens to enable consistent theming and dark mode support.
- **FR-UI-002:** Color tokens shall use HSL color space to enable precise lightness adjustments between light and dark themes.
- **FR-UI-003:** Background and card colors shall maintain a minimum 2% lightness difference for visual hierarchy and depth.
- **FR-UI-004:** All semantic colors shall have both light and dark mode variants defined in `web/app/globals.css`.
- **FR-UI-005:** The system shall support five border-radius tokens: sm (0.375rem), default (0.5rem), lg (0.75rem), xl (1rem), and full (9999px).

### A.0.2. Component Variants

- **FR-UI-006:** Button components shall support five distinct variants:
  - `default` - Primary action button (blue background)
  - `outline` - Secondary action with border only
  - `secondary` - Muted action (gray background)
  - `ghost` - Transparent background with hover state
  - `destructive` - Dangerous action (red background)
- **FR-UI-007:** Only one primary (default) button shall appear per page section or form.
- **FR-UI-008:** Card components shall support three elevation levels using Tailwind shadow utilities:
  - `shadow-sm` - Subtle depth for resting cards
  - `shadow-md` - Default card elevation
  - `shadow-lg` - Elevated state for hover or emphasis
- **FR-UI-009:** Modal and overlay components shall use `shadow-xl` for maximum visual depth.
- **FR-UI-010:** Input and Textarea components shall support an optional `error` prop that displays validation error states using Flowbite's `color='failure'` styling.

### A.0.3. Typography System

- **FR-UI-011:** The system shall provide ten typography utility classes spanning from `.heading-display` (text-4xl) to `.caption-text-xs` (text-xs).
- **FR-UI-012:** Typography utilities shall include:
  - Display headings: `heading-display`, `heading-1`, `heading-2`, `heading-3`, `heading-4`, `heading-5`
  - Body text: `body-text`, `body-text-sm`
  - Captions: `caption-text`, `caption-text-xs`
- **FR-UI-013:** All typography classes shall be defined in `web/app/globals.css` with consistent line-height ratios.

### A.0.4. Shadow System

- **FR-UI-014:** The system shall use Tailwind's built-in shadow scale exclusively (no custom CSS shadow variables).
- **FR-UI-015:** Shadow utilities shall be applied according to component elevation hierarchy:
  - Buttons: `shadow-sm`
  - Cards (resting): `shadow-md`
  - Cards (hover): `shadow-lg`
  - Modals/overlays: `shadow-xl`
  - Large dialogs: `shadow-2xl`
- **FR-UI-016:** Interactive elements shall include `transition-shadow duration-200` for smooth elevation changes.

### A.0.5. Dark Mode

- **FR-UI-017:** The application shall detect and respect the user's system-preferred color scheme (light or dark).
- **FR-UI-018:** Users shall be able to manually toggle between light and dark modes, overriding system preference.
- **FR-UI-019:** Dark mode shall be implemented using Tailwind's `dark:` class variants with `darkMode: 'class'` configuration.
- **FR-UI-020:** All design tokens shall have corresponding dark mode values that maintain WCAG 2.1 AA color contrast requirements.
- **FR-UI-021:** Dark mode background/card contrast shall be a minimum 8% lightness difference for visual hierarchy.

### A.0.6. Component Library Integration

- **FR-UI-022:** All UI components shall be located in `web/components/ui-flowbite/` directory.
- **FR-UI-023:** Components shall wrap Flowbite React components while maintaining a consistent API across library migrations.
- **FR-UI-024:** Component wrappers shall accept all standard HTML attributes for their respective elements via props spreading.
- **FR-UI-025:** Components shall use the `cn()` utility function for merging Tailwind classes to allow className overrides.
- **FR-UI-026:** TypeScript strict mode shall be enabled for all component files with no `any` types in public APIs.

### A.0.7. Spacing and Layout

- **FR-UI-027:** The system shall use Tailwind's default spacing scale (0.25rem base unit) for all spacing values.
- **FR-UI-028:** Standard spacing patterns shall be:
  - Card padding: `p-6` (1.5rem) for standard content, `p-4` (1rem) for compact layouts
  - Section spacing: `space-y-6` for standard vertical rhythm, `space-y-4` for tighter groupings
  - Form field spacing: `space-y-4` between fields, `gap-4` for inline field groups
- **FR-UI-029:** Container widths shall use Tailwind's responsive container classes with appropriate breakpoints.
- **FR-UI-030:** Grid layouts shall use Tailwind's grid utilities with responsive column counts (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).

---

## A.0.8. Accessibility (WCAG 2.1 AA Compliance)

These requirements ensure the application meets WCAG 2.1 Level AA accessibility standards for inclusive user experience.

### A.0.8.1. Focus Indicators

- **FR-A11Y-001:** All interactive elements shall display a visible focus indicator when focused via keyboard navigation.
- **FR-A11Y-002:** The universal focus indicator shall be a 2px solid ring using the `--ring` CSS variable with a 2px offset.
- **FR-A11Y-003:** Focus indicators shall be visible in both light and dark modes with sufficient contrast against all backgrounds.
- **FR-A11Y-004:** Custom interactive components shall include explicit focus states using `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- **FR-A11Y-005:** Focus shall never be completely hidden or removed from interactive elements.

### A.0.8.2. Color Contrast

- **FR-A11Y-006:** Normal text (under 18pt or under 14pt bold) shall have a minimum contrast ratio of 4.5:1 against its background.
- **FR-A11Y-007:** Large text (18pt and larger, or 14pt bold and larger) shall have a minimum contrast ratio of 3:1 against its background.
- **FR-A11Y-008:** All design token color pairings shall be verified for WCAG 2.1 AA contrast compliance in both light and dark modes.
- **FR-A11Y-009:** UI components in disabled states shall maintain a minimum contrast ratio of 3:1 to remain perceivable.
- **FR-A11Y-010:** Interactive elements shall not rely on color alone to convey information (e.g., error states shall include icons and text).

### A.0.8.3. Keyboard Navigation

- **FR-A11Y-011:** All interactive functionality shall be operable through keyboard interface without requiring specific timings.
- **FR-A11Y-012:** Tab order shall follow a logical sequence matching the visual layout of the page.
- **FR-A11Y-013:** Modal dialogs shall trap focus within the modal when open, preventing tab navigation to background content.
- **FR-A11Y-014:** Modal dialogs shall return focus to the triggering element upon closing.
- **FR-A11Y-015:** Dropdown menus shall be navigable using arrow keys, with Enter/Space to select and Escape to close.
- **FR-A11Y-016:** Skip links shall be provided to allow keyboard users to bypass repetitive navigation and jump to main content.
- **FR-A11Y-017:** Custom controls (e.g., date pickers, toggles) shall respond to standard keyboard interactions (Enter, Space, Arrow keys, Escape).

### A.0.8.4. Screen Reader Support

- **FR-A11Y-018:** Icon-only buttons shall include ARIA labels to provide text equivalents for screen reader users.
- **FR-A11Y-019:** Form inputs shall be associated with their labels using explicit `htmlFor`/`id` relationships or implicit nesting.
- **FR-A11Y-020:** Error messages shall be associated with their form fields using `aria-describedby`.
- **FR-A11Y-021:** Dynamic content updates (e.g., success messages, loading states) shall use ARIA live regions (`aria-live="polite"` or `aria-live="assertive"`).
- **FR-A11Y-022:** Images shall include descriptive `alt` text; decorative images shall use empty alt attributes (`alt=""`).
- **FR-A11Y-023:** Complex interactive components (e.g., tabs, accordions) shall use appropriate ARIA roles and states.

### A.0.8.5. Semantic HTML

- **FR-A11Y-024:** Pages shall use a proper heading hierarchy (h1, h2, h3, etc.) without skipping levels.
- **FR-A11Y-025:** Each page shall have exactly one h1 element representing the main page title.
- **FR-A11Y-026:** Landmark regions shall be used to structure page layout: `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`.
- **FR-A11Y-027:** Lists shall use appropriate semantic markup (`<ul>`, `<ol>`, `<dl>`) when presenting list content.
- **FR-A11Y-028:** Tables shall include `<thead>`, `<tbody>`, and `<th>` elements with `scope` attributes for data tables.

### A.0.8.6. Motion Preferences

- **FR-A11Y-029:** The system shall respect the user's `prefers-reduced-motion` operating system setting.
- **FR-A11Y-030:** When `prefers-reduced-motion: reduce` is detected, all animations and transitions shall be disabled or reduced to minimal duration (0.01ms).
- **FR-A11Y-031:** Essential motion (e.g., indicating loading states) shall use non-motion alternatives when motion is reduced (e.g., opacity changes instead of slide transitions).
- **FR-A11Y-032:** Decorative animations shall be disabled entirely when reduced motion is preferred.

### A.0.8.7. Touch Target Size

- **FR-A11Y-033:** All interactive elements (buttons, links, form controls) shall have a minimum touch target size of 44x44 CSS pixels.
- **FR-A11Y-034:** If visual size is smaller than 44x44px, clickable areas shall be expanded using padding or pseudo-elements.
- **FR-A11Y-035:** Adjacent interactive elements shall maintain adequate spacing to prevent accidental activation.

---

## A.0.9. User Experience (UX) Requirements

These requirements define expected user experience patterns and interactive behaviors across the application.

### A.0.9.1. Interactive Feedback

- **FR-UX-001:** Interactive elements shall provide visual feedback for all user actions (hover, focus, active states).
- **FR-UX-002:** Hover states shall be applied to clickable cards, buttons, and links using appropriate visual changes (shadow elevation, background color, or opacity).
- **FR-UX-003:** Clickable elements shall display `cursor-pointer` to indicate interactivity.
- **FR-UX-004:** Active state feedback shall be provided when buttons are pressed (e.g., slight scale or brightness change).
- **FR-UX-005:** Disabled elements shall be visually distinct (reduced opacity, grayscale) and shall not respond to pointer events.

### A.0.9.2. Loading States

- **FR-UX-006:** Asynchronous operations (e.g., form submissions, data fetches) shall display loading indicators to provide feedback.
- **FR-UX-007:** Loading states shall include either a spinner component or skeleton screens for content placeholders.
- **FR-UX-008:** Buttons performing async actions shall display a loading spinner and be disabled during operation.
- **FR-UX-009:** Page-level loading shall use a top-loading bar or full-page skeleton to indicate progress.
- **FR-UX-010:** Loading indicators shall include accessible labels for screen reader users (e.g., `aria-label="Loading..."`).

### A.0.9.3. Error States

- **FR-UX-011:** Form validation errors shall be displayed inline below the relevant input field.
- **FR-UX-012:** Error messages shall be clear, specific, and actionable (e.g., "Email is required" not "Invalid input").
- **FR-UX-013:** Form inputs with errors shall display error styling (red border, error icon) and associated error text.
- **FR-UX-014:** Global errors (e.g., network failures) shall be displayed in a toast notification or alert banner.
- **FR-UX-015:** Error states shall persist until the user takes corrective action or dismisses the error.

### A.0.9.4. Success Feedback

- **FR-UX-016:** Successful operations (e.g., form submissions, record creation) shall display confirmation messages.
- **FR-UX-017:** Success messages shall use toast notifications or inline alerts with appropriate success styling (green, checkmark icon).
- **FR-UX-018:** Success messages shall auto-dismiss after 5 seconds or allow manual dismissal.
- **FR-UX-019:** Critical success actions (e.g., account deletion) shall include persistent confirmation and navigation to appropriate next screen.

### A.0.9.5. Responsive Design

- **FR-UX-020:** The application shall be fully functional and visually appropriate on mobile (320px+), tablet (768px+), and desktop (1024px+) viewports.
- **FR-UX-021:** Navigation shall adapt to screen size: mobile hamburger menu, tablet/desktop sidebar.
- **FR-UX-022:** Data tables shall be responsive, using horizontal scroll on mobile or card-based layouts where appropriate.
- **FR-UX-023:** Form layouts shall stack vertically on mobile and use grid layouts on larger screens.
- **FR-UX-024:** Touch interactions shall be optimized for mobile devices (44px minimum touch targets, swipe gestures where appropriate).

### A.0.9.6. Consistency

- **FR-UX-025:** All pages shall use consistent layout patterns: PageHeader component for page titles and actions.
- **FR-UX-026:** Similar actions shall use consistent button variants across the application (e.g., all delete actions use destructive variant).
- **FR-UX-027:** Spacing, typography, and color usage shall follow the design system guidelines in `docs/guides/DESIGN_SYSTEM.md`.
- **FR-UX-028:** Iconography shall be consistent across the application using the Lucide React icon library exclusively.
- **FR-UX-029:** Empty states shall provide clear messaging and actionable next steps (e.g., "No events yet. Create your first event.").

---

## A.1. Onboarding Wizard

This feature guides a new Church Administrator through the initial setup of their account. It is
triggered on the first login for a new church client and appears as a modal dialog overlaying the
main dashboard.

### A.1.1. Modal Presentation

- **FR-ONB-001:** The wizard shall appear as a modal dialog immediately after login for administrators where `onboardingComplete` is `false`.
- **FR-ONB-002:** The modal shall have consistent sizing (max-width: 4xl, max-height: 90vh) with internal scrolling for content that exceeds the viewport.
- **FR-ONB-003:** The modal shall include a progress indicator showing completion status across all steps.
- **FR-ONB-004:** The modal shall be dismissible only by completing the wizard or explicitly skipping all steps.

### A.1.2. Wizard Flow

- **FR-ONB-005:** The wizard shall consist of a series of skippable steps.
- **FR-ONB-006:** A "Skip for now" link shall be present on every step.
- **FR-ONB-007:** A setup guide or checklist shall be available on the main dashboard for admins to
  return to incomplete steps.

### A.1.3. Step 1: Welcome & Branding

- **FR-ONB-008:** The screen shall display a welcome message.
- **FR-ONB-009:** The admin shall be able to upload a church logo (e.g., JPG, PNG).
- **FR-ONB-010:** The admin shall be able to select a primary brand color.
- **FR-ONB-011:** A "Get Started" button shall advance to the next step after saving branding settings.

### A.1.4. Step 2: Define Roles

- **FR-ONB-012:** The system shall display the default roles (`Admin`, `Leader`, `Member`).
- **FR-ONB-013:** The admin shall have an interface to create new, custom roles.

### A.1.5. Step 3: Invite Core Team

- **FR-ONB-014:** The system shall provide a form to add team members with fields for `Name`,
  `Email`, and `Role` (using the roles from Step 2).
- **FR-ONB-015:** Upon completion of the wizard, the system shall send an email invitation to each
  person added in this step.

### A.1.6. Step 4: Import Member Emails

- **FR-ONB-016:** The system shall provide two methods for bulk-adding members: a text box for
  pasting emails and a CSV file upload.
- **FR-ONB-017:** Upon completion of the wizard, the system shall send an email to each imported
  email address with a unique link to a registration form.
- **FR-ONB-018:** The registration form shall allow the new member to fill in their profile details
  and create an account using either a password or a social login (Google/Facebook).

## A.2. Document Library

### A.2.1. Upload and Manage Documents (Admin)

- **FR-DOC-001:** Admins shall have access to a "Document Library" page.
- **FR-DOC-002:** The system shall provide an interface to upload files (e.g., PDF, DOCX, PNG).
- **FR-DOC-003:** For each uploaded document, the admin must provide a `Title` and can provide an
  optional `Description`.
- **FR-DOC-004:** Admins can edit the title and description of or archive any existing document.

### A.2.2. Document Permissions (Admin)

- **FR-DOC-005:** For each document, the admin must configure its visibility by selecting one or
  more roles that are permitted to view it.
- **FR-DOC-006:** The list of available roles for permissions shall be the same as those defined in
  the "Roles" configuration.

### A.2.3. View and Download Documents

- **FR-DOC-007:** Any logged-in user can access the Document Library page.
- **FR-DOC-008:** The system shall only display the documents for which the user's role has been
  granted permission.
- **FR-DOC-009:** Users can download a document by clicking on it. The system must use a secure,
  time-limited URL for the download.

---

## A.3. Prayer Wall

### A.3.1. Submit a Prayer Request (Member)

- **FR-PRAY-001:** An authenticated member shall be able to navigate to a "Prayer" page.
- **FR-PRAY-002:** The page shall contain a form to submit a new prayer request.
- **FR-PRAY-003:** The form shall include fields for a `Title` and the `Request Details`.
- **FR-PRAY-004:** The form shall include a checkbox labeled "Submit Anonymously". If checked, the
  user's name will not be attached to the request.

### A.3.2. Moderate Prayer Requests (Admin)

- **FR-PRAY-005:** Admins shall have a "Prayer Moderation" dashboard to view all `PendingApproval`
  prayer requests.
- **FR-PRAY-006:** For each pending request, the admin shall have "Approve" and "Deny" actions.
- **FR-PRAY-007:** Approving a request shall change its status to `Approved` and make it visible on
  the public Prayer Wall.

### A.3.3. View Prayer Wall (Member)

- **FR-PRAY-008:** The Prayer Wall shall display all `Approved` prayer requests.
- **FR-PRAY-009:** If a request was not submitted anonymously, the name of the member who submitted
  it shall be displayed.

## A.4. General Request Management

### A.4.1. Configure Request Types (Admin)

- **FR-REQ-001:** An admin shall be able to access a "Request Types" management page.
- **FR-REQ-002:** The admin shall be able to create new request types with a specified `Name`.
- **FR-REQ-003:** The admin shall be able to disable a request type. The system must prevent
  deletion if open requests of that type exist.

### A.4.2. Submit a Request (Member)

- **FR-REQ-004:** A member shall be able to navigate to a "Requests" page and click "New Request".
- **FR-REQ-005:** The form shall include a dropdown to select from all enabled `Request Types`.
- **FR-REQ-006:** The form shall include fields for `Title` and `Description`.

### A.4.3. Manage Requests (Admin)

- **FR-REQ-007:** An admin shall have a dashboard to view all submitted requests.
- **FR-REQ-008:** An admin can assign a request to a staff member.
- **FR-REQ-009:** An admin can update the status of a request between `Pending`, `In Progress`, and
  `Closed`.

## A.5. Event & Service Check-in

### A.5.1. View Check-in Dashboard (Admin)

- **FR-CHK-001:** An admin shall have access to a "Check-in Dashboard".
- **FR-CHK-002:** The dashboard shall display a summary of attendance for recent events and
  services.

### A.5.2. Member Check-in

- **FR-CHK-003:** The system shall record attendance when a member is checked into an event.

## A.6. Child Check-In and Safety

### A.6.1. Household and Child Management

- **FR-CHILD-001:** The system shall support household structures to group family members together.
- **FR-CHILD-002:** Households shall contain multiple guardians and children.
- **FR-CHILD-003:** Admins shall be able to create, update, and archive households.
- **FR-CHILD-004:** Admins shall be able to add and remove members from households.
- **FR-CHILD-005:** The system shall require parent/guardian contact information for emergency purposes.

### A.6.2. Child Registration

- **FR-CHILD-006:** Admins shall be able to register children with full name, date of birth, allergies, medical notes, and emergency contact information.
- **FR-CHILD-007:** Children shall be associated with households and their authorized guardians.
- **FR-CHILD-008:** Admins shall be able to update child information including allergies and medical conditions.
- **FR-CHILD-009:** The system shall calculate and display child age based on date of birth for grouping purposes.

### A.6.3. Check-In Methods

- **FR-CHILD-010:** Parents shall be able to check in children via mobile app or at a physical check-in table.
- **FR-CHILD-011:** App-based check-ins shall require volunteer confirmation within a configurable time period (default: 10 minutes).
- **FR-CHILD-012:** If app check-in is not confirmed by volunteer within the time limit, the system shall raise a flag and send notifications.
- **FR-CHILD-013:** Notifications for unconfirmed check-ins shall be sent to volunteers and optionally to parents.
- **FR-CHILD-014:** Table-based check-ins shall be performed manually by volunteers.

### A.6.4. Check-In Tags and Labels

- **FR-CHILD-015:** The system shall generate printable tags/IDs for checked-in children.
- **FR-CHILD-016:** Tags shall include child's name, calculated age, allergies, medical notes, and emergency contact information.
- **FR-CHILD-017:** Tags shall be color-coded or grouped by age ranges for childcare worker organization.
- **FR-CHILD-018:** Volunteers shall be able to print tags immediately after check-in confirmation.

### A.6.5. Check-In Dashboard and Monitoring

- **FR-CHILD-019:** Admins and volunteers shall have access to a child check-in dashboard.
- **FR-CHILD-020:** The dashboard shall show pending check-ins requiring confirmation.
- **FR-CHILD-021:** The dashboard shall display currently checked-in children with their location and status.
- **FR-CHILD-022:** The dashboard shall highlight unconfirmed check-ins that have exceeded the confirmation time limit.
- **FR-CHILD-023:** The system shall support real-time updates of check-in status across multiple volunteer devices.

### A.6.6. Emergency and Communication Features

- **FR-CHILD-024:** Volunteers shall be able to access parent contact information for emergencies or questions during events.
- **FR-CHILD-025:** The system shall log all access to parent contact information for audit purposes.
- **FR-CHILD-026:** Emergency contact information shall be prominently displayed on child profiles and tags.

### A.6.7. Check-Out Process

- **FR-CHILD-027:** The system shall notify parents when it's time to pick up their children (15 minutes after event ends).
- **FR-CHILD-028:** Notifications shall be sent via the mobile app to registered parents.
- **FR-CHILD-029:** Volunteers shall perform the check-out action for children at the physical location.
- **FR-CHILD-030:** Parents shall confirm child pickup via app within 3 minutes of volunteer check-out.
- **FR-CHILD-031:** If parent confirmation is not received within 3 minutes, the system shall raise an alert.
- **FR-CHILD-032:** Visitors shall complete manual check-out procedures without app confirmation.

### A.6.8. Safety and Audit Features

- **FR-CHILD-033:** The system shall maintain complete audit trails of all check-in, confirmation, and check-out activities.
- **FR-CHILD-034:** Audit logs shall include timestamps, user IDs, and actions performed.
- **FR-CHILD-035:** The system shall prevent unauthorized check-out of children by non-authorized guardians.
- **FR-CHILD-036:** Safety flags shall be raised for overdue confirmations, missing pickups, and unconfirmed check-outs.

### A.6.9. Configuration and Settings

- **FR-CHILD-037:** Admins shall be able to configure confirmation time limits (default: 10 minutes).
- **FR-CHILD-038:** Admins shall be able to configure check-out notification timing (default: 15 minutes after event).
- **FR-CHILD-039:** Admins shall be able to configure parent confirmation time limits (default: 3 minutes).
- **FR-CHILD-040:** The system shall support different workflows for members (app-based) vs visitors (manual).

## A.7. Event Volunteer Management

### A.6.1. Create Event (Admin)

- **FR-EVT-001:** An admin shall be able to create new events with title, description, start/end times, location, and visibility settings.
- **FR-EVT-002:** Events can be optionally linked to specific groups.
- **FR-EVT-003:** Events shall have public or private visibility settings.

### A.6.2. Manage Volunteer Roles (Admin)

- **FR-EVT-004:** For each event, an admin shall be able to create volunteer roles with a name and number of volunteers needed.
- **FR-EVT-005:** An admin shall be able to update volunteer role names and capacity requirements.
- **FR-EVT-006:** An admin shall be able to archive volunteer roles that have no current signups.

### A.6.3. Volunteer Signup (Member)

- **FR-EVT-007:** Members shall be able to view available volunteer roles for upcoming events.
- **FR-EVT-008:** Members shall be able to sign up for volunteer roles if capacity is not exceeded.
- **FR-EVT-009:** Members shall be able to cancel their volunteer signups.
- **FR-EVT-010:** The system shall prevent duplicate signups for the same role by the same member.

### A.6.4. Volunteer Coordination Dashboard (Admin)

- **FR-EVT-011:** An admin shall have access to a volunteer coordination dashboard showing all events and their volunteer roles.
- **FR-EVT-012:** The dashboard shall display current signup counts versus capacity for each role.
- **FR-EVT-013:** The dashboard shall show which members are signed up for each role.
- **FR-EVT-014:** The dashboard shall highlight roles that are under/over capacity.

### A.6.5. Event Management (Admin)

- **FR-EVT-015:** An admin shall be able to update event details.
- **FR-EVT-016:** An admin shall be able to archive events.
- **FR-EVT-017:** Archiving an event shall also archive all associated volunteer roles and signups.

### A.6.6. Attendance Tracking

- **FR-EVT-018:** An admin shall be able to record attendance for events.
- **FR-EVT-019:** Attendance records shall include status (Present, Absent, Late) and optional notes.
- **FR-EVT-020:** An admin shall be able to export attendance data as CSV for reporting purposes.

---

## A.7. Pastoral Care Management

This feature provides confidential pastoral care ticket management for church staff to handle sensitive member care needs.

### A.7.1. Create Pastoral Care Tickets (Staff/Admin)

- **FR-PAST-001:** Staff and admin users shall be able to create confidential pastoral care tickets with title, description, and priority level.
- **FR-PAST-002:** The ticket creation form shall include priority options: LOW, NORMAL, HIGH, URGENT with NORMAL as the default.
- **FR-PAST-003:** Tickets shall be automatically assigned NEW status upon creation.
- **FR-PAST-004:** Form validation shall require both title and description fields to be non-empty.
- **FR-PAST-005:** Users shall receive immediate feedback upon successful ticket creation with navigation to the ticket details.

### A.7.2. View and Manage Tickets (Staff/Admin)

- **FR-PAST-006:** Staff and admin users shall have access to a list view of all pastoral care tickets.
- **FR-PAST-007:** Tickets shall display key information: title, status, priority, creation date, and last update.
- **FR-PAST-008:** Staff shall be able to update ticket status: NEW, ASSIGNED, IN_PROGRESS, RESOLVED.
- **FR-PAST-009:** Staff shall be able to update ticket priority levels.
- **FR-PAST-010:** Staff shall be able to assign tickets to other staff members.
- **FR-PAST-011:** Tickets shall be sorted by priority (URGENT first) and then by creation date (newest first).

### A.7.3. Ticket Comments and Communication (Staff/Admin)

- **FR-PAST-012:** Staff shall be able to add internal comments to pastoral care tickets for communication and documentation.
- **FR-PAST-013:** Comments shall be threaded and display chronologically with author and timestamp.
- **FR-PAST-014:** Comment text shall be required and support multi-line input.
- **FR-PAST-015:** All comments shall be confidential and visible only to staff/admin users.

### A.7.4. Access Control and Security

- **FR-PAST-016:** Pastoral care tickets and comments shall be accessible only to users with Staff or Admin roles.
- **FR-PAST-017:** Regular members shall not have access to pastoral care features.
- **FR-PAST-018:** All access to pastoral care data shall be logged for audit purposes.
- **FR-PAST-019:** The system shall enforce role-based access control at both UI and API levels.

### A.7.5. User Experience and Navigation

- **FR-PAST-020:** Pastoral care features shall be accessible through the main navigation sidebar for authorized users.
- **FR-PAST-021:** The ticket creation form shall provide clear instructions and validation feedback.
- **FR-PAST-022:** Error states shall be handled gracefully with user-friendly error messages.
- **FR-PAST-023:** The interface shall be responsive and accessible on mobile devices.

---

_The remaining sections and Part B (System Administration) are omitted for brevity but are
understood to be included in the full document._

---

## Part B: Platform and Tenant Administration

### B.1. Super Admin Console (Platform Operator)

- **FR-SUP-001:** Provide a tenant list view including `Tenant Name`, `Plan`, `Status`, `CreatedAt`, `LastActiveAt`.
- **FR-SUP-002:** Support tenant lifecycle actions: `Provision`, `Suspend`, `Reinstate`, `Decommission` with confirmations and audit logging.
- **FR-SUP-003:** Allow editing tenant entitlements (enabled modules, user caps), effective immediately with audit trail.
- **FR-SUP-004:** Implement impersonation for troubleshooting with explicit banner, time-bound access, and immutable audit log entries.

### B.2. Platform Observability & Incidents

- **FR-SUP-005:** Expose platform health dashboard with uptime, error rates, request throughput, and dependency status.
- **FR-SUP-006:** Trigger incident workflows on threshold breaches: create incident ticket, status banner, and tenant notifications.
- **FR-SUP-007:** Maintain an incident history with timestamps, scope, impact, and remediation notes.

### B.3. Billing Alignment (High-Level)

- **FR-SUP-008:** Store billing metadata per tenant (`Plan`, `BillingStatus`, `RenewalDate`, `GraceUntil`).
- **FR-SUP-009:** On `BillingStatus=Delinquent`, move tenant to grace period and restrict access when expired.
- **FR-SUP-010:** Record billing state changes in the global audit log. Integration specifics to be defined by provider decision.

### B.4. Global Audit Trail

- **FR-SUP-011:** Record all super-admin actions (who, what, when, before/after state) with export capability (CSV/JSON).
- **FR-SUP-012:** Log tenant lifecycle events and impersonation sessions with correlation IDs.

### B.5. Tenant Administration Enhancements (Church App Admin)

- **FR-TEN-001:** Role/Permission Editor: create, edit, archive custom roles; assign granular permissions by module/action.
- **FR-TEN-002:** Data Tools: bulk import (CSV), deduplication assistance, household reassignment with preview and audit.
- **FR-TEN-003:** Configurable Dashboards: create saved views with KPIs (attendance, engagement, requests) and export/share.
- **FR-TEN-004:** Workflows: assignment, reminders, and approvals for requests/events with due dates and escalation.
- **FR-TEN-005:** Integrations: tenant-level settings for email/SMS providers and calendar exports (ICS).

### B.6. Security & Access Controls

- **FR-SEC-001:** Enforce data isolation by `churchId` across all tenant-admin features.
- **FR-SEC-002:** Support scoped access for impersonation with explicit consent/logging where policy requires.
- **FR-SEC-003:** Provide permission checks client- and server-side with a consistent authorization policy.

---

## Decision Log and Owners (Initial)

- **Billing Provider Selection:** Owner – Product/Founder; Needed to finalize FR-SUP-008..010.
- **Impersonation Policy (consent, banners, retention):** Owner – Security Lead; Affects FR-SUP-004, FR-SUP-011..012.
- **Permission Model Granularity:** Owner – Tech Lead; Affects FR-TEN-001, FR-SEC-003.
- **Notification Channels (email/SMS providers):** Owner – Product/Tech; Affects FR-TEN-005 and workflows.

---

## Part C: Persona-Specific Functional Requirements

### C.1. Board of Trustees (Governance Body)

- **FR-TRUST-001:** Trustees shall have access to a governance dashboard displaying quarterly compliance reports, financial summaries, risk registers, and safeguarding metrics.
- **FR-TRUST-002:** Secure document portal with role-based access to policy documents, audit reports, and meeting materials with versioning and acknowledgment tracking.
- **FR-TRUST-003:** Workflow tools for policy approvals, incident reviews, and decision logging with full audit trails and comment threads.
- **FR-TRUST-004:** Automated notifications for compliance deadlines, incident alerts, and quarterly reporting cycles with escalation paths.
- **FR-TRUST-005:** Time-bound access controls with explicit logging of all document views, downloads, and governance actions.

### C.2. Non-Fulltime Coordinators (Ministry Coordinators)

- **FR-COORD-001:** Volunteer scheduling interface with drag-and-drop assignments, availability conflict detection, and template reuse for recurring events.
- **FR-COORD-002:** Volunteer availability management with self-service blackout dates, skill tracking, and preference settings.
- **FR-COORD-003:** Automated reminder workflows for assignments, confirmations, and last-minute coverage requests with customizable templates.
- **FR-COORD-004:** Communication tools with ministry segmentation and message logging for volunteer coordination and announcements.
- **FR-COORD-005:** Basic analytics dashboard showing coverage rates, participation trends, volunteer retention metrics, and gap analysis.

### C.3. Church Leaders (Pastoral/Ministry Leaders)

- **FR-LEAD-001:** Ministry-specific dashboards with filtered care requests, attendance trends, engagement signals, and task assignments.
- **FR-LEAD-002:** Task management capabilities for assigning follow-ups, updating pastoral notes, and tracking completion with status workflows.
- **FR-LEAD-003:** Automated alerts for attendance dips, urgent care requests, and volunteer coverage gaps with configurable thresholds.
- **FR-LEAD-004:** Integration with communication tools respecting member privacy preferences and opt-in requirements.
- **FR-LEAD-005:** Scoped access controls limiting data visibility to assigned ministries with confidentiality boundaries and audit logging.

### C.4. Members (Registered Congregants)

- **FR-MEMB-001:** Self-service profile management with household connections, preference settings, and contact information updates.
- **FR-MEMB-002:** Event discovery and registration with filtering, recommendations, and household bulk registration capabilities.
- **FR-MEMB-003:** Personal dashboard summarizing upcoming commitments, recent interactions, and engagement history.
- **FR-MEMB-004:** Notification center with preference management across email, SMS, and push channels with opt-in/opt-out controls.
- **FR-MEMB-005:** Request submission and tracking for prayer, pastoral care, and general support needs with status updates and feedback loops.

### C.5. Non-Members (Visitors/Seekers)

- **FR-VISIT-001:** Guest-friendly public flows for event registration and information requests without account requirements.
- **FR-VISIT-002:** Automated nurture workflows with segmented communications and follow-up scheduling based on interaction history.
- **FR-VISIT-003:** Visitor-to-member conversion pathway with data continuity, consent management, and profile migration.
- **FR-VISIT-004:** Public resource access for service information, beliefs, and next steps toward membership with minimal barriers.
- **FR-VISIT-005:** Privacy controls with transparent data usage statements, consent management, and easy opt-out mechanisms.

---

## FR-ARCH-010: Soft Delete System

### Overview
All major entities support soft delete functionality allowing administrators to archive records without permanent data loss.

### Functional Requirements

**FR-ARCH-010-01: Archive Records**
- Users with Admin or Leader roles can archive records
- Archived records are hidden from default list views
- Archived records retain all data and relationships
- Archive operation sets deletedAt timestamp

**FR-ARCH-010-02: Restore Records**
- Archived records can be restored to active state
- Restore operation clears deletedAt timestamp
- Restored records appear in default list views immediately
- All original data and relationships are preserved

**FR-ARCH-010-03: Bulk Operations**
- Multiple records can be archived in a single operation
- Multiple records can be restored in a single operation
- Bulk operations return success/failure counts
- Failed operations do not affect successful ones

**FR-ARCH-010-04: Authorization**
- Only Admin and Leader roles can archive/restore
- Member role cannot access soft delete functionality
- Unauthorized attempts return 403 Forbidden
- UI controls are hidden for unauthorized roles

**FR-ARCH-010-05: Cascade Behavior**
- Soft delete does NOT automatically cascade
- Warning dialogs appear for dependent relationships
- Users must explicitly archive dependent records
- Example: Archiving household requires separate child archiving

**FR-ARCH-010-06: Audit Trail**
- All archive operations are logged
- All restore operations are logged
- Logs include actor, timestamp, entity type, entity ID
- Audit logs cannot be soft deleted

### Supported Entities
- Users (Admin only for soft delete)
- Events
- Groups
- Announcements
- Contributions
- Funds
- Households
- Children

### UI/UX Requirements

**FR-ARCH-010-07: Toggle View**
- "Show Archived" toggle for Admin/Leader roles
- Toggle switches between active and archived views
- Badge displays count of archived items
- Toggle state persists during session

**FR-ARCH-010-08: Bulk Selection**
- Checkboxes for selecting multiple items
- "Select All" checkbox for current view
- Bulk action buttons appear when items selected
- Actions: Archive, Restore (context-dependent)

**FR-ARCH-010-09: Visual Indicators**
- Archived items display "Archived" badge
- Archived items have distinct visual styling
- Loading states during async operations
- Success/error messages for operations

**FR-ARCH-010-10: Warning Dialogs**
- Warning appears when archiving items with dependents
- Dialog shows count of active dependent records
- User must confirm to proceed with archive
- Option to cancel and view dependents

### Related Requirements
- **FR-SEC-003:** Role-based access control and permission checks (Admin/Leader authorization)
- **Note:** Comprehensive audit trail implemented for all soft delete operations (actor, timestamp, entity)
- **FR-DATA-001:** Multi-tenancy (churchId isolation)
- **BR-DATA-005:** Data Retention and Recovery (Business Requirements)

---

**Document Version:** 2.1.0  
**Last Updated:** 5 November 2025  
**Change:** Added FR-ARCH-010 for soft delete system (Sprint: Soft Delete Main Sprint)
