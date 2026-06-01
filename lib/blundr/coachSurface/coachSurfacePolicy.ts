export type CoachSurfaceOwner =
  | "evidence_coach"
  | "legacy_training_fallback"
  | "none";

export interface CoachSurfacePolicyInput {
  coachShouldShow: boolean;
  coachSuppressedReason?: string;
  coachHiddenForFrame: boolean;
  trainingMode: "restricted" | "continuation";
  viewMode: "assisted" | "plain" | "freeplay";
  hasExpectedMove: boolean;
  exactMoveAllowed: boolean;
  moveQualityGateStatus?: string;
  engineValidationStatus?: "ready" | "pending" | "unavailable" | "idle";
  visualRecipeValid: boolean;
}

export interface CoachSurfacePolicyResult {
  owner: CoachSurfaceOwner;
  allowLegacyTrainingCard: boolean;
  allowLegacyAnswerCard: boolean;
  allowMoveImpactCard: boolean;
  allowNextMoveText: boolean;
  reason: string;
}

function hasValidation(input: CoachSurfacePolicyInput): boolean {
  const moveStatus = String(input.moveQualityGateStatus ?? "").toLowerCase();
  const gateValidated = ["verified_top1", "verified_top2", "book_supported", "engine_close", "repertoire_supported"].includes(moveStatus);
  const engineReady = input.engineValidationStatus === "ready";
  return gateValidated || engineReady || input.exactMoveAllowed;
}

export function decideCoachSurfacePolicy(input: CoachSurfacePolicyInput): CoachSurfacePolicyResult {
  const validated = hasValidation(input);

  if (input.coachHiddenForFrame) {
    return {
      owner: "none",
      allowLegacyTrainingCard: false,
      allowLegacyAnswerCard: false,
      allowMoveImpactCard: false,
      allowNextMoveText: false,
      reason: "coach_hidden_for_frame",
    };
  }

  if (input.coachShouldShow) {
    return {
      owner: "evidence_coach",
      allowLegacyTrainingCard: false,
      allowLegacyAnswerCard: false,
      allowMoveImpactCard: false,
      allowNextMoveText: input.exactMoveAllowed,
      reason: "coach_owns_surface",
    };
  }

  if (input.trainingMode === "continuation") {
    const allowNext = input.exactMoveAllowed && validated;
    return {
      owner: "none",
      allowLegacyTrainingCard: false,
      allowLegacyAnswerCard: false,
      allowMoveImpactCard: validated && input.exactMoveAllowed,
      allowNextMoveText: allowNext,
      reason: allowNext ? "continuation_exact_move_validated" : "continuation_no_validated_exact_move",
    };
  }

  const allowLegacy = input.trainingMode === "restricted" && !input.coachShouldShow && input.visualRecipeValid;
  const allowImpact = allowLegacy && validated;
  const allowNext = allowLegacy && (input.exactMoveAllowed || (input.viewMode === "assisted" && validated && input.hasExpectedMove));

  return {
    owner: allowLegacy ? "legacy_training_fallback" : "none",
    allowLegacyTrainingCard: allowLegacy,
    allowLegacyAnswerCard: allowLegacy && input.exactMoveAllowed,
    allowMoveImpactCard: allowImpact,
    allowNextMoveText: allowNext,
    reason: allowLegacy ? "restricted_legacy_fallback" : "no_authorized_surface",
  };
}
