import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const reviewPage = readFileSync(
  new URL("../../app/review/page.tsx", import.meta.url),
  "utf8",
);
const progressPage = readFileSync(
  new URL("../../app/progress/page.tsx", import.meta.url),
  "utf8",
);
const reviewHub = readFileSync(
  new URL("../../components/review/ReviewHub.tsx", import.meta.url),
  "utf8",
);
const progressDashboard = readFileSync(
  new URL("../../components/progress/ProgressDashboard.tsx", import.meta.url),
  "utf8",
);

describe("Review and Progress presentation migration", () => {
  it("removes nested phone-shell wrappers from the routes", () => {
    for (const source of [reviewPage, progressPage]) {
      expect(source).not.toMatch(/min-h-screen/);
      expect(source).not.toMatch(/max-w-md/);
    }
    expect(reviewPage).toContain('<main className="w-full">');
    expect(progressPage).toContain('<main className="w-full">');
  });

  it("keeps ReviewHub on the live Daily and production minigame owners", () => {
    expect(reviewHub).toContain("ReviewTabDailyBlundrPanel");
    expect(reviewHub).toContain("PRODUCTION_MINI_GAME_REGISTRY");
    expect(reviewHub).toContain("getDailyMiniGameDefinition");
  });

  it("keeps ProgressDashboard on the canonical rings and manual refresh control", () => {
    expect(progressDashboard).not.toMatch(/!embedded\s*\?/);
    expect(progressDashboard).toContain("ProfileSettingsIcon");
    expect(progressDashboard).toContain('aria-label="Refresh progress"');
    expect(progressDashboard).toContain("NestedDailyRings");
    expect(progressDashboard).toContain("refreshSummary");
  });

  it("preserves the distinct Review daily access states and capability wiring", () => {
    expect(reviewHub).toMatch(/capabilities === null\s*\?\s*"Checking"/);
    expect(reviewHub).toMatch(/capabilities\.dailyEnabled === true\s*\?\s*"On"/);
    expect(reviewHub).toMatch(/:\s*"Off"/);
    expect(reviewHub).toContain(
      "enabled={capabilities?.dailyEnabled ?? null}",
    );
  });
});
