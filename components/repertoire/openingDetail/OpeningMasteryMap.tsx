"use client";
import { useState } from "react";
import type { MasteryMapNode } from "@/lib/blundr/masteryMap";
import { MasteryBranchRow } from "./MasteryBranchRow";
import styles from "./OpeningDetail.module.css";
export function OpeningMasteryMap({
  nodes,
}: {
  nodes: readonly MasteryMapNode[];
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section aria-label="Opening mastery map" className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Mastery map</h2>
          <p className={styles.sectionCopy}>
            Runtime-backed branches, collapsed for a quick overview.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={styles.toggleButton}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      {expanded ? (
        <div className={styles.branchList}>
          {nodes.map((node) => (
            <MasteryBranchRow
              key={`${node.nodeId}:${node.positionKey}`}
              node={node}
            />
          ))}
        </div>
      ) : (
        <p className={styles.bodyCopy}>
          {nodes.length} runtime positions · expand to inspect branches
        </p>
      )}
    </section>
  );
}
