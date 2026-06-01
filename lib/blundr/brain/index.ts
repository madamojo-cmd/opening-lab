// Blundr Brain public exports (v2.7.39.2+)
// Per Coach-First Roadmap v2.0 — the future single source of coach intelligence.

export * from "./types";
export { analyzeBlundrPosition, type AnalyzeBlundrPositionInput } from "./analyzeBlundrPosition";
export { buildHintLadder, type HintLadderInput, type HintLadderOutput, type HintLevel } from "./hints/buildHintLadder"; // v2.7.40 Agent 4

// v2.7.42 Deterministic Coach Deployment Lock
export { buildEvidenceGraph, type EvidenceGraph } from "./buildEvidenceGraph";
export * from "./providers/moveSemanticsProvider";
export * from "./providers/openingContextProvider";
export * from "./providers/boardTruthProvider";

// Compiler (consumes EvidenceGraph)
export * from "../coachCompiler";
