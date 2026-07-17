export const SITE_URL = "https://blundr.io";
export const SUPPORT_EMAIL = "support@blundr.io";

const allowedSources = new Set(["homepage", "features", "how-it-works", "pricing", "daily-blundr", "minigames", "affiliate", "direct"]);

function isApprovedAppHost(hostname: string): boolean {
  return (
    hostname === "app.blundr.io" ||
    hostname === "blundr-staging.vercel.app" ||
    hostname === "staging.blundr.io" ||
    /^blundr-staging-[a-z0-9-]+\.vercel\.app$/i.test(hostname)
  );
}

export function appBaseUrl(): URL {
  const raw = process.env.PUBLIC_APP_BASE_URL ?? "http://localhost:3000";
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("PUBLIC_APP_BASE_URL must be an absolute URL"); }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !local) throw new Error("PUBLIC_APP_BASE_URL must use HTTPS outside local development");
  if (!local && !isApprovedAppHost(url.hostname)) throw new Error("PUBLIC_APP_BASE_URL is not an approved Blundr app origin");
  if (url.username || url.password || url.search || url.hash) throw new Error("PUBLIC_APP_BASE_URL must be an origin without credentials or query parameters");
  return new URL(url.origin);
}

export function safeSource(source?: string): string { return source && allowedSources.has(source) ? source : "direct"; }

export function appCta(path = "/signup", source = "direct"): string {
  const url = new URL(path, appBaseUrl());
  if (url.origin !== appBaseUrl().origin || !url.pathname.startsWith("/")) throw new Error("CTA path must stay on the app origin");
  url.searchParams.set("source", safeSource(source));
  if (path === "/signup") url.searchParams.set("next", "/onboarding/welcome");
  return url.toString();
}

export const seo = {
  "/": ["Blundr | Personalized Chess Training From Your Games", "Turn your Chess.com or Lichess games into a personalized daily chess training plan for openings, recurring mistakes, review, and real mastery."],
  "/features": ["Chess Training Built From Your Real Games | Blundr", "Explore Daily Blundr, real-game findings, repertoire training, spaced review, Mastery Map insights, and focused chess minigames."],
  "/how-it-works": ["How Blundr Turns Your Chess Games Into Daily Training", "See how Blundr connects your games, identifies recurring weaknesses, builds targeted activities, schedules review, and tracks opening mastery."],
  "/pricing": ["Blundr Pricing | Free and Pro Chess Training", "Start with useful free chess training or unlock complete personalization, unlimited review, all openings, both providers, every premium Daily activity, and all three production minigames with Blundr Pro."],
  "/daily-blundr": ["Daily Blundr | Personalized Daily Chess Training", "Build a repeatable chess-training habit with opening Tempo reps, continuation Battery positions, and Daily Blundr spaced review."],
  "/minigames": ["Chess Training Minigames for Focused Practice | Blundr", "Practice calculation, visualization, and pawn endings with Deep Tactic Shots, Knight Gymnasium, and King & Pawn Lab."],
  "/support": ["Blundr Support | Accounts, Billing and Game Imports", "Get help with your Blundr account, Chess.com or Lichess imports, subscriptions, privacy, provider-data deletion, and account deletion."],
  "/contact": ["Contact Blundr Support", "Contact Blundr for account, provider-import, subscription, privacy, deletion, or technical support."],
  "/privacy": ["Blundr Privacy Notice", "Learn how Blundr handles account, training, imported-game, provider, subscription, analytics, and support data."],
  "/terms": ["Blundr Terms of Service", "Review the eligibility, account, acceptable-use, provider, intellectual-property, subscription, disclaimer, and termination terms for Blundr."],
  "/subscription-terms": ["Blundr Subscription Terms", "Review Blundr Pro pricing, trial, renewal, cancellation, billing, refund, and subscription-management terms."],
  "/acceptable-use": ["Blundr Acceptable Use Policy", "Review prohibited automation, abuse, exploitation, interference, unauthorized access, and other unacceptable uses of Blundr."],
  "/account-deletion": ["Delete Your Blundr Account", "Learn how to permanently delete your Blundr account, training history, imported-game data, and connected-provider information."]
} as const;

export function pageMetadata(path: keyof typeof seo, noindex = false) {
  const [title, description] = seo[path];
  const preview = process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development";
  return { title, description, alternates: { canonical: `${SITE_URL}${path === "/" ? "/" : path}` }, robots: noindex || preview ? { index: false, follow: false } : { index: true, follow: true }, openGraph: { title, description, url: `${SITE_URL}${path}`, siteName: "Blundr", type: "website" }, twitter: { card: "summary", title, description } };
}
