"use client";
import { useState } from "react";
import type { MasteryMapNode } from "@/lib/blundr/masteryMap";
import { MasteryBranchRow } from "./MasteryBranchRow";
export function OpeningMasteryMap({
  nodes,
}: {
  nodes: readonly MasteryMapNode[];
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section
      aria-label="Opening mastery map"
      className="rounded-[1.75rem] border border-stone-200 bg-white p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Mastery map</h2>
          <p className="mt-1 text-sm text-stone-600">
            Runtime-backed branches, collapsed for a quick overview.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="rounded-2xl border border-stone-300 px-3 py-2 text-sm font-black"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      {expanded ? (
        <div className="mt-4 space-y-2">
          {nodes.map((node) => (
            <MasteryBranchRow
              key={`${node.nodeId}:${node.positionKey}`}
              node={node}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-600">
          {nodes.length} runtime positions · expand to inspect branches
        </p>
      )}
    </section>
  );
}
