"use client";

import { getOnboardingAuthSession } from "@/lib/blundr/onboarding/onboardingAuth";

export type AuthenticatedApiErrorCode =
  | "authentication_required"
  | "feature_disabled"
  | "activity_unsupported"
  | "verified_content_unavailable"
  | "daily_opening_selection_required"
  | "persistence_unavailable"
  | "session_expired"
  | "retryable_provider_error"
  | "permanent_provider_error"
  | "api_error";

export class AuthenticatedApiError extends Error {
  readonly code: AuthenticatedApiErrorCode;
  readonly status: number;

  constructor(
    code: AuthenticatedApiErrorCode,
    status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthenticatedApiError";
    this.code = code;
    this.status = status;
  }
}

function mapErrorCode(
  status: number,
  code: unknown,
): AuthenticatedApiErrorCode {
  if (status === 401) return "authentication_required";
  if (typeof code === "string") {
    if (code === "feature_disabled") return code;
    if (code === "activity_unsupported") return code;
    if (code === "verified_content_unavailable") return code;
    if (code === "daily_opening_selection_required") return code;
    if (code.includes("persistence")) return "persistence_unavailable";
    if (code === "account_not_found" || code === "invalid_provider")
      return "permanent_provider_error";
    if (code.includes("retry") || code.includes("network"))
      return "retryable_provider_error";
    if (code === "session_expired") return code;
  }
  if (status === 408 || status === 429 || status >= 500)
    return "retryable_provider_error";
  return "api_error";
}

export async function authenticatedApiFetch<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const session = await getOnboardingAuthSession();
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body && !headers.has("content-type"))
    headers.set("content-type", "application/json");
  if (session?.accessToken)
    headers.set("authorization", `Bearer ${session.accessToken}`);
  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "same-origin",
  });
  const payload = (await response.json().catch(() => null)) as {
    error?: unknown;
    message?: unknown;
  } | null;
  if (!response.ok) {
    const code = mapErrorCode(response.status, payload?.error);
    throw new AuthenticatedApiError(
      code,
      response.status,
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : "The request could not be completed.",
    );
  }
  return payload as T;
}
