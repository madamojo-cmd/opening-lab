import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

const appAuthForm = read("components/auth/AppAuthForm.tsx");
const passwordField = read("components/auth/PasswordField.tsx");
const forgotPasswordForm = read("components/auth/ForgotPasswordForm.tsx");
const resetPasswordForm = read("components/auth/ResetPasswordForm.tsx");
const settingsPage = read("components/settings/SettingsPage.tsx");
const onboardingSave = read(
  "components/onboarding/AccountSaveProgressScreen.tsx",
);

assert.ok(appAuthForm.includes("Forgot password?"));
assert.ok(appAuthForm.includes("PasswordField"));
assert.ok(forgotPasswordForm.includes("requestPasswordResetForOnboarding"));
assert.ok(resetPasswordForm.includes("completePasswordResetForOnboarding"));
assert.ok(settingsPage.includes("PasswordField"));
assert.ok(onboardingSave.includes("PasswordField"));
assert.ok(passwordField.includes("Show password"));
assert.ok(passwordField.includes("Hide password"));

console.log("passwordRecoveryUi.test.ts passed");
