import { STAGE2_OPENING_AVAILABILITY_MATRIX, getStage2OpeningAvailability } from "../openings/openingAvailability";
import { resolveStage2CanonicalOpeningId } from "../openings/openingIdentity";
import type { RepertoireOpeningSide } from "./repertoireTypes";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeOpeningPool(openingIds: readonly string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const openingId of openingIds) {
    const canonical = resolveStage2CanonicalOpeningId(openingId) ?? normalizeText(openingId);
    if (!canonical || seen.has(canonical)) continue;
    seen.add(canonical);
    next.push(canonical);
  }
  return next;
}

export function getEligibleRepertoireOpeningIds(): string[] {
  return normalizeOpeningPool(STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.runtimeAvailable).map((entry) => entry.openingId));
}

export function getOpeningDisplayName(openingId: string): string {
  const availability = getStage2OpeningAvailability(openingId);
  if (availability) return availability.displayName;
  const text = normalizeText(openingId).replace(/[-_]+/g, " ").trim();
  return text ? text.replace(/\b\w/g, (match) => match.toUpperCase()) : normalizeText(openingId) || "Unknown opening";
}

export function getOpeningSide(openingId: string): RepertoireOpeningSide {
  const availability = getStage2OpeningAvailability(openingId);
  if (availability) return availability.learnerPerspective;
  if (normalizeText(openingId).endsWith("-white")) return "white";
  if (normalizeText(openingId).endsWith("-black")) return "black";
  return "unknown";
}

export function buildLockedOpeningIds(allOpeningIds: readonly string[], unlockedOpeningIds: readonly string[]): string[] {
  const unlocked = new Set(normalizeOpeningPool(unlockedOpeningIds));
  return normalizeOpeningPool(allOpeningIds).filter((openingId) => !unlocked.has(openingId));
}
