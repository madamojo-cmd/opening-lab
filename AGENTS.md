# Blundr Agent Rules

This document captures the non-negotiable rules for all agents working on Blundr.

## Non-negotiable Constraints

1. **Do not rebuild the app from scratch.** Modify existing files, add new modules under `/lib/`, patch specific behaviors. Do not replace the entire `app/page.tsx` component tree.

2. **Do not replace `chess.js` legal move validation.** All move legality must run through chess.js. No custom move validation engines.

3. **Do not let GPT/model decide legal moves.** The model may suggest moves, but chess.js must validate them before rendering.

4. **Do not let the model invent tactics, mates, checks, legal moves, arrows, or square coordinates.** The model output must select from bounded enums and verified candidate sets only.

5. **Do not display random legal fallback moves as user-facing recommendations.** If Stockfish is unavailable, use deterministic rule-based logic or explicit fallback messaging. Do not show "here are 5 legal moves, pick one."

6. **Continuation recommendations must remain Stockfish-backed.** User-facing move suggestions must be validated by browser Stockfish (stockfish.js) or a backend Stockfish instance. Do not surface GPT-only recommendations as primary.

7. **Attack/Defense/Plan tabs must not refetch Brain/model on tab switch.** Tab switching is a UI-only concern. Cached model output should be reused across tab views.

8. **Old Brain/GPT/model responses must not overwrite the current FEN.** If the user moves forward after a model response is requested, and a new FEN is reached, the old response is stale and must not be rendered or used as source-of-truth.

9. **Knight moves must render as true L-shaped paths.** Knight geometry (2 squares in one direction, 1 in the perpendicular) must be detected and rendered correctly. No knight should appear to move diagonally or in a straight line.

10. **Book Complete and Continue vs Bot must keep working.** These game modes must maintain their current behavior: opening book traversal, play after the book, bot continuation mode, etc.

11. **Captured pieces, material advantage, stable eval display, game-over UI, selected-piece legal moves, settings, and move review must remain intact.** These are core v2.7.1 features that must not be removed or degraded.

12. **The model/future layer must fail safely back to deterministic/rule output.** If the model service is unavailable, the app must gracefully degrade to rule-based logic and explicit "fallback" messaging. The user must not experience silent fallbacks or misleading annotations.

## Implementation Strategy

- Create shared type contracts in `/lib/blundr/`.
- Use TypeScript enums and const assertions to bound model outputs.
- Extend the API routes (`/api/brain`, `/api/explorer`, etc.) without breaking existing behavior.
- Add helper functions and validators in `/lib/blundr/` before modifying core components.
- Do not import server-only code into client components (`"use client"`).
- Incremental testing: after each handoff, run `npm run build && npm run lint` to catch type errors early.

## Phase 0: Contracts and Enums (Handoff 01)

Create the formal type layer:
- `/lib/blundr/types.ts`: Core contract types
- `/lib/blundr/animationPackages.ts`: Animation ID enum
- `/lib/blundr/concepts.ts`: Concept ID enum
- `/lib/blundr/contextTemplates.ts`: Template-based coaching text
- `/lib/blundr/squareUtils.ts`: Board coordinate helpers
- `/lib/blundr/index.ts`: Central exports

## Future Phases

- Phase 1 (Handoff 02): Feature packet builder
- Phase 2 (Handoff 03): Verifier
- Phase 3 (Handoff 04): Rule visual selector
- Phase 4 (Handoffs 05–07): Model training pipeline
- Phase 5 (Handoff 08): FastAPI model server
- Phase 6 (Handoff 09): NextJS API bridge and model integration

---

**Last Updated:** 2026-05-11  
**Handoff:** blundr-onenet-v0/01_contracts_and_enums_handoff.md
