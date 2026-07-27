import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";

import { AccountSaveProgressScreen } from "../AccountSaveProgressScreen";

afterEach(cleanup);

describe("AccountSaveProgressScreen", () => {
  it("renders a visible password toggle for onboarding account save", () => {
    render(
      <AccountSaveProgressScreen
        stepIndex={5}
        stepCount={9}
        accountChoice="account"
        authMode="sign_in"
        email="adam@example.com"
        password="hunter2"
        authAvailable
        onSelectAccountChoice={() => undefined}
        onSelectAuthMode={() => undefined}
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
        onSubmitAuth={() => undefined}
        onContinueLocalDemo={() => undefined}
        onBack={() => undefined}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });
});
