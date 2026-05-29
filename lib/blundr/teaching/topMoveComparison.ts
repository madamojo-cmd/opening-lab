import { Chess } from "chess.js";
import { analyzeMoveSemantics } from "./moveSemanticAnalyzer";
import { buildChessFeatureGraph, pieceName } from "./chessFeatureGraph";
import type { TopMoveComparison } from "./trainingContextTypes";

export type CompareMoveToTopMovesInput = {
  fen: string;
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  topMoves?: Array<{ uci: string; san?: string; rank?: number; scoreCp?: number; mate?: number; pv?: string[] }>;
};

function normalizeUci(uci?: string): string {
  return typeof uci === "string" ? uci.trim().toLowerCase().replace(/\s+/g, "") : "";
}

function sanFor(fen: string, uci: string, fallback?: string): string | undefined {
  if (fallback) return fallback;
  try {
    const game = new Chess(fen);
    const move = game.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci.slice(4, 5) : "q",
    });
    return move?.san;
  } catch {
    return undefined;
  }
}

function topTheme(effects: ReturnType<typeof analyzeMoveSemantics>["effects"]): string {
  const best = effects
    .filter((effect) => effect.claimSafety !== "speculative")
    .sort((a, b) => b.confidence - a.confidence)[0];
  if (!best) return "unclear";
  if (best.type === "develops_with_pressure") return "development with pressure";
  if (best.type === "develops_piece") return "development and central control";
  if (best.type === "attacks_loose_piece" || best.type === "wins_loose_piece") return "loose-piece pressure";
  if (best.type === "controls_center" || best.type === "resolves_center_tension") return "central control";
  if (best.type === "improves_piece_activity") return "piece activity";
  return best.type.replace(/_/g, " ");
}

export function compareMoveToTopMoves(input: CompareMoveToTopMovesInput): TopMoveComparison[] {
  const expected = normalizeUci(input.expectedMoveUci);
  if (!expected || !input.topMoves?.length) return [];
  const graph = buildChessFeatureGraph(input.fen);
  const expectedAnalysis = analyzeMoveSemantics({
    fenBefore: input.fen,
    moveUci: expected,
    moveSan: input.expectedMoveSan,
    featureGraphBefore: graph,
  });
  const expectedPiece = graph.pieces.find((piece) => piece.square === expected.slice(0, 2));

  return input.topMoves
    .map((topMove): TopMoveComparison | null => {
      const topUci = normalizeUci(topMove.uci);
      if (!topUci || topUci === expected) return null;
      const topAnalysis = analyzeMoveSemantics({
        fenBefore: input.fen,
        moveUci: topUci,
        moveSan: sanFor(input.fen, topUci, topMove.san),
        featureGraphBefore: graph,
      });
      const topPiece = graph.pieces.find((piece) => piece.square === topUci.slice(0, 2));
      const expectedTheme = topTheme(expectedAnalysis.effects);
      const alternativeTheme = topTheme(topAnalysis.effects);
      const samePiece = Boolean(expectedPiece && topPiece && expectedPiece.square === topPiece.square && expectedPiece.type === topPiece.type);
      const sameTarget = expectedAnalysis.newlyAttackedTargets.some((target) => topAnalysis.newlyAttackedTargets.some((other) => other.square === target.square));
      const topHasTactic = topAnalysis.effects.some((effect) => effect.type === "wins_loose_piece" || effect.type === "attacks_loose_piece");

      if (samePiece) {
        return {
          topMoveUci: topUci,
          topMoveSan: topAnalysis.moveSan,
          relationship: "same_piece_more_active",
          alternativeTheme,
          expectedMoveTheme: expectedTheme,
          comparisonConfidence: 0.78,
          safeUserFacingSummary: `The same ${pieceName(expectedPiece?.type)} can develop with more purpose.`,
          debugReason: `Expected move and top move use the same piece from ${expectedPiece?.square}, but the top move creates a clearer theme: ${alternativeTheme}.`,
        };
      }

      if (sameTarget) {
        return {
          topMoveUci: topUci,
          topMoveSan: topAnalysis.moveSan,
          relationship: "same_target_more_direct",
          alternativeTheme,
          expectedMoveTheme: expectedTheme,
          comparisonConfidence: 0.72,
          safeUserFacingSummary: "The main idea is pressure on the same target.",
          debugReason: "Expected and top move both pressure a shared target square.",
        };
      }

      if (topHasTactic) {
        return {
          topMoveUci: topUci,
          topMoveSan: topAnalysis.moveSan,
          relationship: "tactical_urgency",
          alternativeTheme,
          expectedMoveTheme: expectedTheme,
          comparisonConfidence: 0.7,
          safeUserFacingSummary: "The position contains a more forcing tactical theme.",
          debugReason: "Top move analysis found a tactical pressure or loose-piece effect.",
        };
      }

      return {
        topMoveUci: topUci,
        topMoveSan: topAnalysis.moveSan,
        relationship: alternativeTheme === expectedTheme ? "same_plan_different_route" : "different_plan",
        alternativeTheme,
        expectedMoveTheme: expectedTheme,
        comparisonConfidence: alternativeTheme === "unclear" ? 0.35 : 0.58,
        safeUserFacingSummary: alternativeTheme === "unclear" ? "The contrast is not clear enough to teach." : "The stronger move appears to teach a different idea.",
        debugReason: `Expected theme ${expectedTheme}; top theme ${alternativeTheme}.`,
      };
    })
    .filter((comparison): comparison is TopMoveComparison => Boolean(comparison))
    .sort((a, b) => b.comparisonConfidence - a.comparisonConfidence)
    .slice(0, 4);
}

