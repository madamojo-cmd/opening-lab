import { Chess } from "chess.js";
import { buildChessFeatureGraph, pieceName, type ChessFeatureGraph } from "./chessFeatureGraph";
import { renderConceptTemplate, type ConceptTemplateVariables } from "./conceptTemplates";
import { analyzeMoveSemantics } from "./moveSemanticAnalyzer";
import { MOVE_TRUST_ENGINE_CLOSE_CP, MOVE_TRUST_REPERTOIRE_CP, MOVE_TRUST_SEVERE_DROP_CP } from "./moveQualityGate";
import { compareMoveToTopMoves } from "./topMoveComparison";
import { TEACHING_CUE_COMPILER_VERSION, type TeachingConceptId, type TeachingCue, type VisualLine, type VisualSquareCue } from "./teachingCueTypes";
import type {
  GroundingContract,
  MoveRecommendationTrust,
  MoveSemanticAnalysis,
  MoveSemanticEffect,
  TeachingContextTrust,
  TopMoveComparison,
  TrainingContextInput,
  TrainingContextMode,
  TrainingContextPermission,
  TrainingContextResult,
  TrainingContextStory,
  TrainingContextStoryScore,
  TrainingContextVisualDecision,
  VisualIntent,
} from "./trainingContextTypes";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeUci(value?: string): string {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "") : "";
}

function safeSan(input: { fen: string; uci?: string; san?: string }): string | undefined {
  if (input.san) return input.san;
  const uci = normalizeUci(input.uci);
  if (uci.length < 4) return undefined;
  try {
    const game = new Chess(input.fen);
    const move = game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length > 4 ? uci.slice(4, 5) : "q" });
    return move?.san;
  } catch {
    return undefined;
  }
}

function applyUci(fen: string, uci?: string): string | undefined {
  const normalized = normalizeUci(uci);
  if (normalized.length < 4) return undefined;
  try {
    const game = new Chess(fen);
    const move = game.move({ from: normalized.slice(0, 2), to: normalized.slice(2, 4), promotion: normalized.length > 4 ? normalized.slice(4, 5) : "q" });
    return move ? game.fen() : undefined;
  } catch {
    return undefined;
  }
}

function moveQualityVerified(status?: string): boolean {
  return status === "verified_top1" || status === "verified_top2";
}

function moveQualityTrustedStatus(status?: string): boolean {
  return status === "verified_top1" || status === "verified_top2" || status === "book_supported" || status === "engine_close";
}

function trustedMoveTrust(trust: MoveRecommendationTrust): boolean {
  return trust === "engine_verified" || trust === "book_supported" || trust === "repertoire_supported" || trust === "engine_close";
}

function expectedMoveValidated(fen: string, expectedUci?: string): boolean {
  return Boolean(applyUci(fen, expectedUci));
}

function classifyMoveTrust(input: {
  moveQualityStatus?: string;
  moveQualityReason?: string;
  expectedMoveUci?: string;
  expectedMoveIsValidated: boolean;
  expectedMoveCp?: number;
  bestMoveCp?: number;
  deltaCp?: number;
  bookSupport?: TrainingContextInput["bookSupport"];
  repertoireSupport?: boolean;
  revealModeActive: boolean;
  hasSafeSemanticExplanation: boolean;
}): { trust: MoveRecommendationTrust; reason: string; safeToRecommend: boolean; validationFailureReason?: string } {
  const status = input.moveQualityStatus;
  const reason = input.moveQualityReason ?? "";
  const severeBlunder = typeof input.deltaCp === "number" && input.deltaCp > MOVE_TRUST_SEVERE_DROP_CP;
  const topTwoOnlyRejected = status === "rejected" && /top two/i.test(reason);
  const hasOpeningEvidence = Boolean(input.bookSupport?.hasBookSupport);
  const hasRepertoireEvidence = Boolean(input.repertoireSupport);

  if (!input.expectedMoveUci) {
    return { trust: "unavailable", reason: "No saved move was available to recommend.", safeToRecommend: false };
  }
  if (!input.expectedMoveIsValidated) {
    return { trust: "untrusted", reason: "Saved move is illegal in this position.", safeToRecommend: false, validationFailureReason: "illegal_expected_move" };
  }
  if (moveQualityVerified(status) || status === "engine_close") {
    return { trust: status === "engine_close" ? "engine_close" : "engine_verified", reason: status === "engine_close" ? "Expected move is engine-close to the best continuation." : "Move Quality Gate validated the saved move.", safeToRecommend: true };
  }
  if (status === "book_supported") {
    return { trust: "book_supported", reason: input.bookSupport?.reason ?? "Move Quality Gate marks this move as book-supported.", safeToRecommend: true };
  }
  if (input.bookSupport?.hasBookSupport && (input.bookSupport.confidence ?? 0) >= 0.7 && !severeBlunder) {
    return { trust: "book_supported", reason: input.bookSupport.reason ?? "Opening data strongly supports this pattern.", safeToRecommend: true };
  }
  if (!severeBlunder && typeof input.deltaCp === "number" && input.deltaCp <= MOVE_TRUST_ENGINE_CLOSE_CP) {
    return { trust: "engine_close", reason: `Expected move is within ${input.deltaCp} cp of the best move.`, safeToRecommend: true };
  }
  if (!severeBlunder && hasRepertoireEvidence && (typeof input.deltaCp !== "number" || input.deltaCp <= MOVE_TRUST_REPERTOIRE_CP)) {
    return { trust: "repertoire_supported", reason: "The move belongs to the saved repertoire and remains teachable in this position.", safeToRecommend: true };
  }
  if (!severeBlunder && (hasOpeningEvidence || hasRepertoireEvidence)) {
    return {
      trust: "reveal_only_unverified",
      reason: topTwoOnlyRejected ? "Move is a study-line choice that fell outside Stockfish top-two; reveal mode can still show it." : "Move is a study-line choice without enough validation to auto-recommend.",
      safeToRecommend: false,
      validationFailureReason: topTwoOnlyRejected ? "top_two_only_rejection" : status === "rejected" ? "rejected_without_severe_blunder" : "insufficient_engine_evidence",
    };
  }
  if (input.revealModeActive && !severeBlunder && input.hasSafeSemanticExplanation) {
    return { trust: "reveal_only_unverified", reason: "Reveal mode can show the stored study-line move with caution.", safeToRecommend: false, validationFailureReason: status === "rejected" ? "reveal_mode_override" : undefined };
  }
  return {
    trust: "untrusted",
    reason: severeBlunder ? "Expected move appears severely unsafe by engine delta." : status === "rejected" ? "Saved move was not validated by the Move Quality Gate." : "Saved move is not trusted enough to recommend.",
    safeToRecommend: false,
    validationFailureReason: severeBlunder ? "severe_engine_delta" : status === "rejected" ? "rejected" : "insufficient_evidence",
  };
}

function scoreStoryBase(input: Partial<TrainingContextStoryScore>): TrainingContextStoryScore {
  const score: TrainingContextStoryScore = {
    moveSpecificity: input.moveSpecificity ?? 0.4,
    concreteGrounding: input.concreteGrounding ?? 0.45,
    beforeAfterClarity: input.beforeAfterClarity ?? 0.35,
    tacticalUrgency: input.tacticalUrgency ?? 0,
    strategicDepth: input.strategicDepth ?? 0.35,
    phaseFit: input.phaseFit ?? 0.5,
    alternativeComparisonValue: input.alternativeComparisonValue ?? 0,
    visualTeachability: input.visualTeachability ?? 0.55,
    userClarity: input.userClarity ?? 0.7,
    confidence: input.confidence ?? 0.55,
    genericnessPenalty: input.genericnessPenalty ?? 0,
    revealRiskPenalty: input.revealRiskPenalty ?? 0,
    overclaimPenalty: input.overclaimPenalty ?? 0,
    contradictionPenalty: input.contradictionPenalty ?? 0,
    total: 0,
  };
  score.total = clamp01(
    0.13 * score.moveSpecificity +
      0.16 * score.concreteGrounding +
      0.12 * score.beforeAfterClarity +
      0.1 * score.tacticalUrgency +
      0.1 * score.strategicDepth +
      0.08 * score.phaseFit +
      0.12 * score.alternativeComparisonValue +
      0.1 * score.visualTeachability +
      0.08 * score.userClarity +
      0.11 * score.confidence -
      score.genericnessPenalty -
      score.revealRiskPenalty -
      score.overclaimPenalty -
      score.contradictionPenalty,
  );
  return score;
}

function grounded(input: {
  pieces: string[];
  squares: string[];
  relation?: string;
  beforeAfterDelta?: string;
  whyThisMatters: string;
  evidenceType: GroundingContract["evidenceType"];
  claimSafety?: GroundingContract["claimSafety"];
  revealRisk?: GroundingContract["revealRisk"];
}): GroundingContract {
  return {
    pieces: input.pieces.filter(Boolean),
    squares: input.squares.filter(Boolean),
    relation: input.relation,
    beforeAfterDelta: input.beforeAfterDelta,
    whyThisMatters: input.whyThisMatters,
    evidenceType: input.evidenceType,
    claimSafety: input.claimSafety ?? "safe",
    revealRisk: input.revealRisk ?? "low",
  };
}

function variablesFromEffect(effect?: MoveSemanticEffect, analysis?: MoveSemanticAnalysis, comparison?: TopMoveComparison): ConceptTemplateVariables {
  const center = analysis?.newAttacks.filter((square) => ["d4", "e4", "d5", "e5"].includes(square)).slice(0, 2).join(" and ");
  return {
    moveSan: analysis?.moveSan,
    pieceName: analysis?.movingPiece,
    fromSquare: analysis?.fromSquare,
    toSquare: analysis?.toSquare,
    targetSquare: effect?.targetSquare,
    targetPiece: effect?.targetPiece,
    file: analysis?.toSquare?.[0],
    centerSquares: center || undefined,
    alternativeTheme: comparison?.alternativeTheme,
    mainLineTheme: comparison?.expectedMoveTheme,
  };
}

function effectToStory(effect: MoveSemanticEffect, analysis: MoveSemanticAnalysis, trusted: boolean): TrainingContextStory {
  const conceptId = effect.conceptId;
  const template = renderConceptTemplate(conceptId, variablesFromEffect(effect, analysis), trusted ? "move_teaching" : "context_only");
  const tactical = effect.type === "wins_loose_piece" || effect.type === "attacks_loose_piece" ? 0.82 : effect.type === "increases_king_pressure" ? 0.7 : 0.2;
  const genericness = effect.type === "passive_development" ? 0.22 : 0;
  const visualTeachability = effect.visualIntent.squares.length || effect.targetSquare ? 0.82 : 0.48;
  return {
    id: `effect:${effect.type}:${analysis.moveUci}`,
    kind: effect.type === "passive_development" ? "development_with_purpose" : effect.type.includes("loose") ? "tactical_pressure" : effect.type.includes("center") ? "center_decision" : "move_specific_effect",
    conceptId,
    title: template.title,
    body: template.snippet,
    mode: trusted ? "move_teaching" : "assisted_context",
    moveUci: trusted ? analysis.moveUci : undefined,
    moveSan: trusted ? analysis.moveSan : undefined,
    isMoveRecommendation: trusted && effect.requiresMoveRecommendation,
    canBeShownWithoutMoveTrust: effect.allowedInContextOnly || !effect.requiresMoveRecommendation,
    grounding: grounded({
      pieces: effect.relevantPieces,
      squares: effect.relevantSquares,
      relation: effect.type,
      beforeAfterDelta: `${effect.before} ${effect.after}`,
      whyThisMatters: effect.whyItMatters,
      evidenceType: effect.requiresMoveRecommendation ? "move_delta" : "board_geometry",
      claimSafety: effect.claimSafety,
      revealRisk: trusted ? "low" : effect.revealRisk,
    }),
    semanticEffects: [effect],
    visualIntent: {
      ...effect.visualIntent,
      allowAnswerArrow: trusted && effect.visualIntent.allowAnswerArrow,
    },
    score: scoreStoryBase({
      moveSpecificity: effect.requiresMoveRecommendation ? 0.9 : 0.62,
      concreteGrounding: effect.relevantSquares.length && effect.relevantPieces.length ? 0.9 : 0.55,
      beforeAfterClarity: effect.before && effect.after ? 0.78 : 0.45,
      tacticalUrgency: tactical,
      strategicDepth: effect.type === "passive_development" ? 0.35 : 0.55,
      phaseFit: 0.68,
      visualTeachability,
      confidence: effect.confidence,
      genericnessPenalty: genericness,
      revealRiskPenalty: trusted ? 0 : effect.revealRisk === "high" ? 0.18 : 0,
    }),
    rejectionReasons: [],
  };
}

function comparisonStory(comparison: TopMoveComparison, analysis: MoveSemanticAnalysis | null, allowStrongAlternative: boolean): TrainingContextStory {
  const piece = analysis?.movingPiece ?? "piece";
  const isActiveSquare = comparison.relationship === "same_piece_more_active";
  const conceptId: TeachingConceptId = isActiveSquare || !allowStrongAlternative ? "active_square_comparison" : "strong_alternative";
  const template = renderConceptTemplate(conceptId, {
    pieceName: piece,
    alternativeTheme: comparison.alternativeTheme,
    mainLineTheme: comparison.expectedMoveTheme,
  }, "context_only");
  return {
    id: `comparison:${comparison.relationship}:${comparison.topMoveUci}`,
    kind: isActiveSquare ? "active_square_comparison" : allowStrongAlternative ? "context_safe_contrast" : "active_square_comparison",
    conceptId,
    title: template.title,
    body: template.snippet,
    mode: "assisted_context",
    isMoveRecommendation: false,
    canBeShownWithoutMoveTrust: true,
    grounding: grounded({
      pieces: [piece],
      squares: [analysis?.fromSquare ?? "", analysis?.toSquare ?? "", comparison.topMoveUci.slice(2, 4)],
      relation: comparison.relationship,
      beforeAfterDelta: comparison.safeUserFacingSummary,
      whyThisMatters: "The contrast teaches what the position asks from that piece without endorsing the saved move.",
      evidenceType: "engine_comparison",
      claimSafety: comparison.comparisonConfidence >= 0.7 ? "safe" : "cautious",
      revealRisk: "low",
    }),
    semanticEffects: [],
    topMoveComparison: comparison,
    visualIntent: {
      category: comparison.relationship === "same_piece_more_active" ? "active_square" : "piece_activity",
      primarySquare: analysis?.fromSquare,
      secondarySquare: comparison.topMoveUci.slice(2, 4),
      primaryPiece: piece,
      squares: [
        ...(analysis?.fromSquare ? [{ square: analysis.fromSquare, kind: "support" as const }] : []),
        { square: comparison.topMoveUci.slice(2, 4), kind: "target" as const },
      ],
      allowAnswerArrow: false,
      reason: comparison.debugReason,
    },
    score: scoreStoryBase({
      moveSpecificity: 0.78,
      concreteGrounding: 0.82,
      beforeAfterClarity: 0.62,
      strategicDepth: 0.72,
      phaseFit: 0.75,
      alternativeComparisonValue: comparison.relationship === "same_piece_more_active" ? 0.95 : 0.7,
      visualTeachability: 0.84,
      userClarity: 0.86,
      confidence: comparison.comparisonConfidence,
    }),
    rejectionReasons: [],
  };
}

function contextStories(graph: ChessFeatureGraph): TrainingContextStory[] {
  const stories: TrainingContextStory[] = [];
  const loose = graph.pieces.find((piece) => piece.isHanging || piece.isLoose);
  if (loose) {
    const template = renderConceptTemplate("hanging_piece_warning", { targetPiece: pieceName(loose.type), targetSquare: loose.square }, "context_only");
    stories.push({
      id: `context:loose:${loose.square}`,
      kind: "tactical_pressure",
      conceptId: "hanging_piece_warning",
      title: template.title,
      body: template.snippet,
      mode: "assisted_context",
      isMoveRecommendation: false,
      canBeShownWithoutMoveTrust: true,
      grounding: grounded({
        pieces: [pieceName(loose.type)],
        squares: [loose.square],
        relation: "loose_piece",
        whyThisMatters: "Loose pieces become tactical targets.",
        evidenceType: "board_geometry",
      }),
      semanticEffects: [],
      visualIntent: { category: "loose_piece", primarySquare: loose.square, primaryPiece: pieceName(loose.type), squares: [{ square: loose.square, kind: "danger" }], allowAnswerArrow: false, reason: "A loose or hanging piece is visible from the feature graph." },
      score: scoreStoryBase({ moveSpecificity: 0.4, concreteGrounding: 0.92, tacticalUrgency: 0.74, visualTeachability: 0.9, userClarity: 0.88, confidence: loose.isHanging ? 0.82 : 0.72 }),
      rejectionReasons: [],
    });
  }

  if (graph.summary.centerTensionSquares.length >= 2) {
    const centers = graph.summary.centerTensionSquares.slice(0, 2).join(" and ");
    const template = renderConceptTemplate("center_tension", { centerSquares: centers }, "context_only");
    stories.push({
      id: `context:center:${centers}`,
      kind: "center_decision",
      conceptId: "center_tension",
      title: template.title,
      body: template.snippet,
      mode: "assisted_context",
      isMoveRecommendation: false,
      canBeShownWithoutMoveTrust: true,
      grounding: grounded({
        pieces: [],
        squares: graph.summary.centerTensionSquares.slice(0, 4),
        relation: "center_tension",
        whyThisMatters: "Central tension decides which pieces become active.",
        evidenceType: "board_geometry",
      }),
      semanticEffects: [],
      visualIntent: { category: "center", primarySquare: graph.summary.centerTensionSquares[0], secondarySquare: graph.summary.centerTensionSquares[1], squares: graph.summary.centerTensionSquares.slice(0, 2).map((square) => ({ square, kind: "target" as const })), allowAnswerArrow: false, reason: "Both sides contest central squares." },
      score: scoreStoryBase({ concreteGrounding: 0.86, strategicDepth: 0.82, phaseFit: graph.phase === "opening" || graph.phase === "middlegame" ? 0.9 : 0.45, visualTeachability: 0.86, confidence: 0.78 }),
      rejectionReasons: [],
    });
  }

  const exposed = graph.summary.exposedKings[0];
  if (exposed) {
    const zone = graph.kingZones[exposed].kingSquare;
    const template = renderConceptTemplate("king_safety_first", { targetSquare: zone }, "context_only");
    stories.push({
      id: `context:king:${exposed}`,
      kind: "king_safety",
      conceptId: "king_safety_first",
      title: template.title,
      body: template.snippet,
      mode: "assisted_context",
      isMoveRecommendation: false,
      canBeShownWithoutMoveTrust: true,
      grounding: grounded({
        pieces: ["king"],
        squares: graph.kingZones[exposed].zoneSquares.slice(0, 4),
        relation: "king_zone_exposure",
        whyThisMatters: "An exposed king makes forcing moves more important.",
        evidenceType: "safety",
        claimSafety: "cautious",
      }),
      semanticEffects: [],
      visualIntent: { category: "king_safety", primarySquare: zone, squares: graph.kingZones[exposed].zoneSquares.slice(0, 2).map((square) => ({ square, kind: "danger" as const })), allowAnswerArrow: false, reason: "King zone exposure is elevated." },
      score: scoreStoryBase({ concreteGrounding: 0.78, strategicDepth: 0.78, tacticalUrgency: 0.42, visualTeachability: 0.76, confidence: 0.68 }),
      rejectionReasons: [],
    });
  }

  const openFile = graph.files.find((file) => file.rookOrQueenPotential && (file.isOpen || file.isHalfOpenForWhite || file.isHalfOpenForBlack));
  if (openFile) {
    const template = renderConceptTemplate(openFile.isOpen ? "open_file_context" : "half_open_file", { file: openFile.file }, "context_only");
    stories.push({
      id: `context:file:${openFile.file}`,
      kind: "open_file",
      conceptId: openFile.isOpen ? "open_file_context" : "half_open_file",
      title: template.title,
      body: template.snippet,
      mode: "assisted_context",
      isMoveRecommendation: false,
      canBeShownWithoutMoveTrust: true,
      grounding: grounded({
        pieces: ["rook", "queen"],
        squares: Array.from({ length: 8 }, (_, i) => `${openFile.file}${i + 1}`),
        relation: openFile.isOpen ? "open_file" : "half_open_file",
        whyThisMatters: "Heavy pieces need files to create pressure.",
        evidenceType: "board_geometry",
      }),
      semanticEffects: [],
      visualIntent: { category: "open_file", primarySquare: `${openFile.file}4`, squares: [{ square: `${openFile.file}4`, kind: "target" }], allowAnswerArrow: false, reason: "Open or half-open file detected." },
      score: scoreStoryBase({ concreteGrounding: 0.74, strategicDepth: 0.68, visualTeachability: 0.7, confidence: 0.68 }),
      rejectionReasons: [],
    });
  }

  const weakSquare = Object.values(graph.squares).find((square) => square.isOutpostCandidate || square.isWeakSquareCandidate);
  if (weakSquare) {
    const template = renderConceptTemplate(weakSquare.isOutpostCandidate ? "outpost" : "weak_square", { targetSquare: weakSquare.square }, "context_only");
    stories.push({
      id: `context:weak:${weakSquare.square}`,
      kind: "weak_square",
      conceptId: weakSquare.isOutpostCandidate ? "outpost" : "weak_square",
      title: template.title,
      body: template.snippet,
      mode: "assisted_context",
      isMoveRecommendation: false,
      canBeShownWithoutMoveTrust: true,
      grounding: grounded({
        pieces: [],
        squares: [weakSquare.square],
        relation: weakSquare.isOutpostCandidate ? "outpost_candidate" : "weak_square",
        whyThisMatters: "Stable squares become homes for active pieces.",
        evidenceType: "board_geometry",
        claimSafety: "cautious",
      }),
      semanticEffects: [],
      visualIntent: { category: "weak_square", primarySquare: weakSquare.square, squares: [{ square: weakSquare.square, kind: "target" }], allowAnswerArrow: false, reason: "Weak square candidate detected conservatively." },
      score: scoreStoryBase({ concreteGrounding: 0.68, strategicDepth: 0.7, visualTeachability: 0.72, confidence: 0.58, overclaimPenalty: 0.05 }),
      rejectionReasons: [],
    });
  }

  if (graph.phase === "endgame") {
    const king = graph.pieces.find((piece) => piece.type === "k" && piece.color === graph.sideToMove);
    const template = renderConceptTemplate("king_activity", { targetSquare: king?.square }, "context_only");
    stories.push({
      id: "context:endgame-king",
      kind: "endgame_activity",
      conceptId: "king_activity",
      title: template.title,
      body: template.snippet,
      mode: "assisted_context",
      isMoveRecommendation: false,
      canBeShownWithoutMoveTrust: true,
      grounding: grounded({
        pieces: ["king"],
        squares: king?.square ? [king.square] : [],
        relation: "endgame_activity",
        whyThisMatters: "In simplified positions, king activity often decides the plan.",
        evidenceType: "board_geometry",
      }),
      semanticEffects: [],
      visualIntent: { category: "endgame_activity", primarySquare: king?.square, squares: king?.square ? [{ square: king.square, kind: "support" }] : [], allowAnswerArrow: false, reason: "Low material indicates an endgame." },
      score: scoreStoryBase({ concreteGrounding: 0.66, strategicDepth: 0.78, phaseFit: 0.95, visualTeachability: 0.62, confidence: 0.68 }),
      rejectionReasons: [],
    });
  }

  return stories;
}

function selectStory(
  stories: TrainingContextStory[],
  moveTrust: MoveRecommendationTrust,
  showAnswer: boolean,
  options: { trustedExpectedMove: boolean },
): { selected: TrainingContextStory | null; rejected: TrainingContextStory[] } {
  const safeToRecommend = trustedMoveTrust(moveTrust);
  const rejected: TrainingContextStory[] = [];
  const eligible = stories
    .map((story) => {
      const next = { ...story, rejectionReasons: [...story.rejectionReasons] };
      if (!safeToRecommend && story.isMoveRecommendation) next.rejectionReasons.push("move_recommendation_blocked_by_trust");
      if (options.trustedExpectedMove && (story.kind === "context_safe_contrast" || story.kind === "strong_alternative" || story.conceptId === "strong_alternative")) {
        next.rejectionReasons.push("trusted_expected_move_prefers_move_teaching");
      }
      if (story.grounding.claimSafety === "speculative") next.rejectionReasons.push("speculative_claim_debug_only");
      if (!showAnswer && story.grounding.revealRisk === "high" && !safeToRecommend) next.rejectionReasons.push("high_reveal_risk_without_trust");
      if (!story.grounding.pieces.length && !story.grounding.squares.length && story.kind !== "honest_unavailable") next.rejectionReasons.push("missing_concrete_grounding");
      return next;
    })
    .filter((story) => {
      if (story.rejectionReasons.length) {
        rejected.push(story);
        return false;
      }
      return true;
    });

  const sorted = eligible.sort((a, b) => b.score.total - a.score.total || b.score.visualTeachability - a.score.visualTeachability || b.score.concreteGrounding - a.score.concreteGrounding);
  if (options.trustedExpectedMove) {
    const moveSpecific = sorted.filter((story) => story.isMoveRecommendation);
    if (moveSpecific.length > 0) {
      return { selected: moveSpecific[0], rejected: [...rejected, ...sorted.filter((story) => story.id !== moveSpecific[0].id)] };
    }
  }
  return { selected: sorted[0] ?? null, rejected: [...rejected, ...sorted.slice(1)] };
}

function deriveContextTrust(story: TrainingContextStory | null): TeachingContextTrust {
  if (!story) return "no_safe_context";
  if (story.grounding.claimSafety === "speculative") return "no_safe_context";
  if (story.score.concreteGrounding >= 0.8 && story.score.total >= 0.65) return "rich_context";
  if (story.score.concreteGrounding >= 0.55) return "safe_context";
  return "minimal_context";
}

function deriveMode(
  moveTrust: MoveRecommendationTrust,
  contextTrust: TeachingContextTrust,
  selected: TrainingContextStory | null,
  trustedExpectedMove: boolean,
  severeSafetyWarning: boolean,
): TrainingContextMode {
  const canRecommend = trustedMoveTrust(moveTrust);
  if (trustedExpectedMove && !severeSafetyWarning) return "move_teaching";
  if (canRecommend && selected?.isMoveRecommendation) return "move_teaching";
  if (selected && (contextTrust === "rich_context" || contextTrust === "safe_context" || contextTrust === "minimal_context")) return "assisted_context";
  if (moveTrust === "untrusted") return "line_needs_review";
  return "honest_unavailable";
}

function derivePermission(
  input: TrainingContextInput,
  mode: TrainingContextMode,
  moveTrust: MoveRecommendationTrust,
  contextTrust: TeachingContextTrust,
  trustedExpectedMove: boolean,
  severeSafetyWarning: boolean,
): TrainingContextPermission {
  if (input.trainerView === "plain" && !input.showAnswer) {
    return {
      canRecommendMove: false,
      canShowMoveArrow: false,
      canShowPatternCue: false,
      canShowContextCue: false,
      canShowAnswerOverlays: false,
      canShowContextOverlays: false,
      canShowPlanIndicators: false,
      canShowAlternatives: false,
      canShowDebugEvidence: true,
      userLabel: "No hints",
    };
  }
  const revealUnverified = moveTrust === "reveal_only_unverified";
  const forceRecommend = (trustedExpectedMove && !severeSafetyWarning) || (revealUnverified && input.showAnswer);
  const canRecommend = forceRecommend || (mode === "move_teaching" && trustedMoveTrust(moveTrust));
  const canContext = mode === "assisted_context" && contextTrust !== "no_safe_context";
  const label =
    moveTrust === "engine_verified" && canRecommend ? "Blundr Brain Validated" :
    moveTrust === "book_supported" && canRecommend ? "Book-supported pattern" :
    moveTrust === "repertoire_supported" && canRecommend ? "Repertoire move" :
    moveTrust === "engine_close" && canRecommend ? "Engine-close move" :
    moveTrust === "reveal_only_unverified" ? "Study-line move" :
    mode === "assisted_context" ? "Assisted context" :
    mode === "line_needs_review" ? "Line needs review" :
    "Move not verified";

  return {
    canRecommendMove: canRecommend,
    canShowMoveArrow: canRecommend || input.showAnswer,
    canShowPatternCue: canRecommend,
    canShowContextCue: canContext,
    canShowAnswerOverlays: canRecommend || input.showAnswer,
    canShowContextOverlays: canContext || canRecommend,
    canShowPlanIndicators: canContext || canRecommend,
    canShowAlternatives: canContext,
    canShowDebugEvidence: true,
    userLabel: label,
  };
}

function compileCue(input: {
  story: TrainingContextStory | null;
  mode: TrainingContextMode;
  permission: TrainingContextPermission;
  moveTrust: MoveRecommendationTrust;
  trustedExpectedMove: boolean;
  severeSafetyWarning: boolean;
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  fenBefore: string;
}): TeachingCue {
  const story = input.story;
  const revealForceRecommend = input.moveTrust === "reveal_only_unverified" && input.permission.canRecommendMove;
  const forceRecommend = (input.trustedExpectedMove && !input.severeSafetyWarning) || revealForceRecommend;
  const canRecommend = input.permission.canRecommendMove && (story?.isMoveRecommendation || forceRecommend);
  const title = story?.title ?? (input.mode === "line_needs_review" ? "Line needs review" : "Move not verified");
  const snippet = story?.body ?? (input.mode === "line_needs_review" ? "Blundr will not recommend this saved line here." : "Blundr will not invent a plan here.");
  const badge = input.moveTrust === "engine_verified" && canRecommend ? "Blundr Brain Validated" : input.moveTrust === "book_supported" && canRecommend ? "Book-supported pattern" : undefined;
  const from = normalizeUci(input.expectedMoveUci).slice(0, 2);
  const to = normalizeUci(input.expectedMoveUci).slice(2, 4);
  const primaryArrow = canRecommend && from && to ? { from, to, kind: "move" as const } : undefined;
  const keySquares = story?.visualIntent.squares.slice(0, 3) ?? [];
  const relationshipLines: VisualLine[] = [];
  if (canRecommend && story?.visualIntent.secondarySquare && story.visualIntent.primarySquare && story.visualIntent.secondarySquare !== story.visualIntent.primarySquare) {
    relationshipLines.push({ from: story.visualIntent.primarySquare, to: story.visualIntent.secondarySquare, kind: "pressure" });
  }
  return {
    id: `training-context-${Date.now()}`,
    conceptId: story?.conceptId ?? "context_only",
    cueMode: canRecommend ? "move_teaching" : input.mode === "assisted_context" ? "context_only" : "context_only",
    teachingPermissionTier: input.moveTrust,
    primaryFocus: story?.conceptId,
    selectedStoryId: story?.id,
    storyScore: story?.score.total,
    themesShown: story ? [story.conceptId] : [],
    answerVisualsShown: input.permission.canShowAnswerOverlays,
    contextVisualsShown: input.permission.canShowContextOverlays,
    confidence: story?.score.confidence ?? 0.4,
    userFacing: {
      badge,
      title,
      snippet,
      next: canRecommend && input.expectedMoveSan ? `Play ${input.expectedMoveSan}.` : undefined,
    },
    visual: {
      primaryArrow,
      relationshipLines,
      keySquares,
      ghostSquares: [],
      dangerSquares: keySquares.filter((square) => square.kind === "danger"),
    },
    debug: {
      confidence: story?.score.confidence ?? 0,
      selectedReason: story?.grounding.whyThisMatters ?? "No grounded story selected.",
      candidateCount: 0,
      suppressedReasons: story?.rejectionReasons ?? [],
      deltaSummary: story?.semanticEffects.flatMap((effect) => [effect.before, effect.after]) ?? [],
      detectorScores: [],
    },
    metadata: {
      fenBefore: input.fenBefore,
      moveSan: input.expectedMoveSan ?? "",
      moveUci: input.expectedMoveUci ?? "",
      createdAt: new Date().toISOString(),
      compilerVersion: TEACHING_CUE_COMPILER_VERSION,
    },
  };
}

function routeVisuals(input: {
  story: TrainingContextStory | null;
  cue: TeachingCue;
  permission: TrainingContextPermission;
  trainerView: "assisted" | "plain";
  showAnswer: boolean;
  trustedExpectedMove: boolean;
  revealModeActive: boolean;
  expectedMoveUci?: string;
}): TrainingContextVisualDecision {
  if (input.trainerView === "plain" && !input.showAnswer) {
    return {
      visualLines: [],
      visualSquares: [],
      answerVisualsShown: false,
      contextVisualsShown: false,
      planVisualsShown: false,
      suppressedReasons: ["plain_view_no_hints"],
      visualBudgetUsed: { primaryIdea: 0, supportingHighlights: 0, lines: 0 },
      selectedVisualStory: input.story?.id,
      revealLevel: "context",
      emphasis: "subtle",
      visualConceptAlignment: "minimal",
    };
  }

  const suppressedReasons: string[] = [];
  const visualLines: TrainingContextVisualDecision["visualLines"] = [];
  const visualSquares: TrainingContextVisualDecision["visualSquares"] = [];
  const story = input.story;
  const from = normalizeUci(input.expectedMoveUci).slice(0, 2);
  const to = normalizeUci(input.expectedMoveUci).slice(2, 4);

  if (input.permission.canShowAnswerOverlays && input.permission.canShowMoveArrow && from && to && input.cue.visual.primaryArrow) {
    visualLines.push({ from, to, kind: "plan", label: input.cue.userFacing.next?.replace(/^Play\s+/, "").replace(/\.$/, "") });
  } else if (input.cue.visual.primaryArrow) {
    suppressedReasons.push("answer_arrow_blocked");
  }

  if (input.trustedExpectedMove && input.trainerView === "assisted" && from && to && visualLines.length === 0) {
    visualLines.push({ from, to, kind: "plan", label: input.cue.userFacing.next?.replace(/^Play\s+/, "").replace(/\.$/, "") });
    const idx = suppressedReasons.indexOf("answer_arrow_blocked");
    if (idx >= 0) suppressedReasons.splice(idx, 1);
  }
  if (input.revealModeActive && input.trainerView === "assisted" && from && to && visualLines.length === 0) {
    visualLines.push({ from, to, kind: "plan", label: input.cue.userFacing.next?.replace(/^Play\s+/, "").replace(/\.$/, "") || safeSan({ fen: input.cue.metadata.fenBefore, uci: input.expectedMoveUci }) });
  }

  if (input.permission.canShowContextOverlays) {
    for (const square of story?.visualIntent.squares ?? input.cue.visual.keySquares) {
      if (visualSquares.length >= 2) break;
      visualSquares.push({
        square: square.square,
        kind: square.kind === "danger" ? "danger" : square.kind === "support" ? "support" : "target",
        role: story?.visualIntent.category,
      });
    }
  } else if (story?.visualIntent.squares.length) {
    suppressedReasons.push("context_overlays_blocked");
  }

  const expectedCategory = story?.visualIntent.category ?? "minimal";
  const aligned = expectedCategory === "minimal" || visualSquares.length > 0 || visualLines.length > 0;
  if (!aligned) suppressedReasons.push("visual_concept_mismatch");

  return {
    visualLines: visualLines.slice(0, input.permission.canShowAnswerOverlays ? 2 : 1),
    visualSquares: visualSquares.slice(0, 2),
    answerVisualsShown: input.permission.canShowAnswerOverlays && visualLines.length > 0,
    contextVisualsShown: input.permission.canShowContextOverlays && visualSquares.length > 0,
    planVisualsShown: input.permission.canShowPlanIndicators,
    suppressedReasons,
    visualBudgetUsed: { primaryIdea: visualLines.length || visualSquares.length ? 1 : 0, supportingHighlights: visualSquares.length, lines: visualLines.length },
    selectedVisualStory: story?.id,
    revealLevel: input.permission.canShowAnswerOverlays ? "answer" : input.permission.canShowContextOverlays ? "context" : "plan",
    emphasis: input.permission.canShowAnswerOverlays ? "strong" : input.permission.canShowContextOverlays ? "normal" : "subtle",
    visualConceptAlignment: aligned ? "aligned" : "visual_concept_mismatch",
  };
}

function moveImpact(mode: TrainingContextMode, moveTrust: MoveRecommendationTrust, contextTrust: TeachingContextTrust): TrainingContextResult["moveImpact"] {
  if (mode === "assisted_context") return { label: "Position context", pct: 64, tone: "bg-sky-700", note: "Focus on the key feature of the position." };
  if (mode === "line_needs_review") return { label: "Needs review", pct: 32, tone: "bg-amber-600", note: "Blundr will not recommend this saved line here." };
  if (moveTrust === "engine_verified") return { label: "Validated", pct: 88, tone: "bg-green-700", note: "Blundr Brain validated this training pattern." };
  if (moveTrust === "book_supported") return { label: "Book-supported", pct: 78, tone: "bg-green-600", note: "Trusted opening practice supports this pattern." };
  if (moveTrust === "engine_close") return { label: "Engine-close", pct: 74, tone: "bg-green-600", note: "The expected move is close to the engine best line." };
  if (moveTrust === "repertoire_supported") return { label: "Repertoire", pct: 70, tone: "bg-green-500", note: "This study-line move remains teachable here." };
  if (moveTrust === "reveal_only_unverified") return { label: "Study-line", pct: 56, tone: "bg-sky-600", note: "Shown as a stored study move, not engine-validated." };
  if (contextTrust !== "no_safe_context") return { label: "Context", pct: 58, tone: "bg-sky-600", note: "A safe board feature is available to study." };
  return { label: "Not verified", pct: 28, tone: "bg-stone-500", note: "Blundr will stay quiet instead of guessing." };
}

export function buildTrainingContext(input: TrainingContextInput): TrainingContextResult {
  const expectedUci = normalizeUci(input.expectedMoveUci);
  const expectedSan = safeSan({ fen: input.fenBefore, uci: expectedUci, san: input.expectedMoveSan });
  const expectedMoveExists = Boolean(expectedUci);
  const expectedMoveIsValidated = expectedMoveExists && expectedMoveValidated(input.fenBefore, expectedUci);
  const topMoves = input.topMoves?.length ? input.topMoves : input.moveQuality?.topMoves ?? [];
  const graphBefore = buildChessFeatureGraph(input.fenBefore);
  const expectedFenAfter = input.fenAfter ?? applyUci(input.fenBefore, expectedUci);
  const expectedAnalysis = expectedUci
    ? analyzeMoveSemantics({
        fenBefore: input.fenBefore,
        fenAfter: expectedFenAfter,
        moveUci: expectedUci,
        moveSan: expectedSan,
        featureGraphBefore: graphBefore,
      })
    : null;
  const comparisons = compareMoveToTopMoves({
    fen: input.fenBefore,
    expectedMoveUci: expectedUci,
    expectedMoveSan: expectedSan,
    topMoves,
  });
  const revealModeActive = Boolean(input.showAnswer);
  const bestLine = topMoves.slice().sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))[0];
  const expectedLine = topMoves.find((line) => normalizeUci(line.uci) === expectedUci);
  const bestMoveCp = typeof input.moveQuality?.bestMoveCp === "number" ? input.moveQuality.bestMoveCp : bestLine?.scoreCp;
  const expectedMoveCp = typeof input.moveQuality?.expectedMoveCp === "number" ? input.moveQuality.expectedMoveCp : expectedLine?.scoreCp;
  const deltaCp =
    typeof input.moveQuality?.deltaCp === "number"
      ? input.moveQuality.deltaCp
      : typeof bestMoveCp === "number" && typeof expectedMoveCp === "number"
        ? Math.max(0, bestMoveCp - expectedMoveCp)
        : undefined;
  const hasSafeSemanticExplanation = Boolean(expectedAnalysis?.effects.some((effect) => effect.claimSafety !== "speculative"));
  const trust = classifyMoveTrust({
    moveQualityStatus: input.moveQuality?.status,
    moveQualityReason: input.moveQuality?.reason,
    expectedMoveUci: expectedUci,
    expectedMoveIsValidated,
    expectedMoveCp,
    bestMoveCp,
    deltaCp,
    bookSupport: input.bookSupport,
    repertoireSupport: input.repertoireSupport,
    revealModeActive,
    hasSafeSemanticExplanation,
  });
  const trustedFromTrust = expectedMoveExists && expectedMoveIsValidated && trustedMoveTrust(trust.trust);
  const trustedFromGate = expectedMoveExists && expectedMoveIsValidated && moveQualityTrustedStatus(input.moveQuality?.status);
  const trustedExpectedMove = trustedFromTrust || trustedFromGate;
  const severeSafetyWarning = trust.validationFailureReason === "severe_engine_delta" || (typeof deltaCp === "number" && deltaCp > MOVE_TRUST_SEVERE_DROP_CP);
  const allowStrongAlternative = Boolean((input.userMoveUci && normalizeUci(input.userMoveUci) !== expectedUci) || !trustedExpectedMove);
  const moveTrusted = trustedExpectedMove;

  const stories: TrainingContextStory[] = [
    ...(expectedAnalysis ? expectedAnalysis.effects.map((item) => effectToStory(item, expectedAnalysis, moveTrusted)) : []),
    ...comparisons.map((comparison) => comparisonStory(comparison, expectedAnalysis, allowStrongAlternative)),
    ...contextStories(graphBefore),
  ];

  if (input.bookSupport?.hasBookSupport && expectedUci && trust.trust === "book_supported") {
    const template = renderConceptTemplate("book_pattern", { moveSan: expectedSan }, "move_teaching");
    stories.push({
      id: `book:${expectedUci}`,
      kind: "book_pattern",
      conceptId: "book_pattern",
      title: template.title,
      body: template.snippet,
      mode: "move_teaching",
      moveUci: expectedUci,
      moveSan: expectedSan,
      isMoveRecommendation: true,
      canBeShownWithoutMoveTrust: false,
      grounding: grounded({
        pieces: [],
        squares: [expectedUci.slice(0, 2), expectedUci.slice(2, 4)],
        relation: "book_support",
        whyThisMatters: input.bookSupport.reason ?? "Trusted opening practice supports this pattern.",
        evidenceType: "book_support",
      }),
      semanticEffects: expectedAnalysis?.effects ?? [],
      visualIntent: { category: "answer_move", primarySquare: expectedUci.slice(2, 4), secondarySquare: expectedUci.slice(0, 2), squares: [{ square: expectedUci.slice(2, 4), kind: "target" }], allowAnswerArrow: true, reason: "Book-supported move recommendation." },
      score: scoreStoryBase({ moveSpecificity: 0.75, concreteGrounding: 0.72, phaseFit: 0.9, visualTeachability: 0.7, confidence: input.bookSupport.confidence ?? 0.75 }),
      rejectionReasons: [],
    });
  }

  const selected = selectStory(stories, trust.trust, input.showAnswer, { trustedExpectedMove });
  const contextTrust = deriveContextTrust(selected.selected);
  const mode = deriveMode(trust.trust, contextTrust, selected.selected, trustedExpectedMove, severeSafetyWarning);
  const permission = derivePermission(input, mode, trust.trust, contextTrust, trustedExpectedMove, severeSafetyWarning);
  const cue = compileCue({
    story: selected.selected,
    mode,
    permission,
    moveTrust: trust.trust,
    trustedExpectedMove,
    severeSafetyWarning,
    expectedMoveUci: expectedUci,
    expectedMoveSan: expectedSan,
    fenBefore: input.fenBefore,
  });
  cue.debug.candidateCount = stories.length;
  const visualDecision = routeVisuals({
    story: selected.selected,
    cue,
    permission,
    trainerView: input.trainerView,
    showAnswer: input.showAnswer,
    trustedExpectedMove,
    revealModeActive,
    expectedMoveUci: expectedUci,
  });
  cue.answerVisualsShown = visualDecision.answerVisualsShown;
  cue.contextVisualsShown = visualDecision.contextVisualsShown;

  const revealShowsExpectedMove = trust.trust === "reveal_only_unverified" && revealModeActive;
  const nextAllowed = Boolean(
    (trustedExpectedMove && !severeSafetyWarning && cue.userFacing.next) ||
      (revealShowsExpectedMove && cue.userFacing.next) ||
      (permission.canRecommendMove && cue.userFacing.next && mode === "move_teaching" && !severeSafetyWarning),
  );
  const nextSuppression = nextAllowed ? undefined : mode === "assisted_context" ? "context_mode_does_not_recommend_move" : input.moveQuality?.status === "rejected" ? "move_quality_rejected" : "recommendation_not_permitted";
  const warnings: string[] = [];
  if (expectedMoveExists && trustedMoveTrust(trust.trust) && mode !== "move_teaching") warnings.push("verified_expected_move_not_in_move_teaching_mode");
  if (expectedMoveExists && trustedExpectedMove && !nextAllowed) warnings.push("verified_expected_move_next_play_suppressed");
  if (expectedMoveExists && trustedExpectedMove && input.trainerView === "assisted" && visualDecision.visualLines.length === 0) warnings.push("verified_expected_move_without_answer_line");
  if (expectedMoveIsValidated && input.repertoireSupport && input.moveQuality?.status === "rejected" && /top two/i.test(input.moveQuality?.reason ?? "") && trust.trust !== "untrusted") {
    warnings.push("repertoire_move_rejected_by_top_two_only");
  }
  if (revealModeActive && expectedMoveExists && visualDecision.visualLines.length === 0) warnings.push("reveal_next_move_without_answer_line");
  if (input.moveQuality?.status === "rejected" && typeof expectedMoveCp !== "number") warnings.push("expected_move_eval_missing");
  const learningMetadata = {
    cueMode: cue.cueMode,
    trainingContextMode: mode,
    moveTrust: trust.trust,
    contextTrust,
    userFacingMode: mode,
    selectedStoryId: selected.selected?.id,
    selectedStoryKind: selected.selected?.kind,
    storyScoreTotal: selected.selected?.score.total,
    storySpecificityScore: selected.selected?.score.moveSpecificity,
    concreteGroundingScore: selected.selected?.score.concreteGrounding,
    genericnessPenalty: selected.selected?.score.genericnessPenalty,
    moveSemanticEffects: expectedAnalysis?.effects.map((effect) => effect.type).join(","),
    topAlternativeThemes: comparisons.map((comparison) => comparison.alternativeTheme).join(","),
    answerVisualsShown: visualDecision.answerVisualsShown,
    contextVisualsShown: visualDecision.contextVisualsShown,
    planVisualsShown: visualDecision.planVisualsShown,
    nextPlayAllowed: nextAllowed,
    nextPlaySuppressed: !nextAllowed,
    nextPlaySuppressionReason: nextSuppression,
    visualConceptAlignment: visualDecision.visualConceptAlignment,
    conceptId: cue.conceptId,
    confidence: cue.confidence ?? 0,
    compilerVersion: TEACHING_CUE_COMPILER_VERSION,
    suppressionReasons: visualDecision.suppressedReasons.join(","),
    visualBudgetUsed: JSON.stringify(visualDecision.visualBudgetUsed),
    debugWarnings: warnings.join(","),
    expectedMoveCp: expectedMoveCp ?? null,
    bestMoveCp: bestMoveCp ?? null,
    deltaCp: deltaCp ?? null,
    revealModeActive,
    repertoireEvidence: input.repertoireSupport ? "lesson_or_repertoire_branch" : "none",
    openingSourceEvidence: input.bookSupport?.hasBookSupport ? (input.bookSupport.reason ?? "in_book") : "none",
    validationFailureReason: trust.validationFailureReason ?? null,
  };

  return {
    mode,
    moveTrust: trust.trust,
    contextTrust,
    selectedStory: selected.selected,
    cue,
    visualDecision,
    permission,
    userLabel: permission.userLabel,
    moveImpact: moveImpact(mode, trust.trust, contextTrust),
    nextPlay: {
      allowed: nextAllowed,
      san: nextAllowed ? expectedSan : undefined,
      suppressionReason: nextSuppression,
    },
    debug: {
      evidenceSummary: [
        `Phase: ${graphBefore.phase}`,
        `Move trust: ${trust.trust}`,
        `Context trust: ${contextTrust}`,
        `Saved move: ${expectedSan ?? (expectedUci || "none")}`,
        `Feature context: ${graphBefore.summary.strongestContext ?? "none"}`,
      ],
      selectedStoryGrounding: selected.selected?.grounding,
      moveSemanticSummary: expectedAnalysis?.summary ?? [],
      topMoveComparisons: comparisons,
      storyScores: stories.map((story) => ({ id: story.id, kind: story.kind, total: story.score.total, reasons: [story.grounding.whyThisMatters] })),
      rejectedStories: selected.rejected.map((story) => ({ id: story.id, kind: story.kind, total: story.score.total, reasons: story.rejectionReasons })),
      moveTrustReason: trust.reason,
      validationFailureReason: trust.validationFailureReason,
      expectedMoveCp,
      bestMoveCp,
      deltaCp,
      repertoireEvidence: input.repertoireSupport ? "lesson_or_repertoire_branch" : "none",
      openingSourceEvidence: input.bookSupport?.hasBookSupport ? (input.bookSupport.reason ?? "in_book") : "none",
      revealModeActive,
      contextTrustReason: selected.selected?.grounding.whyThisMatters ?? "No safe grounded context selected.",
      permissionFlags: {
        userLabel: permission.userLabel,
        canRecommendMove: permission.canRecommendMove,
        canShowMoveArrow: permission.canShowMoveArrow,
        canShowPatternCue: permission.canShowPatternCue,
        canShowContextCue: permission.canShowContextCue,
        canShowAnswerOverlays: permission.canShowAnswerOverlays,
        canShowContextOverlays: permission.canShowContextOverlays,
      },
      suppressionReasons: visualDecision.suppressedReasons,
      visualConceptAlignment: visualDecision.visualConceptAlignment,
      savedMoveNotValidated: !trust.safeToRecommend && Boolean(expectedUci),
      nextPlaySuppressionReason: nextSuppression,
      warnings,
    },
    learningMetadata,
  };
}
