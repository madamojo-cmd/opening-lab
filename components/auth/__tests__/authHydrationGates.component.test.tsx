import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { act, afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  subscribe: vi.fn(),
  onChange: null as ((session: unknown) => void) | null,
  unsubscribe: vi.fn(),
}));
const navigation = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
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

import { AuthenticatedAccountHydrationGate } from "../AuthenticatedAccountHydrationGate";
import { OnboardingRouteGate } from "../OnboardingRouteGate";
import {
  ONBOARDING_AUTH_HYDRATION_TIMEOUT_MS,
  useOnboardingAuthSession,
} from "@/lib/blundr/onboarding/useOnboardingAuthSession";

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
  auth.getSession.mockReset();
  auth.subscribe.mockReset();
  auth.unsubscribe.mockReset();
  auth.onChange = null;
  navigation.replace.mockReset();
});

describe("auth hydration gates", () => {
  it("settles null, existing, rejected, and timed-out initial sessions", async () => {
    auth.getSession.mockResolvedValueOnce(null);
    const first = render(<AuthState />);
    await waitFor(() => expect(screen.getByText("signed_out:none")).toBeInTheDocument());
    first.unmount();

    auth.getSession.mockResolvedValueOnce(signedInSession);
    const second = render(<AuthState />);
    await waitFor(() => expect(screen.getByText("authenticated:none")).toBeInTheDocument());
    second.unmount();

    auth.getSession.mockRejectedValueOnce(new Error("unavailable"));
    const third = render(<AuthState />);
    await waitFor(() => expect(screen.getByText("signed_out:initialization_failed")).toBeInTheDocument());
    third.unmount();

    vi.useFakeTimers();
    auth.getSession.mockReturnValueOnce(new Promise(() => undefined));
    render(<AuthState />);
    await act(async () => {
      vi.advanceTimersByTime(ONBOARDING_AUTH_HYDRATION_TIMEOUT_MS);
    });
    expect(screen.getByText("signed_out:initialization_timed_out")).toBeInTheDocument();
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

  it("lets the signed-out route gate redirect instead of leaving the root shell busy", async () => {
    auth.getSession.mockResolvedValue(null);
    render(
      <OnboardingRouteGate>
        <AuthenticatedAccountHydrationGate>
          <p>Protected content</p>
        </AuthenticatedAccountHydrationGate>
      </OnboardingRouteGate>,
    );

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith("/login?next=%2F"),
    );
  });
});
