import { mkdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { MiniGameId, Stage8MScenario } from '../types';
const names: Record<MiniGameId, string> = { key_square_conquest: 'key_square_conquest.generated.ts', structure_builder: 'structure_builder.generated.ts', imbalance_arena: 'imbalance_arena.generated.ts', technique_lab: 'technique_lab.generated.ts', king_race: 'king_race.generated.ts', pawn_wars: 'pawn_wars.generated.ts' };
export function writeDatasets(outputDir: string, scenarios: Stage8MScenario[], selected: MiniGameId[]) { mkdirSync(outputDir, { recursive: true }); for (const game of selected) { const rows = scenarios.filter((s) => s.miniGameId === game); const constant = `STAGE8M_${game.toUpperCase()}_SCENARIOS`; writeFileSync(path.join(outputDir, names[game]), `import type { Stage8MScenario } from '../../../../tools/stage8m/types';\n\nexport const ${constant}: Stage8MScenario[] = ${JSON.stringify(rows, null, 2)};\n`); } }
