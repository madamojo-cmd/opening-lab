import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams("next=/train?tab=daily"),
}));

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
    signInForOnboarding: vi.fn(),
  };
});

import { AppAuthForm } from "../AppAuthForm";

afterEach(() => {
  cleanup();
  navigation.replace.mockReset();
});

describe("AppAuthForm", () => {
  it("shows password recovery links and hides the login password by default", () => {
    render(<AppAuthForm mode="login" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(
      screen.getByRole("link", { name: "Forgot password?" }),
    ).toHaveAttribute("href", "/forgot-password?next=%2Ftrain%3Ftab%3Ddaily");
    expect(
      screen.getByRole("link", {
        name: "Forgot which email you used? Contact support.",
      }),
    ).toHaveAttribute("href", "mailto:support@blundr.io");
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
  });

  it("uses new-password autocomplete for sign-up", () => {
    render(<AppAuthForm mode="signup" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });
});
