import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const migration = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806110000_blundr_trainer_completion_authority_v2.sql",
  ),
  "utf8",
);
const tempoMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260918130000_blundr_free_tempo_daily_limit.sql",
  ),
  "utf8",
);

test("Trainer completion is a service-only session authority", () => {
  for (const contract of [
    "blundr_trainer_sessions_v2",
    "blundr_trainer_actions_v2",
    "on delete cascade",
    "enable row level security",
    "revoke all",
    "blundr_reserve_trainer_session_v2",
    "blundr_commit_trainer_action_v2",
    "to service_role",
    "from public, anon, authenticated",
  ]) {
    assert.match(migration, new RegExp(contract, "i"));
  }
});

test("Trainer action cursor and terminal reward evidence are fail closed", () => {
  for (const contract of [
    "trainer_session_stale_version",
    "trainer_cursor_not_current",
    "trainer_target_not_current",
    "trainer_learning_target_mismatch",
    "trainer_action_idempotency_conflict",
    "trainer_reveal_evidence_invalid",
    "blundr_project_learning_evidence_v2",
    "v_session.current_cursor [\\+] 1",
    "v_next_cursor = v_session.line_length",
    "terminal_completion_id",
  ]) {
    assert.match(migration, new RegExp(contract.replace(/[()]/g, "\\$&"), "i"));
  }
});

test("Trainer terminal evidence extends only the existing Rewards v2 writer", () => {
  assert.match(migration, /blundr_apply_reward_transaction_v2/);
  assert.match(migration, /terminal_completion_id=p_evidence_id/);
  assert.match(migration, /reward_v2_accepted_definition_mismatch/);
  assert.match(migration, /elsif p_source = 'opening_run_completed'/);
  assert.match(
    migration,
    /else\s+raise exception 'completion_evidence_unverified'/,
  );
  assert.doesNotMatch(
    migration,
    /opening-nodes|candidate-moves|blundr-opening-runtime/,
  );
});

test("billing-aware Trainer RPC preserves the unambiguous legacy overload", () => {
  const normalizedTempoMigration = tempoMigration.replace(/\s+/g, " ");
  assert.match(
    normalizedTempoMigration,
    /create or replace function public\.blundr_commit_trainer_action_v2\( p_user_id uuid, p_session_id text, p_action jsonb, p_billing_environment text \)/i,
  );
  assert.doesNotMatch(
    tempoMigration,
    /create or replace function public\.blundr_commit_trainer_action_v2\([\s\S]*p_billing_environment text default/i,
  );
  assert.match(
    normalizedTempoMigration,
    /return public\.blundr_commit_trainer_action_v2\( p_user_id, p_session_id, p_action \)/i,
  );
});
