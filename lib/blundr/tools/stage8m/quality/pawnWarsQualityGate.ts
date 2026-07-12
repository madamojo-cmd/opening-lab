export function passesPawnWarsQuality(p: Record<string, unknown>): boolean { return Number(p.searchDepth) >= 4 && Array.isArray(p.principalVariation) && Array.isArray(p.afterPassers); }
