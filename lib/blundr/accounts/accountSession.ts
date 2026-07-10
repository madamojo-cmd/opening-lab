// server-only: do not import into client components.

import { createBlundrSupabaseServerClient } from "../backend/supabaseServerClient";
import { hasSupabaseCredentials, isBlundrAllowlistedUser, readBlundrBackendEnv, type BlundrBackendEnv, type BlundrStorageModeSetting } from "../backend/backendEnv";
import { resolveBlundrAccountMode } from "../backend/backendMode";
import { createLocalDemoUser } from "./accountDefaults";
import { getLocalAccountCurrentUserId, setLocalAccountCurrentUserId } from "./localAccountStorage";
import { getOnboardingAuthSession } from "../onboarding/onboardingAuth";
import type { CurrentBlundrUser } from "./accountTypes";

export type CurrentBlundrUserResolutionReasonCode =
  | "resolved"
  | "local_demo"
  | "missing_bearer_token"
  | "missing_supabase_config"
  | "token_validation_failed"
  | "missing_user";

export type BlundrAccountAuthValidationMethod = "supabase-js" | "auth-api";

export type BlundrAccountAuthDiagnostics = {
  hasAuthorizationHeader: boolean;
  bearerTokenPresent: boolean;
  supabaseUrlPresent: boolean;
  supabaseAnonKeyPresent: boolean;
  validationMethod: BlundrAccountAuthValidationMethod | null;
  validationStatus: CurrentBlundrUserResolutionReasonCode;
  authErrorMessage: string | null;
};

export type CurrentBlundrUserResolutionResult = {
  user: CurrentBlundrUser | null;
  reasonCode: CurrentBlundrUserResolutionReasonCode;
  reason: string;
  diagnostics: BlundrAccountAuthDiagnostics;
};

export type BlundrWriteUserResolution =
  | {
      ok: true;
      userId: string;
      storageMode: BlundrStorageModeSetting;
    }
  | {
      ok: false;
      code: "auth_required";
      message: string;
      storageMode: BlundrStorageModeSetting;
    };

export function isBlundrWriteUserResolutionFailure(result: BlundrWriteUserResolution): result is Extract<BlundrWriteUserResolution, { ok: false }> {
  return result.ok === false;
}

export type CurrentBlundrUserResolutionInput = {
  request?: Request | null;
  userOverride?: Partial<CurrentBlundrUser> | null;
  allowLocalFallback?: boolean;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function parseBearerToken(request?: Request | null): string | null {
  const header = normalizeText(request?.headers.get("authorization"));
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

export function getCurrentBlundrUserIdFallback(): string {
  return setLocalAccountCurrentUserId(getLocalAccountCurrentUserId());
}

function buildDiagnostics(input: {
  hasAuthorizationHeader: boolean;
  bearerTokenPresent: boolean;
  supabaseUrlPresent: boolean;
  supabaseAnonKeyPresent: boolean;
  validationMethod: BlundrAccountAuthValidationMethod | null;
  validationStatus: CurrentBlundrUserResolutionReasonCode;
  authErrorMessage?: string | null;
}): BlundrAccountAuthDiagnostics {
  return {
    hasAuthorizationHeader: Boolean(input.hasAuthorizationHeader),
    bearerTokenPresent: Boolean(input.bearerTokenPresent),
    supabaseUrlPresent: Boolean(input.supabaseUrlPresent),
    supabaseAnonKeyPresent: Boolean(input.supabaseAnonKeyPresent),
    validationMethod: input.validationMethod,
    validationStatus: input.validationStatus,
    authErrorMessage: normalizeText(input.authErrorMessage) || null,
  };
}

function buildResolvedUser(user: CurrentBlundrUser, diagnostics: BlundrAccountAuthDiagnostics): CurrentBlundrUserResolutionResult {
  return {
    user,
    reasonCode: "resolved",
    reason: "Signed-in browser auth token resolved to a user.",
    diagnostics,
  };
}

function buildFailureResult(reasonCode: Exclude<CurrentBlundrUserResolutionReasonCode, "resolved" | "local_demo">, reason: string, diagnostics: BlundrAccountAuthDiagnostics): CurrentBlundrUserResolutionResult {
  return {
    user: null,
    reasonCode,
    reason,
    diagnostics,
  };
}

function mapSupabaseUserToCurrentUser(user: { id: string; email?: string | null; app_metadata?: { provider?: string | null } | null }, accessToken: string, env: BlundrBackendEnv): CurrentBlundrUser {
  const isAdmin = isBlundrAllowlistedUser({ userId: user.id, email: user.email ?? null }, env);
  return {
    userId: user.id,
    email: user.email ?? null,
    mode: isAdmin && env.devToolsEnabled ? "developer_admin" : "authenticated",
    isAuthenticated: true,
    isAdmin,
    accessToken,
    provider: normalizeText(user.app_metadata?.provider) || null,
  };
}

export type ValidateSupabaseBearerTokenDeps = {
  fetchImpl?: typeof fetch;
  createServerClient?: typeof createBlundrSupabaseServerClient;
};

function normalizeAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return normalizeText(error) || "The browser auth token could not be validated.";
}

export async function validateSupabaseBearerToken(
  accessToken: string,
  input: {
    env?: BlundrBackendEnv;
    hasAuthorizationHeader?: boolean;
    deps?: ValidateSupabaseBearerTokenDeps;
  } = {},
): Promise<CurrentBlundrUserResolutionResult> {
  const env = input.env ?? readBlundrBackendEnv();
  const diagnosticsBase = {
    hasAuthorizationHeader: Boolean(input.hasAuthorizationHeader ?? true),
    bearerTokenPresent: true,
    supabaseUrlPresent: Boolean(env.supabaseUrl),
    supabaseAnonKeyPresent: Boolean(env.supabaseAnonKey),
  };

  if (!hasSupabaseCredentials(env)) {
    return buildFailureResult(
      "missing_supabase_config",
      "Supabase auth is not configured.",
      buildDiagnostics({
        ...diagnosticsBase,
        validationMethod: null,
        validationStatus: "missing_supabase_config",
        authErrorMessage: null,
      }),
    );
  }

  const createServerClient = input.deps?.createServerClient ?? createBlundrSupabaseServerClient;
  const fetchImpl = input.deps?.fetchImpl ?? fetch;
  let authErrorMessage: string | null = null;

  try {
    const client = createServerClient({ accessToken });
    if (client) {
      try {
        const { data, error } = await client.auth.getUser(accessToken);
        if (data?.user) {
          return buildResolvedUser(
            mapSupabaseUserToCurrentUser(data.user, accessToken, env),
            buildDiagnostics({
              ...diagnosticsBase,
              validationMethod: "supabase-js",
              validationStatus: "resolved",
              authErrorMessage: null,
            }),
          );
        }
        authErrorMessage = normalizeText(error?.message) || null;
      } catch (cause) {
        authErrorMessage = normalizeAuthErrorMessage(cause);
      }
    }
  } catch (cause) {
    authErrorMessage = normalizeAuthErrorMessage(cause);
  }

  try {
    const authUrl = new URL("/auth/v1/user", env.supabaseUrl!);
    const response = await fetchImpl(authUrl.toString(), {
      headers: {
        apikey: env.supabaseAnonKey!,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: unknown; email?: unknown; app_metadata?: { provider?: unknown } | null }
      | null;

    if (response.ok && normalizeText(payload?.id)) {
      return buildResolvedUser(
        mapSupabaseUserToCurrentUser(
          {
            id: normalizeText(payload?.id),
            email: typeof payload?.email === "string" ? payload.email : null,
            app_metadata: payload?.app_metadata && typeof payload.app_metadata === "object" ? { provider: normalizeText(payload.app_metadata.provider) || null } : null,
          },
          accessToken,
          env,
        ),
        buildDiagnostics({
          ...diagnosticsBase,
          validationMethod: "auth-api",
          validationStatus: "resolved",
          authErrorMessage: null,
        }),
      );
    }

    if (response.ok) {
      return buildFailureResult(
        "missing_user",
        "The browser auth token did not resolve to a user.",
        buildDiagnostics({
          ...diagnosticsBase,
          validationMethod: "auth-api",
          validationStatus: "missing_user",
          authErrorMessage: authErrorMessage || null,
        }),
      );
    }

    const responseText = normalizeText(await response.text().catch(() => ""));
    return buildFailureResult(
      "token_validation_failed",
      "The browser auth token could not be validated.",
      buildDiagnostics({
        ...diagnosticsBase,
        validationMethod: "auth-api",
        validationStatus: "token_validation_failed",
        authErrorMessage: responseText || authErrorMessage || `HTTP ${response.status}`,
      }),
    );
  } catch (cause) {
    return buildFailureResult(
      "token_validation_failed",
      "The browser auth token could not be validated.",
      buildDiagnostics({
        ...diagnosticsBase,
        validationMethod: "auth-api",
        validationStatus: "token_validation_failed",
        authErrorMessage: normalizeAuthErrorMessage(cause) || authErrorMessage,
      }),
    );
  }
}

export async function resolveCurrentBlundrUser(input: CurrentBlundrUserResolutionInput = {}): Promise<CurrentBlundrUserResolutionResult> {
  if (input.userOverride?.userId) {
    const userId = normalizeText(input.userOverride.userId);
    if (!userId) {
      return buildFailureResult(
        "missing_user",
        "The browser auth token did not resolve to a user.",
        buildDiagnostics({
          hasAuthorizationHeader: Boolean(input.request?.headers.get("authorization")),
          bearerTokenPresent: false,
          supabaseUrlPresent: false,
          supabaseAnonKeyPresent: false,
          validationMethod: null,
          validationStatus: "missing_user",
          authErrorMessage: null,
        }),
      );
    }
    const user = {
      userId,
      email: input.userOverride.email ?? null,
      mode: input.userOverride.mode ?? "local_demo",
      isAuthenticated: Boolean(input.userOverride.isAuthenticated),
      isAdmin: Boolean(input.userOverride.isAdmin),
      accessToken: input.userOverride.accessToken ?? null,
      provider: input.userOverride.provider ?? null,
    } satisfies CurrentBlundrUser;
    return {
      user,
      reasonCode: "resolved",
      reason: "Signed-in browser auth token resolved to a user.",
      diagnostics: buildDiagnostics({
        hasAuthorizationHeader: Boolean(input.request?.headers.get("authorization")),
        bearerTokenPresent: true,
        supabaseUrlPresent: false,
        supabaseAnonKeyPresent: false,
        validationMethod: null,
        validationStatus: "resolved",
        authErrorMessage: null,
      }),
    };
  }

  const env = readBlundrBackendEnv();
  const mode = resolveBlundrAccountMode({ env, allowLocalFallback: input.allowLocalFallback ?? true });
  if (mode === "local_demo") {
    const userId = getCurrentBlundrUserIdFallback();
    const user = {
      ...createLocalDemoUser(),
      userId,
    };
    return {
      user,
      reasonCode: "local_demo",
      reason: "Local demo session active.",
      diagnostics: buildDiagnostics({
        hasAuthorizationHeader: Boolean(input.request?.headers.get("authorization")),
        bearerTokenPresent: false,
        supabaseUrlPresent: Boolean(env.supabaseUrl),
        supabaseAnonKeyPresent: Boolean(env.supabaseAnonKey),
        validationMethod: null,
        validationStatus: "local_demo",
        authErrorMessage: null,
      }),
    };
  }

  const hasAuthorizationHeader = Boolean(input.request?.headers.get("authorization"));
  const accessToken = parseBearerToken(input.request);
  if (!accessToken) {
    return buildFailureResult(
      "missing_bearer_token",
      "No browser auth token was provided.",
      buildDiagnostics({
        hasAuthorizationHeader,
        bearerTokenPresent: false,
        supabaseUrlPresent: Boolean(env.supabaseUrl),
        supabaseAnonKeyPresent: Boolean(env.supabaseAnonKey),
        validationMethod: null,
        validationStatus: "missing_bearer_token",
        authErrorMessage: null,
      }),
    );
  }
  return validateSupabaseBearerToken(accessToken, {
    env,
    hasAuthorizationHeader,
  });
}

export async function getCurrentBlundrUser(input: CurrentBlundrUserResolutionInput = {}): Promise<CurrentBlundrUser | null> {
  const resolution = await resolveCurrentBlundrUser(input);
  return resolution.user;
}

export function isCurrentBlundrUserLocalDemo(user: CurrentBlundrUser | null | undefined): boolean {
  return Boolean(user && user.mode === "local_demo");
}

export { getOnboardingAuthSession } from "../onboarding/onboardingAuth";
export { resetOnboardingAuthClientFactoryForTesting, setOnboardingAuthClientFactoryForTesting } from "../onboarding/onboardingAuth";

export async function resolveWriteUserForMode(input: {
  requestedUserId?: string | null;
  storageModeSetting?: BlundrStorageModeSetting;
} = {}): Promise<BlundrWriteUserResolution> {
  const env = readBlundrBackendEnv();
  const storageMode = input.storageModeSetting ?? env.storageModeSetting;
  const requestedUserId = normalizeText(input.requestedUserId);

  if (storageMode === "authenticated") {
    const session = await getOnboardingAuthSession().catch(() => null);
    if (session?.userId) {
      return {
        ok: true,
        userId: session.userId,
        storageMode,
      };
    }
    return {
      ok: false,
      code: "auth_required",
      message: "Sign in before saving shared progress.",
      storageMode,
    };
  }

  if (storageMode === "local_demo") {
    return {
      ok: true,
      userId: requestedUserId || getCurrentBlundrUserIdFallback(),
      storageMode,
    };
  }

  const session = await getOnboardingAuthSession().catch(() => null);
  if (session?.userId) {
    return {
      ok: true,
      userId: session.userId,
      storageMode,
    };
  }

  return {
    ok: true,
    userId: requestedUserId || getCurrentBlundrUserIdFallback(),
    storageMode,
  };
}
