import type { CompiledCoachFrame } from "../coachCompiler/types";

export type CoachSafetyIssueSeverity =
  | "info"
  | "warning"
  | "critical";

export type CoachSafetyIssueCode =
  | "target_mismatch"
  | "piece_mismatch"
  | "reveal_mismatch"
  | "visual_mismatch"
  | "show_more_mismatch"
  | "assisted_show_more_mismatch"
  | "plain_leak"
  | "claim_without_evidence"
  | "unsupported_strong_claim"
  | "legacy_bypass"
  | "stale_frame"
  | "illegal_target"
  | "unsafe_copy"
  | "provider_authority_violation"
  | "null_target_move_coaching"
  | "null_target_visual"
  | "null_target_reveal"
  | "graph_target_mismatch"
  | "compiler_target_mismatch";

export interface CoachSafetyIssue {
  code: CoachSafetyIssueCode;
  severity: CoachSafetyIssueSeverity;
  message: string;
  surface:
    | "frame"
    | "graph"
    | "compiled"
    | "plain"
    | "assisted"
    | "show_more"
    | "visual"
    | "reveal"
    | "provider"
    | "legacy"
    | "unknown";
  expected?: string | null;
  actual?: string | null;
}

export interface CoachSafetyResult {
  allowed: boolean;
  issues: CoachSafetyIssue[];
  criticalIssues: CoachSafetyIssue[];
  blockedReasons: string[];
  fatalReasons: string[];
  recoverableReasons: string[];
  warningReasons: string[];
}

export interface SafetyGateOutput {
  result: CoachSafetyResult;
  safeFrame: CompiledCoachFrame;
  originalFrameBlocked: boolean;
}
