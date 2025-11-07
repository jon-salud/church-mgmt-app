# Tasks - Active Work Tracker

## Overview

This file tracks **current and immediately upcoming work**. For historical context and long-term planning, see:

- **[TASKS_COMPLETED.md](./TASKS_COMPLETED.md)** - All completed features and sprints (historical record)
- **[TASKS_BACKLOG.md](./TASKS_BACKLOG.md)** - Planned features and technical debt (next 1-3 months)
- **[TASKS_FUTURE.md](./TASKS_FUTURE.md)** - Post-MVP roadmap and persona-driven epics (3+ months)

---

## 🔄 In Progress

### Sprint: User Preferences Enhancement

**Sprint Name:** user-preferences-enhancement  
**Timeline:** 10-14 hours (1.5-2 days)  
**Sprint Plan:** `docs/sprints/user-preferences-enhancement-PLAN.md`  
**Implementation Plan:** `docs/sprints/user-preferences-enhancement-IMPLEMENTATION-PLAN.md`  
**Status:** Starting Sprint Execution

**Sprint Goals:**
- Add settings dropdown menu to header for easy preference access
- Implement font size adjustment system (4 sizes: 14px, 16px, 18px, 20px)
- Create settings modal with instant preview and explicit save pattern
- Build on existing theme system with backward compatibility

**Phases:**
- ✅ **Phase 1: User Settings Dropdown Menu (3-4h)** - Add dropdown to header with Settings link (COMPLETED: d646eb8)
- 🔄 **Phase 2: Font Size Preference System (6-8h)** - Database, API, frontend font size system
- **Phase 3: Settings Modal & Integration (2-3h)** - Modal with draft state and preview

**Success Criteria:**
- Settings discoverable within 30 seconds on all pages
- Instant preview with explicit save/cancel pattern
- Font sizes work at all breakpoints (375px+)
- Full E2E test coverage
- Backward compatible with existing theme system

---

## 📝 Quick Actions

- **Starting new work?** Move item from [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) to "In Progress" above
- **Completed work?** Move item to [TASKS_COMPLETED.md](./TASKS_COMPLETED.md)
- **Planning ahead?** Add to [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) or [TASKS_FUTURE.md](./TASKS_FUTURE.md)

---

**Last Updated:** 6 November 2025
