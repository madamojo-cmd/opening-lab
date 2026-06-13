# Stage 2 Clean-Tree Reproducibility Check

## Scope

- Validation-only reproducibility check before release merge/Stage 3 planning.
- No runtime behavior changes.
- No coaching behavior changes.
- No `app/page.tsx` changes.

## Dirty Files Found

- Modified:
  - `docs/2026-06-12/stage2-final-21-coaching-content-inventory.json`
  - `lib/blundr/debug/testTrainerDebug.ts`
- Deleted:
  - `lib/blundr/debug/__tests__/runtimeBookDebugVisibility.test.ts`
- Untracked:
  - `lib/blundr/debug/__tests__/stage2ContentDebugVisibility.test.ts`
  - additional review/import/docs folders and scripts (left untouched)

## Analysis

- `testTrainerDebug.ts` had been updated to import `testStage2ContentDebugVisibility` from `stage2ContentDebugVisibility.test.ts`.
- The old tracked test file `runtimeBookDebugVisibility.test.ts` was deleted, and the new file existed only as untracked.
- This was a required test rename/update for reproducibility; without committing the rename, commit-only test runs could diverge.
- `stage2-final-21-coaching-content-inventory.json` change was generated timestamp-only refresh and not required for reproducibility of final accepted state.

## Actions Taken

- Restored generated inventory file:
  - `docs/2026-06-12/stage2-final-21-coaching-content-inventory.json`
- Staged required reproducibility fix as tracked rename/update:
  - `lib/blundr/debug/__tests__/runtimeBookDebugVisibility.test.ts` -> `lib/blundr/debug/__tests__/stage2ContentDebugVisibility.test.ts`
  - `lib/blundr/debug/testTrainerDebug.ts` import/call/log updates
- Left unrelated untracked folders/files untouched.

## Clean-Tree Confirmation Tests

- `npm run test:trainer-debug` -> pass
- `npx tsx tests/coach/stage2FinalAcceptance.test.ts` -> pass

## Remaining Untracked Files Intentionally Left Alone

- `create_blundr_review_bundle.sh`
- `create_blundr_review_bundle_zip.sh`
- `docs/roadmaps/`
- `docs30/`
- `imports/stage2-sample/` and related untracked CSVs
- `stage2-canonical-all23-12ply/`

## Release-Readiness Decision

- Reproducibility concern resolved by committing the required debug test rename/update and excluding generated/unrelated dirt from release checkpoint.
- Stage 2 remains release-ready for accepted scope.

STAGE_2_CLEAN_TREE_REPRODUCIBILITY_STATUS: ACCEPTED
