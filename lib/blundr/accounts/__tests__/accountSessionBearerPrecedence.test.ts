import assert from "node:assert/strict";
import test from "node:test";

import { getCurrentBlundrUser } from "../accountSession";

const ENV_KEYS = [
  "NEXT_PUBLIC_BLUNDR_STORAGE_MODE",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function preserveEnv() {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv(previous: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    const value = previous[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test("a bearer request never falls back to the local demo identity", async () => {
  const previous = preserveEnv();
  try {
    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const request = new Request("https://app.example/api/protected", {
      headers: { authorization: "Bearer invalid-test-token" },
    });

    assert.equal(
      await getCurrentBlundrUser({ request, allowLocalFallback: true }),
      null,
    );
  } finally {
    restoreEnv(previous);
  }
});

test("an uncredentialed local-demo request can still use the explicit fallback", async () => {
  const previous = preserveEnv();
  try {
    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
    const user = await getCurrentBlundrUser({
      request: new Request("https://app.example/local"),
      allowLocalFallback: true,
    });

    assert.equal(user?.mode, "local_demo");
    assert.equal(user?.isAuthenticated, false);
  } finally {
    restoreEnv(previous);
  }
});
