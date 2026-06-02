import type { MoveRecommendationTrust } from "../teaching/trainingContextTypes";
import type {
  VisualRecipePermissionDecision,
  VisualRecipePermissionInput,
  VisualRecipePermissions,
} from "./visualRecipeTypes";

const TRUSTED_TEACHING: MoveRecommendationTrust[] = [
  "engine_verified",
  "book_supported",
  "repertoire_supported",
  "engine_close",
];

function basePermissions(): VisualRecipePermissions {
  return {
    canShowAnswerMove: false,
    canShowContext: false,
    canShowPressure: false,
    canShowTargets: false,
    canShowGhosts: false,
    canShowTacticalAssist: false,
    canPersistEndState: false,
    revealRequired: false,
    allowedViewModes: ["assisted"],
  };
}

export function deriveVisualRecipePermissions(input: VisualRecipePermissionInput): VisualRecipePermissionDecision {
  const trust = input.trainingContext?.moveTrust;
  const mode = input.trainingContext?.mode;
  const contextTrust = input.trainingContext?.contextTrust;
  const nextSuppressed = Boolean(input.trainingContext?.nextPlay?.suppressionReason);

  if (input.viewMode === "plain") {
    return {
      mode: "noop",
      permissions: { ...basePermissions(), allowedViewModes: ["plain"] },
      suppressedReason: "plain_view",
      sourceMoveTrust: trust,
      sourceContextTrust: contextTrust,
    };
  }

  if (input.isStale || input.lifecycleGatePassed === false) {
    return {
      mode: "noop",
      permissions: basePermissions(),
      suppressedReason: "stale_or_lifecycle_gate",
      sourceMoveTrust: trust,
      sourceContextTrust: contextTrust,
    };
  }

  if (!input.trainingContext) {
    return {
      mode: "noop",
      permissions: basePermissions(),
      suppressedReason: "no_training_context",
      sourceMoveTrust: trust,
      sourceContextTrust: contextTrust,
    };
  }

  if (trust === "reveal_only_unverified") {
    if (input.revealState === "revealed") {
      return {
        mode: "primary_move_only",
        permissions: {
          ...basePermissions(),
          canShowAnswerMove: true,
          canShowTargets: true,
          canPersistEndState: true,
          revealRequired: true,
          // no context/pressure for primary-only indication
        },
        sourceMoveTrust: trust,
        sourceContextTrust: contextTrust,
      };
    }

    if (mode === "assisted_context" && contextTrust === "safe_context") {
      return {
        mode: "assisted_context",
        permissions: {
          ...basePermissions(),
          canShowContext: true,
          canShowTargets: true,
          revealRequired: true,
        },
        sourceMoveTrust: trust,
        sourceContextTrust: contextTrust,
      };
    }

    return {
      mode: "noop",
      permissions: { ...basePermissions(), revealRequired: true },
      suppressedReason: "reveal_required",
      sourceMoveTrust: trust,
      sourceContextTrust: contextTrust,
    };
  }

  if (trust && TRUSTED_TEACHING.includes(trust as MoveRecommendationTrust) && mode === "move_teaching" && !nextSuppressed) {
    return {
      mode: "primary_move_only",
      permissions: {
        ...basePermissions(),
        canShowAnswerMove: true,
        canShowTargets: true,
        canPersistEndState: true,
        // secondary/context/pressure disabled for clean primary-only MVP visuals
      },
      sourceMoveTrust: trust,
      sourceContextTrust: contextTrust,
    };
  }

  if (mode === "assisted_context" && contextTrust === "safe_context") {
    return {
      mode: "assisted_context",
      permissions: {
        ...basePermissions(),
        canShowContext: true,
        canShowPressure: true,
        canShowTargets: true,
      },
      sourceMoveTrust: trust,
      sourceContextTrust: contextTrust,
    };
  }

  if (trust === "untrusted") {
    if (mode === "assisted_context" && contextTrust === "safe_context") {
      return {
        mode: "assisted_context",
        permissions: {
          ...basePermissions(),
          canShowContext: true,
          canShowTargets: true,
        },
        sourceMoveTrust: trust,
        sourceContextTrust: contextTrust,
      };
    }

    return {
      mode: "noop",
      permissions: basePermissions(),
      suppressedReason: "untrusted_move",
      sourceMoveTrust: trust,
      sourceContextTrust: contextTrust,
    };
  }

  return {
    mode: "noop",
    permissions: basePermissions(),
    suppressedReason: "permission_denied",
    sourceMoveTrust: trust,
    sourceContextTrust: contextTrust,
  };
}
