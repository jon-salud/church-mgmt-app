# AI Agent Task Initialization Protocol

## Objective

This file serves as the dynamic, single-source-of-truth prompt to initialize each AI agent work
session. The protocol has three distinct phases designed to ensure that all development work is
grounded in a consistent, up-to-date understanding of the project.

---

## Phase 1: Documentation Alignment & Synchronization

### 1.1. Goal

Before beginning any new feature work, you must first ensure that all project documentation is
synchronized and consistent.

### 1.2. Procedure

1. **Internalize the Sources of Truth:** Thoroughly read and understand the following primary
   documents, as they are the foundation for all other documentation:
   - `docs/source-of-truth/BUSINESS_REQUIREMENTS.md`
   - `docs/source-of-truth/FUNCTIONAL_REQUIREMENTS.md`
   - `docs/source-of-truth/ARCHITECTURE.md`
   - `docs/source-of-truth/DATABASE_SCHEMA.md`
   - `docs/CODING_STANDARDS.md`
   - `docs/source-of-truth/API_DOCUMENTATION.md`

2. **Audit and Reconcile All Other Documents:** Systematically review the following documents
   against the sources of truth and the current state of the codebase. Identify and rectify any
   inconsistencies, outdated information, or missing details.
   - `docs/PRD.md`
   - `docs/USER_MANUAL.md`
   - `docs/NAVIGATION.md`
   - `docs/SETUP.md`
   - `docs/TASKS.md`

3. **Plan and Execute:** If any discrepancies are found, you must create and execute a plan to
   update the necessary files and bring them into alignment.

---

## Phase 2: Execute the Next Development Task

### 2.1. Goal

Once the documentation is fully aligned, proceed with the next development task.

### 2.2. Procedure

1. **Identify the Next Task:** Consult `docs/TASKS.md` and identify the highest-priority item in the
   "Backlog / Upcoming" section.
2. **Generate a Detailed Plan:** Create a comprehensive implementation plan for this task.
3. **Execute the Plan:** Begin work on the development task, following the established coding
   standards and project conventions.

---

## Phase 3: Finalize Session

### 3.1. Goal

As the final action of your work session, you must update the project's task list and ensure this
protocol remains current.

### 3.2. Procedure

1. **Update `TASKS.md`:** Ensure the task list is updated to reflect the work you have just
   completed.
2. **Verify Protocol Integrity:** Review the list of "source of truth" documents defined in
   `Phase 1.2, Step 1` of this protocol. If, and only if, the contents of that specific list were
   modified during this session, you must overwrite this `NEXT_TASK.md` file with its new, updated
   content. Otherwise, this file should not be changed.

---
