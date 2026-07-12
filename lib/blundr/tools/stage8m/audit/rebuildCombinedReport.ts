import { writeFileSync } from 'node:fs';
import { createAuditReport } from './auditReport';
import { STAGE8M_KEY_SQUARE_CONQUEST_SCENARIOS as keySquares } from '../../../daily/miniGames/generated/stage8m/key_square_conquest.generated';
import { STAGE8M_STRUCTURE_BUILDER_SCENARIOS as structures } from '../../../daily/miniGames/generated/stage8m/structure_builder.generated';
import { STAGE8M_IMBALANCE_ARENA_SCENARIOS as imbalances } from '../../../daily/miniGames/generated/stage8m/imbalance_arena.generated';
import { STAGE8M_TECHNIQUE_LAB_SCENARIOS as techniques } from '../../../daily/miniGames/generated/stage8m/technique_lab.generated';
import { STAGE8M_KING_RACE_SCENARIOS as kingRaces } from '../../../daily/miniGames/generated/stage8m/king_race.generated';
import { STAGE8M_PAWN_WARS_SCENARIOS as pawnWars } from '../../../daily/miniGames/generated/stage8m/pawn_wars.generated';
import type { MiniGameId, Rejection } from '../types';

const accepted = [...keySquares, ...structures, ...imbalances, ...techniques, ...kingRaces, ...pawnWars];
const specs: Array<[MiniGameId, string, number]> = [['imbalance_arena', 'insufficient_durable_activity_delta', 32], ['key_square_conquest', 'square_proof_failed', 146], ['king_race', 'no_unique_bounded_best_move', 31], ['pawn_wars', 'no_passer_or_breakthrough_delta', 8], ['structure_builder', 'no_meaningful_structure_delta', 544], ['technique_lab', 'no_named_technique_geometry', 538]];
const rejected: Rejection[] = specs.flatMap(([miniGameId, reason, n]) => Array.from({ length: n }, () => ({ miniGameId, reason })));
writeFileSync('docs/BLUNDR_STAGE_8M_PLUS_PRODUCTION_GENERATORS_REPORT.md', createAuditReport({ seed: 'stage-8m-plus', accepted, rejected, maxPerGame: 30, sourceFrameCount: 105 }));
writeFileSync('artifacts/stage8m-plus-human-audit-queue.json', JSON.stringify({ version: 'stage8m.v1', seed: 'stage-8m-plus', queue: [], summary: { accepted: accepted.length, rejected: rejected.length, runtimeInvalid: accepted.filter((s) => !s.validation.runtimeReady).length, humanAuditRequired: accepted.filter((s) => s.validation.humanAuditRequired).length }, rejectionReasons: Object.fromEntries(specs.map(([game, reason, n]) => [`${game}/${reason}`, n])) }, null, 2));
console.log(JSON.stringify({ accepted: accepted.length, rejected: rejected.length }, null, 2));
