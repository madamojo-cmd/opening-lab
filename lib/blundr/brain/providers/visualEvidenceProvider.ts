import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import type { BoardTruth, CoachEvidenceClaim } from "../types";

function claim(
  frame: CurrentInstructionFrame,
  idSuffix: string,
  strength: CoachEvidenceClaim["strength"],
  visualType: string,
  machineFacts: Record<string, unknown>,
): CoachEvidenceClaim {
  return {
    id: `${frame.frameKey}:${idSuffix}`,
    frameKey: frame.frameKey,
    type: "strategic_feature",
    strength,
    targetUci: frame.target?.uci ?? "",
    pieceType: frame.target?.pieceType,
    textSafeSummary: `Visual evidence: ${visualType}.`,
    machineFacts: {
      visualType,
      ...machineFacts,
    },
    provenance: [
      {
        source: "visual_evidence",
        confidence: strength === "verified" ? "high" : strength === "probable" ? "medium" : "low",
      },
    ],
  };
}

export function buildVisualEvidenceClaims(input: {
  frame: CurrentInstructionFrame;
  boardTruth: BoardTruth;
  claims: CoachEvidenceClaim[];
}): CoachEvidenceClaim[] {
  const { frame, boardTruth, claims } = input;
  const target = frame.target;

  if (!target) return [];
  if (boardTruth.targetLegal === false || boardTruth.targetLegal === "unknown") return [];

  const visualClaims: CoachEvidenceClaim[] = [
    claim(frame, "visual_move_arrow", "verified", "move_arrow", {
      from: target.from,
      to: target.to,
      targetUci: target.uci,
    }),
    claim(frame, "visual_source_highlight", "verified", "source_highlight", {
      square: target.from,
      targetUci: target.uci,
    }),
    claim(frame, "visual_destination_highlight", "verified", "destination_highlight", {
      square: target.to,
      targetUci: target.uci,
    }),
  ];

  const hasPressureEvidence = claims.some((c) => c.type === "pressure" || c.machineFacts?.centerPressure === true || c.machineFacts?.diagonal === true);
  if (hasPressureEvidence) {
    visualClaims.push(
      claim(frame, "visual_pressure_arrow", "probable", "pressure_arrow", {
        from: target.from,
        to: target.to,
      }),
    );
  }

  const hasKingSafetyEvidence = claims.some((c) => c.type === "king_safety" || c.type === "castling" || c.machineFacts?.kingSafety === true);
  if (hasKingSafetyEvidence) {
    visualClaims.push(
      claim(frame, "visual_king_safety_zone", "probable", "king_safety_zone", {
        kingSquares: boardTruth.kingSquares,
      }),
    );
  }

  const piece = String(target.pieceType).toLowerCase();
  if (piece.startsWith("b") || piece.startsWith("q")) {
    visualClaims.push(
      claim(frame, "visual_diagonal_control", "probable", "diagonal_control", {
        from: target.from,
        to: target.to,
      }),
    );
  }
  if (piece.startsWith("r") || piece.startsWith("q")) {
    visualClaims.push(
      claim(frame, "visual_file_control", "probable", "file_control", {
        fromFile: target.from[0],
        toFile: target.to[0],
      }),
    );
  }

  return visualClaims;
}
