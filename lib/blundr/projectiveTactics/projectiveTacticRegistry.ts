import type { ProjectiveTacticConfidence, ProjectiveTacticKind } from "./projectiveTacticTypes";

export type ProjectiveTacticRegistryEntry = {
  label: string;
  enabledInE: boolean;
  confidenceRequired: ProjectiveTacticConfidence;
};

export const PROJECTIVE_TACTIC_REGISTRY: Record<ProjectiveTacticKind, ProjectiveTacticRegistryEntry> = {
  fork: {
    label: "Fork",
    enabledInE: true,
    confidenceRequired: "high",
  },
  knight_fork: {
    label: "Knight fork",
    enabledInE: true,
    confidenceRequired: "high",
  },
  pin: {
    label: "Pin",
    enabledInE: true,
    confidenceRequired: "high",
  },
  skewer: {
    label: "Skewer",
    enabledInE: false,
    confidenceRequired: "high",
  },
  discovered_attack: {
    label: "Discovered attack",
    enabledInE: false,
    confidenceRequired: "high",
  },
  discovered_check: {
    label: "Discovered check",
    enabledInE: false,
    confidenceRequired: "high",
  },
  double_attack: {
    label: "Double attack",
    enabledInE: false,
    confidenceRequired: "high",
  },
  xray_attack: {
    label: "X-ray",
    enabledInE: false,
    confidenceRequired: "high",
  },
  battery: {
    label: "Battery",
    enabledInE: false,
    confidenceRequired: "high",
  },
  overloaded_defender: {
    label: "Overloaded defender",
    enabledInE: false,
    confidenceRequired: "high",
  },
  hanging_piece: {
    label: "Hanging piece",
    enabledInE: false,
    confidenceRequired: "high",
  },
  trapped_piece: {
    label: "Trapped piece",
    enabledInE: false,
    confidenceRequired: "high",
  },
  back_rank_weakness: {
    label: "Back rank",
    enabledInE: false,
    confidenceRequired: "high",
  },
  mate_threat: {
    label: "Mate threat",
    enabledInE: false,
    confidenceRequired: "high",
  },
  removal_of_defender: {
    label: "Remove defender",
    enabledInE: false,
    confidenceRequired: "high",
  },
  deflection: {
    label: "Deflection",
    enabledInE: false,
    confidenceRequired: "high",
  },
  decoy: {
    label: "Decoy",
    enabledInE: false,
    confidenceRequired: "high",
  },
  clearance: {
    label: "Clearance",
    enabledInE: false,
    confidenceRequired: "high",
  },
  interference: {
    label: "Interference",
    enabledInE: false,
    confidenceRequired: "high",
  },
} as const;

export function isProjectiveTacticEnabledInE(kind: ProjectiveTacticKind): boolean {
  return PROJECTIVE_TACTIC_REGISTRY[kind]?.enabledInE === true;
}

export function getProjectiveTacticLabel(kind: ProjectiveTacticKind): string {
  return PROJECTIVE_TACTIC_REGISTRY[kind]?.label ?? "Tactic";
}
