export type CoachSafetyIssueCode =
  | "type_target_mismatch"
  | "type_piece_mismatch"
  | "type_reveal_mismatch"
  | "type_visual_mismatch"
  | "type_show_more_mismatch"
  | "type_plain_leak"
  | "type_claim_without_evidence"
  | "type_legacy_bypass"
  | "type_stale_frame"
  | "type_illegal_target"
  | "type_unsafe_copy"
  | "type_provider_authority_violation";

export interface CoachSafetyIssue {
  code: CoachSafetyIssueCode;
  severity: "info" | "warning" | "critical";
  message: string;
  details?: Record<string, unknown>;
}

export interface CoachSafetyResult {
  allowed: boolean;
  issues: CoachSafetyIssue[];
  criticalIssues: CoachSafetyIssue[];
  blockedReasons: string[];
  warningReasons: string[];
}
