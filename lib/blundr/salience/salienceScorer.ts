import type { MobilityDelta, MoveDelta, ChangedLine, ChangedSquare } from "../geometry/salienceTypes";
import type { BlundrFeaturePacket, CandidateMoveFeature } from "../featurePacketBuilder";
import type { SalienceConcept } from "./conceptLabeler";
import { labelSalienceConcept } from "./conceptLabeler";

const CENTER = new Set(["d4", "e4", "d5", "e5"]);

export type ScoreBreakdown = {
  expectedMove: number;
  stockfishBestMove: number;
  moveSalience: number;
  mobility: number;
  kingProximity: number;
  center: number;
  weakness: number;
  visualClarity: number;
  noClearSaliencePenalty: number;
};

export type TeachingCandidate = {
  selectedMove: string;
  san?: string;
  source: CandidateMoveFeature["source"];
  concept: SalienceConcept;
  score: number;
  confidence: number;
  topSquares: ChangedSquare[];
  topLines: ChangedLine[];
  mobilityDelta: MobilityDelta;
  moveDelta: MoveDelta;
  scoreBreakdown: ScoreBreakdown;
};

function claimsStrength(packet: BlundrFeaturePacket, move: string, types: string[]): number {
  return packet.derived.candidateClaims
    .filter((claim) => claim.move === move && types.includes(claim.type))
    .reduce((sum, claim) => sum + claim.strength, 0);
}

function scoreCandidate(candidate: CandidateMoveFeature, packet: BlundrFeaturePacket): Omit<TeachingCandidate, "concept"> {
  const moveSalience = candidate.topSquares.reduce((sum, square) => sum + square.totalSalience, 0);
  const mobility = Math.max(0, candidate.mobilityDelta.movedPieceGain) * 4;
  const kingProximity = candidate.topSquares.reduce((sum, square) => sum + Math.max(0, square.kingProximityScore), 0) * 0.6;
  const center = candidate.topSquares
    .filter((square) => CENTER.has(square.square))
    .reduce((sum, square) => sum + square.totalSalience, CENTER.has(candidate.to) ? 6 : 0);
  const weakness = claimsStrength(packet, candidate.move, ["weak_square", "queen_danger", "pin_pressure", "open_file_pressure"]) * 2;
  const visualClarity = 4 + Math.min(8, candidate.topSquares.length) + Math.min(8, candidate.topLines.length * 2);
  const noClearSaliencePenalty = candidate.topSquares.length ? 0 : -18;

  const scoreBreakdown: ScoreBreakdown = {
    expectedMove: packet.expectedMove === candidate.move ? 1000 : 0,
    stockfishBestMove: packet.stockfishBestMove === candidate.move ? 600 : 0,
    moveSalience,
    mobility,
    kingProximity,
    center,
    weakness,
    visualClarity,
    noClearSaliencePenalty,
  };
  const score = Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0);

  return {
    selectedMove: candidate.move,
    san: candidate.san,
    source: candidate.source,
    score,
    confidence: Math.max(0.25, Math.min(0.98, score / 1200)),
    topSquares: candidate.topSquares.slice(0, 8),
    topLines: candidate.topLines.slice(0, 4),
    mobilityDelta: candidate.mobilityDelta,
    moveDelta: candidate.moveDelta,
    scoreBreakdown,
  };
}

export function rankTeachingCandidates(packet: BlundrFeaturePacket): TeachingCandidate[] {
  return packet.derived.candidateMoves
    .map((candidate) => {
      const scored = scoreCandidate(candidate, packet);
      return {
        ...scored,
        concept: labelSalienceConcept(scored as TeachingCandidate, packet),
      };
    })
    .sort((a, b) => b.score - a.score || a.selectedMove.localeCompare(b.selectedMove));
}
