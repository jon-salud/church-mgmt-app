# Generating Wireframes with AI

## 1. Introduction

This document provides a guide on how to generate effective wireframes using a large language model
(LLM) with image generation capabilities. The key is to provide a highly detailed and structured
prompt that leaves little room for ambiguity.

A good wireframe prompt should be structured like a specification document, clearly defining the
layout, components, and user interactions. This ensures the generated image is a functional
blueprint rather than just a vague visual concept.

---

## 2. General Prompt Template for Wireframing

Here is a template you can adapt for any page or view. The more specific you are with each section,
the better the result will be.

> Act as a senior UX/UI designer. Your task is to create a clean, modern, and user-friendly
> wireframe for a web application screen.
>
> **- Style:** Low-fidelity, black and white, digital wireframe. Use a clean, sans-serif font like
> Inter. Focus on layout, spacing, and component hierarchy, not on visual design or branding. All
> text should be placeholder text (e.g., "Lorem ipsum dolor sit amet").
>
> **- Tool:** Generate the wireframe as if it were created in a professional tool like Figma or
> Balsamiq.
>
> **- Page Title:** [Name of the Page or View]
>
> **- Layout:** [Describe the overall layout. e.g., "A two-column layout with a fixed sidebar on the
> > left and a main content area on the right." or "A responsive grid layout with three main >
> sections."]
>
> **- Target Device:** [e.g., "Desktop view, 1440px width"]
>
> ---
>
> ### **Component Breakdown :**
>
> **1. Header:**
>
> - **Elements:** [List all elements in the header. e.g., "Logo on the far left. User profile avatar
>   > and name on the far right with a dropdown icon."]
> - **Actions:** [Describe any interactive elements. e.g., "The logo is a link to the dashboard. The
>   > user profile avatar opens a menu with 'Settings' and 'Logout' options."]
>
> **2. Sidebar / Navigation (if applicable):**
>
> - **Elements:** [List the navigation items with icons. e.g., "Vertical list of navigation links: >
>   Dashboard (Home icon), Members (Users icon), Groups (Group icon), Events (Calendar icon), >
>   Settings (Gear icon)."]
> - **State:** [Describe the active state. e.g., "The 'Members' link should be visually highlighted
>   > as the active page."]
>
> **3. Main Content Area:**
>
> - **Section 1: [Name of the first section, e.g., "Page Header"]**
>   - **Layout:** [Describe the layout of this section.]
>   - **Elements:** [List all elements. e.g., "Large page title: 'Members'. On the right, a primary
>     > button labeled 'Add New Member' and a search input field with a search icon."]
> - **Section 2: [Name of the second section, e.g., "Data Table"]**
>   - **Layout:** [Describe the layout. e.g., "A full-width table to display a list of members."]
>   - **Elements:** [List the components. e.g., "Table with the following columns: 'Name', 'Email',
>     > 'Status', 'Join Date', and 'Actions'. The 'Status' column should use a badge component. The
>     > 'Actions' column should contain two icon buttons: 'Edit' (pencil icon) and 'Delete' (trash >
>     > icon)."]
>   - **Data:** [Describe the data to be shown. e.g., "The table should be populated with 5 rows of
>     > placeholder data."]
> - **Section 3: [Name of another section, e.g., "Pagination"]**
>   - **Layout:** [Describe the layout.]
>   - **Elements:** [List the components. e.g., "Pagination controls centered below the table, >
>     showing 'Previous', page numbers (e.g., '1', '2', '3'), and 'Next' buttons."]
>
> ---
>
> **- Interactivity:** [Optional: Add any final notes on overall interactivity or user flow, e.g.,
> "Clicking the 'Edit' button should open a modal for editing a member's details."]

---

## 3. Example: Prompt for the Admin Dashboard

Here is the general template applied to a specific feature from our application—the admin dashboard.
You can use this prompt directly with an image-generating AI.

> ### **Dashboard Wireframe Prompt:**
>
> Act as a senior UX/UI designer. Your task is to create a clean, modern, and user-friendly
> wireframe for a web application's main dashboard.
>
> **- Style:** Low-fidelity, black and white, digital wireframe. Use a clean, sans-serif font like
> Inter. Focus on layout, spacing, and component hierarchy. Do not use any color or detailed icons;
> simple placeholders are sufficient. All text should be placeholder text (e.g., "Lorem ipsum dolor
> sit amet" for descriptions and placeholder labels for data).
>
> **- Tool:** Generate the wireframe as if it were created in a professional tool like Figma or
> Balsamiq.
>
> **- Page Title:** Admin Dashboard
>
> **- Layout:** A two-column layout with a fixed sidebar on the left and a main content area on the
> right.
>
> **- Target Device:** Desktop view, 1440px width.
>
> ---
>
> ### **Component Breakdown:**
>
> **1. Left Sidebar (Navigation):**
>
> - **Layout:** Fixed-width vertical navigation bar.
> - **Elements:**
>   - Church logo placeholder at the very top.
>   - A vertical list of navigation links, each with a simple placeholder icon to its left:
>     - Dashboard (active)
>     - Members
>     - Groups
>     - Events
>     - Prayer Requests
>     - Settings
>   - User profile section at the bottom, containing an avatar, "Admin Name," and a settings icon.
> - **State:** The "Dashboard" link must be visually highlighted to indicate it is the active page.
>
> **2. Main Content Area:**
>
> - **Layout:** A responsive grid layout.
> - **Section 1: Header**
>   - **Elements:** A large title on the left: "Dashboard". On the far right, a primary action
>     button labeled "Quick Action".
> - **Section 2: Key Performance Indicators (KPIs)**
>   - **Layout:** A single row containing four evenly spaced KPI cards.
>   - **Elements:** Each card should have a large number, a title below it, and a small icon.
>     - Card 1: "Total Members", e.g., "1,234"
>     - Card 2: "Avg. Weekly Attendance", e.g., "456"
>     - Card 3: "Active Groups", e.g., "28"
>     - Card 4: "Pending Requests", e.g., "12"
> - **Section 3: Recent Activity & Upcoming Events**
>   - **Layout:** A two-column grid below the KPI cards.
>   - **Left Column: Recent Activity Feed**
>     - **Elements:** A card with the title "Recent Activity". Inside, a list of 5 recent
>       activities. Each list item should include a brief description and a timestamp (e.g., "John
>       D. joined the 'Welcome Team' group - 2 hours ago").
>   - **Right Column: Upcoming Events**
>     - **Elements:** A card with the title "Upcoming Events". Inside, a list of 3-4 upcoming
>       events. Each list item should show the event title, date, and time.
> - **Section 4: Giving Overview**
>   - **Layout:** A single, full-width card below the two-column section.
>   - **Elements:** A card with the title "Giving Overview". Inside, display a simple bar chart
>     wireframe with placeholder data for the last 6 months. The x-axis should be labeled with month
>     names, and the y-axis with amounts.
