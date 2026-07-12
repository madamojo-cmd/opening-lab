import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildAccountSettingsSnapshot } from "../../settings/accountSettingsState";
import { resetLocalAccountState } from "../../accounts/localAccountStorage";

const root = resolve(process.cwd());

function main(): void {
  assert.equal(existsSync(resolve(root, "app/profile/page.tsx")), true, "profile route module should exist");
  assert.equal(existsSync(resolve(root, "components/profile/ProfilePage.tsx")), true, "profile page component should exist");
  const routeSource = readFileSync(resolve(root, "app/profile/page.tsx"), "utf8");
  assert.match(routeSource, /BlundrBottomNav/);

  resetLocalAccountState();
  const signedOut = buildAccountSettingsSnapshot({ authSession: null, storage: null });
  assert.equal(signedOut.isAuthenticated, false);
  assert.equal(signedOut.isLocalDemo, true);
  assert.equal(signedOut.user.accessToken, null);
  assert.equal(signedOut.user.email, null);

  const authenticated = buildAccountSettingsSnapshot({
    authSession: { userId: "user-1", email: "player@example.com", accessToken: "test-token" },
    storage: null,
  });
  assert.equal(authenticated.isAuthenticated, true);
  assert.equal(authenticated.email, "player@example.com");
  assert.equal(authenticated.user.accessToken, "test-token");
  assert.equal(routeSource.includes("accessToken"), false, "profile route must not render session secrets");
}

main();
console.log("profileRoute.test.ts passed");
