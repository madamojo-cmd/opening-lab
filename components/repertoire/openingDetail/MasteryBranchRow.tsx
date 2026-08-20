import type { MasteryMapNode } from "@/lib/blundr/masteryMap";
import { MasteryNodeBadge } from "./MasteryNodeBadge";
import styles from "./OpeningDetail.module.css";
export function MasteryBranchRow({ node }: { node: MasteryMapNode }) {
  return (
    <article className={styles.branchRow}>
      <div className={styles.branchSummary}>
        <div className={styles.branchName}>{node.sanSequence.join(" ")}</div>
        <MasteryNodeBadge status={node.status} />
      </div>
      <div className={styles.branchMeta}>
        <span>Confidence {Math.round(node.confidence * 100)}%</span>
        <span>Evidence {node.evidenceCount}</span>
        <span>Imported {node.importedGameEvidenceCount}</span>
        {node.alternateRoute ? <span>Alternate route</span> : null}
      </div>
      {node.weaknessExplanation ? (
        <p className={styles.bodyCopy}>{node.weaknessExplanation}</p>
      ) : null}
    </article>
  );
}
