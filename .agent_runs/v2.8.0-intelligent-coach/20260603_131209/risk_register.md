# Package 2 Risk Register - Core Contracts and Type System

## Package 1 Risks Consumed As Design Inputs
- Legacy bypass surfaces still exist in `app/page.tsx` and legacy teaching pathways.
- `TrainerPresentationFrame` owner/type drift risk remains.
- Distributed provider/output authority remains (not yet centralized in Package 2).
- Legacy board overlay components remain unresolved exposure surfaces.

## Package 2 Residual Risks
- Contract modules are added, but most product runtime still uses pre-existing types/paths; migration into the canonical chain is pending later packages.
- Runtime compatibility required `CurrentInstructionTarget.color` to stay `ChessColor` (`"w" | "b"`) with optional `blundrColor`; canonical contract normalization still needs future convergence.
- Existing `buildVisibleTeachingSurface.ts` defines its own `VisibleTeachingSurface` type in parallel with new `lib/blundr/presentation/types.ts`; consolidation remains for future package wiring.
- Existing coach/safety stacks include parallel safety result types outside new `lib/blundr/safety/types.ts`; unification pending implementation packages.
- No lint script exists, so static style checks were not run.

## Blockers
- None for Package 2 scope.

## Net Gate
- Package 2 can pass for contract foundation and shape-test coverage, with known integration risks intentionally deferred.
