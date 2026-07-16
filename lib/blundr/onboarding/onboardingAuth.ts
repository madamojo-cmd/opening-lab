import { createBlundrSupabaseBrowserClient } from "../backend/supabaseBrowserClient";
import type {
  OnboardingAuthResult,
  OnboardingAuthSession,
} from "./onboardingTypes";

type BrowserClient = NonNullable<
  ReturnType<typeof createBlundrSupabaseBrowserClient>
>;

type ClientFactory = () => BrowserClient | null;

const defaultClientFactory: ClientFactory = () =>
  createBlundrSupabaseBrowserClient();

let clientFactory: ClientFactory = defaultClientFactory;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function getClient(): BrowserClient | null {
  try {
    return clientFactory();
  } catch {
    return null;
  }
}

function authUnavailableResult(): OnboardingAuthResult {
  return {
    ok: false,
    code: "auth_unavailable",
    message: "Supabase auth is not configured. Continue in local demo.",
  };
}

function normalizeSuccessEmail(
  email: string | null | undefined,
  fallback: string,
): string {
  const normalized = normalizeText(email);
  return normalized || fallback;
}

export function setOnboardingAuthClientFactoryForTesting(
  factory: ClientFactory,
): void {
  clientFactory = factory;
}

export function resetOnboardingAuthClientFactoryForTesting(): void {
  clientFactory = defaultClientFactory;
}

export function isOnboardingAuthAvailable(): boolean {
  return Boolean(getClient());
}

export function normalizeOnboardingAuthError(
  error: unknown,
): OnboardingAuthResult {
  const message = normalizeText(
    typeof error === "string"
      ? error
      : ((
          error as {
            message?: unknown;
            error_description?: unknown;
            code?: unknown;
          }
        )?.message ??
          (error as { error_description?: unknown })?.error_description ??
          (error as { code?: unknown })?.code ??
          "Authentication failed. Please try again."),
  );
  const lower = message.toLowerCase();

  if (lower.includes("not configured") || lower.includes("missing supabase")) {
    return authUnavailableResult();
  }
  if (
    lower.includes("invalid login") ||
    lower.includes("invalid credentials") ||
    lower.includes("wrong password")
  ) {
    return {
      ok: false,
      code: "invalid_credentials",
      message: "Email or password is incorrect.",
    };
  }
  if (
    lower.includes("confirm") ||
    lower.includes("email not confirmed") ||
    lower.includes("verification")
  ) {
    return {
      ok: false,
      code: "email_confirmation_required",
      message: "Check your email to confirm your account, then sign in again.",
    };
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return {
      ok: false,
      code: "rate_limited",
      message: "Too many attempts. Wait a moment and try again.",
    };
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("failed to fetch")
  ) {
    return {
      ok: false,
      code: "network_error",
      message: "Network error. Try again or continue in local demo.",
    };
  }
  return {
    ok: false,
    code: "auth_failed",
    message,
  };
}

export async function getOnboardingAuthSession(): Promise<OnboardingAuthSession | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const sessionResult = await client.auth.getSession();
    const session = sessionResult.data.session;
    if (!session) return null;
    const userResult = await client.auth.getUser();
    const user = userResult.data.user ?? session.user ?? null;
    if (!user) return null;
    return {
      userId: user.id,
      email: normalizeSuccessEmail(user.email, ""),
      accessToken: session.access_token,
      expiresAt:
        typeof session.expires_at === "number"
          ? new Date(session.expires_at * 1000).toISOString()
          : null,
    };
  } catch {
    return null;
  }
}

export function subscribeToOnboardingAuth(
  callback: (session: OnboardingAuthSession | null) => void,
): () => void {
  const client = getClient();
  if (!client) return () => undefined;
  const subscription = client.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    callback({
      userId: session.user.id,
      email: normalizeSuccessEmail(session.user.email, ""),
      accessToken: session.access_token,
      expiresAt:
        typeof session.expires_at === "number"
          ? new Date(session.expires_at * 1000).toISOString()
          : null,
    });
  });
  return () => subscription.data.subscription.unsubscribe();
}

export async function signInForOnboarding(
  email: string,
  password: string,
): Promise<OnboardingAuthResult> {
  const client = getClient();
  if (!client) return authUnavailableResult();
  const normalizedEmail = normalizeText(email).toLowerCase();
  const normalizedPassword = normalizeText(password);
  if (!normalizedEmail || !normalizedPassword) {
    return {
      ok: false,
      code: "missing_credentials",
      message: "Enter an email and password.",
    };
  }
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });
    if (error) return normalizeOnboardingAuthError(error);
    if (!data.user) {
      return {
        ok: false,
        code: "auth_failed",
        message: "Sign-in did not return a user.",
      };
    }
    return {
      ok: true,
      userId: data.user.id,
      email: normalizeSuccessEmail(data.user.email, normalizedEmail),
    };
  } catch (error) {
    return normalizeOnboardingAuthError(error);
  }
}

export async function signUpForOnboarding(
  email: string,
  password: string,
): Promise<OnboardingAuthResult> {
  const client = getClient();
  if (!client) return authUnavailableResult();
  const normalizedEmail = normalizeText(email).toLowerCase();
  const normalizedPassword = normalizeText(password);
  if (!normalizedEmail || !normalizedPassword) {
    return {
      ok: false,
      code: "missing_credentials",
      message: "Enter an email and password.",
    };
  }
  try {
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password: normalizedPassword,
    });
    if (error) return normalizeOnboardingAuthError(error);
    if (!data.user) {
      return {
        ok: false,
        code: "auth_failed",
        message: "Sign-up did not return a user.",
      };
    }
    const needsEmailConfirmation = !data.session;
    return {
      ok: true,
      userId: data.user.id,
      email: normalizeSuccessEmail(data.user.email, normalizedEmail),
      needsEmailConfirmation,
      message: needsEmailConfirmation
        ? "Check your email to confirm your account, then sign in again."
        : undefined,
    };
  } catch (error) {
    return normalizeOnboardingAuthError(error);
  }
}
