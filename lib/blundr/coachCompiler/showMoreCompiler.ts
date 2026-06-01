/**
 * showMoreCompiler.ts
 * v2.7.42 - When Show More is clicked in Plain View, it must return
 * the exact same content as Assisted View for the identical target.
 */

import type { EvidenceGraph } from "../brain/buildEvidenceGraph";
import { renderAssistedCoach } from "./claimBoundTemplateRenderer";

export function compileShowMore(
  target: { san: string; pieceType: string; uci: string },
  evidence: EvidenceGraph,
  showMoreClicked: boolean
) {
  if (!showMoreClicked) {
    return { title: null, body: null };
  }

  // Critical rule: Show More must equal Assisted content
  const assisted = renderAssistedCoach(target, evidence);

  return {
    title: assisted.title,
    body: assisted.body,
  };
}
