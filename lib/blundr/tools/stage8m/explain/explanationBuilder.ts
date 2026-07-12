import type { Stage8MScenario } from '../types';
export function buildExplanation(input: { moveSan: string; concreteChange: string; alternatives: string[]; recognitionRule: string }): Stage8MScenario['pedagogy']['explanation'] {
  return { short: `${input.moveSan}: ${input.concreteChange}`, detailed: `${input.moveSan} is correct because ${input.concreteChange}. ${input.recognitionRule}`, coachNote: input.recognitionRule, whyAlternativesFail: input.alternatives };
}
