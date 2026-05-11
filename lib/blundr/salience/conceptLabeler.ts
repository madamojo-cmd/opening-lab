import type { CandidateClaim, BlundrFeaturePacket } from "../featurePacketBuilder";
import type { TeachingCandidate } from "./salienceScorer";

export type SalienceConcept =
  | "development_with_f7_pressure"
  | "development_with_f2_pressure"
  | "knight_pressure_center"
  | "center_control"
  | "center_tension"
  | "prepare_center_break"
  | "pawn_break"
  | "castle_for_safety"
  | "queen_danger_warning"
  | "pin_pressure"
  | "open_file_pressure"
  | "quiet_development"
  | "continuation_plan"
  | "generic_stockfish_best_move";

const CENTER = new Set(["d4", "e4", "d5", "e5"]);

function claimsFor(candidate: TeachingCandidate, packet: BlundrFeaturePacket): CandidateClaim[] {
  return packet.derived.candidateClaims.filter((claim) => claim.move === candidate.selectedMove);
}

function hasClaim(candidate: TeachingCandidate, packet: BlundrFeaturePacket, type: CandidateClaim["type"]): boolean {
  return claimsFor(candidate, packet).some((claim) => claim.type === type);
}

function attacksSquare(candidate: TeachingCandidate, square: string): boolean {
  return candidate.topSquares.some((changed) => changed.square === square && (changed.attackGain > 0 || changed.totalSalience > 0)) ||
    candidate.topLines.some((line) => line.lineSquares.includes(square));
}

export function labelSalienceConcept(candidate: TeachingCandidate, packet: BlundrFeaturePacket): SalienceConcept {
  if (hasClaim(candidate, packet, "castle_safety")) {
    return "castle_for_safety";
  }

  if (hasClaim(candidate, packet, "queen_danger")) {
    return "queen_danger_warning";
  }

  if (hasClaim(candidate, packet, "pin_pressure")) {
    return "pin_pressure";
  }

  if (hasClaim(candidate, packet, "open_file_pressure")) {
    return "open_file_pressure";
  }

  if (candidate.moveDelta.piece === "b" || candidate.moveDelta.piece === "q") {
    if (candidate.moveDelta.color === "w" && attacksSquare(candidate, "f7")) {
      return "development_with_f7_pressure";
    }
    if (candidate.moveDelta.color === "b" && attacksSquare(candidate, "f2")) {
      return "development_with_f2_pressure";
    }
  }

  if (
    candidate.moveDelta.piece === "n" &&
    candidate.topSquares.some((square) => CENTER.has(square.square) && square.attackGain > 0)
  ) {
    return "knight_pressure_center";
  }

  if (hasClaim(candidate, packet, "center_tension")) {
    return candidate.moveDelta.piece === "p" ? "pawn_break" : "center_tension";
  }

  if (hasClaim(candidate, packet, "center_control")) {
    return candidate.moveDelta.piece === "p" ? "prepare_center_break" : "center_control";
  }

  if (hasClaim(candidate, packet, "quiet_development")) {
    return "quiet_development";
  }

  if (candidate.source === "expected") {
    return "continuation_plan";
  }

  if (candidate.source === "stockfish") {
    return "generic_stockfish_best_move";
  }

  return "quiet_development";
}
