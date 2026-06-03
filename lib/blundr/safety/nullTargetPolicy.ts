import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CoachSafetyIssue } from "./types";

function looksLikeMoveCoaching(text: string): boolean {
  const lower = text.toLowerCase();
  if (/\bplay\b/.test(lower)) return true;
  if (/\b[a-h][1-8][a-h][1-8][qrbn]?\b/.test(lower)) return true;
  if (/\bfrom\s+[a-h][1-8]\s+to\s+[a-h][1-8]\b/.test(lower)) return true;
  if (/\b(bishop|knight|rook|queen|king|pawn)\b/.test(lower) && /\bto\s+[a-h][1-8]\b/.test(lower)) return true;
  return false;
}

export function validateNullTargetFrame(input: {
  frame: CurrentInstructionFrame;
  compiled: CompiledCoachFrame;
}): CoachSafetyIssue[] {
  const issues: CoachSafetyIssue[] = [];
  if (input.frame.target) return issues;

  if (input.compiled.targetUci !== null || input.compiled.pieceType !== null || input.compiled.from !== null || input.compiled.to !== null) {
    issues.push({
      code: "null_target_move_coaching",
      severity: "critical",
      message: "Null-target frame must not include compiled move target metadata.",
      surface: "compiled",
    });
  }

  if (input.compiled.revealAction.kind === "reveal_target") {
    issues.push({
      code: "null_target_reveal",
      severity: "critical",
      message: "Null-target frame must not include reveal_target action.",
      surface: "reveal",
    });
  }

  const hasMoveVisual = input.compiled.visualIntents.some((intent) => intent.type === "move_arrow" || intent.type === "pressure_arrow");
  if (hasMoveVisual) {
    issues.push({
      code: "null_target_visual",
      severity: "critical",
      message: "Null-target frame must not include target-specific move visuals.",
      surface: "visual",
    });
  }

  const coachingText = `${input.compiled.assisted.title} ${input.compiled.assisted.body} ${input.compiled.showMore.title} ${input.compiled.showMore.body}`;
  if (looksLikeMoveCoaching(coachingText)) {
    issues.push({
      code: "null_target_move_coaching",
      severity: "critical",
      message: "Null-target frame contains move-coaching language.",
      surface: "assisted",
    });
  }

  if (
    input.frame.kind === "branch_complete"
    && input.compiled.revealAction.kind === "continue_from_here"
    && !input.frame.branchComplete?.continueFromHereAvailable
  ) {
    issues.push({
      code: "null_target_reveal",
      severity: "critical",
      message: "continue_from_here action present without branch-complete eligibility.",
      surface: "reveal",
    });
  }

  return issues;
}
