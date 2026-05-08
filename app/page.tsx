"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Chess } from "chess.js";
import {
  BarChart3,
  Beaker,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  Eye,
  Flame,
  Home,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

type Tab = "home" | "train" | "review" | "progress" | "repertoire";
type RepertoireColor = "white" | "black";
type ChessColor = "w" | "b";
type ExplorerSource = "lichess" | "masters";

type Repertoire = {
  id: string;
  name: string;
  color: RepertoireColor;
  lines: string[][];
  description: string;
  custom?: boolean;
};

type Continuation = {
  san: string;
  uci: string;
  color: ChessColor;
  resultingFen: string;
};

type Mistake = {
  fen: string;
  expectedMove: string;
  playedMove: string;
  count: number;
  opening: string;
  repertoireId: string;
};

type Progress = {
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  trainedPositions: Record<string, boolean>;
  mistakes: Record<string, Mistake>;
};

type ExplorerMove = {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  total: number;
  pct: number;
  whitePct: number;
  drawPct: number;
  blackPct: number;
  averageRating?: number;
};

type ExplorerPayload = {
  source: ExplorerSource | "local-explorer-fallback";
  requestedSource?: ExplorerSource;
  fallback?: boolean;
  reason?: string;
  upstreamStatus?: number;
  white?: number;
  draws?: number;
  black?: number;
  opening?: {
    eco?: string;
    name?: string;
  };
  moves?: Array<{
    uci: string;
    san: string;
    white?: number;
    draws?: number;
    black?: number;
    averageRating?: number;
  }>;
};
type EngineLine = {
  san: string;
  uci: string;
  cp?: number;
  mate?: number;
  depth?: number;
  line: string;
  note?: string;
  source?: "stockfish-local" | "cloud-eval" | "local-heuristic";
};

type CoachContent = {
  openingName: string;
  summary: string;
  mainPlan: string;
  goals: string[];
  attackingIdeas: string[];
  pawnBreaks: string[];
  idealPiecePlacement: string[];
  variations: Array<{ name: string; goal: string; keyMoves: string[] }>;
  moveFeedback: {
    move: string;
    whyMove: string;
    planConnection: string;
    nextGoal: string;
    warning: string;
    alternatives: string[];
  };
  confidenceNote: string;
  fallback?: boolean;
};

type OpeningSeed = {
  eco: string;
  name: string;
  color: RepertoireColor;
  line: string[];
};


const DEFAULT_PROGRESS: Progress = {
  attempts: 0,
  correct: 0,
  incorrect: 0,
  streak: 0,
  trainedPositions: {},
  mistakes: {},
};

const BASE_REPERTOIRES: Repertoire[] = [
  {
    id: "white-1e4-complete",
    name: "1.e4 Complete White Repertoire",
    color: "white",
    description: "A broad 1.e4 library against the most common black replies, designed for deep practical training.",
    lines: [
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3", "d6", "O-O", "O-O", "Re1", "a6", "Bb3", "Ba7", "Nbd2"],
      ["e4", "e5", "Nf3", "Nf6", "Nxe5", "d6", "Nf3", "Nxe4", "d4", "d5", "Bd3", "Be7", "O-O", "O-O", "Re1"],
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "Be7", "Qd2"],
      ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "d6", "Be3", "g6", "f3", "Bg7", "Qd2", "O-O"],
      ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "e5", "Nfd7", "f4", "c5", "Nf3", "Nc6", "Be3", "Qb6", "Na4"],
      ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6", "Nf3", "Nd7", "h5", "Bh7"],
      ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5", "d4", "Nf6", "Nf3", "c6", "Bc4", "Bf5", "O-O"],
      ["e4", "g6", "d4", "Bg7", "Nc3", "d6", "Be3", "Nf6", "f3", "O-O", "Qd2", "c6", "O-O-O"],
    ],
  },
  {
    id: "white-ruy-lopez",
    name: "Ruy Lopez Main Repertoire",
    color: "white",
    description: "A deep Ruy Lopez map including Closed, Berlin, and Open-style structures.",
    lines: [
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Nb8", "d4"],
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "d4", "Nd6", "Bxc6", "dxc6", "dxe5", "Nf5", "Qxd8+", "Kxd8"],
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Nxe4", "d4", "b5", "Bb3", "d5", "dxe5", "Be6"],
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "f5", "d3", "fxe4", "dxe4", "Nf6", "O-O", "Bc5", "Nc3"],
    ],
  },
  {
    id: "white-italian-game",
    name: "Italian Game Deep Repertoire",
    color: "white",
    description: "A calm but deep Italian repertoire with Giuoco Pianissimo and sharp central breaks.",
    lines: [
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3", "d6", "O-O", "O-O", "Re1", "a6", "Bb3", "Ba7", "Nbd2"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "d3", "Bc5", "c3", "d6", "O-O", "O-O", "Re1", "a6", "Bb3"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "e5", "d5", "Bb5", "Ne4", "cxd4"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Be7", "d4", "d6", "Nc3", "Nf6", "O-O", "O-O", "Re1"],
    ],
  },
  {
    id: "white-sicilian-open",
    name: "Open Sicilian White Repertoire",
    color: "white",
    description: "A principled Open Sicilian repertoire against Najdorf, Dragon, Classical, and Taimanov structures.",
    lines: [
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "Be7", "Qd2"],
      ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "d6", "Be3", "g6", "f3", "Bg7", "Qd2", "O-O", "O-O-O"],
      ["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "Nc6", "Nc3", "Qc7", "Be3", "a6", "Qd2", "Nf6", "O-O-O"],
      ["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "a6", "Bd3", "Nf6", "O-O", "Qc7", "Qe2"],
    ],
  },
  {
    id: "white-french-caro",
    name: "White vs French and Caro-Kann",
    color: "white",
    description: "Focused anti-French and anti-Caro-Kann lines with space, development, and practical plans.",
    lines: [
      ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "e5", "Nfd7", "f4", "c5", "Nf3", "Nc6", "Be3", "Qb6", "Na4"],
      ["e4", "e6", "d4", "d5", "Nd2", "Nf6", "e5", "Nfd7", "Bd3", "c5", "c3", "Nc6", "Ne2"],
      ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6", "Nf3", "Nd7", "h5"],
      ["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3", "e6", "Be2", "c5", "O-O", "Nc6", "Be3"],
    ],
  },
  {
    id: "white-1d4-complete",
    name: "1.d4 Complete White Repertoire",
    color: "white",
    description: "A broad queen's pawn library covering QGD, Slav, Nimzo, KID, Grunfeld, and Dutch setups.",
    lines: [
      ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "h6", "Bh4", "b6", "cxd5"],
      ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "e3", "e6", "Bxc4"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "O-O", "Bd3", "d5", "Nf3", "c5", "O-O"],
      ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5", "O-O"],
      ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7", "Nf3"],
      ["d4", "f5", "g3", "Nf6", "Bg2", "g6", "Nf3", "Bg7", "O-O", "O-O", "c4"],
    ],
  },
  {
    id: "white-london-system",
    name: "London System",
    color: "white",
    description: "A practical London repertoire that can reach deep middlegame structures with minimal memorization.",
    lines: [
      ["d4", "Nf6", "Bf4", "d5", "e3", "e6", "Nf3", "Bd6", "Bg3", "O-O", "Bd3", "b6", "Nbd2"],
      ["d4", "d5", "Bf4", "Nf6", "e3", "e6", "Nf3", "c5", "c3", "Nc6", "Nbd2", "Bd6"],
      ["d4", "Nf6", "Bf4", "g6", "e3", "Bg7", "Nf3", "O-O", "Be2", "d6", "h3", "Nbd7"],
      ["d4", "d5", "Nf3", "Nf6", "Bf4", "c5", "e3", "Nc6", "c3", "Qb6", "Qb3"],
    ],
  },
  {
    id: "white-english-reti",
    name: "English and Reti Systems",
    color: "white",
    description: "Flexible flank openings for positional development and transposition control.",
    lines: [
      ["c4", "e5", "Nc3", "Nf6", "g3", "d5", "cxd5", "Nxd5", "Bg2", "Nb6", "Nf3", "Nc6"],
      ["c4", "Nf6", "Nc3", "e5", "g3", "d5", "cxd5", "Nxd5", "Bg2", "Nb6", "Nf3"],
      ["Nf3", "d5", "g3", "Nf6", "Bg2", "g6", "O-O", "Bg7", "d3", "O-O", "Nbd2"],
      ["Nf3", "Nf6", "c4", "g6", "g3", "Bg7", "Bg2", "O-O", "O-O", "d6", "Nc3"],
    ],
  },
  {
    id: "black-caro-kann-complete",
    name: "Caro-Kann Complete Black Repertoire",
    color: "black",
    description: "A complete practical Caro-Kann repertoire with Advance, Classical, Exchange, Fantasy, and Two Knights lines.",
    lines: [
      ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6", "Nf3", "Nd7", "h5", "Bh7"],
      ["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3", "e6", "Be2", "c5", "O-O", "Nc6", "Be3", "Qb6"],
      ["e4", "c6", "d4", "d5", "exd5", "cxd5", "Nf3", "Nf6", "Bd3", "Nc6", "c3", "Bg4"],
      ["e4", "c6", "d4", "d5", "f3", "dxe4", "fxe4", "e5", "Nf3", "Bg4", "Bc4", "Nd7"],
      ["e4", "c6", "Nf3", "d5", "Nc3", "Bg4", "h3", "Bxf3", "Qxf3", "e6"],
    ],
  },
  {
    id: "black-sicilian-complete",
    name: "Sicilian Complete Black Repertoire",
    color: "black",
    description: "A Sicilian framework against Open Sicilian, Alapin, Closed, Grand Prix, and Rossolimo setups.",
    lines: [
      ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3", "e5", "Nb3", "Be6", "f3", "Be7"],
      ["e4", "c5", "Nf3", "Nc6", "Bb5", "g6", "O-O", "Bg7", "Re1", "e5", "c3", "Nge7"],
      ["e4", "c5", "c3", "Nf6", "e5", "Nd5", "d4", "cxd4", "Nf3", "Nc6", "cxd4", "d6"],
      ["e4", "c5", "Nc3", "Nc6", "g3", "g6", "Bg2", "Bg7", "d3", "d6", "f4"],
      ["e4", "c5", "f4", "d5", "exd5", "Nf6", "Bb5+", "Bd7", "Bc4", "b5"],
    ],
  },
  {
    id: "black-french-complete",
    name: "French Defense Complete Black Repertoire",
    color: "black",
    description: "A practical French Defense library against Advance, Tarrasch, Classical, Exchange, and King's Indian Attack structures.",
    lines: [
      ["e4", "e6", "d4", "d5", "e5", "c5", "c3", "Nc6", "Nf3", "Qb6", "a3", "Nh6", "b4"],
      ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "e5", "Nfd7", "f4", "c5", "Nf3", "Nc6"],
      ["e4", "e6", "d4", "d5", "Nd2", "Nf6", "e5", "Nfd7", "Bd3", "c5", "c3", "Nc6"],
      ["e4", "e6", "d4", "d5", "exd5", "exd5", "Nf3", "Nf6", "Bd3", "Bd6", "O-O", "O-O"],
      ["e4", "e6", "d3", "d5", "Nd2", "Nf6", "Ngf3", "c5", "g3", "Nc6", "Bg2"],
    ],
  },
  {
    id: "black-1d4-complete",
    name: "Black vs 1.d4 Complete Repertoire",
    color: "black",
    description: "A full black repertoire against 1.d4 with QGD, Slav, Nimzo, King's Indian, and Dutch options.",
    lines: [
      ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "h6", "Bh4", "b6"],
      ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "e3", "e6"],
      ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "O-O", "Bd3", "d5", "Nf3", "c5"],
      ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"],
      ["d4", "f5", "g3", "Nf6", "Bg2", "g6", "Nf3", "Bg7", "O-O", "O-O", "c4"],
    ],
  },
  {
    id: "black-e5-classical",
    name: "Classical 1...e5 Black Repertoire",
    color: "black",
    description: "A classical black repertoire against 1.e4 using Open Games, Ruy Lopez, Italian, Scotch, and King's Gambit responses.",
    lines: [
      ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3", "d6", "O-O", "O-O"],
      ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5", "Be3", "Qf6", "c3", "Nge7"],
      ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nf6"],
      ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "Bb5", "Bb4", "O-O", "O-O"],
    ],
  },
  {
    id: "black-scandinavian",
    name: "Scandinavian Defense",
    color: "black",
    description: "A compact 1...d5 repertoire for fast development and early queen activity.",
    lines: [
      ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5", "d4", "Nf6", "Nf3", "c6", "Bc4", "Bf5"],
      ["e4", "d5", "exd5", "Nf6", "d4", "Nxd5", "Nf3", "g6", "c4", "Nb6"],
      ["e4", "d5", "Nc3", "d4", "Nce2", "e5", "Nf3", "Nc6", "Ng3", "g6"],
    ],
  },
  {
    id: "wild-gambit-lab",
    name: "Wild Gambit Lab",
    color: "white",
    description: "A fun tactical lab for King's Gambit, Vienna, Danish, Evans, and Smith-Morra structures.",
    lines: [
      ["e4", "e5", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ne5", "Nf6", "Bc4", "d5"],
      ["e4", "e5", "Nc3", "Nf6", "f4", "d5", "fxe5", "Nxe4", "Nf3", "Be7"],
      ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "cxb2", "Bxb2", "d5"],
      ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4", "Bxb4", "c3", "Ba5", "d4"],
      ["e4", "c5", "d4", "cxd4", "c3", "dxc3", "Nxc3", "Nc6", "Nf3", "d6", "Bc4"],
    ],
  },
]

const PIECE_SYMBOLS: Record<string, string> = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];


const RATING_PRESETS = [
  // Lichess Explorer's lowest rating bucket is 1000. For sub-1000 users,
  // we use the 1000 pool and mix in the app's legal-move fallback when book data ends.
  { label: "New", value: "1000", target: "Under 1000 simulated" },
  { label: "Beginner", value: "1000,1200", target: "1000–1200" },
  { label: "Improver", value: "1000,1200,1400", target: "1000–1400" },
  { label: "Club", value: "1200,1400,1600", target: "1200–1800" },
  { label: "Strong club", value: "1600,1800", target: "1600–2000" },
  { label: "Advanced", value: "1800,2000,2200", target: "1800–2400" },
  { label: "Expert+", value: "2200,2500", target: "2200+" },
  { label: "All ratings", value: "1000,1200,1400,1600,1800,2000,2200,2500", target: "All levels" },
];

const SPEED_PRESETS = [
  { label: "Blitz/Rapid", value: "blitz,rapid" },
  { label: "Rapid/Classical", value: "rapid,classical" },
  { label: "All main", value: "blitz,rapid,classical" },
  { label: "Bullet/Blitz", value: "bullet,blitz" },
];

function getRatingLabel(value: string) {
  return RATING_PRESETS.find((preset) => preset.value === value)?.target ?? value;
}

const OPENING_UNIVERSE: OpeningSeed[] = [
  { eco: "A00", name: "Van't Kruijs Opening", color: "white", line: ["e3"] },
  { eco: "A00", name: "Grob Opening", color: "white", line: ["g4"] },
  { eco: "A00", name: "Bird Opening", color: "white", line: ["f4"] },
  { eco: "A00", name: "Nimzowitsch-Larsen Attack", color: "white", line: ["b3"] },
  { eco: "A04", name: "Reti Opening", color: "white", line: ["Nf3", "d5", "g3", "Nf6", "Bg2"] },
  { eco: "A10", name: "English Opening", color: "white", line: ["c4", "e5", "Nc3", "Nf6", "g3"] },
  { eco: "A13", name: "English Opening: Agincourt", color: "white", line: ["c4", "e6", "Nf3", "d5", "g3"] },
  { eco: "A20", name: "English Opening: King's English", color: "white", line: ["c4", "e5", "Nc3", "Nf6", "g3"] },
  { eco: "A40", name: "Queen's Pawn Game", color: "white", line: ["d4"] },
  { eco: "A45", name: "Trompowsky Attack", color: "white", line: ["d4", "Nf6", "Bg5"] },
  { eco: "A48", name: "London System", color: "white", line: ["d4", "Nf6", "Bf4", "d5", "e3"] },
  { eco: "A50", name: "Indian Game", color: "white", line: ["d4", "Nf6", "c4"] },
  { eco: "A80", name: "Dutch Defense", color: "black", line: ["d4", "f5", "g3", "Nf6"] },
  { eco: "B00", name: "King's Pawn Game", color: "white", line: ["e4"] },
  { eco: "B01", name: "Scandinavian Defense", color: "black", line: ["e4", "d5", "exd5", "Qxd5", "Nc3"] },
  { eco: "B02", name: "Alekhine Defense", color: "black", line: ["e4", "Nf6", "e5", "Nd5", "d4"] },
  { eco: "B06", name: "Modern Defense", color: "black", line: ["e4", "g6", "d4", "Bg7", "Nc3"] },
  { eco: "B07", name: "Pirc Defense", color: "black", line: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"] },
  { eco: "B10", name: "Caro-Kann Defense", color: "black", line: ["e4", "c6", "d4", "d5"] },
  { eco: "B12", name: "Caro-Kann: Advance", color: "black", line: ["e4", "c6", "d4", "d5", "e5", "Bf5"] },
  { eco: "B13", name: "Caro-Kann: Exchange", color: "black", line: ["e4", "c6", "d4", "d5", "exd5", "cxd5"] },
  { eco: "B15", name: "Caro-Kann: Classical", color: "black", line: ["e4", "c6", "d4", "d5", "Nc3", "dxe4"] },
  { eco: "B20", name: "Sicilian Defense", color: "black", line: ["e4", "c5"] },
  { eco: "B22", name: "Sicilian: Alapin", color: "black", line: ["e4", "c5", "c3", "Nf6"] },
  { eco: "B23", name: "Sicilian: Closed", color: "black", line: ["e4", "c5", "Nc3", "Nc6", "g3"] },
  { eco: "B27", name: "Sicilian: Hyperaccelerated Dragon", color: "black", line: ["e4", "c5", "Nf3", "g6"] },
  { eco: "B30", name: "Sicilian: Old Sicilian", color: "black", line: ["e4", "c5", "Nf3", "Nc6"] },
  { eco: "B33", name: "Sicilian: Sveshnikov", color: "black", line: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5"] },
  { eco: "B40", name: "Sicilian: French Variation", color: "black", line: ["e4", "c5", "Nf3", "e6"] },
  { eco: "B50", name: "Sicilian: Modern Variations", color: "black", line: ["e4", "c5", "Nf3", "d6"] },
  { eco: "B70", name: "Sicilian: Dragon", color: "black", line: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"] },
  { eco: "B90", name: "Sicilian: Najdorf", color: "black", line: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"] },
  { eco: "C00", name: "French Defense", color: "black", line: ["e4", "e6", "d4", "d5"] },
  { eco: "C02", name: "French: Advance", color: "black", line: ["e4", "e6", "d4", "d5", "e5", "c5"] },
  { eco: "C03", name: "French: Tarrasch", color: "black", line: ["e4", "e6", "d4", "d5", "Nd2", "Nf6"] },
  { eco: "C10", name: "French: Classical", color: "black", line: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"] },
  { eco: "C20", name: "King's Pawn Opening", color: "white", line: ["e4", "e5"] },
  { eco: "C21", name: "Danish Gambit", color: "white", line: ["e4", "e5", "d4", "exd4", "c3"] },
  { eco: "C23", name: "Bishop's Opening", color: "white", line: ["e4", "e5", "Bc4"] },
  { eco: "C25", name: "Vienna Game", color: "white", line: ["e4", "e5", "Nc3", "Nf6", "f4"] },
  { eco: "C30", name: "King's Gambit", color: "white", line: ["e4", "e5", "f4"] },
  { eco: "C40", name: "Petrov Defense", color: "black", line: ["e4", "e5", "Nf3", "Nf6"] },
  { eco: "C41", name: "Philidor Defense", color: "black", line: ["e4", "e5", "Nf3", "d6"] },
  { eco: "C44", name: "Scotch Game", color: "white", line: ["e4", "e5", "Nf3", "Nc6", "d4"] },
  { eco: "C50", name: "Italian Game", color: "white", line: ["e4", "e5", "Nf3", "Nc6", "Bc4"] },
  { eco: "C51", name: "Evans Gambit", color: "white", line: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"] },
  { eco: "C55", name: "Two Knights Defense", color: "black", line: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"] },
  { eco: "C60", name: "Ruy Lopez", color: "white", line: ["e4", "e5", "Nf3", "Nc6", "Bb5"] },
  { eco: "C65", name: "Ruy Lopez: Berlin", color: "black", line: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"] },
  { eco: "C70", name: "Ruy Lopez: Morphy Defense", color: "black", line: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"] },
  { eco: "D00", name: "Queen's Pawn Game", color: "white", line: ["d4", "d5"] },
  { eco: "D02", name: "Queen's Pawn: London", color: "white", line: ["d4", "d5", "Nf3", "Nf6", "Bf4"] },
  { eco: "D06", name: "Queen's Gambit", color: "white", line: ["d4", "d5", "c4"] },
  { eco: "D10", name: "Slav Defense", color: "black", line: ["d4", "d5", "c4", "c6"] },
  { eco: "D20", name: "Queen's Gambit Accepted", color: "black", line: ["d4", "d5", "c4", "dxc4"] },
  { eco: "D30", name: "Queen's Gambit Declined", color: "black", line: ["d4", "d5", "c4", "e6"] },
  { eco: "D35", name: "QGD: Exchange Variation", color: "white", line: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "cxd5"] },
  { eco: "D37", name: "QGD: Orthodox Defense", color: "black", line: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Nf3", "Be7"] },
  { eco: "D70", name: "Neo-Grunfeld", color: "black", line: ["d4", "Nf6", "c4", "g6", "g3", "d5"] },
  { eco: "D80", name: "Grunfeld Defense", color: "black", line: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"] },
  { eco: "E00", name: "Queen's Pawn Indian", color: "black", line: ["d4", "Nf6", "c4", "e6"] },
  { eco: "E10", name: "Queen's Indian Defense", color: "black", line: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"] },
  { eco: "E20", name: "Nimzo-Indian Defense", color: "black", line: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"] },
  { eco: "E60", name: "King's Indian Defense", color: "black", line: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"] },
  { eco: "E90", name: "King's Indian: Classical", color: "black", line: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"] },
];

function normalizeFen(fen: string) {
  return fen.split(" ").slice(0, 4).join(" ");
}

function moveToUci(move: { from: string; to: string; promotion?: string }) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function buildTree(repertoire: Repertoire) {
  const tree: Record<string, Continuation[]> = {};

  for (const line of repertoire.lines) {
    const game = new Chess();

    for (const san of line) {
      const key = normalizeFen(game.fen());

      try {
        const move = game.move(san);
        if (!move) break;

        const continuation: Continuation = {
          san: move.san,
          uci: moveToUci(move),
          color: move.color,
          resultingFen: game.fen(),
        };

        const existing = tree[key] ?? [];
        const duplicate = existing.some((item) => item.uci === continuation.uci);
        tree[key] = duplicate ? existing : [...existing, continuation];
      } catch {
        break;
      }
    }
  }

  return tree;
}

function countPositions(repertoire: Repertoire) {
  return Object.keys(buildTree(repertoire)).length;
}

function getAccuracy(progress: Progress) {
  if (!progress.attempts) return 0;
  return Math.round((progress.correct / progress.attempts) * 100);
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getPiece(game: Chess, square: string) {
  return game.get(square as any);
}

function isOwnPiece(game: Chess, square: string, userColor: ChessColor) {
  const piece = getPiece(game, square);
  return Boolean(piece && piece.color === userColor);
}

function parseExplorerMoves(payload: ExplorerPayload): ExplorerMove[] {
  const moves = payload.moves ?? [];
  const denominator =
    moves.reduce((sum, move) => sum + (move.white ?? 0) + (move.draws ?? 0) + (move.black ?? 0), 0) || 1;

  return moves
    .map((move) => {
      const white = move.white ?? 0;
      const draws = move.draws ?? 0;
      const black = move.black ?? 0;
      const total = white + draws + black || 0;
      return {
        uci: move.uci,
        san: move.san,
        white,
        draws,
        black,
        total,
        pct: Math.round((total / denominator) * 100),
        whitePct: total ? Math.round((white / total) * 100) : 0,
        drawPct: total ? Math.round((draws / total) * 100) : 0,
        blackPct: total ? Math.round((black / total) * 100) : 0,
        averageRating: move.averageRating,
      };
    })
    .filter((move) => move.total > 0);
}

function parseEngineLines(payload: any, fen: string): EngineLine[] {
  const pvs = Array.isArray(payload?.pvs) ? payload.pvs : [];

  return pvs
    .map((pv: any) => {
      const firstUci = String(pv?.line ?? "").split(" ").filter(Boolean)[0];
      if (!firstUci) return null;

      const applied = applyUciMove(fen, firstUci);
      if (!applied) return null;

      return {
        san: applied.san,
        uci: applied.uci,
        cp: typeof pv?.cp === "number" ? pv.cp : undefined,
        mate: typeof pv?.mate === "number" ? pv.mate : undefined,
        depth: typeof payload?.depth === "number" ? payload.depth : undefined,
        line: String(pv?.line ?? ""),
        note: typeof pv?.note === "string" ? pv.note : undefined,
      } satisfies EngineLine;
    })
    .filter(Boolean) as EngineLine[];
}

function formatEval(line: EngineLine) {
  if (typeof line.mate === "number") return `M${line.mate}`;
  if (typeof line.cp === "number") return `${(line.cp / 100).toFixed(2)}`;
  return "eval";
}

function getTargetEngineElo(value: string) {
  const nums = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((num) => Number.isFinite(num));

  if (!nums.length) return 1000;

  // The "New" preset uses the 1000 Lichess explorer bucket but should make
  // Stockfish play more like a true sub-1000 opponent.
  if (value.trim() === "1000") return 850;

  const avg = nums.reduce((sum, num) => sum + num, 0) / nums.length;
  return Math.max(600, Math.min(3000, Math.round(avg)));
}

function eloToSkillLevel(elo: number) {
  // Stockfish Skill Level is 0–20. This deliberately makes sub-1000 behavior
  // much weaker than cloud eval while preserving enough legality to be useful.
  return Math.max(0, Math.min(20, Math.round((elo - 600) / 120)));
}

function parseUciInfo(line: string) {
  const depthMatch = line.match(/\bdepth\s+(\d+)/);
  const multipvMatch = line.match(/\bmultipv\s+(\d+)/);
  const cpMatch = line.match(/\bscore\s+cp\s+(-?\d+)/);
  const mateMatch = line.match(/\bscore\s+mate\s+(-?\d+)/);
  const pvMatch = line.match(/\bpv\s+(.+)$/);

  if (!pvMatch) return null;

  return {
    depth: depthMatch ? Number(depthMatch[1]) : undefined,
    multipv: multipvMatch ? Number(multipvMatch[1]) : 1,
    cp: cpMatch ? Number(cpMatch[1]) : undefined,
    mate: mateMatch ? Number(mateMatch[1]) : undefined,
    line: pvMatch[1].trim(),
  };
}

function analyzeWithLocalStockfish(
  positionFen: string,
  ratingFilter: string,
  multiPv = 3,
  moveTimeMs = 800
): Promise<{ lines: EngineLine[]; note: string }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Local Stockfish can only run in the browser."));
      return;
    }

    if (typeof Worker === "undefined") {
      reject(new Error("This browser does not support Web Workers, so local Stockfish cannot run."));
      return;
    }

    const targetElo = getTargetEngineElo(ratingFilter);
    const skill = eloToSkillLevel(targetElo);
    const startedAt = Date.now();
    const seen: Record<number, { depth?: number; cp?: number; mate?: number; line: string }> = {};
    let resolved = false;
    let ready = false;

    const worker = new Worker("/stockfish-18-lite-single.js");

    function cleanup() {
      try {
        worker.postMessage("quit");
      } catch {
        // ignore
      }
      try {
        worker.terminate();
      } catch {
        // ignore
      }
    }

    function finishFromPv(reason?: string) {
      if (resolved) return;
      resolved = true;

      const raw = Object.entries(seen)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([, pv]) => pv)
        .filter((pv) => pv.line);

      const lines = raw
        .map((pv) => {
          const firstUci = pv.line.split(" ").filter(Boolean)[0];
          const applied = applyUciMove(positionFen, firstUci);
          if (!applied) return null;

          return {
            san: applied.san,
            uci: applied.uci,
            cp: pv.cp,
            mate: pv.mate,
            depth: pv.depth,
            line: pv.line,
            source: "stockfish-local" as const,
            note: `Local Stockfish 18 lite-single, Skill ${skill}/20, target ${targetElo} Elo.`,
          } satisfies EngineLine;
        })
        .filter(Boolean) as EngineLine[];

      cleanup();

      if (lines.length) {
        resolve({
          lines,
          note:
            reason ??
            `Local Stockfish 18 is running in your browser at approximate ${targetElo} Elo, Skill ${skill}/20.`,
        });
      } else {
        reject(new Error("Stockfish ran but did not return a usable move."));
      }
    }

    const timeout = window.setTimeout(() => {
      finishFromPv("Stockfish reached the time limit and returned the best line found so far.");
    }, Math.max(2500, moveTimeMs + 3500));

    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error(`Local Stockfish worker failed: ${event.message || "unknown worker error"}`));
    };

    worker.onmessage = (event) => {
      const line = String(event.data ?? "");

      if (line === "uciok") {
        // Use both Skill Level and LimitStrength where possible.
        // UCI_Elo support generally starts around 1320, so sub-1000 mode relies mainly on Skill Level.
        worker.postMessage(`setoption name MultiPV value ${multiPv}`);
        worker.postMessage(`setoption name Skill Level value ${skill}`);
        if (targetElo >= 1320) {
          worker.postMessage("setoption name UCI_LimitStrength value true");
          worker.postMessage(`setoption name UCI_Elo value ${targetElo}`);
        } else {
          worker.postMessage("setoption name UCI_LimitStrength value false");
        }
        worker.postMessage("isready");
        return;
      }

      if (line === "readyok" && !ready) {
        ready = true;
        worker.postMessage(`position fen ${positionFen}`);
        worker.postMessage(`go movetime ${moveTimeMs}`);
        return;
      }

      if (line.startsWith("info ")) {
        const info = parseUciInfo(line);
        if (info?.line) {
          seen[info.multipv] = {
            depth: info.depth,
            cp: info.cp,
            mate: info.mate,
            line: info.line,
          };
        }
        return;
      }

      if (line.startsWith("bestmove ")) {
        window.clearTimeout(timeout);

        const best = line.split(/\s+/)[1];
        if (best && best !== "(none)" && !seen[1]) {
          seen[1] = { line: best };
        }

        finishFromPv();
      }
    };

    worker.postMessage("uci");
  });
}

function pickWeighted<T extends { weight: number }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  if (total <= 0) return items[0];

  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(0, item.weight);
    if (roll <= 0) return item;
  }

  return items[0];
}

function applyUciMove(fen: string, uci: string) {
  const game = new Chess(fen);
  const move = game.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : "q",
  });

  if (!move) return null;

  return {
    san: move.san,
    uci: moveToUci(move),
    fen: game.fen(),
  };
}

function pickLegalContinuation(fen: string): Continuation | null {
  const game = new Chess(fen);
  const verboseMoves = game.moves({ verbose: true }) as any[];

  if (!verboseMoves.length) return null;

  const weightedMoves = verboseMoves.map((move) => {
    const san = String(move.san ?? "");
    const from = String(move.from ?? "");
    const to = String(move.to ?? "");
    const piece = String(move.piece ?? "");
    let weight = 1;

    // Human-like fallback: prefer normal development, central moves, castling, captures, and checks.
    if (move.captured) weight += 3;
    if (san.includes("+")) weight += 2;
    if (san.includes("#")) weight += 20;
    if (san === "O-O" || san === "O-O-O") weight += 3;
    if (["e4", "d4", "c4", "Nf3", "Nc3", "e5", "d5", "c5", "Nf6", "Nc6"].includes(san.replace(/[+#?!]/g, ""))) {
      weight += 3;
    }
    if (["n", "b"].includes(piece) && ["1", "8"].includes(from.slice(1, 2))) weight += 2;
    if (["d", "e", "c", "f"].includes(to.slice(0, 1))) weight += 1;

    return { move, weight };
  });

  const chosen = pickWeighted(weightedMoves);
  const next = new Chess(fen);
  const request: any = { from: chosen.move.from, to: chosen.move.to };
  if (chosen.move.promotion) request.promotion = chosen.move.promotion;
  if (!request.promotion && String(chosen.move.flags ?? "").includes("p")) request.promotion = "q";

  const played = next.move(request);
  if (!played) return null;

  return {
    san: played.san,
    uci: moveToUci(played),
    color: played.color,
    resultingFen: next.fen(),
  };
}

export default function OpeningLabApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [customRepertoires, setCustomRepertoires] = useState<Repertoire[]>([]);
  const [selectedRepertoireId, setSelectedRepertoireId] = useState(BASE_REPERTOIRES[0].id);
  const [fen, setFen] = useState(new Chess().fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Choose a repertoire and begin training.");
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewingFen, setReviewingFen] = useState<string | null>(null);
  const [showAddLine, setShowAddLine] = useState(false);
  const [newRepName, setNewRepName] = useState("My Custom Repertoire");
  const [newRepColor, setNewRepColor] = useState<RepertoireColor>("white");
  const [newLineText, setNewLineText] = useState("e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O");
  const [useLichess, setUseLichess] = useState(true);
  const [allowExplorerBranch, setAllowExplorerBranch] = useState(false);
  const [explorerSource, setExplorerSource] = useState<ExplorerSource>("lichess");
  const [ratingFilter, setRatingFilter] = useState("1000");
  const [speedFilter, setSpeedFilter] = useState("blitz,rapid");
  const [explorerMoves, setExplorerMoves] = useState<ExplorerMove[]>([]);
  const [explorerOpening, setExplorerOpening] = useState<string>("");
  const [explorerLoading, setExplorerLoading] = useState(false);
  const [explorerError, setExplorerError] = useState("");
  const [useEngineContinuation, setUseEngineContinuation] = useState(true);
  const [engineLines, setEngineLines] = useState<EngineLine[]>([]);
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState("");
  const [coachContent, setCoachContent] = useState<CoachContent | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
  const [coachCache, setCoachCache] = useState<Record<string, CoachContent>>({});
  const [openingSearch, setOpeningSearch] = useState("");

  const explorerCacheRef = useRef<Record<string, ExplorerPayload>>({});

  const repertoires = useMemo(() => [...BASE_REPERTOIRES, ...customRepertoires], [customRepertoires]);
  const repertoire = repertoires.find((item) => item.id === selectedRepertoireId) ?? repertoires[0];
  const tree = useMemo(() => buildTree(repertoire), [repertoire]);
  const game = useMemo(() => new Chess(fen), [fen]);
  const userColor: ChessColor = repertoire.color === "white" ? "w" : "b";
  const isUserTurn = game.turn() === userColor;
  const key = normalizeFen(fen);
  const options = tree[key] ?? [];
  const expectedUserOptions = options.filter((move) => move.color === userColor);
  const mistakeList = Object.values(progress.mistakes).sort((a, b) => b.count - a.count);
  const accuracy = getAccuracy(progress);
  const positionsTrained = Object.keys(progress.trainedPositions).length;
  const lineCount = repertoire.lines.length;
  const positionCount = useMemo(() => countPositions(repertoire), [repertoire]);

  useEffect(() => {
    const savedProgress = localStorage.getItem("opening-lab-progress-v3");
    const savedRepertoires = localStorage.getItem("opening-lab-custom-repertoires-v3");
    const savedCache = localStorage.getItem("opening-lab-explorer-cache-v1");
    const savedCoachCache = localStorage.getItem("opening-lab-coach-cache-v1");

    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch {
        setProgress(DEFAULT_PROGRESS);
      }
    }

    if (savedRepertoires) {
      try {
        setCustomRepertoires(JSON.parse(savedRepertoires));
      } catch {
        setCustomRepertoires([]);
      }
    }

    if (savedCache) {
      try {
        explorerCacheRef.current = JSON.parse(savedCache);
      } catch {
        explorerCacheRef.current = {};
      }
    }

    if (savedCoachCache) {
      try {
        setCoachCache(JSON.parse(savedCoachCache));
      } catch {
        setCoachCache({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("opening-lab-progress-v3", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("opening-lab-custom-repertoires-v3", JSON.stringify(customRepertoires));
  }, [customRepertoires]);

  useEffect(() => {
    localStorage.setItem("opening-lab-coach-cache-v1", JSON.stringify(coachCache));
  }, [coachCache]);

  useEffect(() => {
    setCoachContent(null);
    setCoachError("");
  }, [fen, selectedRepertoireId]);

  useEffect(() => {
    if (activeTab !== "train" || !useLichess) return;
    void loadExplorer(fen);
  }, [activeTab, fen, useLichess, explorerSource, ratingFilter, speedFilter]);

  useEffect(() => {
    if (activeTab !== "train" || !useEngineContinuation) return;
    if (expectedUserOptions.length === 0 || !isUserTurn) {
      void loadEngine(fen);
    }
  }, [activeTab, fen, useEngineContinuation, selectedRepertoireId]);

  useEffect(() => {
    if (activeTab !== "train") return;

    if (game.isGameOver()) {
      setFeedback("Game over. Restart this repertoire to train again.");
      return;
    }

    if (!isUserTurn) {
      const timer = window.setTimeout(() => {
        void playOpponentMove();
      }, 650);

      return () => window.clearTimeout(timer);
    }
  }, [activeTab, fen, selectedRepertoireId, customRepertoires.length]);

  function explorerCacheKey(positionFen: string) {
    return [
      normalizeFen(positionFen),
      explorerSource,
      ratingFilter,
      speedFilter,
    ].join("|");
  }

  async function loadExplorer(positionFen: string, silent = false) {
    const cacheKey = explorerCacheKey(positionFen);
    const cached = explorerCacheRef.current[cacheKey];

    if (cached) {
      const parsed = parseExplorerMoves(cached);
      setExplorerMoves(parsed);
      setExplorerOpening(cached.opening?.name ?? "");
      setExplorerError(cached.fallback && cached.reason ? cached.reason : "");
      return parsed;
    }

    if (!silent) setExplorerLoading(true);
    setExplorerError("");

    try {
      const params = new URLSearchParams({
        fen: positionFen,
        source: explorerSource,
        moves: "25",
        ratings: ratingFilter,
        speeds: speedFilter,
      });

      const response = await fetch(`/api/explorer?${params.toString()}`);
      const payload = (await response.json()) as ExplorerPayload;
      if (!response.ok) throw new Error((payload as any)?.reason ?? (payload as any)?.error ?? `Explorer returned ${response.status}`);
      explorerCacheRef.current[cacheKey] = payload;

      try {
        const existingKeys = Object.keys(explorerCacheRef.current);
        if (existingKeys.length > 250) {
          const trimmed: Record<string, ExplorerPayload> = {};
          existingKeys.slice(existingKeys.length - 200).forEach((key) => {
            trimmed[key] = explorerCacheRef.current[key];
          });
          explorerCacheRef.current = trimmed;
        }
        localStorage.setItem("opening-lab-explorer-cache-v1", JSON.stringify(explorerCacheRef.current));
      } catch {
        // Ignore localStorage quota errors.
      }

      const parsed = parseExplorerMoves(payload);
      setExplorerMoves(parsed);
      setExplorerOpening(payload.opening?.name ?? "");
      setExplorerError(payload.fallback && payload.reason ? payload.reason : "");
      return parsed;
    } catch (error) {
      setExplorerError(error instanceof Error ? error.message : "Could not load explorer data.");
      return [];
    } finally {
      if (!silent) setExplorerLoading(false);
    }
  }

  async function loadEngine(positionFen: string) {
    if (!useEngineContinuation) return [];

    setEngineLoading(true);
    setEngineError("");

    try {
      const local = await analyzeWithLocalStockfish(positionFen, ratingFilter, 3, 800);
      setEngineLines(local.lines);
      setEngineError(local.note);
      return local.lines;
    } catch (localError) {
      // Fallback to the server route only if browser Stockfish fails to initialize.
      // The server route itself falls back to legal heuristic continuations.
      try {
        const params = new URLSearchParams({
          fen: positionFen,
          multiPv: "3",
        });

        const response = await fetch(`/api/engine?${params.toString()}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? `Engine returned ${response.status}`);
        }

        const parsed = parseEngineLines(payload, positionFen).map((line) => ({
          ...line,
          source: payload?.fallback ? ("local-heuristic" as const) : ("cloud-eval" as const),
        }));

        setEngineLines(parsed);

        const localMessage = localError instanceof Error ? localError.message : "Local Stockfish was unavailable.";
        if (payload?.fallback && payload?.reason) {
          setEngineError(`${localMessage} ${String(payload.reason)}`);
        } else {
          setEngineError(`${localMessage} Used cloud evaluation fallback.`);
        }

        return parsed;
      } catch (error) {
        setEngineError(error instanceof Error ? error.message : "Could not load engine continuation.");
        setEngineLines([]);
        return [];
      }
    } finally {
      setEngineLoading(false);
    }
  }

  async function loadCoachContent(force = false) {
    const currentHistory = game.history().join(" ");
    const expectedMove = expectedUserOptions[0]?.san ?? engineLines[0]?.san ?? explorerMoves[0]?.san ?? "plan move";
    const cacheKey = [repertoire.id, normalizeFen(fen), expectedMove, ratingFilter].join("|");

    if (!force && coachCache[cacheKey]) {
      setCoachContent(coachCache[cacheKey]);
      setCoachError("");
      return;
    }

    setCoachLoading(true);
    setCoachError("");

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openingName: repertoire.name,
          color: repertoire.color,
          fen,
          history: currentHistory,
          expectedMove,
          candidateMoves: [
            ...expectedUserOptions.map((move) => move.san),
            ...explorerMoves.slice(0, 5).map((move) => move.san),
            ...engineLines.slice(0, 3).map((line) => line.san),
          ].filter(Boolean),
          ratingPool: getRatingLabel(ratingFilter),
          explorerOpening,
          engineSuggestion: engineLines[0]?.san ?? "",
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? `Coach returned ${response.status}`);

      const content = payload as CoachContent;
      setCoachContent(content);
      setCoachCache((prev) => ({ ...prev, [cacheKey]: content }));
    } catch (error) {
      setCoachError(error instanceof Error ? error.message : "Could not generate coach notes.");
    } finally {
      setCoachLoading(false);
    }
  }

  function seedOpening(seed: OpeningSeed) {
    const test = new Chess();

    for (const move of seed.line) {
      try {
        if (!test.move(move)) {
          setFeedback(`Could not seed ${seed.name}; failed at ${move}.`);
          return;
        }
      } catch {
        setFeedback(`Could not seed ${seed.name}; failed at ${move}.`);
        return;
      }
    }

    const newRep: Repertoire = {
      id: `seed-${seed.eco}-${Date.now()}`,
      name: `${seed.eco} ${seed.name}`,
      color: seed.color,
      description: "Seeded from the Opening Universe. Deepen this line using the explorer and engine continuation tools.",
      lines: [seed.line],
      custom: true,
    };

    setCustomRepertoires((prev) => [...prev, newRep]);
    setSelectedRepertoireId(newRep.id);
    setFen(new Chess().fen());
    setSelectedSquare(null);
    setShowAnswer(false);
    setFeedback(`${seed.name} seeded. Train the main path, then use Lichess/engine suggestions to grow branches.`);
    setActiveTab("train");
  }

  function selectRepertoire(id: string) {
    setSelectedRepertoireId(id);
    setFen(new Chess().fen());
    setSelectedSquare(null);
    setShowAnswer(false);
    setReviewingFen(null);
    setFeedback("Repertoire loaded. Start training.");
    setLastMove(null);
    setActiveTab("train");
  }

  function resetBoard() {
    setFen(new Chess().fen());
    setSelectedSquare(null);
    setShowAnswer(false);
    setReviewingFen(null);
    setFeedback("Restarted. Find the first move.");
    setLastMove(null);
    setActiveTab("train");
  }

  async function playOpponentMove() {
    const current = new Chess(fen);
    const currentKey = normalizeFen(current.fen());
    const candidates = tree[currentKey] ?? [];

    let chosen: Continuation | null = null;
    let sourceLabel = "your repertoire";

    if (useLichess) {
      const stats = await loadExplorer(current.fen(), true);
      const weightedCandidates = candidates
        .map((candidate) => {
          const stat = stats.find((move) => move.uci === candidate.uci);
          return {
            ...candidate,
            weight: stat?.total ?? 1,
            pct: stat?.pct ?? null,
          };
        })
        .filter((candidate) => candidate.weight > 0);

      if (weightedCandidates.length) {
        const weighted = pickWeighted(weightedCandidates);
        chosen = weighted;
        sourceLabel = weighted.pct !== null ? `Elo-filtered Lichess repertoire branch (${weighted.pct}%)` : "repertoire branch";
      } else if (allowExplorerBranch && stats.length) {
        const playable = stats
          .map((move) => ({ ...move, weight: move.total }))
          .filter((move) => applyUciMove(current.fen(), move.uci));

        if (playable.length) {
          const weighted = pickWeighted(playable);
          const applied = applyUciMove(current.fen(), weighted.uci);

          if (applied) {
            setFen(applied.fen);
            setSelectedSquare(null);
            setShowAnswer(false);
            setLastMove(applied.uci);
            setFeedback(
              `Opponent played ${applied.san} from your ${getRatingLabel(ratingFilter)} Lichess pool (${weighted.pct}%). This branch is not fully prepared yet.`
            );
            return;
          }
        }
      }
    }

    if (!chosen && candidates.length) {
      chosen = candidates[Math.floor(Math.random() * candidates.length)];
    }

    if (!chosen && useEngineContinuation) {
      const lines = await loadEngine(current.fen());
      const first = lines[0];
      if (first) {
        const applied = applyUciMove(current.fen(), first.uci);
        if (applied) {
          setFen(applied.fen);
          setSelectedSquare(null);
          setShowAnswer(false);
          setLastMove(applied.uci);
          setFeedback(`Book ended. Engine continuation played ${applied.san} (${formatEval(first)}). Keep exploring or add this branch.`);
          return;
        }
      }
    }

    if (!chosen && useLichess) {
      const stats = await loadExplorer(current.fen(), true);
      const first = stats[0];
      if (first) {
        const applied = applyUciMove(current.fen(), first.uci);
        if (applied) {
          setFen(applied.fen);
          setSelectedSquare(null);
          setShowAnswer(false);
          setLastMove(applied.uci);
          setFeedback(`No saved branch. Continued with the most common Lichess move ${applied.san} (${first.pct}%). Add this branch to your repertoire.`);
          return;
        }
      }
    }

    if (!chosen) {
      const legalFallback = pickLegalContinuation(current.fen());

      if (legalFallback) {
        setFen(legalFallback.resultingFen);
        setSelectedSquare(null);
        setShowAnswer(false);
        setLastMove(legalFallback.uci);
        setFeedback(
          `No book, explorer, or engine continuation was available, so the trainer used a legal sandbox move ${legalFallback.san}. This keeps training moving. Add a real branch when you want this line saved.`
        );
        return;
      }

      setFeedback("No legal moves are available from this position. Restart or choose another repertoire.");
      return;
    }

    setFen(chosen.resultingFen);
    setSelectedSquare(null);
    setShowAnswer(false);
    setLastMove(chosen.uci);
    setFeedback(`Opponent played ${chosen.san}. Source: ${sourceLabel}.`);
  }

  function handleSquareTap(square: string) {
    if (!isUserTurn) {
      setFeedback("Opponent is moving. Wait for your turn.");
      return;
    }

    if (!selectedSquare) {
      if (isOwnPiece(game, square, userColor)) {
        setSelectedSquare(square);
        setFeedback(`Selected ${square}. Tap the destination square.`);
      } else {
        setFeedback("Tap one of your pieces first.");
      }
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare(null);
      setFeedback("Selection cleared.");
      return;
    }

    if (isOwnPiece(game, square, userColor)) {
      setSelectedSquare(square);
      setFeedback(`Selected ${square}. Tap the destination square.`);
      return;
    }

    attemptMove(selectedSquare, square);
  }

  function attemptMove(sourceSquare: string, targetSquare: string) {
    const current = new Chess(fen);
    const currentKey = normalizeFen(current.fen());

    const legalMove = current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!legalMove) {
      setSelectedSquare(null);
      setFeedback("Illegal move. Try another move.");
      return false;
    }

    const playedUci = moveToUci(legalMove);
    const expected = expectedUserOptions[0];
    const correct = expectedUserOptions.some((move) => move.uci === playedUci);

    setSelectedSquare(null);

    if (expectedUserOptions.length === 0) {
      setFen(current.fen());
      setLastMove(playedUci);
      setShowAnswer(false);
      setReviewingFen(null);
      setFeedback(`Exploration accepted: ${legalMove.san}. This was a repertoire gap, not a mistake. The trainer will continue with Lichess/engine guidance.`);
      setProgress((prev) => ({
        ...prev,
        trainedPositions: {
          ...prev.trainedPositions,
          [currentKey]: true,
        },
      }));
      return true;
    }

    if (correct) {
      setFen(current.fen());
      setLastMove(playedUci);
      setShowAnswer(false);
      setFeedback(`Correct: ${legalMove.san}.`);

      setProgress((prev) => {
        const nextMistakes = { ...prev.mistakes };

        if (reviewingFen && nextMistakes[reviewingFen]) {
          if (nextMistakes[reviewingFen].count <= 1) {
            delete nextMistakes[reviewingFen];
          } else {
            nextMistakes[reviewingFen] = {
              ...nextMistakes[reviewingFen],
              count: nextMistakes[reviewingFen].count - 1,
            };
          }
        }

        return {
          ...prev,
          attempts: prev.attempts + 1,
          correct: prev.correct + 1,
          streak: prev.streak + 1,
          trainedPositions: {
            ...prev.trainedPositions,
            [currentKey]: true,
          },
          mistakes: nextMistakes,
        };
      });

      setReviewingFen(null);
      return true;
    }

    setFeedback(`Not quite. Tap Reveal to see the best saved move, then try again.`);
    setShowAnswer(true);

    setProgress((prev) => {
      const old = prev.mistakes[currentKey];
      const nextMistake: Mistake = {
        fen,
        expectedMove: expected?.san ?? explorerMoves[0]?.san ?? engineLines[0]?.san ?? "Add a response",
        playedMove: legalMove.san,
        count: old ? old.count + 1 : 1,
        opening: repertoire.name,
        repertoireId: repertoire.id,
      };

      return {
        ...prev,
        attempts: prev.attempts + 1,
        incorrect: prev.incorrect + 1,
        streak: 0,
        mistakes: {
          ...prev.mistakes,
          [currentKey]: nextMistake,
        },
      };
    });

    return false;
  }

  function practiceMistake(mistake: Mistake) {
    const matchingRepertoire = repertoires.find((item) => item.id === mistake.repertoireId);
    if (matchingRepertoire) {
      setSelectedRepertoireId(matchingRepertoire.id);
    }

    setFen(mistake.fen);
    setReviewingFen(normalizeFen(mistake.fen));
    setSelectedSquare(null);
    setShowAnswer(false);
    setLastMove(null);
    setFeedback(`Review this position. Find the best move.`);
    setActiveTab("train");
  }

  function clearProgress() {
    setProgress(DEFAULT_PROGRESS);
    setFeedback("Progress reset.");
    setFen(new Chess().fen());
    setSelectedSquare(null);
    setShowAnswer(false);
    setReviewingFen(null);
    setLastMove(null);
  }

  function createCustomRepertoire() {
    const moves = newLineText
      .replace(/\d+\./g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    if (!moves.length) {
      setFeedback("Add at least one SAN move, like: e4 e5 Nf3 Nc6 Bc4.");
      return;
    }

    const test = new Chess();
    for (const move of moves) {
      try {
        const result = test.move(move);
        if (!result) {
          setFeedback(`Could not read move: ${move}`);
          return;
        }
      } catch {
        setFeedback(`Could not read move: ${move}`);
        return;
      }
    }

    const newRep: Repertoire = {
      id: `custom-${Date.now()}`,
      name: newRepName.trim() || "My Custom Repertoire",
      color: newRepColor,
      description: "Custom deep line saved on this device.",
      lines: [moves],
      custom: true,
    };

    setCustomRepertoires((prev) => [...prev, newRep]);
    setSelectedRepertoireId(newRep.id);
    setShowAddLine(false);
    setFen(new Chess().fen());
    setFeedback("Custom repertoire created. Start training.");
    setActiveTab("train");
  }

  function addExplorerMoveToCustomLine(move: ExplorerMove) {
    const current = new Chess(fen);
    const history = current.history();
    const candidate = [...history, move.san].join(" ");
    setNewRepName(`${repertoire.name} branch`);
    setNewRepColor(repertoire.color);
    setNewLineText(candidate);
    setShowAddLine(true);
  }

  function addEngineLineToCustomLine(line: EngineLine) {
    const current = new Chess(fen);
    const history = current.history();
    const candidate = [...history, line.san].join(" ");
    setNewRepName(`${repertoire.name} engine branch`);
    setNewRepColor(repertoire.color);
    setNewLineText(candidate);
    setShowAddLine(true);
  }

  const expectedText =
    expectedUserOptions.length > 0
      ? expectedUserOptions.map((move) => move.san).join(" / ")
      : engineLines[0]
      ? `No saved response. Engine idea: ${engineLines[0].san} (${formatEval(engineLines[0])})`
      : explorerMoves[0]
      ? `No saved response. Common Lichess idea: ${explorerMoves[0].san} (${explorerMoves[0].pct}%)`
      : isUserTurn
      ? "No saved response yet. Explore any legal move, or add a Lichess/engine suggestion as a branch."
      : "Waiting for opponent";

  const customSquareStyles: Record<string, CSSProperties> = {};
  if (lastMove && lastMove.length >= 4) {
    customSquareStyles[lastMove.slice(0, 2)] = { backgroundColor: "rgba(234, 179, 8, 0.42)" };
    customSquareStyles[lastMove.slice(2, 4)] = { backgroundColor: "rgba(234, 179, 8, 0.42)" };
  }
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { backgroundColor: "rgba(22, 101, 52, 0.45)" };
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
        {activeTab === "home" && (
          <section className="space-y-6">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm">
                  <Beaker size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Opening Lab</h1>
                  <p className="text-sm text-stone-500">Adaptive opening training with Elo-filtered Lichess history, deep lines, and a growing opening library.</p>
                </div>
              </div>
              <Settings className="text-stone-500" size={22} />
            </header>

            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Today's Goal" value="20" sub="positions" icon={<Target size={19} />} />
              <MetricCard label="Accuracy" value={`${accuracy}%`} sub="all time" icon={<Trophy size={19} />} />
              <MetricCard label="Current Streak" value={String(progress.streak)} sub="correct" icon={<Flame size={19} />} />
              <MetricCard label="Mistakes Due" value={String(mistakeList.length)} sub="review now" icon={<XCircle size={19} />} warning />
            </div>

            <div className="rounded-3xl bg-stone-900 p-4 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-green-300">
                <Cloud size={17} /> Lichess historical mode
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Opponent replies are weighted by historical move frequency, but filtered through your saved repertoire so training stays useful.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-2 text-green-700"><Database size={19} /></div>
                <div className="text-xs text-stone-500">Opening library</div>
                <div className="text-3xl font-black tracking-tight">{repertoires.length}</div>
                <div className="text-xs text-stone-400">repertoire packs</div>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="mb-2 text-green-700"><Sparkles size={19} /></div>
                <div className="text-xs text-stone-500">Current Elo pool</div>
                <div className="text-xl font-black tracking-tight">{getRatingLabel(ratingFilter)}</div>
                <div className="text-xs text-stone-400">adaptive replies</div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">Continue Training</h2>
                <button onClick={() => setActiveTab("repertoire")} className="text-sm font-semibold text-green-700">
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {repertoires.slice(0, 3).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => selectRepertoire(item.id)}
                    className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-3 text-left shadow-sm"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">
                      {item.color === "white" ? "♙" : "♟"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-sm text-stone-500">
                        {item.lines.length} lines • {countPositions(item)} positions
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-stone-200">
                        <div className="h-1.5 rounded-full bg-green-700" style={{ width: `${80 - index * 8}%` }} />
                      </div>
                    </div>
                    <ChevronRight className="text-stone-400" size={20} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "repertoire" && (
          <section className="space-y-5">
            <header>
              <h1 className="text-2xl font-bold tracking-tight">Repertoires</h1>
              <p className="text-sm text-stone-500">Choose or create deeper lines.</p>
            </header>

            <div className="grid grid-cols-2 rounded-2xl bg-stone-200 p-1 text-sm font-semibold">
              <button className="rounded-xl bg-white py-2 text-green-700 shadow-sm">White</button>
              <button className="rounded-xl py-2 text-stone-500">Black</button>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <Search size={18} className="text-stone-400" />
              <span className="text-sm text-stone-400">Search repertoires</span>
            </div>

            <div className="space-y-3">
              {repertoires.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectRepertoire(item.id)}
                  className={classNames(
                    "flex w-full items-center gap-3 rounded-3xl border bg-white p-3 text-left shadow-sm",
                    item.id === selectedRepertoireId ? "border-green-700" : "border-stone-200"
                  )}
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">
                    {item.color === "white" ? "♙" : "♟"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">
                      {item.name} {item.custom ? <span className="text-xs font-semibold text-green-700">Custom</span> : null}
                    </div>
                    <div className="text-sm text-stone-500">
                      {item.lines.length} lines • {countPositions(item)} positions • {item.color}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-stone-400">{item.description}</p>
                  </div>
                  <ChevronRight className="text-stone-400" size={20} />
                </button>
              ))}
            </div>

            <div className="rounded-3xl bg-stone-900 p-4 text-white shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-black">Opening Universe</h2>
                  <p className="text-xs text-stone-300">
                    Seed any opening family, then expand it with Lichess and engine continuation.
                  </p>
                </div>
                <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-black">{OPENING_UNIVERSE.length} seeds</span>
              </div>
              <input
                value={openingSearch}
                onChange={(event) => setOpeningSearch(event.target.value)}
                placeholder="Search Sicilian, Ruy, London, Caro..."
                className="mb-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400 outline-none"
              />
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {OPENING_UNIVERSE
                  .filter((seed) => `${seed.eco} ${seed.name}`.toLowerCase().includes(openingSearch.toLowerCase()))
                  .slice(0, 80)
                  .map((seed) => (
                    <button
                      key={`${seed.eco}-${seed.name}`}
                      onClick={() => seedOpening(seed)}
                      className="w-full rounded-2xl bg-white/10 p-3 text-left hover:bg-white/15"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-black">{seed.eco} • {seed.name}</div>
                          <div className="text-xs text-stone-300">{seed.line.join(" ")} • train as {seed.color}</div>
                        </div>
                        <Plus size={17} className="text-green-300" />
                      </div>
                    </button>
                  ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-400">
                This seed list is the in-app starter. For thousands of named ECO lines, import the CC0 Lichess chess-openings dataset into this structure.
              </p>
            </div>

            <button
              onClick={() => setShowAddLine(true)}
              className="fixed bottom-24 right-5 flex h-14 items-center gap-2 rounded-full bg-green-700 px-5 font-bold text-white shadow-lg"
            >
              <Plus size={19} /> Add
            </button>
          </section>
        )}

        {activeTab === "train" && (
          <section className="space-y-4">
            <header className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">{repertoire.name}</h1>
                <p className="text-sm font-semibold text-green-700">
                  {lineCount} lines • {positionCount} positions • Training as {repertoire.color === "white" ? "White" : "Black"}
                  {reviewingFen ? " • Review mode" : ""}
                </p>
              </div>
              <button onClick={resetBoard} className="rounded-2xl bg-white p-3 shadow-sm">
                <RotateCcw size={20} />
              </button>
            </header>

            <div className="grid grid-cols-3 gap-2">
              <SmallStat label="Turn" value={isUserTurn ? "You" : "Bot"} />
              <SmallStat label="Accuracy" value={`${accuracy}%`} />
              <SmallStat label="Streak" value={String(progress.streak)} />
            </div>

            <div className="rounded-3xl bg-white p-2 shadow-sm">
              <TapChessboard
                game={game}
                orientation={repertoire.color}
                selectedSquare={selectedSquare}
                squareStyles={customSquareStyles}
                onSquareTap={handleSquareTap}
              />
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {feedback.toLowerCase().includes("correct") ? (
                  <CheckCircle2 className="mt-0.5 text-green-700" size={24} />
                ) : feedback.toLowerCase().includes("not quite") || feedback.toLowerCase().includes("illegal") ? (
                  <XCircle className="mt-0.5 text-red-600" size={24} />
                ) : (
                  <Target className="mt-0.5 text-green-700" size={24} />
                )}
                <div>
                  <div className="font-bold">{isUserTurn ? "Your move" : "Opponent thinking"}</div>
                  <p className="text-sm leading-6 text-stone-600">{feedback}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setShowAnswer(true)}
                className="rounded-2xl border border-stone-200 bg-white px-3 py-4 font-bold shadow-sm"
              >
                <span className="flex items-center justify-center gap-1">
                  <Eye size={17} /> Reveal
                </span>
              </button>
              <button
                onClick={() => void playOpponentMove()}
                disabled={isUserTurn}
                className="rounded-2xl bg-green-700 px-3 py-4 font-bold text-white shadow-sm disabled:opacity-40"
              >
                Force Bot
              </button>
              <button
                onClick={resetBoard}
                className="rounded-2xl border border-stone-200 bg-white px-3 py-4 font-bold shadow-sm"
              >
                Restart
              </button>
            </div>

            <div className="rounded-3xl bg-stone-900 p-4 text-white">
              <div className="text-sm text-stone-300">Training prompt</div>
              <div className="mt-2 text-lg font-bold">
                {showAnswer ? `Best move: ${expectedText}` : "Find the best repertoire move."}
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-400">
                Tap your piece, then the destination square. Wrong moves are saved for review.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-black">
                    <Sparkles size={18} className="text-green-700" /> Opening plan coach
                  </h2>
                  <p className="text-xs leading-5 text-stone-500">
                    Plan first, variations second: goals, attacking ideas, pawn breaks, and move feedback.
                  </p>
                </div>
                <button
                  onClick={() => void loadCoachContent(true)}
                  className="rounded-2xl bg-green-700 px-3 py-2 text-xs font-black text-white shadow-sm"
                >
                  {coachLoading ? "Thinking..." : "AI Coach"}
                </button>
              </div>

              {coachError ? <p className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">{coachError}</p> : null}

              {coachContent ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-green-50 p-3">
                    <div className="text-xs font-black uppercase tracking-wide text-green-800">Overall plan</div>
                    <p className="mt-1 text-sm leading-6 text-stone-700">{coachContent.mainPlan}</p>
                  </div>

                  <CoachList title="Goals" items={coachContent.goals} />
                  <CoachList title="Attacking ideas" items={coachContent.attackingIdeas} />
                  <CoachList title="Pawn breaks" items={coachContent.pawnBreaks} />

                  <div className="rounded-2xl bg-stone-50 p-3">
                    <div className="text-xs font-black uppercase tracking-wide text-stone-500">Move feedback</div>
                    <div className="mt-1 text-sm font-black">{coachContent.moveFeedback.move}</div>
                    <p className="mt-1 text-sm leading-6 text-stone-700">{coachContent.moveFeedback.whyMove}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600"><span className="font-bold">Plan connection:</span> {coachContent.moveFeedback.planConnection}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600"><span className="font-bold">Next goal:</span> {coachContent.moveFeedback.nextGoal}</p>
                    {coachContent.moveFeedback.warning ? (
                      <p className="mt-2 rounded-xl bg-amber-50 p-2 text-xs leading-5 text-amber-800">{coachContent.moveFeedback.warning}</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-3">
                    <div className="text-xs font-black uppercase tracking-wide text-stone-500">Variations second</div>
                    <div className="mt-2 space-y-2">
                      {coachContent.variations.slice(0, 3).map((variation) => (
                        <div key={variation.name} className="rounded-xl bg-white p-2">
                          <div className="text-sm font-black">{variation.name}</div>
                          <p className="text-xs leading-5 text-stone-600">{variation.goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {coachContent.fallback ? (
                    <p className="text-xs leading-5 text-stone-400">Static fallback shown. Add OPENAI_API_KEY in Vercel for full AI-generated coaching.</p>
                  ) : null}
                </div>
              ) : (
                <button
                  onClick={() => void loadCoachContent(false)}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm font-bold text-stone-700"
                >
                  Generate plan and move explanation for this position
                </button>
              )}
            </div>

            {isUserTurn && expectedUserOptions.length === 0 && (
              <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
                <h2 className="font-black text-orange-900">Repertoire gap detected</h2>
                <p className="mt-2 text-sm leading-6 text-orange-800">
                  This position has no saved best move, so the app will not mark your move wrong or show “Unknown.” Continue exploring, reveal an engine/Lichess suggestion, or add this branch.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="rounded-2xl bg-white px-3 py-3 text-sm font-black text-orange-900 shadow-sm"
                  >
                    Show idea
                  </button>
                  <button
                    onClick={() => setShowAddLine(true)}
                    className="rounded-2xl bg-orange-700 px-3 py-3 text-sm font-black text-white shadow-sm"
                  >
                    Add branch
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-black">Engine continuation</h2>
                  <p className="text-xs text-stone-500">
                    Runs real local Stockfish 18 in your browser. Strength is approximated from the selected Elo pool using Stockfish Skill Level and UCI_Elo when supported.
                  </p>
                </div>
                <button onClick={() => void loadEngine(fen)} className="rounded-full bg-stone-100 p-2">
                  <RefreshCw className={engineLoading ? "animate-spin" : ""} size={17} />
                </button>
              </div>

              <button
                onClick={() => setUseEngineContinuation(!useEngineContinuation)}
                className={classNames(
                  "mb-3 w-full rounded-2xl px-3 py-2 text-xs font-bold",
                  useEngineContinuation ? "bg-green-700 text-white" : "bg-stone-100 text-stone-600"
                )}
              >
                {useEngineContinuation ? "Local Stockfish ON" : "Local Stockfish OFF"}
              </button>

              {engineError ? <p className="rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">{engineError}</p> : null}

              <div className="space-y-2">
                {engineLines.slice(0, 3).map((line) => (
                  <div key={line.uci + line.line} className="rounded-2xl bg-stone-50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black">{line.san}</div>
                        <div className="text-xs text-stone-500">
                          {formatEval(line)}
                          {line.depth ? ` • depth ${line.depth}` : ""}
                          {line.source ? ` • ${line.source.replaceAll("-", " ")}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => addEngineLineToCustomLine(line)}
                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700 shadow-sm"
                      >
                        Add
                      </button>
                    </div>
                    {line.note ? <p className="mt-2 text-xs leading-5 text-stone-500">{line.note}</p> : null}
                  </div>
                ))}
                {engineLoading ? <p className="text-sm text-stone-500">Loading local Stockfish...</p> : null}
                {!engineLoading && !engineLines.length && !engineError ? (
                  <p className="text-sm text-stone-500">No engine line loaded yet.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-black">Historical move explorer</h2>
                  <p className="text-xs text-stone-500">
                    {explorerSource === "lichess" ? "Rated Lichess games, with local fallback" : "Master games"}
                    {explorerOpening ? ` • ${explorerOpening}` : ""}
                  </p>
                </div>
                <button onClick={() => void loadExplorer(fen)} className="rounded-full bg-stone-100 p-2">
                  <RefreshCw className={explorerLoading ? "animate-spin" : ""} size={17} />
                </button>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => setUseLichess(!useLichess)}
                  className={classNames(
                    "rounded-2xl px-3 py-2",
                    useLichess ? "bg-green-700 text-white" : "bg-stone-100 text-stone-600"
                  )}
                >
                  {useLichess ? "Weighted bot ON" : "Weighted bot OFF"}
                </button>
                <button
                  onClick={() => setExplorerSource(explorerSource === "lichess" ? "masters" : "lichess")}
                  className="rounded-2xl bg-stone-100 px-3 py-2 text-stone-700"
                >
                  Source: {explorerSource}
                </button>
              </div>

              <div className="mb-3 rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-stone-500">Opponent skill model</div>
                    <div className="text-sm font-black">Elo pool: {getRatingLabel(ratingFilter)}</div>
                  </div>
                  <Sparkles size={18} className="text-green-700" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {RATING_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setRatingFilter(preset.value)}
                      className={classNames(
                        "rounded-xl px-2 py-2 text-xs font-bold",
                        ratingFilter === preset.value ? "bg-green-700 text-white" : "bg-white text-stone-600"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {SPEED_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setSpeedFilter(preset.value)}
                      className={classNames(
                        "rounded-xl px-2 py-2 text-xs font-bold",
                        speedFilter === preset.value ? "bg-stone-900 text-white" : "bg-white text-stone-600"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  Start below 1000 for true beginner behavior, use your current level for realism, then move one preset higher to practice the choices stronger opponents actually make.
                </p>
              </div>

              <button
                onClick={() => setAllowExplorerBranch(!allowExplorerBranch)}
                className={classNames(
                  "mb-3 w-full rounded-2xl px-3 py-2 text-xs font-bold",
                  allowExplorerBranch ? "bg-orange-100 text-orange-800" : "bg-stone-100 text-stone-600"
                )}
              >
                {allowExplorerBranch ? "Explorer-only branches allowed" : "Stay inside my repertoire"}
              </button>

              {explorerError ? <p className="rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">{explorerError}</p> : null}

              <div className="space-y-2">
                {explorerMoves.slice(0, 10).map((move) => {
                  const inRepertoire = options.some((option) => option.uci === move.uci);
                  return (
                    <div key={move.uci} className="rounded-2xl bg-stone-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-black">
                            {move.san}{" "}
                            {inRepertoire ? <span className="text-xs font-bold text-green-700">in repertoire</span> : null}
                          </div>
                          <div className="text-xs text-stone-500">
                            {move.total.toLocaleString()} games • {move.pct}% of shown replies
                            {move.averageRating ? ` • avg ${move.averageRating}` : ""}
                          </div>
                        </div>
                        <button
                          onClick={() => addExplorerMoveToCustomLine(move)}
                          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700 shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
                        <div className="h-2 rounded-full bg-green-700" style={{ width: `${Math.min(100, move.pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
                {explorerLoading ? <p className="text-sm text-stone-500">Loading Lichess history...</p> : null}
                {!explorerLoading && !explorerMoves.length && !explorerError ? (
                  <p className="text-sm text-stone-500">No explorer data loaded for this position yet.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-black">
                <Sparkles size={18} className="text-green-700" /> Training idea
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                Keep “Stay inside my repertoire” on for disciplined memorization. Turn on explorer-only branches when you want to discover common opponent moves you have not prepared yet, then tap Add to create a new line.
              </p>
            </div>
          </section>
        )}

        {activeTab === "review" && (
          <section className="space-y-5">
            <header>
              <h1 className="text-2xl font-bold tracking-tight">Review Mistakes</h1>
              <p className="text-sm text-stone-500">Drill the positions you missed most.</p>
            </header>

            {mistakeList.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                <CheckCircle2 className="mx-auto mb-3 text-green-700" size={40} />
                <h2 className="text-lg font-bold">No mistakes due</h2>
                <p className="mt-2 text-sm text-stone-500">Train a repertoire and your missed positions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mistakeList.map((mistake) => (
                  <button
                    key={mistake.fen}
                    onClick={() => practiceMistake(mistake)}
                    className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold">{mistake.opening}</div>
                        <div className="mt-1 text-sm text-stone-500">
                          Best move: <span className="font-bold text-green-700">{mistake.expectedMove}</span>
                        </div>
                        <div className="text-sm text-stone-500">You played: {mistake.playedMove}</div>
                      </div>
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                        Missed {mistake.count}x
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "progress" && (
          <section className="space-y-5">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
                <p className="text-sm text-stone-500">Your training snapshot.</p>
              </div>
              <button onClick={clearProgress} className="rounded-2xl bg-white px-3 py-2 text-sm font-bold shadow-sm">
                Reset
              </button>
            </header>

            <div className="grid grid-cols-3 gap-2">
              <MetricCard compact label="Accuracy" value={`${accuracy}%`} sub="overall" icon={<Target size={18} />} />
              <MetricCard compact label="Trained" value={String(positionsTrained)} sub="positions" icon={<BookOpen size={18} />} />
              <MetricCard compact label="Queue" value={String(mistakeList.length)} sub="due" icon={<XCircle size={18} />} warning />
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Repertoire depth</h2>
                <Database size={18} className="text-green-700" />
              </div>
              <div className="space-y-3">
                {repertoires.map((item) => {
                  const positions = countPositions(item);
                  const width = Math.min(100, Math.round((positions / 60) * 100));
                  return (
                    <div key={item.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-bold">{positions} positions</span>
                      </div>
                      <div className="h-2 rounded-full bg-stone-200">
                        <div className="h-2 rounded-full bg-green-700" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold">Most Missed Positions</h2>
              {mistakeList.length ? (
                <div className="space-y-3">
                  {mistakeList.slice(0, 3).map((mistake, index) => (
                    <div key={mistake.fen} className="flex items-center justify-between rounded-2xl bg-stone-50 p-3">
                      <span className="text-sm">
                        {index + 1}. {mistake.opening}
                      </span>
                      <span className="text-sm font-bold text-red-700">Missed {mistake.count}x</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">No missed positions yet.</p>
              )}
            </div>
          </section>
        )}
      </div>

      {showAddLine && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/35 p-4">
          <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Add Deep Line</h2>
              <button onClick={() => setShowAddLine(false)} className="rounded-full bg-stone-100 p-2">
                <X size={18} />
              </button>
            </div>

            <label className="text-sm font-bold text-stone-700">Name</label>
            <input
              value={newRepName}
              onChange={(event) => setNewRepName(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"
            />

            <label className="mt-4 block text-sm font-bold text-stone-700">Train as</label>
            <div className="mt-1 grid grid-cols-2 rounded-2xl bg-stone-200 p-1 text-sm font-semibold">
              <button
                onClick={() => setNewRepColor("white")}
                className={classNames("rounded-xl py-2", newRepColor === "white" ? "bg-white text-green-700 shadow-sm" : "text-stone-500")}
              >
                White
              </button>
              <button
                onClick={() => setNewRepColor("black")}
                className={classNames("rounded-xl py-2", newRepColor === "black" ? "bg-white text-green-700 shadow-sm" : "text-stone-500")}
              >
                Black
              </button>
            </div>

            <label className="mt-4 block text-sm font-bold text-stone-700">Line in SAN</label>
            <textarea
              value={newLineText}
              onChange={(event) => setNewLineText(event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"
              placeholder="e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O"
            />

            <button
              onClick={createCustomRepertoire}
              className="mt-4 w-full rounded-2xl bg-green-700 px-4 py-4 font-black text-white shadow-sm"
            >
              Save and Train
            </button>
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}

function TapChessboard({
  game,
  orientation,
  selectedSquare,
  squareStyles,
  onSquareTap,
}: {
  game: Chess;
  orientation: RepertoireColor;
  selectedSquare: string | null;
  squareStyles: Record<string, CSSProperties>;
  onSquareTap: (square: string) => void;
}) {
  const ranks = orientation === "white" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = orientation === "white" ? FILES : [...FILES].reverse();

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[18px] border border-stone-200">
      <div className="grid h-full w-full grid-cols-8 grid-rows-8">
        {ranks.flatMap((rank) =>
          files.map((file) => {
            const square = `${file}${rank}`;
            const piece = getPiece(game, square);
            const pieceKey = piece ? `${piece.color}${piece.type}` : "";
            const fileIndex = FILES.indexOf(file);
            const isDark = (fileIndex + rank) % 2 === 1;
            const customStyle = squareStyles[square] ?? {};
            const isSelected = selectedSquare === square;

            return (
              <button
                key={square}
                type="button"
                onClick={() => onSquareTap(square)}
                aria-label={square}
                className={classNames(
                  "relative flex select-none items-center justify-center text-[clamp(1.8rem,10vw,3.4rem)] leading-none transition",
                  isDark ? "bg-[#759656]" : "bg-[#eeeed2]",
                  isSelected ? "ring-4 ring-inset ring-green-800" : ""
                )}
                style={customStyle}
              >
                <span
                  className={classNames(
                    "drop-shadow-sm",
                    piece?.color === "w" ? "text-stone-50" : "text-stone-950"
                  )}
                >
                  {pieceKey ? PIECE_SYMBOLS[pieceKey] : ""}
                </span>
                {rank === (orientation === "white" ? 1 : 8) && (
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-black/35">{file}</span>
                )}
                {file === (orientation === "white" ? "a" : "h") && (
                  <span className="absolute left-1 top-0.5 text-[10px] font-bold text-black/35">{rank}</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function CoachList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3">
      <div className="text-xs font-black uppercase tracking-wide text-stone-500">{title}</div>
      <ul className="mt-2 space-y-1">
        {items.slice(0, 4).map((item) => (
          <li key={item} className="text-sm leading-5 text-stone-700">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  warning = false,
  compact = false,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  warning?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={classNames("rounded-3xl bg-white shadow-sm", compact ? "p-3" : "p-4")}>
      <div className={classNames("mb-2", warning ? "text-orange-600" : "text-green-700")}>{icon}</div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className={classNames("font-black tracking-tight", compact ? "text-xl" : "text-3xl")}>{value}</div>
      <div className="text-xs text-stone-400">{sub}</div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}

function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: Tab) => void;
}) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "train", label: "Train", icon: Target },
    { id: "review", label: "Review", icon: CheckCircle2 },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "repertoire", label: "Repertoire", icon: BookOpen },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-2 pb-4 pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold",
                active ? "bg-green-50 text-green-700" : "text-stone-500"
              )}
            >
              <Icon size={19} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
