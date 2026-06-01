/**
 * CoachSafetyGate.ts
 * v2.7.42 - Central hard safety layer.
 * All coach output must pass through here before reaching VisibleTeachingSurface.
 */

import { checkTargetInvariant, type TargetInvariantInput } from "./targetInvariantGuard";
import { detectPlainLeaks, type PlainLeakInput } from "./plainLeakDetector";
import { validateClaims, type ClaimEvidenceInput } from "./claimEvidenceValidator";
import { applyStockfishEvidenceRestrictions } from "./stockfishEvidenceGate";
import type { StockfishTop10GateResult } from "../engine/stockfishTop10Gate";

export interface CoachSafetyInput {
  frameKind: string;
  instructionTargetUci: string | null;
  instructionTargetPieceType: string | null;
  compiledCoach: {
    targetUci: string | null;
    targetPieceType: string | null;
    coachMoveUci?: string | null;
    coachPieceType?: string | null;
    visualMoveUci?: string | null;
    showMoreTargetUci?: string | null;
    assisted?: { title: string; body: string } | null;
    plain?: { hint: string | null } | null;
    showMore?: { title: string | null; body: string | null } | null;
    visualIntents?: any[];
  };
  evidenceClaimIds: string[];
  displayMode: "assisted" | "plain";
  showMoreClicked: boolean;

  // v2.7.42 Stockfish evidence (optional, for claim gating)
  stockfishTop10?: import("../engine/stockfishTop10Gate").StockfishTop10GateResult | null;
}

export interface CoachSafetyResult {
  isSafe: boolean;
  blockedReasons: string[];
  criticalIssues: string[];
}

export function applyCoachSafetyGate(input: CoachSafetyInput): CoachSafetyResult {
  const blocked: string[] = [];
  const issues: string[] = [];

  // 1. Target Invariant Guard (highest priority)
  const invariantInput: TargetInvariantInput = {
    instructionTargetUci: input.instructionTargetUci,
    instructionTargetPieceType: input.instructionTargetPieceType,
    coachMoveUci: input.compiledCoach.coachMoveUci ?? input.compiledCoach.targetUci,
    coachPieceType: input.compiledCoach.coachPieceType ?? input.compiledCoach.targetPieceType,
    visualMoveUci: input.compiledCoach.visualMoveUci ?? input.compiledCoach.targetUci,
    showMoreTargetUci: input.compiledCoach.showMoreTargetUci ?? input.compiledCoach.targetUci,
  };

  const invariantResult = checkTargetInvariant(invariantInput);
  if (!invariantResult.passed) {
    blocked.push(...invariantResult.mismatches);
    issues.push(...invariantResult.mismatches.map(m => `target_invariant_violation:${m}`));
  }

  // 2. Plain Leak Detector
  const plainInput: PlainLeakInput = {
    displayMode: input.displayMode,
    showMoreClicked: input.showMoreClicked,
    coachText: [
      input.compiledCoach.assisted?.title,
      input.compiledCoach.assisted?.body,
      input.compiledCoach.showMore?.title,
      input.compiledCoach.showMore?.body,
    ].filter(Boolean).join(" "),
    hintText: input.compiledCoach.plain?.hint,
    visualIntents: input.compiledCoach.visualIntents || [],
  };

  const leakResult = detectPlainLeaks(plainInput);
  if (leakResult.hasLeak) {
    blocked.push(...leakResult.leaks);
  }

  // 3. Claim Evidence Validator
  const claimText = [
    input.compiledCoach.assisted?.title,
    input.compiledCoach.assisted?.body,
    input.compiledCoach.showMore?.title,
    input.compiledCoach.showMore?.body,
  ].filter(Boolean).join(" ");

  const claimResult = validateClaims({
    coachText: claimText,
    evidenceClaimIds: input.evidenceClaimIds,
  });

  if (!claimResult.valid) {
    blocked.push(...claimResult.violations);
  }

  // 4. Frame kind guards
  if (input.frameKind === "branch_transition") {
    if (input.compiledCoach.targetUci || input.compiledCoach.assisted || input.compiledCoach.visualMoveUci) {
      blocked.push("branch_transition_has_move_coach_or_visual");
    }
  }

  if (input.frameKind === "thinking" || input.frameKind === "terminal") {
    if (input.compiledCoach.targetUci) {
      blocked.push("non_teaching_frame_has_target_coach");
    }
  }

  // 5. v2.7.42 Stockfish top-10 evidence restrictions (claim gating only)
  if (input.stockfishTop10) {
    const stockfishRestrictions = applyStockfishEvidenceRestrictions(input.stockfishTop10);
    // Merge blocked claims
    blocked.push(...stockfishRestrictions.blockedClaims.map((c) => `stockfish_blocked:${c}`));
  }

  return {
    isSafe: blocked.length === 0,
    blockedReasons: blocked,
    criticalIssues: issues,
  };
}
