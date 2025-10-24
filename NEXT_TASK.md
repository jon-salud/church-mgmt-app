# AI Agent Task Initialization Protocol

## Objective
This file serves as the dynamic, single-source-of-truth prompt to initialize each AI agent work session. The protocol has three distinct phases designed to ensure that all development work is grounded in a consistent, up-to-date understanding of the project.

---

## Phase 1: Documentation Alignment & Synchronization

### 1.1. Goal
Before beginning any new feature work, you must first ensure that all project documentation is synchronized and consistent.

### 1.2. Procedure
1.  **Internalize the Sources of Truth:** Thoroughly read and understand the following primary documents, as they are the foundation for all other documentation:
    *   `docs/BUSINESS_REQUIREMENTS.md`
    *   `docs/FUNCTIONAL_REQUIREMENTS.md`
    *   `docs/ARCHITECTURE.md`
    *   `docs/DATABASE_SCHEMA.md`
    *   `docs/CODING_STANDARDS.md`

2.  **Audit and Reconcile All Other Documents:** Systematically review the following documents against the sources of truth and the current state of the codebase. Identify and rectify any inconsistencies, outdated information, or missing details.
    *   `docs/PRD.md`
    *   `docs/API_DOCUMENTATION.md`
    *   `docs/USER_MANUAL.md`
    *   `docs/NAVIGATION.md`
    *   `docs/SETUP.md`
    *   `docs/TASKS.md`

3.  **Plan and Execute:** If any discrepancies are found, you must create and execute a plan to update the necessary files and bring them into alignment.

---

## Phase 2: Execute the Next Development Task

### 2.1. Goal
Once the documentation is fully aligned, proceed with the next development task.

### 2.2. Procedure
1.  **Identify the Next Task:** Consult `docs/TASKS.md` and identify the highest-priority item in the "Backlog / Upcoming" section.
2.  **Generate a Detailed Plan:** Create a comprehensive implementation plan for this task.
3.  **Execute the Plan:** Begin work on the development task, following the established coding standards and project conventions.

---

## Phase 3: Perpetuate This Prompt

### 3.1. Goal
As the final action of your work session, you must ensure this protocol is in place for the next session.

### 3.2. Procedure
1.  **Update `TASKS.md`:** Ensure the task list is updated to reflect the work you have just completed.
2.  **Overwrite this File:** You must overwrite the `NEXT_TASK.md` file with the exact content of this prompt. This is a critical step to ensure the next agent begins with the same initialization protocol.

---
