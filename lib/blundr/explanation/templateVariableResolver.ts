import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import type { RecognizedPlan } from "../plans/planTypes";
import type { TeachingOpportunity } from "../opportunity/opportunityTypes";
import type { TemplateVariableName } from "./explanationTypes";

export function resolveTemplateVariables(input: {
  opportunity: TeachingOpportunity;
  features: AdvancedFeaturePacket;
  plan?: RecognizedPlan;
}): Record<TemplateVariableName, string | undefined> {
  const activeBishop = input.features.pieceQuality.activeBishops[0];
  const rook = input.features.pieceQuality.rooksOnOpenFiles[0] ?? input.features.pieceQuality.rooksOnSemiOpenFiles[0];
  const undeveloped = input.features.pieceQuality.undevelopedPieces[0];
  return {
    moveSan: input.opportunity.moveSan,
    moveUci: input.opportunity.moveUci,
    pieceName: activeBishop ? "bishop" : undeveloped?.piece ?? "piece",
    fromSquare: input.opportunity.moveUci?.slice(0, 2),
    toSquare: input.opportunity.moveUci?.slice(2, 4) ?? activeBishop?.square,
    targetSquare: activeBishop?.targets[0],
    targetPiece: undefined,
    centerBreakSquare: input.features.pawnStructure.pawnLevers[0]?.supportsBreak?.replace("...", "") ?? "d4",
    leverMove: input.features.pawnStructure.pawnLevers[0]?.move,
    fileName: rook?.file ?? input.opportunity.moveUci?.slice(2, 3),
    diagonalName: activeBishop ? `${activeBishop.square} diagonal` : undefined,
    kingSideOrQueenSide: input.opportunity.moveSan?.includes("O-O-O") ? "queenside" : "kingside",
    rookFrom: undefined,
    rookTo: undefined,
    weakSquare: input.features.pawnStructure.weakSquares[0],
    weakColorComplex: undefined,
    outpostSquare: input.features.pieceQuality.knightOutposts[0]?.square,
    pawnStructureType: input.features.pawnStructure.isolatedPawns.length ? "an isolated pawn" : input.features.pawnStructure.doubledPawnFiles.length ? "doubled pawns" : "a central lever",
    planName: input.plan?.type.replace(/_/g, " ") ?? "the current plan",
    repertoireConcept: input.opportunity.conceptId,
    nextPlan: input.plan?.type,
    ratingDepth: "intermediate",
    sideToMove: input.features.sideToMove,
    featureSummary: input.features.featureClaims[0]?.type.replace(/_/g, " "),
    opponentPlan: undefined,
    defensiveIdea: undefined,
  };
}

export function renderTemplate(body: string, variables: Record<string, string | undefined>): { text: string; missing: string[] } {
  const missing: string[] = [];
  const text = body.replace(/\{([a-zA-Z0-9]+)\}/g, (_all, key) => {
    const value = variables[key];
    if (!value) {
      missing.push(key);
      return `{${key}}`;
    }
    return value;
  });
  return { text, missing };
}
