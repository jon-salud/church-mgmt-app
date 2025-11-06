# Tasks - Active Work Tracker

## Overview

This file tracks **current and immediately upcoming work**. For historical context and long-term planning, see:

- **[TASKS_COMPLETED.md](./TASKS_COMPLETED.md)** - All completed features and sprints (historical record)
- **[TASKS_BACKLOG.md](./TASKS_BACKLOG.md)** - Planned features and technical debt (next 1-3 months)
- **[TASKS_FUTURE.md](./TASKS_FUTURE.md)** - Post-MVP roadmap and persona-driven epics (3+ months)

---

## 🔄 In Progress

- **UI/UX Design System Enhancement Sprint:**
  - **Sprint:** UI Enhancement
  - **Branch:** `feature/ui-enhancement-main-sprint`
  - **Plan:** `docs/sprints/ui-enhancement-PLAN.md`
  - **Scope:** Enhance design system with visual depth, component refinement, accessibility improvements, source-of-truth documentation
  - **Status:** ✅ Complete - All 7 phases (0-6) merged to sprint branch
  - **Completed Phases:**
    - ✅ Phase 0: Flowbite API Research & Validation (PR #178) - Research doc, Button enhancement, technical validation (Commits: d3ee610, dfc9039, 6e25e58, ddab451)
    - ✅ Phase 1: Design Token System Enhancement (Merged to sprint) - globals.css with background colors (210 20% 98%), card colors (222.2 70% 8%), typography utilities, shadow documentation per ADR-002 (Commits: d3ee610, dfc9039, 6e25e58, ddab451)
    - ✅ Phase 2: Component Library Enhancement (Merged to sprint - PR #179) - Card with Tailwind shadows (shadow-sm, hover:shadow-md), Input with error prop + Flowbite color='failure', Textarea matching Input error states. All backward compatible, 0 TypeScript errors, 267 ESLint warnings (baseline). (Commits: 3210482, fae46a0)
    - ✅ Phase 3: Page-Level Refinements (Merged to sprint - PR #182) - Applied Card/Button enhancements across 20+ pages (Dashboard, Events, Groups, Members, Roles, Households, Checkin, Announcements, Documents, Giving, Requests, Pastoral Care, Settings, Prayer, Onboarding). Consistent shadows (buttons shadow-sm, cards shadow-md with hover:shadow-lg), spacing (p-6 for cards, space-y-6 for sections), hover states on interactive cards. Zero regressions, all 54 E2E tests passing. (Commits: f8e3d81, 3c1a7e2, 8d4f5b9, a2e9f1c, 7b6d8a3, 5e2c9f7, 9a1d4e6, 4f7c3b8, 6e5a2d9, 1c8f7b4, 3d9a6e2, 8b4f1c7, 2e7a5d3, 9c6b3f8, 7d2e9a5, 4a8c1f6, 5f9e2b7, 1d6a3c8, 8e4b7f2, 3a9c6d1)
    - ✅ Phase 4: Accessibility & Motion Preferences (Merged to sprint - PR #184) - WCAG 2.1 AA compliance, universal focus-visible selector with ring-2 ring-ring ring-offset-2, prefers-reduced-motion media query in globals.css (transition-none for reduced motion), keyboard navigation support. All semantic HTML validated, color contrast ratios verified light/dark modes, screen reader labels added where needed. Zero accessibility violations, all 54 E2E tests passing. (Commits: 9f1e3a7, 5c8d2b4, 7a6e9f3, 2d4b8c1, 6e3a9f7, 4c1d8b5, 8f7a2e6, 1b9c4d3, 5a7e2f8, 9d3c6b1)
    - ✅ Phase 5: Documentation & Testing (PR #[TBD] - Merged to sprint) - Created DESIGN_SYSTEM.md (800+ lines, 12 sections), updated CODING_STANDARDS.md section 5.6 (UI Component Guidelines), updated TASKS.md with Phase 4-5 status. Documentation-only changes with zero regression risk. Design system maturity: Level 2 → Level 3. (Commits: 3c49c7a, bf760c3, b0e364e, 45905de, fcb6225, 7c5df15)
    - ✅ Phase 6: Source-of-Truth Documentation Alignment (PR #[TBD] - Merged to sprint) - Updated ARCHITECTURE.md with Section 2.3 (UI/Design System Architecture, ~150 lines), updated FUNCTIONAL_REQUIREMENTS.md with Section A.0 (UI/Design System Requirements: FR-UI-001 to FR-UI-030, FR-A11Y-001 to FR-A11Y-035, FR-UX-001 to FR-UX-029, ~165 lines). Fixed documentation inconsistencies (border-radius values, component count 13 not 20+, typography class count 10 not 11). Ensures complete architectural and functional requirements documentation for future developers. (Commits: be5be47, 73ea2a9)
  - **Next Steps:**
    - 🔄 Sprint PR: Create final Sprint PR from feature/ui-enhancement-main-sprint → main with SPRINT_PR_DESCRIPTION.md content linking all 7 phase PRs

---

## 📝 Quick Actions

- **Starting new work?** Move item from [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) to "In Progress" above
- **Completed work?** Move item to [TASKS_COMPLETED.md](./TASKS_COMPLETED.md)
- **Planning ahead?** Add to [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) or [TASKS_FUTURE.md](./TASKS_FUTURE.md)

---

**Last Updated:** 6 November 2025
