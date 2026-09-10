import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  subscribe: vi.fn(),
  onChange: null as ((session: unknown) => void) | null,
  unsubscribe: vi.fn(),
}));
const navigation = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
const route = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => navigation,
}));

vi.mock("@/lib/blundr/onboarding/onboardingAuth", () => ({
  getOnboardingAuthSession: auth.getSession,
  subscribeToOnboardingAuth: (callback: (session: unknown) => void) => {
    auth.onChange = callback;
    auth.subscribe();
    return auth.unsubscribe;
  },
}));

vi.mock("@/lib/blundr/onboarding/onboardingV11Flag", () => ({
  isOnboardingV11Enabled: () => true,
}));

vi.mock("@/lib/blundr/api/authenticatedApiClient", () => ({
  authenticatedApiFetch: vi.fn(),
}));

vi.mock("@/lib/blundr/accounts/authenticatedAccountHydration", () => ({
  persistAuthenticatedAccountSnapshot: vi.fn(() => ({
    ok: true,
    userId: "user-a",
  })),
}));

import { AuthenticatedAccountHydrationGate } from "../AuthenticatedAccountHydrationGate";
import { OnboardingRouteGate } from "../OnboardingRouteGate";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import {
  ONBOARDING_AUTH_HYDRATION_TIMEOUT_MS,
  useOnboardingAuthSession,
} from "@/lib/blundr/onboarding/useOnboardingAuthSession";

const mockedAuthenticatedApiFetch = vi.mocked(authenticatedApiFetch);

function AuthState() {
  const state = useOnboardingAuthSession();
  return <output>{`${state.status}:${state.hydrationError ?? "none"}`}</output>;
}

const signedInSession = {
  userId: "user-a",
  email: "user@example.com",
  accessToken: "token",
  expiresAt: null,
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  route.pathname = "/";
  auth.getSession.mockReset();
  auth.subscribe.mockReset();
  auth.unsubscribe.mockReset();
  auth.onChange = null;
  navigation.replace.mockReset();
  navigation.push.mockReset();
  mockedAuthenticatedApiFetch.mockReset();
  vi.unstubAllGlobals();
});

describe("auth hydration gates", () => {
  it("settles null, existing, rejected, and timed-out initial sessions", async () => {
    auth.getSession.mockResolvedValueOnce(null);
    const first = render(<AuthState />);
    await waitFor(() =>
      expect(screen.getByText("signed_out:none")).toBeInTheDocument(),
    );
    first.unmount();

    auth.getSession.mockResolvedValueOnce(signedInSession);
    const second = render(<AuthState />);
    await waitFor(() =>
      expect(screen.getByText("authenticated:none")).toBeInTheDocument(),
    );
    second.unmount();

    auth.getSession.mockRejectedValueOnce(new Error("unavailable"));
    const third = render(<AuthState />);
    await waitFor(() =>
      expect(
        screen.getByText("signed_out:initialization_failed"),
      ).toBeInTheDocument(),
    );
    third.unmount();

    vi.useFakeTimers();
    auth.getSession.mockReturnValueOnce(new Promise(() => undefined));
    render(<AuthState />);
    await act(async () => {
      vi.advanceTimersByTime(ONBOARDING_AUTH_HYDRATION_TIMEOUT_MS);
    });
    expect(
      screen.getByText("signed_out:initialization_timed_out"),
    ).toBeInTheDocument();
  });

  it("honors auth events after a timeout and cleans up its listener", async () => {
    vi.useFakeTimers();
    auth.getSession.mockReturnValue(new Promise(() => undefined));
    const view = render(<AuthState />);
    await act(async () => {
      vi.advanceTimersByTime(ONBOARDING_AUTH_HYDRATION_TIMEOUT_MS);
    });
    await act(async () => {
      auth.onChange?.(signedInSession);
    });
    expect(screen.getByText("authenticated:none")).toBeInTheDocument();
    await act(async () => {
      auth.onChange?.(null);
    });
    expect(screen.getByText("signed_out:none")).toBeInTheDocument();
    view.unmount();
    expect(auth.unsubscribe).toHaveBeenCalledOnce();
  });

  it("allows the signed-out root route to render the public landing", async () => {
    auth.getSession.mockResolvedValue(null);
    render(
      <OnboardingRouteGate>
        <AuthenticatedAccountHydrationGate>
          <p>Protected content</p>
        </AuthenticatedAccountHydrationGate>
      </OnboardingRouteGate>,
    );

    await waitFor(() =>
      expect(screen.getByText("Protected content")).toBeInTheDocument(),
    );
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it.each(["/billing/success", "/billing/cancel"])(
    "lets authenticated incomplete-onboarding users reach %s",
    async (pathname) => {
      route.pathname = pathname;
      auth.getSession.mockResolvedValue(signedInSession);
      mockedAuthenticatedApiFetch.mockResolvedValue({
        ok: true,
        data: { step: "plan", completed: false },
      });
      vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
          Response.json({
            ok: true,
            data: {
              profile: {
                userId: signedInSession.userId,
                onboardingCompleted: false,
              },
              repertoire: null,
            },
          }),
        ),
      );

      render(
        <OnboardingRouteGate>
          <AuthenticatedAccountHydrationGate>
            <p>Billing return content</p>
          </AuthenticatedAccountHydrationGate>
        </OnboardingRouteGate>,
      );

      await waitFor(() =>
        expect(screen.getByText("Billing return content")).toBeInTheDocument(),
      );
      expect(mockedAuthenticatedApiFetch).not.toHaveBeenCalledWith(
        "/api/blundr/onboarding/v11",
        expect.anything(),
      );
      expect(navigation.replace).not.toHaveBeenCalledWith(
        expect.stringMatching(/^\/onboarding/),
      );
    },
  );

  it("keeps signed-out billing routes subject to authentication", async () => {
    route.pathname = "/billing/success";
    auth.getSession.mockResolvedValue(null);

    render(
      <OnboardingRouteGate>
        <AuthenticatedAccountHydrationGate>
          <p>Billing return content</p>
        </AuthenticatedAccountHydrationGate>
      </OnboardingRouteGate>,
    );

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith(
        "/login?next=%2Fbilling%2Fsuccess",
      ),
    );
    expect(
      screen.queryByText("Billing return content"),
    ).not.toBeInTheDocument();
  });

  it.each([
    "/settings",
    "/train",
    "/daily",
    "/review",
    "/repertoire",
    "/progress",
    "/minigames",
  ])("keeps %s protected by onboarding completion", async (pathname) => {
    route.pathname = pathname;
    auth.getSession.mockResolvedValue(signedInSession);
    mockedAuthenticatedApiFetch.mockResolvedValue({
      ok: true,
      data: { step: "plan", completed: false },
    });

    render(
      <OnboardingRouteGate>
        <p>Protected content</p>
      </OnboardingRouteGate>,
    );

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith("/onboarding/plan"),
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });
});
