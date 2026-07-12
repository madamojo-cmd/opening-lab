import type { Move as ChessMove } from 'chess.js';

export type MiniGameId = 'key_square_conquest' | 'structure_builder' | 'imbalance_arena' | 'technique_lab' | 'king_race' | 'pawn_wars';
export type DifficultyBand = 'intro' | 'easy' | 'medium' | 'hard' | 'expert';
export type SideToMove = 'w' | 'b';
export type Square = string;
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Stage8MPhase = 'opening' | 'middlegame' | 'endgame';
export type Stage8MMove = ChessMove;

export interface SeededRng { (): number; int(max: number): number; pick<T>(values: readonly T[]): T; shuffle<T>(values: readonly T[]): T[]; fork(label: string): SeededRng; }

export interface SourceFrame {
  sourceId: string; kind: 'opening_frame' | 'pgn_frame' | 'curated'; fen: string;
  openingId?: string; generatedAtPly?: number; sourceGameId?: string;
  candidateMoves?: Array<{ uci: string; san?: string; totalGames: number; playPct?: number }>;
}

export interface GeneratorContext {
  seed: string; maxPerGame: number; difficultyTargets: Record<DifficultyBand, number>;
  sourceFrames: SourceFrame[]; rng: SeededRng;
  options: { requireEngineReview: boolean; requireTablebaseReview: boolean; allowHumanAuditOnly: boolean; minQualityScore: number; };
}

export interface BoardAnalysis {
  fen: string; sideToMove: SideToMove; phase: Stage8MPhase; pieceCount: number; pawnCount: number;
  materialSignature: string;
  material: { white: Record<PieceSymbol, number>; black: Record<PieceSymbol, number>; imbalanceCpApprox: number; };
  kings: { white: Square; black: Square; distance: number; };
  legalMoves: Stage8MMove[]; captures: Stage8MMove[]; checks: Stage8MMove[]; quietMoves: Stage8MMove[];
}

export interface PawnStructureAnalysis {
  pawns: { white: Square[]; black: Square[] }; passedPawns: Square[]; protectedPassedPawns: Square[];
  outsidePassedPawns: Square[]; candidatePassedPawns: Square[]; isolatedPawns: Square[]; isolatedQueenPawns: Square[];
  backwardPawns: Square[]; doubledPawns: Square[]; hangingPawns: Square[]; pawnChains: Square[][]; chainBases: Square[];
  lockedCenters: Array<[Square, Square]>; candidatePawnBreaks: string[]; minorityAttackFiles: string[];
  openFiles: string[]; halfOpenFiles: { white: string[]; black: string[] };
}

export interface PawnStructureDelta {
  movedPawn: Square; from: Square; to: Square; capture?: Square; beforeTags: string[]; afterTags: string[];
  createdPassedPawn?: Square; createdProtectedPasser?: Square; createdOutsidePasser?: Square; removedBlocker?: Square;
  openedFiles: string[]; halfOpenedFiles: string[]; openedDiagonals: string[]; newlyWeakSquares: Square[];
  improvedSquares: Square[]; changedFiles: string[]; summary: string; meaningful: boolean;
}

export interface KeySquareProof {
  targetSquare: Square; squareType: 'knight_outpost' | 'blockade' | 'rook_entry' | 'king_entry' | 'invasion' | 'weak_color_complex';
  friendlySupporters: Square[]; friendlyPawnSupporters: Square[]; enemyAttackers: Square[]; enemyPawnChasers: Square[];
  enemyCanChaseWithPawn: boolean; beforeFriendlyControl: number; afterFriendlyControl: number; beforeEnemyControl: number;
  afterEnemyControl: number; durabilityPlyEstimate: number; usefulTargetsFromSquare: Square[]; strategicPurpose: string;
}

export interface ImbalanceProof {
  imbalanceType: string; sideWithImbalance: SideToMove; beforeActivity: number; afterActivity: number; activityDelta: number;
  relevantPieces: Square[]; durableFeatures: string[]; targets: Square[]; whyItMatters: string;
}

export interface KingRaceProof {
  oppositionState: 'has_opposition' | 'must_gain_opposition' | 'must_avoid_opposition'; criticalSquares: Square[];
  squareOfPawn: Square[]; kingRoute: Square[]; promotionTempi: { white: number; black: number }; spareTempo: boolean;
  scoreBefore: number; scoreAfter: number; verificationDepth: number; principalVariation: string[];
}

export interface Stage8MScenario {
  id: string; miniGameId: MiniGameId; version: 'stage8m.v1';
  source: { kind: 'opening_frame' | 'pgn_frame' | 'procedural' | 'curated' | 'tablebase' | 'hybrid'; sourceId: string; seed: string; generatorId: string; generatedAtPly?: number; openingId?: string; sourceGameId?: string; };
  board: { fen: string; sideToMove: SideToMove; orientation: 'white' | 'black'; phase: Stage8MPhase; materialSignature: string; pieceCount: number; pawnCount: number; };
  solution: { primaryMoveUci: string; san: string; moveType: 'quiet' | 'capture' | 'check' | 'promotion' | 'pawn_break' | 'king_route' | 'piece_improvement' | 'endgame_technique'; legalAlternatives: string[]; plausibleWrongMoves: Array<{ moveUci: string; san: string; reasonItIsTempting: string; whyItFails: string; }>; };
  pedagogy: { concept: string; subConcept: string; difficultyBand: DifficultyBand; prompt: string; lessonObjective: string; transferPattern: string; explanation: { short: string; detailed: string; coachNote: string; whyAlternativesFail: string[]; }; proof: Record<string, unknown>; };
  validation: { legalFen: boolean; legalMove: boolean; proofComplete: boolean; explanationSpecific: boolean; engineReviewed: boolean; tablebaseReviewed: boolean; humanAuditRequired: boolean; runtimeReady: boolean; rejectionReasons: string[]; };
  quality: { score: number; noveltyKey: string; densityScore: number; clarityScore: number; pedagogyScore: number; difficultyScore: number; };
}

export interface Rejection { miniGameId: MiniGameId; fen?: string; moveUci?: string; reason: string; details?: Record<string, unknown>; }
export interface GeneratorResult { accepted: Stage8MScenario[]; rejected: Rejection[]; }
export interface MiniGameGenerator { id: MiniGameId; generate(ctx: GeneratorContext): GeneratorResult; }
