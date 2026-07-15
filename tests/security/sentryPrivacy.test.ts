import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("Sentry integration is bounded, private, and build-secret only", () => {
  const nextConfig = read("next.config.ts");
  const client = read("instrumentation-client.ts");
  const server = read("sentry.server.config.ts");
  const edge = read("sentry.edge.config.ts");
  const instrumentation = read("instrumentation.ts");

  assert.match(nextConfig, /withSentryConfig/);
  assert.match(nextConfig, /process\.env\.SENTRY_ORG/);
  assert.match(nextConfig, /process\.env\.SENTRY_PROJECT/);
  assert.doesNotMatch(nextConfig, /org:\s*["']/);
  assert.doesNotMatch(nextConfig, /project:\s*["']/);
  assert.match(nextConfig, /SENTRY_AUTH_TOKEN/);
  for (const source of [client, server, edge]) {
    assert.match(source, /sendDefaultPii:\s*false/);
    assert.match(source, /enableLogs:\s*false/);
    assert.match(source, /tracesSampleRate/);
  }
  assert.match(instrumentation, /captureRequestError/);
});

test("privacy route contains approved disclosures and no unresolved placeholders", () => {
  const page = read("app/privacy/page.tsx");
  for (const required of [
    "Effective date: July 15, 2026",
    "Sentry",
    "Chess.com",
    "Lichess",
    "We never request or store your Chess.com or Lichess password",
    "Disconnecting a provider",
    "support@blundr.io",
    "Children's Privacy",
  ])
    assert.match(
      page,
      new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  assert.doesNotMatch(page, /TODO|TBD|REPLACE_ME|mailing address placeholder/i);
});

test("provider and settings surfaces link to the privacy route", () => {
  assert.match(
    read("components/settings/SettingsPage.tsx"),
    /href="\/privacy"/,
  );
  assert.match(
    read("components/settings/gameData/ConnectedGameDataPanel.tsx"),
    /href="\/privacy"/,
  );
  assert.match(
    read("components/settings/gameData/DisconnectGameDataDialog.tsx"),
    /href="\/privacy"/,
  );
});
