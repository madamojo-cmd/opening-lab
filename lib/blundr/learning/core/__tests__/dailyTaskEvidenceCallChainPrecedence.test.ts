import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../../../../../");
const migration31 = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806160000_blundr_daily_task_evidence_call_chain_v3.sql",
  ),
  "utf8",
);
const migration32 = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806170000_blundr_daily_action_v3_normalized_handoff.sql",
  ),
  "utf8",
);
const migration33 = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806180000_blundr_daily_action_v3_retry_nulling.sql",
  ),
  "utf8",
);
const migration34 = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806190000_blundr_daily_action_v3_json_null_contract.sql",
  ),
  "utf8",
);
const migration35 = readFileSync(
  resolve(
    root,
    "supabase/migrations/20260806200000_blundr_daily_action_v3_duplicate_idempotency.sql",
  ),
  "utf8",
);

test("Daily task evidence call-chain precedence stays scalar-safe", () => {
  assert.match(
    migration31,
    /'daily-task-evidence:' \|\| p_session_id \|\| ':' \|\| v_action_id/,
  );
  assert.match(migration31, /v_action_id := p_action->>'action_id'/);
  assert.match(
    migration31,
    /revoke all on function public\.blundr_commit_daily_action_v3_inner\(uuid, text, jsonb\) from public, anon, authenticated, service_role/,
  );
  assert.match(
    migration32,
    /return public\.blundr_commit_daily_action_v3_inner\(p_user_id, p_session_id, v_action\)/,
  );
  assert.match(
    migration33,
    /v_action := jsonb_set\(v_action, '\{learning_event\}', 'null'::jsonb, true\)/,
  );
  assert.match(
    migration34,
    /v_event := nullif\(v_action->'learning_event', 'null'::jsonb\)/,
  );
  assert.match(migration34, /v_event := nullif\(v_event, 'null'::jsonb\)/);
  assert.match(migration35, /daily_retry_cannot_reproject/);
  assert.match(
    migration35,
    /revoke all on function public\.blundr_commit_daily_action_v3_inner\(uuid, text, jsonb\) from public, anon, authenticated, service_role/,
  );
  assert.match(
    migration35,
    /grant execute on function public\.blundr_commit_daily_action_v3\(uuid, text, jsonb\) to service_role/,
  );
});
