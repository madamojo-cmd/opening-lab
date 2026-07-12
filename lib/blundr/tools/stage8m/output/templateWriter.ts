import { mkdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { Stage8MScenario } from '../types';

export function writeTemplates(outputDir: string, scenarios: Stage8MScenario[]) {
  mkdirSync(outputDir, { recursive: true });
  const template = `export const STAGE8M_GENERATED_SCENARIOS = ${JSON.stringify(scenarios, null, 2)};\n`;
  writeFileSync(path.join(outputDir, 'generated-stage8m.ts'), template);
}
