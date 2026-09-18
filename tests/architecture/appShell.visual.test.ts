import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  new URL("../../components/architecture/AppShell.module.css", import.meta.url),
  "utf8",
);
const component = readFileSync(
  new URL("../../components/architecture/AppShell.tsx", import.meta.url),
  "utf8",
);

describe("AppShell responsive contract", () => {
  it("defines the calibrated shell geometry and desktop breakpoint behavior", () => {
    for (const breakpoint of [390, 768, 821, 1024, 1280, 1440]) {
      expect(css).toContain(`min-width: ${breakpoint}px`);
    }
    expect(css).toContain("--shell-edge: 16px");
    expect(css).toContain("--shell-edge: 20px");
    expect(css).toContain("--shell-edge: 28px");
    expect(css).toContain("--shell-edge: 34px");
    expect(css).toContain("--shell-rail: 86px");
    expect(css).toContain("--shell-top: 70px");
    expect(css).toContain("--shell-content-max: 1340px");
  });

  it("uses one CSS-driven navigation tree and keeps the brand asset wiring", () => {
    expect(component).toContain("BlundrAssetImage");
    expect(component).toContain("BLUNDR_BRAND_ASSETS.logoWordmark");
    expect(component).toContain("railTile");
    expect(component).not.toContain("BLUNDR_BRAND_ASSETS.appIcon");
    expect(component).not.toMatch(/mobile.*navigation|desktop.*navigation/i);
    expect(component).toContain("APP_SHELL_NAV_ITEMS");
    expect(component).toContain('aria-label="Primary"');
    expect(component).toContain('aria-label="Blundr home"');
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("focus-visible");
  });

  it("does not carry legacy standalone catalog labels", () => {
    expect(component).not.toMatch(
      /Candidate Choice|Plan Recall|Same Position|Continuation Challenge|Punish the Mistake|Mixed Test|Daily Blundr activity/i,
    );
  });
});
