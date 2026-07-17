import { cleanup, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./AppShell.module.css", () => ({
  default: new Proxy({}, { get: (_target, property) => String(property) }),
}));

afterEach(cleanup);

import { AppShell, PRODUCTION_MINIGAMES } from "./AppShell";

describe("AppShell", () => {
  it("keeps one accessible navigation tree and exposes semantic slots", () => {
    render(
      <AppShell
        activeNav="train"
        task={<button type="button">Submit move</button>}
        context={<p>Due today</p>}
      >
        <p>Existing page content</p>
      </AppShell>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getByRole("main")).toContainElement(
      screen.getByText("Existing page content"),
    );
    expect(
      screen.getByRole("region", { name: "Primary task" }),
    ).toContainElement(screen.getByRole("button", { name: "Submit move" }));
    expect(
      screen.getByRole("complementary", { name: "Context" }),
    ).toContainElement(screen.getByText("Due today"));
    expect(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: "Train" },
      ),
    ).toHaveAttribute("aria-current", "page");
  });

  it("provides keyboard-sized links for every primary destination", () => {
    render(<AppShell />);
    const links = within(
      screen.getByRole("navigation", { name: "Primary" }),
    ).getAllByRole("link");
    expect(links).toHaveLength(7);
    expect(new Set(links.map((link) => link.getAttribute("href"))).size).toBe(
      7,
    );
    expect(links.map((link) => link.textContent)).toEqual([
      "Home",
      "Train",
      "Daily",
      "Review",
      "Repertoire",
      "Minigames",
      "Settings",
    ]);
  });

  it("keeps the standalone catalog limited to the three production games", () => {
    expect(PRODUCTION_MINIGAMES).toEqual([
      "Deep Tactic Shots",
      "Knight Gymnasium",
      "King & Pawn Lab",
    ]);
    expect(PRODUCTION_MINIGAMES.join(" ")).not.toMatch(
      /Candidate Choice|Plan Recall|Same Position|Continuation Challenge|Punish the Mistake|Mixed Test/i,
    );
  });
});
