import type { Stage2CoachContext, Stage2CoachingPacketEntry } from "./stage2CoachingTypes";

function buildShowMoreFromRuntimeStats(context: Stage2CoachContext): string | undefined {
  const rank = context.runtimeBook?.topCandidateRank;
  const games = context.runtimeBook?.topCandidateTotalGames;
  if (!Number.isFinite(rank) && !Number.isFinite(games)) return undefined;

  const parts: string[] = [];
  if (Number.isFinite(rank)) parts.push(`Book rank #${Number(rank)}`);
  if (Number.isFinite(games)) parts.push(`${Number(games).toLocaleString()} games`);
  return `Runtime context: ${parts.join(" | ")}.`;
}

export function buildSafeStage2FallbackPacket(context: Stage2CoachContext): Stage2CoachingPacketEntry {
  const showMoreStats =
    context.plainRevealState === "show_more" || context.plainRevealState === "revealed" || context.surface === "assisted"
      ? buildShowMoreFromRuntimeStats(context)
      : undefined;

  const runtimeMatched = Boolean(context.openingId && context.playKeyBefore && context.targetUci);
  const runtimeReconciliation = runtimeMatched
    ? {
        status: "matched" as const,
        openingId: String(context.openingId),
        playKey: context.playKeyBefore,
        moveUci: context.targetUci,
      }
    : {
        status: "unmatched" as const,
        reason: "runtime_context_partial",
        openingId: context.openingId,
        playKey: context.playKeyBefore,
        moveUci: context.targetUci,
      };

  return {
    openingId: context.openingId,
    playKey: context.playKeyBefore,
    moveUci: context.targetUci,
    moveSan: context.targetSan,
    conceptId: undefined,
    difficulty: "beginner",
    surface: context.surface,
    status: "approved",
    title: "Book move",
    body: "This is a common book move in the current runtime line. Focus on playing the move accurately before studying deeper plans.",
    hint: "Look for the move the opening book expects here.",
    showMore: showMoreStats,
    commonMistake: "Playing a natural-looking move that ignores the prepared book continuation.",
    remediation: "Follow the book move first, then evaluate alternatives in review mode.",
    visualRecipeRefs: [],
    evidenceIds: ["runtime-book-safe-fallback"],
    sourceFile: "stage2://safe-fallback",
    sourceSection: "runtime-book-safe-fallback",
    runtimeReconciliation,
    safetyStatus: "safe",
  };
}
