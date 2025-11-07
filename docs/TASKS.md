# Tasks - Active Work Tracker

## Overview

This file tracks **current and immediately upcoming work**. For historical context and long-term planning, see:

- **[TASKS_COMPLETED.md](./TASKS_COMPLETED.md)** - All completed features and sprints (historical record)
- **[TASKS_BACKLOG.md](./TASKS_BACKLOG.md)** - Planned features and technical debt (next 1-3 months)
- **[TASKS_FUTURE.md](./TASKS_FUTURE.md)** - Post-MVP roadmap and persona-driven epics (3+ months)

---

## 🔄 In Progress

### Sprint: User Theme Preferences

**Branch:** `feature/user-theme-preferences-main-sprint`  
**Timeline:** 14.5-19.5 hours (2-3 days)  
**Status:** Phase 1 - Database & API Foundation  
**Sprint Plan:** `docs/sprints/user-theme-preferences-PLAN.md`

**Sprint Goals:**
- Implement user theme preference system (4 presets + dark mode toggle)
- Complete settings UI with visual previews and navigation integration
- Comprehensive E2E testing and documentation

**Phases:**
- ✅ **Phase 1: Database Schema & API Foundation (2.5-3.5h)** - Completed (moved to TASKS_COMPLETED.md)
- ✅ **Phase 2: CSS Theme System (2-3h)** - Completed (moved to TASKS_COMPLETED.md)
- ✅ **Phase 3: Settings UI (4-5h)** - Completed (moved to TASKS_COMPLETED.md)
- 🎯 **Phase 4: Theme Application Verification (1-2h)** - Ready to Start
  - **Status:** Phase infrastructure 90% complete from Phase 2
  - **Scope:** Verification testing, edge cases, performance validation
  - **Plan:** `docs/sprints/user-theme-preferences-phase4-PLAN.md`
  - **What's Done:** Server-side theme fetch, FOUC prevention, client persistence, dark mode integration
  - **What's Needed:** Cross-page E2E tests, unauthenticated user tests, performance tests, edge case validation
  - **Time Reduced:** 2.5-3.5h → 1-2h (60% reduction due to Phase 2 implementation)
- ⏳ **Phase 5: Testing & Docs (3-4h)** - Waiting for Phase 4

---

## 📝 Quick Actions

- **Starting new work?** Move item from [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) to "In Progress" above
- **Completed work?** Move item to [TASKS_COMPLETED.md](./TASKS_COMPLETED.md)
- **Planning ahead?** Add to [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) or [TASKS_FUTURE.md](./TASKS_FUTURE.md)

---

**Last Updated:** 6 November 2025
