import type { DifficultyBand, GeneratorContext, MiniGameGenerator, MiniGameId, Rejection, Stage8MScenario } from './types';
import { createSeededRng } from './rng';
import { loadOpeningFrames } from './sourceLoaders/openingFrameLoader';
import { loadCandidateMoves } from './sourceLoaders/candidateMoveLoader';
import { keySquareConquestGenerator } from './generators/keySquareConquestGenerator';
import { structureBuilderGenerator } from './generators/structureBuilderGenerator';
import { imbalanceArenaGenerator } from './generators/imbalanceArenaGenerator';
import { techniqueLabGenerator } from './generators/techniqueLabGenerator';
import { kingRaceGenerator } from './generators/kingRaceGenerator';
import { pawnWarsGenerator } from './generators/pawnWarsGenerator';
import { writeDatasets } from './output/datasetWriter';
import { createAuditReport } from './audit/auditReport';
import { writeHumanAudit } from './audit/humanAuditExport';
import { mkdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

export interface DatabaseBuildOptions { outputDir: string; reportPath: string; auditOutput: string; seed: string; maxPerGame: number; only?: MiniGameId; openingNodesJsonl?: string; openingNodesCsv?: string; candidateMovesJsonl?: string; candidateMovesCsv?: string; }
const generators: MiniGameGenerator[] = [keySquareConquestGenerator, structureBuilderGenerator, imbalanceArenaGenerator, techniqueLabGenerator, kingRaceGenerator, pawnWarsGenerator];
export function createGeneratorContext(seed: string, maxPerGame: number, sourceFrames: GeneratorContext['sourceFrames']): GeneratorContext {
  const perBand = Math.ceil(maxPerGame / 5); const difficultyTargets = Object.fromEntries((['intro', 'easy', 'medium', 'hard', 'expert'] as DifficultyBand[]).map((b) => [b, perBand])) as Record<DifficultyBand, number>;
  return { seed, maxPerGame, difficultyTargets, sourceFrames, rng: createSeededRng(seed), options: { requireEngineReview: false, requireTablebaseReview: false, allowHumanAuditOnly: true, minQualityScore: 75 } };
}
export async function buildStage8MDatabase(options: DatabaseBuildOptions) {
  const sourceFrames = await loadOpeningFrames(options.openingNodesJsonl); const candidateMoves = await loadCandidateMoves(options.candidateMovesJsonl, new Set(sourceFrames.map((f) => f.sourceId))); for (const frame of sourceFrames) frame.candidateMoves = candidateMoves.get(frame.sourceId) ?? []; const selected = options.only ? generators.filter((g) => g.id === options.only) : generators;
  if (options.only && !selected.length) throw new Error(`Unsupported --only value: ${options.only}`);
  const accepted: Stage8MScenario[] = []; const rejected: Rejection[] = [];
  for (const generator of selected) { const result = generator.generate(createGeneratorContext(`${options.seed}:${generator.id}`, options.maxPerGame, sourceFrames)); accepted.push(...result.accepted); rejected.push(...result.rejected); }
  writeDatasets(options.outputDir, accepted, selected.map((g) => g.id)); const report = createAuditReport({ seed: options.seed, accepted, rejected, maxPerGame: options.maxPerGame, only: options.only, sourceFrameCount: sourceFrames.length });
  writeHumanAudit(options.auditOutput, accepted, rejected); mkdirSync(path.dirname(options.reportPath), { recursive: true }); writeFileSync(options.reportPath, report);
  return { scenarios: accepted, rejected, report, sourceFrameCount: sourceFrames.length };
}
