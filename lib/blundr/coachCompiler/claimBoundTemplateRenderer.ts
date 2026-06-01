/**
 * claimBoundTemplateRenderer.ts
 * v2.7.42 - Renders coach text strictly from EvidenceGraph claims + target.
 * This enforces the exact required Assisted format and prevents generic language.
 */

import type { EvidenceGraph } from "../brain/buildEvidenceGraph";
import { getPieceName } from "./utils"; // we'll create a small utils if needed

export function renderAssistedCoach(target: {
  san: string;
  pieceType: string;
  uci: string;
}, evidence: EvidenceGraph): { title: string; body: string } {

  const san = target.san;
  const piece = getPieceName(target.pieceType);
  const claims = evidence.evidenceClaimIds;

  let body = `Develop the ${piece} to an active square.`;

  // Priority-based deterministic rendering
  if (claims.includes("is_castling")) {
    body = "Move your king to safety and connect your rooks.";
  } else if (claims.includes("pressures_f7")) {
    body = `Move your ${piece} to ${target.uci.slice(2,4)}, where it develops actively and pressures f7.`;
  } else if (claims.includes("is_central_pawn_advance")) {
    body = "Claim space in the center and open lines for your bishop and queen.";
  } else if (claims.includes("target_development")) {
    body = `Develop the ${piece} toward the center and improve its activity.`;
  } else if (claims.includes("improves_king_safety")) {
    body = "Improve king safety and prepare for the middlegame.";
  }

  return {
    title: `Play ${san}.`,
    body,
  };
}

export function renderPlainHint(evidence: EvidenceGraph): string {
  const claims = evidence.evidenceClaimIds;

  if (claims.includes("is_castling")) return "Improve king safety.";
  if (claims.includes("target_development")) return "Develop a piece toward the center.";
  if (claims.includes("is_central_pawn_advance")) return "Gain space in the center.";
  if (claims.includes("improves_king_safety")) return "Strengthen your king's position.";

  return "Make a natural developing move.";
}
