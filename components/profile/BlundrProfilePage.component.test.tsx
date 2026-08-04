import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  authState: {
    status: "authenticated",
    session: {
      userId: "user-a",
      email: "player@example.com",
      accessToken: "token",
      expiresAt: null,
    },
    hydrationError: null,
  },
}));

vi.mock("@/lib/blundr/onboarding/useOnboardingAuthSession", () => ({
  useOnboardingAuthSession: () => mocks.authState,
}));

vi.mock("@/lib/blundr/api/authenticatedApiClient", () => {
  class AuthenticatedApiError extends Error {
    constructor(_code: string, _status: number, message: string) {
      super(message);
    }
  }
  return {
    authenticatedApiFetch: mocks.apiFetch,
    AuthenticatedApiError,
  };
});

import { AuthenticatedApiError } from "@/lib/blundr/api/authenticatedApiClient";
import { BlundrProfilePage } from "./BlundrProfilePage";

afterEach(() => {
  cleanup();
  mocks.apiFetch.mockReset();
});

describe("BlundrProfilePage", () => {
  it("loads private identity and saves a validated unique username", async () => {
    mocks.apiFetch
      .mockResolvedValueOnce({ username: "adam" })
      .mockResolvedValueOnce({ username: "new_name" });
    render(<BlundrProfilePage />);

    expect(await screen.findByText("@adam")).toBeInTheDocument();
    expect(screen.getByText("player@example.com")).toBeInTheDocument();
    expect(screen.queryByText("user-a")).not.toBeInTheDocument();

    const input = screen.getByLabelText("Username");
    fireEvent.change(input, { target: { value: "A" } });
    expect(screen.getByRole("status")).toHaveTextContent("Use 3–24 characters");
    expect(
      screen.getByRole("button", { name: "Save username" }),
    ).toBeDisabled();

    fireEvent.change(input, { target: { value: "new_name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save username" }));

    await waitFor(() =>
      expect(mocks.apiFetch).toHaveBeenLastCalledWith(
        "/api/blundr/profile",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ username: "new_name" }),
        }),
      ),
    );
    expect(await screen.findByText("@new_name")).toBeInTheDocument();
    expect(screen.getByText("Blundr username saved.")).toBeInTheDocument();
  });

  it("surfaces server uniqueness conflicts without replacing the current username", async () => {
    mocks.apiFetch.mockResolvedValueOnce({ username: "adam" });
    mocks.apiFetch.mockRejectedValueOnce(
      new AuthenticatedApiError(
        "api_error",
        409,
        "That username is unavailable.",
      ),
    );
    render(<BlundrProfilePage />);

    const input = await screen.findByLabelText("Username");
    fireEvent.change(input, { target: { value: "claimed_name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save username" }));

    expect(
      await screen.findByText("That username is unavailable."),
    ).toBeInTheDocument();
    expect(screen.getByText("@adam")).toBeInTheDocument();
  });
});
