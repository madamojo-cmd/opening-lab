import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock("@/lib/blundr/api/authenticatedApiClient", () => {
  class AuthenticatedApiError extends Error {
    readonly code: string;
    readonly status: number;
    constructor(code: string, status: number, message: string) {
      super(message);
      this.code = code;
      this.status = status;
    }
  }
  return { authenticatedApiFetch: mocks.apiFetch, AuthenticatedApiError };
});

vi.mock("@/components/daily/DailyBlundrBoard", () => ({
  DailyBlundrBoard: ({ disabled, onMoveAttempt }: { disabled?: boolean; onMoveAttempt?: (attempt: { uci: string }) => void }) => (
    <button type="button" disabled={disabled} onClick={() => onMoveAttempt?.({ uci: "e2e4" })}>Play e2e4</button>
  ),
}));

import { AuthenticatedApiError } from "@/lib/blundr/api/authenticatedApiClient";
import { AuthoritativeReviewQueue } from "./AuthoritativeReviewQueue";

const item = (state: "awaiting_answer" | "awaiting_rating" = "awaiting_answer") => ({
  reviewItemId: "item-1",
  openingId: "italian-white",
  playKey: "e2e4",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  dueAt: "2026-08-06T00:00:00.000Z",
  attempt: { attemptId: "attempt-1", state },
  allowedRatings: state === "awaiting_rating" ? ["hard", "good", "easy"] : [],
});

afterEach(() => {
  cleanup();
  mocks.apiFetch.mockReset();
});

describe("AuthoritativeReviewQueue", () => {
  it("renders loading, empty, and unavailable states distinctly", async () => {
    let resolveQueue!: (value: { items: never[] }) => void;
    mocks.apiFetch.mockReturnValueOnce(new Promise((resolve) => { resolveQueue = resolve; }));
    render(<AuthoritativeReviewQueue />);
    expect(screen.getByText("Loading your server-owned review queue…")).toBeInTheDocument();
    resolveQueue({ items: [] });
    expect(await screen.findByText("Nothing due right now")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Train" })).toHaveAttribute("href", "/train");

    cleanup();
    mocks.apiFetch.mockRejectedValueOnce(new AuthenticatedApiError("api_error", 503, "unavailable"));
    render(<AuthoritativeReviewQueue />);
    expect(await screen.findByText("Review is temporarily unavailable.")).toBeInTheDocument();
  });

  it("submits the exact server item and attempt identity, then exposes server ratings", async () => {
    mocks.apiFetch.mockResolvedValueOnce({ items: [item()] }).mockResolvedValueOnce({ state: "awaiting_rating", allowedRatings: ["hard", "good", "easy"] });
    render(<AuthoritativeReviewQueue />);
    fireEvent.click(await screen.findByRole("button", { name: "Play e2e4" }));
    await waitFor(() => expect(mocks.apiFetch).toHaveBeenLastCalledWith("/api/blundr/review/attempt", expect.objectContaining({ method: "POST", body: JSON.stringify({ itemId: "item-1", attemptId: "attempt-1", playedMoveUci: "e2e4" }) })));
    expect(await screen.findByRole("button", { name: "Hard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Good" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Easy" })).toBeInTheDocument();
  });

  it("persists reveal before advancing and uses a stable rating idempotency key", async () => {
    mocks.apiFetch.mockResolvedValueOnce({ items: [item()] }).mockResolvedValueOnce({ state: "rated" }).mockResolvedValueOnce({ items: [item("awaiting_rating")] }).mockResolvedValueOnce({}).mockResolvedValueOnce({ items: [] });
    render(<AuthoritativeReviewQueue />);
    fireEvent.click(await screen.findByRole("button", { name: "Reveal answer" }));
    await waitFor(() => expect(mocks.apiFetch).toHaveBeenNthCalledWith(2, "/api/blundr/review/attempt", expect.objectContaining({ body: JSON.stringify({ itemId: "item-1", attemptId: "attempt-1", reveal: true }) })));
    await screen.findByRole("button", { name: "Good" });
    fireEvent.click(screen.getByRole("button", { name: "Good" }));
    await waitFor(() => expect(mocks.apiFetch).toHaveBeenNthCalledWith(4, "/api/blundr/review/rating", expect.objectContaining({ body: JSON.stringify({ itemId: "item-1", attemptId: "attempt-1", rating: "good", idempotencyId: "review-rating:attempt-1:good" }) })));
  });

  it("does not advance on failure, disables duplicate work, and reloads stale state", async () => {
    let rejectAttempt!: (error: Error) => void;
    mocks.apiFetch.mockResolvedValueOnce({ items: [item()] }).mockReturnValueOnce(new Promise((_resolve, reject) => { rejectAttempt = reject; }));
    render(<AuthoritativeReviewQueue />);
    const play = await screen.findByRole("button", { name: "Play e2e4" });
    fireEvent.click(play);
    expect(play).toBeDisabled();
    rejectAttempt(new Error("network"));
    expect(await screen.findByText("Your answer was not recorded. Retry the same review.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play e2e4" })).toBeInTheDocument();

    cleanup();
    mocks.apiFetch.mockReset();
    mocks.apiFetch.mockResolvedValueOnce({ items: [item()] }).mockRejectedValueOnce(new AuthenticatedApiError("api_error", 409, "stale")).mockResolvedValueOnce({ items: [] });
    render(<AuthoritativeReviewQueue />);
    fireEvent.click(await screen.findByRole("button", { name: "Play e2e4" }));
    expect(await screen.findByText("This review changed in another tab. Reloading your queue.")).toBeInTheDocument();
    expect(await screen.findByText("Nothing due right now")).toBeInTheDocument();
  });

  it("restores a server-issued awaiting-rating attempt and never imports legacy local Review writers", async () => {
    mocks.apiFetch.mockResolvedValueOnce({ items: [item("awaiting_rating")] });
    render(<AuthoritativeReviewQueue />);
    expect(await screen.findByRole("button", { name: "Hard" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reveal answer" })).not.toBeInTheDocument();

    const source = readFileSync(resolve(process.cwd(), "components/review/AuthoritativeReviewQueue.tsx"), "utf8");
    expect(source).not.toMatch(/dailyBlundrReviewStorage|appendDailyBlundrReview|writeDailyBlundrReview|loadDailyBlundrReviewStore/);
  });
});
