"use client";

import { useEffect, useRef, useState } from "react";
import { masteryMarketingFrames, type MasteryMarketingFrame } from "./mastery-marketing-frames";
import styles from "./MasteryMarketingDemo.module.css";

type Props = { tempoImageSrc: string };

const ease = (value: number) => 1 - Math.pow(1 - value, 3);
const interpolate = (from: MasteryMarketingFrame, to: MasteryMarketingFrame, amount: number) => {
  const t = ease(amount);
  const mix = (a: number, b: number) => a + (b - a) * t;
  return {
    progress: mix(from.progress, to.progress),
    mastered: mix(from.mastered, to.mastered),
    learning: mix(from.learning, to.learning),
    weak: mix(from.weak, to.weak),
    unseen: mix(from.unseen, to.unseen),
    accuracy: mix(from.accuracy, to.accuracy),
  };
};

export function MasteryMarketingDemo({ tempoImageSrc }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const animationRef = useRef(0);
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [frame, setFrame] = useState<MasteryMarketingFrame>(masteryMarketingFrames[0]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window) || !sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "220px 0px", threshold: 0.08 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setFrame(masteryMarketingFrames[3]);
      setResetting(false);
      return;
    }
    if (!inView) return;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startedAt) % 8000;
      let next = masteryMarketingFrames[0];
      setResetting(elapsed >= 7200);
      if (elapsed < 900) next = masteryMarketingFrames[0];
      else if (elapsed < 1700) next = interpolate(masteryMarketingFrames[0], masteryMarketingFrames[1], (elapsed - 900) / 800);
      else if (elapsed < 2500) next = masteryMarketingFrames[1];
      else if (elapsed < 3300) next = interpolate(masteryMarketingFrames[1], masteryMarketingFrames[2], (elapsed - 2500) / 800);
      else if (elapsed < 4100) next = masteryMarketingFrames[2];
      else if (elapsed < 4900) next = interpolate(masteryMarketingFrames[2], masteryMarketingFrames[3], (elapsed - 4100) / 800);
      else if (elapsed < 7600) next = masteryMarketingFrames[3];
      setFrame(next);
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, [inView, reducedMotion]);

  const rounded = (value: number) => Math.round(value);
  const status = frame.progress < 1 ? "Building foundation" : frame.progress < 12 ? "Learning in motion" : frame.progress < 22 ? "Mastery growing" : "Repertoire strengthening";

  return (
    <section ref={sectionRef} id="repertoire-mastery" className={styles.section} aria-labelledby="mastery-marketing-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Repertoire Mastery</p>
          <h2 id="mastery-marketing-title">Know exactly where your opening breaks down.</h2>
          <p className={styles.emphasis}>See your repertoire improve as you train.</p>
          <p>Blundr tracks every branch as mastered, learning, weak, or unseen—giving you a live picture of what you know and exactly where to focus next.</p>
        </div>

        <div className={`${styles.dashboard} ${resetting ? styles.resetting : ""}`} role="img" aria-label="Italian Game mastery grows to twenty-six percent while weak and unseen branches fall and accuracy improves.">
          <div className={styles.topline}><div><span>Repertoire · Opening intelligence</span><h3>Italian Game mastery</h3></div><b>{status}</b></div>
          <div className={styles.summary} aria-hidden="true">
            <div><small>Unlocked repertoire opening</small><strong>{rounded(frame.progress)}%</strong><div className={styles.bar}><span style={{ width: `${frame.progress}%` }} /></div></div>
            <div className={styles.opening}><img src={tempoImageSrc} alt="" /><div><small>Opening</small><b>Italian Game</b><small>Mastery growing</small></div></div>
          </div>
          <div className={styles.metrics} aria-hidden="true">
            <Metric label="Mastered" value={rounded(frame.mastered)} positive />
            <Metric label="Learning" value={rounded(frame.learning)} positive />
            <Metric label="Weak" value={rounded(frame.weak)} />
            <Metric label="Unseen" value={rounded(frame.unseen).toLocaleString("en-US")} />
            <Metric label="Imported games" value={0} muted />
            <Metric label="Unaided accuracy" value={`${rounded(frame.accuracy)}%`} positive />
          </div>
        </div>

        <p className={styles.close}>See your progress. Find your weaknesses. Keep building mastery.</p>
      </div>
    </section>
  );
}

function Metric({ label, value, positive = false, muted = false }: { label: string; value: string | number; positive?: boolean; muted?: boolean }) {
  return <div className={`${styles.metric} ${positive ? styles.positive : ""} ${muted ? styles.muted : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}
