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
const reviewTabDailyBlundrPanel = readFileSync(
  new URL(
    "../../components/daily/ReviewTabDailyBlundrPanel.tsx",
    import.meta.url,
  ),
  "utf8",
);
const progressDashboard = readFileSync(
  new URL("../../components/progress/ProgressDashboard.tsx", import.meta.url),
  "utf8",
);
const streakConsistencyCard = readFileSync(
  new URL(
    "../../components/progress/StreakConsistencyCard.tsx",
    import.meta.url,
  ),
  "utf8",
);
const reviewAttemptRoute = readFileSync(
  new URL(
    "../../app/api/blundr/review-mistakes/[mistakeId]/attempt/route.ts",
    import.meta.url,
  ),
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

  it("keeps ProgressDashboard on the canonical rings, lifecycle, and manual refresh control", () => {
    expect(progressDashboard).not.toMatch(/!embedded\s*\?/);
    expect(progressDashboard).toContain('aria-label="Refresh progress"');
    expect(progressDashboard).toContain("NestedDailyRings");
    expect(progressDashboard).toContain("StreakConsistencyCard");
    expect(progressDashboard).toContain("refreshSummary");
    expect(progressDashboard).toContain("authenticatedApiFetch");
    expect(progressDashboard).toContain("getLocalDateKey");
    expect(progressDashboard).toContain("BLUNDR_DAILY_RING_REFRESH_EVENT");
    expect(progressDashboard).toContain('window.addEventListener("storage"');
    expect(progressDashboard).toContain('window.addEventListener("focus"');
    expect(progressDashboard).toContain('window.removeEventListener("storage"');
  });

  it("shares the 28-day streak card between Progress and Review", () => {
    expect(progressDashboard).toContain("StreakConsistencyCard");
    expect(reviewHub).toContain("ReviewStreakConsistencyCard");
    expect(streakConsistencyCard).toContain("STREAK & CONSISTENCY");
    expect(streakConsistencyCard).toContain("length === 28");
    expect(streakConsistencyCard).toContain("Array.from({ length: 28 }");
    expect(streakConsistencyCard).toContain("week: recentDays.slice(-7)");
  });

  it("keeps direct Review replay guarded by the daily authority cap", () => {
    expect(reviewAttemptRoute).toContain("isReviewDailyLimitReached");
    expect(reviewAttemptRoute).toContain("daily_review_limit_reached");
    expect(reviewAttemptRoute).toContain("status: 409");
    expect(reviewAttemptRoute.indexOf("daily_review_limit_reached")).toBeLessThan(
      reviewAttemptRoute.lastIndexOf("appendLearningEventV2"),
    );
  });

  it("keeps the Progress route shell-native", () => {
    expect(progressPage).toContain("ProgressDashboard");
    expect(progressPage).not.toContain("AppShell");
    expect(progressPage).not.toContain("ResponsiveAppShellGate");
  });

  it("preserves the distinct Review daily access states and capability wiring", () => {
    expect(reviewHub).toContain(
      "enabled={capabilities?.dailyEnabled ?? null}",
    );
    expect(reviewTabDailyBlundrPanel).toMatch(
      /enabled === null\s*\?\s*"Checking Daily Blundr/,
    );
    expect(reviewTabDailyBlundrPanel).toMatch(
      /enabled === false\s*\?\s*"Daily Blundr is unavailable/,
    );
    expect(reviewTabDailyBlundrPanel).toMatch(
      /loadFailed\s*\?\s*"Daily Blundr couldn't load today's deck/,
    );
  });

  it("keeps Review queue height bounded only on desktop with an internal item scroller", () => {
    const reviewQueueCard = reviewHub.match(
      /<section[\s\S]*?aria-label="Review queue"[\s\S]*?>/,
    )?.[0] ?? "";
    expect(reviewHub).toContain("xl:grid-cols-2");
    expect(reviewQueueCard).toContain("flex flex-col");
    expect(reviewQueueCard).toContain(
      "min-[821px]:h-[clamp(30rem,calc(100dvh-14rem),32rem)]",
    );
    expect(reviewQueueCard).not.toContain("overflow-y-auto");

    const inbox = readFileSync(
      new URL("../../components/review/ReviewQueueInbox.tsx", import.meta.url),
      "utf8",
    );
    expect(inbox).toContain("mt-4 flex min-h-0 flex-1 flex-col gap-3");
    expect(inbox).toContain("data-testid=\"review-queue-scroll-region\"");
    expect(inbox).toContain("overflow-visible");
    expect(inbox).toContain("min-[821px]:overflow-y-auto");
    expect(inbox).toContain("min-[821px]:flex-1");
    expect(inbox).not.toContain("max-h-[");
    expect(inbox).not.toContain("sticky top-0");
  });
});
