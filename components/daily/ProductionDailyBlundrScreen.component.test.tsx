import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  DailyBlundrBoard: ({
    disabled,
    onMoveAttempt,
  }: {
    disabled?: boolean;
    onMoveAttempt?: (attempt: {
      from: string;
      to: string;
      uci: string;
      san: string;
      legal: boolean;
      promotion: null;
    }) => void;
  }) => (
    <button
      type="button"
      data-testid="daily-board"
      disabled={disabled}
      onClick={() =>
        onMoveAttempt?.({
          from: "g1",
          to: "f3",
          uci: "g1f3",
          san: "Nf3",
          legal: true,
          promotion: null,
        })
      }
    >
      Daily board
    </button>
  ),
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

  it("submits a board move against the exact reserved card and version", async () => {
    const initial = dailyResponse(3);
    mocks.apiFetch.mockResolvedValueOnce(initial).mockResolvedValueOnce({
      ...initial,
      session: { ...initial.session, version: 1 },
      correct: true,
    });
    render(<ProductionDailyBlundrScreen />);
    fireEvent.click(await screen.findByTestId("daily-board"));

    await waitFor(() => expect(mocks.apiFetch).toHaveBeenCalledTimes(2));
    const [requestPath, init] = mocks.apiFetch.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(requestPath).toBe("/api/blundr/daily/sessions/session-1/attempts");
    expect(JSON.parse(String(init.body))).toEqual({
      cardFingerprint: "card-0",
      actionId: "action-0",
      answer: "g1f3",
      expectedVersion: 0,
    });
  });

  it("reveals the exact reserved card without discarding the session", async () => {
    const initial = dailyResponse(3);
    mocks.apiFetch.mockResolvedValueOnce(initial).mockResolvedValueOnce({
      ...initial,
      session: {
        ...initial.session,
        version: 1,
        state: {
          ...initial.session.state,
          revealedCardIds: ["card-0"],
        },
      },
    });
    render(<ProductionDailyBlundrScreen />);
    fireEvent.click(await screen.findByRole("button", { name: "Reveal" }));

    await waitFor(() => expect(mocks.apiFetch).toHaveBeenCalledTimes(2));
    const [requestPath, init] = mocks.apiFetch.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(requestPath).toBe("/api/blundr/daily/sessions/session-1/reveal");
    expect(JSON.parse(String(init.body))).toEqual({
      cardFingerprint: "card-0",
      actionId: "action-0",
      expectedVersion: 0,
    });
    expect(screen.getByText("Task 1 of 3")).toBeInTheDocument();
  });

  it("shows the safe server failure and preserves the reserved card for retry", async () => {
    mocks.apiFetch
      .mockResolvedValueOnce(dailyResponse(3))
      .mockRejectedValueOnce(
        new AuthenticatedApiError(
          "persistence_unavailable" as never,
          503,
          "Daily could not safely save that action. Your deck is unchanged; try again.",
        ),
      );
    render(<ProductionDailyBlundrScreen />);
    const board = await screen.findByTestId("daily-board");
    fireEvent.click(board);
    expect(
      await screen.findByText(
        "Daily could not safely save that action. Your deck is unchanged; try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Task 1 of 3")).toBeInTheDocument();
    expect(board).not.toBeDisabled();
  });
});
