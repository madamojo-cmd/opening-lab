"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { landingOpeningDemo, type DemoArrow } from "./landing-opening-demo";
import styles from "./MarketingTrainingDemo.module.css";

export type MarketingBoardProps = {
  fen: string;
  orientation: "white";
  arrows: readonly DemoArrow[];
  highlightedSquares: readonly string[];
  highlightColor: "blue";
  emphasizedSquare: string | null;
  lastMove: readonly [string, string] | null;
  interactive: false;
  animationDurationMs: number;
};

type Props = {
  Board: ComponentType<MarketingBoardProps>;
  tempoImageSrc: string;
};

type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function MarketingTrainingDemo({ Board, tempoImageSrc }: Props) {
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
      setStage(6);
      return clear;
    }
    if (!inView) return clear;
    const run = () => {
      clear();
      setStage(0);
      timers.current.push(
        window.setTimeout(() => setStage(1), landingOpeningDemo.moves[0].atMs),
        window.setTimeout(() => setStage(2), landingOpeningDemo.teaching.bishopEmphasisAtMs),
        window.setTimeout(() => setStage(3), landingOpeningDemo.teaching.pawnHighlightAtMs),
        window.setTimeout(() => setStage(4), landingOpeningDemo.moves[1].atMs),
        window.setTimeout(() => setStage(5), landingOpeningDemo.cueAtMs),
        window.setTimeout(() => setStage(6), landingOpeningDemo.reviewAtMs),
        window.setTimeout(run, landingOpeningDemo.durationMs),
      );
    };
    run();
    return clear;
  }, [inView, reducedMotion]);

  const fen =
    stage === 0
      ? landingOpeningDemo.startingFen
      : stage <= 3
        ? landingOpeningDemo.afterBishopFen
        : landingOpeningDemo.afterC3Fen;

  const teachingVisible = stage >= 3;
  const cueVisible = stage >= 5;
  const highlightedSquares =
    stage === 3
      ? landingOpeningDemo.teaching.highlightedSquares
      : stage >= 4
        ? (["c3"] as const)
        : [];
  const lastMove: readonly [string, string] | null =
    stage >= 1 && stage <= 3 ? ["f8", "c5"] : stage >= 4 ? ["c2", "c3"] : null;

  return (
    <section ref={sectionRef} id="training-demo" className={styles.section} aria-labelledby="training-demo-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>When theory ends</p>
          <h2 id="training-demo-title">Your opponent won’t play the line you memorized.</h2>
          <p className={styles.emphasis}>Blundr trains what happens next.</p>
          <p>Opening study shouldn’t stop when your opponent deviates. Blundr teaches the ideas behind your repertoire, trains the continuations you actually encounter, and identifies the positions that give you trouble.</p>
          <p><strong>Every mistake makes your training smarter.</strong> Those positions flow back into Blundr’s synchronized review system, giving you increasingly targeted practice built around your chess.</p>
          <p className={styles.close}>Know the opening. Understand the position. Handle the deviation.</p>
        </div>
        <div className={styles.visual} role="img" aria-label="Animated demonstration showing Blundr teaching an Italian Game continuation and adding the position to personalized review.">
          <div className={styles.boardFrame} aria-hidden="true">
            <Board
              fen={fen}
              orientation="white"
              arrows={teachingVisible ? landingOpeningDemo.teaching.arrows : []}
              highlightedSquares={highlightedSquares}
              highlightColor="blue"
              emphasizedSquare={stage === 2 ? "c5" : null}
              lastMove={lastMove}
              interactive={false}
              animationDurationMs={reducedMotion ? 0 : 620}
            />
          </div>
          <aside className={`${styles.cue} ${cueVisible ? styles.visible : ""}`} aria-hidden="true">
            <div className={styles.cueHead}><img src={tempoImageSrc} alt="" /><span>Tempo cue</span></div>
            <h3>{landingOpeningDemo.teaching.title}</h3>
            <p>{landingOpeningDemo.teaching.body}</p>
            <div className={styles.context}><span>Opening<strong>{landingOpeningDemo.opening}</strong></span><span>Position idea<strong>{landingOpeningDemo.teaching.positionIdea}</strong></span></div>
            <div className={`${styles.review} ${stage === 6 ? styles.visible : ""}`}>✓ Added to personalized review</div>
          </aside>
        </div>
      </div>
    </section>
  );
}
