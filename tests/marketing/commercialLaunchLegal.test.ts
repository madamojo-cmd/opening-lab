import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

const legalFiles = [
  ["pricing", "01_PRICING_AND_ENTITLEMENTS.md", "app/pricing/page.tsx"],
  ["terms", "02_TERMS_OF_SERVICE.md", "app/terms/page.tsx"],
  ["privacy", "03_PRIVACY_POLICY.md", "app/privacy/page.tsx"],
  [
    "subscription-terms",
    "04_SUBSCRIPTION_TERMS.md",
    "app/subscription-terms/page.tsx",
  ],
  ["cookies", "05_COOKIE_POLICY.md", "app/cookies/page.tsx"],
  ["legal", "06_LEGAL_NOTICE.md", "app/legal/page.tsx"],
] as const;

for (const [slug, sourceFile, routeFile] of legalFiles) {
  assert.equal(
    existsSync(resolve(root, "content/legal", sourceFile)),
    true,
    `missing_content:${sourceFile}`,
  );
  assert.equal(
    existsSync(
      resolve(root, "docs/legal/commercial-launch-20260831", sourceFile),
    ),
    true,
    `missing_docs_mirror:${sourceFile}`,
  );
  assert.equal(
    existsSync(resolve(root, routeFile)),
    true,
    `missing_route:${slug}`,
  );
}

assert.equal(
  existsSync(
    resolve(
      root,
      "docs/legal/commercial-launch-20260831/07_COMMERCIAL_LEGAL_LAUNCH_AUDIT.md",
    ),
  ),
  true,
  "missing_legal_launch_audit",
);

const legalContent = legalFiles
  .map(([, sourceFile]) =>
    readFileSync(resolve(root, "content/legal", sourceFile), "utf8"),
  )
  .join("\n");
assert.match(legalContent, /\$9\.99 per month/);
assert.match(legalContent, /\$69\.99 per year/);
assert.match(legalContent, /7-day free trial/);
assert.match(legalContent, /at least 16 years old/);
assert.match(legalContent, /Up to 3 unlocked openings/);
assert.match(legalContent, /Up to 5 cards per local day/);
assert.match(legalContent, /Up to 5 review positions per local day/);

const legalMapping = readFileSync(
  resolve(root, "lib/blundr/legal/commercialLegalContent.ts"),
  "utf8",
);
for (const [, sourceFile] of legalFiles) {
  assert.match(legalMapping, new RegExp(sourceFile.replace(".", "\\.")));
}

const signup = readFileSync(
  resolve(root, "components/auth/AppAuthForm.tsx"),
  "utf8",
);
assert.match(signup, /at least 16 years old/);
assert.doesNotMatch(signup, /13\+/);
assert.doesNotMatch(signup, /at least 13/i);

const onboarding = readFileSync(
  resolve(root, "components/onboarding/OnboardingV11Flow.tsx"),
  "utf8",
);
assert.match(onboarding, /Pro checkout is not active in this preview/);
assert.match(onboarding, /does not grant Pro access/);
assert.match(onboarding, /Save Pro intent/);
assert.doesNotMatch(onboarding, /isPro/);

for (const gateFile of [
  "components/auth/OnboardingRouteGate.tsx",
  "components/auth/AuthenticatedAccountHydrationGate.tsx",
]) {
  const gate = readFileSync(resolve(root, gateFile), "utf8");
  for (const route of [
    "/pricing",
    "/terms",
    "/privacy",
    "/subscription-terms",
    "/cookies",
    "/legal",
  ]) {
    assert.match(
      gate,
      new RegExp(`"${route}"`),
      `${gateFile}:missing:${route}`,
    );
  }
}
