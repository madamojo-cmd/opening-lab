"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Chess } from "chess.js";
import { BarChart3, Beaker, BookOpen, CheckCircle2, ChevronRight, Cloud, Eye, Flame, Home, Plus, RotateCcw, Search, Settings, Target, Trophy, X, XCircle, Zap } from "lucide-react";
import { getStockfishTopMovesForValidation } from "@/lib/blundr/engine/stockfishValidation";
import {
  MOVE_QUALITY_GATE_VERSION,
  buildMoveQualityCacheKey,
  evaluateTopTwoMatch,
  type MoveQualityResult,
} from "@/lib/blundr/teaching/moveQualityGate";
import { createLearningSessionId, recordLearningEvent } from "@/lib/blundr/learning/learningEvents";
import type { LearningEvent } from "@/lib/blundr/learning/learningEvents";

type Tab = "home" | "train" | "review" | "progress" | "repertoire";
type RepertoireColor = "white" | "black";
type ChessColor = "w" | "b";
type ActiveBoardView = "attack" | "defense" | "plan";
type TrainingMode = "restricted" | "continuation";
type TrainerView = "assisted" | "plain";
type SystemState = "off" | "ready" | "loading" | "active" | "cached" | "fallback" | "error" | "complete";
type ThinkingStep = "idle" | "facts" | "engine" | "brain" | "gpt-receive" | "visual-update" | "ready" | "error";
type PatternCueStatus = "ready" | "pending" | "suppressed" | "plain" | "wrong_move" | "manual_reveal";
type PatternCue = {
  title: string;
  snippet: string;
  next?: string;
  status: PatternCueStatus;
  source: "rule_visual" | "local_fast" | "plain" | "pending" | "suppressed" | "manual";
  concept?: string;
  selectedMove?: string;
};
type Repertoire = { id: string; name: string; color: RepertoireColor; lines: string[][]; description: string; custom?: boolean };
type Continuation = { san: string; uci: string; color: ChessColor; resultingFen: string };
type Mistake = { fen: string; expectedMove: string; playedMove: string; count: number; opening: string; repertoireId: string };
type Progress = { attempts: number; correct: number; incorrect: number; streak: number; trainedPositions: Record<string, boolean>; mistakes: Record<string, Mistake> };
type ExplorerMove = { uci: string; san: string; total: number; pct: number; averageRating?: number };
type EngineLine = { san: string; uci: string; cp?: number; line: string };
type LineKind = "attack" | "defense" | "plan" | "opponent";
type ActiveLine = { from: string; to: string; kind: LineKind; label?: string };
type SquareCue = { square: string; kind: "origin" | "target" | "support" | "danger" | "opponent" };
type BoardView = { title: string; message: string; lines: ActiveLine[]; cues: SquareCue[] };
type BrainAnnotation = { source: string; fallback: boolean; selectedView: ActiveBoardView; headline: string; mainExplanation: string; visualExplanation: string; planExplanation: string; nextPlan: string; keySquares: string[]; planArrows: ActiveLine[]; attack: BoardView; defense: BoardView; plan: BoardView; threatNote?: string; suppress?: string[]; confidence?: string; reason?: string };
type BrainResponse = { pipeline: { facts: string; engine: string; gpt: string; visual: string; latencyMs: number }; engine: { source: string; fallback: boolean; pvs: EngineLine[] }; annotation: BrainAnnotation; candidates?: any; debug?: any };
type VisualArrowRole = "move" | "pressure" | "defense" | "future" | "threat" | "capture" | "retreat" | "pin" | "castle" | string;
type VisualSquareRole = "source" | "destination" | "weakness" | "center" | "defense" | "danger" | "future" | "soft_target" | "king_safety" | string;
type VisualModelArrow = { from: string; to: string; role?: VisualArrowRole; kind?: LineKind; label?: string; reason?: string };
type VisualModelSquare = { square: string; role?: VisualSquareRole; kind?: SquareCue["kind"]; reason?: string };
type VisualModelContext = { headline: string; body: string; next: string; checkQuestion?: string; explanationMode?: string; concept?: string; selectedMove?: string };
type VisualModelOutput = Partial<BrainAnnotation> & { arrows?: VisualModelArrow[]; squares?: VisualModelSquare[]; animation?: string; animationPackage?: { name: string; intensity?: number }; context?: VisualModelContext; suppress?: string[]; debug?: any };
type VisualDebugSnapshot = {
  requestKey: string | null;
  requestPayload: Record<string, unknown> | null;
  responseSummary: Record<string, unknown> | null;
  responseDebug: Record<string, unknown> | null;
  error: string | null;
  durationMs: number | null;
  updatedAt: number | null;
};
type LocalTelemetryEvent = {
  id: number;
  ts: number;
  event: "visual_request" | "visual_response" | "visual_error" | "visual_suppressed";
  details: Record<string, unknown>;
};
type LocalTelemetryStore = { enabled: boolean; events: LocalTelemetryEvent[]; updatedAt: number };
type OpponentCue = { expiresAt: number; title: string; message: string; lines: ActiveLine[]; cues: SquareCue[] };
type LiveBrain = { ratingLabel: string; ratingPool: string; book: SystemState; lichess: SystemState; engine: SystemState; gpt: SystemState; source: string; latency?: number; note?: string };
type BoardTheme = "classic" | "slate" | "blue" | "walnut";
type PieceStyle = "unicode" | "letters" | "neo";
type BoardSettings = { boardTheme: BoardTheme; pieceStyle: PieceStyle; showAttack: boolean; showDefense: boolean; showPlan: boolean; showMoveDots: boolean; showEvalBar: boolean; showCaptured: boolean; showLabels: boolean; showOpponentCue: boolean };
type CapturedSummary = { whiteCaptured: string[]; blackCaptured: string[]; materialAdvantage: { side: ChessColor | null; value: number } };

const DEFAULT_PROGRESS: Progress = { attempts: 0, correct: 0, incorrect: 0, streak: 0, trainedPositions: {}, mistakes: {} };
const PIECE_SYMBOLS: Record<string, string> = { wp:"♙", wn:"♘", wb:"♗", wr:"♖", wq:"♕", wk:"♔", bp:"♟", bn:"♞", bb:"♝", br:"♜", bq:"♛", bk:"♚" };
const LETTER_PIECES: Record<string, string> = { wp:"P", wn:"N", wb:"B", wr:"R", wq:"Q", wk:"K", bp:"p", bn:"n", bb:"b", br:"r", bq:"q", bk:"k" };
const NEO_PIECES: Record<string, string> = { wp:"♙", wn:"♘", wb:"♗", wr:"♖", wq:"♕", wk:"♔", bp:"♟", bn:"♞", bb:"♝", br:"♜", bq:"♛", bk:"♚" };
const PIECE_VALUES: Record<string, number> = { p:1, n:3, b:3, r:5, q:9, k:0 };
const INITIAL_COUNTS: Record<ChessColor, Record<string, number>> = { w:{p:8,n:2,b:2,r:2,q:1,k:1}, b:{p:8,n:2,b:2,r:2,q:1,k:1} };
const DEFAULT_BOARD_SETTINGS: BoardSettings = { boardTheme:"classic", pieceStyle:"unicode", showAttack:true, showDefense:true, showPlan:true, showMoveDots:true, showEvalBar:true, showCaptured:true, showLabels:true, showOpponentCue:true };
const LOCAL_TELEMETRY_KEY = "blundr-v27-local-telemetry";
const MAX_LOCAL_TELEMETRY_EVENTS = 120;
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const FILE_TO_INDEX: Record<string, number> = Object.fromEntries(FILES.map((f, i) => [f, i]));
const RATING_PRESETS = [
  { label: "New", value: "1000", target: "<1000", skill: 800 },
  { label: "Beginner", value: "1000,1200", target: "1000–1200", skill: 1100 },
  { label: "Improver", value: "1000,1200,1400", target: "1000–1400", skill: 1300 },
  { label: "Club", value: "1200,1400,1600", target: "1200–1600", skill: 1500 },
  { label: "Strong", value: "1600,1800", target: "1600–1800", skill: 1700 },
  { label: "Advanced", value: "1800,2000,2200", target: "1800–2200", skill: 2000 },
  { label: "Expert+", value: "2200,2500", target: "2200+", skill: 2300 },
  { label: "All", value: "1000,1200,1400,1600,1800,2000,2200,2500", target: "All", skill: 1600 },
];
const OPENINGS: Repertoire[] = [
  { id:"italian-white", name:"Italian Game", color:"white", description:"Develop fast, pressure f7, castle, and prepare c3–d4.", lines:[["e4","e5","Nf3","Nc6","Bc4","Bc5","c3","Nf6","d3","d6","O-O","O-O","Re1","a6","Bb3","Ba7","Nbd2"],["e4","e5","Nf3","Nc6","Bc4","Nf6","d3","Bc5","c3","d6","O-O","O-O","Re1"],["e4","e5","Nf3","Nf6","Nxe5","d6","Nf3","Nxe4","d4","d5","Bd3","Be7","O-O","O-O"],["e4","c5","Nf3","d6","d4","cxd4","Nxd4","Nf6","Nc3","a6","Be3","e5","Nb3","Be6","f3"],["e4","e6","d4","d5","Nc3","Nf6","e5","Nfd7","f4","c5","Nf3"],["e4","c6","d4","d5","Nc3","dxe4","Nxe4","Bf5","Ng3","Bg6","h4","h6"]] },
  { id:"ruy-white", name:"Ruy Lopez", color:"white", description:"Pressure e5, build with c3/Re1, and prepare d4.", lines:[["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O","Be7","Re1","b5","Bb3","d6","c3","O-O","h3"],["e4","e5","Nf3","Nc6","Bb5","Nf6","O-O","Nxe4","d4","Nd6","Bxc6","dxc6","dxe5","Nf5"],["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O","Nxe4","d4","b5","Bb3","d5"]] },
  { id:"queens-gambit-white", name:"Queen's Gambit", color:"white", description:"Use central tension to pressure d5 and develop cleanly.", lines:[["d4","d5","c4","e6","Nc3","Nf6","Bg5","Be7","e3","O-O","Nf3","h6","Bh4"],["d4","d5","c4","c6","Nf3","Nf6","Nc3","dxc4","a4","Bf5","e3","e6"],["d4","Nf6","c4","e6","Nc3","Bb4","e3","O-O","Bd3","d5","Nf3","c5"]] },
  { id:"london-white", name:"London System", color:"white", description:"Build a stable setup, support d4, and look for e4/Ne5 ideas.", lines:[["d4","Nf6","Bf4","d5","e3","e6","Nf3","Bd6","Bg3","O-O","Bd3","b6","Nbd2"],["d4","d5","Bf4","Nf6","e3","e6","Nf3","c5","c3","Nc6","Nbd2"]] },
  { id:"caro-black", name:"Caro-Kann as Black", color:"black", description:"Build a resilient center and challenge e4/d4 without weakening the king.", lines:[["e4","c6","d4","d5","Nc3","dxe4","Nxe4","Bf5","Ng3","Bg6","h4","h6"],["e4","c6","d4","d5","e5","Bf5","Nf3","e6","Be2","c5","O-O","Nc6"],["e4","c6","d4","d5","exd5","cxd5","Nf3","Nf6","Bd3","Nc6"]] },
  { id:"sicilian-black", name:"Sicilian as Black", color:"black", description:"Use asymmetry to fight for d4 and create active counterplay.", lines:[["e4","c5","Nf3","d6","d4","cxd4","Nxd4","Nf6","Nc3","a6","Be3","e5"],["e4","c5","Nf3","Nc6","d4","cxd4","Nxd4","Nf6","Nc3","d6"],["e4","c5","c3","Nf6","e5","Nd5","d4","cxd4","Nf3"]] },
  { id:"french-black", name:"French Defense as Black", color:"black", description:"Challenge the white center with ...d5 and pressure the pawn chain.", lines:[["e4","e6","d4","d5","Nc3","Nf6","e5","Nfd7","f4","c5","Nf3","Nc6"],["e4","e6","d4","d5","Nd2","Nf6","e5","Nfd7","Bd3","c5"]] },
  { id:"kings-indian-black", name:"King's Indian as Black", color:"black", description:"Allow White's center, then counter with ...e5 or ...c5 and kingside activity.", lines:[["d4","Nf6","c4","g6","Nc3","Bg7","e4","d6","Nf3","O-O","Be2","e5","O-O","Nc6"],["d4","Nf6","c4","g6","Nf3","Bg7","g3","O-O","Bg2","d6","O-O","Nc6"]] }
];

function classNames(...classes:Array<string|false|null|undefined>){return classes.filter(Boolean).join(" ")}
function normalizeFen(fen:string){return fen.split(" ").slice(0,4).join(" ")}
function moveToUci(move:{from:string;to:string;promotion?:string}){return `${move.from}${move.to}${move.promotion??""}`}
function isValidSquare(square:string){return /^[a-h][1-8]$/.test(square)}
function visualLineKind(role?:string,kind?:LineKind):LineKind{if(kind&&["attack","defense","plan","opponent"].includes(kind))return kind;if(role==="defense"||role==="retreat"||role==="castle")return"defense";if(role==="pressure"||role==="threat"||role==="capture"||role==="pin")return"attack";return"plan"}
function visualCueKind(role?:string,kind?:SquareCue["kind"]):SquareCue["kind"]{if(kind&&["origin","target","support","danger","opponent"].includes(kind))return kind;if(role==="source")return"origin";if(role==="defense"||role==="king_safety")return"support";if(role==="weakness"||role==="danger"||role==="soft_target")return"danger";return"target"}
function visualAnimationClass(name?:string){const known=new Set(["quiet-development-glow","diagonal-pressure-glow","knight-pressure-center","center-break-pulse","castle-safety-aura","weak-square-pulse","pin-line-tension","fork-spark","defensive-shield","open-file-radar","queen-danger-warning","continuation-ghost-plan"]);return known.has(name??"")?`blundr-anim-${name}`:"blundr-anim-quiet-development-glow"}
function getPiece(game:Chess,square:string){return game.get(square as any)}
function isOwnPiece(game:Chess,square:string,color:ChessColor){const p=getPiece(game,square);return Boolean(p&&p.color===color)}
function pickWeighted<T extends {weight:number}>(items:T[]){const total=items.reduce((s,i)=>s+Math.max(0,i.weight),0);if(total<=0)return items[0];let roll=Math.random()*total;for(const item of items){roll-=Math.max(0,item.weight);if(roll<=0)return item}return items[0]}
function ratingPreset(value:string){return RATING_PRESETS.find(p=>p.value===value)??RATING_PRESETS[3]}
function buildTree(rep:Repertoire){const tree:Record<string,Continuation[]>={};for(const line of rep.lines){const game=new Chess();for(const san of line){const key=normalizeFen(game.fen());try{const move=game.move(san);if(!move)break;const cont={san:move.san,uci:moveToUci(move),color:move.color as ChessColor,resultingFen:game.fen()};const ex=tree[key]??[];tree[key]=ex.some(x=>x.uci===cont.uci)?ex:[...ex,cont]}catch{break}}}return tree}
function countPositions(rep:Repertoire){return Object.keys(buildTree(rep)).length}
function getAccuracy(progress:Progress){return progress.attempts?Math.round((progress.correct/progress.attempts)*100):0}
function parseExplorerMoves(payload:any):ExplorerMove[]{const moves=Array.isArray(payload?.moves)?payload.moves:[];const denom=moves.reduce((s:number,m:any)=>s+(m.white??0)+(m.draws??0)+(m.black??0),0)||1;return moves.map((m:any)=>{const total=(m.white??0)+(m.draws??0)+(m.black??0);return{uci:m.uci,san:m.san,total,pct:Math.round((total/denom)*100),averageRating:m.averageRating}}).filter((m:ExplorerMove)=>m.uci&&m.total>0)}
function applyUci(fen:string,uci:string){try{const game=new Chess(fen);const move=game.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci.length>4?uci.slice(4,5):"q"});if(!move)return null;return{san:move.san,uci:moveToUci(move),fen:game.fen(),color:move.color as ChessColor}}catch{return null}}
function blankAnnotation():BrainAnnotation{return{source:"initial",fallback:true,selectedView:"plan",headline:"Ready",mainExplanation:"Make a move or tap Reveal Next Move.",visualExplanation:"The board can now show a fast local cue immediately while Brain refines the coaching text.",planExplanation:"Restricted mode keeps you inside the selected opening.",nextPlan:"Play the highlighted training move when available.",keySquares:[],planArrows:[],attack:{title:"Your attack",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},defense:{title:"Your defense",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},plan:{title:"Plan",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},confidence:"initial"}}
function isKnightGeometry(from:string,to:string){if(!isValidSquare(from)||!isValidSquare(to))return false;const df=Math.abs(FILE_TO_INDEX[from[0]]-FILE_TO_INDEX[to[0]]);const dr=Math.abs(Number(from[1])-Number(to[1]));return(df===1&&dr===2)||(df===2&&dr===1)}
function lineFromContinuation(move:Continuation,kind:LineKind="plan"):ActiveLine{return{from:move.uci.slice(0,2),to:move.uci.slice(2,4),kind,label:move.san}}
function lineFromVerboseMove(move:any,kind:LineKind="plan"):ActiveLine{return{from:move.from,to:move.to,kind,label:move.san??moveToUci(move)}}
function lineFromEngine(fen:string,line:EngineLine,kind:LineKind="plan"):ActiveLine|null{const applied=applyUci(fen,line.uci);if(!applied)return null;return{from:line.uci.slice(0,2),to:line.uci.slice(2,4),kind,label:applied.san||line.san||line.uci}}
function engineAnnotationFromLine({fen,line,openingName}: {fen:string;line:EngineLine;openingName:string}):BrainAnnotation{
  const base=blankAnnotation();
  const visual=lineFromEngine(fen,line,"plan");
  if(!visual)return{...base,source:"engine pending",fallback:true,headline:"Checking continuation",mainExplanation:"Blundr Brain is checking the continuation before highlighting a move.",visualExplanation:"No random legal fallback is shown as a recommendation.",planExplanation:"Wait for the teaching cue.",nextPlan:"Teaching cue pending.",plan:{title:"Checking continuation",message:"Blundr Brain is checking the continuation.",lines:[],cues:[]},confidence:"engine-pending"};
  const cues:SquareCue[]=[{square:visual.from,kind:"origin"},{square:visual.to,kind:"target"}];
  const move=visual.label??line.san??line.uci;
  return{...base,source:"manual analysis",fallback:false,selectedView:"plan",headline:`Suggested continuation: ${move}`,mainExplanation:`Manual analysis currently prefers ${move}.`,visualExplanation:"The highlighted move is analysis-backed, not a placeholder legal move.",planExplanation:`Use ${move} as the current continuation while explanation text stays concise.`,nextPlan:`Play ${move}.`,keySquares:[visual.to],planArrows:[visual],attack:{title:"Active continuation",message:`${move} is the current continuation.`,lines:[{...visual,kind:"attack"}],cues},defense:{title:"Safety check",message:"The recommendation is validated by local analysis.",lines:[],cues:[{square:visual.from,kind:"support"}]},plan:{title:`${openingName}: continuation plan`,message:`Analysis-backed continuation: ${move}.`,lines:[visual],cues},confidence:"analysis"};
}
function deriveFastAnnotation({fen,openingName,userColor,trainingMode,expectedUserOptions,opponentBookOptions}: {fen:string;openingName:string;userColor:ChessColor;trainingMode:TrainingMode;expectedUserOptions:Continuation[];opponentBookOptions:Continuation[]}):BrainAnnotation{
  const local=new Chess(fen);
  const userTurn=local.turn()===userColor;
  const base:BrainAnnotation=blankAnnotation();
  if(local.isGameOver())return{...base,source:"fast local",fallback:true,headline:"Game over",mainExplanation:"This line has reached a terminal position.",visualExplanation:"No training cue is shown because the game is over.",planExplanation:"Restart the opening to train again.",nextPlan:"Restart or choose another repertoire.",plan:{title:"Game over",message:"Restart the opening to continue training.",lines:[],cues:[]},confidence:"local"};
  if(userTurn&&trainingMode==="restricted"&&expectedUserOptions.length){
    const lines=expectedUserOptions.slice(0,2).map(m=>lineFromContinuation(m,"plan"));
    const cues:SquareCue[]=lines.flatMap(l=>[{square:l.from,kind:"origin" as const},{square:l.to,kind:"target" as const}]);
    const moveText=expectedUserOptions.map(m=>m.san).join(" / ");
    return{...base,source:"fast local repertoire",fallback:true,selectedView:"plan",headline:`${openingName}: play ${moveText}`,mainExplanation:`The saved repertoire expects ${moveText}.`,visualExplanation:"The board is showing the source and destination for the current saved training move immediately.",planExplanation:"Stay inside the restricted opening line by playing the highlighted move.",nextPlan:`Play ${moveText}.`,keySquares:lines.map(l=>l.to),planArrows:lines,attack:{title:"Current attacking/development idea",message:`The immediate training move is ${moveText}. Use this view as a fast cue, not a tactical claim.`,lines:lines.map(l=>({...l,kind:"attack" as LineKind})),cues},defense:{title:"Current responsibility",message:"Restricted mode first checks whether the move belongs to your saved repertoire. Deeper defensive motifs are refined after the local cue appears.",lines:[],cues:lines.map(l=>({square:l.from,kind:"support" as const}))},plan:{title:"Fast local plan",message:`Play ${moveText} to continue the saved ${openingName} branch.`,lines,cues},confidence:"local"};
  }
  if(userTurn&&trainingMode==="restricted"&&!expectedUserOptions.length){
    return{...base,source:"fast local book complete",fallback:true,headline:"Book complete",mainExplanation:"The saved repertoire branch has ended on your turn.",visualExplanation:"No move is highlighted because there is no saved restricted-mode continuation.",planExplanation:"Choose Train Again or Continue vs Bot.",nextPlan:"Continue vs Bot to accept normal legal moves from this position.",plan:{title:"Book complete",message:"No saved move remains for this branch.",lines:[],cues:[]},confidence:"local"};
  }
  if(!userTurn&&trainingMode==="restricted"&&opponentBookOptions.length){
    const lines=opponentBookOptions.slice(0,2).map(m=>lineFromContinuation(m,"opponent"));
    const cues:SquareCue[]=lines.map(l=>({square:l.to,kind:"opponent" as const}));
    const moveText=opponentBookOptions.map(m=>m.san).join(" / ");
    return{...base,source:"fast local opponent book",fallback:true,selectedView:"plan",headline:`Opponent book reply: ${moveText}`,mainExplanation:"The app is about to play a saved opponent reply from the repertoire tree.",visualExplanation:"Purple cues show the opponent-side book move immediately while the bot delay and Brain refinement finish.",planExplanation:"After the opponent move, your next saved repertoire cue will appear.",nextPlan:"Watch the opponent reply, then find your next training move.",keySquares:lines.map(l=>l.to),planArrows:lines,attack:{title:"Opponent reply",message:`Expected opponent book reply: ${moveText}.`,lines,cues},defense:{title:"Prepare for reply",message:"This cue shows where the opponent book move is heading. Your user-side view returns after the move.",lines,cues},plan:{title:"Opponent book reply",message:`Opponent is expected to play ${moveText}.`,lines,cues},confidence:"local"};
  }
  return{...base,source:"engine pending",fallback:true,selectedView:"plan",headline:trainingMode==="continuation"&&userTurn?"Checking continuation":"Waiting for opponent",mainExplanation:trainingMode==="continuation"&&userTurn?"Blundr Brain is checking the continuation before showing a cue.":"The opponent is selecting a continuation.",visualExplanation:"No provisional legal-move recommendation is drawn. The next plan visual appears only when it is validated.",planExplanation:trainingMode==="continuation"&&userTurn?"Wait for the teaching cue.":"Wait for the opponent move.",nextPlan:trainingMode==="continuation"&&userTurn?"Teaching cue pending.":"Wait for the opponent move.",attack:{title:"Checking",message:"Attack cues are withheld until the move is validated.",lines:[],cues:[]},defense:{title:"Checking",message:"Defense cues are withheld until the move is validated.",lines:[],cues:[]},plan:{title:"Checking continuation",message:"Blundr Brain is checking the continuation.",lines:[],cues:[]},confidence:"engine-pending"};
}
function impactFromEngine(line?:EngineLine){
  const cp=line?.cp;
  if(typeof cp!=="number")return{label:"Training",pct:64,tone:"bg-green-700",note:"Move impact will use Brain endpoint engine output when available."};
  if(cp>180)return{label:"Strong",pct:92,tone:"bg-green-700",note:"Blundr Brain likes this continuation."};
  if(cp>80)return{label:"Stable",pct:74,tone:"bg-green-600",note:"Healthy continuation."};
  if(cp>20)return{label:"Playable",pct:58,tone:"bg-yellow-500",note:"Playable but keep improving the plan."};
  return{label:"Needs care",pct:36,tone:"bg-orange-600",note:"Look for a more forcing or developing move."};
}

function compactText(value:unknown,fallback:string,max=140){
  const text=typeof value==="string"&&value.trim()?value.trim().replace(/\s+/g," "):fallback;
  return text.length>max?`${text.slice(0,Math.max(0,max-1)).trim()}…`:text;
}

function isMoveQualityVerified(moveQuality:MoveQualityResult|null){
  return moveQuality?.status==="verified_top1"||moveQuality?.status==="verified_top2";
}

function getMoveQualityUserStatus(moveQuality:MoveQualityResult|null,pending:boolean):"idle"|"checking"|"verified"|"needs_review"|"not_verified"{
  if(pending)return "checking";
  if(isMoveQualityVerified(moveQuality))return "verified";
  if(moveQuality?.status==="rejected")return "needs_review";
  if(moveQuality?.status==="unavailable")return "not_verified";
  return "idle";
}

function getMoveQualityBadgeLabel(input:{
  trainerView:TrainerView;
  showAnswer:boolean;
  shouldValidateTrainingMove:boolean;
  moveQuality:MoveQualityResult|null;
  moveQualityPending:boolean;
  patternCueStatus:PatternCueStatus;
}){
  if(input.trainerView==="plain"&&!input.showAnswer)return "Plain View • No hints";
  if(input.shouldValidateTrainingMove&&!input.showAnswer){
    const status=getMoveQualityUserStatus(input.moveQuality,input.moveQualityPending);
    if(status==="checking")return "Assisted View • Checking";
    if(status==="verified")return "Assisted View • Blundr Brain Validated";
    if(status==="needs_review")return "Assisted View • Needs review";
    if(status==="not_verified")return "Assisted View • Not verified";
    return "Assisted View • Checking";
  }
  if(input.patternCueStatus==="pending")return "Assisted View • Checking";
  return "Assisted View • Cue ready";
}

function buildPatternCue(input:{
  trainerView:TrainerView;
  visualModelOutput:VisualModelOutput|null;
  visualModelPending:boolean;
  visualModelError:string|null;
  visualSuppressed:boolean;
  moveQuality:MoveQualityResult|null;
  moveQualityPending:boolean;
  shouldValidateTrainingMove:boolean;
  annotation:BrainAnnotation;
  expectedUserOptions:Continuation[];
  trainingMode:TrainingMode;
  isUserTurn:boolean;
  bookComplete:boolean;
  showAnswer:boolean;
  engineLines:EngineLine[];
}):PatternCue{
  if(input.trainerView==="plain"&&!input.showAnswer){
    return{title:"Find the next move",snippet:"Solve the position without hints.",status:"plain",source:"plain"};
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer&&input.moveQualityPending){
    return{
      title:"Checking position",
      snippet:"Blundr Brain is checking this move before showing a teaching cue.",
      status:"pending",
      source:"pending",
    };
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer&&input.moveQuality?.status==="rejected"){
    return{
      title:"Line needs review",
      snippet:"Blundr Brain did not validate this saved line, so no teaching cue will be shown.",
      next:undefined,
      source:"suppressed",
      status:"suppressed",
    };
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer&&input.moveQuality?.status==="unavailable"){
    return{
      title:"Move not verified",
      snippet:"Blundr could not verify this move, so it will not invent a teaching plan.",
      next:"Use Reveal only if you want to inspect the saved line.",
      source:"suppressed",
      status:"suppressed",
    };
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer){
    if(!isMoveQualityVerified(input.moveQuality)){
      return{
        title:"Checking position",
        snippet:"Blundr Brain is checking this move before showing a teaching cue.",
        status:"pending",
        source:"pending",
      };
    }
  }
  if(input.visualModelPending){
    return{title:"Preparing visual cue",snippet:"Blundr is checking the deterministic visual pattern for this position.",status:"pending",source:"pending"};
  }
  if(input.visualSuppressed){
    return{title:"No verified cue yet",snippet:"A recommendation is pending, so Blundr will not invent a plan.",next:"Use Reveal only if you want the answer.",status:"suppressed",source:"suppressed"};
  }
  if(input.visualModelOutput?.context){
    return{
      title:compactText(input.visualModelOutput.context.headline,"Pattern cue",80),
      snippet:compactText(input.visualModelOutput.context.body,"Use the highlighted move pattern.",140),
      next:compactText(input.visualModelOutput.context.next,"",80)||undefined,
      status:"ready",
      source:"rule_visual",
      concept:input.visualModelOutput.context.concept,
      selectedMove:input.visualModelOutput.context.selectedMove,
    };
  }
  if(input.visualModelOutput){
    return{
      title:compactText(input.visualModelOutput.headline,"Pattern cue",80),
      snippet:compactText(input.visualModelOutput.mainExplanation??input.visualModelOutput.planExplanation,"Use the highlighted move pattern.",140),
      next:compactText(input.visualModelOutput.nextPlan,"",80)||undefined,
      status:"ready",
      source:"rule_visual",
    };
  }
  if(input.showAnswer&&input.expectedUserOptions.length){
    return{
      title:"Saved line move",
      snippet:compactText(`Play ${input.expectedUserOptions.map(m=>m.san).join(" / ")}.`,"Play the saved line move.",140),
      next:"Review the highlighted pattern before continuing.",
      status:"manual_reveal",
      source:"manual",
    };
  }
  return{
    title:compactText(input.annotation.headline,"Pattern cue",80),
    snippet:compactText(input.annotation.mainExplanation??input.annotation.planExplanation,"Use the local visual cue.",140),
    next:compactText(input.annotation.nextPlan,"",80)||undefined,
    status:"ready",
    source:"local_fast",
  };
}

function evalForWhite(cp:number|undefined,turn:ChessColor){
  if(typeof cp!=="number")return undefined;
  return turn==="w"?cp:-cp;
}

function whiteEvalPercent(cpWhite:number|undefined){
  if(typeof cpWhite!=="number")return 50;
  const bounded=Math.max(-1200,Math.min(1200,cpWhite));
  return Math.max(5,Math.min(95,50+bounded/24));
}

function advantageLabel(cpWhite:number|undefined){
  if(typeof cpWhite!=="number")return "Engine pending";
  if(Math.abs(cpWhite)>90000)return cpWhite>0?"White mate":"Black mate";
  if(Math.abs(cpWhite)<18)return "Equal";
  const side=cpWhite>0?"White":"Black";
  return `${side} +${(Math.abs(cpWhite)/100).toFixed(1)}`;
}

function pieceGlyph(color:ChessColor,type:string,style:PieceStyle){
  const key=`${color}${type}`;
  if(style==="letters")return LETTER_PIECES[key]??type;
  if(style==="neo")return NEO_PIECES[key]??PIECE_SYMBOLS[key]??type;
  return PIECE_SYMBOLS[key]??type;
}

function capturedSummary(game:Chess):CapturedSummary{
  const counts:Record<ChessColor,Record<string,number>>={w:{p:0,n:0,b:0,r:0,q:0,k:0},b:{p:0,n:0,b:0,r:0,q:0,k:0}};
  for(const row of game.board()){for(const piece of row){if(piece)counts[piece.color as ChessColor][piece.type]=(counts[piece.color as ChessColor][piece.type]??0)+1}}
  const missing=(color:ChessColor)=>["q","r","b","n","p"].flatMap(type=>Array(Math.max(0,(INITIAL_COUNTS[color][type]??0)-(counts[color][type]??0))).fill(type));
  const whiteCaptured=missing("w");
  const blackCaptured=missing("b");
  const whiteCapturedValue=blackCaptured.reduce((sum,t)=>sum+(PIECE_VALUES[t]??0),0);
  const blackCapturedValue=whiteCaptured.reduce((sum,t)=>sum+(PIECE_VALUES[t]??0),0);
  const diff=whiteCapturedValue-blackCapturedValue;
  return{whiteCaptured,blackCaptured,materialAdvantage:{side:diff>0?"w":diff<0?"b":null,value:Math.abs(diff)}};
}

function gameEndingInfo(game:Chess){
  if(!game.isGameOver())return null;
  if(game.isCheckmate()){const winner=game.turn()==="w"?"Black":"White";return{title:"Checkmate",message:`${winner} wins by checkmate.`}}
  if(game.isStalemate())return{title:"Stalemate",message:"The game is drawn by stalemate."};
  if(game.isThreefoldRepetition())return{title:"Draw",message:"The game is drawn by repetition."};
  if(game.isInsufficientMaterial())return{title:"Draw",message:"The game is drawn by insufficient material."};
  if(game.isDraw())return{title:"Draw",message:"The game has ended in a draw."};
  return{title:"Game over",message:"The game has ended."};
}

function uciToSan(fen:string,uci:string){
  try{
    const g=new Chess(fen);
    const move=g.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci.length>4?uci.slice(4,5):"q"});
    return move?.san??uci;
  }catch{return uci}
}

function parseStockfishInfo(line:string,fen:string){
  const depthMatch=line.match(/\bdepth\s+(\d+)/);
  const cpMatch=line.match(/\bscore\s+cp\s+(-?\d+)/);
  const mateMatch=line.match(/\bscore\s+mate\s+(-?\d+)/);
  const multiMatch=line.match(/\bmultipv\s+(\d+)/);
  const pvMatch=line.match(/\bpv\s+(.+)$/);
  if(!pvMatch)return null;
  const uci=pvMatch[1].trim().split(/\s+/)[0];
  if(!uci||uci.length<4)return null;
  const mate=mateMatch?Number(mateMatch[1]):null;
  const cp=cpMatch?Number(cpMatch[1]):mate!==null?(mate>0?100000-mate:-100000-mate):undefined;
  return{san:uciToSan(fen,uci),uci,cp,line:pvMatch[1].trim(),depth:depthMatch?Number(depthMatch[1]):undefined,multipv:multiMatch?Number(multiMatch[1]):1};
}

async function resolveStockfishWorkerPath(){
  try{
    const response=await fetch("/stockfish/manifest.json",{cache:"no-store"});
    const manifest=await response.json();
    if(manifest?.enginePath)return String(manifest.enginePath);
  }catch{}
  return null;
}

async function runBrowserStockfish(fen:string,skill:number,movetime=750,multiPv=3):Promise<{source:string;pvs:EngineLine[];depth?:number;timeMs:number}|null>{
  if(typeof window==="undefined"||typeof Worker==="undefined")return null;
  const enginePath=await resolveStockfishWorkerPath();
  if(!enginePath)return null;

  return new Promise((resolve)=>{
    const started=performance.now();
    let worker:Worker|null=null;
    const bestByPv=new Map<number,any>();
    let resolved=false;

    const finish=()=>{
      if(resolved)return;
      resolved=true;
      try{worker?.terminate()}catch{}
      const pvs=Array.from(bestByPv.entries()).sort((a,b)=>a[0]-b[0]).map(([,v])=>v).filter(Boolean).slice(0,5);
      if(!pvs.length){resolve(null);return}
      const maxDepth=Math.max(...pvs.map((pv)=>pv.depth??0));
      resolve({source:"stockfish-browser",pvs:pvs.map((pv)=>({san:pv.san,uci:pv.uci,cp:pv.cp,line:pv.line})),depth:maxDepth||undefined,timeMs:Math.round(performance.now()-started)});
    };

    const send=(cmd:string)=>{try{worker?.postMessage(cmd)}catch{}};
    const timeout=window.setTimeout(finish,Math.max(1600,movetime+1200));

    try{
      worker=new Worker(enginePath);
      worker.onmessage=(event)=>{
        const line=String(event.data??"");
        const parsed=parseStockfishInfo(line,fen);
        if(parsed)bestByPv.set(parsed.multipv??1,parsed);
        if(line.startsWith("bestmove")){
          window.clearTimeout(timeout);
          finish();
        }
      };
      worker.onerror=()=>{
        window.clearTimeout(timeout);
        try{worker?.terminate()}catch{}
        resolve(null);
      };

      send("uci");
      send(`setoption name MultiPV value ${Math.max(1,Math.min(5,multiPv))}`);
      send("setoption name UCI_LimitStrength value true");
      send(`setoption name UCI_Elo value ${Math.max(1320,Math.min(3190,skill))}`);
      send("isready");
      send(`position fen ${fen}`);
      send(`go movetime ${movetime}`);
    }catch{
      window.clearTimeout(timeout);
      try{worker?.terminate()}catch{}
      resolve(null);
    }
  });
}

export default function App(){
  const initialFen=useMemo(()=>new Chess().fen(),[]);
  const [activeTab,setActiveTab]=useState<Tab>("home");
  const [customRepertoires,setCustomRepertoires]=useState<Repertoire[]>([]);
  const [selectedRepertoireId,setSelectedRepertoireId]=useState(OPENINGS[0].id);
  const [fen,setFen]=useState(initialFen);
  const [positionHistory,setPositionHistory]=useState<string[]>([initialFen]);
  const [historyIndex,setHistoryIndex]=useState(0);
  const [selectedSquare,setSelectedSquare]=useState<string|null>(null);
  const [feedback,setFeedback]=useState("Choose an opening and begin training.");
  const [lastMove,setLastMove]=useState<string|null>(null);
  const [lastMoveSan,setLastMoveSan]=useState("");
  const [moveHistory,setMoveHistory]=useState<string[]>([]);
  const [progress,setProgress]=useState<Progress>(DEFAULT_PROGRESS);
  const [showAnswer,setShowAnswer]=useState(false);
  const [reviewingFen,setReviewingFen]=useState<string|null>(null);
  const [activeBoard,setActiveBoard]=useState(true);
  const [activeBoardView,setActiveBoardView]=useState<ActiveBoardView>("plan");
  const [showGptDebug,setShowGptDebug]=useState(false);
  const [showVisualDebug,setShowVisualDebug]=useState(false);
  const [showDetails,setShowDetails]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [boardSettings,setBoardSettings]=useState<BoardSettings>(DEFAULT_BOARD_SETTINGS);
  const [ratingFilter,setRatingFilter]=useState("1200,1400,1600");
  const [speedFilter]=useState("blitz,rapid");
  const [trainingMode,setTrainingMode]=useState<TrainingMode>("restricted");
  const [trainerView,setTrainerView]=useState<TrainerView>("assisted");
  const [bookComplete,setBookComplete]=useState(false);
  const [opponentCue,setOpponentCue]=useState<OpponentCue|null>(null);
  const [explorerMoves,setExplorerMoves]=useState<ExplorerMove[]>([]);
  const [brainResponse,setBrainResponse]=useState<BrainResponse|null>(null);
  const [enginePreview,setEnginePreview]=useState<{fen:string;pvs:EngineLine[];source:string}|null>(null);
  const [annotation,setAnnotation]=useState<BrainAnnotation>(blankAnnotation());
  const [visualModelOutput,setVisualModelOutput]=useState<VisualModelOutput|null>(null);
  const [visualModelPending,setVisualModelPending]=useState(false);
  const [visualModelError,setVisualModelError]=useState<string|null>(null);
  const [visualDebugSnapshot,setVisualDebugSnapshot]=useState<VisualDebugSnapshot>({requestKey:null,requestPayload:null,responseSummary:null,responseDebug:null,error:null,durationMs:null,updatedAt:null});
  const [telemetryEnabled,setTelemetryEnabled]=useState(false);
  const [telemetryEvents,setTelemetryEvents]=useState<LocalTelemetryEvent[]>([]);
  const [thinkingStep,setThinkingStep]=useState<ThinkingStep>("idle");
  const [pipelineNote,setPipelineNote]=useState("Ready");
  const [visualReady,setVisualReady]=useState(false);
  const [brain,setBrain]=useState<LiveBrain>({ratingLabel:"Club",ratingPool:"1200–1600",book:"ready",lichess:"ready",engine:"ready",gpt:"ready",source:"rule visual",note:"Manual reveal/debug only"});
  const [moveQuality,setMoveQuality]=useState<MoveQualityResult|null>(null);
  const [moveQualityPending,setMoveQualityPending]=useState(false);
  const [showAddLine,setShowAddLine]=useState(false);
  const [newRepName,setNewRepName]=useState("My Custom Repertoire");
  const [newRepColor,setNewRepColor]=useState<RepertoireColor>("white");
  const [newLineText,setNewLineText]=useState("e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O");
  const explorerCache=useRef<Record<string,any>>({});
  const brainSeq=useRef(0);
  const visualRequestSeq=useRef(0);
  const moveQualityCacheRef=useRef<Map<string,MoveQualityResult>>(new Map());
  const learningSessionIdRef=useRef<string>(createLearningSessionId());
  const positionStartedAtRef=useRef<number>(Date.now());
  const lastMoveQualityEventKeyRef=useRef<string>("");
  const telemetrySeq=useRef(0);
  const telemetryEnabledRef=useRef(false);
  const telemetryEventsRef=useRef<LocalTelemetryEvent[]>([]);
  const fenRef=useRef(fen);
  const brainAbortRef=useRef<AbortController|null>(null);
  const visualAbortRef=useRef<AbortController|null>(null);
  const repertoires=useMemo(()=>[...OPENINGS,...customRepertoires],[customRepertoires]);
  const repertoire=repertoires.find(r=>r.id===selectedRepertoireId)??repertoires[0];
  const tree=useMemo(()=>buildTree(repertoire),[repertoire]);
  const game=useMemo(()=>new Chess(fen),[fen]);
  const userColor:ChessColor=repertoire.color==="white"?"w":"b";
  const opponentColor:ChessColor=userColor==="w"?"b":"w";
  const isUserTurn=game.turn()===userColor;
  const key=normalizeFen(fen);
  const options=tree[key]??[];
  const expectedUserOptions=options.filter(m=>m.color===userColor);
  const expectedUserOptionsSignature=expectedUserOptions.map((move)=>`${move.uci??""}:${move.san??""}`).join("|");
  const expectedMovesForValidation=useMemo(()=>expectedUserOptions.map((move)=>({
    uci:typeof move.uci==="string"?move.uci.trim().toLowerCase():"",
    san:typeof move.san==="string"?move.san:undefined,
  })).filter((move)=>move.uci),[expectedUserOptionsSignature]);
  const expectedMovesForValidationKey=useMemo(()=>expectedMovesForValidation.map((move)=>`${move.uci}:${move.san??""}`).join("|"),[expectedMovesForValidation]);
  const expectedUserUcis=expectedMovesForValidation.map(move=>move.uci);
  const expectedUserSans=expectedMovesForValidation.map(move=>move.san).filter(Boolean) as string[];
  const opponentBookOptions=options.filter(m=>m.color===opponentColor);
  const rating=ratingPreset(ratingFilter);
  const enabledViews:ActiveBoardView[]=([] as ActiveBoardView[]).concat(boardSettings.showAttack?["attack"]:[],boardSettings.showDefense?["defense"]:[],boardSettings.showPlan?["plan"]:[]);
  const safeBoardView:ActiveBoardView=enabledViews.includes(activeBoardView)?activeBoardView:(enabledViews[0]??"plan");
  const currentView=annotation[safeBoardView]??annotation.plan;
  const engineLines=enginePreview&&normalizeFen(enginePreview.fen)===normalizeFen(fen)?enginePreview.pvs:[];
  const shouldValidateTrainingMove=activeTab==="train"&&trainingMode==="restricted"&&isUserTurn&&!bookComplete&&historyIndex>=positionHistory.length-1&&expectedMovesForValidation.length>0;
  const moveQualityUserStatus=getMoveQualityUserStatus(moveQuality,moveQualityPending);
  const moveQualityVerified=isMoveQualityVerified(moveQuality);
  const hideUnverifiedTrainingHints=trainingMode==="restricted"&&isUserTurn&&!showAnswer&&shouldValidateTrainingMove&&!moveQualityVerified;
  const visualSuppressed=Boolean(visualModelOutput?.suppress?.includes("recommendation_pending"));
  const activeVisualModelOutput=visualModelOutput&&!visualSuppressed?visualModelOutput:null;
  const hidePreMoveHints=(trainerView==="plain"||hideUnverifiedTrainingHints)&&!showAnswer&&trainingMode==="restricted"&&isUserTurn;
  const visualLines:ActiveLine[]=hidePreMoveHints?[]:visualModelOutput?(activeVisualModelOutput?(activeVisualModelOutput.arrows??[]).filter(a=>isValidSquare(a.from)&&isValidSquare(a.to)).slice(0,2).map(a=>({from:a.from,to:a.to,kind:visualLineKind(a.role,a.kind),label:a.label})):[]):currentView.lines;
  const visualContext=activeVisualModelOutput?.context;
  const visualAnimationName=activeVisualModelOutput?.animationPackage?.name??activeVisualModelOutput?.animation;
  const patternCue=buildPatternCue({trainerView,visualModelOutput,visualModelPending,visualModelError,visualSuppressed,moveQuality,moveQualityPending,shouldValidateTrainingMove,annotation,expectedUserOptions,trainingMode,isUserTurn,bookComplete,showAnswer,engineLines});
  const patternCueBadgeLabel=getMoveQualityBadgeLabel({trainerView,showAnswer,shouldValidateTrainingMove,moveQuality,moveQualityPending,patternCueStatus:patternCue.status});
  const showValidatedBadge=trainerView==="assisted"&&!showAnswer&&moveQualityUserStatus==="verified"&&shouldValidateTrainingMove;
  const moveImpact=impactFromEngine(engineLines[0]);
  const accuracy=getAccuracy(progress);
  const mistakes=Object.values(progress.mistakes).sort((a,b)=>b.count-a.count);
  const cpWhite=evalForWhite(engineLines[0]?.cp,game.turn() as ChessColor);
  const whitePct=whiteEvalPercent(cpWhite);
  const evalText=advantageLabel(cpWhite);
  const captured=capturedSummary(game);
  const endingInfo=gameEndingInfo(game);
  const isReviewingHistory=historyIndex<positionHistory.length-1;
  const selectedLegalMoves=selectedSquare&&!isReviewingHistory&&!game.isGameOver()?(game.moves({square:selectedSquare as any,verbose:true}) as any[]):[];
  const gptDebugText=JSON.stringify({pipeline:brainResponse?.pipeline??null,engine:enginePreview??null,moveQuality,moveQualityPending,shouldValidateTrainingMove,debug:brainResponse?.debug??null},null,2);
  const visualDebugText=JSON.stringify(visualDebugSnapshot,null,2);
  const telemetryDebugText=JSON.stringify(telemetryEvents.slice(-30),null,2);
  const visualModelRequestKey=useMemo(()=>JSON.stringify({
    fen:normalizeFen(fen),
    moveHistory,
    trainingPhase:trainingMode==="continuation"?"continuation":bookComplete?"book_complete":isUserTurn?"user_turn":"opponent_turn",
    userColor,
    expectedMove:expectedUserOptions[0]?.uci??null,
    bookStatus:bookComplete?"complete":expectedUserOptions.length?"in_book":"pending",
    stockfishBest:engineLines[0]?.uci??null,
    stockfishCp:engineLines[0]?.cp??null,
    openingName:repertoire.name,
    rating:rating.label,
  }),[fen,moveHistory.join("|"),trainingMode,bookComplete,isUserTurn,userColor,expectedUserOptions.map(m=>m.uci).join("|"),engineLines[0]?.uci,engineLines[0]?.cp,repertoire.name,rating.label]);
  function recordLocalTelemetry(event:LocalTelemetryEvent["event"],details:Record<string,unknown>){
    if(!telemetryEnabledRef.current)return;
    const entry:LocalTelemetryEvent={id:++telemetrySeq.current,ts:Date.now(),event,details};
    setTelemetryEvents(prev=>{
      const next=[...prev,entry].slice(-MAX_LOCAL_TELEMETRY_EVENTS);
      telemetryEventsRef.current=next;
      return next;
    });
  }
  function trackLearningEvent(input:Partial<LearningEvent>&Pick<LearningEvent,"type"|"source">){
    recordLearningEvent({
      sessionId:learningSessionIdRef.current,
      source:input.source,
      type:input.type,
      fen,
      openingId:selectedRepertoireId,
      openingName:repertoire.name,
      trainerView,
      trainingMode,
      moveQualityStatus:moveQuality?.status,
      moveQualityUserStatus,
      ...input,
    });
  }
  useEffect(()=>{const saved=localStorage.getItem("blundr-v22-progress");const savedCustom=localStorage.getItem("blundr-v22-custom");const savedSettings=localStorage.getItem("blundr-board-settings");const savedTelemetry=localStorage.getItem(LOCAL_TELEMETRY_KEY);if(saved)try{setProgress(JSON.parse(saved))}catch{}if(savedCustom)try{setCustomRepertoires(JSON.parse(savedCustom))}catch{}if(savedSettings)try{setBoardSettings({...DEFAULT_BOARD_SETTINGS,...JSON.parse(savedSettings)})}catch{}if(savedTelemetry)try{const parsed=JSON.parse(savedTelemetry) as Partial<LocalTelemetryStore>;const nextEvents=Array.isArray(parsed.events)?parsed.events.slice(-MAX_LOCAL_TELEMETRY_EVENTS):[];setTelemetryEnabled(Boolean(parsed.enabled));setTelemetryEvents(nextEvents);telemetryEventsRef.current=nextEvents;telemetrySeq.current=nextEvents.reduce((max,event)=>Math.max(max,Number(event.id)||0),0)}catch{}},[]);
  useEffect(()=>localStorage.setItem("blundr-v22-progress",JSON.stringify(progress)),[progress]);
  useEffect(()=>localStorage.setItem("blundr-v22-custom",JSON.stringify(customRepertoires)),[customRepertoires]);
  useEffect(()=>localStorage.setItem("blundr-board-settings",JSON.stringify(boardSettings)),[boardSettings]);
  useEffect(()=>{telemetryEnabledRef.current=telemetryEnabled},[telemetryEnabled]);
  useEffect(()=>{telemetryEventsRef.current=telemetryEvents},[telemetryEvents]);
  useEffect(()=>{const store:LocalTelemetryStore={enabled:telemetryEnabled,events:telemetryEvents.slice(-MAX_LOCAL_TELEMETRY_EVENTS),updatedAt:Date.now()};localStorage.setItem(LOCAL_TELEMETRY_KEY,JSON.stringify(store))},[telemetryEnabled,telemetryEvents]);
  useEffect(()=>{
    const api={
      getEvents:()=>telemetryEventsRef.current.slice(),
      clear:()=>setTelemetryEvents([]),
      setEnabled:(enabled:boolean)=>setTelemetryEnabled(Boolean(enabled)),
      getVisualDebug:()=>visualDebugSnapshot,
    };
    (window as any).__blundrLocalTelemetry=api;
    return()=>{if((window as any).__blundrLocalTelemetry===api)delete (window as any).__blundrLocalTelemetry};
  },[visualDebugSnapshot]);
  useEffect(()=>{const t=window.setInterval(()=>{if(opponentCue&&Date.now()>opponentCue.expiresAt)setOpponentCue(null)},250);return()=>window.clearInterval(t)},[opponentCue]);
  useEffect(()=>setBrain(p=>({...p,ratingLabel:rating.label,ratingPool:rating.target})),[rating.label,rating.target]);
  useEffect(()=>{fenRef.current=fen;setBrainResponse(null);setEnginePreview(null);setVisualModelOutput(null);setVisualModelError(null);setVisualDebugSnapshot(prev=>({...prev,responseSummary:null,responseDebug:null,error:null,durationMs:null,updatedAt:Date.now()}))},[fen]);
  useEffect(()=>{if(activeTab==="train")positionStartedAtRef.current=Date.now()},[fen,activeTab]);
  useEffect(()=>{if(!enabledViews.includes(activeBoardView)&&enabledViews.length)setActiveBoardView(enabledViews[0])},[activeBoardView,enabledViews.join("|")]);
  useEffect(()=>{
    if(!shouldValidateTrainingMove){
      setMoveQuality(null);
      setMoveQualityPending(false);
      return;
    }

    const expectedMoves=expectedMovesForValidation;
    if(!expectedMoves.length){
      setMoveQuality({
        status:"unavailable",
        fen,
        expectedMovesUci:[],
        topMoves:[],
        reason:"No UCI expected move was available for validation.",
        checkedAt:Date.now(),
      });
      setMoveQualityPending(false);
      return;
    }

    const cacheKey=buildMoveQualityCacheKey({
      fen,
      expectedMovesUci:expectedMoves.map((move)=>move.uci),
    });

    const cached=moveQualityCacheRef.current.get(cacheKey);
    if(cached){
      setMoveQuality(cached);
      setMoveQualityPending(false);
      return;
    }

    let cancelled=false;
    setMoveQualityPending(true);
    setMoveQuality({
      status:"pending",
      fen,
      expectedMovesUci:expectedMoves.map((move)=>move.uci),
      topMoves:[],
      reason:"Validating expected move with Stockfish.",
      checkedAt:Date.now(),
    });

    async function runValidation(){
      try{
        const topMoves=await getStockfishTopMovesForValidation({
          fen,
          multipv:2,
          depth:10,
          timeoutMs:5000,
        });
        if(cancelled)return;
        const result=evaluateTopTwoMatch({
          fen,
          expectedMoves,
          topMoves,
        });
        moveQualityCacheRef.current.set(cacheKey,result);
        setMoveQuality(result);
        setMoveQualityPending(false);
      }catch(error){
        if(cancelled)return;
        const result:MoveQualityResult={
          status:"unavailable",
          fen,
          expectedMovesUci:expectedMoves.map((move)=>move.uci),
          topMoves:[],
          reason:error instanceof Error?error.message:"Stockfish validation failed.",
          checkedAt:Date.now(),
        };
        moveQualityCacheRef.current.set(cacheKey,result);
        setMoveQuality(result);
        setMoveQualityPending(false);
      }
    }

    void runValidation();
    return()=>{cancelled=true};
  },[fen,shouldValidateTrainingMove,expectedMovesForValidationKey]);
  useEffect(()=>{
    if(activeTab!=="train"||!shouldValidateTrainingMove||!moveQuality)return;
    if(moveQualityPending)return;
    const eventKey=`${normalizeFen(fen)}|${moveQuality.status}|${moveQuality.checkedAt}`;
    if(lastMoveQualityEventKeyRef.current===eventKey)return;
    lastMoveQualityEventKeyRef.current=eventKey;
    trackLearningEvent({
      type:"move_quality_checked",
      source:"train",
      fen,
      moveQualityStatus:moveQuality.status,
      moveQualityUserStatus,
      metadata:{
        required:shouldValidateTrainingMove,
        topMoveCount:moveQuality.topMoves.length,
      },
    });
  },[activeTab,fen,moveQuality,moveQualityPending,moveQualityUserStatus,shouldValidateTrainingMove]);
  useEffect(()=>{
    if(activeTab!=="train"||isReviewingHistory)return;
    const requestFen=fen;
    const requestStarted=performance.now();
    const requestSeq=++visualRequestSeq.current;
    visualAbortRef.current?.abort();
    const requestGame=new Chess(requestFen);
    const continuationEnginePending=trainingMode==="continuation"&&requestGame.turn()===userColor&&!engineLines[0];
    if(requestGame.isGameOver()){setVisualModelPending(false);setVisualModelError(null);return}
    if(continuationEnginePending){setVisualModelPending(false);setVisualModelError(null);return}
    const controller=new AbortController();
    visualAbortRef.current=controller;
    setVisualModelPending(true);
    setVisualModelError(null);
    const trainingPhase=trainingMode==="continuation"?"continuation":bookComplete?"book_complete":isUserTurn?"user_turn":"opponent_turn";
    const payload={
      fen:requestFen,
      moveHistory,
      userColor,
      userRatingBucket:rating.label,
      trainingPhase,
      trainingMode,
      expectedMove:expectedUserOptions[0]?{san:expectedUserOptions[0].san,uci:expectedUserOptions[0].uci}:undefined,
      expectedMoves:expectedUserOptions.map(m=>({san:m.san,uci:m.uci})),
      bookStatus:bookComplete?"complete":expectedUserOptions.length?"in_book":"pending",
      openingName:repertoire.name,
      stockfishSummary:engineLines[0]?{bestMove:{san:engineLines[0].san,uci:engineLines[0].uci},pvs:engineLines}:undefined,
      coachingMemory:{
        conceptSeenCount:progress.trainedPositions[normalizeFen(requestFen)]?1:0,
        missedCount:progress.mistakes[normalizeFen(requestFen)]?.count??0,
        successCount:progress.trainedPositions[normalizeFen(requestFen)]?1:0,
      },
    };
    setVisualDebugSnapshot({requestKey:visualModelRequestKey,requestPayload:payload as Record<string,unknown>,responseSummary:null,responseDebug:null,error:null,durationMs:null,updatedAt:Date.now()});
    recordLocalTelemetry("visual_request",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),trainingPhase,trainingMode,bookStatus:payload.bookStatus,hasExpectedMove:Boolean(expectedUserOptions[0]),hasEngine:Boolean(engineLines[0])});
    if(controller.signal.aborted)return;
    if(requestSeq!==visualRequestSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen))return;
    void fetch("/api/blundr-visual-model",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),signal:controller.signal})
      .then(async(res)=>{if(!res.ok)throw new Error(`visual model ${res.status}`);return await res.json() as VisualModelOutput})
      .then((data)=>{if(requestSeq!==visualRequestSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen))return;const durationMs=Math.round(performance.now()-requestStarted);const suppress=Array.isArray(data.suppress)?data.suppress:[];const responseSummary={source:typeof data.source==="string"?data.source:null,fallback:Boolean(data.fallback),suppress,arrowCount:Array.isArray(data.arrows)?data.arrows.length:0,squareCount:Array.isArray(data.squares)?data.squares.length:0,animation:data.animationPackage?.name??data.animation??null,contextHeadline:data.context?.headline??null};setVisualDebugSnapshot(prev=>({...prev,responseSummary,responseDebug:data.debug&&typeof data.debug==="object"?data.debug as Record<string,unknown>:null,error:null,durationMs,updatedAt:Date.now()}));setVisualModelOutput(data);setVisualModelPending(false);recordLocalTelemetry("visual_response",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),durationMs,source:responseSummary.source,fallback:responseSummary.fallback,suppressed:suppress.includes("recommendation_pending"),arrowCount:responseSummary.arrowCount,squareCount:responseSummary.squareCount});if(suppress.includes("recommendation_pending"))recordLocalTelemetry("visual_suppressed",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),reason:"recommendation_pending"})})
      .catch((error)=>{if(error instanceof Error&&error.name==="AbortError")return;if(requestSeq!==visualRequestSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen))return;const message=error instanceof Error?error.message:"Visual model failed";setVisualDebugSnapshot(prev=>({...prev,error:message,responseSummary:null,responseDebug:null,durationMs:Math.round(performance.now()-requestStarted),updatedAt:Date.now()}));setVisualModelError(message);setVisualModelPending(false);recordLocalTelemetry("visual_error",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),message})});
    return()=>controller.abort();
  },[activeTab,isReviewingHistory,visualModelRequestKey]);
  useEffect(()=>{if(activeTab!=="train")return;const fast=deriveFastAnnotation({fen,openingName:repertoire.name,userColor,trainingMode,expectedUserOptions,opponentBookOptions});setAnnotation(fast);setVisualReady(true);setThinkingStep("ready");setPipelineNote(trainingMode==="continuation"&&isUserTurn?"Blundr Brain is checking the continuation. No fallback move will be shown.":"Teaching cue ready.");setBrain(p=>({...p,source:"rule visual",gpt:"ready",note:"Manual reveal/debug only"}))},[fen,activeTab,selectedRepertoireId,trainingMode,ratingFilter]);
  useEffect(()=>{
    if(activeTab!=="train"||!shouldValidateTrainingMove)return;
    if(moveQualityPending){setPipelineNote("Blundr Brain is checking the position.");return}
    if(moveQuality?.status==="verified_top1"||moveQuality?.status==="verified_top2"){setPipelineNote("Teaching cue ready.");return}
    if(moveQuality?.status==="rejected"){setPipelineNote("Saved line needs review. Blundr will not invent a teaching cue.");return}
    if(moveQuality?.status==="unavailable"){setPipelineNote("Move not verified. Blundr will stay quiet instead of guessing.");}
  },[activeTab,shouldValidateTrainingMove,moveQualityPending,moveQuality?.status]);
  useEffect(()=>{if(activeTab==="train"&&trainingMode==="restricted"&&isUserTurn&&expectedUserOptions.length===0&&!bookComplete&&!game.isGameOver()){setBookComplete(true);setFeedback("Book complete. Continue against the bot from this position or restart the opening.");setBrain(p=>({...p,book:"complete",source:"book complete",gpt:p.gpt}))}},[activeTab,trainingMode,isUserTurn,expectedUserOptions.length,bookComplete,fen]);
  useEffect(()=>{if(activeTab!=="train"||bookComplete||isReviewingHistory)return;if(game.isGameOver()){setFeedback((endingInfo?.title??"Game over")+". Restart the opening to train again.");return}if(!isUserTurn){const timer=window.setTimeout(()=>void playOpponentMove(),900);return()=>window.clearTimeout(timer)}},[activeTab,fen,bookComplete,isUserTurn,isReviewingHistory,selectedRepertoireId,trainingMode,ratingFilter]);
  async function loadExplorer(positionFen:string){const cacheKey=`${normalizeFen(positionFen)}|${ratingFilter}|${speedFilter}`;if(explorerCache.current[cacheKey]){const parsed=parseExplorerMoves(explorerCache.current[cacheKey]);setExplorerMoves(parsed);setBrain(p=>({...p,lichess:"cached"}));return parsed}setBrain(p=>({...p,lichess:"loading"}));const start=performance.now();try{const params=new URLSearchParams({fen:positionFen,source:"lichess",moves:"25",ratings:ratingFilter,speeds:speedFilter});const res=await fetch(`/api/explorer?${params.toString()}`);const payload=await res.json();explorerCache.current[cacheKey]=payload;const parsed=parseExplorerMoves(payload);setExplorerMoves(parsed);setBrain(p=>({...p,lichess:payload.fallback?"fallback":"active",latency:Math.round(performance.now()-start),note:payload.reason??`${parsed.length} Lichess moves`}));return parsed}catch(e){setBrain(p=>({...p,lichess:"error",note:e instanceof Error?e.message:"Explorer failed"}));return[]}}
  async function runBrain(eventType:string,extra:Record<string,any>={}){
    if(activeTab!=="train")return null;
    const requestFen=fen;
    const requestSeq=++brainSeq.current;
    brainAbortRef.current?.abort();
    const controller=new AbortController();
    brainAbortRef.current=controller;
    setThinkingStep("facts");
    setPipelineNote("Manual Brain check started.");
    setBrain(p=>({...p,engine:"loading",gpt:extra.skipGpt?"fallback":"loading",source:"Manual analysis"}));
    setThinkingStep("engine");
    setPipelineNote("Manual analysis started.");
    const browserEngine=extra.skipClientEngine?null:await runBrowserStockfish(requestFen,rating.skill,eventType==="reveal"?1000:700);
    if(requestSeq!==brainSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen))return null;
    const clientEngine=browserEngine?{source:browserEngine.source,pvs:browserEngine.pvs,depth:browserEngine.depth,timeMs:browserEngine.timeMs}:undefined;
    if(browserEngine?.pvs?.length){
      setEnginePreview({fen:requestFen,pvs:browserEngine.pvs,source:browserEngine.source});
      const requestGame=new Chess(requestFen);
      if(trainingMode==="continuation"&&requestGame.turn()===userColor){
        setAnnotation(engineAnnotationFromLine({fen:requestFen,line:browserEngine.pvs[0],openingName:repertoire.name}));
        setVisualReady(true);
        setPipelineNote(`Manual analysis ready: ${browserEngine.pvs[0].san}.`);
      }
    }
    setBrain(p=>({...p,engine:browserEngine?"active":"fallback",source:browserEngine?"Manual analysis":"Engine fallback",note:browserEngine?`depth ${browserEngine.depth??"?"} • ${browserEngine.timeMs} ms`:"Manual analysis unavailable"}));
    const payload={fen:requestFen,openingId:repertoire.id,openingName:repertoire.name,userColor,trainingMode,eventType,selectedView:activeBoardView,moveHistory,lastMoveSan,lastMoveUci:lastMove,expectedMoves:expectedUserOptions.map(m=>({san:m.san,uci:m.uci})),opponentBookMoves:opponentBookOptions.map(m=>({san:m.san,uci:m.uci})),ratingPool:rating.target,ratingLabel:rating.label,ratingFilter,speedFilter,skill:rating.skill,clientEngine,...extra};
    setThinkingStep("brain");
    setPipelineNote(extra.skipGpt?"Manual analysis request sent.":"Sending local facts to Brain because the user requested reveal/debug.");
    const start=performance.now();
    try{
      const res=await fetch("/api/brain",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),signal:controller.signal});
      const data=await res.json() as BrainResponse;
      if(requestSeq!==brainSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen))return null;
      setThinkingStep("gpt-receive");
      setPipelineNote(data.annotation?.fallback?"Manual Brain response received (fallback).":"Manual Brain response received.");
      setBrainResponse(data);
      if(data.engine?.pvs?.length)setEnginePreview({fen:requestFen,pvs:data.engine.pvs,source:data.engine.source});
      const requestGame=new Chess(requestFen);
      const safeAnnotation=trainingMode==="continuation"&&requestGame.turn()===userColor&&data.engine?.pvs?.[0]
        ? engineAnnotationFromLine({fen:requestFen,line:data.engine.pvs[0],openingName:repertoire.name})
        : data.annotation;
      setAnnotation(safeAnnotation);
      setVisualReady(true);
      setThinkingStep("visual-update");
      setPipelineNote("Applied manual Brain output.");
      window.setTimeout(()=>{if(requestSeq===brainSeq.current&&normalizeFen(fenRef.current)===normalizeFen(requestFen)){setThinkingStep("ready");setPipelineNote("Manual Brain check complete.")}},250);
      setBrain(p=>({...p,engine:data.engine?.fallback?"fallback":"active",gpt:data.annotation?.fallback?"fallback":"active",latency:Math.round(performance.now()-start),source:data.annotation?.fallback?"manual brain fallback":"manual brain",note:data.pipeline?.gpt||data.annotation?.reason||"Manual reveal/debug only"}));
      return data;
    }catch(e){
      if(e instanceof Error&&e.name==="AbortError")return null;
      if(requestSeq!==brainSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen))return null;
      setVisualReady(true);
      setThinkingStep("error");
      setPipelineNote(e instanceof Error?e.message:"Brain endpoint failed");
      setBrain(p=>({...p,engine:"error",gpt:"error",source:"Brain error",note:e instanceof Error?e.message:"Brain failed"}));
      return null;
    }
  }
  function resetHistory(startFen:string){setPositionHistory([startFen]);setHistoryIndex(0)}
  function selectRepertoire(id:string){const startFen=new Chess().fen();setSelectedRepertoireId(id);setFen(startFen);resetHistory(startFen);setSelectedSquare(null);setFeedback("Opening loaded. Play the restricted training move.");setLastMove(null);setLastMoveSan("");setMoveHistory([]);setShowAnswer(false);setTrainingMode("restricted");setBookComplete(false);setOpponentCue(null);setAnnotation(blankAnnotation());setEnginePreview(null);setActiveBoardView("plan");setActiveTab("train")}
  function resetBoard(){const startFen=new Chess().fen();setFen(startFen);resetHistory(startFen);setSelectedSquare(null);setFeedback("Restarted. Find the first training move.");setLastMove(null);setLastMoveSan("");setMoveHistory([]);setShowAnswer(false);setTrainingMode("restricted");setBookComplete(false);setOpponentCue(null);setAnnotation(blankAnnotation());setEnginePreview(null);setActiveTab("train")}
  function recordPosition(nextFen:string){const nextIndex=historyIndex+1;setPositionHistory(prev=>[...prev.slice(0,nextIndex),nextFen]);setHistoryIndex(nextIndex)}
  function jumpHistory(direction:-1|1){const next=Math.max(0,Math.min(positionHistory.length-1,historyIndex+direction));if(next===historyIndex)return;setHistoryIndex(next);setFen(positionHistory[next]);setSelectedSquare(null);setOpponentCue(null);setBookComplete(false);setFeedback(next===positionHistory.length-1?"Returned to the live position.":`Reviewing previous position ${next} of ${positionHistory.length-1}. Use the arrows to return to live play.`)}
  async function playOpponentMove(forceContinuation=false){
    const current=new Chess(fen);
    const mode:TrainingMode=forceContinuation?"continuation":trainingMode;
    const currentOptions=tree[normalizeFen(current.fen())]??[];
    const currentOpponentBookOptions=currentOptions.filter(m=>m.color===opponentColor);
    setBrain(p=>({...p,source:"opponent thinking",book:mode==="restricted"?(currentOpponentBookOptions.length?"active":"complete"):"complete",lichess:"loading"}));
    await new Promise(r=>setTimeout(r,700));
    let chosen:{san:string;uci:string;fen:string}|null=null;
    let source="";
    if(mode==="restricted"){
      if(!currentOpponentBookOptions.length){setBookComplete(true);setFeedback("Book complete. Train this branch again or continue vs bot.");setBrain(p=>({...p,book:"complete",source:"book complete",lichess:"ready"}));return}
      const explorer=await loadExplorer(current.fen());
      const valid=currentOpponentBookOptions.map(book=>{const match=explorer.find(m=>m.uci===book.uci);return{...book,weight:match?.total??1,pct:match?.pct??0}});
      const weighted=pickWeighted(valid);
      chosen={san:weighted.san,uci:weighted.uci,fen:weighted.resultingFen};
      source=weighted.pct?`Lichess-weighted opening branch (${weighted.pct}%)`:"Saved opening branch";
    }else{
      const explorer=await loadExplorer(current.fen());
      const playable=explorer.map(m=>{const a=applyUci(current.fen(),m.uci);return a?{...a,weight:m.total,pct:m.pct}:null}).filter(Boolean) as Array<{san:string;uci:string;fen:string;weight:number;pct:number}>;
      if(playable.length){const pick=pickWeighted(playable);chosen=pick;source=`Lichess continuation (${pick.pct}%)`}
      else{const data=await runBrain("bot_select",{skipGpt:true});const top=data?.engine?.pvs?.[0];const a=top?applyUci(current.fen(),top.uci):null;if(a){chosen=a;source=`Engine continuation (${rating.target})`}}
    }
    if(!chosen){const legal=current.moves({verbose:true}) as any[];if(!legal.length)return;const move=legal[0];current.move({from:move.from,to:move.to,promotion:move.promotion??"q"});chosen={san:move.san,uci:moveToUci(move),fen:current.fen()};source="Emergency legal fallback"}
    setFen(chosen.fen);recordPosition(chosen.fen);setLastMove(chosen.uci);setLastMoveSan(chosen.san);setMoveHistory(prev=>[...prev,chosen.san]);setSelectedSquare(null);setShowAnswer(false);setOpponentCue(boardSettings.showOpponentCue?{expiresAt:Date.now()+2500,title:`Opponent: ${chosen.san}`,message:"Brief opponent cue. Your selected user-side view stays visible after this fades.",lines:[{from:chosen.uci.slice(0,2),to:chosen.uci.slice(2,4),kind:"opponent",label:chosen.san}],cues:[{square:chosen.uci.slice(2,4),kind:"opponent"}]}:null);setFeedback(`Opponent played ${chosen.san}. Source: ${source}.`);setBrain(p=>({...p,source,lichess:source.includes("Lichess")?"active":p.lichess}))
  }
  function handleTrainerViewChange(nextTrainerView:TrainerView){
    if(nextTrainerView===trainerView)return;
    setTrainerView(nextTrainerView);
    trackLearningEvent({
      type:"trainer_view_changed",
      source:"train",
      metadata:{nextTrainerView},
    });
  }
  function handleReveal(){
    setShowAnswer(true);
    trackLearningEvent({
      type:"cue_revealed",
      source:"train",
      expectedMoveSan:expectedUserOptions[0]?.san,
      expectedMoveUci:expectedUserOptions[0]?.uci,
    });
    void runBrain("reveal");
  }
  function continueVsBot(){setTrainingMode("continuation");setBookComplete(false);setFeedback(`Continuation mode active. Legal moves are accepted and evaluated at ${rating.target}.`);setBrain(p=>({...p,source:"continuation mode",book:"complete"}));if(!isUserTurn)setTimeout(()=>void playOpponentMove(true),350)}
  function handleSquareTap(square:string){if(bookComplete)return;if(endingInfo){setFeedback("Game over. Restart the opening to continue.");return}if(isReviewingHistory){setFeedback("You are reviewing an older position. Use the forward arrow to return to the live board before moving.");return}if(!isUserTurn){setFeedback("Opponent is thinking. Wait for your turn.");return}if(!selectedSquare){if(isOwnPiece(game,square,userColor)){setSelectedSquare(square);setFeedback(`Selected ${square}. Legal destinations are highlighted.`)}else setFeedback("Tap one of your pieces first.");return}if(square===selectedSquare){setSelectedSquare(null);setFeedback("Selection cleared.");return}if(isOwnPiece(game,square,userColor)){setSelectedSquare(square);setFeedback(`Selected ${square}. Legal destinations are highlighted.`);return}void attemptMove(selectedSquare,square)}
  function logMistake(positionFen:string,expected:string,played:string){const k=normalizeFen(positionFen);setProgress(prev=>{const old=prev.mistakes[k];return{...prev,attempts:prev.attempts+1,incorrect:prev.incorrect+1,streak:0,mistakes:{...prev.mistakes,[k]:{fen:positionFen,expectedMove:expected,playedMove:played,count:old?old.count+1:1,opening:repertoire.name,repertoireId:repertoire.id}}}})}
  async function attemptMove(from:string,to:string){
    const current=new Chess(fen);
    const beforeFen=fen;
    const currentKey=normalizeFen(current.fen());
    const timeToMoveMs=Math.max(0,Date.now()-positionStartedAtRef.current);
    let legal:any=null;
    try{legal=current.move({from,to,promotion:"q"})}catch{}
    setSelectedSquare(null);
    if(!legal){
      setFeedback("Illegal move. Try another move.");
      return;
    }
    const playedUci=moveToUci(legal);
    const expectedMove=expectedUserOptions[0];
    if(trainingMode==="restricted"){
      const correct=expectedUserOptions.some(m=>m.uci===playedUci);
      if(!correct){
        const expected=expectedMove?.san??"No saved move";
        logMistake(beforeFen,expected,legal.san);
        setShowAnswer(true);
        if(isMoveQualityVerified(moveQuality)){
          setFeedback(`Not quite. ${legal.san} is legal, but this drill is looking for ${expected}. Blundr Brain validated this pattern.`);
        }else if(moveQuality?.status==="rejected"||moveQuality?.status==="unavailable"){
          setFeedback(`Not quite. ${legal.san} is legal, but this saved line needs review before Blundr teaches it as a pattern.`);
        }else{
          setFeedback(`Not quite. ${legal.san} is legal, but this drill is looking for the saved line move.`);
        }
        trackLearningEvent({
          type:"move_incorrect",
          source:"train",
          fen:beforeFen,
          expectedMoveSan:expectedMove?.san,
          expectedMoveUci:expectedMove?.uci,
          playedMoveSan:legal.san,
          playedMoveUci:playedUci,
          correct:false,
          timeToMoveMs,
        });
        return;
      }
    }
    setFen(current.fen());
    recordPosition(current.fen());
    setLastMove(playedUci);
    setLastMoveSan(legal.san);
    setMoveHistory(prev=>[...prev,legal.san]);
    setOpponentCue(null);
    setShowAnswer(false);
    setFeedback(trainingMode==="restricted"?`Correct: ${legal.san}.`:`Played ${legal.san}. Move will be evaluated.`);
    setProgress(prev=>{
      const next={...prev.mistakes};
      if(reviewingFen&&next[reviewingFen]){
        if(next[reviewingFen].count<=1)delete next[reviewingFen];
        else next[reviewingFen]={...next[reviewingFen],count:next[reviewingFen].count-1};
      }
      return{...prev,attempts:prev.attempts+1,correct:prev.correct+1,streak:prev.streak+1,trainedPositions:{...prev.trainedPositions,[currentKey]:true},mistakes:next};
    });
    trackLearningEvent({
      type:"move_correct",
      source:"train",
      fen:beforeFen,
      expectedMoveSan:expectedMove?.san,
      expectedMoveUci:expectedMove?.uci,
      playedMoveSan:legal.san,
      playedMoveUci:playedUci,
      correct:true,
      timeToMoveMs,
    });
    setReviewingFen(null);
  }
  function practiceMistake(m:Mistake){const rep=repertoires.find(r=>r.id===m.repertoireId);if(rep)setSelectedRepertoireId(rep.id);setFen(m.fen);resetHistory(m.fen);setReviewingFen(normalizeFen(m.fen));setFeedback("Review this opening position. Play the expected move.");setMoveHistory([]);setShowAnswer(false);setTrainingMode("restricted");setBookComplete(false);setActiveTab("train")}
  function createCustomRepertoire(){const moves=newLineText.replace(/\d+\./g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean);if(!moves.length)return;const test=new Chess();for(const move of moves){try{if(!test.move(move)){setFeedback(`Could not parse move: ${move}`);return}}catch{setFeedback(`Could not parse move: ${move}`);return}}const rep:Repertoire={id:`custom-${Date.now()}`,name:newRepName.trim()||"My Custom Repertoire",color:newRepColor,description:"Custom line saved on this device.",lines:[moves],custom:true};setCustomRepertoires(prev=>[...prev,rep]);setSelectedRepertoireId(rep.id);setShowAddLine(false);const startFen=new Chess().fen();setFen(startFen);resetHistory(startFen);setTrainingMode("restricted");setBookComplete(false);setFeedback("Custom repertoire saved. Restricted training is active.");setActiveTab("train")}
  const squareStyles:Record<string,CSSProperties>={};
  if(lastMove&&lastMove.length>=4){
    squareStyles[lastMove.slice(0,2)]={boxShadow:"inset 0 0 0 999px rgba(255,255,255,.12), inset 0 0 22px rgba(255,255,255,.5)"};
    squareStyles[lastMove.slice(2,4)]={boxShadow:"inset 0 0 0 999px rgba(255,255,255,.16), inset 0 0 24px rgba(255,255,255,.62)"};
  }
  if(activeBoard){
    const visualSquares=hidePreMoveHints?[]:visualModelOutput?(activeVisualModelOutput?(activeVisualModelOutput.squares??[]):[]):currentView.cues.slice(0,3).map(c=>({square:c.square,kind:c.kind,role:c.kind}));
    for(const cue of visualSquares.slice(0,4)){
      if(!isValidSquare(cue.square))continue;
      const role=cue.role??cue.kind;
      const bg=role==="source"||cue.kind==="origin"?"rgba(94,126,255,.24)":role==="defense"||role==="king_safety"||cue.kind==="support"?"rgba(80,190,120,.24)":role==="weakness"||role==="danger"||role==="soft_target"||cue.kind==="danger"?"rgba(255,80,80,.24)":role==="center"?"rgba(255,210,70,.30)":"rgba(255,210,70,.26)";
      const shadow=role==="destination"?"inset 0 0 0 3px rgba(94,126,255,.82), inset 0 0 26px rgba(94,126,255,.48)":role==="king_safety"?"inset 0 0 0 3px rgba(22,163,74,.62), inset 0 0 24px rgba(22,163,74,.42)":role==="weakness"||role==="danger"?"inset 0 0 0 3px rgba(239,68,68,.58), inset 0 0 24px rgba(239,68,68,.34)":"inset 0 0 22px rgba(255,210,70,.58)";
      squareStyles[cue.square]={...squareStyles[cue.square],background:`radial-gradient(circle, ${bg} 0%, ${bg} 38%, transparent 72%)`,boxShadow:shadow};
    }
    if(opponentCue&&boardSettings.showOpponentCue)for(const cue of opponentCue.cues){
      squareStyles[cue.square]={...squareStyles[cue.square],background:"radial-gradient(circle, rgba(184,132,255,.28) 0%, rgba(184,132,255,.18) 38%, transparent 72%)"};
    }
  }
  if(boardSettings.showMoveDots&&selectedLegalMoves.length){
    for(const m of selectedLegalMoves){
      const isCapture=Boolean(m.captured);
      const dot=isCapture?"rgba(239,68,68,.38)":"rgba(22,163,74,.46)";
      squareStyles[m.to]={...squareStyles[m.to],background:`radial-gradient(circle, ${dot} 0%, ${dot} 18%, transparent 23%)`,boxShadow:isCapture?"inset 0 0 0 3px rgba(239,68,68,.58)":"inset 0 0 0 2px rgba(22,163,74,.30)"};
    }
  }
  if(selectedSquare)squareStyles[selectedSquare]={...squareStyles[selectedSquare],boxShadow:"inset 0 0 0 3px rgba(22,101,52,.85), inset 0 0 24px rgba(22,101,52,.5)"};
  return <main className="min-h-screen bg-[#f7f7f4] text-stone-950"><div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
    {activeTab==="home"&&<section className="space-y-6"><header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm"><Beaker size={20}/></div><div><h1 className="text-2xl font-bold tracking-tight">Blundr</h1><p className="text-sm text-stone-500">Visual opening training with a controlled trainer.</p></div></div><button onClick={()=>setShowSettings(true)} className="rounded-2xl bg-white p-3 shadow-sm"><Settings className="text-stone-500" size={20}/></button></header><div className="grid grid-cols-2 gap-3"><MetricCard label="Accuracy" value={`${accuracy}%`} sub="all time" icon={<Trophy size={19}/>}/><MetricCard label="Streak" value={String(progress.streak)} sub="correct" icon={<Flame size={19}/>}/><MetricCard label="Review" value={String(mistakes.length)} sub="mistakes" icon={<XCircle size={19}/>} warning/><MetricCard label="Openings" value={String(repertoires.length)} sub="available" icon={<BookOpen size={19}/>}/></div><div className="rounded-3xl bg-stone-900 p-4 text-white shadow-sm"><div className="flex items-center gap-2 text-sm font-bold text-green-300"><Cloud size={17}/> v2.7.33</div><p className="mt-2 text-sm leading-6 text-stone-300">Training now uses rule-only visual cues by default. Blundr Brain is reserved for manual reveal/debug, so normal practice stays fast, deterministic, and inexpensive.</p></div><div className="space-y-3">{repertoires.slice(0,5).map(r=><button key={r.id} onClick={()=>selectRepertoire(r.id)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-3 text-left shadow-sm"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">{r.color==="white"?"♙":"♟"}</div><div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-sm text-stone-500">{r.lines.length} lines • {countPositions(r)} positions</div><p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.description}</p></div><ChevronRight className="text-stone-400" size={20}/></button>)}</div></section>}
    {activeTab==="repertoire"&&<section className="space-y-5"><header className="flex items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">Repertoires</h1><p className="text-sm text-stone-500">Reliable openings included in the app.</p></div><button onClick={()=>setShowAddLine(true)} className="rounded-2xl bg-green-700 px-4 py-2 text-sm font-black text-white">Add</button></header><div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm"><Search size={18} className="text-stone-400"/><span className="text-sm text-stone-400">Search repertoires</span></div><div className="space-y-3">{repertoires.map(r=><button key={r.id} onClick={()=>selectRepertoire(r.id)} className={classNames("flex w-full items-center gap-3 rounded-3xl border bg-white p-3 text-left shadow-sm",r.id===selectedRepertoireId?"border-green-700":"border-stone-200")}><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">{r.color==="white"?"♙":"♟"}</div><div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-sm text-stone-500">{r.lines.length} lines • {countPositions(r)} positions • {r.color}</div><p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.description}</p></div><ChevronRight className="text-stone-400" size={20}/></button>)}</div></section>}
    {activeTab==="train"&&<section className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{repertoire.name}</h1>
          <p className="text-sm font-semibold text-green-700">{trainingMode==="restricted"?"Restricted trainer":"Continuation"} • {rating.target}{isReviewingHistory?" • reviewing":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setShowSettings(true)} className="rounded-2xl bg-white p-3 shadow-sm"><Settings size={20}/></button>
          <button onClick={resetBoard} className="rounded-2xl bg-white p-3 shadow-sm"><RotateCcw size={20}/></button>
        </div>
      </header>
      <LiveBrain brain={brain}/>
      <GptDebugPanel open={showGptDebug} setOpen={setShowGptDebug} text={gptDebugText}/>
      <VisualDebugPanel
        open={showVisualDebug}
        setOpen={setShowVisualDebug}
        visualText={visualDebugText}
        telemetryText={telemetryDebugText}
        telemetryEnabled={telemetryEnabled}
        setTelemetryEnabled={setTelemetryEnabled}
        telemetryCount={telemetryEvents.length}
        onClearTelemetry={()=>setTelemetryEvents([])}
      />
      <div className="rounded-3xl bg-white p-3 shadow-sm">
        <div className="mb-3 grid grid-cols-4 gap-2">{RATING_PRESETS.map(p=><button key={p.value} onClick={()=>setRatingFilter(p.value)} className={classNames("rounded-full px-2 py-2 text-[11px] font-black",ratingFilter===p.value?"bg-green-700 text-white":"bg-stone-100 text-stone-600")}>{p.label}</button>)}</div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <button onClick={()=>setActiveBoard(!activeBoard)} className={classNames("rounded-full px-4 py-2 text-sm font-black",activeBoard?"bg-stone-950 text-white":"bg-stone-100 text-stone-600")}>Active Board {activeBoard?"ON":"OFF"}</button>
          <PipelineStatus step={thinkingStep} note={pipelineNote}/>
        </div>
        <div className="mb-3 rounded-2xl bg-stone-50 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>handleTrainerViewChange("assisted")} className={classNames("rounded-full px-3 py-2 text-xs font-black",trainerView==="assisted"?"bg-green-700 text-white":"bg-white text-stone-600 ring-1 ring-stone-200")}>Assisted</button>
            <button onClick={()=>handleTrainerViewChange("plain")} className={classNames("rounded-full px-3 py-2 text-xs font-black",trainerView==="plain"?"bg-green-700 text-white":"bg-white text-stone-600 ring-1 ring-stone-200")}>Plain</button>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-stone-500">{trainerView==="assisted"?"Shows the visual pattern cue before the move.":"Hides pre-move hints for independent recall."}</p>
        </div>
        {activeBoard&&enabledViews.length>0&&<div className="mb-3 grid gap-2" style={{gridTemplateColumns:`repeat(${enabledViews.length}, minmax(0,1fr))`}}>{enabledViews.map(v=><button key={v} onClick={()=>setActiveBoardView(v)} className={classNames("rounded-full px-4 py-2 text-sm font-black capitalize",safeBoardView===v?"bg-green-700 text-white shadow-sm":"bg-white text-stone-500 ring-1 ring-stone-200")}>{v}</button>)}</div>}
        <TapChessboard game={game} orientation={repertoire.color} selectedSquare={selectedSquare} squareStyles={squareStyles} lines={activeBoard&&(visualReady||visualModelOutput)?visualLines:[]} transientLines={activeBoard&&opponentCue&&boardSettings.showOpponentCue?opponentCue.lines:[]} onSquareTap={handleSquareTap} whitePct={whitePct} evalText={evalText} settings={boardSettings} captured={captured} userColor={userColor} animationName={visualAnimationName}/>
        <HistoryControls index={historyIndex} total={positionHistory.length} onBack={()=>jumpHistory(-1)} onForward={()=>jumpHistory(1)}/>
      </div>
      {bookComplete&&<div className="rounded-3xl border border-green-200 bg-green-50 p-4 shadow-sm"><h2 className="text-lg font-black text-green-900">Book complete</h2><p className="mt-2 text-sm leading-6 text-green-800">You finished this opening branch. Train it again, or continue against the bot from this position.</p><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={resetBoard} className="rounded-2xl bg-white px-4 py-3 font-black text-green-800 shadow-sm">Train Again</button><button onClick={continueVsBot} className="rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm">Continue vs Bot</button></div></div>}
      {endingInfo&&<GameEndCard title={endingInfo.title} message={endingInfo.message} onRestart={resetBoard}/>} 
      <button onClick={handleReveal} className="w-full rounded-3xl bg-stone-950 px-4 py-4 text-center font-black text-white shadow-lg"><span className="flex items-center justify-center gap-2"><Eye size={18}/> Reveal Next Move</span></button>
      {showAnswer&&<div className="rounded-3xl bg-stone-900 p-4 text-white"><div className="text-sm text-stone-300">{isMoveQualityVerified(moveQuality)?"Verified move":"Saved line move"}</div><div className="mt-2 text-2xl font-black">{expectedUserOptions.length?expectedUserOptions.map(m=>m.san).join(" / "):engineLines[0]?.san??"Analysis pending"}</div><p className="mt-2 text-xs leading-5 text-stone-400">Source: {trainingMode==="restricted"?(isMoveQualityVerified(moveQuality)?"Blundr Brain Validated":"Saved repertoire line"):trainingMode==="continuation"&&engineLines[0]?"Manual analysis move":trainingMode==="continuation"?"Manual analysis pending":"Saved line move"}</p></div>}
      {activeBoard&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wide text-green-700">{patternCueBadgeLabel}</div><h2 className="text-lg font-black">{patternCue.title}</h2></div><button onClick={()=>setShowDetails(!showDetails)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{showDetails?"Hide":"Show more"}</button></div><p className="text-sm leading-6 text-stone-700">{patternCue.snippet}</p>{showValidatedBadge&&<p className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-[11px] font-black text-green-700">Blundr Brain Validated</p>}{opponentCue&&boardSettings.showOpponentCue&&<p className="mt-2 rounded-2xl bg-purple-50 p-3 text-sm leading-6 text-purple-800"><span className="font-black">Opponent cue: </span>{opponentCue.message}</p>}{patternCue.next&&(trainerView==="assisted"||showAnswer)&&<p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600"><span className="font-black text-stone-900">Next: </span>{patternCue.next}</p>}{visualModelError&&<p className="mt-2 rounded-2xl bg-amber-50 p-2 text-[11px] font-bold leading-5 text-amber-700">Visual cue unavailable: {visualModelError}</p>}<MoveImpact impact={moveImpact}/>{showDetails&&<div className="mt-3 space-y-2"><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Headline: {patternCue.title}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual: {activeVisualModelOutput?.animationPackage?.name??annotation.visualExplanation}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Pipeline: rule-only visual → GPT manual/debug only</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Move Quality Gate</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Version: {MOVE_QUALITY_GATE_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Required: {shouldValidateTrainingMove?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Status: {moveQualityPending?"pending":moveQuality?.status??"idle"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected UCI: {moveQuality?.expectedMovesUci?.join(", ")||expectedUserUcis.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected SAN: {expectedUserSans.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Stockfish top two: {moveQuality?.topMoves?.map((line)=>line.uci).join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Reason: {moveQuality?.reason??"No validation result."}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Checked: {moveQuality?.checkedAt?new Date(moveQuality.checkedAt).toLocaleTimeString():"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Hints hidden: {hideUnverifiedTrainingHints?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Learning events are being stored locally for future progress and Review features.</div>{annotation.reason&&<div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Fallback reason: {annotation.reason}</div>}</div>}</div>}
      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3">{feedback.toLowerCase().includes("correct")?<CheckCircle2 className="mt-0.5 text-green-700" size={24}/>:feedback.toLowerCase().includes("not quite")||feedback.toLowerCase().includes("illegal")?<XCircle className="mt-0.5 text-red-600" size={24}/>:<Target className="mt-0.5 text-green-700" size={24}/>}<div><div className="font-bold">{endingInfo?endingInfo.title:isReviewingHistory?"Review mode":isUserTurn?"Your move":"Opponent thinking"}</div><p className="text-sm leading-6 text-stone-600">{feedback}</p></div></div></div>
    </section>}
    {activeTab==="review"&&<section className="space-y-5"><header><h1 className="text-2xl font-bold tracking-tight">Review Mistakes</h1><p className="text-sm text-stone-500">Wrong opening moves are saved here.</p></header>{mistakes.length===0?<div className="rounded-3xl bg-white p-6 text-center shadow-sm"><CheckCircle2 className="mx-auto mb-3 text-green-700" size={40}/><h2 className="text-lg font-bold">No mistakes due</h2><p className="mt-2 text-sm text-stone-500">Missed training positions will appear here.</p></div>:<div className="space-y-3">{mistakes.map(m=><button key={m.fen} onClick={()=>practiceMistake(m)} className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="font-bold">{m.opening}</div><div className="mt-1 text-sm text-stone-500">Expected: <span className="font-bold text-green-700">{m.expectedMove}</span></div><div className="text-sm text-stone-500">You played: {m.playedMove}</div></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Missed {m.count}x</span></div></button>)}</div>}</section>}
    {activeTab==="progress"&&<section className="space-y-5"><header><h1 className="text-2xl font-bold tracking-tight">Progress</h1><p className="text-sm text-stone-500">Your training snapshot.</p></header><div className="grid grid-cols-3 gap-2"><MetricCard compact label="Accuracy" value={`${accuracy}%`} sub="overall" icon={<Target size={18}/>}/><MetricCard compact label="Trained" value={String(Object.keys(progress.trainedPositions).length)} sub="positions" icon={<BookOpen size={18}/>}/><MetricCard compact label="Review" value={String(mistakes.length)} sub="due" icon={<XCircle size={18}/>} warning/></div></section>}
  </div>{showAddLine&&<div className="fixed inset-0 z-[60] flex items-end bg-black/35 p-4"><div className="mx-auto w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Add Custom Line</h2><button onClick={()=>setShowAddLine(false)} className="rounded-full bg-stone-100 p-2"><X size={18}/></button></div><label className="text-sm font-bold text-stone-700">Name</label><input value={newRepName} onChange={e=>setNewRepName(e.target.value)} className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"/><label className="mt-4 block text-sm font-bold text-stone-700">Train as</label><div className="mt-1 grid grid-cols-2 rounded-2xl bg-stone-200 p-1 text-sm font-semibold"><button onClick={()=>setNewRepColor("white")} className={classNames("rounded-xl py-2",newRepColor==="white"?"bg-white text-green-700 shadow-sm":"text-stone-500")}>White</button><button onClick={()=>setNewRepColor("black")} className={classNames("rounded-xl py-2",newRepColor==="black"?"bg-white text-green-700 shadow-sm":"text-stone-500")}>Black</button></div><label className="mt-4 block text-sm font-bold text-stone-700">Line in SAN</label><textarea value={newLineText} onChange={e=>setNewLineText(e.target.value)} rows={5} className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"/><button onClick={createCustomRepertoire} className="mt-4 w-full rounded-2xl bg-green-700 px-4 py-4 font-black text-white shadow-sm">Save and Train</button></div></div>}{showSettings&&<SettingsPanel settings={boardSettings} setSettings={setBoardSettings} onClose={()=>setShowSettings(false)}/>}<BottomNav activeTab={activeTab} setActiveTab={setActiveTab}/></main>
}

function boardThemeClasses(theme:BoardTheme,isDark:boolean){
  if(theme==="slate")return isDark?"bg-slate-600":"bg-slate-200";
  if(theme==="blue")return isDark?"bg-sky-700":"bg-sky-100";
  if(theme==="walnut")return isDark?"bg-amber-800":"bg-amber-100";
  return isDark?"bg-[#779954]":"bg-[#edeed1]";
}
function coordTone(theme:BoardTheme,isDark:boolean){
  if(theme==="classic")return isDark?"text-[#edeed1]":"text-[#779954]";
  return isDark?"text-white/70":"text-stone-600/70";
}

function TapChessboard({game,orientation,selectedSquare,squareStyles,lines,transientLines,onSquareTap,whitePct,evalText,settings,captured,userColor,animationName}:{game:Chess;orientation:RepertoireColor;selectedSquare:string|null;squareStyles:Record<string,CSSProperties>;lines:ActiveLine[];transientLines:ActiveLine[];onSquareTap:(s:string)=>void;whitePct:number;evalText:string;settings:BoardSettings;captured:CapturedSummary;userColor:ChessColor;animationName?:string}){
  const ranks=orientation==="white"?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8];
  const files=orientation==="white"?FILES:[...FILES].reverse();
  const centerFor=(sq:string)=>{
    const fileIndex=FILE_TO_INDEX[sq[0]],rank=Number(sq[1]);
    const col=orientation==="white"?fileIndex:7-fileIndex;
    const row=orientation==="white"?8-rank:rank-1;
    return{x:(col+.5)*12.5,y:(row+.5)*12.5}
  };
  const topColor:ChessColor=userColor==="w"?"b":"w";
  const bottomColor=userColor;
  return <div className="mx-auto w-full max-w-[450px]">
    {settings.showCaptured?<CapturedStrip color={topColor} captured={topColor==="w"?captured.blackCaptured:captured.whiteCaptured} advantage={captured.materialAdvantage.side===topColor?captured.materialAdvantage.value:0} label="Opponent" settings={settings}/>:null}
    <div className="flex items-stretch gap-2">
      {settings.showEvalBar?<EvalBar whitePct={whitePct} evalText={evalText}/>:null}
      <div className="flex-1 rounded-[28px] bg-white p-3 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200">
        <div className={classNames("relative aspect-square w-full overflow-hidden rounded-[18px] border border-stone-300 bg-stone-200",visualAnimationClass(animationName))}>
          <BoardLines lines={lines} centerFor={centerFor} transient={false} showLabels={settings.showLabels}/>
          <BoardLines lines={transientLines} centerFor={centerFor} transient showLabels={settings.showLabels}/>
          <div className="grid h-full w-full grid-cols-8 grid-rows-8">
            {ranks.flatMap((rank,rowIndex)=>files.map((file,colIndex)=>{
              const square=`${file}${rank}`;
              const piece=getPiece(game,square);
              const isDark=(FILES.indexOf(file)+rank)%2===1;
              const showRank=colIndex===0;
              const showFile=rowIndex===7;
              return <button key={square} type="button" onClick={()=>onSquareTap(square)} className={classNames("relative flex h-full w-full select-none items-center justify-center overflow-hidden",boardThemeClasses(settings.boardTheme,isDark),selectedSquare===square?"ring-4 ring-inset ring-green-800":"")} style={squareStyles[square]??{}}>
                {showRank?<span className={classNames("pointer-events-none absolute left-1 top-0.5 text-[10px] font-black",coordTone(settings.boardTheme,isDark))}>{rank}</span>:null}
                {showFile?<span className={classNames("pointer-events-none absolute bottom-0.5 right-1 text-[10px] font-black",coordTone(settings.boardTheme,isDark))}>{file}</span>:null}
                <span className={classNames("pointer-events-none flex h-full w-full items-center justify-center leading-none antialiased",settings.pieceStyle==="letters"?"font-black font-sans":"font-serif",piece?.color==="w"?"text-stone-50 [text-shadow:0_2px_3px_rgba(0,0,0,.55)]":"text-stone-950 [text-shadow:0_1px_1px_rgba(255,255,255,.25)]")} style={{fontSize:settings.pieceStyle==="letters"?"min(9vw,42px)":"min(11.6vw,58px)",transform:"translateY(-1px)"}}>{piece?pieceGlyph(piece.color as ChessColor,piece.type,settings.pieceStyle):""}</span>
              </button>
            }))}
          </div>
        </div>
      </div>
    </div>
    {settings.showCaptured?<CapturedStrip color={bottomColor} captured={bottomColor==="w"?captured.blackCaptured:captured.whiteCaptured} advantage={captured.materialAdvantage.side===bottomColor?captured.materialAdvantage.value:0} label="You" settings={settings}/>:null}
  </div>
}

function CapturedStrip({color,captured,advantage,label,settings}:{color:ChessColor;captured:string[];advantage:number;label:string;settings:BoardSettings}){
  return <div className="my-2 flex min-h-8 items-center justify-between rounded-2xl bg-white/90 px-3 py-2 text-xs font-black text-stone-600 shadow-sm ring-1 ring-stone-200">
    <div className="flex min-w-0 items-center gap-2"><span className="shrink-0 text-stone-400">{label}</span><span className="truncate text-base leading-none">{captured.length?captured.map((t,i)=><span key={`${t}-${i}`}>{pieceGlyph(color,t,settings.pieceStyle)}</span>):<span className="text-xs text-stone-300">no captures</span>}</span></div>
    {advantage>0?<span className="rounded-full bg-green-50 px-2 py-1 text-green-700">+{advantage} material</span>:<span className="rounded-full bg-stone-100 px-2 py-1 text-stone-400">even</span>}
  </div>
}

function EvalBar({whitePct,evalText}:{whitePct:number;evalText:string}){
  const blackPct=100-whitePct;
  return <div className="relative flex w-10 shrink-0 flex-col overflow-hidden rounded-2xl bg-stone-950 shadow-sm ring-1 ring-stone-200">
    <div className="flex items-center justify-center bg-stone-950 text-[10px] font-black text-white transition-all duration-500" style={{height:`${blackPct}%`,minHeight:"8%"}}>{blackPct>34?<span className="rotate-90 tracking-tight">Black</span>:null}</div>
    <div className="flex items-center justify-center bg-stone-50 text-[10px] font-black text-stone-950 transition-all duration-500" style={{height:`${whitePct}%`,minHeight:"8%"}}>{whitePct>34?<span className="-rotate-90 tracking-tight">White</span>:null}</div>
    <div className="pointer-events-none absolute inset-x-0 top-2 mx-auto max-w-9 rounded-full bg-amber-50/95 px-1 text-center text-[8px] font-black leading-3 text-amber-700 shadow-sm">{evalText}</div>
  </div>
}

function temporalGateColor(line:ActiveLine,transient:boolean){if(transient||line.kind==="opponent")return{primary:"#b884ff",secondary:"#d2b0ff",danger:"#f0e5ff",soft:"rgba(184,132,255,.14)"};if(line.kind==="defense")return{primary:"#21b8a6",secondary:"#84e8dd",danger:"#d8faf4",soft:"rgba(33,184,166,.14)"};if(line.kind==="attack")return{primary:"#ff7a59",secondary:"#ffc26a",danger:"#ffe3b0",soft:"rgba(255,122,89,.14)"};return{primary:"#5e7eff",secondary:"#9cb7ff",danger:"#dce6ff",soft:"rgba(94,126,255,.14)"}}
function BoardLines({lines,centerFor,transient,showLabels}:{lines:ActiveLine[];centerFor:(s:string)=>{x:number;y:number};transient:boolean;showLabels:boolean}){const visible=lines.filter(l=>isValidSquare(l.from)&&isValidSquare(l.to)).slice(0,transient?1:2);if(!visible.length)return null;return <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><defs>{visible.map((l,i)=>{const c=temporalGateColor(l,transient);return <linearGradient key={i} id={`tg-${transient?"t":"p"}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c.primary} stopOpacity=".22"/><stop offset="54%" stopColor={c.secondary} stopOpacity=".92"/><stop offset="100%" stopColor={c.primary} stopOpacity=".76"/></linearGradient>})}</defs>{visible.map((l,i)=>{const f=centerFor(l.from),t=centerFor(l.to),c=temporalGateColor(l,transient);const knight=isKnightGeometry(l.from,l.to);const corner={x:t.x,y:f.y};const d=knight?`M ${f.x} ${f.y} L ${corner.x} ${corner.y} L ${t.x} ${t.y}`:`M ${f.x} ${f.y} Q ${(f.x+t.x)/2} ${(f.y+t.y)/2-3.2} ${t.x} ${t.y}`;const points=`${f.x},${f.y} ${corner.x},${corner.y} ${t.x},${t.y}`;const dash=transient?"2.4 1.8":undefined;return <g key={`${l.from}-${l.to}-${i}`} className={transient?"blundr-opponent-line":"blundr-intent-line"}><circle cx={f.x} cy={f.y} r="4.0" fill={c.soft} opacity=".95"/><circle cx={f.x} cy={f.y} r="3.15" fill="none" stroke={c.primary} strokeWidth=".72" opacity=".9"/><circle cx={t.x} cy={t.y} r="6.1" fill={c.soft} opacity=".95"/><circle cx={t.x} cy={t.y} r="4.7" fill="none" stroke={c.primary} strokeWidth=".82" opacity=".96"/><circle cx={t.x} cy={t.y} r="2.15" fill={c.primary} opacity=".22"/>{knight?<><polyline points={points} fill="none" stroke={c.soft} strokeWidth={transient?"2.4":"2.15"} strokeLinecap="round" strokeLinejoin="round" opacity=".9"/><polyline points={points} fill="none" stroke={`url(#tg-${transient?"t":"p"}-${i})`} strokeWidth={transient?"1.2":"1.02"} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash}/></>:<><path d={d} fill="none" stroke={c.soft} strokeWidth={transient?"2.3":"2.0"} strokeLinecap="round" opacity=".9"/><path d={d} fill="none" stroke={`url(#tg-${transient?"t":"p"}-${i})`} strokeWidth={transient?"1.12":".98"} strokeLinecap="round" strokeDasharray={dash}/></>}{showLabels&&l.label&&<text x={Math.min(94,Math.max(6,t.x+3.1))} y={Math.max(7,t.y-3.1)} fontSize="3.15" fontWeight="800" fill={c.primary} stroke="white" strokeWidth=".55" paintOrder="stroke">{l.label}</text>}</g>})}</svg>}

function HistoryControls({index,total,onBack,onForward}:{index:number;total:number;onBack:()=>void;onForward:()=>void}){return <div className="mt-3 flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2 text-xs font-black text-stone-500"><button disabled={index<=0} onClick={onBack} className="rounded-full bg-white px-3 py-2 text-stone-700 shadow-sm disabled:opacity-30">← Back</button><span>{total<=1?"Start position":`Move review ${index}/${total-1}`}</span><button disabled={index>=total-1} onClick={onForward} className="rounded-full bg-white px-3 py-2 text-stone-700 shadow-sm disabled:opacity-30">Forward →</button></div>}
function GameEndCard({title,message,onRestart}:{title:string;message:string;onRestart:()=>void}){return <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center shadow-sm"><div className="text-xs font-black uppercase tracking-wide text-amber-700">Game concluded</div><h2 className="mt-1 text-2xl font-black text-amber-950">{title}</h2><p className="mt-2 text-sm leading-6 text-amber-800">{message}</p><button onClick={onRestart} className="mt-4 w-full rounded-2xl bg-amber-600 px-4 py-3 font-black text-white shadow-sm">Restart</button></div>}

function SettingsPanel({settings,setSettings,onClose}:{settings:BoardSettings;setSettings:(s:BoardSettings)=>void;onClose:()=>void}){
  const update=<K extends keyof BoardSettings>(key:K,value:BoardSettings[K])=>setSettings({...settings,[key]:value});
  const toggle=(key:keyof Pick<BoardSettings,"showAttack"|"showDefense"|"showPlan"|"showMoveDots"|"showEvalBar"|"showCaptured"|"showLabels"|"showOpponentCue">)=>setSettings({...settings,[key]:!settings[key]});
  const OptionButton=({active,label,onClick}:{active:boolean;label:string;onClick:()=>void})=><button onClick={onClick} className={classNames("rounded-2xl px-3 py-2 text-xs font-black",active?"bg-green-700 text-white":"bg-stone-100 text-stone-600")}>{label}</button>;
  const Toggle=({id,label}:{id:keyof Pick<BoardSettings,"showAttack"|"showDefense"|"showPlan"|"showMoveDots"|"showEvalBar"|"showCaptured"|"showLabels"|"showOpponentCue">;label:string})=><button onClick={()=>toggle(id)} className={classNames("flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-black",settings[id]?"bg-green-50 text-green-800":"bg-stone-100 text-stone-500")}><span>{label}</span><span>{settings[id]?"ON":"OFF"}</span></button>;
  return <div className="fixed inset-0 z-[70] flex items-end bg-black/35 p-4"><div className="mx-auto max-h-[86vh] w-full max-w-md overflow-auto rounded-3xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black">Board Settings</h2><p className="text-xs font-semibold text-stone-500">Customize board, pieces, and active displays.</p></div><button onClick={onClose} className="rounded-full bg-stone-100 p-2"><X size={18}/></button></div><div className="space-y-5"><div><div className="mb-2 text-sm font-black">Board</div><div className="grid grid-cols-4 gap-2"><OptionButton active={settings.boardTheme==="classic"} label="Classic" onClick={()=>update("boardTheme","classic")}/><OptionButton active={settings.boardTheme==="slate"} label="Slate" onClick={()=>update("boardTheme","slate")}/><OptionButton active={settings.boardTheme==="blue"} label="Blue" onClick={()=>update("boardTheme","blue")}/><OptionButton active={settings.boardTheme==="walnut"} label="Walnut" onClick={()=>update("boardTheme","walnut")}/></div></div><div><div className="mb-2 text-sm font-black">Pieces</div><div className="grid grid-cols-3 gap-2"><OptionButton active={settings.pieceStyle==="unicode"} label="Classic" onClick={()=>update("pieceStyle","unicode")}/><OptionButton active={settings.pieceStyle==="neo"} label="Neo" onClick={()=>update("pieceStyle","neo")}/><OptionButton active={settings.pieceStyle==="letters"} label="Letters" onClick={()=>update("pieceStyle","letters")}/></div></div><div><div className="mb-2 text-sm font-black">Active displays</div><div className="grid grid-cols-2 gap-2"><Toggle id="showAttack" label="Attack view"/><Toggle id="showDefense" label="Defense view"/><Toggle id="showPlan" label="Plan view"/><Toggle id="showMoveDots" label="Legal move dots"/><Toggle id="showEvalBar" label="Advantage bar"/><Toggle id="showCaptured" label="Captured pieces"/><Toggle id="showLabels" label="Move labels"/><Toggle id="showOpponentCue" label="Opponent cue"/></div></div><button onClick={onClose} className="w-full rounded-2xl bg-stone-950 px-4 py-4 font-black text-white">Done</button></div></div></div>
}

function PipelineStatus({step,note}:{step:ThinkingStep;note:string}){const labels:Record<ThinkingStep,string>={idle:"Ready",facts:"Analyzing",engine:"Engine",brain:"Blundr Brain","gpt-receive":"Receiving","visual-update":"Updating",ready:"Ready",error:"Error"};const tone=step==="error"?"bg-red-50 text-red-700 ring-red-100":step==="ready"||step==="idle"?"bg-green-50 text-green-700 ring-green-100":"bg-blue-50 text-blue-700 ring-blue-100";return <div className={classNames("max-w-[190px] rounded-2xl px-3 py-2 text-right text-[11px] font-black leading-4 ring-1",tone)} title={note}><div>{labels[step]}</div><div className="truncate text-[10px] font-semibold opacity-75">{note}</div></div>}
function MoveImpact({impact}:{impact:{label:string;pct:number;tone:string;note:string}}){return <div className="mt-3 rounded-2xl bg-stone-50 p-3"><div className="mb-2 flex items-center justify-between text-xs font-black"><span>Move Impact</span><span className="text-green-700">{impact.label}</span></div><div className="h-2 rounded-full bg-stone-200"><div className={classNames("h-2 rounded-full",impact.tone)} style={{width:`${impact.pct}%`}}/></div><p className="mt-2 text-xs leading-5 text-stone-500">{impact.note}</p></div>}
function GptDebugPanel({open,setOpen,text}:{open:boolean;setOpen:(v:boolean)=>void;text:string}){
  return <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-black text-stone-950">GPT Debug Cell</div>
        <div className="text-xs font-semibold text-stone-500">Live prompt/input/output from /api/brain</div>
      </div>
      <button onClick={()=>setOpen(!open)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{open?"Hide":"Show"}</button>
    </div>
    {open?<pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-stone-950 p-3 text-[10px] leading-4 text-green-200 whitespace-pre-wrap">{text}</pre>:null}
  </div>
}

function VisualDebugPanel({open,setOpen,visualText,telemetryText,telemetryEnabled,setTelemetryEnabled,telemetryCount,onClearTelemetry}:{open:boolean;setOpen:(v:boolean)=>void;visualText:string;telemetryText:string;telemetryEnabled:boolean;setTelemetryEnabled:(v:boolean)=>void;telemetryCount:number;onClearTelemetry:()=>void}){
  return <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-black text-stone-950">Visual Debug Panel</div>
        <div className="text-xs font-semibold text-stone-500">Rule visual payload/response plus local-only telemetry events.</div>
      </div>
      <button onClick={()=>setOpen(!open)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{open?"Hide":"Show"}</button>
    </div>
    {open?<div className="mt-3 space-y-3">
      <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600">
        <span>Telemetry: {telemetryEnabled?"enabled":"disabled"} • {telemetryCount} event{telemetryCount===1?"":"s"}</span>
        <div className="flex items-center gap-2">
          <button onClick={()=>setTelemetryEnabled(!telemetryEnabled)} className={classNames("rounded-full px-3 py-1 font-black",telemetryEnabled?"bg-green-700 text-white":"bg-stone-200 text-stone-700")}>{telemetryEnabled?"Disable":"Enable"}</button>
          <button onClick={onClearTelemetry} className="rounded-full bg-stone-200 px-3 py-1 font-black text-stone-700">Clear</button>
        </div>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-stone-500">Visual Snapshot</div>
        <pre className="max-h-52 overflow-auto rounded-2xl bg-stone-950 p-3 text-[10px] leading-4 text-green-200 whitespace-pre-wrap">{visualText}</pre>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-stone-500">Local Telemetry Events</div>
        <pre className="max-h-52 overflow-auto rounded-2xl bg-stone-950 p-3 text-[10px] leading-4 text-green-200 whitespace-pre-wrap">{telemetryText}</pre>
      </div>
    </div>:null}
  </div>
}

function LiveBrain({brain}:{brain:LiveBrain}){return <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-black"><Zap size={16} className="text-green-700"/> Live Brain</div><span className="text-xs font-black text-stone-400">{brain.ratingLabel} • {brain.ratingPool}</span></div><div className="grid grid-cols-4 gap-1.5"><Status label="Book" state={brain.book}/><Status label="Lichess" state={brain.lichess}/><Status label="Engine" state={brain.engine}/><Status label="Brain" state={brain.gpt}/></div><div className="mt-2 rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold leading-5 text-stone-500">Source: <span className="font-black text-stone-800">{brain.source}</span>{brain.latency?` • ${brain.latency} ms`:""}{brain.note?` • ${brain.note}`:""}</div></div>}
function Status({label,state}:{label:string;state:SystemState}){const tone=state==="active"||state==="ready"||state==="cached"?"bg-green-50 text-green-700":state==="loading"?"bg-blue-50 text-blue-700":state==="fallback"||state==="complete"?"bg-amber-50 text-amber-700":state==="error"?"bg-red-50 text-red-700":"bg-stone-100 text-stone-500";return <div className={classNames("rounded-full px-2 py-1 text-center text-[10px] font-black",tone)}>{label}: {state}</div>}
function MetricCard({label,value,sub,icon,warning=false,compact=false}:{label:string;value:string;sub:string;icon:ReactNode;warning?:boolean;compact?:boolean}){return <div className={classNames("rounded-3xl bg-white shadow-sm",compact?"p-3":"p-4")}><div className={classNames("mb-2",warning?"text-orange-600":"text-green-700")}>{icon}</div><div className="text-xs text-stone-500">{label}</div><div className={classNames("font-black tracking-tight",compact?"text-xl":"text-3xl")}>{value}</div><div className="text-xs text-stone-400">{sub}</div></div>}
function BottomNav({activeTab,setActiveTab}:{activeTab:string;setActiveTab:(tab:Tab)=>void}){const tabs=[{id:"home",label:"Home",icon:Home},{id:"train",label:"Train",icon:Target},{id:"review",label:"Review",icon:CheckCircle2},{id:"progress",label:"Progress",icon:BarChart3},{id:"repertoire",label:"Repertoire",icon:BookOpen}] as const;return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-2 pb-4 pt-2 backdrop-blur"><div className="mx-auto grid max-w-md grid-cols-5 gap-1">{tabs.map(tab=>{const Icon=tab.icon;const active=activeTab===tab.id;return <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={classNames("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold",active?"bg-green-50 text-green-700":"text-stone-500")}><Icon size={19}/>{tab.label}</button>})}</div></nav>}
