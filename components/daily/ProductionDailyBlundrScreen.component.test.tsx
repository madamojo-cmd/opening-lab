import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock("@/lib/blundr/api/authenticatedApiClient", () => {
  class AuthenticatedApiError extends Error {
    constructor(
      readonly code: string,
      readonly status: number,
      message: string,
    ) {
      super(message);
    }
  }
  return { authenticatedApiFetch: mocks.apiFetch, AuthenticatedApiError };
});

vi.mock("@/components/daily/DailyBlundrBoard", () => ({
  DailyBlundrBoard: () => <div data-testid="daily-board" />,
}));

vi.mock("@/lib/blundr/daily-rings/dailyRingGameplayEvents", () => ({
  recordBlundrTaskCompleted: vi.fn(),
}));

vi.mock("@/lib/blundr/accounts/localAccountStorage", () => ({
  getLocalAccountCurrentUserId: () => null,
  getLocalTrainingProfile: () => null,
}));

vi.mock("@/lib/blundr/repertoire/repertoireProgressService", () => ({
  loadRepertoireProgress: vi.fn(),
}));

import { AuthenticatedApiError } from "@/lib/blundr/api/authenticatedApiClient";
import { ProductionDailyBlundrScreen } from "./ProductionDailyBlundrScreen";

function dailyResponse(count: number) {
  return {
    dateKey: "2026-08-06",
    status: "ready",
    explanation: "Verified Daily",
    session: {
      sessionId: "session-1",
      deckId: "deck-1",
      dateKey: "2026-08-06",
      version: 0,
      completedAt: null,
      reservationIdentity: {
        composerVersion: "daily-board-first-v4",
        runtimePackageId: "runtime-test",
        profileVersion: "default-free",
      },
      publicCards: Array.from({ length: count }, (_, index) => ({
        cardFingerprint: `card-${index}`,
        actionId: `action-${index}`,
        positionKey: `position-${index}`,
        activityId:
          index === 1 ? "daily_candidate_choice" : "daily_move_recall",
        title: index === 1 ? "Candidate choice" : "Missing move",
        prompt: "Play the verified move.",
        positionFen: "8/8/8/8/8/8/4K3/7k w - - 0 1",
        openingId: "italian-white",
        playKey: `key-${index}`,
        side: "white",
        why: "This position comes from an unlocked, verified opening line.",
        interaction: index === 1 ? "choice" : "move",
        options: index === 1 ? [{ id: "opaque-a", label: "Ke3" }] : undefined,
      })),
      state: {
        currentIndex: 0,
        completedCardIds: [],
        revealedCardIds: [],
      },
    },
  };
}

afterEach(() => {
  cleanup();
  mocks.apiFetch.mockReset();
});

describe("ProductionDailyBlundrScreen", () => {
  for (const count of [3, 4, 5, 8]) {
    it(`renders the authoritative ${count}-task reservation without a five-card assumption`, async () => {
      mocks.apiFetch.mockResolvedValueOnce(dailyResponse(count));
      render(<ProductionDailyBlundrScreen />);
      expect(await screen.findByText(`Task 1 of ${count}`)).toBeInTheDocument();
      expect(screen.getByTestId("daily-board")).toBeInTheDocument();
    });
  }

  it("routes an account without unlocked openings to the starter-pack flow", async () => {
    mocks.apiFetch.mockRejectedValueOnce(
      new AuthenticatedApiError(
        "daily_opening_selection_required" as never,
        409,
        "daily_opening_selection_required",
      ),
    );
    render(<ProductionDailyBlundrScreen />);
    expect(
      await screen.findByText(
        "Choose a starter pack or unlock an opening before starting Daily Blundr.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Choose openings" }),
    ).toHaveAttribute("href", "/onboarding/starter-pack");
  });
});
