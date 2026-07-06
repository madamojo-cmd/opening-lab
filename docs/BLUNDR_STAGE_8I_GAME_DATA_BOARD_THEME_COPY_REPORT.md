# Blundr Stage 8I Game Data, Board Theme, and Copy Report

## Canonical Game Data Source

- Runtime opening data is loaded from the stage 2 runtime book and the generated trainable repertoires.
- The health helper reads:
  - `loadStage2RuntimeBook()`
  - `loadStage2RuntimeTrainableRepertoires()`
  - `getStage2RuntimeTrainableRepertoire()`
  - `getStage2RuntimeCandidatesForFrame()`

## Why Games Were Not Loading

- The imported opening data itself was present.
- The failure mode was a lazy/runtime lookup path that could return empty results when the dynamic repertoire module did not resolve cleanly.
- The fix is to fall back to the static trainable repertoire data so a valid opening line is still available instead of silently collapsing to empty state.

## Data Loading Fix

- `lib/blundr/openings/runtimeLineBodyLoader.ts` now falls back to the static repertoire accessor when the lazy module load is empty or unavailable.
- `lib/blundr/data/gameDataHealth.ts` adds a diagnostic report that validates the runtime book, starter-pack coverage, join probes, and Daily Blundr viability.
- `app/api/blundr/dev/game-data-health/route.ts` exposes the diagnostic report behind the existing dev gate.

## Opening and Node Counts

- Runtime opening ids: 21
- Runtime book node count: 49,232
- Runtime book move count: 116,508
- Runtime trainable repertoire count: 21

## Candidate Move Counts

- Runtime book move count: 116,508
- Runtime join probe errors: 0
- Starter-pack join errors: 0

## Starter Pack Coverage

- Missing starter-pack openings: 0
- Starter-pack join errors: 0
- Every starter pack opening id resolves to trainable data.

## Daily Blundr Data Viability

- Live deck has cards: true
- Synthetic deck has cards: true
- Daily Blundr can build a non-empty session from seeded/local state.

## Board Theme Preference Source

- Shared board preferences are stored under `blundr-board-settings`.
- The preference service normalizes legacy `boardTheme`, `pieceStyle`, and `playerColor` fields into canonical board preference fields.

## Shared Board Render Config

- New central board helpers:
  - `lib/blundr/board/boardThemeTypes.ts`
  - `lib/blundr/board/boardThemeConfig.ts`
  - `lib/blundr/board/boardPreferenceService.ts`
  - `lib/blundr/board/boardRenderConfig.ts`
- Daily Blundr reads the same normalized preference data as Training.
- The board render config resolves:
  - theme
  - piece set
  - coordinates
  - orientation
  - source

## Blue Theme Behavior

- Blue resolves to the same visual board classes everywhere it is rendered.
- Training and Daily Blundr both consume the shared board preference key and normalized render config.

## Walnut Theme Behavior

- Walnut resolves to the same visual board classes everywhere it is rendered.
- Training and Daily Blundr both consume the shared board preference key and normalized render config.

## White Opening Orientation

- White openings default to white at the bottom unless the user explicitly overrides orientation.

## Black Opening Orientation

- Black openings default to black at the bottom unless the user explicitly overrides orientation.

## Blundr Copy Normalization

- User-facing copy now uses:
  - `Blundr`
  - `Daily Blundr`
  - `Blundr Queue`
- `Daily BLUNDR` was removed from user-facing app strings and validation/report copy.

## Remaining BLUNDR Exceptions

- Historical docs and checkpoint artifacts.
- Internal constants such as `DAILY_BLUNDR_SCHEMA_VERSION`.
- Existing analytics/event constants and other non-user-facing technical identifiers.

## Routes Tested

- `/`
- `/onboarding`
- `/daily`
- `/repertoire`
- `/dev/admin`
- `/dev/ui-screens`
- `/api/blundr/dev/game-data-health` returned `403` without dev auth, which is expected for the gated diagnostic route.

## Known Limitations

- `npm run build` still reports `Skipping validation of types`, which appears preexisting.
- The dev game-data-health route is intentionally gated and will not answer without dev/admin access.

## Follow-Ups Before Launch

- Manual browser QA for the selected Blue/Walnut board theme on Training and queue surfaces.
- Manual browser QA for the hidden `/dev/ui-screens` studio on a real mobile viewport.
- Optional `tsc --noEmit` cleanup if the project wants to harden type validation later.
