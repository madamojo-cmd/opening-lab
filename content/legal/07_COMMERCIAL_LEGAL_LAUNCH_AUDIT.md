# Blundr Final Commercial and Legal Launch Audit

Last updated: August 31, 2026

## Commercial decisions locked by this package

- Blundr Free: $0.
- Blundr Pro Monthly: $9.99/month plus applicable taxes.
- Blundr Pro Annual: $69.99/year plus applicable taxes; “Save 42%” versus 12 monthly payments at the stated U.S. price.
- Seven-day Pro trial with a valid payment method required.
- Free and Pro are both offered on the final onboarding step.
- Neither paid plan is preselected; the customer affirmatively chooses Monthly or Annual.
- Required separate subscription-consent checkbox, unchecked by default.
- Trial reminder approximately 72 hours before first charge.
- Annual reminder approximately 30 days before annual renewal.
- Monthly subscription reminder at least every six months.
- Online cancellation from Settings → Billing without support contact.
- Same ring/reward progression rules for Free and Pro.
- Free: 3 active openings, 5 Daily cards/day, 5 Review positions/day.
- Pro: unlimited active unlocked openings, Daily target 1–99/day, all available Review positions, full mastery/weak-area/trend/next-action views.
- Downgrades preserve all user chess data.

## Canonical public routes required

- /pricing
- /terms
- /privacy
- /subscription-terms
- /cookies
- /legal

Footer links must be present on public landing, signup/auth, pricing, and checkout-adjacent surfaces. Settings must link to Terms, Privacy, Subscription Terms, Cookie Settings, Billing, and account deletion/privacy controls.

## Required signup consent

Unchecked checkbox:

`I agree to the Terms of Service and Privacy Policy, and I confirm that I am at least 16 years old (or the minimum age required by law where I live, if higher). If I am not legally able to enter this agreement on my own, I confirm that my parent or legal guardian has reviewed and agreed to these Terms.`

Store Terms version, Privacy version, account ID, timestamp, and sufficient event metadata to prove the acceptance without collecting unnecessary data.

## Required subscription consent

Before starting a trial, show the exact selected plan, $0 due today, exact trial end/first-charge date, first charge, tax treatment, recurring interval, auto-renewal statement, and direct cancellation method.

Unchecked checkbox:

`I understand that my 7-day Blundr Pro trial requires a payment method and will automatically convert to the plan I selected on the date shown above unless I cancel before then.`

Store selected plan, price/currency shown, trial dates, disclosure version, subscription-terms version, timestamp, and consent event.

## Privacy controls required before global launch

- Account deletion path.
- Privacy request path at privacy@blundr.io.
- Data export/access process.
- Correction process for profile data.
- Cookie/analytics preference center.
- Reject non-essential analytics as easily as accepting it where prior consent is required.
- No optional analytics before consent in EEA/UK and other jurisdictions requiring prior consent.
- Accurate live cookie inventory.
- Data retention/deletion jobs matching the Privacy Policy.
- Processor/data-processing agreements for infrastructure and billing providers.
- International-transfer safeguards where required.

## Subscription controls required

- Server-authoritative entitlement status.
- Stripe (or equivalent) checkout and webhooks with idempotency.
- Trial eligibility enforcement.
- Subscription confirmation email.
- Trial reminder email.
- Renewal reminders.
- Cancellation endpoint/portal that can be completed online.
- Cancellation confirmation.
- Refund workflow for voluntary 14-day first-charge and annual-renewal windows plus statutory rights.
- Graceful downgrade preserving all chess data.
- Price-change notice workflow.
- Consent evidence retained with billing records.

## Tax / merchant compliance

For direct global web sales, tax calculation alone is not the same as tax registration and remittance. Configure the payment/tax stack for sales tax, VAT, GST, and similar obligations in jurisdictions where Blundr sells. If a merchant-of-record provider is used, the checkout and Legal Notice must identify the actual seller/merchant of record where required.

## International representation

If the Operator is not established in the EEA and actively offers the Service to people in the EEA, determine and implement any required EU GDPR Article 27 representative. If the Operator is outside the UK and actively offers the Service to people in the UK, determine and implement any required UK representative. Publish representative details in the Legal Notice/Privacy Policy when applicable.

## Two factual fields that cannot be invented

Before public launch, replace the two bracketed values in LEGAL_NOTICE.md with the actual legal operator name and actual business postal address. Add trade-register/VAT identifiers and EU/UK representative details if they actually apply. These are business facts, not wording decisions.

## Final pre-launch verification

Legal copy is only accurate if product behavior matches it. Commercial QA must verify: age gate; consent logging; trial disclosure; exact charge date; no prechecked boxes; Free path; plan choice; card collection; webhook entitlements; reminders; cancellation; refunds; downgrades; privacy request/delete/export; cookie consent; data retention; footer/legal links; tax display; and no marketing claims that exceed actual product behavior.
