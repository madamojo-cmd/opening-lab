import { Chess } from "chess.js";
import { analyzeBoard } from "./boardAnalyzer";
import { renderTeachingTemplate } from "./conceptTemplates";
import { detectAllConcepts } from "./conceptDetectors";
import { analyzeMoveDelta } from "./moveDeltaAnalyzer";
import type { ConceptCandidate, ConceptScore, TeachingCue, TeachingCueInput } from "./teachingCueTypes";
import { TEACHING_CUE_COMPILER_VERSION } from "./teachingCueTypes";
import { isValidSquare, normalizeSquare } from "./squareUtils";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function createCueId(input: TeachingCueInput): string {
  return `cue-${Date.now().toString(36)}-${input.move.uci}-${input.validation.userStatus}`;
}

function safeStatusCue(input: TeachingCueInput, title: string, snippet: string): TeachingCue {
  return {
    id: createCueId(input),
    conceptId: "default_pattern",
    userFacing: {
      title,
      snippet,
      next: undefined,
    },
    visual: {
      primaryArrow: undefined,
      relationshipLines: [],
      keySquares: [],
      ghostSquares: [],
      dangerSquares: [],
    },
    debug: {
      confidence: 0,
      selectedReason: "validation gate blocked teaching cue",
      candidateCount: 0,
      suppressedReasons: [],
      deltaSummary: [],
      detectorScores: [],
    },
    metadata: {
      fenBefore: input.fenBefore,
      fenAfter: input.fenAfter,
      moveSan: input.move.san,
      moveUci: input.move.uci,
      createdAt: new Date().toISOString(),
      compilerVersion: TEACHING_CUE_COMPILER_VERSION,
    },
  };
}

function scoreCandidate(candidate: ConceptCandidate, input: TeachingCueInput): ConceptScore {
  const repetitionPenalty = Math.min(0.2, Math.max(0, (input.userMemory?.patternSeenCount ?? 0) * 0.01));
  const uncertaintyPenalty = candidate.confidence < 0.5 ? 0.1 : 0;
  const clutterPenalty =
    (candidate.visual.relationshipLines.length > 1 ? 0.12 : 0) +
    (candidate.visual.keySquares.length > 3 ? 0.1 : 0) +
    (candidate.visual.dangerSquares.length > 1 ? 0.08 : 0) +
    (candidate.visual.ghostSquares.length > 1 ? 0.06 : 0);

  const penalties = candidate.penalties + repetitionPenalty + uncertaintyPenalty + clutterPenalty;
  const finalScore = clamp01(
    0.22 * candidate.confidence +
      0.18 * candidate.deltaStrength +
      0.16 * candidate.visualClarity +
      0.16 * candidate.pedagogicalValue +
      0.12 * candidate.simplicity +
      0.08 * candidate.userNeed +
      0.05 * candidate.phaseFit +
      0.03 * candidate.tacticalUrgency -
      penalties,
  );

  return {
    conceptId: candidate.conceptId,
    finalScore,
    confidence: clamp01(candidate.confidence),
    deltaStrength: clamp01(candidate.deltaStrength),
    visualClarity: clamp01(candidate.visualClarity),
    pedagogicalValue: clamp01(candidate.pedagogicalValue),
    simplicity: clamp01(candidate.simplicity),
    userNeed: clamp01(candidate.userNeed),
    phaseFit: clamp01(candidate.phaseFit),
    tacticalUrgency: clamp01(candidate.tacticalUrgency),
    penalties,
    evidence: candidate.evidence,
  };
}

function applyVisualAttentionBudget(candidate: ConceptCandidate): { simplified: ConceptCandidate; suppressedReason?: string } {
  const simplified: ConceptCandidate = {
    ...candidate,
    visual: {
      primaryArrow: candidate.visual.primaryArrow,
      relationshipLines: candidate.visual.relationshipLines.slice(0, 1),
      keySquares: candidate.visual.keySquares.slice(0, 3),
      ghostSquares: candidate.visual.ghostSquares.slice(0, 1),
      dangerSquares: candidate.visual.dangerSquares.slice(0, 1),
    },
  };

  const tooCluttered =
    candidate.visual.relationshipLines.length > 3 ||
    candidate.visual.keySquares.length > 5 ||
    candidate.visual.ghostSquares.length > 3 ||
    candidate.visual.dangerSquares.length > 3;

  if (tooCluttered) return { simplified, suppressedReason: "visual_clutter" };
  return { simplified };
}

function chooseBest(scored: Array<{ candidate: ConceptCandidate; score: ConceptScore }>): { candidate: ConceptCandidate; score: ConceptScore } | null {
  if (!scored.length) return null;
  const sorted = [...scored].sort((a, b) => {
    if (b.score.finalScore !== a.score.finalScore) return b.score.finalScore - a.score.finalScore;
    if (b.score.visualClarity !== a.score.visualClarity) return b.score.visualClarity - a.score.visualClarity;
    if (b.score.pedagogicalValue !== a.score.pedagogicalValue) return b.score.pedagogicalValue - a.score.pedagogicalValue;
    return b.score.simplicity - a.score.simplicity;
  });
  return sorted[0];
}

function summaryFromDelta(delta: ReturnType<typeof analyzeMoveDelta>): string[] {
  const out = [`Moved ${delta.movedPiece ?? "piece"} ${delta.from}-${delta.to}`];
  if (delta.isCapture) out.push("Capture move");
  if (delta.isCheck) out.push("Check generated");
  if (delta.isCastle) out.push("Castling");
  if (delta.centerControlDelta !== 0) out.push(`Center control delta: ${delta.centerControlDelta}`);
  if (delta.kingZonePressureDelta !== 0) out.push(`King-zone pressure delta: ${delta.kingZonePressureDelta}`);
  if (delta.newlyAttackedPieces.length) out.push(`New attacks: ${delta.newlyAttackedPieces.join(", ")}`);
  return out;
}

export function compileTeachingCue(input: TeachingCueInput): TeachingCue {
  if (input.validation.required && input.validation.userStatus !== "verified") {
    if (input.validation.userStatus === "checking") {
      return safeStatusCue(input, "Checking position", "Blundr Brain is checking this move before showing a teaching cue.");
    }
    if (input.validation.userStatus === "needs_review") {
      return safeStatusCue(input, "Line needs review", "Blundr Brain did not validate this saved line, so no teaching cue will be shown.");
    }
    if (input.validation.userStatus === "not_verified") {
      return safeStatusCue(input, "Move not verified", "Blundr Brain could not validate this move, so it will not invent a teaching plan.");
    }
    return safeStatusCue(input, "Follow the pattern", "This move matches the validated training line.");
  }

  if (!input.fenBefore || !isValidSquare(input.move.from) || !isValidSquare(input.move.to)) {
    return safeStatusCue(input, "Follow the pattern", "This move matches the validated training line.");
  }

  let fenAfter = input.fenAfter;
  if (!fenAfter) {
    try {
      const game = new Chess(input.fenBefore);
      const moved = game.move({
        from: normalizeSquare(input.move.from),
        to: normalizeSquare(input.move.to),
        promotion: input.move.promotion || "q",
      });
      if (!moved) {
        return safeStatusCue(input, "Follow the pattern", "This move matches the validated training line.");
      }
      fenAfter = game.fen();
    } catch {
      return safeStatusCue(input, "Follow the pattern", "This move matches the validated training line.");
    }
  }

  try {
    const before = analyzeBoard(input.fenBefore);
    const after = analyzeBoard(fenAfter);
    const delta = analyzeMoveDelta({ before, after, move: input.move, side: input.sideToMove });

    const candidates = detectAllConcepts({ before, after, delta, input });
    const scored = candidates
      .map((candidate) => {
        const simplified = applyVisualAttentionBudget(candidate);
        const score = scoreCandidate(simplified.simplified, input);
        return {
          candidate: simplified.simplified,
          score,
          suppressedReason: simplified.suppressedReason,
        };
      })
      .filter((entry) => {
        if (entry.suppressedReason) return false;
        if (entry.candidate.conceptId === "default_pattern") return true;
        return entry.score.confidence >= 0.45;
      });

    const best = chooseBest(scored.map(({ candidate, score }) => ({ candidate, score })));
    const selected = best?.candidate ?? candidates[candidates.length - 1];
    const selectedScore = best?.score ?? scoreCandidate(selected, input);
    const rendered = renderTeachingTemplate(selected.conceptId, {
      ...selected.templateContext,
      moveSan: input.move.san,
    });

    return {
      id: createCueId(input),
      conceptId: selected.conceptId,
      userFacing: {
        badge: input.validation.userStatus === "verified" ? "Blundr Brain Validated" : undefined,
        title: rendered.title,
        snippet: rendered.snippet,
        next: input.trainerView === "assisted" ? `Play ${input.move.san}.` : rendered.next,
      },
      visual: {
        primaryArrow: selected.visual.primaryArrow,
        relationshipLines: selected.visual.relationshipLines.slice(0, 1),
        keySquares: selected.visual.keySquares.slice(0, 3),
        ghostSquares: selected.visual.ghostSquares.slice(0, 1),
        dangerSquares: selected.visual.dangerSquares.slice(0, 1),
      },
      debug: {
        confidence: selectedScore.confidence,
        selectedReason: selected.evidence[0] ?? "highest score",
        candidateCount: candidates.length,
        suppressedReasons: scored.filter((s) => s.suppressedReason).map((s) => s.suppressedReason as string),
        deltaSummary: summaryFromDelta(delta),
        detectorScores: scored.map((entry) => entry.score),
      },
      metadata: {
        fenBefore: input.fenBefore,
        fenAfter,
        moveSan: input.move.san,
        moveUci: input.move.uci,
        createdAt: new Date().toISOString(),
        compilerVersion: TEACHING_CUE_COMPILER_VERSION,
      },
    };
  } catch {
    return safeStatusCue(input, "Follow the pattern", "This move matches the validated training line.");
  }
}
