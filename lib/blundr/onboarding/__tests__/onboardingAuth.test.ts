import assert from "node:assert/strict";

import { getOnboardingAuthSession, isOnboardingAuthAvailable, normalizeOnboardingAuthError, resetOnboardingAuthClientFactoryForTesting, setOnboardingAuthClientFactoryForTesting, signInForOnboarding, signUpForOnboarding } from "../onboardingAuth";

type FakeAuthClient = {
  auth: {
    getSession: () => Promise<{ data: { session: { access_token: string; expires_at: number; user: { id: string; email: string | null } } | null } }>;
    getUser: () => Promise<{ data: { user: { id: string; email: string | null } | null } }>;
    signInWithPassword: (args: { email: string; password: string }) => Promise<{ data: { user: { id: string; email: string | null } | null }; error: null }>;
    signUp: (args: { email: string; password: string }) => Promise<{ data: { user: { id: string; email: string | null } | null; session: null | { access_token: string } }; error: null }>;
  };
};

const fakeClient: FakeAuthClient = {
  auth: {
    async getSession() {
      return {
        data: {
          session: {
            access_token: "token-1",
            expires_at: 1893456000,
            user: { id: "user-1", email: "adam@example.com" },
          },
        },
      };
    },
    async getUser() {
      return { data: { user: { id: "user-1", email: "adam@example.com" } } };
    },
    async signInWithPassword({ email }) {
      return { data: { user: { id: "user-1", email } }, error: null };
    },
    async signUp({ email }) {
      return { data: { user: { id: "user-2", email }, session: null }, error: null };
    },
  },
};

void (async () => {
  try {
    setOnboardingAuthClientFactoryForTesting(() => fakeClient as never);
    assert.equal(isOnboardingAuthAvailable(), true);

    const session = await getOnboardingAuthSession();
    assert.equal(session?.userId, "user-1");
    assert.equal(session?.accessToken, "token-1");

    const signIn = await signInForOnboarding("adam@example.com", "secret");
    assert.equal(signIn.ok, true);
    if (signIn.ok) {
      assert.equal(signIn.userId, "user-1");
      assert.equal(signIn.email, "adam@example.com");
    }

    const signUp = await signUpForOnboarding("new@example.com", "secret");
    assert.equal(signUp.ok, true);
    if (signUp.ok) {
      assert.equal(signUp.userId, "user-2");
      assert.equal(signUp.needsEmailConfirmation, true);
    }

    assert.equal(normalizeOnboardingAuthError("Invalid login credentials").code, "invalid_credentials");
    assert.equal(normalizeOnboardingAuthError("Supabase auth is not configured").code, "auth_unavailable");
  } finally {
    resetOnboardingAuthClientFactoryForTesting();
  }

  setOnboardingAuthClientFactoryForTesting(() => null);
  assert.equal(isOnboardingAuthAvailable(), false);
  const unavailable = await signInForOnboarding("adam@example.com", "secret");
  assert.equal(unavailable.ok, false);
  if (!unavailable.ok) {
    assert.equal(unavailable.code, "auth_unavailable");
  }
  resetOnboardingAuthClientFactoryForTesting();

  console.log("onboardingAuth.test.ts passed");
})();
