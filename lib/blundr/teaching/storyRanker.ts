import { detectConcepts } from "./conceptDetectors";
import type { TeachingEvidence } from "./evidenceCollector";
import { renderTeachingTemplate } from "./conceptTemplates";
import type { TeachingStoryCandidate, TeachingStoryKind, TeachingStorySelectionResult } from "./storyTypes";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function inferKind(conceptId: string): TeachingStoryKind {
  if (conceptId === "win_loose_piece" || conceptId === "immediate_tactic") return "immediate_tactic";
  if (conceptId === "attack_loose_piece" || conceptId === "pressure_target") return "tactical_pressure";
  if (conceptId === "king_safety_first") return "king_safety";
  if (conceptId === "center_tension" || conceptId === "center_control") return "center_decision";
  if (conceptId === "development_lag") return "development";
  if (conceptId === "improve_worst_piece") return "improve_piece";
  if (conceptId === "open_file_context" || conceptId === "half_open_file") return "open_file";
  if (conceptId === "weak_square" || conceptId === "outpost") return "weak_square";
  if (conceptId === "pawn_break") return "pawn_break";
  if (conceptId === "coordinate_pieces" || conceptId === "piece_activity") return "coordination";
  if (conceptId === "prophylaxis") return "prophylaxis";
  if (conceptId === "book_pattern") return "book_pattern";
  if (conceptId === "strong_alternative") return "strong_alternative";
  if (conceptId === "context_only") return "move_unavailable_context";
  return "line_needs_review_context";
}

export function scoreTeachingStoryCandidate(candidate: TeachingStoryCandidate, evidence: TeachingEvidence): TeachingStoryCandidate {
  const tacticalUrgency =
    candidate.kind === "immediate_tactic"
      ? 0.95
      : candidate.kind === "tactical_pressure"
        ? 0.78
        : evidence.safetyWarnings.length
          ? 0.7
          : 0.45;
  const materialImpact = candidate.conceptId === "win_loose_piece" ? 0.9 : candidate.conceptId === "attack_loose_piece" ? 0.62 : 0.35;
  const kingSafetyImpact = candidate.conceptId === "king_safety_first" ? 0.9 : evidence.safetyWarnings.length ? 0.68 : 0.4;
  const openingRelevance = evidence.phase === "opening" ? (candidate.kind === "development" || candidate.kind === "center_decision" || candidate.kind === "book_pattern" ? 0.86 : 0.5) : 0.5;
  const strategicDepth = candidate.kind === "improve_piece" || candidate.kind === "coordination" || candidate.kind === "weak_square" ? 0.75 : 0.58;
  const userClarity = candidate.title.length <= 30 && candidate.body.length <= 90 ? 0.9 : 0.72;
  const visualTeachability = clamp01(0.95 - 0.15 * Math.max(0, candidate.visualPlan.keySquares.length - 2) - 0.2 * Math.max(0, candidate.visualPlan.relationshipLines.length - 1));
  const confidence = clamp01(candidate.score.confidence);
  const novelty = clamp01(0.8 - Math.min(0.4, (evidence.userMemory?.patternSeenCount ?? 0) * 0.02));
  const riskPenalty = candidate.revealRisk === "high" ? 0.25 : candidate.revealRisk === "medium" ? 0.12 : candidate.revealRisk === "low" ? 0.05 : 0;
  const overclaimPenalty = candidate.claimSafety === "speculative" ? 0.2 : candidate.claimSafety === "cautious" ? 0.08 : 0;

  const total = clamp01(
    0.20 * tacticalUrgency +
      0.14 * materialImpact +
      0.14 * kingSafetyImpact +
      0.12 * openingRelevance +
      0.1 * strategicDepth +
      0.1 * userClarity +
      0.1 * visualTeachability +
      0.1 * confidence +
      0.06 * novelty -
      riskPenalty -
      overclaimPenalty,
  );

  return {
    ...candidate,
    score: {
      tacticalUrgency,
      materialImpact,
      kingSafetyImpact,
      openingRelevance,
      strategicDepth,
      userClarity,
      visualTeachability,
      confidence,
      novelty,
      riskPenalty,
      overclaimPenalty,
      total,
    },
  };
}

export function generateTeachingStoryCandidates(evidence: TeachingEvidence): TeachingStoryCandidate[] {
  const concepts = detectConcepts(evidence);
  const moveUci = evidence.expectedMoveUci;
  const moveSan = evidence.expectedMoveSan ?? "this move";

  return concepts.map((concept, idx) => {
    const rendered = renderTeachingTemplate(concept.conceptId, { moveSan, targetSquare: concept.relevantSquares[0] });
    return {
      id: `story-${concept.conceptId}-${idx}`,
      kind: inferKind(concept.conceptId),
      conceptId: concept.conceptId,
      title: rendered.title,
      body: rendered.snippet,
      side: evidence.sideToMove,
      relevantSquares: concept.relevantSquares,
      relevantPieces: concept.relevantPieces,
      candidateMoveUci: moveUci,
      isMoveRecommendation: concept.requiresMoveRecommendation,
      revealRisk: concept.requiresMoveRecommendation ? "high" : concept.claimSafety === "safe" ? "low" : "medium",
      claimSafety: concept.claimSafety,
      visualPlan: {
        primaryArrow: concept.suggestedVisuals.primary,
        relationshipLines: concept.suggestedVisuals.primary ? [{ from: concept.suggestedVisuals.primary.from, to: concept.suggestedVisuals.primary.to, kind: "pressure" }] : [],
        keySquares: concept.suggestedVisuals.keySquares.map((square) => ({ square, kind: "target" })),
        ghostSquares: [],
        dangerSquares: concept.suggestedVisuals.dangerSquares.map((square) => ({ square, kind: "danger" })),
      },
      evidenceRefs: [concept.reason],
      score: {
        tacticalUrgency: 0,
        materialImpact: 0,
        kingSafetyImpact: 0,
        openingRelevance: 0,
        strategicDepth: 0,
        userClarity: 0,
        visualTeachability: 0,
        confidence: concept.confidence,
        novelty: 0,
        riskPenalty: 0,
        overclaimPenalty: 0,
        total: 0,
      },
      rejectionReasons: [],
    };
  });
}

export function selectBestTeachingStory(
  candidates: TeachingStoryCandidate[],
  evidence: TeachingEvidence,
  permissionContext: { canRecommendMove: boolean; canShowAnswerOverlays: boolean },
): TeachingStorySelectionResult {
  const scored = candidates.map((candidate) => scoreTeachingStoryCandidate(candidate, evidence));

  const filtered = scored.map((candidate) => {
    const rejectionReasons = [...candidate.rejectionReasons];
    if (candidate.revealRisk === "high" && !permissionContext.canShowAnswerOverlays) rejectionReasons.push("reveal_risk_blocked");
    if (candidate.isMoveRecommendation && !permissionContext.canRecommendMove) rejectionReasons.push("requires_untrusted_move");
    if (candidate.score.confidence < 0.42 && candidate.conceptId !== "context_only") rejectionReasons.push("low_confidence");
    if (candidate.score.overclaimPenalty > 0.15) rejectionReasons.push("overclaim_risk");
    return { ...candidate, rejectionReasons };
  });

  const viable = filtered.filter((candidate) => candidate.rejectionReasons.length === 0);
  const ranked = (viable.length ? viable : filtered).sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;
    if (b.score.visualTeachability !== a.score.visualTeachability) return b.score.visualTeachability - a.score.visualTeachability;
    return b.score.userClarity - a.score.userClarity;
  });

  const selected = ranked[0] ?? null;
  const rejectedTop = filtered.filter((candidate) => candidate.id !== selected?.id).sort((a, b) => b.score.total - a.score.total).slice(0, 3);
  return {
    selected,
    rejectedTop,
    explanation: selected ? `Selected ${selected.kind} with score ${selected.score.total.toFixed(2)}.` : "No story selected.",
    scoreTable: filtered
      .sort((a, b) => b.score.total - a.score.total)
      .map((candidate) => ({
        id: candidate.id,
        kind: candidate.kind,
        conceptId: candidate.conceptId,
        total: candidate.score.total,
        reasons: candidate.rejectionReasons,
      })),
  };
}
