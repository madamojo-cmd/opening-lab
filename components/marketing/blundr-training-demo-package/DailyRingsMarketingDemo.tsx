"use client";

import { useEffect, useRef, useState } from "react";
import { dailyRingsFrames } from "./daily-rings-marketing-frames";
import styles from "./DailyRingsMarketingDemo.module.css";

type DisplayState = { tempo: number; battery: number; streak: number; final: boolean };
const ease = (value: number) => 1 - Math.pow(1 - value, 3);
const mix = (from: number, to: number, amount: number) => from + (to - from) * ease(amount);

export function DailyRingsMarketingDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const animationRef = useRef(0);
  const [visibilityQualified, setVisibilityQualified] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [display, setDisplay] = useState<DisplayState>({ tempo: 6, battery: 2, streak: 2, final: false });
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
        setVisibilityQualified(true);
      }
    }, { rootMargin: "0px", threshold: [0, 0.35] });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const final = dailyRingsFrames[2];
      setDisplay({ tempo: final.tempo, battery: final.battery, streak: final.streak, final: true });
      return;
    }
    if (hasPlayedRef.current) return;
    if (!visibilityQualified) return;
    hasPlayedRef.current = true;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - startedAt, 8200);
      if (elapsed >= 8200) {
        const final = dailyRingsFrames[2];
        setDisplay({ tempo: final.tempo, battery: final.battery, streak: final.streak, final: true });
        animationRef.current = 0;
        return;
      }
      let tempo = 6, battery = 2, final = false;
      if (elapsed >= 900 && elapsed < 2400) tempo = mix(6, 10, (elapsed - 900) / 1500);
      else if (elapsed >= 2400 && elapsed < 3200) tempo = 10;
      else if (elapsed >= 3200 && elapsed < 4700) { tempo = 10; battery = mix(2, 3, (elapsed - 3200) / 1500); }
      else if (elapsed >= 4700) { tempo = 10; battery = 3; final = elapsed >= 5400; }
      setDisplay({ tempo, battery, streak: final ? 3 : 2, final });
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
  }, [reducedMotion, visibilityQualified]);

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const tempoDone = display.tempo >= 9.95;
  const batteryDone = display.battery >= 2.95;
  const completed = 1 + Number(tempoDone) + Number(batteryDone);
  const action = display.final
    ? { label: "Today complete ✓", title: "All three rings are closed.", copy: "Come back tomorrow to keep your streak alive.", button: "Today complete" }
    : !tempoDone
      ? { label: "Next best action", title: "Tempo is the next ring to close.", copy: "Continue the opening flow that owns this ring’s progress.", button: "Continue training" }
      : !batteryDone
        ? { label: "Next best action", title: "Keep your recall moving.", copy: "One Battery review closes the next ring.", button: "Continue training" }
        : { label: "Daily goal reached", title: "All three rings are closed.", copy: "Your completed day is being added to the streak.", button: "Finish day" };

  return (
    <section ref={sectionRef} id="consistency" className={styles.section} aria-labelledby="consistency-marketing-title">
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Consistency</p>
          <h2 id="consistency-marketing-title">Make progress a habit.</h2>
          <p className={styles.emphasis}>Three daily rings turn your training into a clear routine.</p>
          <p>Blundr keeps Tempo, Battery, and Daily Blundr in one synchronized daily loop. Close each ring, protect your streak, and always know the next best action to keep improving.</p>
        </div>

        <div className={styles.dashboard} role="img" aria-label="Tempo, Battery, and Daily Blundr rings progress from one of three in progress to all three complete, increasing a two-day streak to three days.">
          <div className={styles.head}><div><span>Today’s training</span><h3>Close your daily rings.</h3></div><b>{display.streak}-day streak</b></div>
          <div className={styles.main} aria-hidden="true">
            <div className={styles.rings}>
              <div className={`${styles.ring} ${styles.outer}`} style={{ background: `conic-gradient(#26b96b 1turn,#dff0e6 0)` }}>
                <div className={`${styles.ring} ${styles.middle}`} style={{ background: `conic-gradient(#d0a226 ${(display.battery / 3).toFixed(3)}turn,#f1ead4 0)` }}>
                  <div className={`${styles.ring} ${styles.inner}`} style={{ background: `conic-gradient(#3b74ee ${(display.tempo / 10).toFixed(3)}turn,#dce5fa 0)` }}>
                    <div className={styles.center}><small>Today</small><strong>{completed}/3</strong><span>{completed === 3 ? "Complete" : "In progress"}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.list}>
              <RingRow label="Tempo" detail="Opening recall" color="#3b74ee" count={`${Math.round(display.tempo)}/10`} complete={tempoDone} />
              <RingRow label="Battery" detail="Knowledge review" color="#d0a226" count={`${Math.round(display.battery)}/3`} complete={batteryDone} />
              <RingRow label="Daily Blundr" detail="Focused positions" color="#26b96b" count="12/12" complete />
            </div>
          </div>
          <div className={`${styles.action} ${display.final ? styles.complete : ""}`} aria-hidden="true"><div><span>{action.label}</span><strong>{action.title}</strong><p>{action.copy}</p></div><b>{action.button}</b></div>
        </div>

        <p className={styles.close}>Open Blundr. Close the rings. Come back stronger tomorrow.</p>
      </div>
    </section>
  );
}

function RingRow({ label, detail, color, count, complete }: { label: string; detail: string; color: string; count: string; complete: boolean }) {
  return <div className={styles.row}><i style={{ background: color }} /><div><b>{label}</b><small>{detail}</small></div><strong>{count}</strong><span style={{ color }}>{complete ? "Complete" : "In progress"}</span></div>;
}
