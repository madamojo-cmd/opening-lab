/**
 * plainHintCompiler.ts
 * v2.7.42 - Generates safe, non-leaking hints for Plain View.
 */

import type { EvidenceGraph } from "../brain/buildEvidenceGraph";
import { renderPlainHint } from "./claimBoundTemplateRenderer";

export function compilePlainHint(
  evidence: EvidenceGraph,
  showMoreClicked: boolean
): { hint: string | null } {

  if (showMoreClicked) {
    return { hint: null }; // After Show More we show full content
  }

  const hint = renderPlainHint(evidence);
  return { hint };
}
