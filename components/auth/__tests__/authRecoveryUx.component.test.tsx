import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams("next=/settings"),
}));

const requestPasswordResetForOnboardingMock = vi.hoisted(() => vi.fn());
const completePasswordResetForOnboardingMock = vi.hoisted(() => vi.fn());
const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.searchParams,
}));

vi.mock("@/lib/blundr/onboarding/onboardingAuth", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/blundr/onboarding/onboardingAuth")
  >("@/lib/blundr/onboarding/onboardingAuth");
  return {
    ...actual,
    requestPasswordResetForOnboarding: requestPasswordResetForOnboardingMock,
    completePasswordResetForOnboarding: completePasswordResetForOnboardingMock,
  };
});

vi.mock("@/lib/blundr/backend/supabaseBrowserClient", () => ({
  createBlundrSupabaseBrowserClient: createClientMock,
}));

import { AuthCallbackClient } from "../AuthCallbackClient";
import { ForgotPasswordForm } from "../ForgotPasswordForm";
import { ResetPasswordForm } from "../ResetPasswordForm";

afterEach(() => {
  cleanup();
  navigation.replace.mockReset();
  navigation.searchParams = new URLSearchParams("next=/settings");
  requestPasswordResetForOnboardingMock.mockReset();
  completePasswordResetForOnboardingMock.mockReset();
  createClientMock.mockReset();
});

function makeRecoveryClient(sessionPresent = true) {
  return {
    auth: {
      getSession: vi.fn(async () => ({
        data: {
          session: sessionPresent
            ? {
                access_token: "access-token",
                expires_at: 1893456000,
                user: { id: "user-1", email: "adam@example.com" },
              }
            : null,
        },
      })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      updateUser: vi.fn(async () => ({
        data: { user: { id: "user-1", email: "adam@example.com" } },
        error: null,
      })),
      resetPasswordForEmail: vi.fn(async () => ({ error: null })),
    },
  };
}

describe("auth recovery flows", () => {
  it("sends a neutral forgot-password response and keeps the email hidden", async () => {
    requestPasswordResetForOnboardingMock.mockResolvedValue({
      ok: true,
      code: "reset_email_sent",
      message:
        "If an account exists for that email, we sent a password reset link.",
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "adam@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() =>
      expect(requestPasswordResetForOnboardingMock).toHaveBeenCalledWith(
        "adam@example.com",
        expect.stringContaining("/auth/callback"),
      ),
    );
    expect(
      screen.getByText(
        "If an account exists for that email, we sent a password reset link.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return to login" }),
    ).toHaveAttribute("href", "/login?next=%2Fsettings");
  });

  it("shows invalid-email and rate-limit states", async () => {
    requestPasswordResetForOnboardingMock.mockResolvedValue({
      ok: false,
      code: "rate_limited",
      message: "Too many attempts. Wait a moment and try again.",
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "adam@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await screen.findByText("Too many attempts. Wait a moment and try again.");
  });

  it("accepts a recovery session, updates the password, and redirects to login", async () => {
    createClientMock.mockReturnValue(makeRecoveryClient(true));
    completePasswordResetForOnboardingMock.mockResolvedValue({
      ok: true,
      code: "password_updated",
      message: "Your password has been updated.",
    });

    render(<ResetPasswordForm />);

    expect(await screen.findByLabelText("New password")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-password-1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-password-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() =>
      expect(completePasswordResetForOnboardingMock).toHaveBeenCalledWith(
        "new-password-1",
      ),
    );
    expect(navigation.replace).toHaveBeenCalledWith(
      "/login?passwordReset=1&next=%2Fsettings",
    );
  });

  it("shows an expired-link state when no recovery session exists", async () => {
    createClientMock.mockReturnValue(makeRecoveryClient(false));

    render(<ResetPasswordForm />);

    expect(
      await screen.findByText(
        "This reset link is invalid or expired. Request another email to continue.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Request another email",
      }),
    ).toHaveAttribute("href", "/forgot-password?next=%2Fsettings");
  });

  it("routes recovery callbacks to reset-password and ordinary callbacks to the app", async () => {
    const recoveryClient = makeRecoveryClient(true);
    createClientMock.mockReturnValue(recoveryClient);
    navigation.searchParams = new URLSearchParams(
      "type=recovery&next=/reset-password?next=%2Fsettings",
    );

    render(<AuthCallbackClient />);

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith(
        "/reset-password?next=/settings",
      ),
    );

    cleanup();
    navigation.replace.mockReset();
    navigation.searchParams = new URLSearchParams("next=/settings");
    createClientMock.mockReturnValue(makeRecoveryClient(true));

    render(<AuthCallbackClient />);

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith("/settings"),
    );
  });

  it("shows a recovery failure state with another reset action", async () => {
    createClientMock.mockReturnValue(makeRecoveryClient(false));
    navigation.searchParams = new URLSearchParams(
      "type=recovery&next=/reset-password?next=%2Fsettings",
    );

    render(<AuthCallbackClient />);

    expect(
      await screen.findByText(
        "This link is invalid or expired. Request another password reset email.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Request another password reset email",
      }),
    ).toHaveAttribute("href", "/forgot-password?next=/login");
  });
});
