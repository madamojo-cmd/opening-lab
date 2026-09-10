import type { CurrentBlundrUser } from "../accounts/accountTypes";

type PreviewOnboardingSelfResetDecision =
  | {
      allowed: true;
      targetUserId: string;
      reason: "preview_onboarding_self_reset_allowed";
    }
  | { allowed: false; reason: string };

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function resolvePreviewOnboardingSelfResetDecision(input: {
  body: Record<string, unknown>;
  user: Pick<CurrentBlundrUser, "userId" | "isAuthenticated" | "mode"> | null;
  vercelEnv?: string | null;
  hasBearerSession: boolean;
}): PreviewOnboardingSelfResetDecision {
  if (normalizeText(input.vercelEnv) !== "preview") {
    return { allowed: false, reason: "preview_environment_required" };
  }
  if (normalizeText(input.body.scope) !== "onboarding") {
    return { allowed: false, reason: "onboarding_scope_required" };
  }
  if (!input.hasBearerSession) {
    return { allowed: false, reason: "authenticated_bearer_session_required" };
  }
  if (!input.user?.isAuthenticated || !normalizeText(input.user.userId)) {
    return { allowed: false, reason: "authenticated_user_required" };
  }
  if (input.user.mode === "local_demo") {
    return { allowed: false, reason: "local_demo_reset_not_allowed" };
  }
  const targetUserId = normalizeText(input.body.userId);
  if (targetUserId && targetUserId !== input.user.userId) {
    return { allowed: false, reason: "cross_user_reset_denied" };
  }
  return {
    allowed: true,
    targetUserId: input.user.userId,
    reason: "preview_onboarding_self_reset_allowed",
  };
}
