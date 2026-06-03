export type ProviderHealthStatus = "not_applicable" | "available" | "unavailable" | "timeout" | "error";

export type ProviderHealthMap = Record<string, ProviderHealthStatus>;

export function createProviderHealthMap(input?: Partial<ProviderHealthMap>): ProviderHealthMap {
  return {
    board_truth: "available",
    move_semantics: "available",
    tactical_motif: "available",
    strategic_feature: "available",
    opening_context: "available",
    visual_evidence: "available",
    stockfish: "not_applicable",
    maia: "not_applicable",
    opening_knowledge: "not_applicable",
    grounded_phrasing: "not_applicable",
    safety_gate: "not_applicable",
    ...(input ?? {}),
  };
}

export function markProviderStatus(
  health: ProviderHealthMap,
  provider: string,
  status: ProviderHealthStatus,
): ProviderHealthMap {
  return {
    ...health,
    [provider]: status,
  };
}
