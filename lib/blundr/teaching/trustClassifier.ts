import type { TeachingEvidence } from "./evidenceCollector";
import type { TeachingStoryCandidate } from "./storyTypes";

export type TeachingTrustTier =
  | "engine_verified"
  | "book_supported"
  | "repertoire_supported"
  | "strong_alternative"
  | "context_only"
  | "needs_review"
  | "unavailable";

export type PrimaryTeachingFocus =
  | "win_loose_piece"
  | "attack_loose_piece"
  | "king_safety"
  | "center_tension"
  | "development"
  | "improve_worst_piece"
  | "open_file"
  | "weak_square"
  | "pawn_break"
  | "coordination"
  | "prophylaxis"
  | "book_pattern"
  | "strong_alternative"
  | "safe_context";

export type TeachingTrustClassification = {
  tier: TeachingTrustTier;
  confidence: number;
  primaryFocus: PrimaryTeachingFocus;
  reason: string;
  limitations: string[];
  safeToRecommendMove: boolean;
  safeToShowAnswerVisuals: boolean;
  safeToShowContextVisuals: boolean;
};

function mapFocus(story?: TeachingStoryCandidate | null): PrimaryTeachingFocus {
  const cid = story?.conceptId;
  if (cid === "win_loose_piece") return "win_loose_piece";
  if (cid === "attack_loose_piece") return "attack_loose_piece";
  if (cid === "king_safety_first") return "king_safety";
  if (cid === "center_tension") return "center_tension";
  if (cid === "development_lag") return "development";
  if (cid === "improve_worst_piece") return "improve_worst_piece";
  if (cid === "open_file_context" || cid === "half_open_file") return "open_file";
  if (cid === "weak_square" || cid === "outpost") return "weak_square";
  if (cid === "pawn_break") return "pawn_break";
  if (cid === "coordinate_pieces" || cid === "piece_activity") return "coordination";
  if (cid === "prophylaxis") return "prophylaxis";
  if (cid === "book_pattern") return "book_pattern";
  if (cid === "strong_alternative") return "strong_alternative";
  return "safe_context";
}

export function classifyTeachingTrust(evidence: TeachingEvidence, selectedStory: TeachingStoryCandidate | null): TeachingTrustClassification {
  const primaryFocus = mapFocus(selectedStory);
  const limitations: string[] = [];
  const status = evidence.validationUserStatus;

  if (status === "verified") {
    return {
      tier: "engine_verified",
      confidence: Math.max(0.8, selectedStory?.score.confidence ?? 0.82),
      primaryFocus,
      reason: "Move quality gate verified the teaching move.",
      limitations,
      safeToRecommendMove: true,
      safeToShowAnswerVisuals: true,
      safeToShowContextVisuals: true,
    };
  }

  if (status === "needs_review") {
    limitations.push("Saved line move is not trusted for recommendation.");
    return {
      tier: "needs_review",
      confidence: 0.55,
      primaryFocus,
      reason: "Saved move is rejected and cannot be endorsed.",
      limitations,
      safeToRecommendMove: false,
      safeToShowAnswerVisuals: false,
      safeToShowContextVisuals: true,
    };
  }

  if (status === "not_verified") {
    if (evidence.bookSupport.hasBookSupport && evidence.bookSupport.confidence >= 0.7 && evidence.safetyWarnings.length === 0) {
      return {
        tier: "book_supported",
        confidence: evidence.bookSupport.confidence,
        primaryFocus: "book_pattern",
        reason: evidence.bookSupport.reason,
        limitations: evidence.bookSupport.limitations,
        safeToRecommendMove: true,
        safeToShowAnswerVisuals: true,
        safeToShowContextVisuals: true,
      };
    }

    if (evidence.moveClassification.isAlternativeCandidate) {
      return {
        tier: "strong_alternative",
        confidence: selectedStory?.score.confidence ?? 0.62,
        primaryFocus: "strong_alternative",
        reason: "User move appears playable but teaches a different idea.",
        limitations: ["Not validated as the main training move."],
        safeToRecommendMove: false,
        safeToShowAnswerVisuals: false,
        safeToShowContextVisuals: true,
      };
    }

    if (selectedStory) {
      return {
        tier: "context_only",
        confidence: Math.min(0.75, selectedStory.score.confidence),
        primaryFocus,
        reason: "Move recommendation is blocked; safe context remains teachable.",
        limitations: ["No trusted move recommendation."],
        safeToRecommendMove: false,
        safeToShowAnswerVisuals: false,
        safeToShowContextVisuals: true,
      };
    }

    return {
      tier: "unavailable",
      confidence: 0.35,
      primaryFocus: "safe_context",
      reason: "Insufficient trustworthy evidence for teaching.",
      limitations: ["Context teaching could not be safely selected."],
      safeToRecommendMove: false,
      safeToShowAnswerVisuals: false,
      safeToShowContextVisuals: false,
    };
  }

  return {
    tier: "context_only",
    confidence: selectedStory?.score.confidence ?? 0.5,
    primaryFocus,
    reason: "Waiting for stronger trust signal.",
    limitations: ["Recommendation withheld pending trust."],
    safeToRecommendMove: false,
    safeToShowAnswerVisuals: false,
    safeToShowContextVisuals: Boolean(selectedStory),
  };
}
