import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DisconnectGameDataDialog } from "./DisconnectGameDataDialog";

afterEach(cleanup);

describe("DisconnectGameDataDialog", () => {
  it("focuses the safe action, traps Tab, and closes with Escape", () => {
    const onCancel = vi.fn();
    render(
      <DisconnectGameDataDialog
        open
        onCancel={onCancel}
        onConfirm={vi.fn()}
        deleteMode
      />,
    );

    const cancel = screen.getByRole("button", { name: "Cancel" });
    const confirm = screen.getByRole("button", {
      name: "Disconnect and delete",
    });
    expect(cancel).toHaveFocus();

    confirm.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(
      screen.getByRole("link", { name: /deletion details/i }),
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
