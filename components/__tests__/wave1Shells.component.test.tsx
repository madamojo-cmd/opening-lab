import { describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  ConnectedGameDataPanel,
  type GameDataStatus,
} from "../settings/gameData";
import {
  OpeningDetailShell,
  type OpeningDetailState,
} from "../repertoire/openingDetail";

describe("Wave 1 fixture shells", () => {
  it("renders disconnected game-data state without provider networking", () => {
    render(<ConnectedGameDataPanel />);
    expect(screen.getByText("No provider connected.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Verify account" })).toBeTruthy();
  });
  it("renders locked opening state without fake intelligence", () => {
    render(
      <OpeningDetailShell
        fixture={{
          openingId: "london-white",
          openingName: "London System",
          state: "locked",
          access: "gated_pending",
          masteryPercent: null,
          weakBranches: [],
          hasRealGameData: false,
        }}
      />,
    );
    expect(screen.getByText("Opening locked")).toBeTruthy();
    expect(screen.getByText(/not available/)).toBeTruthy();
  });
  it("covers every fixture state required by the product shells", () => {
    cleanup();
    const settingsStates: GameDataStatus[] = [
      "disconnected",
      "verifying",
      "connected",
      "syncing",
      "current",
      "delayed",
      "partial",
      "retryable_error",
      "permanent_error",
      "deletion_in_progress",
      "deletion_success",
      "deletion_failure",
    ];
    for (const status of settingsStates) {
      const view = render(<ConnectedGameDataPanel initialStatus={status} />);
      expect(view.getByText("Provider connection")).toBeTruthy();
      view.unmount();
    }
    const detailStates: OpeningDetailState[] = [
      "loading",
      "ready",
      "empty",
      "stale",
      "partial",
      "error",
      "locked",
      "unknown",
    ];
    for (const state of detailStates) {
      const view = render(
        <OpeningDetailShell
          fixture={{
            openingId: "italian-white",
            openingName: "Italian Game",
            state,
            access:
              state === "locked" || state === "unknown"
                ? "gated_pending"
                : "active",
            masteryPercent: state === "ready" ? 50 : null,
            weakBranches: [],
            hasRealGameData: false,
          }}
        />,
      );
      expect(view.getByRole("main")).toBeTruthy();
      view.unmount();
    }
    cleanup();
  });
});
