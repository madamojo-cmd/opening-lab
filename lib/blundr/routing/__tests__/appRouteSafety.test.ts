import assert from "node:assert/strict";

import { normalizeAppNext, resolveAppAuthNextTarget } from "../appRouteSafety";

assert.equal(resolveAppAuthNextTarget("login", undefined), "/");
assert.equal(resolveAppAuthNextTarget("signup", undefined), "/onboarding/welcome");
assert.equal(resolveAppAuthNextTarget("login", "/train"), "/train");
assert.equal(resolveAppAuthNextTarget("signup", "/onboarding/welcome"), "/onboarding/welcome");
assert.equal(normalizeAppNext("relative/path"), "/onboarding/welcome");
assert.equal(normalizeAppNext("/good/path", "/"), "/good/path");

console.log("appRouteSafety.test.ts passed");
