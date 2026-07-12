#!/usr/bin/env tsx
import type { MiniGameId } from './types';
import { buildStage8MDatabase } from './databaseBuilder';
const allowed = new Set<MiniGameId>(['key_square_conquest', 'structure_builder', 'imbalance_arena', 'technique_lab', 'king_race', 'pawn_wars']);
function args(argv: string[]): Record<string, string> { const out: Record<string, string> = {}; for (let i = 0; i < argv.length; i += 1) if (argv[i].startsWith('--')) { const k = argv[i].slice(2); out[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'; } return out; }
async function main() { const a = args(process.argv.slice(2)); const only = a.only as MiniGameId | undefined; if (only && !allowed.has(only)) throw new Error(`Invalid --only ${only}. Expected: ${[...allowed].join(', ')}`);
  const result = await buildStage8MDatabase({ outputDir: a.output ?? 'lib/blundr/daily/miniGames/generated/stage8m', reportPath: a.report ?? 'docs/BLUNDR_STAGE_8M_PLUS_PRODUCTION_GENERATORS_REPORT.md', auditOutput: a['audit-output'] ?? 'artifacts/stage8m-plus-human-audit-queue.json', seed: a.seed ?? 'stage-8m-plus', maxPerGame: Number(a['max-per-game'] ?? 100), only, openingNodesJsonl: a['opening-nodes-jsonl'], openingNodesCsv: a['opening-nodes-csv'], candidateMovesJsonl: a['candidate-moves-jsonl'], candidateMovesCsv: a['candidate-moves-csv'] });
  const counts = result.scenarios.reduce<Record<string, number>>((x, s) => ({ ...x, [s.miniGameId]: (x[s.miniGameId] ?? 0) + 1 }), {}); console.log(JSON.stringify({ accepted: counts, rejected: result.rejected.length, sourceFrames: result.sourceFrameCount }, null, 2)); }
main().catch((error) => { console.error(error instanceof Error ? error.stack : error); process.exitCode = 1; });
