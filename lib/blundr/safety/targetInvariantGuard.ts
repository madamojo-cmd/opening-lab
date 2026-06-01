/**
 * targetInvariantGuard.ts
 * v2.7.42 - Enforces the absolute non-negotiable target binding invariant.
 */

export interface TargetInvariantInput {
  instructionTargetUci: string | null;
  instructionTargetPieceType: string | null;
  coachMoveUci: string | null;
  coachPieceType: string | null;
  visualMoveUci: string | null;
  showMoreTargetUci: string | null;
}

export interface TargetInvariantResult {
  passed: boolean;
  mismatches: string[];
}

export function checkTargetInvariant(input: TargetInvariantInput): TargetInvariantResult {
  const mismatches: string[] = [];

  if (input.instructionTargetUci) {
    if (input.coachMoveUci && input.coachMoveUci !== input.instructionTargetUci) {
      mismatches.push(`coachMoveUci_mismatch:${input.coachMoveUci}_vs_${input.instructionTargetUci}`);
    }
    if (input.visualMoveUci && input.visualMoveUci !== input.instructionTargetUci) {
      mismatches.push(`visualMoveUci_mismatch:${input.visualMoveUci}_vs_${input.instructionTargetUci}`);
    }
    if (input.showMoreTargetUci && input.showMoreTargetUci !== input.instructionTargetUci) {
      mismatches.push(`showMoreTargetUci_mismatch:${input.showMoreTargetUci}_vs_${input.instructionTargetUci}`);
    }
    if (input.coachPieceType && input.instructionTargetPieceType && input.coachPieceType !== input.instructionTargetPieceType) {
      mismatches.push(`coachPieceType_mismatch:${input.coachPieceType}_vs_${input.instructionTargetPieceType}`);
    }
  }

  return {
    passed: mismatches.length === 0,
    mismatches,
  };
}
