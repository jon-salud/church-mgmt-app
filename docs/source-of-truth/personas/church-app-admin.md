# Persona: Church App Admin

## Overview
- Primary administrator for a single church tenant; owns digital operations of the ministry.
- Bridges leadership direction and day-to-day software use across staff, leaders, and volunteers.
- Technically confident and accountable for system configuration, data quality, and user support.

## Primary Goals
- Configure the platform to reflect church structure (roles, ministries, request types, branding).
- Maintain accurate member and household data, ensuring privacy and compliance with policies.
- Equip staff and leaders with tools, permissions, and training to execute their workflows.
- Extract actionable insights (attendance, engagement, giving, request volume) to inform leadership decisions.

## Key Responsibilities
- Manage user accounts, roles, and permissions for staff, leaders, volunteers, and members.
- Configure modules and settings: request types, event categories, onboarding flows, resource sharing.
- Maintain data hygiene—de-duplicate members, handle merges, and enforce household structures.
- Build reports/dashboards for leadership meetings and board updates.
- Serve as first-line support, triaging issues before escalating to the platform vendor.

## Pain Points
- Lack of granular permissions leads to over-exposure of sensitive data or manual workarounds.
- Fragmented dashboards make it difficult to provide consolidated leadership reporting.
- Manual processes for onboarding new staff or revoking access during transitions.
- Limited automation for recurring tasks (e.g., weekly exports, reminder communications).

## Core Journeys
1. **Onboard New Staff Member:** Create account → assign role → configure access to modules → share training resources.
2. **Configure Ministry Module:** Define new request type or small group resource → set visibility/approvers → publish to congregation.
3. **Prepare Leadership Report:** Gather attendance and engagement metrics → export dashboards → annotate trends for leadership meeting.
4. **Handle Data Governance:** Receive change request → update member/household info → audit trail logging → confirm with requester.

## Feature Requirements
- Role and permission editor with templated roles (staff, leader, volunteer) and custom roles.
- Data management tools: bulk upload, deduplication, household reassignment, audit logs.
- Configurable dashboards with share/export options for leadership.
- Workflow and automation support: reminders, approvals, escalation paths.
- Training/handover tools (in-app guides, checklists) for new admins to understand modules.
- Support portal integration or in-app ticketing for issue escalation to super admin/vendor.

## Data & Permissions
- Full admin rights for their tenant, including sensitive data (pastoral requests, giving history) with appropriate safeguards.
- Ability to delegate subset permissions to trusted staff/leaders while auditing changes.
- Access to integration settings (email, SMS, calendar) specific to their church.

## Success Metrics
- Time to onboard or offboard staff accounts meets internal policies (e.g., < 24 hours).
- Data completeness metrics (e.g., 95% of members have up-to-date contact info).
- Leadership satisfaction with reporting accuracy and timeliness.
- Reduction in support escalations due to clear in-app guidance and permissions.

## Open Questions & Follow-Ups
- Should there be a tiered admin model (primary vs delegated admins) with approval workflows?
- How are cross-ministry data boundaries enforced while enabling collaboration?
- Do admins need customizable notification schedules for key metrics?
- How will the platform support seasonal or campaign-based configurations without manual rebuilds?
