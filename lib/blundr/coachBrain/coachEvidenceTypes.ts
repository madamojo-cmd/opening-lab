export type CoachEvidenceStatus =
  | "ready"
  | "partial"
  | "pending"
  | "unavailable"
  | "stale";

export type CoachInteraction =
  | "none"
  | "hint"
  | "answer"
  | "why"
  | "hide"
  | "show_plan"
  | "analyze_idea"
  | "show_move";

export type CoachMode =
  | "assisted"
  | "plain"
  | "restricted_answer"
  | "continued_plan"
  | "continued_analysis"
  | "continued_move"
  | "silent";

export interface MoveFactPacket {
  legal: boolean;
  san: string;
  uci: string;
  movedPiece: {
    type: "p" | "n" | "b" | "r" | "q" | "k";
    color: "w" | "b";
    from: string;
    to: string;
  };
  isCapture: boolean;
  capturedPieceType?: string;
  isCastle: boolean;
  isPromotion: boolean;
  isCheck: boolean;
  fenAfter: string;
  attackedSquaresBefore: string[];
  attackedSquaresAfter: string[];
  newlyAttackedSquares: string[];
  defendedSquaresBefore: string[];
  defendedSquaresAfter: string[];
  targetSquaresActuallyAttacked: string[];
  centerSquaresAffected: string[];
  movedPieceAttacksAfter: string[];
  movedPieceDefendsAfter: string[];
  xrayAlignedSquares?: string[];
}

export interface BoardFactPacket {
  occupiedCenterSquares: string[];
  contestedCenterSquares: string[];
  controlledCenterSquaresWhite: string[];
  controlledCenterSquaresBlack: string[];
  centerState:
    | "empty"
    | "claimed"
    | "contested"
    | "locked"
    | "open"
    | "unclear";
  whiteKingSquare?: string;
  blackKingSquare?: string;
  whiteCanCastleKingside: boolean;
  whiteCanCastleQueenside: boolean;
  blackCanCastleKingside: boolean;
  blackCanCastleQueenside: boolean;
  kingSafetyFacts: string[];
  openFiles: string[];
  semiOpenFilesWhite: string[];
  semiOpenFilesBlack: string[];
  plausiblePawnBreaks: string[];
  leastActivePieces: string[];
  safePlanObjects: string[];
}

export interface VisualRecipeFactPacket {
  conceptId?: string;
  patternId?: string;
  moveUci?: string;
  moveSan?: string;
  keySquares: string[];
  keyPieces: string[];
  validatedVisualTypes: string[];
}

export interface TrainingFactPacket {
  conceptId?: string;
  patternId?: string;
  moveUci?: string;
  moveSan?: string;
  prompt?: string;
  plan?: string;
}

export interface EngineSupportPacket {
  status: "ready" | "pending" | "unavailable" | "stale";
  bestMoveUci?: string;
  bestMoveSan?: string;
  safeMoveUcis: string[];
  playableMoveUcis: string[];
  candidateSafetyByUci: Record<string, "best" | "safe" | "playable" | "unknown" | "bad">;
  source: "browser_stockfish" | "none";
}

export interface MaiaSupportPacket {
  status: "unavailable" | "mock" | "live";
  source: "none" | "maia_api" | "maia_local";
  topMoveUcis: string[];
  moveProbabilities: Record<string, number>;
}

export interface RepertoireSupportPacket {
  supported: boolean;
  source: "book" | "repertoire" | "lichess" | "none";
  supportedMoveUcis: string[];
}

export type VerifiedCoachClaim =
  | { type: "piece_develops"; piece: string; to: string }
  | { type: "attacks_square"; piece: string; from: string; to: string; target: string }
  | { type: "prepares_break"; breakMove: string; supportMove?: string }
  | { type: "center_tension"; squares: string[] }
  | { type: "king_safety"; reason: string }
  | { type: "rook_file"; file: string; square: string }
  | { type: "exact_move_safe"; moveUci: string; moveSan?: string }
  | { type: "plan"; planObject: string };

export interface BlockedCoachClaim {
  type: string;
  reason: string;
  attemptedText?: string;
}

export interface CoachEvidencePacket {
  frameId: string;
  trainerFrameId?: string;
  fenBefore: string;
  normalizedFen: string;
  sideToMove: "w" | "b";
  viewMode: "assisted" | "plain" | "freeplay";
  trainingMode: "restricted" | "continuation";
  bookStatus: "in_book" | "book_complete" | "near_book" | "out_of_book";
  stale: boolean;
  evidenceStatus: CoachEvidenceStatus;
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  selectedCandidateMoveUci?: string;
  selectedCandidateMoveSan?: string;
  legalMoveUcis: string[];
  legalMoveSans: string[];
  moveFacts?: MoveFactPacket;
  boardFacts: BoardFactPacket;
  visualRecipeFacts?: VisualRecipeFactPacket;
  trainingFacts?: TrainingFactPacket;
  engineSupport: EngineSupportPacket;
  maiaSupport: MaiaSupportPacket;
  repertoireSupport: RepertoireSupportPacket;
  exactMoveAllowed: boolean;
  allowedClaims: VerifiedCoachClaim[];
  blockedClaims: BlockedCoachClaim[];
  debug: Record<string, unknown>;
}
