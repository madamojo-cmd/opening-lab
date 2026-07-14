import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { BlundrButton } from "../blundr/ui/BlundrButton";

describe("BlundrButton", () => {
  it("renders a keyboard-usable button with its label", () => {
    render(<BlundrButton>Continue</BlundrButton>);
    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).not.toHaveAttribute("disabled");
  });
});
