import type { MasteryMapNode } from "@/lib/blundr/masteryMap";
import { MasteryNodeBadge } from "./MasteryNodeBadge";
export function MasteryBranchRow({ node }: { node: MasteryMapNode }) {
  return (
    <article className="rounded-2xl border border-stone-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-bold">{node.sanSequence.join(" ")}</div>
        <MasteryNodeBadge status={node.status} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
        <span>Confidence {Math.round(node.confidence * 100)}%</span>
        <span>Evidence {node.evidenceCount}</span>
        <span>Imported {node.importedGameEvidenceCount}</span>
        {node.alternateRoute ? <span>Alternate route</span> : null}
      </div>
      {node.weaknessExplanation ? (
        <p className="mt-2 text-sm text-stone-700">
          {node.weaknessExplanation}
        </p>
      ) : null}
    </article>
  );
}
