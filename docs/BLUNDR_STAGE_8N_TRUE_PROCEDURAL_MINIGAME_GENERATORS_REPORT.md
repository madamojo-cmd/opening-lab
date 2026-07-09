# Stage 8N True Procedural Minigame Generators Report

- Branch: `work/v2.10.7n-true-minigame-generators`
- Commit: pending final commit hash
- Tag: pending `checkpoint-v2.10.7n-true-minigame-generators`
- Starting checkpoint: `docs/BLUNDR_STAGE_8M_MINIGAME_PRODUCTION_HARDENING_REPORT.md`
- Why this pass was needed: Stage 8M improved depth, but the underlying system still leaned on static pools and safe transforms. Stage 8N replaces that with registry-backed procedural generators that build chess positions, validate the objective, verify the solution, classify difficulty, and apply novelty cooldown before returning a scenario.
- Previous depth path: superseded. The transform-backed/static-template path is no longer the normal content source.

## Architecture files created

Core generation stack:
- `lib/blundr/daily/miniGames/generation/miniGameGenerationTypes.ts`
- `lib/blundr/daily/miniGames/generation/miniGameSeededRandom.ts`
- `lib/blundr/daily/miniGames/generation/miniGameBoardGeometry.ts`
- `lib/blundr/daily/miniGames/generation/miniGameFenBuilder.ts`
- `lib/blundr/daily/miniGames/generation/miniGamePiecePlacement.ts`
- `lib/blundr/daily/miniGames/generation/miniGameMoveRules.ts`
- `lib/blundr/daily/miniGames/generation/miniGameAttackMaps.ts`
- `lib/blundr/daily/miniGames/generation/miniGamePathfinding.ts`
- `lib/blundr/daily/miniGames/generation/miniGamePawnRace.ts`
- `lib/blundr/daily/miniGames/generation/miniGameEndgameGeometry.ts`
- `lib/blundr/daily/miniGames/generation/miniGameScenarioValidation.ts`
- `lib/blundr/daily/miniGames/generation/miniGameObjectiveValidation.ts`
- `lib/blundr/daily/miniGames/generation/miniGameSolutionVerifier.ts`
- `lib/blundr/daily/miniGames/generation/miniGameDifficultyClassifier.ts`
- `lib/blundr/daily/miniGames/generation/miniGameScenarioNovelty.ts`
- `lib/blundr/daily/miniGames/generation/miniGameScenarioTransforms.ts`
- `lib/blundr/daily/miniGames/generation/miniGameCandidateFactory.ts`
- `lib/blundr/daily/miniGames/generation/miniGameLegacyAdapter.ts`
- `lib/blundr/daily/miniGames/generation/miniGamePatternBuilders.ts`
- `lib/blundr/daily/miniGames/generation/generatedMiniGameRegistry.ts`

Dedicated generator modules:
- `lib/blundr/daily/miniGames/generation/generators/tacticShotsGenerator.ts`
- `lib/blundr/daily/miniGames/generation/generators/keySquareConquestGenerator.ts`
- `lib/blundr/daily/miniGames/generation/generators/structureBuilderGenerator.ts`
- `lib/blundr/daily/miniGames/generation/generators/imbalanceArenaGenerator.ts`
- `lib/blundr/daily/miniGames/generation/generators/techniqueLabGenerator.ts`
- `lib/blundr/daily/miniGames/generation/generators/kingRaceGenerator.ts`
- `lib/blundr/daily/miniGames/generation/generators/knightGymnasiumGenerator.ts`
- `lib/blundr/daily/miniGames/generation/generators/pawnWarsGenerator.ts`

Tests created or updated:
- `lib/blundr/daily/__tests__/dailyMiniGameTrueGeneratorArchitecture.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameObjectiveValidation.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameSolutionVerifier.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameDifficultyClassifier.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameNoveltyCooldown.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameGeneratorDepth.test.ts`

Wiring updated:
- `lib/blundr/daily/miniGames/dailyMiniGameRegistry.ts`

## Architecture summary

The public entry point is registry-backed:

`generateMiniGameScenario({ miniGameId, seed, difficulty, source, userBoardPreference, recentScenarioKeys, dateKey, userId })`

It now does the intended pipeline:
procedural generator -> legal chess validation -> objective validation -> solution verification -> difficulty classification -> novelty ranking -> fallback only if generation fails.

Normal scenarios are procedural:
- `metadata.generatorKind === "procedural"`
- `metadata.usedStaticFallback === false`

Fallback scenarios are still available, but only when generation attempts fail.

## Per-game implementation table

| game id | procedural generator file | families implemented | objective validator | solution verifier | difficulty classifier | unique keys /100 | /150 | /250 | fallback present | static fallback only? | launch ready? |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| `tactic_shots` | `generators/tacticShotsGenerator.ts` | knight fork, bishop pin, rook skewer, queen double attack, discovered attack, back rank, deflection, overloaded defender, removal of guard, clearance tactic | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 73 | 97 | 148 | yes | no | no, browser QA still pending |
| `key_square_conquest` | `generators/keySquareConquestGenerator.ts` | knight outpost, rook invasion square, king entry square, passed-pawn key square, blockade square, central control square, weak color complex, anchor square | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 89 | 123 | 184 | yes | no | no, browser QA still pending |
| `structure_builder` | `generators/structureBuilderGenerator.ts` | French break, Caro-Kann break, minority attack, IQP advance, hanging pawn advance, backward pawn repair, passed pawn breakthrough, locked center flank break, pawn-chain base attack, structure repair | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 82 | 115 | 156 | yes | no | no, browser QA still pending |
| `imbalance_arena` | `generators/imbalanceArenaGenerator.ts` | bishop pair open, good knight bad bishop, rook activity open file, exchange-sac compensation, queen vs pieces, space advantage, opposite-colored bishop attack, material down initiative, avoid bad trade, favorable trade | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 91 | 124 | 183 | yes | no | no, browser QA still pending |
| `technique_lab` | `generators/techniqueLabGenerator.ts` | direct opposition, distant opposition, triangulation, zugzwang, rook behind passed pawn, rook cutoff, Lucena-like bridge, Philidor-like defense, outside passer, simplification | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 80 | 110 | 159 | yes | no | no, browser QA still pending |
| `king_race` | `generators/kingRaceGenerator.ts` | king catches pawn, king cannot catch pawn, key square race, opposition entry, shouldering path, outside passer race, spare tempo race, stop passer | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 94 | 134 | 211 | yes | no | no, browser QA still pending |
| `knight_gymnasium` | `generators/knightGymnasiumGenerator.ts` | one move target, one move fork, two step route, outpost route, defensive jump, trap avoidance, attack key square, quiet reroute | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 87 | 123 | 181 | yes | no | no, browser QA still pending |
| `pawn_wars` | `generators/pawnWarsGenerator.ts` | basic promotion race, outside passer, connected passer breakthrough, protected passer, king supports pawn, spare tempo, capture choice, square of the pawn, breakthrough sacrifice, hold draw | `validateMiniGameObjective` | `verifyMiniGameSolution` | `classifyMiniGameDifficulty` | 84 | 120 | 164 | yes | no | no, browser QA still pending |

## Per-game implementation notes

- `tactic_shots`: procedurally selects tactical motifs and builds legal king/slider/knight candidates from placement grammar.
- `key_square_conquest`: procedurally places the key-square geometry, including king entry, outposts, invasions, and blockade squares.
- `structure_builder`: procedurally builds pawn skeletons and pawn-break / repair positions.
- `imbalance_arena`: procedurally constructs material and positional imbalance boards from piece placement and analysis signals.
- `technique_lab`: procedurally builds simplified endgame geometry and conversion patterns.
- `king_race`: procedurally builds king-pawn race geometry and opposition boards.
- `knight_gymnasium`: procedurally builds knight geometry, target routes, and fork/trap motifs.
- `pawn_wars`: procedurally builds pawn-race and promotion-timing boards.

## Objective validation summary

The validators now prove the game idea instead of just checking that a move exists.

- `tactic_shots`: verifies fork, pin, skewer, discovered attack, back-rank, deflection, overloaded defender, removal-of-guard, and clearance claims against the post-move attack map.
- `key_square_conquest`: verifies outposts, invasions, king entry, blockade, and key-square control/occupation.
- `structure_builder`: verifies a pawn skeleton exists, the structure changes, and the move matches a real pawn-structure idea.
- `imbalance_arena`: verifies the board actually contains an imbalance and the move preserves or exploits it.
- `technique_lab`: verifies endgame geometry such as opposition, triangulation, rook cutoff, and conversion patterns.
- `king_race`: verifies the king move improves the race geometry and respects the target square / opposition context.
- `knight_gymnasium`: verifies the knight move, fork target, and route improvement.
- `pawn_wars`: verifies pawn legality and promotion-race calculability.

## Solution verification summary

- `verifyMiniGameSolution` now checks the primary move is legal.
- It then requires the objective validator to pass.
- It rejects illegal accepted moves.
- The verified result is written into `scenario.solution.verification`.
- The architecture test confirmed the generated scenarios store verified solution metadata.

## Difficulty classifier summary

- Difficulty is derived from scenario complexity, not seed labels.
- Inputs used: complexity, decoy count, blocker count, route length, forcing pressure, material balance, and candidate count.
- Thresholds:
  - `easy` below 34
  - `medium` below 68
  - `hard` otherwise

## Fallback summary

- Every generator exposes `buildFallbackScenario`.
- Normal path: `usedStaticFallback === false`.
- Forced failure test: `king_race` returned a valid fallback scenario with `usedStaticFallback === true`.
- Fallbacks are valid, playable, and still pass scenario validation.

## Novelty and cooldown

- `recentScenarioKeys` now ranks unseen scenarios before seen ones.
- Among seen candidates, the least-recent entry wins.
- The cooldown ranking was corrected during this pass so it no longer prefers the newest repeat.
- Same-seed generation reproduces the same `scenarioKey`.
- Next-scenario selection avoids immediate repeats when alternatives exist.
- Daily and standalone scenarios stay source-qualified because `scenarioKey` includes the source.

## Source guard verification

Verified by the regression tests and by the generated scenario path:
- `source === "daily_deck"` stays on the daily deck path.
- `source === "standalone_review"` stays on the standalone path.
- Standalone minigames do not complete Daily Blundr.
- Daily deck minigames still count when `source === "daily_deck"`.

## Board orientation verification

- Generated scenarios lock orientation with `lockedOrientation: true`.
- The board orientation stability test passed.
- The procedural scenario path keeps orientation consistent with the generated scenario contract.

## Remaining transform use

Transforms are now supporting grammar only.

- Placement helpers and orientation normalization are still used to build legal positions.
- `miniGameScenarioTransforms.ts` is used for scaffold-level board transforms, not as the content source.
- The content source is the procedural generator registry plus chess-logic validation.
- No minigame is selected from a static scenario pool on the normal path.

## Files changed in this pass

Created:
- all files under `lib/blundr/daily/miniGames/generation/`
- `lib/blundr/daily/__tests__/dailyMiniGameTrueGeneratorArchitecture.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameObjectiveValidation.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameSolutionVerifier.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameDifficultyClassifier.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameNoveltyCooldown.test.ts`
- `lib/blundr/daily/__tests__/dailyMiniGameGeneratorDepth.test.ts`

Modified:
- `lib/blundr/daily/miniGames/dailyMiniGameRegistry.ts`

Protected path audit:
- No changes were made to `components/board/*`
- No changes were made to `lib/blundr/board/*`
- No changes were made to `lib/blundr/openings/*`
- No changes were made to `lib/blundr/engine/*`
- No changes were made to `lib/blundr/coach/*`
- No changes were made to `lib/blundr/presentation/*`
- No changes were made to `lib/blundr/visual/*`
- No changes were made to `lib/blundr/maia/*`
- No changes were made to `lib/blundr/rewards/rewardGrantService.ts`
- No changes were made to `public/stockfish/*`
- No changes were made to `supabase/*`
- No changes were made to `app/api/blundr/*`

## Tests run

New architecture and validation tests:
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameTrueGeneratorArchitecture.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameObjectiveValidation.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameSolutionVerifier.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameDifficultyClassifier.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameNoveltyCooldown.test.ts`

Depth and regression tests:
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameGeneratorDepth.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameVariability.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameScenarioValidation.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyGeneratedMiniGameSourceGuards.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameStandalonePractice.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameBoardOrientationStability.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyMiniGameBoardThemeConsistency.test.ts`
- `node --import tsx lib/blundr/daily/__tests__/dailyBlundrBoardThemeConsistency.test.ts`

Measured daily deck uniqueness on the procedural path:
- `tactic_shots`: 73 / 97 / 148
- `key_square_conquest`: 89 / 123 / 184
- `structure_builder`: 82 / 115 / 156
- `imbalance_arena`: 91 / 124 / 183
- `technique_lab`: 80 / 110 / 159
- `king_race`: 94 / 134 / 211
- `knight_gymnasium`: 87 / 123 / 181
- `pawn_wars`: 84 / 120 / 164

## Build result

- `ps -ef | grep "next build" | grep -v grep || true`
- `rm -f .next/lock`
- `npm run build`

Result: passed.

## Manual browser QA result

Not run in this environment.

Remaining limitation:
- Browser-width QA at 375px, 390px, and 414px is still required before this can be treated as fully browser-verified.

## Explicit answers

- Did every minigame get a dedicated procedural generator module? Yes.
- Does every generator construct positions from chess logic? Yes.
- Are static scenarios now fallback-only or scaffold-only? Yes.
- Does every game have objective validation? Yes.
- Does every game have solution verification? Yes.
- Does every game classify difficulty from scenario complexity? Yes.
- Does every game pass 32+ unique keys across 100 seeds? Yes.
- Which games pass 64+ unique keys across 150 seeds? All eight games.
- Which games pass 100+ unique keys across 250 seeds? All eight games.
- Does same seed reproduce same scenarioKey? Yes.
- Does Next Scenario avoid immediate repeats? Yes.
- Can standalone minigames complete Daily Blundr? No.
- Can Daily deck minigames count when `source === daily_deck`? Yes.
- Did manual browser QA pass? No.
- Did tests pass? Yes.
- Did `npm run build` pass? Yes.
- Did I avoid `package.json` and `package-lock.json` unless required? Yes.
- Did I avoid `git add .`? Yes.

## Known limitations

- Manual browser QA still needs to be done on real phone-width viewports.
- Some generator families still use compact family scaffolds for legal piece placement, but those scaffolds are now behind the procedural registry and validator/verifier pipeline.
- Fallback scenarios remain available as last resort.

## Recommended next step

Run browser QA on:
- `/`
- `/daily`
- `/review`
- `/progress`
- `/settings`
- `/repertoire`
- `/review/minigames/king_race`
- `/review/minigames/knight_gymnasium`
- `/review/minigames/pawn_wars`
- `/review/minigames/tactic_shots`
- `/review/minigames/key_square_conquest`
- `/review/minigames/structure_builder`
- `/review/minigames/imbalance_arena`
- `/review/minigames/technique_lab`

Use 375px, 390px, and 414px widths, then finalize the commit/tag/push once the browser pass is complete.
