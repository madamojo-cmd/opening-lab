import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type { BlundrProfilePublic } from "./profileTypes";

export async function readBlundrProfile(
  userId: string,
): Promise<BlundrProfilePublic> {
  const client = createBlundrSupabaseAdminClient();
  if (!client) return { username: null };
  const { data } = await client
    .from("blundr_user_profiles")
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    username: typeof data?.username === "string" ? data.username : null,
  };
}

export async function claimBlundrUsername(
  userId: string,
  username: string,
  normalizedUsername: string,
): Promise<BlundrProfilePublic | { conflict: true }> {
  const client = createBlundrSupabaseAdminClient();
  if (!client) return { conflict: true };
  const { data, error } = await client
    .from("blundr_user_profiles")
    .upsert(
      { user_id: userId, username, normalized_username: normalizedUsername },
      { onConflict: "user_id" },
    )
    .select("username")
    .maybeSingle();
  if (error || !data) {
    if (error?.code === "23505") return { conflict: true };
    throw new Error("profile_persistence_failed");
  }
  return { username: typeof data.username === "string" ? data.username : null };
}
