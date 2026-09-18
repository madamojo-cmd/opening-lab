"use client";

import { useEffect, useRef } from "react";

import styles from "./HeroVisualCompletion.module.css";

const FILES = "abcdefgh";

export function HeroVisualCompletion({ tempoImageSrc }: { tempoImageSrc: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const squareChipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const sprite = spriteRef.current;
    const chip = squareChipRef.current;
    if (!canvas || !stage || !sprite || !chip) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const files = FILES;
    const path = [
      [1, 7],
      [2, 5],
      [5, 4],
      [4, 2],
      [2, 3],
      [1, 1],
      [3, 0],
      [5, 1],
      [7, 0],
      [6, 2],
      [4, 1],
      [3, 3],
    ];

    let dpr = 1,
      width = 0,
      height = 0,
      points: Array<Array<{ x: number; y: number }>> = [],
      target = { file: 5, rank: 4 },
      tempo = { file: 1, rank: 7 },
      pointerActive = false,
      lastPointer = 0,
      pathIndex = 1,
      lastAuto = performance.now();

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createProjection();
      draw();
    }

    function createProjection() {
      const mobile = width < 560,
        topY = height * (mobile ? 0.18 : 0.105),
        bottomY = height * (mobile ? 0.84 : 0.88),
        topWidth = width * (mobile ? 0.54 : 0.48),
        bottomWidth = width * (mobile ? 0.94 : 0.89),
        centerX = width * (mobile ? 0.51 : 0.52),
        skew = width * (mobile ? 0.035 : 0.055);
      points = [];
      for (let r = 0; r <= 8; r++) {
        const t = r / 8,
          eased = Math.pow(t, 0.82),
          rowWidth = topWidth + (bottomWidth - topWidth) * eased,
          y = topY + (bottomY - topY) * eased,
          cx = centerX + skew * (t - 0.42),
          row: Array<{ x: number; y: number }> = [];
        for (let f = 0; f <= 8; f++)
          row.push({ x: cx - rowWidth / 2 + (rowWidth * f) / 8, y });
        points.push(row);
      }
    }

    function cellCenter(file: number, rank: number) {
      const mobile = width < 560,
        t = (rank + 0.5) / 8,
        eased = Math.pow(t, 0.82),
        topY = height * (mobile ? 0.18 : 0.105),
        bottomY = height * (mobile ? 0.84 : 0.88),
        topWidth = width * (mobile ? 0.54 : 0.48),
        bottomWidth = width * (mobile ? 0.94 : 0.89),
        rowWidth = topWidth + (bottomWidth - topWidth) * eased,
        centerX = width * (mobile ? 0.51 : 0.52),
        skew = width * (mobile ? 0.035 : 0.055),
        cx = centerX + skew * (t - 0.42);
      return {
        x: cx - rowWidth / 2 + (rowWidth * (file + 0.5)) / 8,
        y: topY + (bottomY - topY) * eased,
      };
    }

    function poly(list: Array<{ x: number; y: number }>) {
      ctx.beginPath();
      ctx.moveTo(list[0].x, list[0].y);
      for (let i = 1; i < list.length; i++) ctx.lineTo(list[i].x, list[i].y);
      ctx.closePath();
    }

    function positionTempo() {
      const p = cellCenter(tempo.file, tempo.rank),
        scale = 0.61 + (tempo.rank / 8) * 0.46,
        tilt = Math.max(-5, Math.min(5, (target.file - tempo.file) * 2.1));
      sprite.style.left = `${p.x}px`;
      sprite.style.top = `${p.y + 7}px`;
      sprite.style.setProperty("--tempo-scale", scale.toFixed(3));
      sprite.style.setProperty("--tempo-tilt", `${tilt.toFixed(2)}deg`);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const bottomLeft = points[8][0],
        bottomRight = points[8][8],
        topLeft = points[0][0],
        topRight = points[0][8];
      ctx.save();
      ctx.shadowColor = "rgba(9,26,19,.3)";
      ctx.shadowBlur = 38;
      ctx.shadowOffsetY = 25;
      poly([topLeft, topRight, bottomRight, bottomLeft]);
      ctx.fillStyle = "#091a13";
      ctx.fill();
      ctx.restore();
      poly([
        bottomLeft,
        bottomRight,
        { x: bottomRight.x - 6, y: bottomRight.y + 17 },
        { x: bottomLeft.x + 6, y: bottomLeft.y + 17 },
      ]);
      const edge = ctx.createLinearGradient(bottomLeft.x, 0, bottomRight.x, 0);
      edge.addColorStop(0, "#13251d");
      edge.addColorStop(0.55, "#d45b37");
      edge.addColorStop(1, "#102119");
      ctx.fillStyle = edge;
      ctx.fill();
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const cell = [
              points[r][f],
              points[r][f + 1],
              points[r + 1][f + 1],
              points[r + 1][f],
            ],
            isTarget = f === target.file && r === target.rank,
            isTempo = Math.round(tempo.file) === f && Math.round(tempo.rank) === r,
            light = (f + r) % 2 === 0,
            fill = ctx.createLinearGradient(0, cell[0].y, 0, cell[2].y);
          fill.addColorStop(0, light ? "#eee8dc" : "#14362b");
          fill.addColorStop(1, light ? "#dcd4c5" : "#0a251c");
          poly(cell);
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.strokeStyle = light
            ? "rgba(9,26,19,.09)"
            : "rgba(255,255,255,.05)";
          ctx.lineWidth = 1;
          ctx.stroke();
          if (isTarget || isTempo) {
            poly(cell);
            ctx.fillStyle = isTarget
              ? "rgba(212,91,55,.34)"
              : "rgba(255,253,248,.15)";
            ctx.fill();
            ctx.strokeStyle = isTarget
              ? "rgba(212,91,55,.9)"
              : "rgba(255,253,248,.46)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
      const start = cellCenter(Math.round(tempo.file), Math.round(tempo.rank)),
        end = cellCenter(target.file, target.rank);
      ctx.save();
      ctx.setLineDash([5, 8]);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(212,91,55,.58)";
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(
        (start.x + end.x) / 2,
        Math.min(start.y, end.y) - 42,
        end.x,
        end.y,
      );
      ctx.stroke();
      ctx.restore();
      positionTempo();
      ctx.save();
      ctx.fillStyle = "rgba(23,32,42,.48)";
      ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (let f = 0; f < 8; f++) {
        const q = cellCenter(f, 7);
        ctx.fillText(files[f], q.x, points[8][f].y + 14);
      }
      ctx.restore();
    }

    function nearestCell(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect(),
        x = clientX - rect.left,
        y = clientY - rect.top;
      let best = { file: 0, rank: 0, distance: Infinity };
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const p = cellCenter(file, rank),
            distance = Math.hypot(x - p.x, y - p.y);
          if (distance < best.distance) best = { file, rank, distance };
        }
      }
      return best;
    }

    function setTarget(file: number, rank: number) {
      target.file = Math.max(0, Math.min(7, file));
      target.rank = Math.max(0, Math.min(7, rank));
      chip.textContent = `target · ${files[target.file]}${8 - target.rank}`;
    }

    function onPointer(event: PointerEvent) {
      pointerActive = true;
      lastPointer = performance.now();
      const next = nearestCell(event.clientX, event.clientY);
      if (next.distance < width * 0.18) setTarget(next.file, next.rank);
    }

    let raf = 0;
    function animate(now: number) {
      if (pointerActive && now - lastPointer > 1600) pointerActive = false;
      if (!pointerActive && now - lastAuto > 1350) {
        const next = path[pathIndex++ % path.length];
        setTarget(next[0], next[1]);
        lastAuto = now;
      }
      tempo.file += (target.file - tempo.file) * 0.075;
      tempo.rank += (target.rank - tempo.rank) * 0.075;
      draw();
      raf = requestAnimationFrame(animate);
    }

    const onPointerLeave = () => {
      lastPointer = performance.now() - 1000;
    };

    stage.addEventListener("pointermove", onPointer, { passive: true });
    stage.addEventListener("pointerdown", onPointer, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", resize, { passive: true });
    resize();
    setTarget(5, 4);
    if (!reduced) raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointermove", onPointer);
      stage.removeEventListener("pointerdown", onPointer);
      stage.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className={styles.hero} id="why-blundr" aria-labelledby="hero-title">
      <section className={styles.copy} aria-labelledby="hero-title">
        <div className={styles.eyebrow}>Opening training for real games</div>
        <h1 id="hero-title">
          Learn the opening.{" "}
          <span className={styles.accentWord}>Know what to do</span> when it changes.
        </h1>
        <p className={styles.lead}>
          Blundr trains the positions behind your repertoire, brings back the moves you
          miss, and helps you keep playing when your opponent leaves the line.
        </p>
      </section>
      <section
        className={styles.boardStage}
        ref={stageRef}
        aria-label="Interactive animated chessboard with Tempo"
      >
        <canvas
          className={styles.board}
          ref={canvasRef}
          role="img"
          aria-label="Perspective chessboard with Tempo gliding toward the selected square"
        />
        <div className={styles.tempoSprite} ref={spriteRef} aria-hidden="true">
          <div className={styles.tempoLife}>
            <img className={styles.tempoImage} src={tempoImageSrc} alt="" />
            <span className={`${styles.eyelid} ${styles.left}`} />
            <span className={`${styles.eyelid} ${styles.right}`} />
          </div>
        </div>
        <div className={styles.edgeLabel} id="concept">
          repertoire → train → review
        </div>
        <div className={styles.hud} aria-hidden="true">
          <div className={`${styles.chip} ${styles.live}`}>● Tempo is training</div>
          <div className={styles.chip} ref={squareChipRef}>
            target · f4
          </div>
        </div>
      </section>
    </section>
  );
}
