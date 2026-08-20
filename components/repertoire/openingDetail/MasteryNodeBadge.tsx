import type { MasteryStatus } from "@/lib/blundr/masteryMap";
import styles from "./OpeningDetail.module.css";
export function MasteryNodeBadge({ status }: { status: MasteryStatus }) {
  return <span className={styles.badge}>{status.replaceAll("_", " ")}</span>;
}
