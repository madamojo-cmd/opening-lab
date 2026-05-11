/**
 * BlundrOneNet v0 Animation Package Definitions
 *
 * This module defines the fixed, bounded set of animation packages.
 * Models must select from this list only. No free-form animation names allowed.
 */

export const BLUNDR_ANIMATION_PACKAGES = [
  "quiet-development-glow",
  "diagonal-pressure-glow",
  "knight-pressure-center",
  "center-break-pulse",
  "castle-safety-aura",
  "weak-square-pulse",
  "pin-line-tension",
  "fork-spark",
  "defensive-shield",
  "open-file-radar",
  "queen-danger-warning",
  "continuation-ghost-plan",
] as const;

export type BlundrAnimationPackage = typeof BLUNDR_ANIMATION_PACKAGES[number];

/**
 * Type guard: check if a value is a supported animation package.
 * Use this before trusting model-provided animation names.
 */
export function isSupportedAnimationPackage(
  value: string
): value is BlundrAnimationPackage {
  return (BLUNDR_ANIMATION_PACKAGES as readonly string[]).includes(value);
}
