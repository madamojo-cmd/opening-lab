"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { reviewMarketingDemo as demo } from "./review-marketing-demo";
import {
  PROTOTYPE_BOARD_FRAME_PRESETS,
  PrototypeMarketingBoardFrame,
} from "./shared-board-frame/PrototypeMarketingBoardFrame";
import styles from "./SmartReviewMarketingDemo.module.css";

export type ReviewMarketingBoardProps = {
  fen: string;
  orientation: "white";
  highlightedSquares: readonly string[];
  highlightColor: "amber" | "green";
  lastMove: readonly [string, string] | null;
  interactive: false;
  animationDurationMs: number;
};

type Props = { Board: ComponentType<ReviewMarketingBoardProps> };
type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function SmartReviewMarketingDemo({ Board }: Props) {
  const [stage, setStage] = useState<Stage>(0);
  const [visibilityQualified, setVisibilityQualified] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window) || !sectionRef.current) {
      setVisibilityQualified(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          setVisibilityQualified(true);
        }
      },
      { rootMargin: "0px", threshold: [0, 0.35] },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasPlayedRef.current) return;
    if (reducedMotion) {
      hasPlayedRef.current = true;
      setStage(8);
      return;
    }
    if (!visibilityQualified) return;
    hasPlayedRef.current = true;
    setStage(0);
    timers.current.push(
      window.setTimeout(() => setStage(1), demo.wrongHighlightAtMs),
      window.setTimeout(() => setStage(2), demo.wrongMoveAtMs),
      window.setTimeout(() => setStage(3), demo.missAtMs),
      window.setTimeout(() => setStage(4), demo.replayAtMs),
      window.setTimeout(() => setStage(5), demo.correctHighlightAtMs),
      window.setTimeout(() => setStage(6), demo.correctMoveAtMs),
      window.setTimeout(() => setStage(7), demo.successAtMs),
      window.setTimeout(() => setStage(8), demo.updatedAtMs),
    );
  }, [reducedMotion, visibilityQualified]);

  useEffect(() => {
    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, []);

  const wrongMoveVisible = stage === 2 || stage === 3;
  const correctMoveVisible = stage >= 6;
  const replayVisible = stage >= 4;
  const fen = wrongMoveVisible ? demo.incorrectFen : correctMoveVisible ? demo.completedFen : demo.startingFen;
  const highlights = stage === 1 ? ["f6", "d5"] : stage === 5 ? ["c6", "a5"] : [];
  const lastMove = wrongMoveVisible
    ? ([demo.incorrectMove.from, demo.incorrectMove.to] as const)
    : correctMoveVisible
      ? ([demo.correctMove.from, demo.correctMove.to] as const)
      : null;

  return (
    <section ref={sectionRef} id="smart-review" className={styles.section} aria-labelledby="smart-review-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Smart Review</p>
          <h2 id="smart-review-title">Miss it once.<br />Train it until it sticks.</h2>
          <p className={styles.emphasis}>Blundr doesn’t let mistakes disappear into your game history.</p>
          <p>When you miss a position, it enters your review system and comes back for focused practice. You retry the move, reinforce the idea, and keep working it until it becomes reliable.</p>
        </div>

        <div className={styles.product} role="img" aria-label="A missed Fried Liver position is added to review, returns as the same position, and is then solved correctly.">
          <PrototypeMarketingBoardFrame
            {...PROTOTYPE_BOARD_FRAME_PRESETS.review}
            overlayBadge={
              <>
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 12a8 8 0 1 1-2.343-5.657"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 4v6h-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Same position returns</span>
              </>
            }
            overlayBadgeVisible={replayVisible}
            board={
              <Board
                fen={fen}
                orientation="white"
                highlightedSquares={highlights}
                highlightColor={stage === 1 ? "amber" : "green"}
                lastMove={lastMove}
                interactive={false}
                animationDurationMs={reducedMotion ? 0 : 620}
              />
            }
          />

          <aside className={styles.card} aria-hidden="true">
            <div className={styles.head}><div><span>{replayVisible ? "Replay" : "Review"}</span><small>Fried Liver · Black</small></div><b>Attempt {replayVisible ? "2" : "1"}</b></div>
            {stage < 3 && <div className={styles.panel}><strong>Position to solve</strong><h3>Find the move you missed.</h3><p>Choose Black’s best response after 5.exd5.</p></div>}
            {stage === 3 && <div className={styles.panel}><strong className={styles.notQuite}>Not quite</strong><h3>5…{demo.incorrectMove.san}</h3><p className={styles.miss}>{demo.missExplanation}</p><div className={styles.recorded}>✓ Added to review</div></div>}
            {(stage === 4 || stage === 5) && <div className={styles.panel}><strong>Replay</strong><h3>Try the same position again.</h3><p>The exact position returns for another attempt.</p><div className={styles.returnCopy}>Miss remembered → position returned</div></div>}
            {stage >= 6 && <div className={styles.panel}><strong className={styles.correct}>Correct</strong><h3>5…{demo.correctMove.san}</h3><p className={styles.success}>{demo.successExplanation}</p><div className={`${styles.updated} ${stage >= 8 ? styles.visible : ""}`}>✓ Review updated</div></div>}
          </aside>
        </div>

        <p className={styles.close}>Your mistakes become the roadmap for what to train next.</p>
      </div>
    </section>
  );
}
