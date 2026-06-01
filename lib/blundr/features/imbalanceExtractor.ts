import type { ParsedBoard } from "../geometry/boardTypes";
import { getAttackedSquares } from "../geometry/attackMap";
import { hasBishopPair, materialBalance } from "../geometry/materialUtils";
import type { ImbalanceFeatures, KingSafetyFeatures, PawnStructureFeatures, PieceQualityFeatures } from "./advancedFeatureTypes";

export function extractImbalances(input: {
  board: ParsedBoard;
  pawnStructure: PawnStructureFeatures;
  kingSafety: KingSafetyFeatures;
  pieceQuality: PieceQualityFeatures;
}): ImbalanceFeatures {
  const board = input.board;
  const whiteDevelopment = input.pieceQuality.undevelopedPieces.filter((piece) => piece.color === "white").length;
  const blackDevelopment = input.pieceQuality.undevelopedPieces.filter((piece) => piece.color === "black").length;
  const whiteControl = getAttackedSquares(board, "white").filter((sq) => ["d4", "e4", "d5", "e5"].includes(sq));
  const blackControl = getAttackedSquares(board, "black").filter((sq) => ["d4", "e4", "d5", "e5"].includes(sq));
  return {
    materialBalance: materialBalance(board),
    bishopPair: (["white", "black"] as const).filter((color) => hasBishopPair(board, color)),
    developmentLead: whiteDevelopment < blackDevelopment ? "white" : blackDevelopment < whiteDevelopment ? "black" : "none",
    spaceAdvantage: whiteControl.length > blackControl.length + 1 ? "white" : blackControl.length > whiteControl.length + 1 ? "black" : "none",
    centralControl: { white: whiteControl, black: blackControl },
    kingSafetyImbalance: input.kingSafety.urgentKingSafety[0] ?? "none",
    pieceActivityImbalance: input.pieceQuality.activeBishops.some((p) => p.color === "white") ? "white" : input.pieceQuality.activeBishops.some((p) => p.color === "black") ? "black" : "none",
    pawnStructureImbalance: input.pawnStructure.isolatedPawns.length ? "white" : "none",
    initiative: "none",
  };
}
