import type { CoachEvidenceClaim, EvidenceGraph } from "../brain/types";
import type { ActivatedTeachingConcept, ActivationMode, ConceptEloBand, TeachingConcept } from "./TeachingConcept";
import { conceptCanUseClaim, conceptPlainTemplateLeaksTarget, conceptRequiresStrongEvidence, explainConceptSuppression } from "./conceptSafety";
import { teachingConceptRegistry } from "./teachingConceptRegistry";

const RISK_SCORE: Record<TeachingConcept["safety"]["overclaimRisk"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const MODE_FAMILY_PRIORITY: Record<ActivationMode, TeachingConcept["family"][]> = {
  plain: ["safety_fallback", "opening_principle", "development", "center", "king_safety", "defense", "continuation"],
  assisted: ["development", "center", "king_safety", "piece_activity", "opening_specific", "continuation"],
  show_more: ["tactics", "piece_activity", "opening_specific", "initiative", "defense", "center", "king_safety"],
};

const NULL_TARGET_ALLOWED = new Set([
  "continue_from_here_available",
  "no_candidate_before_continue",
  "branch_complete_no_target",
  "opponent_reply_no_user_target",
  "plain_mode_recall",
  "safety_fallback_explain_legal_move",
]);

function normalizePieceType(pieceType: string | null | undefined): string {
  const v = String(pieceType ?? "").toLowerCase();
  if (v === "n") return "knight";
  if (v === "b") return "bishop";
  if (v === "r") return "rook";
  if (v === "q") return "queen";
  if (v === "k") return "king";
  if (v === "p") return "pawn";
  return v;
}

function claimStrengthScore(strength: CoachEvidenceClaim["strength"]): number {
  if (strength === "verified") return 3;
  if (strength === "template_safe") return 2;
  if (strength === "probable") return 2;
  return 0;
}

function strongestActivationStrength(claims: CoachEvidenceClaim[]): ActivatedTeachingConcept["strength"] {
  if (claims.some((claim) => claim.strength === "verified" || claim.strength === "template_safe")) return "verified";
  if (claims.some((claim) => claim.strength === "probable")) return "probable";
  return "blocked";
}

function modeEligible(concept: TeachingConcept, mode: ActivationMode): boolean {
  if (mode === "plain") return concept.safety.allowInPlainBeforeShowMore;
  return true;
}

function hasEngineEvidence(graph: EvidenceGraph): boolean {
  return graph.claims.some((claim) =>
    claim.provenance.some((prov) => prov.source === "stockfish" || prov.source === "maia"),
  );
}

function matchesMoveFlags(concept: TeachingConcept, graph: EvidenceGraph): boolean {
  const requiredFlags = concept.requiredEvidence.requiredMoveFlags ?? [];
  if (requiredFlags.length === 0) return true;
  const target = graph.boardTruth;
  const flags: Record<string, boolean> = {
    isCapture: target.isCapture,
    isCheck: target.isCheck,
    isCheckmate: target.isCheckmate,
    isCastle: target.isCastle,
    isPromotion: target.isPromotion,
    isEnPassant: target.isEnPassant,
  };
  return requiredFlags.every((flag) => flags[flag] === true);
}

function openingThemeScore(concept: TeachingConcept, graph: EvidenceGraph): number {
  const themes = (concept.optionalEvidence?.themeTags ?? []).map((tag) => tag.toLowerCase());
  if (!themes.length) return 0;
  const openingValues = [graph.openingContext.openingKey, graph.openingContext.openingName, ...graph.openingContext.themeTags]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  return themes.some((tag) => openingValues.some((value) => value.includes(tag))) ? 2 : -2;
}

function familyPriorityScore(concept: TeachingConcept, mode: ActivationMode): number {
  const index = MODE_FAMILY_PRIORITY[mode].indexOf(concept.family);
  return index === -1 ? -5 : MODE_FAMILY_PRIORITY[mode].length - index;
}

function targetSpecificSuppressionReason(frameKey: string): string {
  if (frameKey.includes("branch_complete")) return "branch complete state has no target";
  if (frameKey.includes("opponent_replying")) return "opponent reply state has no user target";
  return "target is null";
}

export function activateTeachingConcepts(input: {
  graph: EvidenceGraph;
  eloBand?: ConceptEloBand;
  mode?: ActivationMode;
  maxConcepts?: number;
}): {
  activated: ActivatedTeachingConcept[];
  suppressed: {
    conceptId: string;
    reason: string;
  }[];
  debug: {
    graphTargetUci: string | null;
    claimCount: number;
    candidateConceptCount: number;
    activatedCount: number;
  };
} {
  const graph = input.graph;
  const mode: ActivationMode = input.mode ?? "assisted";
  const maxConcepts = Math.max(1, input.maxConcepts ?? 8);
  const eligibleByBand = teachingConceptRegistry.filter((concept) => !input.eloBand || concept.eloBands.includes(input.eloBand));
  const suppressed: Array<{ conceptId: string; reason: string }> = [];
  const activatedWithScore: Array<{ concept: ActivatedTeachingConcept; score: number }> = [];
  const hasEngine = hasEngineEvidence(graph);

  for (const concept of eligibleByBand) {
    if (!graph.targetUci && !NULL_TARGET_ALLOWED.has(concept.id)) {
      suppressed.push({
        conceptId: concept.id,
        reason: explainConceptSuppression({ concept, reason: targetSpecificSuppressionReason(graph.frameKey) }),
      });
      continue;
    }

    if (graph.targetUci && graph.boardTruth.sourcePiece?.type) {
      const targetPiece = normalizePieceType(graph.boardTruth.sourcePiece.type);
      const reqPieceTypes = (concept.requiredEvidence.requiredPieceTypes ?? []).map(normalizePieceType);
      if (reqPieceTypes.length > 0 && !reqPieceTypes.includes(targetPiece)) {
        suppressed.push({
          conceptId: concept.id,
          reason: explainConceptSuppression({ concept, reason: `piece mismatch (${targetPiece})` }),
        });
        continue;
      }
    }

    if (concept.safety.requiresEngineEvidence && !hasEngine) {
      suppressed.push({
        conceptId: concept.id,
        reason: explainConceptSuppression({ concept, reason: "engine evidence required but unavailable" }),
      });
      continue;
    }

    const openingScore = openingThemeScore(concept, graph);
    if (concept.family === "opening_specific" && openingScore < 0) {
      suppressed.push({
        conceptId: concept.id,
        reason: explainConceptSuppression({ concept, reason: "opening theme mismatch" }),
      });
      continue;
    }

    if (!matchesMoveFlags(concept, graph)) {
      suppressed.push({
        conceptId: concept.id,
        reason: explainConceptSuppression({ concept, reason: "required move flags missing" }),
      });
      continue;
    }

    if (mode === "plain") {
      const leak = conceptPlainTemplateLeaksTarget({
        concept,
        targetSan: graph.boardTruth.targetSan,
        targetUci: graph.targetUci,
        pieceType: graph.boardTruth.sourcePiece?.type ?? null,
      });
      if (leak || !concept.safety.allowInPlainBeforeShowMore) {
        suppressed.push({
          conceptId: concept.id,
          reason: explainConceptSuppression({ concept, reason: "plain mode leak-risk or policy restriction" }),
        });
        continue;
      }
    }

    const matchedClaims = graph.claims.filter((claim) => conceptCanUseClaim(concept, claim));

    if (!matchedClaims.length) {
      if (!graph.targetUci && NULL_TARGET_ALLOWED.has(concept.id)) {
        const synthetic: ActivatedTeachingConcept = {
          conceptId: concept.id,
          concept,
          evidenceClaimIds: [],
          strength: "probable",
          activationReason: "null-target safe continuation concept",
          suppressedReasons: [],
          displayEligibility: {
            plainHint: concept.safety.allowInPlainBeforeShowMore,
            assisted: true,
            showMore: true,
            visual: false,
          },
        };
        const score = 10 + familyPriorityScore(concept, mode) - RISK_SCORE[concept.safety.overclaimRisk];
        activatedWithScore.push({ concept: synthetic, score });
        continue;
      }

      suppressed.push({
        conceptId: concept.id,
        reason: explainConceptSuppression({ concept, reason: "required evidence claims missing" }),
      });
      continue;
    }

    const strength = strongestActivationStrength(matchedClaims);
    if (strength === "blocked") {
      suppressed.push({
        conceptId: concept.id,
        reason: explainConceptSuppression({ concept, reason: "claims are blocked or below required strength" }),
      });
      continue;
    }

    if (conceptRequiresStrongEvidence(concept) && strength !== "verified") {
      suppressed.push({
        conceptId: concept.id,
        reason: explainConceptSuppression({ concept, reason: "strong concept requires verified evidence" }),
      });
      continue;
    }

    const activation: ActivatedTeachingConcept = {
      conceptId: concept.id,
      concept,
      evidenceClaimIds: matchedClaims.map((claim) => claim.id),
      strength,
      activationReason: `matched ${matchedClaims.length} evidence claims`,
      suppressedReasons: [],
      displayEligibility: {
        plainHint: concept.safety.allowInPlainBeforeShowMore,
        assisted: modeEligible(concept, "assisted"),
        showMore: modeEligible(concept, "show_more"),
        visual: graph.visualEvidence.length > 0,
      },
    };

    const evidenceScore = Math.max(...matchedClaims.map((claim) => claimStrengthScore(claim.strength)));
    const score =
      (strength === "verified" ? 100 : 70)
      + evidenceScore * 5
      + familyPriorityScore(concept, mode) * 3
      + openingScore * 4
      + (modeEligible(concept, mode) ? 2 : -10)
      - RISK_SCORE[concept.safety.overclaimRisk] * 2;

    activatedWithScore.push({ concept: activation, score });
  }

  const activated = activatedWithScore
    .sort((a, b) => b.score - a.score || a.concept.conceptId.localeCompare(b.concept.conceptId))
    .slice(0, maxConcepts)
    .map((entry) => entry.concept);

  return {
    activated,
    suppressed,
    debug: {
      graphTargetUci: graph.targetUci,
      claimCount: graph.claims.length,
      candidateConceptCount: eligibleByBand.length,
      activatedCount: activated.length,
    },
  };
}
