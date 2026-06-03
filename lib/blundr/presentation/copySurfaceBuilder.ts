import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { TeachingSurfaceMode, VisibleSurfaceCopy } from "./types";

function toVisibleCopy(
  source: VisibleSurfaceCopy["source"],
  block: { title: string; body: string; bullets?: string[]; leakRisk?: VisibleSurfaceCopy["leakRisk"] },
): VisibleSurfaceCopy {
  return {
    title: block.title,
    body: block.body,
    bullets: block.bullets ?? [],
    leakRisk: block.leakRisk ?? "none",
    source,
  };
}

export function buildSurfaceCopy(input: {
  mode: TeachingSurfaceMode;
  safeFrame: CompiledCoachFrame;
  requestedMode: "assisted" | "plain";
  showMoreRevealed: boolean;
}): VisibleSurfaceCopy {
  const { mode, safeFrame, requestedMode, showMoreRevealed } = input;

  if (mode === "assisted") {
    return toVisibleCopy("assisted", safeFrame.assisted);
  }

  if (mode === "plain_before_show_more") {
    return toVisibleCopy("plain", safeFrame.plain);
  }

  if (mode === "plain_after_show_more") {
    return toVisibleCopy("show_more", safeFrame.showMore);
  }

  if (mode === "branch_complete") {
    return toVisibleCopy("fallback", {
      title: "Line complete",
      body: "You finished this training line. Continue from this position or train the line again.",
      bullets: [],
      leakRisk: "none",
    });
  }

  if (mode === "opponent_replying") {
    return toVisibleCopy("fallback", {
      title: "Opponent is replying",
      body: "Wait for the opponent move before the next teaching target.",
      bullets: [],
      leakRisk: "none",
    });
  }

  if (mode === "terminal") {
    return toVisibleCopy("fallback", {
      title: "Line complete",
      body: "This training line is complete.",
      bullets: [],
      leakRisk: "none",
    });
  }

  const blockedCopy = requestedMode === "assisted"
    ? toVisibleCopy("assisted", safeFrame.assisted)
    : showMoreRevealed
      ? toVisibleCopy("show_more", safeFrame.showMore)
      : toVisibleCopy("plain", safeFrame.plain);

  return {
    ...blockedCopy,
    title: blockedCopy.title || "Safety fallback",
    body: blockedCopy.body || "No safe teaching copy is available.",
    bullets: blockedCopy.bullets ?? [],
    leakRisk: blockedCopy.leakRisk ?? "none",
  };
}
