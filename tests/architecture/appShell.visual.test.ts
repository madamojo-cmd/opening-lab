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
  it("defines every package breakpoint and wide-desktop whitespace behavior", () => {
    for (const breakpoint of [390, 768, 1024, 1280, 1440, 1600]) {
      expect(css).toContain(`min-width: ${breakpoint}px`);
    }
    expect(css).toContain("--shell-edge: 16px");
    expect(css).toContain("--shell-edge: 20px");
    expect(css).toContain("--shell-edge: 32px");
    expect(css).toContain("--shell-edge: 48px");
    expect(css).toContain("--shell-rail: 88px");
    expect(css).toContain("--shell-content-max: 1200px");
  });

  it("uses one CSS-driven navigation tree and honors reduced motion", () => {
    expect(component).not.toMatch(/mobile.*navigation|desktop.*navigation/i);
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
