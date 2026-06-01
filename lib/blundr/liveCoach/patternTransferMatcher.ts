import type { PatternSignalSet } from "./liveCoachTypes";

export function matchPatternTransfer(input: {
  weakConcepts: string[];
  centerState?: string;
  kingSafety?: string;
  openFiles?: string[];
  plausiblePawnBreaks?: string[];
}): PatternSignalSet {
  const connectedConcepts: PatternSignalSet["connectedConcepts"] = [];

  if (input.plausiblePawnBreaks?.includes("d4")) {
    connectedConcepts.push({ conceptId: "prepare_center_break", strength: 0.85, reason: "d4 break remains relevant" });
  }
  if (input.kingSafety === "watch_center" || input.kingSafety === "exposed") {
    connectedConcepts.push({ conceptId: "castle_for_safety", strength: 0.78, reason: "king safety still unresolved" });
  }
  if (input.openFiles?.includes("e")) {
    connectedConcepts.push({ conceptId: "open_file_rook", strength: 0.72, reason: "e-file supports rook activity" });
  }
  if (input.centerState === "tense") {
    connectedConcepts.push({ conceptId: "center_tension", strength: 0.8, reason: "central tension still decides activity" });
  }

  return {
    connectedConcepts,
    weakConceptMatches: input.weakConcepts,
    transferOpportunity: connectedConcepts.length > 0,
    reviewRelevance: Math.min(1, 0.2 + connectedConcepts.length * 0.2 + input.weakConcepts.length * 0.15),
  };
}
