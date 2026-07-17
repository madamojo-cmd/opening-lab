import assert from "node:assert/strict";
import { appBaseUrl, appCta, pageMetadata, safeSource, seo } from "../lib/site";

process.env.PUBLIC_APP_BASE_URL = "https://app.blundr.io";
assert.equal(appBaseUrl().origin, "https://app.blundr.io");
process.env.PUBLIC_APP_BASE_URL = "https://blundr-staging-qsmvfjmtn-adamconnor00-gmailcoms-projects.vercel.app";
assert.equal(
  appBaseUrl().origin,
  "https://blundr-staging-qsmvfjmtn-adamconnor00-gmailcoms-projects.vercel.app",
);
process.env.PUBLIC_APP_BASE_URL = "https://unrelated-preview.vercel.app";
assert.throws(() => appBaseUrl(), /approved Blundr app origin/);
process.env.PUBLIC_APP_BASE_URL = "https://unapproved.example";
assert.throws(() => appBaseUrl(), /approved Blundr app origin/);
process.env.PUBLIC_APP_BASE_URL = "https://app.blundr.io";
assert.equal(appCta("/signup", "homepage"), "https://app.blundr.io/signup?source=homepage&next=%2Fonboarding%2Fwelcome");
assert.equal(new URL(appCta("/login", "not-allowed")).searchParams.get("source"), "direct");
assert.throws(() => appCta("https://evil.example/steal", "homepage"), /CTA path/);
assert.equal(safeSource("external"), "direct");
assert.equal(Object.keys(seo).length, 13);
for (const [path, [title, description]] of Object.entries(seo)) {
  const metadata = pageMetadata(path as keyof typeof seo, path === "/contact");
  assert.equal(metadata.title, title, `${path} title`);
  assert.equal(metadata.description, description, `${path} description`);
  assert.equal(metadata.alternates.canonical, `https://blundr.io${path === "/" ? "/" : path}`);
}
assert.equal(pageMetadata("/contact", true).robots.index, false);
console.log("marketing metadata, links, CTA, and route contract: PASS");
