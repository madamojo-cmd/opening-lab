import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type { CommercialAccess } from "./commercialAccess";
import { FREE_ACTIVE_OPENING_LIMIT, isTrustedProAccess } from "./commercialAccess";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? Array.from(new Set(value.map(text).filter(Boolean)))
    : [];
}

export async function loadFreeActiveOpeningPolicy(input: {
  userId: string;
  environment: "test" | "live";
  unlockedOpeningIds: readonly string[];
  access: CommercialAccess;
}): Promise<{
  activeOpeningIds: Set<string> | null;
  selectionRequired: boolean;
}> {
  if (isTrustedProAccess(input.access)) {
    return { activeOpeningIds: null, selectionRequired: false };
  }
  const unlocked = Array.from(new Set(input.unlockedOpeningIds.map(text).filter(Boolean)));
  if (unlocked.length <= FREE_ACTIVE_OPENING_LIMIT) {
    return { activeOpeningIds: new Set(unlocked), selectionRequired: false };
  }
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) return { activeOpeningIds: new Set(), selectionRequired: true };
  const selected = await admin
    .from("blundr_free_active_opening_selections")
    .select("active_opening_ids")
    .eq("user_id", input.userId)
    .eq("billing_environment", input.environment)
    .maybeSingle();
  if (selected.error) return { activeOpeningIds: new Set(), selectionRequired: true };
  const active = strings(selected.data?.active_opening_ids).filter((id) =>
    unlocked.includes(id),
  );
  if (active.length !== FREE_ACTIVE_OPENING_LIMIT) {
    return { activeOpeningIds: new Set(), selectionRequired: true };
  }
  return { activeOpeningIds: new Set(active), selectionRequired: false };
}

export async function saveFreeActiveOpeningSelection(input: {
  userId: string;
  environment: "test" | "live";
  unlockedOpeningIds: readonly string[];
  selectedOpeningIds: readonly string[];
  access: CommercialAccess;
}) {
  if (isTrustedProAccess(input.access)) return { ok: true as const };
  const unlocked = new Set(input.unlockedOpeningIds.map(text).filter(Boolean));
  const selected = Array.from(new Set(input.selectedOpeningIds.map(text).filter(Boolean)));
  if (
    selected.length !== Math.min(FREE_ACTIVE_OPENING_LIMIT, unlocked.size) ||
    selected.some((id) => !unlocked.has(id))
  ) {
    return { ok: false as const, error: "invalid_active_opening_selection" };
  }
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) return { ok: false as const, error: "active_opening_selection_unavailable" };
  const result = await admin
    .from("blundr_free_active_opening_selections")
    .upsert(
      {
        user_id: input.userId,
        billing_environment: input.environment,
        active_opening_ids: selected,
        selection_required: false,
        selected_at: new Date().toISOString(),
      },
      { onConflict: "user_id,billing_environment" },
    );
  if (result.error) return { ok: false as const, error: "active_opening_selection_unavailable" };
  return { ok: true as const };
}
