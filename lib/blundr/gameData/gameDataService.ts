import "server-only";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { readUserRepertoire } from "@/lib/blundr/accounts/accountRepository";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { RepertoireOpeningAccessRepository } from "@/lib/blundr/openingAccess/openingAccessRepository";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import type { UserRepertoire } from "@/lib/blundr/accounts/accountTypes";
import { BLUNDR_PERSISTENCE_TABLES } from "@/lib/blundr/persistence/persistenceKeys";

function toOpeningAccessRepertoire(
  stored: UserRepertoire | null,
): RepertoireProgress | null {
  return stored
    ? {
        userId: stored.userId,
        selectedStarterPackId:
          stored.selectedStarterPackId ?? "classical_attacker",
        unlockedOpeningIds: stored.unlockedOpeningIds,
        lockedOpeningIds: stored.lockedOpeningIds,
        availablePoints: stored.openingUnlockPoints,
        lifetimePoints: stored.openingUnlockPoints,
        spentPoints: 0,
        nextUnlockCost: 0,
        nextUnlockProgressPct: 0,
        pointEvents: [],
        unlockEvents: [],
        updatedAt: stored.updatedAt,
      }
    : null;
}

export async function requireGameDataUser(
  request: Request,
): Promise<CurrentBlundrUser | null> {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  return user?.isAuthenticated ? user : null;
}

export async function loadOpeningAccess(user: CurrentBlundrUser) {
  const repertoireResult = await readUserRepertoire(user.userId, {
    user,
    allowLocalFallback: false,
  });
  const stored = repertoireResult.ok ? repertoireResult.data : null;
  const repertoire = toOpeningAccessRepertoire(stored);
  return new RepertoireOpeningAccessRepository(() => repertoire);
}

export async function loadOpeningAccessForWorker(userId: string) {
  const client = createBlundrSupabaseAdminClient();
  if (!client) throw new Error("provider_worker_persistence_unavailable");
  const result = await client
    .from(BLUNDR_PERSISTENCE_TABLES.userRepertoires)
    .select(
      "user_id,selected_starter_pack_id,unlocked_opening_ids,locked_opening_ids,opening_unlock_points,updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (result.error) throw new Error("provider_worker_repertoire_read_failed");
  const row = result.data;
  const stored: UserRepertoire | null = row
    ? {
        userId: String(row.user_id),
        selectedStarterPackId:
          row.selected_starter_pack_id as UserRepertoire["selectedStarterPackId"],
        unlockedOpeningIds: Array.isArray(row.unlocked_opening_ids)
          ? row.unlocked_opening_ids.map(String)
          : [],
        lockedOpeningIds: Array.isArray(row.locked_opening_ids)
          ? row.locked_opening_ids.map(String)
          : [],
        openingUnlockPoints: Math.max(
          0,
          Number(row.opening_unlock_points ?? 0),
        ),
        updatedAt: String(row.updated_at),
      }
    : null;
  return new RepertoireOpeningAccessRepository(() =>
    toOpeningAccessRepertoire(stored),
  );
}

export async function readGameDataStatus(userId: string) {
  const client = createBlundrSupabaseAdminClient();
  if (!client) return { accounts: [], jobs: [], gamesMatched: 0, findings: 0 };
  const [accounts, jobs, segments, findings] = await Promise.all([
    client
      .from("blundr_provider_accounts")
      .select(
        "provider,username,verification_state,last_successful_sync_at,next_eligible_sync_at,sanitized_error_code",
      )
      .eq("user_id", userId),
    client
      .from("blundr_game_import_jobs")
      .select(
        "provider,status,fetched_count,accepted_count,matched_count,gated_count,finding_count,error_code,updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10),
    client
      .from("blundr_game_opening_segments")
      .select("id")
      .eq("user_id", userId)
      .eq("access_state", "active"),
    client
      .from("blundr_learning_findings")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);
  return {
    accounts: accounts.data ?? [],
    jobs: jobs.data ?? [],
    gamesMatched: segments.data?.length ?? 0,
    findings: findings.data?.length ?? 0,
  };
}

export async function deleteGameData(userId: string, provider?: string) {
  const client = createBlundrSupabaseAdminClient();
  if (!client) return;
  let sourceGamesQuery = client
    .from("blundr_external_games")
    .select("provider_fingerprint,fallback_fingerprint")
    .eq("user_id", userId);
  if (provider) sourceGamesQuery = sourceGamesQuery.eq("provider", provider);
  const sourceGames = await sourceGamesQuery.then(
    (result) => result.data ?? [],
  );
  const fingerprints = sourceGames
    .map((row) => row.provider_fingerprint ?? row.fallback_fingerprint)
    .filter(Boolean);
  const affectedFindings = fingerprints.length
    ? await client
        .from("blundr_learning_findings")
        .select("position_key")
        .eq("user_id", userId)
        .in("game_fingerprint", fingerprints)
        .then((result) => result.data ?? [])
    : [];
  if (fingerprints.length) {
    await client
      .from("blundr_learning_findings")
      .delete()
      .eq("user_id", userId)
      .in("game_fingerprint", fingerprints);
    await client
      .from("blundr_game_opening_segments")
      .delete()
      .eq("user_id", userId)
      .in("game_fingerprint", fingerprints);
  }
  let gamesQuery = client
    .from("blundr_external_games")
    .delete()
    .eq("user_id", userId);
  if (provider) gamesQuery = gamesQuery.eq("provider", provider);
  await gamesQuery;
  let jobsQuery = client
    .from("blundr_game_import_jobs")
    .delete()
    .eq("user_id", userId);
  if (provider) jobsQuery = jobsQuery.eq("provider", provider);
  await jobsQuery;
  for (const row of affectedFindings) {
    const remaining = await client
      .from("blundr_learning_findings")
      .select("id")
      .eq("user_id", userId)
      .eq("position_key", row.position_key)
      .eq("status", "active")
      .limit(1);
    if (!remaining.data?.length) {
      await client
        .from("blundr_weakness_projection")
        .delete()
        .eq("user_id", userId)
        .eq("position_key", row.position_key);
    }
  }
}
