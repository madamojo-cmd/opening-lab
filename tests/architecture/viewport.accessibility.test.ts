import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layout = readFileSync(
  new URL("../../app/layout.tsx", import.meta.url),
  "utf8",
);

describe("root viewport accessibility contract", () => {
  it("allows user zoom while preserving device-width and initial scale", () => {
    expect(layout).toContain('width: "device-width"');
    expect(layout).toContain("initialScale: 1");
    expect(layout).not.toMatch(/\bmaximumScale\s*:/);
    expect(layout).not.toMatch(/\buserScalable\s*:\s*false/);
  });

  it("preserves the root gate ordering", () => {
    const shell = layout.indexOf("<ResponsiveAppShellGate>");
    const onboarding = layout.indexOf("<OnboardingRouteGate>");
    const hydration = layout.indexOf("<AuthenticatedAccountHydrationGate>");

    expect(shell).toBeGreaterThan(-1);
    expect(onboarding).toBeGreaterThan(shell);
    expect(hydration).toBeGreaterThan(onboarding);
  });
});
