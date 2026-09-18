import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shellCss = readFileSync(
  new URL("../../components/architecture/AppShell.module.css", import.meta.url),
  "utf8",
);
const gate = readFileSync(
  new URL(
    "../../components/architecture/ResponsiveAppShellGate.tsx",
    import.meta.url,
  ),
  "utf8",
);
const progressCss = readFileSync(
  new URL(
    "../../components/progress/ProgressDashboard.module.css",
    import.meta.url,
  ),
  "utf8",
);
const progressDashboard = readFileSync(
  new URL("../../components/progress/ProgressDashboard.tsx", import.meta.url),
  "utf8",
);
const appShell = readFileSync(
  new URL("../../components/architecture/AppShell.tsx", import.meta.url),
  "utf8",
);

describe("Apple-sleek visual calibration contract", () => {
  it("keeps the desktop shell column contract conditional", () => {
    expect(shellCss).toContain(".mainWithAside .mainInner");
    expect(shellCss).toContain(
      "grid-template-columns: minmax(0, 1fr) minmax(0, var(--shell-context-width))",
    );
    expect(shellCss).toContain("@media (min-width: 821px)");
    expect(shellCss).toContain("--shell-rail: 86px");
    expect(shellCss).toContain("--shell-top: 70px");
  });

  it("lays Progress out as the calibrated 12-column dashboard", () => {
    expect(progressCss).toContain(
      "grid-template-columns: repeat(12, minmax(0, 1fr))",
    );
    expect(progressCss).toContain(".span7");
    expect(progressCss).toContain(".span5");
    expect(progressCss).toContain(".span12");
    expect(progressCss).toContain(
      "grid-template-columns: repeat(5, minmax(0, 1fr))",
    );
    expect(progressDashboard).toContain("NestedDailyRings");
    expect(progressDashboard).toContain("refreshSummary");
    expect(progressDashboard).toContain("authenticatedApiFetch");
    expect(progressDashboard).toContain("reviewAttemptsToday");
    expect(progressDashboard).toContain('aria-label="Refresh progress"');
  });

  it("keeps ResponsiveAppShellGate exemptions and route mapping intact", () => {
    for (const prefix of [
      "/signup",
      "/login",
      "/forgot-password",
      "/auth",
      "/confirm",
      "/reset-password",
      "/onboarding",
      "/privacy",
      "/terms",
      "/acceptable-use",
      "/subscription-terms",
      "/account-deletion",
    ]) {
      expect(gate).toContain(`"${prefix}"`);
    }
    expect(gate).toContain('pathname.startsWith("/daily")');
    expect(gate).toContain('pathname.startsWith("/review")');
    expect(gate).toContain('pathname.startsWith("/progress")');
    expect(gate).toContain('pathname.startsWith("/repertoire")');
  });

  it("drops calibration-only prose and uses the CSS B rail tile", () => {
    expect(appShell).toContain("railTile");
    expect(progressDashboard).not.toContain("Seven-day row");
    expect(progressDashboard).not.toContain(
      "Volume is a useful signal, but Tempo only counts what matters.",
    );
    expect(progressDashboard).not.toContain(
      "Tempo only shows this when there is enough signal.",
    );
    expect(progressDashboard).not.toContain(
      "Keep building points and Tempo will widen the pool.",
    );
    expect(progressDashboard).not.toContain(
      "The next useful opening target from the live model.",
    );
    expect(progressDashboard).not.toContain(
      "Tempo prefers calm, specific feedback over generic shame.",
    );
    expect(progressDashboard).not.toContain(
      "Small markers keep the loop visible.",
    );
    expect(progressDashboard).not.toContain(
      "Fast paths back into the training loop.",
    );
    expect(progressDashboard).not.toContain(
      "A compact history of what Tempo noticed recently.",
    );
  });
});
