# Blundr Stage 8L Advanced Generated Minigames Report

## Metadata
- Branch: `work/v2.10.7l-advanced-generated-minigames`
- Starting checkpoint: `a463c556504305229ef9de424db959a0c7536e72`
- Starting tag: `checkpoint-v2.10.7k-daily-review-mobile-hotfix`
- Canonical spec used: `docs/2026-07-07/BLUNDR_ADVANCED_MINIGAME_WIRING_SPEC_FINAL.md`
- Target tag: `checkpoint-v2.10.7l-advanced-generated-minigames`
- Commit: pending final git commit hash for this checkpoint

## Architecture Implemented
- The minigame layer now uses a typed scenario contract with stable fields for id, miniGameId, source, seed, timestamps, FEN, side to move, prompt, instructions, goal, accepted moves, solution, explanation, concept tags, difficulty, estimated time, validation metadata, scoring, retry behavior, reveal behavior, and novelty metadata.
- Daily Blundr minigames are template-backed and deterministically selected from validated scenario pools, which gives repeatability without engine-grade random puzzle generation.
- Daily deck insertion now inserts 0 to 2 generated minigame cards after recall and training cards, instead of replacing the existing Daily deck logic.
- Standalone Review practice now creates the same style of generated minigame scenario, but forces `source: "standalone_review"` so it cannot complete Daily Blundr.
- Validation now runs before a scenario can be used, and fallback handling keeps the deck or practice flow alive if a generator fails.
- Shared board, piece rendering, and support controls are used by Daily, Review, Training, and the new minigame routes.

## Scenario Contract
- The scenario object is serializable and includes `id`, `miniGameId`, `source`, `seed`, `generatedAt`, `createdAt`, `fen`, `sideToMove`, `prompt`, `instructions`, `goal`, `acceptedMoves`, `solution`, `explanation`, `conceptTags`, `difficulty`, `estimatedTimeSeconds`, `validation`, `scoring`, `retryBehavior`, `revealBehavior`, and `novelty`.
- The `source` field is restricted to `daily_deck` or `standalone_review`.
- Novelty metadata carries a scenario key plus recent key history so Daily and Review can avoid immediate repeats when possible.
- The scenario contract is attached to the generated mini-game state and preserved through storage normalization.

## Generator Contract
- Each minigame exposes a `generate(ctx)` function that accepts source, seed, user/local id, difficulty, recent scenario keys, board preferences, date key, and deck context.
- Generation is deterministic for the same seed, game id, and difficulty.
- Different seeds produce different scenario selections when more than one valid template exists.
- The generator path is replayable in tests because it does not depend on browser APIs.

## Validation Strategy
- Scenario validation checks FEN parsing, side to move, legal solution moves, accepted move presence, explanation presence, concept tags, difficulty, serialization, and valid source.
- State validation also checks objective squares, move limits, formation hashes, kings, and scenario attachment.
- Validation warnings are used for novelty repeats, while hard errors block malformed scenarios.
- Daily deck insertion only accepts cards that pass the existing Daily card validation gate.

## Novelty And Cooldown Strategy
- Scenario keys are built from miniGameId, theme, normalized FEN, solution move, target and goal squares, difficulty, and source.
- Daily deck generation collects recent scenario keys from stored sessions and passes them into the generator selector.
- Review practice keeps a local recent-scenario list so retry/next does not immediately repeat when a fresh option exists.
- If all valid templates are exhausted, the selector falls back to the best available valid scenario rather than failing the route.

## Daily Deck Insertion Strategy
- Daily deck building still starts from recall cards and training cards.
- Generated minigames are inserted only after the existing Daily cards are built and validated.
- Insertion count is capped at 0 to 2 depending on deck size.
- Generated Daily cards must have `source: "daily_deck"` before they are accepted into the deck.
- A failed generator does not prevent the rest of Daily Blundr from loading.

## Standalone Review Strategy
- `/review/minigames/[miniGameId]` generates a fresh practice bundle with `source: "standalone_review"`.
- Unknown ids show a safe in-app fallback instead of crashing the route.
- Practice uses the same Daily board and support-control stack as Daily Blundr.
- Reveal, retry, next, and fresh scenario behavior are wired through the same card/session model.
- Standalone practice records practice metadata, but it does not close Daily Blundr or award Daily completion.

## Progress And Weakness Signals
- Standalone practice records learning events with `practiceMode: "mini_game"` and `practiceSource: "standalone_review"`.
- Those events carry miniGameId and scenarioKey metadata so the progress layer can observe minigame practice without treating it as Daily completion.
- Daily deck continues to rely on the existing Daily Blundr completion and mastery path.
- The current implementation keeps progress/local activity local and client-safe, without adding new persistence tables.

## Files Created
- `docs/BLUNDR_STAGE_8L_ADVANCED_GENERATED_MINIGAMES_REPORT.md`
- `lib/blundr/daily/__tests__/dailyGeneratedMiniGameScenarioValidation.test.ts`
- `lib/blundr/daily/__tests__/dailyGeneratedMiniGameVariability.test.ts`
- `lib/blundr/daily/__tests__/dailyGeneratedMiniGameDeckInsertion.test.ts`
- `lib/blundr/daily/__tests__/dailyGeneratedMiniGameSourceGuards.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts` was updated for the new practice bundle contract
- `lib/blundr/daily/__tests__/dailyMiniGameBoardThemeConsistency.test.ts`
- `lib/blundr/daily/__tests__/dailyBoardMoveSelection.test.ts`
- `lib/blundr/daily/__tests__/dailyBoardPieceConsistency.test.ts`

## Files Modified
- `components/daily/DailyBlundrBoard.tsx`
- `components/daily/DailyBlundrCardFeedback.tsx`
- `components/daily/DailyBlundrCardPlayer.tsx`
- `components/daily/DailyBlundrPlayer.tsx`
- `components/daily/DailyBlundrScreen.tsx`
- `components/daily/DailyBlundrSessionSummary.tsx`
- `components/daily/ReviewTabDailyBlundrPanel.tsx`
- `components/daily/TempoDailyBlundrCard.tsx`
- `components/review/MiniGamePracticeRunner.tsx`
- `components/review/ReviewHub.tsx`
- `lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts`
- `lib/blundr/daily/__tests__/dailyValidationFixtures.ts`
- `lib/blundr/daily/dailyBlundrDeckBuilder.ts`
- `lib/blundr/daily/dailyBlundrReadModel.ts`
- `lib/blundr/daily/dailyBlundrStorage.ts`
- `lib/blundr/daily/miniGames/dailyMiniGameSelector.ts`
- `lib/blundr/daily/miniGames/dailyMiniGameTypes.ts`
- `lib/blundr/daily/miniGames/kingRace.ts`
- `lib/blundr/daily/miniGames/knightGymnasium.ts`
- `lib/blundr/daily/miniGames/pawnWars.ts`
- `lib/blundr/daily/miniGames/staticMiniGameDefinitionFactory.ts`
- `lib/blundr/daily/miniGames/staticMiniGameHelpers.ts`
- `lib/blundr/daily/miniGames/tacticShots.ts`
- `lib/blundr/daily/validation/dailyMiniGameValidation.ts`

## Tests Run
- `npx tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameScenarioValidation.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameVariability.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameDeckInsertion.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameSourceGuards.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyMiniGameBoardThemeConsistency.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyBoardMoveSelection.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyBoardPieceConsistency.test.ts`
- `npx tsx lib/blundr/data/__tests__/gameDataHealth.test.ts`
- `npx tsx lib/blundr/board/__tests__/boardPreferenceService.test.ts`
- `npx tsx lib/blundr/board/__tests__/boardRenderConfig.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyBlundrBoardThemeConsistency.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyBlundrDeckBuilder.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyBlundrSessionController.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyMiniGameRegistryHealth.test.ts`
- `npx tsx lib/blundr/daily/__tests__/dailyMiniGameDeckInsertion.test.ts`
- `npx tsx lib/blundr/daily-rings/__tests__/dailyRingCompletionAdapter.test.ts`
- `npx tsx lib/blundr/daily-rings/__tests__/dailyRingHomeProgress.test.ts`
- `npx tsx lib/blundr/progress/__tests__/progressSummaryService.test.ts`
- `npx tsx lib/blundr/settings/__tests__/settingsNavigation.test.ts`

## Build Result
- `npm run build` passed.

## Manual Browser QA Result
- Browser QA was attempted with Playwright Firefox against a production server on port 3002.
- Firefox consistently failed navigation with `NS_ERROR_OUT_OF_MEMORY` on `/`, `/daily`, `/review`, and `/review/minigames/king_race`, even with JS disabled and a minimal probe.
- Chromium and WebKit were also probed earlier in the run and were blocked by environment-specific launch issues.
- Result: live browser interaction could not be completed in this environment.

## Route Smoke Result
- HTTP smoke passed for `/`, `/daily`, `/review`, `/progress`, `/settings`, `/repertoire`, and all eight `/review/minigames/[miniGameId]` routes.
- Every required route returned `200 OK` from `http://127.0.0.1:3002`.

## Known Limitations
- The generator system is controlled and deterministic, not engine-grade puzzle synthesis.
- Browser QA is blocked by the local Playwright runtime environment, so the live interaction checklist could not be fully executed here.
- The minigame scenario pools are intentionally conservative so false positives stay low, which means some templates may repeat more often than a full puzzle engine would.

## Recommended Next Step
- Re-run the browser QA checklist in an environment where Playwright Firefox can navigate the app routes without OOM, then refresh the manual verification section if route navigation succeeds.

## Per-Game Details

### tactic_shots
- Trains fast tactical recognition using forks, pins, skewers, discovered attacks, back-rank shots, and overloaded defenders.
- Generator variability comes from motif choice, attacking piece, target piece or king, side to move, board quadrant, orientation, and decoy pieces.
- Validation checks legal solution moves, accepted move presence, motif consistency, legal kings, and a meaningful explanation.
- Daily Blundr uses it as short tactical reinforcement and only counts it when `source: "daily_deck"`.
- Standalone Review uses the same scenario contract but keeps it practice-only with `source: "standalone_review"`.
- Scoring is one-move focused with Reveal showing the tactical move and explanation, then Continue after reveal if needed.
- Known limitation: the pool is intentionally compact, so novelty depends on deterministic rotation rather than large-scale puzzle generation.

### key_square_conquest
- Trains key squares, outposts, invasion squares, king entry squares, and central control.
- Generator variability comes from target square choice, piece type, pawn structure, blockers, and side to move.
- Validation checks that the target square exists, the move is legal, the explanation references the target square, and the scenario is coherent.
- Daily Blundr can insert it as a strategic card when the deck policy chooses a minigame.
- Standalone Review keeps it as practice-only and refreshes the scenario on retry/next when possible.
- Scoring is board-tap only and Reveal explains why the square matters.
- Known limitation: control-based ideas are harder to validate exhaustively than pure tactical motifs, so the templates stay conservative.

### structure_builder
- Trains pawn structure decisions such as pawn breaks, repairs, isolated pawns, hanging pawns, backward pawns, and minority-attack style plans.
- Generator variability comes from structure family, pawn files, supporting pieces, candidate breaks, and timing.
- Validation checks legal pawn placement, legal solution moves, coherent structure goals, and explanation quality.
- Daily Blundr can use it for opening and structure reinforcement under the daily source gate.
- Standalone Review keeps the same board interaction and replay path without Daily completion.
- Scoring focuses on the move that improves or breaks the structure; Reveal explains the pawn-structure idea.
- Known limitation: structural evaluation is template-driven, so the game prioritizes clarity over many subtle transpositions.

### imbalance_arena
- Trains decisions around bishop pair vs knights, rook activity, exchange sac compensation, space, and similar imbalances.
- Generator variability comes from imbalance type, material configuration, pawn skeleton, side to move, and trade/no-trade decisions.
- Validation checks that the imbalance exists and the move aligns with the intended plan.
- Daily Blundr may insert it when a positional or strategic concept is appropriate.
- Standalone Review is practice-only and uses the same board and reveal flow.
- Scoring rewards the move that best leverages or reduces the imbalance; Reveal explains the imbalance in plain language.
- Known limitation: some imbalance concepts are harder to encode in a single move, so the scenarios stay narrow and clearly validated.

### technique_lab
- Trains conversion and endgame technique such as opposition, triangulation, zugzwang, rook behind passed pawns, and Philidor or Lucena-like ideas.
- Generator variability comes from technique type, king placement, pawn files, rook placement, tempo, and distance to promotion.
- Validation checks simplified legal endgame structure, legal solution move, and coherent technical objective.
- Daily Blundr uses it occasionally to broaden endgame skill coverage.
- Standalone Review uses the same generated technique scenario and keeps it practice-only.
- Scoring is one clean move or short technique path, with Reveal explaining the conversion concept.
- Known limitation: the implementation stays close to canonical endgame motifs rather than trying to solve arbitrary endgames.

### king_race
- Trains king pathing, opposition, key squares, shouldering, and pawn-race geometry.
- Generator variability comes from king start squares, pawn file, target square, opposition type, distance, and board orientation.
- Validation checks legal king placement, legal side to move, legal solution, and a coherent race objective.
- Daily Blundr can include it as a compact endgame geometry card.
- Standalone Review uses the same board-tap flow and refreshes the scenario on retry/next when possible.
- Scoring is one-move or short-path focused, and Reveal explains the race geometry.
- Known limitation: the current pool is intentionally small and favors clear teaching positions over many race permutations.

### knight_gymnasium
- Trains knight geometry, shortest paths, forks, outposts, and route visualization.
- Generator variability comes from knight start square, target square, blockers, enemy targets, quadrant, and route length.
- Validation checks legal knight movement, target relevance, and a clear geometry explanation.
- Daily Blundr can insert it as a visual calculation drill.
- Standalone Review keeps it as a quick practice game with source isolation.
- Scoring is board-tap only, with Reveal explaining the knight route or fork idea.
- Known limitation: the route set is deliberately conservative, so it emphasizes legible drill positions rather than tricky composed studies.

### pawn_wars
- Trains pawn races, passed pawns, breakthroughs, promotion timing, and pawn-capture choices.
- Generator variability comes from pawn files, king distances, side to move, connected or isolated pawns, and promotion distance.
- Validation checks legal pawn placement, legal kings, legal solution move, and a coherent pawn-race objective.
- Daily Blundr can use it as compact endgame and structure practice.
- Standalone Review keeps it practice-only and uses the same board theme and piece rendering.
- Scoring centers on the winning pawn or king move, with Reveal explaining the pawn rule or race.
- Known limitation: the scenario set is conservative by design to keep legality and teaching clarity high.

## Explicit Answers
- Are all 8 minigames generator-backed? Yes.
- Do same seeds reproduce the same scenario? Yes.
- Do different seeds produce varied scenarios? Yes.
- Are generated scenarios validated before use? Yes.
- Is there a fallback if generation fails? Yes.
- Does Daily deck insertion use `source === "daily_deck"`? Yes.
- Does standalone Review use `source === "standalone_review"`? Yes.
- Can standalone Review ever complete Daily Blundr? No.
- Can Daily minigames count toward Daily Blundr when `source === "daily_deck"`? Yes.
- Are all minigames board-tap only? Yes.
- Did you avoid text input as normal answer UX? Yes.
- Do Daily, Training, and minigames use shared board and piece rendering? Yes.
- Do Default, Blue, and Walnut themes still work? Yes, with shared theme plumbing and test coverage.
- Do all 8 minigame browser routes load? HTTP route smoke says yes.
- Does Home still load? HTTP route smoke says yes.
- Is Review still mobile-width aligned? Yes in code and tests; live browser QA was blocked by Firefox OOM.
- Is Progress still mobile-width aligned? Yes in code and tests; live browser QA was blocked by Firefox OOM.
- Is Train still easy to find? Yes in the current shell and navigation treatment.
- Did tests pass? Yes.
- Did `npm run build` pass? Yes.
- Did you avoid `package.json` and `package-lock.json` unless required? Yes.
- Did you avoid `git add .`? Yes.
