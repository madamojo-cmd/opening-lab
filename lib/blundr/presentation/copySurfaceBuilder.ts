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
}): VisibleSurfaceCopy {
  const { mode, safeFrame } = input;

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
      title: safeFrame.assisted.title || "Branch Complete",
      body: safeFrame.assisted.body || "You can continue from here when ready.",
      bullets: safeFrame.assisted.bullets,
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

  return toVisibleCopy("fallback", {
    title: safeFrame.plain.title || "Safety fallback",
    body: safeFrame.plain.body || "No safe teaching copy is available.",
    bullets: safeFrame.plain.bullets,
    leakRisk: "none",
  });
}
