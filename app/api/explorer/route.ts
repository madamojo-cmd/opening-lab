import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export const dynamic = "force-dynamic";
const VALID_RATINGS = new Set(["1000","1200","1400","1600","1800","2000","2200","2500"]);
const VALID_SPEEDS = new Set(["ultraBullet","bullet","blitz","rapid","classical","correspondence"]);
function csv(value:string|null,fallback:string,allowed?:Set<string>){const a=(value??fallback).split(",").map(s=>s.trim()).filter(Boolean).filter(s=>!allowed||allowed.has(s));return a.length?a.join(","):fallback;}
function uci(m:{from:string;to:string;promotion?:string}){return `${m.from}${m.to}${m.promotion??""}`;}
function fallback(fen:string,reason:string,status=200){
  try{const g=new Chess(fen);const turn=g.turn();const center=new Set(["d4","e4","d5","e5"]);const moves=(g.moves({verbose:true}) as any[]).map(m=>{let score=20;if(m.captured)score+=60;if(center.has(m.to))score+=35;if((m.piece==="n"||m.piece==="b")&&(m.from[1]==="1"||m.from[1]==="8"))score+=25;if(m.san?.includes("+"))score+=40;if(m.flags?.includes("k")||m.flags?.includes("q"))score+=30;return{m,score}}).sort((a,b)=>b.score-a.score).slice(0,16);return NextResponse.json({source:"local-fallback",fallback:true,reason,status,white:turn==="w"?1:0,draws:0,black:turn==="b"?1:0,moves:moves.map((x,i)=>{const w=Math.max(10,120-i*8+x.score);return{uci:uci(x.m),san:x.m.san,white:turn==="w"?w:0,draws:Math.max(1,Math.round(w*.08)),black:turn==="b"?w:0,averageRating:1200}}),fetchedAt:new Date().toISOString()})}catch(e){return NextResponse.json({source:"local-fallback",fallback:true,reason,error:String(e),moves:[]})}
}
export async function GET(req:NextRequest){
  const sp=new URL(req.url).searchParams;const fen=sp.get("fen");if(!fen)return NextResponse.json({error:"Missing fen"},{status:400});
  const source=sp.get("source")==="masters"?"masters":"lichess";const url=new URL(source==="masters"?"https://explorer.lichess.org/masters":"https://explorer.lichess.org/lichess");
  url.searchParams.set("fen",fen);url.searchParams.set("moves",sp.get("moves")??"25");url.searchParams.set("topGames","0");
  if(source==="lichess"){url.searchParams.set("variant","standard");url.searchParams.set("speeds",csv(sp.get("speeds"),"blitz,rapid,classical",VALID_SPEEDS));url.searchParams.set("ratings",csv(sp.get("ratings"),"1000,1200,1400,1600",VALID_RATINGS));url.searchParams.set("recentGames","0")}
  const headers:Record<string,string>={accept:"application/json","user-agent":"BlundrOpeningTrainer/2.2"};if(process.env.LICHESS_TOKEN)headers.authorization=`Bearer ${process.env.LICHESS_TOKEN}`;
  try{const r=await fetch(url.toString(),{headers,next:{revalidate:43200}});if(r.status===401)return fallback(fen,"Lichess unauthenticated. Check LICHESS_TOKEN.",401);if(r.status===423)return fallback(fen,"Lichess returned 423 Locked.",423);if(r.status===429)return fallback(fen,"Lichess rate limited request.",429);if(!r.ok)return fallback(fen,`Lichess returned ${r.status}.`,r.status);const data=await r.json();return NextResponse.json({source,fallback:false,fen,fetchedAt:new Date().toISOString(),...data})}catch(e){return fallback(fen,e instanceof Error?e.message:"Could not reach Lichess")}
}
