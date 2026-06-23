export const STAGE2_RUNTIME_OPENING_IDS = [
  "caro-kann-black",
  "colle-white",
  "english-white",
  "french-black",
  "italian-black",
  "italian-white",
  "kings-indian-black",
  "london-white",
  "nimzo-indian-black",
  "petroff-black",
  "pirc-black",
  "qgd-black",
  "queens-gambit-white",
  "queens-indian-black",
  "reti-white",
  "ruy-lopez-white",
  "scandinavian-black",
  "scotch-white",
  "sicilian-black",
  "slav-black",
  "vienna-white",
] as const;

export const STAGE2_RUNTIME_OPENING_ID_ALIASES: Record<string, string> = {
  "caro-black": "caro-kann-black",
  "qg-white": "queens-gambit-white",
  "qgd": "qgd-black",
  "ruy-white": "ruy-lopez-white",
};

const STAGE2_RUNTIME_OPENING_ID_SET = new Set<string>(STAGE2_RUNTIME_OPENING_IDS);

function normalizeOpeningId(value: string | null | undefined): string | null {
  const text = String(value ?? "").trim().toLowerCase();
  return text.length > 0 ? text : null;
}

export function resolveStage2CanonicalOpeningId(openingId: string | null | undefined): string | null {
  const normalized = normalizeOpeningId(openingId);
  if (!normalized) return null;
  const mapped = STAGE2_RUNTIME_OPENING_ID_ALIASES[normalized] ?? normalized;
  return STAGE2_RUNTIME_OPENING_ID_SET.has(mapped) ? mapped : null;
}

export type Stage2OpeningIdentityResolution = {
  selectedOpeningId: string | null;
  canonicalSelectedOpeningId: string | null;
  resolvedSelectedOpeningId: string | null;
  runtimeOpeningId: string | null;
  selectedOpeningRuntimeAvailable: boolean;
  openingIdentityMatched: boolean;
  openingIdentityMismatchReason: string | null;
};

export function resolveStage2OpeningIdentity(input: {
  selectedOpeningId: string | null | undefined;
  runtimeOpeningId?: string | null | undefined;
  selectedOpeningRuntimeAvailable?: boolean | null | undefined;
}): Stage2OpeningIdentityResolution {
  const selectedOpeningId = normalizeOpeningId(input.selectedOpeningId);
  const canonicalSelectedOpeningId = resolveStage2CanonicalOpeningId(selectedOpeningId);
  const resolvedSelectedOpeningId = canonicalSelectedOpeningId ?? selectedOpeningId;
  const runtimeOpeningId = normalizeOpeningId(input.runtimeOpeningId);
  const selectedOpeningRuntimeAvailable = Boolean(input.selectedOpeningRuntimeAvailable ?? (canonicalSelectedOpeningId ? true : false));

  let openingIdentityMismatchReason: string | null = null;
  if (!selectedOpeningId) {
    openingIdentityMismatchReason = "selected_opening_missing";
  } else if (!canonicalSelectedOpeningId) {
    openingIdentityMismatchReason = "selected_opening_not_resolved";
  } else if (selectedOpeningId !== canonicalSelectedOpeningId) {
    openingIdentityMismatchReason = "noncanonical_selected_opening";
  } else if (!selectedOpeningRuntimeAvailable) {
    openingIdentityMismatchReason = "selected_opening_runtime_unavailable";
  } else if (runtimeOpeningId && runtimeOpeningId !== canonicalSelectedOpeningId) {
    openingIdentityMismatchReason = "runtime_opening_mismatch";
  }

  const openingIdentityMatched =
    Boolean(canonicalSelectedOpeningId) &&
    selectedOpeningRuntimeAvailable &&
    Boolean(runtimeOpeningId) &&
    canonicalSelectedOpeningId === runtimeOpeningId;

  if (!openingIdentityMatched && !openingIdentityMismatchReason) {
    openingIdentityMismatchReason = "runtime_opening_mismatch";
  }

  return {
    selectedOpeningId,
    canonicalSelectedOpeningId,
    resolvedSelectedOpeningId,
    runtimeOpeningId,
    selectedOpeningRuntimeAvailable,
    openingIdentityMatched,
    openingIdentityMismatchReason,
  };
}
