export interface SessionCoachMemory {
  wrongAttemptsByConcept: Record<string, number>;
  hintUsesByConcept: Record<string, number>;
  answerRevealsByConcept: Record<string, number>;
  selectedOpportunityHistory: string[];
  templateIdHistory: string[];
  utteranceFamilyHistory: string[];
  bodyHashHistory: string[];
  repeatedGenericThemes: string[];
}

export function createSessionCoachMemory(): SessionCoachMemory {
  return {
    wrongAttemptsByConcept: {},
    hintUsesByConcept: {},
    answerRevealsByConcept: {},
    selectedOpportunityHistory: [],
    templateIdHistory: [],
    utteranceFamilyHistory: [],
    bodyHashHistory: [],
    repeatedGenericThemes: [],
  };
}

export function hashCoachBody(body: string): string {
  let hash = 0;
  for (let i = 0; i < body.length; i += 1) hash = (hash * 31 + body.charCodeAt(i)) | 0;
  return String(hash >>> 0);
}
