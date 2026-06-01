import { Chess } from "chess.js";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import { classifyContinuationSource, hasTerminalNodeForColor, legalContinuationsForColor } from "./branchResolver";
import { resolveOpeningFamilyPlanFallback } from "./openingFamilyPlanFallback";
import type { OpeningTree, RepertoireContinuation, ResolvedExpectedMove } from "./openingTypes";
import { findTranspositionNodes } from "./transpositionMatcher";

function emptyResolution(reason: string, debug: Record<string, unknown> = {}): ResolvedExpectedMove {
  return {
    expectedMoveSan: null,
    expectedMoveUci: null,
    source: "none",
    bookResolutionState: "unresolved_missing_mapping",
    coverageTier: "unresolved",
    legal: null,
    lineCursor: null,
    lineLength: null,
    reason,
    candidateMoves: [],
    exhausted: false,
    shouldTransitionToContinuation: false,
    debug,
  };
}

function fromContinuation(input: {
  continuation: RepertoireContinuation;
  source: ResolvedExpectedMove["source"];
  bookResolutionState?: ResolvedExpectedMove["bookResolutionState"];
  coverageTier: ResolvedExpectedMove["coverageTier"];
  reason: string;
  candidates: RepertoireContinuation[];
  lineCursor: number | null;
  lineLength: number | null;
  debug: Record<string, unknown>;
}): ResolvedExpectedMove {
  const bookResolutionState =
    input.bookResolutionState ??
    (input.source === "continuation_candidate"
      ? "continuation_candidate"
      : input.source === "transposition"
        ? "transposition_available"
        : input.source === "opening_branch" || input.source === "lesson_line"
          ? "user_move_available"
          : "adaptive_branch_available");
  return {
    expectedMoveSan: input.continuation.san,
    expectedMoveUci: input.continuation.uci,
    source: input.source,
    bookResolutionState,
    coverageTier: input.coverageTier,
    legal: true,
    lineCursor: input.lineCursor,
    lineLength: input.lineLength,
    reason: input.reason,
    candidateMoves: input.candidates,
    exhausted: false,
    shouldTransitionToContinuation: false,
    debug: input.debug,
  };
}

function engineContinuation(input: {
  fen: string;
  line: { san?: string; uci?: string };
  openingId: string;
  lineId: string;
}): RepertoireContinuation | null {
  if (!input.line.uci) return null;
  try {
    const game = new Chess(input.fen);
    const moveInput: { from: string; to: string; promotion?: string } = {
      from: input.line.uci.slice(0, 2),
      to: input.line.uci.slice(2, 4),
    };
    if (input.line.uci.length > 4) {
      moveInput.promotion = input.line.uci.slice(4, 5);
    }
    const move = game.move(moveInput);
    if (!move) return null;
    return {
      san: move.san || input.line.san || input.line.uci,
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      color: move.color as "w" | "b",
      resultingFen: game.fen(),
      resultingFen4: normalizeVisualFen(game.fen()),
      source: "legacy_recoverable",
      lineId: input.lineId,
      openingId: input.openingId,
      ply: game.history().length - 1,
    };
  } catch {
    return null;
  }
}

export function resolveExpectedMoveForFrame(input: {
  openingTree: OpeningTree;
  fen: string;
  trainerPhase: string;
  trainingMode: "restricted" | "continuation";
  trainerView: "assisted" | "plain";
  isUserTurn: boolean;
  userColor: "w" | "b";
  opponentColor: "w" | "b";
  lastOpponentMoveUci?: string | null;
  lastOpponentMoveSan?: string | null;
  legacyExpectedMoveCandidate?: { san?: string | null; uci?: string | null } | null;
  enginePreview?: { pvs?: Array<{ san?: string; uci?: string }> } | null;
  allowEngineFallbackInRestricted?: boolean;
}): ResolvedExpectedMove {
  const fen4 = normalizeVisualFen(input.fen);
  const exactNodes = input.openingTree.nodesByFen4[fen4] ?? [];
  const debug: Record<string, unknown> = {
    fen4,
    exactFenNodeFound: exactNodes.length > 0,
    exactFenNodeCount: exactNodes.length,
    trainerView: input.trainerView,
    lastOpponentMoveUci: input.lastOpponentMoveUci ?? null,
    lastOpponentMoveSan: input.lastOpponentMoveSan ?? null,
  };

  if (input.trainerPhase !== "ready_for_user" || !input.isUserTurn) {
    return {
      ...emptyResolution("not_user_turn_or_not_ready", debug),
      bookResolutionState: "opponent_to_move",
    };
  }

  const exactCandidates = legalContinuationsForColor(exactNodes, input.fen, input.userColor);
  if (exactCandidates.length) {
    const selected = exactCandidates[0];
    const classifiedSource = classifyContinuationSource(exactNodes, selected);
    return fromContinuation({
      continuation: { ...selected, source: classifiedSource },
      source: classifiedSource,
      bookResolutionState: "user_move_available",
      coverageTier: classifiedSource === "opening_branch" ? "known_branch_deep_coached" : "exact_line_deep_coached",
      reason: classifiedSource === "opening_branch" ? "exact_fen_opening_branch_node" : "exact_fen_repertoire_node",
      candidates: exactCandidates.map((candidate) => ({ ...candidate, source: classifyContinuationSource(exactNodes, candidate) })),
      lineCursor: selected.ply,
      lineLength: exactNodes.find((node) => node.lineId === selected.lineId)?.lineLength ?? null,
      debug: { ...debug, selectedLineId: selected.lineId },
    });
  }

  const transposition = findTranspositionNodes(input.openingTree, input.fen);
  const transpositionCandidates = legalContinuationsForColor(transposition.nodes, input.fen, input.userColor);
  if (!exactNodes.length && transpositionCandidates.length) {
    const selected = transpositionCandidates[0];
    return fromContinuation({
      continuation: { ...selected, source: "transposition" },
      source: "transposition",
      bookResolutionState: "transposition_available",
      coverageTier: "transposition_deep_coached",
      reason: "fen_transposed_to_known_repertoire_node",
      candidates: transpositionCandidates.map((candidate) => ({ ...candidate, source: "transposition" })),
      lineCursor: selected.ply,
      lineLength: transposition.nodes.find((node) => node.lineId === selected.lineId)?.lineLength ?? null,
      debug: { ...debug, transpositionNodeFound: true, transpositionKey: transposition.transpositionKey },
    });
  }

  if (input.legacyExpectedMoveCandidate?.uci) {
    const recovered = engineContinuation({
      fen: input.fen,
      line: { san: input.legacyExpectedMoveCandidate.san ?? undefined, uci: input.legacyExpectedMoveCandidate.uci },
      openingId: input.openingTree.openingId,
      lineId: "legacy-recovered",
    });
    if (recovered?.color === input.userColor) {
      return fromContinuation({
        continuation: { ...recovered, source: "legacy_recoverable" },
        source: "legacy_recoverable",
        bookResolutionState: "adaptive_branch_available",
        coverageTier: "known_branch_deep_coached",
        reason: "legacy_candidate_recovered",
        candidates: [{ ...recovered, source: "legacy_recoverable" }],
        lineCursor: recovered.ply,
        lineLength: null,
        debug: { ...debug, legacyRecoverableCandidateUsed: true },
      });
    }
  }

  if (exactNodes.length && hasTerminalNodeForColor(exactNodes, input.userColor)) {
    const terminal = exactNodes.find((node) => node.terminal && node.sideToMove === input.userColor);
    return {
      expectedMoveSan: null,
      expectedMoveUci: null,
      source: "guided_branch_needs_continuation",
      bookResolutionState: "guided_branch_needs_continuation",
      coverageTier: "continuation_candidate",
      legal: null,
      lineCursor: terminal?.ply ?? null,
      lineLength: terminal?.lineLength ?? null,
      reason: "repertoire_line_exhausted_needs_continuation",
      candidateMoves: [],
      exhausted: true,
      shouldTransitionToContinuation: true,
      debug: { ...debug, exactTerminalNodeFound: true, lineExhaustedGuardPassed: true },
    };
  }

  if (input.trainingMode === "continuation") {
    const continuation = engineContinuation({
      fen: input.fen,
      line: input.enginePreview?.pvs?.[0] ?? {},
      openingId: input.openingTree.openingId,
      lineId: "continuation-candidate",
    });
    if (continuation?.color === input.userColor) {
      return fromContinuation({
        continuation,
        source: "continuation_candidate",
        bookResolutionState: "continuation_candidate",
        coverageTier: "continuation_candidate",
        reason: "trusted_continuation_candidate",
        candidates: [continuation],
        lineCursor: continuation.ply,
        lineLength: null,
        debug,
      });
    }
  }

  if (input.trainingMode === "restricted" && !exactNodes.length) {
    const fallback = resolveOpeningFamilyPlanFallback({
      fen: input.fen,
      openingId: input.openingTree.openingId,
      lineId: "opening-family-plan",
      userColor: input.userColor,
    });
    if (fallback.continuation) {
      return fromContinuation({
        continuation: { ...fallback.continuation, source: "legacy_recoverable" },
        source: "opening_family_plan",
        bookResolutionState: "adaptive_branch_available",
        coverageTier: "opening_family_plan_coached",
        reason: "opening_family_plan_fallback",
        candidates: [fallback.continuation],
        lineCursor: fallback.continuation.ply,
        lineLength: null,
        debug: { ...debug, openingFamilyPlanFallbackUsed: true, openingFamilyPlanType: fallback.planType, openingFamilyPlanReason: fallback.reason },
      });
    }
    debug.openingFamilyPlanFallbackReason = fallback.reason;
  }

  if (input.trainingMode === "restricted" && input.allowEngineFallbackInRestricted) {
    const continuation = engineContinuation({
      fen: input.fen,
      line: input.enginePreview?.pvs?.[0] ?? {},
      openingId: input.openingTree.openingId,
      lineId: "engine-preview-fallback",
    });
    if (continuation?.color === input.userColor) {
      return fromContinuation({
        continuation,
        source: "engine_preview_fallback",
        bookResolutionState: "adaptive_branch_available",
        coverageTier: "general_feature_coached",
        reason: "engine_preview_fallback_explicitly_enabled",
        candidates: [continuation],
        lineCursor: continuation.ply,
        lineLength: null,
        debug: { ...debug, engineFallbackInRestrictedUsed: true },
      });
    }
  }

  return {
    ...emptyResolution(exactNodes.length ? "known_node_has_no_user_continuation" : "no_repertoire_node_or_plan_fallback", {
      ...debug,
      transpositionNodeFound: transposition.nodes.length > 0,
      unresolvedMappingReason: exactNodes.length ? "known_node_has_no_user_continuation" : "no_repertoire_node_or_plan_fallback",
      bookResolutionState: exactNodes.length ? "guided_branch_needs_continuation" : "unresolved_missing_mapping",
    }),
    bookResolutionState: exactNodes.length ? "guided_branch_needs_continuation" : "unresolved_missing_mapping",
    source: exactNodes.length ? "guided_branch_needs_continuation" : "none",
    shouldTransitionToContinuation: Boolean(exactNodes.length),
    exhausted: Boolean(exactNodes.length),
  };
}
