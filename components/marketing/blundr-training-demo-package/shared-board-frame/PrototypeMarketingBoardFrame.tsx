import type { ReactNode } from "react";

import styles from "./PrototypeMarketingBoardFrame.module.css";

export type PrototypeBoardFrameVariant = "training" | "daily" | "review";
export type PrototypeBoardOrientation = "white" | "black";

export type PrototypeMarketingBoardFrameProps = {
  variant: PrototypeBoardFrameVariant;
  orientation: PrototypeBoardOrientation;
  board: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  topRightIsPill?: boolean;
  bottomLeft: ReactNode;
  bottomRight: ReactNode;
  overlayBadge?: ReactNode;
  overlayBadgeVisible?: boolean;
  className?: string;
};

const FILES = "abcdefgh";

function PrototypeBoardCoordinates({
  orientation,
  variant,
}: {
  orientation: PrototypeBoardOrientation;
  variant: PrototypeBoardFrameVariant;
}) {
  const cells: ReactNode[] = [];
  for (let displayRank = 0; displayRank < 8; displayRank += 1) {
    for (let displayFile = 0; displayFile < 8; displayFile += 1) {
      const fileIndex = orientation === "white" ? displayFile : 7 - displayFile;
      const rank = orientation === "white" ? 8 - displayRank : displayRank + 1;
      cells.push(
        <span className={styles.coordinateCell} key={`${displayRank}-${displayFile}`}>
          {displayFile === 0 ? <i className={styles.rankLabel}>{rank}</i> : null}
          {displayRank === 7 ? (
            <i className={styles.fileLabel}>{FILES[fileIndex]}</i>
          ) : null}
        </span>,
      );
    }
  }

  return (
    <span
      aria-hidden="true"
      className={`${styles.coordinates} ${variant === "training" ? styles.trainingCoordinates : styles.applicationCoordinates}`}
    >
      {cells}
    </span>
  );
}

export function PrototypeMarketingBoardFrame({
  variant,
  orientation,
  board,
  topLeft,
  topRight,
  topRightIsPill = false,
  bottomLeft,
  bottomRight,
  overlayBadge,
  overlayBadgeVisible = false,
  className,
}: PrototypeMarketingBoardFrameProps) {
  const rootClassName = [
    variant === "training" ? styles.trainingWindow : styles.applicationFrame,
    variant === "review" ? styles.reviewFrame : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "training") {
    return (
      <div className={rootClassName}>
        <div className={styles.playerStrip}>
          <strong>{topLeft}</strong>
          <span className={topRightIsPill ? styles.turnPill : undefined}>
            {topRight}
          </span>
        </div>
        <div className={`${styles.boardViewport} ${styles.trainingViewport}`}>
          {board}
          <PrototypeBoardCoordinates orientation={orientation} variant={variant} />
          {overlayBadge ? (
            <span
              className={`${styles.overlayBadge} ${overlayBadgeVisible ? styles.overlayBadgeVisible : ""}`}
            >
              {overlayBadge}
            </span>
          ) : null}
        </div>
        <div className={styles.playerStrip}>
          <strong>{bottomLeft}</strong>
          <span>{bottomRight}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className={`${styles.boardViewport} ${styles.applicationViewport}`}>
        {board}
        <PrototypeBoardCoordinates orientation={orientation} variant={variant} />
        {overlayBadge ? (
          <span
            className={`${styles.overlayBadge} ${overlayBadgeVisible ? styles.overlayBadgeVisible : ""}`}
          >
            {overlayBadge}
          </span>
        ) : null}
      </div>
      <div
        className={
          variant === "review" ? styles.reviewBoardLabel : styles.dailyBoardLabel
        }
      >
        <span>{bottomLeft}</span>
        <span>{bottomRight}</span>
      </div>
    </div>
  );
}

export const PROTOTYPE_BOARD_FRAME_PRESETS = {
  training: {
    variant: "training",
    orientation: "white",
    topLeft: "Opponent",
    topRight: "Black to move",
    topRightIsPill: true,
    bottomLeft: "You",
    bottomRight: "Italian Game · White",
  },
  daily: {
    variant: "daily",
    orientation: "black",
    bottomLeft: "Black at bottom",
    bottomRight: "Recall the move",
  },
  review: {
    variant: "review",
    orientation: "white",
    bottomLeft: "White at bottom",
    bottomRight: "Position under review",
  },
} as const satisfies Record<
  PrototypeBoardFrameVariant,
  Omit<PrototypeMarketingBoardFrameProps, "board">
>;
