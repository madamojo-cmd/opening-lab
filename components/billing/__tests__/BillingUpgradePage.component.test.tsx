import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  fetch: vi.fn(),
}));

vi.mock("@/lib/blundr/api/authenticatedApiClient", () => ({
  authenticatedApiFetch: api.fetch,
}));

import { BillingUpgradePage } from "../BillingUpgradePage";

const freeAccess = {
  plan: "free",
  entitlementActive: false,
  entitlementSource: null,
  trialStatus: "none",
  expiresAt: null,
  currentPeriodEndAt: null,
  cancelAtPeriodEnd: false,
  limits: {
    dailyBlundrCards: 5,
    reviewCompletionsPerDay: 5,
    activeOpenings: 3,
    premiumInsights: false,
  },
};

const proAccess = {
  ...freeAccess,
  plan: "pro",
  entitlementActive: true,
  entitlementSource: "revenuecat",
  trialStatus: "active",
};

function offer(plan: "monthly" | "annual") {
  return {
    id: `offer-${plan}`,
    plan,
    trialEligible: true,
    trialDays: 7,
    disclosure: `7 days free, then ${plan === "monthly" ? "$9.99/month" : "$69.99/year"} plus applicable taxes. Requires a payment method. Renews automatically until canceled. Cancel before the shown date to avoid the first charge.`,
    acknowledgement:
      "I understand that my 7-day Blundr Pro trial requires a payment method and will automatically convert to the plan I selected on the date shown above unless I cancel before then.",
  };
}

afterEach(() => {
  cleanup();
  api.fetch.mockReset();
});

describe("BillingUpgradePage", () => {
  it("renders an authenticated upgrade surface without the onboarding Free action", async () => {
    api.fetch.mockImplementation(async (path, init) => {
      if (path === "/api/blundr/billing/status") {
        return { ok: true, data: freeAccess };
      }
      if (path === "/api/blundr/billing/offer") {
        const body = JSON.parse(String(init?.body));
        expect(Object.keys(body).sort()).toEqual(["plan"]);
        return { ok: true, data: offer(body.plan) };
      }
      throw new Error(`unexpected request ${path}`);
    });

    render(<BillingUpgradePage />);

    expect(
      await screen.findByRole("heading", { name: "Upgrade to Blundr Pro." }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /continue with free/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("$9.99/month after trial")).toBeInTheDocument();
    expect(screen.getByText("$69.99/year after trial")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /monthly/i }));
    const acknowledgement = await screen.findByRole("checkbox", {
      name: /7-day Blundr Pro trial requires a payment method/i,
    });
    const checkout = screen.getByRole("button", {
      name: /start 7-day pro trial/i,
    });
    expect(acknowledgement).not.toBeChecked();
    expect(checkout).toBeDisabled();
    fireEvent.click(acknowledgement);
    expect(checkout).toBeEnabled();
  });

  it("prevents duplicate checkout for active Pro users and opens portal without client customer authority", async () => {
    api.fetch.mockImplementation(async (path, init) => {
      if (path === "/api/blundr/billing/status") {
        return { ok: true, data: proAccess };
      }
      if (path === "/api/blundr/billing/portal") {
        expect(init?.body).toBe(JSON.stringify({}));
        return {
          ok: true,
          data: { url: "https://billing.stripe.test/session" },
        };
      }
      throw new Error(`unexpected request ${path}`);
    });

    render(<BillingUpgradePage />);

    expect(
      await screen.findByRole("heading", {
        name: "Blundr Pro is already active.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("$9.99/month after trial"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /monthly/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /manage billing/i }),
    ).toBeEnabled();
  });
});
