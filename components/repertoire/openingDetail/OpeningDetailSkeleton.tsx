import styles from "./OpeningDetail.module.css";

export function OpeningDetailSkeleton() {
  return (
    <div role="status" className={styles.skeleton}>
      Loading opening detail…
    </div>
  );
}
