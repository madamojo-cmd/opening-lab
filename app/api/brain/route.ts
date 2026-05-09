import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export const dynamic = "force-dynamic";

type LineKind = "attack" | "defense" | "plan" | "opponent";
type CueKind = "origin" | "target" | "support" | "danger" | "opponent";
type VisualLine = { from: string; to: string; kind: LineKind; label?: string; score?: number; reason?: string };
type VisualCue = { square: string; kind: CueKind; score?: number; reason?: string };
type View = { title: string; message: string; lines: VisualLine[]; cues: VisualCue[]; insight?: string };

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

function validSquare(square: unknown): square is string {
  return typeof square === "string" && /^[a-h][1-8]$/.test(square);
}

function fileIndex(square: string) { return square.charCodeAt(0) - 97; }
function rankIndex(square: string) { return Number(square[1]) - 1; }
function inBoard(f: number, r: number) { return f >= 0 && f < 8 && r >= 0 && r < 8; }
function toSquare(f: number, r: number) { return `${FILES[f]}${r + 1}`; }
function other(color: string) { return color === "w" ? "b" : "w"; }
function moveToUci(move: { from: string; to: string; promotion?: string }) { return `${move.from}${move.to}${move.promotion ?? ""}`; }

function pieceAt(game: Chess, square: string) {
  return game.get(square as any) as any;
}

function attacksFrom(game: Chess, square: string) {
  const piece = pieceAt(game, square);
  if (!piece) return [] as string[];
  const f = fileIndex(square);
  const r = rankIndex(square);
  const own = piece.color;
  const out: string[] = [];
  const push = (ff: number, rr: number) => { if (inBoard(ff, rr)) out.push(toSquare(ff, rr)); };
  const slide = (dirs: number[][]) => {
    for (const [df, dr] of dirs) {
      let ff = f + df;
      let rr = r + dr;
      while (inBoard(ff, rr)) {
        const sq = toSquare(ff, rr);
        out.push(sq);
        if (pieceAt(game, sq)) break;
        ff += df;
        rr += dr;
      }
    }
  };

  if (piece.type === "p") {
    const dir = own === "w" ? 1 : -1;
    push(f - 1, r + dir);
    push(f + 1, r + dir);
  } else if (piece.type === "n") {
    [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([df,dr]) => push(f + df, r + dr));
  } else if (piece.type === "b") {
    slide([[1,1],[-1,1],[1,-1],[-1,-1]]);
  } else if (piece.type === "r") {
    slide([[1,0],[-1,0],[0,1],[0,-1]]);
  } else if (piece.type === "q") {
    slide([[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]);
  } else if (piece.type === "k") {
    [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]].forEach(([df,dr]) => push(f + df, r + dr));
  }
  return Array.from(new Set(out));
}

function allPieces(game: Chess, color?: string) {
  const pieces: Array<{ square: string; color: string; type: string }> = [];
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col] as any;
      if (!piece) continue;
      const square = `${FILES[col]}${8 - row}`;
      if (!color || piece.color === color) pieces.push({ square, color: piece.color, type: piece.type });
    }
  }
  return pieces;
}

function attackersTo(game: Chess, target: string, color: string) {
  return allPieces(game, color)
    .filter((piece) => attacksFrom(game, piece.square).includes(target))
    .map((piece) => ({ from: piece.square, to: target, piece: piece.type, value: VALUES[piece.type] ?? 0 }));
}

function kingSquare(game: Chess, color: string) {
  return allPieces(game, color).find((p) => p.type === "k")?.square ?? null;
}

function kingRing(square: string | null) {
  if (!square) return [] as string[];
  const f = fileIndex(square), r = rankIndex(square);
  const out: string[] = [];
  for (let df = -1; df <= 1; df++) for (let dr = -1; dr <= 1; dr++) {
    if (df === 0 && dr === 0) continue;
    if (inBoard(f + df, r + dr)) out.push(toSquare(f + df, r + dr));
  }
  return out;
}

function openingTheme(openingName = "", userColor = "w") {
  const n = openingName.toLowerCase();
  const white = userColor === "w";
  if (n.includes("italian")) return { title: "Italian pressure", key: white ? ["f7", "d4", "e5"] : ["f2", "d6", "e4"], breakSq: white ? "d4" : "d6", message: "Develop quickly, pressure the f-pawn, castle, and prepare the central break." };
  if (n.includes("ruy")) return { title: "Pressure e5", key: white ? ["e5", "d4", "c6"] : ["e4", "b5", "d6"], breakSq: white ? "d4" : "b5", message: "Pressure the center, build with castling and rook support, then choose the central break." };
  if (n.includes("sicilian")) return { title: "Fight for d4", key: ["d4", "c5", "c4"], breakSq: white ? "d4" : "c5", message: "Sicilian play revolves around d4 and active counterplay." };
  if (n.includes("caro")) return { title: "Solid center", key: ["d5", "e4", "e5"], breakSq: white ? "c4" : "d5", message: "The Caro-Kann is about a resilient center and clean development." };
  if (n.includes("queen")) return { title: "Central tension", key: ["d5", "c4", "e4"], breakSq: white ? "e4" : "c6", message: "Queen's pawn openings use central tension to restrict the opponent and prepare a clean break." };
  if (n.includes("london")) return { title: "Stable setup", key: ["e5", "d4", "c7"], breakSq: white ? "c3" : "f6", message: "The London builds a reliable setup and looks for central or kingside improvements." };
  if (n.includes("french")) return { title: "Pawn-chain pressure", key: ["d4", "e5", "c5"], breakSq: white ? "c3" : "c5", message: "The French revolves around pawn-chain pressure and the ...c5 break." };
  if (n.includes("king")) return { title: "Counter the center", key: ["e5", "f5", "d4"], breakSq: white ? "d5" : "e5", message: "The King's Indian lets White build a center, then challenges it dynamically." };
  return { title: "Opening direction", key: userColor === "w" ? ["d4", "e4"] : ["d5", "e5"], breakSq: userColor === "w" ? "d4" : "d5", message: "Look for development, central control, and king safety." };
}

function buildAttackCandidates(game: Chess, userColor: string, openingName: string) {
  const enemy = other(userColor);
  const theme = openingTheme(openingName, userColor);
  const enemyKing = kingSquare(game, enemy);
  const ring = new Set(kingRing(enemyKing));
  const key = new Set(theme.key);
  const enemyPieces = new Map(allPieces(game, enemy).map((p) => [p.square, p]));
  const lines: VisualLine[] = [];
  const cues: VisualCue[] = [];
  const details: string[] = [];

  for (const piece of allPieces(game, userColor)) {
    for (const target of attacksFrom(game, piece.square)) {
      let score = 0;
      const enemyPiece = enemyPieces.get(target);
      if (enemyPiece) score += (VALUES[enemyPiece.type] ?? 0) / 10 + 40;
      if (key.has(target)) score += 55;
      if (ring.has(target)) score += 45;
      if (target === (userColor === "w" ? "f7" : "f2")) score += 60;
      if (["d4", "e4", "d5", "e5"].includes(target)) score += 25;
      if (score > 0) {
        lines.push({ from: piece.square, to: target, kind: "attack", label: enemyPiece ? `attacks ${enemyPiece.type}` : key.has(target) ? "theme" : "pressure", score, reason: enemyPiece ? "enemy piece under pressure" : "opening target square" });
        cues.push({ square: target, kind: enemyPiece ? "danger" : "target", score, reason: "attack target" });
      }
    }
  }

  lines.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  cues.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const topLines = uniqueLines(lines).slice(0, 4);
  const topCues = uniqueCues(cues).slice(0, 4);
  if (topLines[0]) details.push(`${topLines[0].from} → ${topLines[0].to}: ${topLines[0].reason}`);
  return { lines: topLines, cues: topCues, details };
}

function buildDefenseCandidates(game: Chess, userColor: string) {
  const enemy = other(userColor);
  const lines: VisualLine[] = [];
  const cues: VisualCue[] = [];
  const details: string[] = [];

  for (const piece of allPieces(game, userColor)) {
    if (piece.type === "k") continue;
    const defenders = attackersTo(game, piece.square, userColor).filter((a) => a.from !== piece.square);
    const enemyAttackers = attackersTo(game, piece.square, enemy);
    const pieceValue = VALUES[piece.type] ?? 0;
    if (enemyAttackers.length && !defenders.length) {
      cues.push({ square: piece.square, kind: "danger", score: pieceValue / 8 + 100, reason: "loose piece under attack" });
      lines.push({ from: enemyAttackers[0].from, to: piece.square, kind: "defense", label: "threat", score: pieceValue / 8 + 100, reason: "opponent threat to your piece" });
      details.push(`${piece.square} is under attack and has no clear defender.`);
    } else if (enemyAttackers.length && defenders.length) {
      cues.push({ square: piece.square, kind: "support", score: pieceValue / 10 + 70, reason: "contested but defended" });
      lines.push({ from: defenders[0].from, to: piece.square, kind: "defense", label: "defends", score: pieceValue / 10 + 70, reason: "your piece is defended" });
      details.push(`${piece.square} is contested, but ${defenders[0].from} helps defend it.`);
    } else if (defenders.length && pieceValue >= 320) {
      cues.push({ square: piece.square, kind: "support", score: pieceValue / 14, reason: "valuable defended piece" });
      lines.push({ from: defenders[0].from, to: piece.square, kind: "defense", label: "protected", score: pieceValue / 14, reason: "defended valuable piece" });
    }
  }

  lines.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  cues.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return { lines: uniqueLines(lines).slice(0, 4), cues: uniqueCues(cues).slice(0, 4), details };
}

function uniqueLines(lines: VisualLine[]) {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = `${line.from}-${line.to}-${line.kind}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueCues(cues: VisualCue[]) {
  const seen = new Set<string>();
  return cues.filter((cue) => {
    if (seen.has(cue.square)) return false;
    seen.add(cue.square);
    return true;
  });
}

function scoreMove(fen: string, move: any, skill = 1400) {
  let score = 10;
  const center = new Set(["d4", "e4", "d5", "e5"]);
  const near = new Set(["c3", "d3", "e3", "f3", "c4", "f4", "c5", "f5", "c6", "d6", "e6", "f6"]);
  if (move.captured) score += (VALUES[move.captured] ?? 0) - Math.floor((VALUES[move.piece] ?? 0) * 0.08);
  if (move.promotion) score += VALUES[move.promotion] ?? 800;
  if (move.flags?.includes("k") || move.flags?.includes("q")) score += 65;
  if (center.has(move.to)) score += 45;
  if (near.has(move.to)) score += 18;
  if ((move.piece === "n" || move.piece === "b") && (move.from[1] === "1" || move.from[1] === "8")) score += 35;
  if (move.piece === "q") score -= skill < 1600 ? 16 : 7;
  try {
    const after = new Chess(fen);
    after.move({ from: move.from, to: move.to, promotion: move.promotion ?? "q" });
    if (after.isCheckmate()) score += 100000;
    else if (after.isCheck()) score += 80;
  } catch {}
  return score + ((move.from.charCodeAt(0) + move.to.charCodeAt(0) + move.to.charCodeAt(1)) % 13);
}

async function getEngineLines(fen: string, skill = 1400) {
  const endpoint = process.env.STOCKFISH_ENDPOINT;
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fen, skill, multiPv: 5 }),
      });
      if (response.ok) {
        const data = await response.json();
        const pvs = Array.isArray(data?.pvs) ? data.pvs : [];
        return {
          source: "stockfish",
          fallback: false,
          pvs: pvs.slice(0, 5).map((pv: any) => ({
            san: String(pv.san ?? pv.move ?? pv.line ?? ""),
            uci: String(pv.uci ?? pv.line ?? "").split(/\s+/)[0],
            cp: typeof pv.cp === "number" ? pv.cp : undefined,
            line: String(pv.line ?? pv.uci ?? ""),
          })),
        };
      }
    } catch {}
  }

  try {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true }) as any[];
    const ranked = moves.map((move) => ({ move, score: scoreMove(fen, move, skill) })).sort((a, b) => b.score - a.score).slice(0, 5);
    return {
      source: "engine-style-fallback",
      fallback: true,
      pvs: ranked.map((item) => ({ san: item.move.san, uci: moveToUci(item.move), cp: item.score, line: moveToUci(item.move) })),
    };
  } catch {
    return { source: "engine-error", fallback: true, pvs: [] as any[] };
  }
}

function sanitizeLine(line: any, fallbackKind: LineKind = "plan"): VisualLine | null {
  if (!validSquare(line?.from) || !validSquare(line?.to)) return null;
  const kind = ["attack", "defense", "plan", "opponent"].includes(line?.kind) ? line.kind : fallbackKind;
  return { from: line.from, to: line.to, kind, label: typeof line?.label === "string" ? line.label.slice(0, 28) : "" };
}

function sanitizeCue(cue: any, fallbackKind: CueKind = "target"): VisualCue | null {
  if (!validSquare(cue?.square)) return null;
  const kind = ["origin", "target", "support", "danger", "opponent"].includes(cue?.kind) ? cue.kind : fallbackKind;
  return { square: cue.square, kind };
}

function buildCandidates(game: Chess, body: any, engineLines: any[]) {
  const userColor = body.userColor || "w";
  const theme = openingTheme(body.openingName, userColor);
  const expected = Array.isArray(body.expectedMoves) ? body.expectedMoves : [];
  const expectedMove = expected[0];
  const attack = buildAttackCandidates(game, userColor, body.openingName);
  const defense = buildDefenseCandidates(game, userColor);
  const planLines: VisualLine[] = [];

  if (expectedMove?.uci && expectedMove.uci.length >= 4) {
    planLines.push({ from: expectedMove.uci.slice(0, 2), to: expectedMove.uci.slice(2, 4), kind: "plan", label: expectedMove.san, score: 999, reason: "approved training move" });
  } else if (engineLines[0]?.uci && engineLines[0].uci.length >= 4) {
    planLines.push({ from: engineLines[0].uci.slice(0, 2), to: engineLines[0].uci.slice(2, 4), kind: "plan", label: engineLines[0].san, score: engineLines[0].cp ?? 50, reason: "engine continuation" });
  }

  const planCues = planLines[0]?.to ? [{ square: planLines[0].to, kind: "target" as CueKind, score: 999, reason: "plan destination" }] : theme.key.filter(validSquare).slice(0, 1).map((square) => ({ square, kind: "target" as CueKind }));

  const candidateSquares = Array.from(new Set([
    ...theme.key,
    ...attack.cues.map((cue) => cue.square),
    ...defense.cues.map((cue) => cue.square),
    ...planCues.map((cue) => cue.square),
  ])).filter(validSquare).slice(0, 12);

  const candidateArrows = [...attack.lines, ...defense.lines, ...planLines].filter((line) => validSquare(line.from) && validSquare(line.to)).slice(0, 12);

  return {
    attack: {
      title: attack.lines[0] ? "Your best pressure" : "Your attack",
      message: attack.lines[0] ? `${attack.lines[0].from} → ${attack.lines[0].to}: ${attack.lines[0].reason ?? "pressure"}.` : theme.message,
      lines: attack.lines.slice(0, 3),
      cues: attack.cues.slice(0, 3),
      insight: attack.details[0] ?? "Attack uses real attacked squares and opening targets.",
    },
    defense: {
      title: defense.lines[0]?.reason?.includes("opponent") ? "Defensive alert" : "Your defensive structure",
      message: defense.details[0] ?? "Defense shows defended pieces, loose pieces, and opponent pressure against your side.",
      lines: defense.lines.slice(0, 3),
      cues: defense.cues.slice(0, 3),
      insight: defense.details[0] ?? "Defense uses real attacked-by/defended-by relationships.",
    },
    plan: {
      title: expectedMove?.san ? `Next move: ${expectedMove.san}` : engineLines[0]?.san ? `Next idea: ${engineLines[0].san}` : theme.title,
      message: expectedMove?.san ? `The restricted trainer expects ${expectedMove.san} from this position.` : "The plan view shows the next verified idea from this position.",
      lines: planLines.slice(0, 1),
      cues: planCues.slice(0, 2),
      insight: expectedMove?.san ? "Plan is anchored to the approved repertoire move." : "Plan uses engine continuation or opening theme after the book ends.",
    },
    candidateSquares,
    candidateArrows,
    diagnostics: {
      attackDetails: attack.details,
      defenseDetails: defense.details,
      openingTheme: theme,
    },
  };
}

function fallbackAnnotation(body: any, candidates: any, engine: any) {
  const expectedMove = body?.expectedMoves?.[0]?.san || engine.pvs?.[0]?.san || "the highlighted move";
  return {
    source: "brain-fallback",
    fallback: true,
    selectedView: body.selectedView || "plan",
    headline: body.eventType === "wrong_move" ? "Training mistake logged" : "Next training idea",
    mainExplanation: body.eventType === "wrong_move" ? `${body.attemptedMoveSan || "That move"} is legal, but this restricted opening drill expects ${expectedMove}.` : `${expectedMove} is the key idea in this position.`,
    visualExplanation: "The board uses real attack maps, defense maps, engine candidates, and opening context to select the teaching cue.",
    planExplanation: body.trainingMode === "restricted" ? "Restricted mode keeps you inside the selected opening instead of accepting random legal play." : "Continuation mode accepts legal moves and evaluates them.",
    nextPlan: body?.expectedMoves?.[0]?.san ? `Play ${body.expectedMoves[0].san} when it is your turn.` : "Follow the highlighted plan cue.",
    keySquares: candidates.candidateSquares.slice(0, 3),
    planArrows: candidates.plan.lines,
    attack: candidates.attack,
    defense: candidates.defense,
    plan: candidates.plan,
    threatNote: candidates.defense.insight ?? "",
    suppress: [],
    confidence: "fallback",
  };
}

function sanitizeAnnotation(raw: any, base: any) {
  function sanitizeView(name: "attack" | "defense" | "plan") {
    const fallback = base[name];
    const view = raw?.[name] || {};
    const lines = Array.isArray(view.lines) ? view.lines.map((line: any) => sanitizeLine(line, name)).filter(Boolean).slice(0, name === "plan" ? 1 : 2) : [];
    const cues = Array.isArray(view.cues) ? view.cues.map((cue: any) => sanitizeCue(cue, name === "defense" ? "support" : "target")).filter(Boolean).slice(0, 3) : [];
    return {
      title: typeof view.title === "string" && view.title.trim() ? view.title.slice(0, 80) : fallback.title,
      message: typeof view.message === "string" && view.message.trim() ? view.message.slice(0, 300) : fallback.message,
      lines: lines.length ? lines : fallback.lines,
      cues: cues.length ? cues : fallback.cues,
      insight: typeof view.insight === "string" ? view.insight.slice(0, 260) : fallback.insight,
    };
  }

  return {
    source: raw?.source || base.source,
    fallback: Boolean(raw?.fallback ?? base.fallback),
    selectedView: ["attack", "defense", "plan"].includes(raw?.selectedView) ? raw.selectedView : base.selectedView,
    headline: typeof raw?.headline === "string" && raw.headline.trim() ? raw.headline.slice(0, 90) : base.headline,
    mainExplanation: typeof raw?.mainExplanation === "string" && raw.mainExplanation.trim() ? raw.mainExplanation.slice(0, 440) : base.mainExplanation,
    visualExplanation: typeof raw?.visualExplanation === "string" && raw.visualExplanation.trim() ? raw.visualExplanation.slice(0, 340) : base.visualExplanation,
    planExplanation: typeof raw?.planExplanation === "string" && raw.planExplanation.trim() ? raw.planExplanation.slice(0, 380) : base.planExplanation,
    nextPlan: typeof raw?.nextPlan === "string" && raw.nextPlan.trim() ? raw.nextPlan.slice(0, 240) : base.nextPlan,
    keySquares: Array.isArray(raw?.keySquares) ? raw.keySquares.filter(validSquare).slice(0, 4) : base.keySquares,
    planArrows: Array.isArray(raw?.planArrows) ? raw.planArrows.map((line: any) => sanitizeLine(line, "plan")).filter(Boolean).slice(0, 2) : base.planArrows,
    attack: sanitizeView("attack"),
    defense: sanitizeView("defense"),
    plan: sanitizeView("plan"),
    threatNote: typeof raw?.threatNote === "string" ? raw.threatNote.slice(0, 280) : base.threatNote,
    suppress: Array.isArray(raw?.suppress) ? raw.suppress.slice(0, 8) : base.suppress,
    confidence: typeof raw?.confidence === "string" ? raw.confidence : base.confidence,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_COACH_MODEL || "gpt-4o-mini";

  let game: Chess;
  try { game = new Chess(body.fen); } catch { return NextResponse.json({ error: "Invalid FEN" }, { status: 400 }); }

  const started = Date.now();
  const skill = Number(body.skill ?? 1400) || 1400;
  const engine = await getEngineLines(body.fen, skill);
  const candidates = buildCandidates(game, body, engine.pvs);
  const fallback = fallbackAnnotation(body, candidates, engine);

  const facts = {
    fen: body.fen,
    normalizedFen: body.fen.split(" ").slice(0, 4).join(" "),
    turn: game.turn(),
    openingName: body.openingName,
    userColor: body.userColor,
    trainingMode: body.trainingMode,
    eventType: body.eventType,
    moveHistory: body.moveHistory ?? [],
    legalMoveCount: game.moves().length,
    approvedTrainingMoves: body.expectedMoves ?? [],
    opponentBookMoves: body.opponentBookMoves ?? [],
  };

  if (!apiKey || body.skipGpt) {
    return NextResponse.json({
      pipeline: { facts: "complete", engine: engine.source, gpt: !apiKey ? "missing-api-key" : "skipped", visual: "fallback", latencyMs: Date.now() - started },
      engine,
      annotation: fallback,
      candidates,
      facts,
    });
  }

  try {
    const gptInput = {
      facts,
      ratingPool: body.ratingPool,
      selectedView: body.selectedView || "plan",
      expectedMove: body.expectedMoves?.[0],
      attemptedMoveSan: body.attemptedMoveSan,
      lastMoveSan: body.lastMoveSan,
      lastMoveUci: body.lastMoveUci,
      lichessMoves: Array.isArray(body.lichessMoves) ? body.lichessMoves.slice(0, 8) : [],
      engineTopMoves: engine.pvs.slice(0, 5),
      candidateViews: { attack: candidates.attack, defense: candidates.defense, plan: candidates.plan },
      candidateSquares: candidates.candidateSquares,
      candidateArrows: candidates.candidateArrows,
      diagnostics: candidates.diagnostics,
      instruction: "Return the final visual and verbal annotation. The client renders your attack/defense/plan objects as the source of truth. Use only candidateSquares/candidateArrows or explicit move coordinates. Attack should show what the user is pressuring. Defense should show user-side defended/loose/threatened pieces. Plan should prioritize the expected training move in restricted mode.",
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.12,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are Blundr's elite chess opening teaching selector. Return strict JSON only. Do not invent legal moves, tactics, coordinates, or engine claims. Use verified candidate fields only. Make Attack, Defense, and Plan genuinely different: Attack = user pressure/targets; Defense = user pieces/squares protected, loose, or under threat; Plan = next approved move/idea. Required keys: selectedView, headline, mainExplanation, visualExplanation, planExplanation, nextPlan, keySquares, planArrows, attack, defense, plan, threatNote, suppress, confidence. Each view needs title, message, lines, cues, insight." },
          { role: "user", content: JSON.stringify(gptInput) },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        pipeline: { facts: "complete", engine: engine.source, gpt: `error-${response.status}`, visual: "fallback", latencyMs: Date.now() - started },
        engine,
        annotation: { ...fallback, reason: `OpenAI returned ${response.status}` },
        candidates,
        facts,
      });
    }

    const data = await response.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    const annotation = sanitizeAnnotation({ source: "openai", fallback: false, ...parsed }, fallback);

    return NextResponse.json({
      pipeline: { facts: "complete", engine: engine.source, gpt: "openai", visual: "gpt-validated", latencyMs: Date.now() - started },
      engine,
      annotation,
      candidates,
      facts,
    });
  } catch (error) {
    return NextResponse.json({
      pipeline: { facts: "complete", engine: engine.source, gpt: "exception", visual: "fallback", latencyMs: Date.now() - started },
      engine,
      annotation: { ...fallback, reason: error instanceof Error ? error.message : "GPT call failed" },
      candidates,
      facts,
    });
  }
}
