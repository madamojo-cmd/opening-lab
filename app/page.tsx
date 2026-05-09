"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Chess } from "chess.js";
import { BarChart3, Beaker, BookOpen, CheckCircle2, ChevronRight, Cloud, Eye, Flame, Home, Plus, RotateCcw, Search, Settings, Target, Trophy, X, XCircle, Zap } from "lucide-react";

type Tab = "home" | "train" | "review" | "progress" | "repertoire";
type RepertoireColor = "white" | "black";
type ChessColor = "w" | "b";
type ActiveBoardView = "attack" | "defense" | "plan";
type TrainingMode = "restricted" | "continuation";
type SystemState = "off" | "ready" | "loading" | "active" | "cached" | "fallback" | "error" | "complete";
type ThinkingStep = "idle" | "facts" | "engine" | "brain" | "gpt-receive" | "visual-update" | "ready" | "error";
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
type OpponentCue = { expiresAt: number; title: string; message: string; lines: ActiveLine[]; cues: SquareCue[] };
type LiveBrain = { ratingLabel: string; ratingPool: string; book: SystemState; lichess: SystemState; engine: SystemState; gpt: SystemState; source: string; latency?: number; note?: string };

const DEFAULT_PROGRESS: Progress = { attempts: 0, correct: 0, incorrect: 0, streak: 0, trainedPositions: {}, mistakes: {} };
const PIECE_SYMBOLS: Record<string, string> = { wp:"♙", wn:"♘", wb:"♗", wr:"♖", wq:"♕", wk:"♔", bp:"♟", bn:"♞", bb:"♝", br:"♜", bq:"♛", bk:"♚" };
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
function getPiece(game:Chess,square:string){return game.get(square as any)}
function isOwnPiece(game:Chess,square:string,color:ChessColor){const p=getPiece(game,square);return Boolean(p&&p.color===color)}
function pickWeighted<T extends {weight:number}>(items:T[]){const total=items.reduce((s,i)=>s+Math.max(0,i.weight),0);if(total<=0)return items[0];let roll=Math.random()*total;for(const item of items){roll-=Math.max(0,item.weight);if(roll<=0)return item}return items[0]}
function ratingPreset(value:string){return RATING_PRESETS.find(p=>p.value===value)??RATING_PRESETS[3]}
function buildTree(rep:Repertoire){const tree:Record<string,Continuation[]>={};for(const line of rep.lines){const game=new Chess();for(const san of line){const key=normalizeFen(game.fen());try{const move=game.move(san);if(!move)break;const cont={san:move.san,uci:moveToUci(move),color:move.color as ChessColor,resultingFen:game.fen()};const ex=tree[key]??[];tree[key]=ex.some(x=>x.uci===cont.uci)?ex:[...ex,cont]}catch{break}}}return tree}
function countPositions(rep:Repertoire){return Object.keys(buildTree(rep)).length}
function getAccuracy(progress:Progress){return progress.attempts?Math.round((progress.correct/progress.attempts)*100):0}
function parseExplorerMoves(payload:any):ExplorerMove[]{const moves=Array.isArray(payload?.moves)?payload.moves:[];const denom=moves.reduce((s:number,m:any)=>s+(m.white??0)+(m.draws??0)+(m.black??0),0)||1;return moves.map((m:any)=>{const total=(m.white??0)+(m.draws??0)+(m.black??0);return{uci:m.uci,san:m.san,total,pct:Math.round((total/denom)*100),averageRating:m.averageRating}}).filter((m:ExplorerMove)=>m.uci&&m.total>0)}
function applyUci(fen:string,uci:string){try{const game=new Chess(fen);const move=game.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci.length>4?uci.slice(4,5):"q"});if(!move)return null;return{san:move.san,uci:moveToUci(move),fen:game.fen(),color:move.color as ChessColor}}catch{return null}}
function blankAnnotation():BrainAnnotation{return{source:"initial",fallback:true,selectedView:"plan",headline:"Ready",mainExplanation:"Make a move or tap Reveal Next Move.",visualExplanation:"The board updates after /api/brain returns a validated annotation.",planExplanation:"Restricted mode keeps you inside the selected opening.",nextPlan:"Play the highlighted training move when available.",keySquares:[],planArrows:[],attack:{title:"Your attack",message:"Waiting for Brain analysis.",lines:[],cues:[]},defense:{title:"Your defense",message:"Waiting for Brain analysis.",lines:[],cues:[]},plan:{title:"Plan",message:"Waiting for Brain analysis.",lines:[],cues:[]},confidence:"initial"}}
function impactFromEngine(line?:EngineLine){
  const cp=line?.cp;
  if(typeof cp!=="number")return{label:"Training",pct:64,tone:"bg-green-700",note:"Move impact will use Brain endpoint engine output when available."};
  if(cp>180)return{label:"Strong",pct:92,tone:"bg-green-700",note:"Stockfish likes this continuation."};
  if(cp>80)return{label:"Stable",pct:74,tone:"bg-green-600",note:"Healthy continuation."};
  if(cp>20)return{label:"Playable",pct:58,tone:"bg-yellow-500",note:"Playable but keep improving the plan."};
  return{label:"Needs care",pct:36,tone:"bg-orange-600",note:"Look for a more forcing or developing move."};
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

function evalLabel(cpWhite:number|undefined){
  if(typeof cpWhite!=="number")return "0.0";
  if(Math.abs(cpWhite)>90000)return cpWhite>0?"M":"-M";
  const pawns=(cpWhite/100).toFixed(1);
  return cpWhite>0?`+${pawns}`:pawns;
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

async function runBrowserStockfish(fen:string,skill:number,movetime=750):Promise<{source:string;pvs:EngineLine[];depth?:number;timeMs:number}|null>{
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
      send("setoption name MultiPV value 3");
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
  const [activeTab,setActiveTab]=useState<Tab>("home");const [customRepertoires,setCustomRepertoires]=useState<Repertoire[]>([]);const [selectedRepertoireId,setSelectedRepertoireId]=useState(OPENINGS[0].id);const [fen,setFen]=useState(new Chess().fen());const [selectedSquare,setSelectedSquare]=useState<string|null>(null);const [feedback,setFeedback]=useState("Choose an opening and begin training.");const [lastMove,setLastMove]=useState<string|null>(null);const [lastMoveSan,setLastMoveSan]=useState("");const [progress,setProgress]=useState<Progress>(DEFAULT_PROGRESS);const [showAnswer,setShowAnswer]=useState(false);const [reviewingFen,setReviewingFen]=useState<string|null>(null);const [activeBoard,setActiveBoard]=useState(true);const [activeBoardView,setActiveBoardView]=useState<ActiveBoardView>("plan");const [showGptDebug,setShowGptDebug]=useState(true);const [showDetails,setShowDetails]=useState(false);const [ratingFilter,setRatingFilter]=useState("1200,1400,1600");const [speedFilter]=useState("blitz,rapid");const [trainingMode,setTrainingMode]=useState<TrainingMode>("restricted");const [bookComplete,setBookComplete]=useState(false);const [opponentCue,setOpponentCue]=useState<OpponentCue|null>(null);const [explorerMoves,setExplorerMoves]=useState<ExplorerMove[]>([]);const [brainResponse,setBrainResponse]=useState<BrainResponse|null>(null);const [annotation,setAnnotation]=useState<BrainAnnotation>(blankAnnotation());const [thinkingStep,setThinkingStep]=useState<ThinkingStep>("idle");const [pipelineNote,setPipelineNote]=useState("Ready");const [visualReady,setVisualReady]=useState(false);const [brain,setBrain]=useState<LiveBrain>({ratingLabel:"Club",ratingPool:"1200–1600",book:"ready",lichess:"ready",engine:"ready",gpt:"ready",source:"none"});const [showAddLine,setShowAddLine]=useState(false);const [newRepName,setNewRepName]=useState("My Custom Repertoire");const [newRepColor,setNewRepColor]=useState<RepertoireColor>("white");const [newLineText,setNewLineText]=useState("e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O");
  const explorerCache=useRef<Record<string,any>>({});
  const repertoires=useMemo(()=>[...OPENINGS,...customRepertoires],[customRepertoires]);const repertoire=repertoires.find(r=>r.id===selectedRepertoireId)??repertoires[0];const tree=useMemo(()=>buildTree(repertoire),[repertoire]);const game=useMemo(()=>new Chess(fen),[fen]);const userColor:ChessColor=repertoire.color==="white"?"w":"b";const opponentColor:ChessColor=userColor==="w"?"b":"w";const isUserTurn=game.turn()===userColor;const key=normalizeFen(fen);const options=tree[key]??[];const expectedUserOptions=options.filter(m=>m.color===userColor);const opponentBookOptions=options.filter(m=>m.color===opponentColor);const rating=ratingPreset(ratingFilter);const currentView=annotation[activeBoardView]??annotation.plan;const engineLines=brainResponse?.engine?.pvs??[];const moveImpact=impactFromEngine(engineLines[0]);const accuracy=getAccuracy(progress);const mistakes=Object.values(progress.mistakes).sort((a,b)=>b.count-a.count);const cpWhite=evalForWhite(engineLines[0]?.cp,game.turn() as ChessColor);const whitePct=whiteEvalPercent(cpWhite);const evalText=evalLabel(cpWhite);
  useEffect(()=>{const saved=localStorage.getItem("blundr-v22-progress");const savedCustom=localStorage.getItem("blundr-v22-custom");if(saved)try{setProgress(JSON.parse(saved))}catch{}if(savedCustom)try{setCustomRepertoires(JSON.parse(savedCustom))}catch{}},[]);
  useEffect(()=>localStorage.setItem("blundr-v22-progress",JSON.stringify(progress)),[progress]);useEffect(()=>localStorage.setItem("blundr-v22-custom",JSON.stringify(customRepertoires)),[customRepertoires]);
  useEffect(()=>{const t=window.setInterval(()=>{if(opponentCue&&Date.now()>opponentCue.expiresAt)setOpponentCue(null)},250);return()=>window.clearInterval(t)},[opponentCue]);
  useEffect(()=>setBrain(p=>({...p,ratingLabel:rating.label,ratingPool:rating.target})),[rating.label,rating.target]);
  useEffect(()=>{if(activeTab==="train")void runBrain("position_update")},[fen,activeTab,selectedRepertoireId,trainingMode,ratingFilter]);
  useEffect(()=>{if(activeTab!=="train"||bookComplete)return;if(game.isGameOver()){setFeedback("Game over. Restart the opening to train again.");return}if(!isUserTurn){const timer=window.setTimeout(()=>void playOpponentMove(),900);return()=>window.clearTimeout(timer)}},[activeTab,fen,bookComplete,isUserTurn,selectedRepertoireId,trainingMode,ratingFilter]);
  async function loadExplorer(positionFen:string){const cacheKey=`${normalizeFen(positionFen)}|${ratingFilter}|${speedFilter}`;if(explorerCache.current[cacheKey]){const parsed=parseExplorerMoves(explorerCache.current[cacheKey]);setExplorerMoves(parsed);setBrain(p=>({...p,lichess:"cached"}));return parsed}setBrain(p=>({...p,lichess:"loading"}));const start=performance.now();try{const params=new URLSearchParams({fen:positionFen,source:"lichess",moves:"25",ratings:ratingFilter,speeds:speedFilter});const res=await fetch(`/api/explorer?${params.toString()}`);const payload=await res.json();explorerCache.current[cacheKey]=payload;const parsed=parseExplorerMoves(payload);setExplorerMoves(parsed);setBrain(p=>({...p,lichess:payload.fallback?"fallback":"active",latency:Math.round(performance.now()-start),note:payload.reason??`${parsed.length} Lichess moves`}));return parsed}catch(e){setBrain(p=>({...p,lichess:"error",note:e instanceof Error?e.message:"Explorer failed"}));return[]}}
  async function runBrain(eventType:string,extra:Record<string,any>={}){if(activeTab!=="train")return null;setVisualReady(false);setThinkingStep("facts");setPipelineNote("Analyzing chess.js facts and restricted opening context");setThinkingStep("engine");setPipelineNote("Preparing browser Stockfish analysis");setBrain(p=>({...p,engine:"loading",gpt:"loading",source:"Browser Stockfish"}));setPipelineNote("Running lightweight browser Stockfish before GPT");
    const browserEngine=extra.skipClientEngine?null:await runBrowserStockfish(fen,rating.skill,eventType==="reveal"?1000:700);
    const clientEngine=browserEngine?{source:browserEngine.source,pvs:browserEngine.pvs,depth:browserEngine.depth,timeMs:browserEngine.timeMs}:undefined;
    setBrain(p=>({...p,engine:browserEngine?"active":"fallback",source:browserEngine?"Browser Stockfish":"Engine fallback",note:browserEngine?`depth ${browserEngine.depth??"?"} • ${browserEngine.timeMs} ms`:"Browser Stockfish unavailable"}));
    const payload={fen,openingId:repertoire.id,openingName:repertoire.name,userColor,trainingMode,eventType,selectedView:activeBoardView,moveHistory:game.history(),lastMoveSan,lastMoveUci:lastMove,expectedMoves:expectedUserOptions.map(m=>({san:m.san,uci:m.uci})),opponentBookMoves:opponentBookOptions.map(m=>({san:m.san,uci:m.uci})),ratingPool:rating.target,ratingLabel:rating.label,skill:rating.skill,lichessMoves:explorerMoves.slice(0,8),clientEngine,...extra};setThinkingStep("brain");setPipelineNote("Sending Stockfish lines + board facts to GPT through /api/brain");const start=performance.now();try{const res=await fetch("/api/brain",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await res.json() as BrainResponse;setThinkingStep("gpt-receive");setPipelineNote(data.annotation?.fallback?"Received fallback annotation":"Received GPT annotation");setBrainResponse(data);setAnnotation(data.annotation);setThinkingStep("visual-update");setTimeout(()=>setVisualReady(true),350);setPipelineNote("Updating board from validated Brain annotation");window.setTimeout(()=>{setThinkingStep("ready");setPipelineNote(data.annotation?.fallback?"Ready with fallback annotation":"Ready with GPT visual annotation")},250);setBrain(p=>({...p,engine:data.engine?.fallback?"fallback":"active",gpt:data.annotation?.fallback?"fallback":"active",latency:Math.round(performance.now()-start),source:data.annotation?.fallback?"Brain fallback":"GPT visual Brain",note:data.pipeline?.gpt||data.annotation?.reason||""}));return data}catch(e){setVisualReady(true);setThinkingStep("error");setPipelineNote(e instanceof Error?e.message:"Brain endpoint failed");setBrain(p=>({...p,engine:"error",gpt:"error",source:"Brain error",note:e instanceof Error?e.message:"Brain failed"}));return null}}
  function selectRepertoire(id:string){setSelectedRepertoireId(id);setFen(new Chess().fen());setSelectedSquare(null);setFeedback("Opening loaded. Play the restricted training move.");setLastMove(null);setLastMoveSan("");setShowAnswer(false);setTrainingMode("restricted");setBookComplete(false);setOpponentCue(null);setAnnotation(blankAnnotation());setActiveBoardView("plan");setActiveTab("train")}
  function resetBoard(){setFen(new Chess().fen());setSelectedSquare(null);setFeedback("Restarted. Find the first training move.");setLastMove(null);setLastMoveSan("");setShowAnswer(false);setTrainingMode("restricted");setBookComplete(false);setOpponentCue(null);setAnnotation(blankAnnotation());setActiveTab("train")}
  async function playOpponentMove(){const current=new Chess(fen);setBrain(p=>({...p,source:"opponent thinking",book:opponentBookOptions.length?"active":"complete",lichess:"loading"}));await new Promise(r=>setTimeout(r,700));let chosen:{san:string;uci:string;fen:string}|null=null;let source="";if(trainingMode==="restricted"){if(!opponentBookOptions.length){setBookComplete(true);setFeedback("Book complete. Train this branch again or continue vs bot.");setBrain(p=>({...p,book:"complete",source:"book complete",lichess:"ready"}));return}const explorer=await loadExplorer(current.fen());const valid=opponentBookOptions.map(book=>{const match=explorer.find(m=>m.uci===book.uci);return{...book,weight:match?.total??1,pct:match?.pct??0}});const weighted=pickWeighted(valid);chosen={san:weighted.san,uci:weighted.uci,fen:weighted.resultingFen};source=weighted.pct?`Lichess-weighted opening branch (${weighted.pct}%)`:"Saved opening branch"}else{const explorer=await loadExplorer(current.fen());const playable=explorer.map(m=>{const a=applyUci(current.fen(),m.uci);return a?{...a,weight:m.total,pct:m.pct}:null}).filter(Boolean) as Array<{san:string;uci:string;fen:string;weight:number;pct:number}>;if(playable.length){const pick=pickWeighted(playable);chosen=pick;source=`Lichess continuation (${pick.pct}%)`}else{const data=await runBrain("bot_select",{skipGpt:true});const top=data?.engine?.pvs?.[0];const a=top?applyUci(current.fen(),top.uci):null;if(a){chosen=a;source=`Engine continuation (${rating.target})`}}}if(!chosen){const legal=current.moves({verbose:true}) as any[];if(!legal.length)return;const move=legal[0];current.move({from:move.from,to:move.to,promotion:move.promotion??"q"});chosen={san:move.san,uci:moveToUci(move),fen:current.fen()};source="Emergency legal fallback"}setFen(chosen.fen);setLastMove(chosen.uci);setLastMoveSan(chosen.san);setSelectedSquare(null);setShowAnswer(false);setOpponentCue({expiresAt:Date.now()+2500,title:`Opponent: ${chosen.san}`,message:"Brief opponent cue. Your selected user-side view stays visible after this fades.",lines:[{from:chosen.uci.slice(0,2),to:chosen.uci.slice(2,4),kind:"opponent",label:chosen.san}],cues:[{square:chosen.uci.slice(2,4),kind:"opponent"}]});setFeedback(`Opponent played ${chosen.san}. Source: ${source}.`);setBrain(p=>({...p,source,lichess:source.includes("Lichess")?"active":p.lichess}))}
  function continueVsBot(){setTrainingMode("continuation");setBookComplete(false);setFeedback(`Continuation mode active. Legal moves are accepted and evaluated at ${rating.target}.`);setBrain(p=>({...p,source:"continuation mode",book:"complete"}));if(!isUserTurn)setTimeout(()=>void playOpponentMove(),350)}
  function handleSquareTap(square:string){if(bookComplete)return;if(!isUserTurn){setFeedback("Opponent is thinking. Wait for your turn.");return}if(!selectedSquare){if(isOwnPiece(game,square,userColor)){setSelectedSquare(square);setFeedback(`Selected ${square}. Tap the destination square.`)}else setFeedback("Tap one of your pieces first.");return}if(square===selectedSquare){setSelectedSquare(null);setFeedback("Selection cleared.");return}if(isOwnPiece(game,square,userColor)){setSelectedSquare(square);setFeedback(`Selected ${square}. Tap the destination square.`);return}void attemptMove(selectedSquare,square)}
  function logMistake(positionFen:string,expected:string,played:string){const k=normalizeFen(positionFen);setProgress(prev=>{const old=prev.mistakes[k];return{...prev,attempts:prev.attempts+1,incorrect:prev.incorrect+1,streak:0,mistakes:{...prev.mistakes,[k]:{fen:positionFen,expectedMove:expected,playedMove:played,count:old?old.count+1:1,opening:repertoire.name,repertoireId:repertoire.id}}}})}
  async function attemptMove(from:string,to:string){const current=new Chess(fen);const beforeFen=fen;const currentKey=normalizeFen(current.fen());let legal:any=null;try{legal=current.move({from,to,promotion:"q"})}catch{}setSelectedSquare(null);if(!legal){setFeedback("Illegal move. Try another move.");return}const playedUci=moveToUci(legal);if(trainingMode==="restricted"){const correct=expectedUserOptions.some(m=>m.uci===playedUci);if(!correct){const expected=expectedUserOptions[0]?.san??"No saved move";logMistake(beforeFen,expected,legal.san);setShowAnswer(true);setFeedback(`Not quite. ${legal.san} is legal, but this drill expects ${expected}. The position was saved for review.`);await runBrain("wrong_move",{attemptedMoveSan:legal.san,attemptedMoveUci:playedUci});return}}setFen(current.fen());setLastMove(playedUci);setLastMoveSan(legal.san);setOpponentCue(null);setShowAnswer(false);setFeedback(trainingMode==="restricted"?`Correct: ${legal.san}.`:`Played ${legal.san}. Move will be evaluated.`);setProgress(prev=>{const next={...prev.mistakes};if(reviewingFen&&next[reviewingFen]){if(next[reviewingFen].count<=1)delete next[reviewingFen];else next[reviewingFen]={...next[reviewingFen],count:next[reviewingFen].count-1}}return{...prev,attempts:prev.attempts+1,correct:prev.correct+1,streak:prev.streak+1,trainedPositions:{...prev.trainedPositions,[currentKey]:true},mistakes:next}});setReviewingFen(null)}
  function practiceMistake(m:Mistake){const rep=repertoires.find(r=>r.id===m.repertoireId);if(rep)setSelectedRepertoireId(rep.id);setFen(m.fen);setReviewingFen(normalizeFen(m.fen));setFeedback("Review this opening position. Play the expected move.");setShowAnswer(false);setTrainingMode("restricted");setBookComplete(false);setActiveTab("train")}
  function createCustomRepertoire(){const moves=newLineText.replace(/\d+\./g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean);if(!moves.length)return;const test=new Chess();for(const move of moves){try{if(!test.move(move)){setFeedback(`Could not parse move: ${move}`);return}}catch{setFeedback(`Could not parse move: ${move}`);return}}const rep:Repertoire={id:`custom-${Date.now()}`,name:newRepName.trim()||"My Custom Repertoire",color:newRepColor,description:"Custom line saved on this device.",lines:[moves],custom:true};setCustomRepertoires(prev=>[...prev,rep]);setSelectedRepertoireId(rep.id);setShowAddLine(false);setFen(new Chess().fen());setTrainingMode("restricted");setBookComplete(false);setFeedback("Custom repertoire saved. Restricted training is active.");setActiveTab("train")}
  const squareStyles:Record<string,CSSProperties>={};if(lastMove&&lastMove.length>=4){squareStyles[lastMove.slice(0,2)]={boxShadow:"inset 0 0 0 999px rgba(255,255,255,.12), inset 0 0 22px rgba(255,255,255,.5)"};squareStyles[lastMove.slice(2,4)]={boxShadow:"inset 0 0 0 999px rgba(255,255,255,.16), inset 0 0 24px rgba(255,255,255,.62)"}}if(activeBoard){for(const cue of currentView.cues.slice(0,3)){const bg=cue.kind==="support"?"rgba(80,190,120,.24)":cue.kind==="danger"?"rgba(255,80,80,.24)":"rgba(255,210,70,.26)";squareStyles[cue.square]={...squareStyles[cue.square],background:`radial-gradient(circle, ${bg} 0%, ${bg} 38%, transparent 72%)`,boxShadow:"inset 0 0 22px rgba(255,210,70,.58)"}}if(opponentCue)for(const cue of opponentCue.cues){squareStyles[cue.square]={...squareStyles[cue.square],background:"radial-gradient(circle, rgba(255,145,70,.22) 0%, rgba(255,145,70,.16) 38%, transparent 72%)"}}}if(selectedSquare)squareStyles[selectedSquare]={...squareStyles[selectedSquare],boxShadow:"inset 0 0 0 3px rgba(22,101,52,.85), inset 0 0 24px rgba(22,101,52,.5)"};
  return <main className="min-h-screen bg-[#f7f7f4] text-stone-950"><div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
    {activeTab==="home"&&<section className="space-y-6"><header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm"><Beaker size={20}/></div><div><h1 className="text-2xl font-bold tracking-tight">Blundr</h1><p className="text-sm text-stone-500">GPT-powered opening training with a controlled trainer.</p></div></div><Settings className="text-stone-500" size={22}/></header><div className="grid grid-cols-2 gap-3"><MetricCard label="Accuracy" value={`${accuracy}%`} sub="all time" icon={<Trophy size={19}/>}/><MetricCard label="Streak" value={String(progress.streak)} sub="correct" icon={<Flame size={19}/>}/><MetricCard label="Review" value={String(mistakes.length)} sub="mistakes" icon={<XCircle size={19}/>} warning/><MetricCard label="Openings" value={String(repertoires.length)} sub="available" icon={<BookOpen size={19}/>}/></div><div className="rounded-3xl bg-stone-900 p-4 text-white shadow-sm"><div className="flex items-center gap-2 text-sm font-bold text-green-300"><Cloud size={17}/> v2.5 Lightweight Stockfish</div><p className="mt-2 text-sm leading-6 text-stone-300">Every position is sent to /api/brain for facts, engine context, GPT annotation, validation, and final board views.</p></div><div className="space-y-3">{repertoires.slice(0,5).map(r=><button key={r.id} onClick={()=>selectRepertoire(r.id)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-3 text-left shadow-sm"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">{r.color==="white"?"♙":"♟"}</div><div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-sm text-stone-500">{r.lines.length} lines • {countPositions(r)} positions</div><p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.description}</p></div><ChevronRight className="text-stone-400" size={20}/></button>)}</div></section>}
    {activeTab==="repertoire"&&<section className="space-y-5"><header className="flex items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">Repertoires</h1><p className="text-sm text-stone-500">Reliable openings included in the app.</p></div><button onClick={()=>setShowAddLine(true)} className="rounded-2xl bg-green-700 px-4 py-2 text-sm font-black text-white">Add</button></header><div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm"><Search size={18} className="text-stone-400"/><span className="text-sm text-stone-400">Search repertoires</span></div><div className="space-y-3">{repertoires.map(r=><button key={r.id} onClick={()=>selectRepertoire(r.id)} className={classNames("flex w-full items-center gap-3 rounded-3xl border bg-white p-3 text-left shadow-sm",r.id===selectedRepertoireId?"border-green-700":"border-stone-200")}><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">{r.color==="white"?"♙":"♟"}</div><div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-sm text-stone-500">{r.lines.length} lines • {countPositions(r)} positions • {r.color}</div><p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.description}</p></div><ChevronRight className="text-stone-400" size={20}/></button>)}</div></section>}
    {activeTab==="train"&&<section className="space-y-4"><header className="flex items-start justify-between"><div><h1 className="text-xl font-bold tracking-tight">{repertoire.name}</h1><p className="text-sm font-semibold text-green-700">{trainingMode==="restricted"?"Restricted trainer":"Continuation"} • {rating.target}</p></div><button onClick={resetBoard} className="rounded-2xl bg-white p-3 shadow-sm"><RotateCcw size={20}/></button></header><LiveBrain brain={brain}/><div className="rounded-3xl bg-white p-3 shadow-sm"><div className="mb-3 grid grid-cols-4 gap-2">{RATING_PRESETS.map(p=><button key={p.value} onClick={()=>setRatingFilter(p.value)} className={classNames("rounded-full px-2 py-2 text-[11px] font-black",ratingFilter===p.value?"bg-green-700 text-white":"bg-stone-100 text-stone-600")}>{p.label}</button>)}</div><div className="mb-3 flex items-center justify-between gap-3"><button onClick={()=>setActiveBoard(!activeBoard)} className={classNames("rounded-full px-4 py-2 text-sm font-black",activeBoard?"bg-stone-950 text-white":"bg-stone-100 text-stone-600")}>Active Board {activeBoard?"ON":"OFF"}</button><PipelineStatus step={thinkingStep} note={pipelineNote}/></div>{activeBoard&&<div className="mb-3 grid grid-cols-3 gap-2">{(["attack","defense","plan"] as ActiveBoardView[]).map(v=><button key={v} onClick={()=>setActiveBoardView(v)} className={classNames("rounded-full px-4 py-2 text-sm font-black capitalize",activeBoardView===v?"bg-green-700 text-white shadow-sm":"bg-white text-stone-500 ring-1 ring-stone-200")}>{v}</button>)}</div>}<TapChessboard game={game} orientation={repertoire.color} selectedSquare={selectedSquare} squareStyles={squareStyles} lines={activeBoard&&visualReady?currentView.lines:[]} transientLines={activeBoard&&opponentCue?opponentCue.lines:[]} onSquareTap={handleSquareTap} whitePct={whitePct} evalText={evalText}/></div>{bookComplete&&<div className="rounded-3xl border border-green-200 bg-green-50 p-4 shadow-sm"><h2 className="text-lg font-black text-green-900">Book complete</h2><p className="mt-2 text-sm leading-6 text-green-800">You finished this opening branch. Train it again, or continue against the bot from this position.</p><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={resetBoard} className="rounded-2xl bg-white px-4 py-3 font-black text-green-800 shadow-sm">Train Again</button><button onClick={continueVsBot} className="rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm">Continue vs Bot</button></div></div>}<button onClick={()=>{setShowAnswer(true);void runBrain("reveal")}} className="w-full rounded-3xl bg-stone-950 px-4 py-4 text-center font-black text-white shadow-lg"><span className="flex items-center justify-center gap-2"><Eye size={18}/> Reveal Next Move</span></button>{showAnswer&&<div className="rounded-3xl bg-stone-900 p-4 text-white"><div className="text-sm text-stone-300">Restricted training move</div><div className="mt-2 text-2xl font-black">{expectedUserOptions.length?expectedUserOptions.map(m=>m.san).join(" / "):engineLines[0]?.san??"Explore"}</div><p className="mt-2 text-xs leading-5 text-stone-400">Source: {expectedUserOptions.length?"selected opening repertoire":trainingMode==="continuation"?"Brain endpoint engine continuation":"no saved training move"}</p></div>}{activeBoard&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wide text-green-700">{activeBoardView} view • {visualReady?(annotation.fallback?"fallback":"GPT"):"thinking"}</div><h2 className="text-lg font-black">{visualReady?currentView.title:"Preparing intelligent board..."}</h2></div><button onClick={()=>setShowDetails(!showDetails)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{showDetails?"Hide":"Show more"}</button></div><p className="text-sm leading-6 text-stone-700">{visualReady?currentView.message:"Blundr is pausing while the Brain endpoint prepares the final validated visual."}</p>{opponentCue&&<p className="mt-2 rounded-2xl bg-orange-50 p-3 text-sm leading-6 text-orange-800"><span className="font-black">Opponent cue: </span>{opponentCue.message}</p>}{annotation.nextPlan&&<p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600"><span className="font-black text-stone-900">Next: </span>{annotation.nextPlan}</p>}<MoveImpact impact={moveImpact}/>{showDetails&&<div className="mt-3 space-y-2"><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Headline: {annotation.headline}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual: {annotation.visualExplanation}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Pipeline: {brainResponse?.pipeline?.gpt??"not run"} → {brainResponse?.pipeline?.visual??"not run"}</div>{annotation.reason&&<div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Fallback reason: {annotation.reason}</div>}</div>}</div>}<div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3">{feedback.toLowerCase().includes("correct")?<CheckCircle2 className="mt-0.5 text-green-700" size={24}/>:feedback.toLowerCase().includes("not quite")||feedback.toLowerCase().includes("illegal")?<XCircle className="mt-0.5 text-red-600" size={24}/>:<Target className="mt-0.5 text-green-700" size={24}/>}<div><div className="font-bold">{isUserTurn?"Your move":"Opponent thinking"}</div><p className="text-sm leading-6 text-stone-600">{feedback}</p></div></div></div></section>}
    {activeTab==="review"&&<section className="space-y-5"><header><h1 className="text-2xl font-bold tracking-tight">Review Mistakes</h1><p className="text-sm text-stone-500">Wrong opening moves are saved here.</p></header>{mistakes.length===0?<div className="rounded-3xl bg-white p-6 text-center shadow-sm"><CheckCircle2 className="mx-auto mb-3 text-green-700" size={40}/><h2 className="text-lg font-bold">No mistakes due</h2><p className="mt-2 text-sm text-stone-500">Missed training positions will appear here.</p></div>:<div className="space-y-3">{mistakes.map(m=><button key={m.fen} onClick={()=>practiceMistake(m)} className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="font-bold">{m.opening}</div><div className="mt-1 text-sm text-stone-500">Expected: <span className="font-bold text-green-700">{m.expectedMove}</span></div><div className="text-sm text-stone-500">You played: {m.playedMove}</div></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Missed {m.count}x</span></div></button>)}</div>}</section>}
    {activeTab==="progress"&&<section className="space-y-5"><header><h1 className="text-2xl font-bold tracking-tight">Progress</h1><p className="text-sm text-stone-500">Your training snapshot.</p></header><div className="grid grid-cols-3 gap-2"><MetricCard compact label="Accuracy" value={`${accuracy}%`} sub="overall" icon={<Target size={18}/>}/><MetricCard compact label="Trained" value={String(Object.keys(progress.trainedPositions).length)} sub="positions" icon={<BookOpen size={18}/>}/><MetricCard compact label="Review" value={String(mistakes.length)} sub="due" icon={<XCircle size={18}/>} warning/></div></section>}
  </div>{showAddLine&&<div className="fixed inset-0 z-[60] flex items-end bg-black/35 p-4"><div className="mx-auto w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Add Custom Line</h2><button onClick={()=>setShowAddLine(false)} className="rounded-full bg-stone-100 p-2"><X size={18}/></button></div><label className="text-sm font-bold text-stone-700">Name</label><input value={newRepName} onChange={e=>setNewRepName(e.target.value)} className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"/><label className="mt-4 block text-sm font-bold text-stone-700">Train as</label><div className="mt-1 grid grid-cols-2 rounded-2xl bg-stone-200 p-1 text-sm font-semibold"><button onClick={()=>setNewRepColor("white")} className={classNames("rounded-xl py-2",newRepColor==="white"?"bg-white text-green-700 shadow-sm":"text-stone-500")}>White</button><button onClick={()=>setNewRepColor("black")} className={classNames("rounded-xl py-2",newRepColor==="black"?"bg-white text-green-700 shadow-sm":"text-stone-500")}>Black</button></div><label className="mt-4 block text-sm font-bold text-stone-700">Line in SAN</label><textarea value={newLineText} onChange={e=>setNewLineText(e.target.value)} rows={5} className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"/><button onClick={createCustomRepertoire} className="mt-4 w-full rounded-2xl bg-green-700 px-4 py-4 font-black text-white shadow-sm">Save and Train</button></div></div>}<BottomNav activeTab={activeTab} setActiveTab={setActiveTab}/></main>
}

function TapChessboard({game,orientation,selectedSquare,squareStyles,lines,transientLines,onSquareTap,whitePct,evalText}:{game:Chess;orientation:RepertoireColor;selectedSquare:string|null;squareStyles:Record<string,CSSProperties>;lines:ActiveLine[];transientLines:ActiveLine[];onSquareTap:(s:string)=>void;whitePct:number;evalText:string}){
  const ranks=orientation==="white"?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8];
  const files=orientation==="white"?FILES:[...FILES].reverse();
  const centerFor=(sq:string)=>{
    const fileIndex=FILE_TO_INDEX[sq[0]],rank=Number(sq[1]);
    const col=orientation==="white"?fileIndex:7-fileIndex;
    const row=orientation==="white"?8-rank:rank-1;
    return{x:(col+.5)*12.5,y:(row+.5)*12.5}
  };
  return <div className="mx-auto flex w-full max-w-[450px] items-stretch gap-2">
    <EvalBar whitePct={whitePct} evalText={evalText}/>
    <div className="flex-1 rounded-[28px] bg-white p-3 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200">
      <div className="relative aspect-square w-full overflow-hidden rounded-[18px] border border-stone-300 bg-stone-200">
        <BoardLines lines={lines} centerFor={centerFor} transient={false}/>
        <BoardLines lines={transientLines} centerFor={centerFor} transient/>
        <div className="grid h-full w-full grid-cols-8 grid-rows-8">
          {ranks.flatMap((rank,rowIndex)=>files.map((file,colIndex)=>{
            const square=`${file}${rank}`;
            const piece=getPiece(game,square);
            const key=piece?`${piece.color}${piece.type}`:"";
            const isDark=(FILES.indexOf(file)+rank)%2===1;
            const showRank=colIndex===0;
            const showFile=rowIndex===7;
            return <button key={square} type="button" onClick={()=>onSquareTap(square)} className={classNames("relative flex h-full w-full select-none items-center justify-center overflow-hidden",isDark?"bg-[#779954]":"bg-[#edeed1]",selectedSquare===square?"ring-4 ring-inset ring-green-800":"")} style={squareStyles[square]??{}}>
              {showRank?<span className={classNames("pointer-events-none absolute left-1 top-0.5 text-[10px] font-black",isDark?"text-[#edeed1]":"text-[#779954]")}>{rank}</span>:null}
              {showFile?<span className={classNames("pointer-events-none absolute bottom-0.5 right-1 text-[10px] font-black",isDark?"text-[#edeed1]":"text-[#779954]")}>{file}</span>:null}
              <span className={classNames("pointer-events-none flex h-full w-full items-center justify-center font-serif leading-none antialiased",piece?.color==="w"?"text-stone-50 [text-shadow:0_2px_3px_rgba(0,0,0,.55)]":"text-stone-950 [text-shadow:0_1px_1px_rgba(255,255,255,.25)]")} style={{fontSize:"min(11.6vw,58px)",transform:"translateY(-1px)"}}>{key?PIECE_SYMBOLS[key]:""}</span>
            </button>
          }))}
        </div>
      </div>
    </div>
  </div>
}

function EvalBar({whitePct,evalText}:{whitePct:number;evalText:string}){
  const blackPct=100-whitePct;
  return <div className="relative flex w-8 shrink-0 flex-col overflow-hidden rounded-2xl bg-stone-950 shadow-sm ring-1 ring-stone-200">
    <div className="flex items-center justify-center bg-stone-950 text-[10px] font-black text-white transition-all duration-500" style={{height:`${blackPct}%`,minHeight:"8%"}}>
      {blackPct>34?<span className="rotate-90 tracking-tight">Black</span>:null}
    </div>
    <div className="flex items-center justify-center bg-stone-50 text-[10px] font-black text-stone-950 transition-all duration-500" style={{height:`${whitePct}%`,minHeight:"8%"}}>
      {whitePct>34?<span className="-rotate-90 tracking-tight">White</span>:null}
    </div>
    <div className="pointer-events-none absolute left-0 right-0 top-2 text-center text-[9px] font-black text-amber-500">{evalText}</div>
  </div>
}

function BoardLines({lines,centerFor,transient}:{lines:ActiveLine[];centerFor:(s:string)=>{x:number;y:number};transient:boolean}){const visible=lines.filter(l=>isValidSquare(l.from)&&isValidSquare(l.to)).slice(0,transient?1:2);if(!visible.length)return null;const color=(k:LineKind)=>k==="defense"?"rgba(80,190,120,.82)":k==="opponent"?"rgba(255,145,70,.78)":k==="attack"?"rgba(255,155,70,.84)":"rgba(255,210,80,.84)";return <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><defs>{visible.map((l,i)=><linearGradient key={i} id={`g-${transient?"t":"p"}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={color(l.kind)} stopOpacity="0"/><stop offset="48%" stopColor={color(l.kind)} stopOpacity=".92"/><stop offset="100%" stopColor={color(l.kind)} stopOpacity=".36"/></linearGradient>)}</defs>{visible.map((l,i)=>{const f=centerFor(l.from),t=centerFor(l.to);const curve=Math.max(-3.2,Math.min(3.2,(Math.abs(t.x-f.x)+Math.abs(t.y-f.y))*.022));const cx=(f.x+t.x)/2+curve,cy=(f.y+t.y)/2-curve;const path=`M ${f.x} ${f.y} Q ${cx} ${cy} ${t.x} ${t.y}`;return <g key={`${l.from}-${l.to}-${i}`} className={transient?"blundr-opponent-line":"blundr-intent-line"}><path d={path} fill="none" stroke={color(l.kind)} strokeWidth={transient?"1.05":".74"} strokeLinecap="round" opacity=".18"/><path d={path} fill="none" stroke={`url(#g-${transient?"t":"p"}-${i})`} strokeWidth={transient?".78":".56"} strokeLinecap="round"/><circle cx={t.x} cy={t.y} r={transient ? 0.82 : 0.7} fill={color(l.kind)} opacity={transient?".30":".22"}/></g>})}</svg>}
function PipelineStatus({step,note}:{step:ThinkingStep;note:string}){const labels:Record<ThinkingStep,string>={idle:"Ready",facts:"Analyzing",engine:"Engine",brain:"GPT Brain","gpt-receive":"Receiving","visual-update":"Updating",ready:"Ready",error:"Error"};const tone=step==="error"?"bg-red-50 text-red-700 ring-red-100":step==="ready"||step==="idle"?"bg-green-50 text-green-700 ring-green-100":"bg-blue-50 text-blue-700 ring-blue-100";return <div className={classNames("max-w-[190px] rounded-2xl px-3 py-2 text-right text-[11px] font-black leading-4 ring-1",tone)} title={note}><div>{labels[step]}</div><div className="truncate text-[10px] font-semibold opacity-75">{note}</div></div>}
function MoveImpact({impact}:{impact:{label:string;pct:number;tone:string;note:string}}){return <div className="mt-3 rounded-2xl bg-stone-50 p-3"><div className="mb-2 flex items-center justify-between text-xs font-black"><span>Move Impact</span><span className="text-green-700">{impact.label}</span></div><div className="h-2 rounded-full bg-stone-200"><div className={classNames("h-2 rounded-full",impact.tone)} style={{width:`${impact.pct}%`}}/></div><p className="mt-2 text-xs leading-5 text-stone-500">{impact.note}</p></div>}
function LiveBrain({brain}:{brain:LiveBrain}){return <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-black"><Zap size={16} className="text-green-700"/> Live Brain</div><span className="text-xs font-black text-stone-400">{brain.ratingLabel} • {brain.ratingPool}</span></div><div className="grid grid-cols-4 gap-1.5"><Status label="Book" state={brain.book}/><Status label="Lichess" state={brain.lichess}/><Status label="Engine" state={brain.engine}/><Status label="GPT" state={brain.gpt}/></div><div className="mt-2 rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold leading-5 text-stone-500">Source: <span className="font-black text-stone-800">{brain.source}</span>{brain.latency?` • ${brain.latency} ms`:""}{brain.note?` • ${brain.note}`:""}</div></div>}
function Status({label,state}:{label:string;state:SystemState}){const tone=state==="active"||state==="ready"||state==="cached"?"bg-green-50 text-green-700":state==="loading"?"bg-blue-50 text-blue-700":state==="fallback"||state==="complete"?"bg-amber-50 text-amber-700":state==="error"?"bg-red-50 text-red-700":"bg-stone-100 text-stone-500";return <div className={classNames("rounded-full px-2 py-1 text-center text-[10px] font-black",tone)}>{label}: {state}</div>}
function MetricCard({label,value,sub,icon,warning=false,compact=false}:{label:string;value:string;sub:string;icon:ReactNode;warning?:boolean;compact?:boolean}){return <div className={classNames("rounded-3xl bg-white shadow-sm",compact?"p-3":"p-4")}><div className={classNames("mb-2",warning?"text-orange-600":"text-green-700")}>{icon}</div><div className="text-xs text-stone-500">{label}</div><div className={classNames("font-black tracking-tight",compact?"text-xl":"text-3xl")}>{value}</div><div className="text-xs text-stone-400">{sub}</div></div>}
function BottomNav({activeTab,setActiveTab}:{activeTab:string;setActiveTab:(tab:Tab)=>void}){const tabs=[{id:"home",label:"Home",icon:Home},{id:"train",label:"Train",icon:Target},{id:"review",label:"Review",icon:CheckCircle2},{id:"progress",label:"Progress",icon:BarChart3},{id:"repertoire",label:"Repertoire",icon:BookOpen}] as const;return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-2 pb-4 pt-2 backdrop-blur"><div className="mx-auto grid max-w-md grid-cols-5 gap-1">{tabs.map(tab=>{const Icon=tab.icon;const active=activeTab===tab.id;return <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={classNames("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold",active?"bg-green-50 text-green-700":"text-stone-500")}><Icon size={19}/>{tab.label}</button>})}</div></nav>}
