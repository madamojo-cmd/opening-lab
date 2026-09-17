"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { dailyBlundrDemo } from "./daily-blundr-demo";
import styles from "./DailyBlundrMarketingDemo.module.css";

export type DailyMarketingBoardProps = {
  fen: string;
  orientation: "black";
  highlightedSquares: readonly string[];
  highlightColor: "green";
  lastMove: readonly [string, string] | null;
  interactive: false;
  animationDurationMs: number;
};

type Props = { Board: ComponentType<DailyMarketingBoardProps> };
type Stage = 0 | 1 | 2 | 3 | 4 | 5;

export function DailyBlundrMarketingDemo({ Board }: Props) {
  const [stage, setStage] = useState<Stage>(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window) || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "220px 0px", threshold: 0.08 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
    if (reducedMotion) {
      setStage(4);
      return clear;
    }
    if (!inView) return clear;
    const run = () => {
      clear();
      setStage(0);
      timers.current.push(
        window.setTimeout(() => setStage(1), dailyBlundrDemo.highlightAtMs),
        window.setTimeout(() => setStage(2), dailyBlundrDemo.moveAtMs),
        window.setTimeout(() => setStage(3), dailyBlundrDemo.resultAtMs),
        window.setTimeout(() => setStage(4), dailyBlundrDemo.progressAtMs),
        window.setTimeout(() => setStage(5), dailyBlundrDemo.nextAtMs),
        window.setTimeout(run, dailyBlundrDemo.durationMs),
      );
    };
    run();
    return clear;
  }, [inView, reducedMotion]);

  const moveVisible = stage >= 2;
  const resultVisible = stage >= 3;
  const progressVisible = stage >= 4;

  return (
    <section ref={sectionRef} id="daily-blundr" className={styles.section} aria-labelledby="daily-demo-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Daily Blundr</p>
          <h2 id="daily-demo-title">Train what matters next.</h2>
          <p className={styles.emphasis}>Your daily opening practice is already built for you.</p>
          <p>Daily Blundr turns your repertoire, mistakes, and positions due for review into one focused session. Make the move from memory, check the continuation, and keep going.</p>
          <p><strong>What happens today shapes what Blundr shows you tomorrow.</strong> Your training stays synchronized as you learn, miss positions, review them, and improve.</p>
          <p className={styles.close}>No study-plan maintenance. No random puzzle feed. Just the positions that need your attention next.</p>
        </div>
        <div className={styles.product} role="img" aria-label="Demonstration of a Daily Blundr opening review exercise.">
          <div className={styles.boardFrame} aria-hidden="true">
            <Board
              fen={moveVisible ? dailyBlundrDemo.completedFen : dailyBlundrDemo.startingFen}
              orientation="black"
              highlightedSquares={stage >= 1 ? ["e6", "d5"] : []}
              highlightColor="green"
              lastMove={moveVisible ? ["e6", "d5"] : null}
              interactive={false}
              animationDurationMs={reducedMotion ? 0 : 620}
            />
            <div className={styles.boardLabels}>
              <span>Black at bottom</span>
              <span>Recall the move</span>
            </div>
          </div>
          <aside className={styles.card} aria-hidden="true">
            <div className={styles.head}><div><span>Daily Blundr</span><small>{stage === 5 ? "2" : "1"} of 12</small></div><b>Move</b></div>
            {!resultVisible ? (
              <div><h3>Missing Move</h3><p>Find the move from your repertoire.</p><div className={styles.selected}><b>Selected for today</b><span>This position is due for review based on your training.</span></div></div>
            ) : (
              <div><strong className={styles.correct}>✓ Correct</strong><h3>{dailyBlundrDemo.expectedMove.san}</h3><p className={styles.explanation}>{dailyBlundrDemo.explanation}</p><div className={`${styles.progress} ${progressVisible ? styles.visible : ""}`}>✓ Progress recorded</div></div>
            )}
            {stage === 5 && <div className={styles.next}><strong>Next position ready</strong><span>Your review queue is already moving forward.</span></div>}
          </aside>
        </div>
      </div>
    </section>
  );
}
