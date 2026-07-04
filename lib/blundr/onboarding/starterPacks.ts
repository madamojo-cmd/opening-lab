import type { StarterPackId, UserRepertoire } from "../accounts/accountTypes";
import { STAGE2_OPENING_AVAILABILITY_MATRIX, STAGE2_RUNTIME_OPENING_IDS, getStage2OpeningAvailability } from "../openings/openingAvailability";
import { resolveStage2CanonicalOpeningId } from "../openings/openingIdentity";

export type BlundrStarterPack = {
  id: StarterPackId;
  displayName: string;
  shortName: string;
  styleSummary: string;
  promise: string;
  whiteOpeningId: string;
  whiteOpeningName: string;
  blackOpeningId: string;
  blackOpeningName: string;
  styleTags: string[];
  recommendedFor: string[];
  relatedOpeningIds?: string[];
};

type StarterPackDefinition = {
  id: StarterPackId;
  displayName: string;
  shortName: string;
  styleSummary: string;
  promise: string;
  whiteOpeningCandidates: string[];
  blackOpeningCandidates: string[];
  styleTags: string[];
  recommendedFor: string[];
  relatedOpeningCandidates?: string[];
};

const STARTER_PACK_DEFINITIONS: readonly StarterPackDefinition[] = [
  {
    id: "solid_builder",
    displayName: "Solid Builder",
    shortName: "Solid Builder",
    styleSummary: "Safe, structured, low-risk",
    promise: "Build reliable plans and reduce early chaos.",
    whiteOpeningCandidates: ["london-white"],
    blackOpeningCandidates: ["caro-kann-black"],
    styleTags: ["safe", "structured", "low-risk"],
    recommendedFor: ["Players who want reliable plans", "Players who prefer calm structures"],
  },
  {
    id: "classical_attacker",
    displayName: "Classical Attacker",
    shortName: "Classical Attacker",
    styleSummary: "Active, principled, tactical",
    promise: "Fight for the center and learn classic attacking structures.",
    whiteOpeningCandidates: ["italian-white"],
    blackOpeningCandidates: ["french-black"],
    styleTags: ["active", "principled", "tactical"],
    recommendedFor: ["Players who want classic attacking ideas", "Players who like center control"],
  },
  {
    id: "dynamic_fighter",
    displayName: "Dynamic Fighter",
    shortName: "Dynamic Fighter",
    styleSummary: "Open, sharp, initiative-based",
    promise: "Create imbalances and play for active chances.",
    whiteOpeningCandidates: ["scotch-white"],
    blackOpeningCandidates: ["sicilian-black"],
    styleTags: ["open", "sharp", "initiative-based"],
    recommendedFor: ["Players who want more direct tactics", "Players who enjoy active positions"],
  },
  {
    id: "flexible_strategist",
    displayName: "Flexible Strategist",
    shortName: "Flexible Strategist",
    styleSummary: "Positional, adaptable, long-term",
    promise: "Delay commitment and build durable strategic pressure.",
    whiteOpeningCandidates: ["english-white", "reti-white"],
    blackOpeningCandidates: ["slav-black"],
    styleTags: ["positional", "adaptable", "long-term"],
    recommendedFor: ["Players who want flexible move orders", "Players who prefer durable pressure"],
    relatedOpeningCandidates: ["reti-white"],
  },
];

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function resolveOpeningCandidate(candidates: readonly string[]): { openingId: string; openingName: string } {
  for (const candidate of candidates) {
    const canonicalOpeningId = resolveStage2CanonicalOpeningId(candidate) ?? candidate;
    const availability = getStage2OpeningAvailability(canonicalOpeningId);
    if (availability) {
      return {
        openingId: availability.openingId,
        openingName: availability.displayName,
      };
    }
  }
  const fallbackOpeningId = resolveStage2CanonicalOpeningId(candidates[0]) ?? candidates[0];
  const fallbackAvailability = getStage2OpeningAvailability(fallbackOpeningId);
  if (!fallbackAvailability) {
    throw new Error(`starter_pack_opening_missing:${candidates[0]}`);
  }
  return {
    openingId: fallbackAvailability.openingId,
    openingName: fallbackAvailability.displayName,
  };
}

function buildStarterPack(definition: StarterPackDefinition): BlundrStarterPack {
  const white = resolveOpeningCandidate(definition.whiteOpeningCandidates);
  const black = resolveOpeningCandidate(definition.blackOpeningCandidates);
  const relatedOpeningIds = definition.relatedOpeningCandidates
    ? Array.from(
        new Set(
          definition.relatedOpeningCandidates
            .map((candidate) => resolveStage2CanonicalOpeningId(candidate) ?? candidate)
            .filter((candidate) => Boolean(candidate) && candidate !== white.openingId && candidate !== black.openingId && getStage2OpeningAvailability(candidate)),
        ),
      )
    : [];

  return {
    id: definition.id,
    displayName: definition.displayName,
    shortName: definition.shortName,
    styleSummary: definition.styleSummary,
    promise: definition.promise,
    whiteOpeningId: white.openingId,
    whiteOpeningName: white.openingName,
    blackOpeningId: black.openingId,
    blackOpeningName: black.openingName,
    styleTags: definition.styleTags.slice(),
    recommendedFor: definition.recommendedFor.slice(),
    relatedOpeningIds: relatedOpeningIds.length > 0 ? relatedOpeningIds : undefined,
  };
}

function getPackDefinitions(): readonly BlundrStarterPack[] {
  return STARTER_PACK_DEFINITIONS.map(buildStarterPack);
}

export function getAllStarterPacks(): readonly BlundrStarterPack[] {
  return getPackDefinitions();
}

export function getStarterPackById(id: StarterPackId | null | undefined): BlundrStarterPack | null {
  return getPackDefinitions().find((pack) => pack.id === id) ?? null;
}

export function getDefaultStarterPack(): BlundrStarterPack {
  return getStarterPackById("classical_attacker") ?? getPackDefinitions()[1];
}

export function getStarterPackOpeningIds(id: StarterPackId | null | undefined): { whiteOpeningId: string; blackOpeningId: string } {
  const pack = getStarterPackById(id) ?? getDefaultStarterPack();
  return {
    whiteOpeningId: pack.whiteOpeningId,
    blackOpeningId: pack.blackOpeningId,
  };
}

export function buildInitialRepertoireFromStarterPack(args: {
  userId: string;
  starterPackId: StarterPackId | null | undefined;
  allOpeningIds?: readonly string[];
  now?: string;
}): UserRepertoire {
  const pack = getStarterPackById(args.starterPackId) ?? getDefaultStarterPack();
  const allOpeningIds = Array.from(new Set((args.allOpeningIds ?? STAGE2_RUNTIME_OPENING_IDS).map((openingId) => String(openingId).trim()).filter(Boolean)));
  const unlockedOpeningIds = [pack.whiteOpeningId, pack.blackOpeningId];
  const lockedOpeningIds = allOpeningIds.filter((openingId) => !unlockedOpeningIds.includes(openingId));
  return {
    userId: String(args.userId).trim(),
    selectedStarterPackId: pack.id,
    unlockedOpeningIds,
    lockedOpeningIds,
    openingUnlockPoints: 0,
    updatedAt: String(args.now ?? new Date().toISOString()),
  };
}

export function assertStarterPacksAreValid(): void {
  const packs = getPackDefinitions();
  if (packs.length !== 4) {
    throw new Error(`starter_pack_count_invalid:${packs.length}`);
  }
  const ids = new Set<string>();
  for (const pack of packs) {
    if (ids.has(pack.id)) {
      throw new Error(`starter_pack_duplicate_id:${pack.id}`);
    }
    ids.add(pack.id);
    if (pack.id.includes("branch")) {
      throw new Error(`starter_pack_branch_id_not_allowed:${pack.id}`);
    }
    if (!pack.displayName.trim()) {
      throw new Error(`starter_pack_missing_display_name:${pack.id}`);
    }
    if (!pack.promise.trim()) {
      throw new Error(`starter_pack_missing_promise:${pack.id}`);
    }
    if (!pack.whiteOpeningId.trim() || !pack.blackOpeningId.trim()) {
      throw new Error(`starter_pack_missing_openings:${pack.id}`);
    }
    if (pack.whiteOpeningId === pack.blackOpeningId) {
      throw new Error(`starter_pack_duplicate_opening_ids:${pack.id}`);
    }
    if (!getStage2OpeningAvailability(pack.whiteOpeningId)) {
      throw new Error(`starter_pack_white_opening_missing:${pack.id}:${pack.whiteOpeningId}`);
    }
    if (!getStage2OpeningAvailability(pack.blackOpeningId)) {
      throw new Error(`starter_pack_black_opening_missing:${pack.id}:${pack.blackOpeningId}`);
    }
    for (const relatedId of pack.relatedOpeningIds ?? []) {
      if (!getStage2OpeningAvailability(relatedId)) {
        throw new Error(`starter_pack_related_opening_missing:${pack.id}:${relatedId}`);
      }
    }
  }
  if (!getStarterPackById("classical_attacker")) {
    throw new Error("starter_pack_default_missing:classical_attacker");
  }
  if (new Set(STAGE2_OPENING_AVAILABILITY_MATRIX.map((entry) => normalizeText(entry.openingId))).size < STAGE2_RUNTIME_OPENING_IDS.length) {
    throw new Error("starter_pack_opening_catalog_incomplete");
  }
}

