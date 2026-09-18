export const MARKETING_ROUTES = {
  signup: "/signup?next=/onboarding/welcome",
  login: "/login",
  upgrade: "/billing/upgrade",
  pricing: "/pricing",
  privacy: "/privacy",
  terms: "/terms",
  subscriptionTerms: "/subscription-terms",
  cookies: "/cookies",
  legal: "/legal",
} as const;

export const SECTION_IDS = {
  why: "why-blundr",
  daily: "daily-blundr",
  review: "smart-review",
  repertoire: "repertoire-mastery",
  consistency: "consistency",
  momentum: "momentum",
  pricing: "pricing",
  finalCta: "final-cta",
} as const;

export const NAV_ITEMS = [
  ["Why Blundr", SECTION_IDS.why], ["Daily", SECTION_IDS.daily],
  ["Review", SECTION_IDS.review], ["Repertoire", SECTION_IDS.repertoire],
  ["Plans", SECTION_IDS.pricing],
] as const;

export const PRICING_PLANS = [
  {
    key: "free", label: "Free", title: "Build the habit", price: "$0",
    description: "Build a focused repertoire at no cost.", cta: "Start training free",
    href: MARKETING_ROUTES.signup,
    features: ["Up to 3 active openings", "20 Tempo runs per day", "5 Daily Blundr cards per local day", "5 Review positions per local day", "Daily rings and rewards", "Core repertoire progress"],
  },
  {
    key: "pro", label: "Pro", title: "Remove the limits", price: "$9.99/month",
    secondaryPrice: "$69.99/year", description: "Eligible users can start with a 7-day free trial.",
    cta: "Start 7-day free trial", href: MARKETING_ROUTES.upgrade,
    features: ["Unlimited active repertoire", "Unlimited Tempo training", "Daily target adjustable from 1–99", "Unlimited Review", "Daily rings and rewards", "Deeper mastery, weakness, trend, and next-action insights"],
  },
] as const;

export const FOOTER_GROUPS = {
  Product: [["Why Blundr", `#${SECTION_IDS.why}`], ["Daily Blundr", `#${SECTION_IDS.daily}`], ["Review", `#${SECTION_IDS.review}`], ["Repertoire", `#${SECTION_IDS.repertoire}`], ["Pricing", `#${SECTION_IDS.pricing}`]],
  Account: [["Start training free", MARKETING_ROUTES.signup], ["Log in", MARKETING_ROUTES.login]],
  Legal: [["Privacy", MARKETING_ROUTES.privacy], ["Terms", MARKETING_ROUTES.terms], ["Subscription Terms", MARKETING_ROUTES.subscriptionTerms], ["Cookies", MARKETING_ROUTES.cookies], ["Legal Notice", MARKETING_ROUTES.legal]],
} as const;
