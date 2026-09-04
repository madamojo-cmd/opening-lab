import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import test from "node:test";

const runtimeFiles = globSync("{app,components,lib,supabase}/**/*.{ts,tsx,sql}", {
  exclude: (file) =>
    file.includes("/__tests__/") ||
    file.endsWith(".test.ts") ||
    file.endsWith(".test.tsx"),
});

test("user-controlled Auth metadata is not an entitlement or RLS authority", () => {
  const forbiddenRuntimeMetadata = [] as string[];
  const planIntentFiles = [] as string[];

  for (const file of runtimeFiles) {
    const source = readFileSync(file, "utf8");
    if (/\bis_pro\b/.test(source)) forbiddenRuntimeMetadata.push(file);
    if (/blundr_launch_plan_intent/.test(source)) {
      planIntentFiles.push(file);
      assert.doesNotMatch(
        source,
        /blundr_launch_plan_intent[\s\S]{0,240}\b(?:entitlement|billing|checkout|rls|policy|service_role|api access)\b/i,
        `${file} must keep launch plan intent informational only`,
      );
    }
  }

  assert.deepEqual(forbiddenRuntimeMetadata, []);
  assert.deepEqual(planIntentFiles.sort(), [
    "lib/blundr/accounts/accountSession.ts",
    "lib/blundr/onboarding/onboardingV11.ts",
  ]);
});

test("service-role Supabase clients stay in server-owned modules", () => {
  const clientFiles = runtimeFiles.filter((file) =>
    readFileSync(file, "utf8").includes("createBlundrSupabaseAdminClient"),
  );
  for (const file of clientFiles) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /^"use client";|^'use client';/m, file);
    assert.ok(
      file.endsWith(".server.ts") ||
        file.includes("/api/") ||
        source.includes("server-only") ||
        file === "lib/blundr/backend/supabaseAdminClient.ts",
      `${file} must be server-only before using the admin client`,
    );
  }
});
