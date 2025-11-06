# AI Agent Workflow for Church Management App (Strict Mode)

You are in **STRICT MODE**. Do not write or modify code until all **Compliance Gates** pass and the required **Artifacts** exist. If a gate fails, **STOP** and ask the user.

> This version assumes **Prettier** is the single source of truth for formatting.

---

## 0) Execution Contract (MUST READ FIRST)

**Authoritative sources (priority order):**
1) **User's current explicit request**
2) **This document** (Strict Mode)
3) **Codebase** (actual files on disk)
4) Project docs (e.g., `TASKS.md` for current work, `TASKS_BACKLOG.md`, `TASKS_COMPLETED.md`, `TASKS_FUTURE.md`, `PRD.md`)

**Non‑negotiables (MUST):**
- Never commit directly to `main`.
- Never create a phase branch off `main`.
- Always follow **Sprint & Phase Protocol** and pass **Compliance Gates**.
- Prevent regressions: search usages before changes; keep tests green.
- **Formatting:** Use only the commands `pnpm format` and `pnpm format:check`. Do **not** call Prettier directly.

---

## 1) Sprint & Phase Management Protocol (MUST)

You MUST follow this protocol for all sprint‑based work.

### 1.1 Sprint‑Level

1. **Move Entire Sprint to TASKS.md (MANDATORY)**  
   Before any work begins, move the COMPLETE sprint (all phases) from `TASKS_BACKLOG.md` or `TASKS_FUTURE.md` to the "🔄 In Progress" section of `TASKS.md`.  
   This ensures full sprint visibility and prevents losing track of remaining phases.

2. **Create Sprint Branch**  
   From `main`: `feature/{sprint-name}-main-sprint`  
   Example: `feature/soft-delete-main-sprint`

3. **Create Sprint Plan (Collaborative Process)**  
   a. **Architect Creates Initial Plan**: Use `@principal_architect` to create `docs/sprints/{sprint-name}-PLAN.md`  
      - Sprint goals, phase breakdown, acceptance criteria, timeline, risks  
      - Include code snippets (NOT complete implementation)  
      - Technical approach and architectural decisions  
   
   b. **Engineer Reviews Plan**: Use `@principal_engineer` to review the plan  
      - Validate technical feasibility  
      - Identify implementation risks  
      - Propose improvements/changes  
   
   c. **Architect Updates Plan**: Use `@principal_architect` to incorporate engineer feedback  
      - This becomes the baseline sprint document  
      - Ready for phase-by-phase implementation

4. **Complete Sprint**  
   After all phases merged → Create PR `feature/{sprint-name}-main-sprint` → `main`  
   Title: `Sprint: {Sprint Name}`. Link all phase PRs & plans. DO NOT merge - wait for review.  
   **As the FINAL PR action**: Move ALL remaining sprint items from `TASKS.md` to `TASKS_COMPLETED.md` with full accomplishment summaries.

### 1.2 Phase‑Level

1. **Move Phase to In Progress** in `TASKS.md` (sprint should already be fully listed in TASKS.md).  
2. **Create Phase Branch** from the sprint branch:  
   `feature/{sprint-name}-phase{N}-{brief-description}`.  
3. **Create Phase Plan BEFORE coding**:  
   `docs/sprints/{sprint-name}-phase{N}-PLAN.md`  
   Use `phase1`, `phase2` ...; if ≥10 phases, zero‑pad (`phase01`...).  
   Include: technical approach, files to change, tests, risks & rollback, acceptance criteria.  
4. **Implement & Review** on the phase branch; keep tests green.  
5. **Document Accomplishments**: append `## Accomplishments` to the phase plan.  
6. **Create Phase PR** → sprint branch (NOT `main`) with links to plan & commits. DO NOT merge - wait for review.
7. **`@principal_engineer` MUST Move Completed Phase to TASKS_COMPLETED.md**:  
   - Update phase status to "✅ Completed" in `TASKS.md` with brief summary + commit hashes  
   - Immediately move the completed phase entry from `TASKS.md` to `TASKS_COMPLETED.md` under the appropriate sprint section  
   - This happens AFTER each phase completion, NOT at sprint end

**Rules Recap**  
- **NEVER** branch a phase from `main`.  
- **NEVER** merge a phase directly to `main`.  
- **NEVER** auto-merge phase/sprint branches - always create PR for review.
- **ALWAYS** move entire sprint from TASKS_BACKLOG.md/TASKS_FUTURE.md to TASKS.md before starting work.
- **ALWAYS** create sprint plan before phases; create each phase plan before implementation.  
- **ALWAYS** append accomplishments after completion and keep `TASKS.md` in sync.
- **@principal_engineer ALWAYS** moves completed phases from TASKS.md to TASKS_COMPLETED.md immediately after phase completion.
- **ALWAYS** move all remaining sprint items to TASKS_COMPLETED.md as the final action before sprint PR.

---

## 2) Compliance Gates (Hard Stops)

You MUST pass each gate in order. If any check fails, **STOP** and ask the user.

### Gate A — Readiness & Understanding
- **VERIFY:** If starting a new sprint, entire sprint MUST be moved from `TASKS_BACKLOG.md` or `TASKS_FUTURE.md` to `TASKS.md` "🔄 In Progress" section.
- Read `TASKS.md` for current work, `TASKS_BACKLOG.md` for upcoming features, and relevant `docs/source-of-truth/*`.
- Check `TASKS_COMPLETED.md` for historical context if needed.
- Ask clarifying questions until **zero ambiguity**.
- Produce **Readiness Receipt JSON** (see §3) and wait for explicit approval.

### Gate B — Sprint/Phase Setup
- Sprint branch exists and is correctly named.
- Sprint plan exists.
- Phase moved to “🔄 In Progress” in `TASKS.md`.
- Phase branch exists from sprint branch and is correctly named.
- Phase plan file exists with required sections.

### Gate C — Test‑First (TDD)
- Add/adjust tests per phase plan (happy path, edges, errors).
- Confirm failing tests initially (red).

### Gate D — Implementation & Verification
- Implement minimal code to pass tests (green).
- Refactor safely while tests remain green.
- Run full test suite and lint/format checks.
- Verify no regressions (usage search complete).

### Gate E — Documentation & PRs
- Append `## Accomplishments` to phase plan.
- **`@principal_engineer` MUST:** Move completed phase from `TASKS.md` to `TASKS_COMPLETED.md` with summary + commit hashes.
- Create phase PR → sprint branch with links to plan & commits (DO NOT merge, wait for review).
- On sprint completion: create sprint PR → `main` with links to all phase PRs (DO NOT merge, wait for review).
- **Sprint Final Action:** Move ALL remaining sprint items from `TASKS.md` to `TASKS_COMPLETED.md`.

---

## 3) Required Machine‑Checkable Output (Readiness Receipt)

Return this JSON **before implementing** and wait for approval:

```json
{
  "sprint": {
    "name": "<sprint-name>",
    "branch": "feature/<sprint-name>-main-sprint",
    "plan_file": "docs/sprints/<sprint-name>-PLAN.md",
    "exists": true
  },
  "phase": {
    "n": "<N>",
    "title": "<brief-description>",
    "branch": "feature/<sprint-name>-phase<N>-<brief-description>",
    "plan_file": "docs/sprints/<sprint-name>-phase<N>-PLAN.md",
    "moved_in_tasks_md": true
  },
  "tests": {
    "added_or_updated": ["<paths>"],
    "coverage_targets": ["<modules>"]
  },
  "searches_done": {
    "usages_checked_for": ["<symbols/functions/classes>"]
  },
  "risks_and_rollbacks": {
    "key_risks": ["<risk-1>", "<risk-2>"],
    "rollback_plan": "<summary>"
  }
}
```

**Do not implement** until this is approved by the user.

---

## 4) Formatting (Prettier as Single Source of Truth)

- Run **only**:
  - `pnpm format` (write)
  - `pnpm format:check` (verify)  
- Do **not** call any formatter directly.  
- CI must fail if `pnpm format:check` fails.  
- VS Code should have a **single default formatter** per language (Prettier).

---

## 5) Regression Prevention (MUST)

Before changes, identify dependencies and risks:
- Full‑repo search to list all usages of changed symbols (e.g., `list_code_usages`, text search, semantic search).  
- If risk of breakage, prefer **new implementations** or **incremental updates** guarded by tests.  
- Confirm no unintended behaviour changes via tests and manual checks where appropriate.

---

## 6) End‑to‑End Workflow

1) **Understand** → read `TASKS.md` (current work), `TASKS_BACKLOG.md` (upcoming), `TASKS_COMPLETED.md` (history as needed), `docs/source-of-truth/*`; ask questions.  
2) **Plan** → produce step‑by‑step plan + **Readiness Receipt JSON**; wait for approval.  
3) **TDD** → write tests first; see them fail (red).  
4) **Execute** → minimal implementation to pass tests (green); refactor safely; verify; format.  
5) **Docs** → **`@principal_engineer` MUST** move completed phase from `TASKS.md` to `TASKS_COMPLETED.md` with summary + commit hashes; update `docs/source-of-truth/*`, `PRD.md`, `USER_MANUAL.md` if impacted; append `## Accomplishments` to phase plan.  
6) **Submit** → Create Phase PR → sprint branch; Create Sprint PR → `main` when all phases complete (both PRs require review before merge).

---

## 7) File/Branch Naming

```
main
  └─ feature/{sprint-name}-main-sprint
       ├─ feature/{sprint-name}-phase1-<desc>
       ├─ feature/{sprint-name}-phase2-<desc>
       └─ ...
docs/
  sprints/
    {sprint-name}-PLAN.md
    {sprint-name}-phase1-PLAN.md
    {sprint-name}-phase2-PLAN.md
```

- Use non‑padded `phaseN` unless ≥10 phases (then `phase01`).  
- PLAN suffix is uppercase.

---

## 8) Technical Guardrails (Project Snapshot)

- **Monorepo:** `pnpm` workspaces; install with `pnpm install`.  
- **Servers:** API `pnpm dev:api:mock` (3001); Web `pnpm -C web dev` (3000).  
- **Testing:** Build `pnpm -r build`; API `pnpm -C api test`; E2E `pnpm test:e2e:mock`.  
- **Auth in E2E:** cookie `demo_token=demo-admin`.  
- **RBAC & Multi‑tenancy:** require `churchId`; use `hasRole()` utilities.  
- **Audit log:** never commit `api/storage/audit-log.json`.

---

## 9) Common Pitfalls Checklist

- [ ] Branching phases from `main`  
- [ ] Skipping PLAN docs before coding  
- [ ] Implementing without user‑approved **Readiness Receipt**  
- [ ] Running multiple formatters or skipping format checks  
- [ ] Missing regression searches for symbol usages  
- [ ] **Starting sprint without moving entire sprint from TASKS_BACKLOG.md/TASKS_FUTURE.md to TASKS.md**
- [ ] **Forgetting to move completed phases from TASKS.md to TASKS_COMPLETED.md immediately after phase completion**
- [ ] **Not moving all remaining sprint items to TASKS_COMPLETED.md before final sprint PR**
- [ ] Opening phase PR directly to `main`
- [ ] Auto-merging PRs without review
