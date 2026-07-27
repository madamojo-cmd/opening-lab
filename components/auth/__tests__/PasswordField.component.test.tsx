import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PasswordField } from "../PasswordField";

afterEach(cleanup);
afterEach(() => {
  vi.restoreAllMocks();
});

describe("PasswordField", () => {
  it("toggles visibility without changing the value or selection", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(
      () => undefined,
    );

    const onChange = vi.fn();
    render(
      <PasswordField
        label="Password"
        value="hunter2"
        onChange={onChange}
        autoComplete="current-password"
      />,
    );

    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");
    input.setSelectionRange(2, 5);
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("hunter2");
    expect(input.selectionStart).toBe(2);
    expect(input.selectionEnd).toBe(5);
    expect(screen.getByRole("button", { name: "Hide password" })).toBeEnabled();
  });
});
