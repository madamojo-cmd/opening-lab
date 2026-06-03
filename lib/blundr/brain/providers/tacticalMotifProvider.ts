import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import type { BoardTruth, CoachEvidenceClaim } from "../types";

function claim(
  frame: CurrentInstructionFrame,
  idSuffix: string,
  strength: CoachEvidenceClaim["strength"],
  motif: string,
  machineFacts: Record<string, unknown>,
): CoachEvidenceClaim {
  return {
    id: `${frame.frameKey}:${idSuffix}`,
    frameKey: frame.frameKey,
    type: "tactical_motif",
    strength,
    targetUci: frame.target?.uci ?? "",
    pieceType: frame.target?.pieceType,
    textSafeSummary: `Tactical motif assessment: ${motif}.`,
    machineFacts: {
      motif,
      ...machineFacts,
    },
    provenance: [
      {
        source: "tactical_motif",
        confidence: strength === "verified" ? "high" : strength === "probable" ? "medium" : "low",
      },
    ],
  };
}

export function buildTacticalMotifClaims(input: {
  frame: CurrentInstructionFrame;
  boardTruth: BoardTruth;
}): CoachEvidenceClaim[] {
  const { frame, boardTruth } = input;
  if (!frame.target) return [];

  if (boardTruth.targetLegal === false || boardTruth.targetLegal === "unknown") {
    return [
      claim(frame, "blocked_illegal_target", "blocked", "illegal_or_unverified_target", {
        targetLegal: boardTruth.targetLegal,
      }),
    ];
  }

  const claims: CoachEvidenceClaim[] = [];

  if (boardTruth.isCheck) {
    claims.push(claim(frame, "forcing_check", "verified", "forcing_check", { check: true }));
  }

  if (boardTruth.isCheckmate) {
    claims.push(claim(frame, "mate_delivered", "verified", "mate_delivered", { checkmate: true }));
  }

  if (boardTruth.isCapture && boardTruth.isCheck) {
    claims.push(claim(frame, "double_attack_probable", "probable", "double_attack", { capture: true, check: true }));
  }

  if (String(frame.target.pieceType).toLowerCase().startsWith("n") && boardTruth.isCheck) {
    claims.push(claim(frame, "knight_fork_candidate", "probable", "fork_candidate", { piece: "knight" }));
  }

  if (String(frame.target.pieceType).toLowerCase().startsWith("b")) {
    const from = frame.target.from;
    const to = frame.target.to;
    const df = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
    const dr = Math.abs(Number(from[1]) - Number(to[1]));
    if (df === dr && df > 0) {
      claims.push(claim(frame, "pin_or_skewer_line_probable", "probable", "pin_or_skewer_candidate", { diagonal: true }));
    }
  }

  if (!claims.length) {
    claims.push(
      claim(frame, "tactic_not_detected", "blocked", "no_reliable_tactical_motif_detected", {
        conservative: true,
      }),
    );
  }

  return claims;
}
