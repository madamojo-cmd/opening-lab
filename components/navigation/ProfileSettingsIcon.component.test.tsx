import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";

import { ProfileSettingsIcon } from "./ProfileSettingsIcon";

afterEach(cleanup);

describe("ProfileSettingsIcon", () => {
  it("keeps secondary destinations in one keyboard-operable account menu", () => {
    render(<ProfileSettingsIcon />);

    const trigger = screen.getByRole("button", {
      name: "Profile and settings",
    });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Profile",
      "Settings",
      "Help",
      "Legal",
    ]);
    expect(items[0]).toHaveFocus();

    fireEvent.keyDown(items[0], { key: "ArrowDown" });
    expect(items[1]).toHaveFocus();
    fireEvent.keyDown(items[1], { key: "End" });
    expect(items[3]).toHaveFocus();
    fireEvent.keyDown(items[3], { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
