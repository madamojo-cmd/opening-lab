import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const source = readFileSync(
  join(root, "scripts/wave2b-sandbox-integration-proof.mjs"),
  "utf8",
);

test("Wave 2B Stripe checkout interactions are frame-aware and bounded", () => {
  assert.match(source, /function stripeInteractionContexts\(page\)/);
  assert.match(source, /const mainFrame = page\.mainFrame\(\)/);
  assert.match(source, /for \(const frame of page\.frames\(\)\)/);
  assert.match(
    source,
    /findVisibleCardPaymentControl\(page\)[\s\S]*stripeInteractionContexts\(page\)/,
  );
  assert.match(source, /cardControlCandidates\(context\.target\)/);
  assert.match(source, /getByRole\("radio", \{ name: \/pay with card\/i \}\)/);
  assert.match(source, /getByText\(\/\^Pay with card\$\/i\)/);
  assert.match(source, /pay_with_card_text_button_ancestor/);
  assert.match(source, /card_accordion_testid_contains/);
  assert.match(source, /card_role_radio_contains/);
  assert.match(source, /cardFoundFrameKind/);
  assert.match(source, /cardFoundFrameOrigin/);
  assert.match(source, /cardFoundFrameName/);
  assert.match(source, /isCardPaymentMethodSelected\(page\)/);
  assert.match(source, /waitForCardSelectionOrFields/);
  assert.match(source, /cardClickRetried/);
  assert.match(source, /timeoutMs = 20000/);
  assert.match(source, /selectionDeadline = Date\.now\(\) \+ 30000/);
  assert.match(source, /waitForVisibleStripeFieldByFallbacks/);
  assert.match(source, /stripeCardNumberLocators/);
  assert.match(source, /disableStripeLinkSave\(page\)/);
  assert.match(
    source,
    /disableStripeLinkSave\(page\)[\s\S]*stripeInteractionContexts\(page\)/,
  );
  assert.match(source, /findPrimaryStripeSubmitControl\(page\)/);
  assert.match(
    source,
    /findPrimaryStripeSubmitControl\(page\)[\s\S]*stripeInteractionContexts\(page\)/,
  );
  assert.match(source, /waitForPrimaryStripeSubmitControl/);
  assert.match(source, /submitFrameKind/);
  assert.match(source, /submitFrameOrigin/);
  assert.match(source, /submitFrameName/);
  assert.match(source, /primarySubmitLabels/);
  assert.match(source, /linkSaveInitiallyChecked/);
  assert.match(source, /frameDiagnostics/);
  assert.match(source, /title: sanitizeError/);
  assert.match(
    source,
    /await submit\.locator\.click\(\);[\s\S]*await page\.waitForURL\(/,
  );
  assert.match(
    source,
    /try \{[\s\S]*await submit\.locator\.click\(\);[\s\S]*await page\.waitForURL\(/,
  );
  assert.doesNotMatch(source, /__privateStripeFrame/);
  assert.doesNotMatch(source, /force: true/);
  assert.doesNotMatch(source, /checkout\.sessions\.list\(/);
  assert.match(source, /checkout\.sessions\.retrieve\(checkoutSessionId/);
  assert.match(source, /4242424242424242/);
  assert.match(source, /deleteEphemeralStripeCustomer/);
  assert.match(source, /cleanupSucceeded/);
});
