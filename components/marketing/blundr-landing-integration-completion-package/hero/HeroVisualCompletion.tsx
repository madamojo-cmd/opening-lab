"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
} from "react";

import type { HeroBoardAdapterProps } from "../adapters/HeroBoardAdapter";
import { MarketingButton } from "../shared/MarketingButton";

import styles from "./HeroVisualCompletion.module.css";

const FILES = "abcdefgh";

function resolveSquareFromElement(target: EventTarget | null): string | null {
  let node = target as HTMLElement | null;
  for (let i = 0; i < 6 && node; i += 1) {
    const dataSquare = node.dataset?.square;
    if (dataSquare && /^[a-h][1-8]$/.test(dataSquare)) return dataSquare;
    const aria = node.getAttribute?.("aria-label");
    if (aria && /^[a-h][1-8]$/.test(aria)) return aria;
    node = node.parentElement;
  }
  return null;
}

export function HeroVisualCompletion({
  Board,
  tempoImageSrc,
}: {
  Board: ComponentType<HeroBoardAdapterProps>;
  tempoImageSrc: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState("c3");
  const [reduced, setReduced] = useState(false);
  const [tempo, setTempo] = useState({ x: 32.75, y: 65.375 });

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced || !stageRef.current) return;
    const cell = stageRef.current.querySelector<HTMLElement>(
      `button[aria-label="${target}"]`,
    );
    if (!cell) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;
    const stageX = (cellRect.left + cellRect.width / 2 - stageRect.left) / stageRect.width;
    const stageY = (cellRect.top + cellRect.height / 2 - stageRect.top) / stageRect.height;
    setTempo({ x: stageX * 100, y: stageY * 100 });
  }, [reduced, target]);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || !stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;

    const element = document.elementFromPoint(event.clientX, event.clientY);
    const square = resolveSquareFromElement(element);
    if (!square) return;

    const cell = stageRef.current.querySelector<HTMLElement>(
      `button[aria-label="${square}"]`,
    );
    if (!cell) return;
    const cellRect = cell.getBoundingClientRect();
    const stageX = (cellRect.left + cellRect.width / 2 - stageRect.left) / stageRect.width;
    const stageY = (cellRect.top + cellRect.height / 2 - stageRect.top) / stageRect.height;

    setTarget(square);
    setTempo({ x: stageX * 100, y: stageY * 100 });
  };

  const label = useMemo(() => `target · ${target}`, [target]);

  return (
    <section
      id="why-blundr"
      className={styles.hero}
      aria-labelledby="hero-title"
    >
      <div className={styles.copy}>
        <p>Opening training for real games</p>
        <h1 id="hero-title">
          Learn the opening. <span>Know what to do</span> when it changes.
        </h1>
        <div className={styles.lead}>
          Blundr trains the positions behind your repertoire, brings back the
          moves you miss, and helps you keep playing when your opponent leaves
          the line.
        </div>
        <div className={styles.actions}>
          <MarketingButton href="/signup?next=/onboarding/welcome">
            Start training free
          </MarketingButton>
          <MarketingButton href="/login" secondary>
            Log in
          </MarketingButton>
        </div>
      </div>

      <div
        ref={stageRef}
        className={styles.stage}
        onPointerMove={move}
        onPointerDown={move}
      >
        <div className={styles.glow} />
        <div className={styles.board} aria-hidden="true">
          <div className={styles.boardSurface}>
            <Board targetSquare={target} reducedMotion={reduced} />
          </div>
          <div className={styles.fileStrip} aria-hidden="true">
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
              <span key={file}>{file}</span>
            ))}
          </div>
        </div>
        <div
          className={styles.tempo}
          style={{
            left: `${reduced ? 32.75 : tempo.x}%`,
            top: `${reduced ? 65.375 : tempo.y}%`,
          }}
          aria-hidden="true"
        >
          <img src={tempoImageSrc} alt="" />
          <i />
          <i />
        </div>
        <div className={styles.flow}>repertoire → train → review</div>
        <div className={styles.hud}>
          <span>● Tempo is training</span>
          <span>{label}</span>
        </div>
      </div>
    </section>
  );
}
