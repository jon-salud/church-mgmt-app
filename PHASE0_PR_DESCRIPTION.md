# Members Hub MVP Phase 0: UX Primitives & Foundation

This PR delivers the foundational UX primitives to unblock Phase 1+ work. It focuses on reusable components, hooks, and test setup, ensuring lint/format/build/test gates pass.

## Scope
- Drawer component with focus trap, ESC/backdrop close, body scroll lock
- Toast system (store-backed) with auto-dismiss, queue limit, and `aria-live`
- Hooks: `useUrlState`, `useDrawer`, `useMediaQuery`, `useConfirm`, `useToast`
- Jest-DOM matcher setup and TypeScript types integration for web tests
- ESLint web env updates for DOM globals (HTMLElement, MediaQueryList, etc.)

## Quality Gates
- Lint: warnings only (0 errors)
- Format: `pnpm format:check` passed
- Builds: `pnpm -r build` succeeded (api + web)
- API tests: `pnpm -C api test` — 391 tests passing

## Notes
- Phase 0 intentionally focuses on primitives/hook foundation; additional UI/APIs listed in plan are deferred/redistributed to later phases.

## References
- Phase Plan: `docs/sprints/members-hub-mvp/members-hub-mvp-phase0-PLAN.md`
- Sprint Branch: `feature/members-hub-mvp-main-sprint`
- Phase Branch: `feature/members-hub-mvp-phase0-ux-primitives`

## Commits
- `aaff825` chore(phase0): format after jest-dom + lint env updates
