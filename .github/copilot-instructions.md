# AI Agent Workflow for Church Management App (Strict Mode • Prettier)

You are in **STRICT MODE**. Do not write or modify code until all **Compliance Gates** pass and the required **Artifacts** exist. If a gate fails, **STOP** and ask the user.

> This version assumes **Prettier** is the single source of truth for formatting.

---

## 0) Execution Contract (MUST READ FIRST)

**Authoritative sources (priority order):**
1) **User’s current explicit request**
2) **This document** (Strict Mode)
3) **Codebase** (actual files on disk)
4) Project docs (e.g., `TASKS.md`, `PRD.md`)

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

1. **Create Sprint Branch**  
   From `main`: `feature/{sprint-name}-main-sprint`  
   Example: `feature/soft-delete-main-sprint`

2. **Create Sprint Plan**  
   File: `docs/sprints/{sprint-name}-PLAN.md` (PLAN must be uppercase)  
   Contents: sprint goals, phase overview, acceptance criteria, timeline, risks.

3. **Complete Sprint**  
   After all phases merged → PR `feature/{sprint-name}-main-sprint` → `main`  
   Title: `Sprint: {Sprint Name}`. Link all phase PRs & plans.

### 1.2 Phase‑Level

1. **Move Phase to In Progress** in `TASKS.md`.  
2. **Create Phase Branch** from the sprint branch:  
   `feature/{sprint-name}-phase{N}-{brief-description}`.  
3. **Create Phase Plan BEFORE coding**:  
   `docs/sprints/{sprint-name}-phase{N}-PLAN.md`  
   Use `phase1`, `phase2` ...; if ≥10 phases, zero‑pad (`phase01`...).  
   Include: technical approach, files to change, tests, risks & rollback, acceptance criteria.  
4. **Implement & Review** on the phase branch; keep tests green.  
5. **Document Accomplishments**: append `## Accomplishments` to the phase plan.  
6. **Open Phase PR** → sprint branch (NOT `main`).  
7. **Update `TASKS.md`** to “✅ Completed” with brief summary + commit hashes.

**Rules Recap**  
- **NEVER** branch a phase from `main`.  
- **NEVER** merge a phase directly to `main`.  
- **ALWAYS** create sprint plan before phases; create each phase plan before implementation.  
- **ALWAYS** append accomplishments after completion and keep `TASKS.md` in sync.

---

## 2) Compliance Gates (Hard Stops)

You MUST pass each gate in order. If any check fails, **STOP** and ask the user.

### Gate A — Readiness & Understanding
- Read `TASKS.md` and relevant `docs/source-of-truth/*`.
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
- Update `TASKS.md` status.
- Open phase PR → sprint branch with links to plan & commits.
- On sprint completion: open sprint PR → `main`.

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

1) **Understand** → read `TASKS.md`, `docs/source-of-truth/*`; ask questions.  
2) **Plan** → produce step‑by‑step plan + **Readiness Receipt JSON**; wait for approval.  
3) **TDD** → write tests first; see them fail (red).  
4) **Execute** → minimal implementation to pass tests (green); refactor safely; verify; format.  
5) **Docs** → update `TASKS.md`; update `docs/source-of-truth/*`, `PRD.md`, `USER_MANUAL.md` if impacted; append `## Accomplishments`.  
6) **Submit** → Phase PR → sprint branch; Sprint PR → `main` when all phases complete.

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
- [ ] Forgetting to update `TASKS.md`  
- [ ] Opening phase PR directly to `main`
