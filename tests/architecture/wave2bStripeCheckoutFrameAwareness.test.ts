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
    /findVisibleCardPaymentControl\([^)]*page[\s\S]*stripeInteractionContexts\(page\)/,
  );
  assert.match(source, /cardControlCandidates\(context\.target\)/);
  assert.match(source, /strategy: "visible_card_text"/);
  assert.match(source, /getByText\(\/\^Card\$\/i\)/);
  assert.match(source, /button\[data-testid="card-accordion-item-button"\]/);
  assert.match(
    source,
    /getByRole\("button", \{ name: \/\^pay with card\$\/i \}\)/,
  );
  assert.match(source, /async function findVisibleCardPaymentControl\(/);
  assert.match(source, /skippedStrategies = new Set\(\)/);
  assert.match(source, /skippedCardStrategies/);
  assert.match(source, /cardControlStrategyNames\(page\)/);
  assert.match(source, /clickVisibleLocatorCenter\(page, card\.locator\)/);
  assert.match(source, /page\.mouse\.click\(/);
  assert.match(source, /scrollLocatorIntoView/);
  assert.match(source, /isLocatorInViewport/);
  assert.match(source, /cardCoordinateClickAttempted/);
  assert.match(source, /visible_card_text_center/);
  assert.match(source, /pay_with_card_text_button_ancestor/);
  assert.match(source, /payment_testid_card_aria/);
  assert.match(source, /payment_testid_card_text/);
  assert.match(source, /\[data-testid\*="payment"\]/);
  assert.match(source, /card_accordion_testid_contains/);
  assert.match(source, /cardFoundFrameKind/);
  assert.match(source, /cardFoundFrameOrigin/);
  assert.match(source, /cardFoundFrameName/);
  assert.match(source, /collectCardCandidateDiagnostics\(page\)/);
  assert.match(source, /cardCandidateDiagnostics/);
  assert.match(source, /matchCount/);
  assert.match(source, /visibleCount/);
  assert.match(source, /tagName/);
  assert.match(source, /role/);
  assert.match(source, /ariaLabel/);
  assert.match(source, /dataTestId/);
  assert.match(source, /ariaChecked/);
  assert.match(source, /tabindex/);
  assert.match(source, /textContent/);
  assert.match(source, /boundingBox/);
  assert.match(source, /outerHTML/);
  assert.match(source, /isCardPaymentMethodSelected\(page\)/);
  assert.match(source, /#payment-method-accordion-item-title-card/);
  assert.match(
    source,
    /input\[name="payment-method-accordion-item-title"\]\[value="card"\]/,
  );
  assert.match(source, /waitForCardSelectionOrFields/);
  assert.match(source, /initialCardSelected/);
  assert.match(source, /initialCardFieldsMounted/);
  assert.match(source, /already_selected_or_fields_mounted/);
  assert.match(source, /cardClickRetried/);
  assert.match(source, /timeoutMs = 20000/);
  assert.match(source, /selectionDeadline = Date\.now\(\) \+ 30000/);
  assert.match(source, /waitForVisibleStripeFieldByFallbacks/);
  assert.match(source, /stripeCardNumberLocators/);
  assert.match(source, /#cardNumber/);
  assert.match(source, /#cardExpiry/);
  assert.match(source, /#cardCvc/);
  assert.match(source, /#billingName/);
  assert.match(source, /#billingCountry/);
  assert.match(source, /#billingPostalCode/);
  assert.match(source, /disableStripeLinkSave\(page\)/);
  assert.match(
    source,
    /disableStripeLinkSave\(page\)[\s\S]*stripeInteractionContexts\(page\)/,
  );
  assert.match(source, /#enableStripePass/);
  assert.match(source, /save my information for faster checkout/i);
  assert.match(source, /acknowledgeStripeAiAgentDisclosure\(page\)/);
  assert.match(source, /i am an ai agent acting on behalf of someone else/i);
  assert.match(source, /checkbox\.check\(\{ timeout: 5000 \}\)/);
  assert.match(source, /aiAgentDisclosureStrategy/);
  assert.match(source, /aiAgentDisclosureFrameKind/);
  assert.match(source, /aiAgentDisclosureCheckboxBoundingBox/);
  assert.match(source, /aiAgentDisclosureLabelBoundingBox/);
  assert.match(source, /aiAgentDisclosureInViewport/);
  assert.match(source, /aiAgentDisclosureActionable/);
  assert.match(source, /aiAgentDisclosureScrollError/);
  assert.match(source, /visible_text_or_label/);
  assert.match(source, /visible_text_center/);
  assert.match(source, /ai_agent_disclosure_bounding_box_missing/);
  assert.match(source, /stripe_checkout_ai_agent_disclosure_not_checked/);
  assert.match(source, /findPrimaryStripeSubmitControl\(page\)/);
  assert.match(
    source,
    /findPrimaryStripeSubmitControl\(page\)[\s\S]*stripeInteractionContexts\(page\)/,
  );
  assert.match(source, /button\[data-testid="hosted-payment-submit-button"\]/);
  assert.match(source, /hosted_payment_submit_testid/);
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
  assert.doesNotMatch(source, /strategy: "card_radio_direct"/);
  assert.doesNotMatch(
    source,
    /getByRole\("radio", \{ name: \/pay with card\/i \}\)/,
  );
  assert.doesNotMatch(source, /checkout\.sessions\.list\(/);
  assert.match(source, /checkout\.sessions\.retrieve\(checkoutSessionId/);
  assert.match(source, /4242424242424242/);
  assert.match(source, /deleteEphemeralStripeCustomer/);
  assert.match(source, /cleanupSucceeded/);
});
