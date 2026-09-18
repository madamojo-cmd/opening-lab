import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const animationSources = {
  training: "components/marketing/blundr-training-demo-package/MarketingTrainingDemo.tsx",
  daily: "components/marketing/blundr-training-demo-package/DailyBlundrMarketingDemo.tsx",
  review: "components/marketing/blundr-training-demo-package/SmartReviewMarketingDemo.tsx",
  mastery: "components/marketing/blundr-training-demo-package/MasteryMarketingDemo.tsx",
  consistency: "components/marketing/blundr-training-demo-package/DailyRingsMarketingDemo.tsx",
  momentum:
    "components/marketing/blundr-landing-integration-completion-package/momentum/MomentumSectionCorrected.tsx",
} as const;

test("below-hero demos use one-shot visibility-gated playback", () => {
  for (const [name, relativePath] of Object.entries(animationSources)) {
    const source = readFileSync(join(root, relativePath), "utf8");
    assert.match(source, /rootMargin:\s*["']0px["']/i, `${name} trigger`);
    assert.match(source, /intersectionRatio\s*>=\s*(?:0\.35|\.35)/, `${name} visibility`);
    assert.match(source, /hasPlayed(?:Ref|)\s*=\s*useRef\(false\)/, `${name} one-shot guard`);
    assert.doesNotMatch(source, /setTimeout\(run|%\s*(?:8000|8200|7500)/, `${name} loop`);
  }
});

test("below-hero demos retain meaningful reduced-motion final states", () => {
  const training = readFileSync(join(root, animationSources.training), "utf8");
  const daily = readFileSync(join(root, animationSources.daily), "utf8");
  const review = readFileSync(join(root, animationSources.review), "utf8");
  const mastery = readFileSync(join(root, animationSources.mastery), "utf8");
  const consistency = readFileSync(join(root, animationSources.consistency), "utf8");
  const momentum = readFileSync(join(root, animationSources.momentum), "utf8");

  assert.match(training, /setStage\(6\)/);
  assert.match(daily, /setStage\(5\)/);
  assert.match(review, /setStage\(8\)/);
  assert.match(mastery, /masteryMarketingFrames\[3\]/);
  assert.match(consistency, /dailyRingsFrames\[2\]/);
  assert.match(momentum, /setPoints\(10\)/);
  assert.match(momentum, /setCollected\(true\)/);
});
