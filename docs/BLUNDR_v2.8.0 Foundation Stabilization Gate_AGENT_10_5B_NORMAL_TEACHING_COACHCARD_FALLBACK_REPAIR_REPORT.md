# BLUNDR v2.8.0 Foundation Stabilization Gate
## Agent 10.5B Report — Normal Teaching CoachCard Safety Fallback Render Repair

- Timestamp (UTC): 2026-06-03T15:37:20Z
- Branch: `v2.8.0-intelligent-coach-live`
- Package: `10.5B`
- Scope: Audit + repair of normal teaching CoachCard fallback render path.

## Failure Reproduced
Yes.

Observed pre-fix behavior:
- Normal teaching frames could render CoachCard copy:
  - `Safety Fallback`
  - `Think about the safest improving move here.`
- Debug timeline and other debug surfaces could still show move-specific copy (e.g., e4/Nf3/Bc4 themes), indicating source mismatch.

## Root Cause
Two coupled issues:
1. `blocked` surface mode copy selection defaulted to `safeFrame.plain` generic fallback regardless requested view mode.
2. `safeFallbackFrame` emitted generic fallback plain copy for blocked frames, and that generic copy could become the visible card content path.

Additional mismatch source identified:
- `app/page.tsx` coach timeline logging uses `presentationFrame`/`displayedCoachDecision` paths, while visible CoachCard rendering uses `VisibleTeachingSurface`-adapted path.
- This can produce UI-vs-debug title/body divergence when one path is blocked/fallback and the other is move-specific.

## Actual CoachCard Render Source (Post-fix)
In v2.8 mode, visible CoachCard render data is assembled from:
- `buildLiveVisibleTeachingSurface(...)`
- `adaptVisibleSurfaceToCoachUi(...)`
- `surfaceCoachCardDecision` in `app/page.tsx`

The render now consistently consumes the adapted v2.8 surface model object for visible card content.

## Safety Fallback Render Fix
Implemented:
- `lib/blundr/presentation/copySurfaceBuilder.ts`
  - `blocked` mode now selects copy by requested view:
    - assisted -> `safeFrame.assisted`
    - plain pre-show-more -> `safeFrame.plain`
    - plain post-show-more -> `safeFrame.showMore`
- `lib/blundr/presentation/buildVisibleTeachingSurface.ts`
  - passes `requestedMode` + `showMoreRevealed` into copy builder.
- `lib/blundr/safety/safeFallbackFrame.ts`
  - preserves target-aligned assisted/show-more copy for valid target frames.
  - retains generic raw Safety Fallback only where needed (null/invalid/unsafe plain leak paths).
  - downgrades unsafe strong-claim text for blocked target-preserving paths.

## v2.8 CoachCard Source-of-Truth Fix
Implemented:
- `app/page.tsx`
  - extracted `surfaceCoachCardDecision` from v2.8 adapted surface and used it directly for `<CoachCard decision={...} />`.
  - removed inline mixed decision assembly at render callsite.

## Debug/UI Parity
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts` now includes a parity case verifying v2.8 visible surface title/body win over legacy fallback decision content.

## Files Changed
- `app/page.tsx`
- `lib/blundr/presentation/buildVisibleTeachingSurface.ts`
- `lib/blundr/presentation/copySurfaceBuilder.ts`
- `lib/blundr/safety/safeFallbackFrame.ts`
- `tests/coach/uiSurfaceAdapter.test.ts`
- `tests/coach/visibleTeachingSurface.test.ts`
- `tests/coach/liveChainSmoke.test.ts`
- `tests/coach/coachSafetyGate.test.ts`
- `tests/coach/browserContract.test.ts`
- `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`

## Tests Added/Updated
Updated assertions for:
- Assisted e4/Nf3/Bc4 copy non-fallback and target/piece alignment.
- Blocked-but-valid-target surfaces not rendering raw generic fallback by default.
- Strong-claim blocked surfaces downgrading unsafe copy while retaining target-aligned content.
- Debug snapshot parity for v2.8 visible surface ownership.

## Commands Run
See command log:
- `.agent_runs/v2.8.0-intelligent-coach/20260603_153720/command_log.md`

Validation set run:
- `npm run build`
- all requested coach test files from package instructions, including:
  - `tests/coach/uiSurfaceAdapter.test.ts`
  - `tests/coach/visibleTeachingSurface.test.ts`
  - `tests/coach/liveChainSmoke.test.ts`
  - `tests/coach/browserContract.test.ts`
  - remaining required chain tests
  - `lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts`

## Results
- `npm run build`: PASS (after sandbox-related retry + one TS order fix)
- Required node/tsx tests: PASS

## Manual Live QA
Not performed in this environment.

## Remaining Risks
1. `app/page.tsx` timeline logger still derives visible title/body from `presentationFrame`/`displayedCoachDecision`, which can still diverge from rendered v2.8 surface card in edge transitions.
2. Manual browser verification required for final gate confidence:
   - e4/Nf3/Bc4/Bxc4/Be3 pre-terminal renders
   - plain pre/post Show More behavior
   - branch complete and checkmate cards

## Gate Verdict
Package 10.5B: **pass with unresolved manual-live-QA risk**.
