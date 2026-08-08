import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

type MigrationSource = {
  file: string;
  sql: string;
};

const pr01LearningMigration =
  "20260805120000_blundr_learning_daily_authority_v2.sql";
const pr01RewardsMigration =
  "20260805130000_blundr_rewards_inventory_presentations_v2.sql";
const pr01MigrationFiles = [pr01LearningMigration, pr01RewardsMigration];

function assertContract(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(`PR-01 migration contract: ${message}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function functionPrivilegePattern(
  action: "revoke all" | "grant execute",
  signature: string,
  grantees: string,
): RegExp {
  return new RegExp(
    `${action}\\s+on\\s+function\\s+public\\.${escapeRegExp(signature)}\\s+${
      action === "revoke all" ? "from" : "to"
    }\\s+${grantees}\\s*;`,
    "i",
  );
}

function assertServiceOnlyRpc(sql: string, signature: string): void {
  assertContract(
    functionPrivilegePattern(
      "revoke all",
      signature,
      "public\\s*,\\s*anon\\s*,\\s*authenticated",
    ).test(sql),
    `${signature} must revoke PUBLIC, anon, and authenticated execution.`,
  );
  assertContract(
    functionPrivilegePattern("grant execute", signature, "service_role").test(
      sql,
    ),
    `${signature} must grant execution only to service_role.`,
  );
  assertContract(
    !functionPrivilegePattern(
      "grant execute",
      signature,
      "(?:public|anon|authenticated)",
    ).test(sql),
    `${signature} must not grant browser roles execution.`,
  );
}

function assertCreatedTablesEnableRls(sql: string, file: string): void {
  const tables = [
    ...sql.matchAll(
      /create\s+table\s+if\s+not\s+exists\s+public\.([a-z0-9_]+)/gi,
    ),
  ].map((match) => match[1]);
  for (const table of tables) {
    assertContract(
      new RegExp(
        `alter\\s+table\\s+public\\.${escapeRegExp(table)}\\s+enable\\s+row\\s+level\\s+security\\s*;`,
        "i",
      ).test(sql),
      `${file} creates ${table} without explicit RLS enablement.`,
    );
  }
}

function assertPr01Contracts(migrations: MigrationSource[]): void {
  const byFile = new Map(
    migrations.map((migration) => [migration.file, migration.sql]),
  );
  const learning = byFile.get(pr01LearningMigration);
  const rewards = byFile.get(pr01RewardsMigration);
  assertContract(learning, `missing ${pr01LearningMigration}.`);
  assertContract(rewards, `missing ${pr01RewardsMigration}.`);

  const names = migrations.map((migration) => migration.file);
  const priorIndex = names.indexOf(
    "20260804130000_blundr_server_authoritative_rewards.sql",
  );
  const learningIndex = names.indexOf(pr01LearningMigration);
  const rewardsIndex = names.indexOf(pr01RewardsMigration);
  assertContract(
    priorIndex !== -1,
    "missing the required 20260804130000 ancestry migration.",
  );
  assertContract(
    learningIndex === priorIndex + 1 && rewardsIndex === learningIndex + 1,
    "PR-01 migrations must be the contiguous forward successors of 20260804130000 in learning-then-rewards order.",
  );

  for (const { file, sql } of migrations.filter((migration) =>
    pr01MigrationFiles.includes(migration.file),
  )) {
    assertCreatedTablesEnableRls(sql, file);
    assertContract(
      !/\b(?:drop\s+(?:table|column|schema|database)|truncate|delete\s+from)\b/i.test(
        sql,
      ),
      `${file} contains a destructive storage operation; PR-01 is expand-only.`,
    );
    assertContract(
      !/alter\s+table[\s\S]*?\b(?:rename|alter\s+column[\s\S]*?\btype|alter\s+column[\s\S]*?\bset\s+not\s+null)\b/i.test(
        sql,
      ),
      `${file} contains a non-compatible table rewrite; PR-01 must preserve old application reads and writes.`,
    );
  }

  for (const signature of [
    "blundr_project_learning_evidence_v2(uuid, jsonb)",
    "blundr_reserve_daily_v2(uuid, date, jsonb)",
    "blundr_commit_daily_action_v2(uuid, text, jsonb)",
  ]) {
    assertServiceOnlyRpc(learning, signature);
  }
  for (const signature of [
    "blundr_apply_reward_transaction_v2(uuid, text, text, text, text, text, text)",
    "blundr_spend_inventory_and_unlock_v2(uuid, text, text, text, text)",
  ]) {
    assertServiceOnlyRpc(rewards, signature);
  }

  assertContract(
    /create\s+policy\s+blundr_learning_events_insert_legacy_own[\s\S]*?evidence_kind\s*=\s*'legacy_unclassified'[\s\S]*?first_attempt\s*=\s*false/i.test(
      learning,
    ),
    "learning migration must retain a flags-off legacy insert compatibility policy.",
  );
  assertContract(
    /default\s+'legacy-unclassified'/i.test(learning) &&
      /learning_projection_authority_not_implemented/i.test(learning) &&
      /daily_reservation_authority_not_implemented/i.test(learning) &&
      /daily_action_authority_not_implemented/i.test(learning),
    "learning v2 authority shells must fail closed while flags remain off.",
  );
  assertContract(
    /blundr_rewards_v2_transaction_unavailable/i.test(rewards) &&
      /blundr_rewards_v2_inventory_unlock_unavailable/i.test(rewards),
    "reward v2 authority shells must fail closed while flags remain off.",
  );

  const rewardTables = [
    "blundr_reward_transactions_v2",
    "blundr_reward_grants_v2",
    "blundr_reward_inventory_v2",
    "blundr_reward_inventory_events_v2",
    "blundr_reward_presentations_v2",
  ];
  for (const table of rewardTables) {
    assertContract(
      new RegExp(
        `create\\s+policy\\s+${escapeRegExp(table)}_select_own[\\s\\S]*?user_id\\s*=\\s*auth\\.uid\\(\\)`,
        "i",
      ).test(rewards),
      `${table} must have an authenticated own-row SELECT policy.`,
    );
    assertContract(
      !new RegExp(
        `create\\s+policy\\s+${escapeRegExp(table)}_(?:insert|update|delete)`,
        "i",
      ).test(rewards),
      `${table} must not add a browser write policy before PR-03.`,
    );
  }

  for (const domain of [
    "learning_imported_observations",
    "learning_canonical_coordinates",
    "user_iana_time_zones",
    "daily_reservation_identity",
  ]) {
    assertContract(
      new RegExp(`'${domain}'`).test(learning),
      `backfill report is missing required ${domain} accounting.`,
    );
  }
  assertContract(
    (
      learning.match(
        /on\s+conflict\s*\(\s*migration_id\s*,\s*domain\s*\)\s*do\s+nothing/gi,
      ) ?? []
    ).length === 5 &&
      !/on\s+conflict\s*\(\s*migration_id\s*,\s*domain\s*\)\s*do\s+update/i.test(
        learning,
      ),
    "migration-time backfill reports must preserve their original deterministic accounting with ON CONFLICT DO NOTHING.",
  );
  for (const ownershipContract of [
    "blundr_daily_sessions_deck_owner_fk",
    "blundr_daily_attempts_session_owner_fk",
  ]) {
    assertContract(
      new RegExp(
        `${ownershipContract}[\\s\\S]*?foreign\\s+key[\\s\\S]*?on\\s+delete\\s+cascade[\\s\\S]*?not\\s+valid`,
        "i",
      ).test(learning),
      `${ownershipContract} must reject new cross-user Daily parents without fabricating legacy repair.`,
    );
  }
  assertContract(
    /create\s+trigger\s+blundr_learning_daily_backfill_reports_immutable\s+before\s+insert\s+or\s+update\s+or\s+delete/i.test(
      learning,
    ) &&
      /blundr_learning_daily_backfill_reports rows are immutable/i.test(
        learning,
      ),
    "migration-time backfill reports must reject service-authority insert, update, and delete mutations.",
  );
  assertContract(
    /source\s*=\s*(?:'imported_game'|imported_game)\s*->\s*imported_observation;\s*first_attempt=false/i.test(
      learning,
    ) &&
      /opening_id\s+is\s+null\s+or\s+move_order_key\s+is\s+null/i.test(
        learning,
      ) &&
      /time_zone\s+is\s+null/i.test(learning) &&
      /legacy reservations retain their stored identity; policy\/timezone are not inferred/i.test(
        learning,
      ),
    "backfill reporting must retain explicit unresolved rows and avoid invented identity.",
  );
  assertContract(
    !/update\s+public\.blundr_learning_events[\s\S]*?\b(?:opening_id|move_order_key|played_move_uci)\s*=/i.test(
      learning,
    ) &&
      !/update\s+public\.blundr_node_mastery[\s\S]*?mastery_state\s*=/i.test(
        learning,
      ),
    "backfill must not fabricate canonical coordinates, played moves, or mastery state.",
  );

  assertContract(
    /(?:unique\s*\(\s*id\s*,\s*user_id\s*\)|unique\s*\(\s*user_id\s*,\s*id\s*\))/i.test(
      rewards,
    ),
    "reward transactions must expose a composite transaction/user identity for child ownership foreign keys.",
  );
  for (const childTable of [
    "blundr_reward_grants_v2",
    "blundr_reward_inventory_events_v2",
    "blundr_reward_presentations_v2",
  ]) {
    assertContract(
      new RegExp(
        `create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${childTable}[\\s\\S]*?foreign\\s+key\\s*\\(\\s*transaction_id\\s*,\\s*user_id\\s*\\)\\s*references\\s+public\\.blundr_reward_transactions_v2\\s*\\(\\s*id\\s*,\\s*user_id\\s*\\)\\s*on\\s+delete\\s+cascade`,
        "i",
      ).test(rewards),
      `${childTable} must enforce matching transaction and user ownership with a cascade-safe composite foreign key.`,
    );
  }
}

async function main() {
  const directory = path.resolve("supabase/migrations");
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  if (!files.length) throw new Error("No migration files found.");
  const versions = files.map((file) => file.split("_")[0]);
  if (new Set(versions).size !== versions.length)
    throw new Error(`Duplicate migration version: ${versions.join(", ")}`);
  const checksums: string[] = [];
  const migrations: MigrationSource[] = [];
  for (const file of files) {
    const sql = await readFile(path.join(directory, file), "utf8");
    if (!sql.trim()) throw new Error(`Empty migration: ${file}`);
    if (
      /\bDROP\s+DATABASE\b|\bTRUNCATE\b|\bDROP\s+TABLE\b|\bDROP\s+COLUMN\b/i.test(
        sql,
      )
    )
      throw new Error(`Destructive migration operation: ${file}`);
    assertCreatedTablesEnableRls(sql, file);
    migrations.push({ file, sql });
    checksums.push(createHash("sha256").update(sql).digest("hex"));
  }
  assertPr01Contracts(migrations);
  console.log(
    `Verified ${files.length} local migrations (static ancestry, expand-only, RLS, RPC, compatibility, and backfill contracts only; no database apply was attempted). checksum=${createHash("sha256").update(checksums.join("\n")).digest("hex")}`,
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
