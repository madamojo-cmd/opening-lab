import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const customerFacingSources = [
  "app/page.tsx",
  "app/onboarding/page.tsx",
  "components/billing/BillingUpgradePage.tsx",
  "components/daily/DailyBlundrScreen.tsx",
  "components/daily/ProductionDailyBlundrScreen.tsx",
  "components/figma-source/5303-dashboard-daily-review/Figma5303DashboardDailyReview.tsx",
  "components/progress/ProgressDashboard.tsx",
  "components/repertoire/openingDetail/OpeningDetailPage.tsx",
  "components/repertoire/openingDetail/OpeningDetailEmptyState.tsx",
  "components/repertoire/openingDetail/WeakBranchCards.tsx",
  "components/settings/SettingsPage.tsx",
  "components/marketing/blundr-training-demo-package/shared-board-frame/PrototypeMarketingBoardFrame.module.css",
  "apps/marketing/app/contact/page.tsx",
  "apps/marketing/app/acceptable-use/page.tsx",
  "apps/marketing/app/daily-blundr/page.tsx",
  "apps/marketing/app/features/page.tsx",
  "apps/marketing/app/how-it-works/page.tsx",
  "apps/marketing/app/pricing/page.tsx",
  "apps/marketing/app/subscription-terms/page.tsx",
  "apps/marketing/app/terms/page.tsx",
  "apps/marketing/components/LegalPage.tsx",
  "apps/marketing/lib/site.ts",
];

const forbiddenCustomerCopy = [
  "phone-inside-a-page",
  "mobile prototype",
  "canonical three-ring widget",
  "server-generated offer",
  "provider-confirmed",
  "authenticated session",
  "billing-status records",
  "local completions",
  "daily-local",
  "mastery scaffold",
  "reserved daily session",
  "production standalone modes",
  "answer-safe",
  "counsel review",
  "$7.99",
  "$59.99",
];

test("active customer-facing copy stays free of internal launch language", () => {
  const violations = customerFacingSources.flatMap((relativePath) => {
    const source = readFileSync(join(root, relativePath), "utf8").toLowerCase();
    return forbiddenCustomerCopy
      .filter((phrase) => source.includes(phrase))
      .map((phrase) => `${relativePath}: ${phrase}`);
  });
  assert.deepEqual(violations, []);
});

test("marketing board badges retain intrinsic sizing", () => {
  const source = readFileSync(
    join(
      root,
      "components/marketing/blundr-training-demo-package/shared-board-frame/PrototypeMarketingBoardFrame.module.css",
    ),
    "utf8",
  );
  assert.match(source, /\.overlayBadge\s*\{[\s\S]*?width:\s*max-content;/);
  assert.match(source, /\.overlayBadge\s*\{[\s\S]*?height:\s*auto;/);
});
