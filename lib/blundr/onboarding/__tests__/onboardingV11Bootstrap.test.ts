import assert from "node:assert/strict";
import test from "node:test";

import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import { ensureOnboardingV11Profile } from "../onboardingV11";

type FakeProfileRow = Record<string, unknown>;

function createUser(id = "11111111-1111-4111-8111-111111111111") {
  return {
    userId: id,
    mode: "authenticated",
    isAuthenticated: true,
    isAdmin: false,
    accessToken: "test-access-token",
    age13Confirmed: false,
  } satisfies CurrentBlundrUser;
}

function createProfileClient(options: {
  staleInitialSelects?: number;
  insertError?: { code?: string; constraint?: string };
}) {
  const rows = new Map<string, FakeProfileRow>();
  const stats = { inserts: 0, selects: 0, updates: 0 };
  let staleInitialSelects = options.staleInitialSelects ?? 0;

  function from(table: string) {
    assert.equal(table, "blundr_user_profiles");
    const query = {
      mode: "select" as "select" | "insert" | "update",
      filters: new Map<string, unknown>(),
      payload: null as FakeProfileRow | null,
      select() {
        return this;
      },
      eq(column: string, value: unknown) {
        this.filters.set(column, value);
        return this;
      },
      insert(payload: FakeProfileRow) {
        this.mode = "insert";
        this.payload = payload;
        return this;
      },
      update(payload: FakeProfileRow) {
        this.mode = "update";
        this.payload = payload;
        return this;
      },
      async maybeSingle() {
        stats.selects += 1;
        if (staleInitialSelects > 0) {
          staleInitialSelects -= 1;
          return { data: null, error: null };
        }
        const userId = String(this.filters.get("user_id") ?? "");
        return { data: rows.get(userId) ?? null, error: null };
      },
      async single() {
        const userId = String(
          this.filters.get("user_id") ?? this.payload?.user_id ?? "",
        );
        if (this.mode === "insert") {
          stats.inserts += 1;
          if (options.insertError) {
            return { data: null, error: options.insertError };
          }
          if (rows.has(userId)) {
            return {
              data: null,
              error: {
                code: "23505",
                constraint: "blundr_user_profiles_pkey",
              },
            };
          }
          const row = { ...this.payload, durable_marker: "winning_insert" };
          rows.set(userId, row);
          return { data: row, error: null };
        }
        if (this.mode === "update") {
          stats.updates += 1;
          const existing = rows.get(userId);
          if (!existing) return { data: null, error: null };
          const updated = { ...existing, ...this.payload };
          rows.set(userId, updated);
          return { data: updated, error: null };
        }
        return { data: rows.get(userId) ?? null, error: null };
      },
    };
    return query;
  }

  return {
    client: { from },
    rows,
    stats,
  };
}

test("V11 profile bootstrap recovers concurrent first-login duplicate inserts", async () => {
  const user = createUser();
  const { client, rows, stats } = createProfileClient({
    staleInitialSelects: 4,
  });

  const results = await Promise.all([
    ensureOnboardingV11Profile(user, client),
    ensureOnboardingV11Profile(user, client),
    ensureOnboardingV11Profile(user, client),
    ensureOnboardingV11Profile(user, client),
  ]);

  assert.equal(stats.inserts, 4);
  assert.equal(rows.size, 1);
  for (const row of results) {
    assert.ok(row);
    assert.equal(row.user_id, user.userId);
    assert.equal(row.onboarding_completed, false);
    assert.equal(row.onboarding_step, "welcome");
    assert.equal(row.durable_marker, "winning_insert");
  }
  assert.equal(rows.get(user.userId)?.durable_marker, "winning_insert");
  assert.equal(stats.updates, 0);
});

test("V11 profile bootstrap still fails closed on non-duplicate insert errors", async () => {
  const user = createUser();
  const { client } = createProfileClient({
    staleInitialSelects: 1,
    insertError: { code: "42501", constraint: "not_logged" },
  });
  const logged: unknown[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    logged.push(args);
  };
  try {
    await assert.rejects(
      () => ensureOnboardingV11Profile(user, client),
      /onboarding_persistence_unavailable/,
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(logged.length, 1);
  assert.deepEqual(logged[0], [
    "blundr_onboarding_persistence_failure",
    { operation: "insert", code: "42501", constraint: "not_logged" },
  ]);
});
