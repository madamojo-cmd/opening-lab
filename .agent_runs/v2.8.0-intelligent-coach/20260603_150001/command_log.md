# Package 10 Command Log
$ git branch --show-current
v2.8.0-intelligent-coach-live

$ git status --short
?? .agent_runs/v2.8.0-intelligent-coach/20260603_150001/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md

$ git log --oneline -5
58721ef Add v2.8.0 visible teaching surface builder
896b92e Add v2.8.0 headless live chain smoke test
35a84d5 Add v2.8.0 coach safety gate
5757851 Add v2.8.0 coach compiler MVP
75c5296 Add v2.8.0 teaching concept registry

$ find app -maxdepth 3 -type f | sort
app/api/blundr-visual-model/route.ts
app/api/brain/route.ts
app/api/explorer/route.ts
app/globals.css
app/layout.tsx
app/page.tsx

$ find components -maxdepth 4 -type f | sort
components/board/TeachingOverlay.tsx
components/board/VisualRecipeLayer.tsx
components/board/useVisualRecipePlayback.ts
components/board/visualPrimitiveRenderers.tsx
components/coach/CoachCard.tsx
components/debug/BlundrDiagnosticsPanel.tsx
components/debug/DebugBadge.tsx
components/debug/DebugCopyButton.tsx
components/debug/DebugEventTimeline.tsx
components/debug/DebugJsonViewer.tsx
components/debug/DebugSection.tsx

$ find lib/blundr/presentation -maxdepth 4 -type f | sort
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts
lib/blundr/presentation/__tests__/coachHideDoesNotSuppressVisuals.test.ts
lib/blundr/presentation/__tests__/phaseActionGating.test.ts
lib/blundr/presentation/__tests__/presentationLegacySuppression.test.ts
lib/blundr/presentation/__tests__/presentationVisualIndependence.test.ts
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts
lib/blundr/presentation/actionPolicyBuilder.ts
lib/blundr/presentation/buildVisibleTeachingSurface.ts
lib/blundr/presentation/coachActionStylePolicy.ts
lib/blundr/presentation/copySurfaceBuilder.ts
lib/blundr/presentation/index.ts
lib/blundr/presentation/modeSurfacePolicy.ts
lib/blundr/presentation/phaseActionGating.ts
lib/blundr/presentation/presentationDebug.ts
lib/blundr/presentation/surfaceDebug.ts
lib/blundr/presentation/testPresentationFrame.ts
lib/blundr/presentation/testVisualLayerIndependence.ts
lib/blundr/presentation/trainerPresentationFrame.ts
lib/blundr/presentation/trainerPresentationTypes.ts
lib/blundr/presentation/types.ts
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/presentation/visualRecipeMapper.ts

$ find tests/coach -maxdepth 2 -type f | sort
tests/coach/antiHallucination.test.ts
tests/coach/browserContract.test.ts
tests/coach/coachCompiler.test.ts
tests/coach/coachSafetyGate.test.ts
tests/coach/continuationFlow.test.ts
tests/coach/currentInstructionFrame.test.ts
tests/coach/dynamicConceptActivator.test.ts
tests/coach/evidenceGraph.test.ts
tests/coach/goldenPositions.test.ts
tests/coach/liveChainSmoke.test.ts
tests/coach/plainLeak.test.ts
tests/coach/providerFailure.test.ts
tests/coach/showMoreVisualReveal.test.ts
tests/coach/targetInvariant.test.ts
tests/coach/teachingConceptRegistry.test.ts
tests/coach/typeContracts.test.ts
tests/coach/visibleTeachingSurface.test.ts

$ git grep -n "orchestrateTeaching\|coach\|hint\|showMore\|Show More\|reveal\|Reveal\|Continue from here\|Continue from Here\|continue_from_here\|TeachingOverlay\|VisualRecipeLayer\|expectedMove\|instructionTarget\|CurrentInstructionFrame\|VisibleTeachingSurface" app components lib tests || true
app/api/blundr-visual-model/route.ts:10:import { buildAdaptiveContext } from "@/lib/blundr/coaching/adaptiveContext";
app/api/blundr-visual-model/route.ts:23:  const expected = firstMove(body.expectedMove ?? body.expectedMoves);
app/api/blundr-visual-model/route.ts:27:  if (Array.isArray(body.expectedMoves)) {
app/api/blundr-visual-model/route.ts:28:    out.push(...body.expectedMoves);
app/api/blundr-visual-model/route.ts:57:      expectedMove: firstMove(body.expectedMove ?? body.expectedMoves) as any,
app/api/blundr-visual-model/route.ts:58:      expectedMoves: Array.isArray(body.expectedMoves) ? body.expectedMoves : undefined,
app/api/blundr-visual-model/route.ts:81:      memory: body.coachingMemory,
app/api/blundr-visual-model/route.ts:105:        expectedMove: firstMove(body.expectedMove ?? body.expectedMoves) as any,
app/api/brain/route.ts:7:  "You are Blundr's elite chess opening coach and visual teaching selector. Return strict JSON only. Do not invent legal moves, tactics, coordinates, or engine claims. Use verified candidate fields only. Always give expert-level chess advice. Do not dumb down, oversimplify, or weaken advice based on rating level. Make Attack, Defense, and Plan genuinely different: Attack = user pressure/targets; Defense = user pieces/squares protected, loose, or under threat; Plan = next approved move/idea and whether that differs from engine preference. Required keys: selectedView, headline, mainExplanation, visualExplanation, planExplanation, nextPlan, keySquares, planArrows, attack, defense, plan, threatNote, suppress, confidence. Each view needs title, message, lines, cues, insight.";
app/api/brain/route.ts:304:  const expected = Array.isArray(body.expectedMoves) ? body.expectedMoves : [];
app/api/brain/route.ts:305:  const expectedMove = expected[0];
app/api/brain/route.ts:310:  if (expectedMove?.uci && expectedMove.uci.length >= 4) {
app/api/brain/route.ts:311:    planLines.push({ from: expectedMove.uci.slice(0, 2), to: expectedMove.uci.slice(2, 4), kind: "plan", label: expectedMove.san, score: 999, reason: "approved training move" });
app/api/brain/route.ts:343:      title: expectedMove?.san ? `Next move: ${expectedMove.san}` : engineLines[0]?.san ? `Next idea: ${engineLines[0].san}` : theme.title,
app/api/brain/route.ts:344:      message: expectedMove?.san ? `The restricted trainer expects ${expectedMove.san} from this position.` : "The plan view shows the next verified idea from this position.",
app/api/brain/route.ts:347:      insight: expectedMove?.san ? "Plan is anchored to the approved repertoire move." : "Plan uses engine continuation or opening theme after the book ends.",
app/api/brain/route.ts:360:  const expectedMove = body?.expectedMoves?.[0]?.san || engine.pvs?.[0]?.san || "the highlighted move";
app/api/brain/route.ts:366:    mainExplanation: body.eventType === "wrong_move" ? `${body.attemptedMoveSan || "That move"} is legal, but this restricted opening drill expects ${expectedMove}.` : `${expectedMove} is the key idea in this position.`,
app/api/brain/route.ts:369:    nextPlan: body?.expectedMoves?.[0]?.san ? `Play ${body.expectedMoves[0].san} when it is your turn.` : "Follow the highlighted plan cue.",
app/api/brain/route.ts:552:    approvedTrainingMoves: body.expectedMoves ?? [],
app/api/brain/route.ts:584:      expectedMove: body.expectedMoves?.[0],
app/api/brain/route.ts:591:        planSource: body.expectedMoves?.[0] ? "repertoire" : engine.pvs?.[0] ? "engine" : "fallback",
app/api/brain/route.ts:592:        trainingMove: body.expectedMoves?.[0]?.san,
app/api/brain/route.ts:594:        engineAgreement: body.expectedMoves?.[0]?.uci && engine.pvs?.[0]?.uci ? (body.expectedMoves[0].uci === engine.pvs[0].uci ? "agrees" : "prefers-other") : (engine.fallback ? "unavailable" : "unknown")
app/page.tsx:14:import { orchestrateTeaching } from "@/lib/blundr/teaching/teachingOrchestrator";
app/page.tsx:27:import { CoachCard } from "@/components/coach/CoachCard";
app/page.tsx:28:import { buildCoachContext } from "@/lib/blundr/coach/coachContextBuilder";
app/page.tsx:29:import { decideCoachOutput } from "@/lib/blundr/coach/coachDecisionEngine";
app/page.tsx:30:import { buildCoachUtteranceRecordKey, loadCoachUtteranceMemory, readCoachUtteranceMemoryMeta, recordCoachUtterance } from "@/lib/blundr/coach/coachUtteranceMemory";
app/page.tsx:31:import type { CoachButton } from "@/lib/blundr/coach/coachTypes";
app/page.tsx:41:import { buildCoachExplanationPipeline, buildVerifiedUserFacingFallback, isDebugLeakText } from "@/lib/blundr/coachBrain/coachExplanationPipeline";
app/page.tsx:44:import { decideCoachSurfacePolicy } from "@/lib/blundr/coachSurface/coachSurfacePolicy";
app/page.tsx:45:import { presentMoveImpact } from "@/lib/blundr/coachSurface/moveImpactPresenter";
app/page.tsx:48:import { buildVisibleTeachingSurface } from "@/lib/blundr/presentation/buildVisibleTeachingSurface"; // v2.7.40 Agent 3: single visible owner surface
app/page.tsx:51:import { resolveExpectedMoveForFrame } from "@/lib/blundr/openings/expectedMoveResolver";
app/page.tsx:55:import { buildCurrentInstructionFrame, isBookLikeInstructionTarget } from "@/lib/blundr/runtime/currentInstructionFrame";
app/page.tsx:61:import { analyzeBlundrPosition } from "@/lib/blundr/brain/analyzeBlundrPosition";  // v2.7.39.2+ Brain facade for 2.7.39.3 coach migration
app/page.tsx:74:type PatternCueStatus = "ready" | "pending" | "suppressed" | "plain" | "wrong_move" | "manual_reveal";
app/page.tsx:86:type Mistake = { fen: string; expectedMove: string; playedMove: string; count: number; opening: string; repertoireId: string };
app/page.tsx:144:  instructionTargetKind: string | null;
app/page.tsx:145:  instructionTargetUci: string | null;
app/page.tsx:146:  instructionTargetSan: string | null;
app/page.tsx:147:  instructionTargetPieceType: string | null;
app/page.tsx:148:  coachMoveUci: string | null;
app/page.tsx:149:  coachPieceType: string | null;
app/page.tsx:151:  revealTargetUci: string | null;
app/page.tsx:171:  instructionTargetUci: string | null;
app/page.tsx:172:  instructionTargetSan: string | null;
app/page.tsx:173:  instructionTargetPieceType: string | null;
app/page.tsx:177:  coachDecisionSource: string | null;
app/page.tsx:233:function buildRuntimeFrameKey(input:{fen:string;trainerPhase:string;trainerView:TrainerView;trainingMode:TrainingMode;isUserTurn:boolean;instructionTargetUci:string|null}){return `${normalizeFen(input.fen)}|${input.trainerPhase}|${input.trainerView}|${input.trainingMode}|${input.isUserTurn?"user":"opp"}|${input.instructionTargetUci??"none"}`}
app/page.tsx:256:function blankAnnotation():BrainAnnotation{return{source:"initial",fallback:true,selectedView:"plan",headline:"Ready",mainExplanation:"Make a move or tap Reveal Next Move.",visualExplanation:"The board can now show a fast local cue immediately while Brain refines the coaching text.",planExplanation:"Restricted mode keeps you inside the selected opening.",nextPlan:"Play the highlighted training move when available.",keySquares:[],planArrows:[],attack:{title:"Your attack",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},defense:{title:"Your defense",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},plan:{title:"Plan",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},confidence:"initial"}}
app/page.tsx:314:  return records.filter((entry)=>entry.trainerPhase==="ready_for_user"&&Boolean(entry.instructionTargetUci)).slice(-limit);
app/page.tsx:317:function normalizeCoachEntryKind(input:{trainerPhase:string;isUserTurn:boolean;instructionTargetUci:string|null;runtimeCriticalIssues?:string[]}):CoachSessionLogEntry["entryKind"]{
app/page.tsx:322:  if(input.trainerPhase==="ready_for_user"&&input.isUserTurn&&input.instructionTargetUci)return "instructional";
app/page.tsx:327:  const theme=String(debug?.selectedTheme??debug?.coachQuality?.selectedTheme??"").trim()||null;
app/page.tsx:342:  const templateMatches=rule.templateHints.some((hint)=>currentTemplate.includes(hint));
app/page.tsx:343:  const selectedTemplateId=templateMatches?currentTemplate:(debug?.verifiedFallbackUsed||debug?.candidateCoachFallbackUsed||debug?.coachQuality?.usedFallback?`fallback:${theme}:verified_safe`:`live:${theme}:${rule.layer==="tactical"?"explain_tactic":rule.layer==="center"?"explain_center":rule.layer==="development"?"explain_development":"explain_plan"}`);
app/page.tsx:361:  const quality=withProvenance?.coachQuality??{};
app/page.tsx:364:  const source=String(withProvenance?.coachDecisionSource??quality?.source??"").trim();
app/page.tsx:368:  const normalizedSource=runtimeSafeFallbackUsed?"verified_safe_fallback":(source||"live_coach");
app/page.tsx:369:  const hasTarget=Boolean(withProvenance?.coachMoveUci);
app/page.tsx:374:    coachDecisionSource:normalizedSource,
app/page.tsx:378:    coachQuality:{
app/page.tsx:391:  target:NonNullable<ReturnType<typeof buildCurrentInstructionFrame>["target"]>;
app/page.tsx:411:    brainAnalysis: null,  // v2.7.39.3 ready; wired in main live coach path
app/page.tsx:418:    theme:pipeline.coachExplanation.selectedTheme,
app/page.tsx:419:    quality:pipeline.coachQuality,
app/page.tsx:428:function buildEngineBestContinuationCopy(target:NonNullable<ReturnType<typeof buildCurrentInstructionFrame>["target"]>){
app/page.tsx:490:  if(input.trainerView==="plain"&&!input.showAnswer)return "Plain View • No hints";
app/page.tsx:521:    return{title:"Find the next move",snippet:"Solve the position without hints.",status:"plain",source:"plain"};
app/page.tsx:544:      next:"Use Reveal only if you want to inspect the saved line.",
app/page.tsx:563:    return{title:"No verified cue yet",snippet:"A recommendation is pending, so Blundr will not invent a plan.",next:"Use Reveal only if you want the answer.",status:"suppressed",source:"suppressed"};
app/page.tsx:590:      status:"manual_reveal",
app/page.tsx:776:  // v2.7.40 Agent 4: dedicated showMoreShown for Plain View Hint+Show More escalation (resets on new frame; distinct from showDetails debug toggle)
app/page.tsx:777:  const [showMoreShown,setShowMoreShown]=useState(false);
app/page.tsx:800:  const [brain,setBrain]=useState<LiveBrain>({ratingLabel:"Club",ratingPool:"1200–1600",book:"ready",lichess:"ready",engine:"ready",gpt:"ready",source:"rule visual",note:"Manual reveal/debug only"});
app/page.tsx:814:  const [coachInteraction,setCoachInteraction]=useState<"none"|"hint"|"answer"|"why"|"hide"|"show_plan"|"analyze_idea"|"show_move">("none");
app/page.tsx:815:  const [coachHintRequestCount,setCoachHintRequestCount]=useState(0);
app/page.tsx:816:  const [coachHiddenFrameId,setCoachHiddenFrameId]=useState<string|null>(null);
app/page.tsx:817:  const [coachReviewMarked,setCoachReviewMarked]=useState(false);
app/page.tsx:818:  const [coachUtteranceMemory,setCoachUtteranceMemory]=useState<any[]>([]);
app/page.tsx:819:  const [coachMemoryMigration,setCoachMemoryMigration]=useState({migratedOrCleared:false,clearedLegacyCount:0,legacyDetected:false});
app/page.tsx:821:  const [coachTimeline,setCoachTimeline]=useState<CoachSessionLogEntry[]>([]);
app/page.tsx:837:  const coachUtteranceMemoryRef=useRef<any[]>([]);
app/page.tsx:839:  const coachTimelineRef=useRef<CoachSessionLogEntry[]>([]);
app/page.tsx:840:  const coachTimelineSeqRef=useRef(0);
app/page.tsx:867:  const expectedMoveResolution=useMemo(()=>resolveExpectedMoveForFrame({
app/page.tsx:882:  const expectedMoveResolverDebug=useMemo(()=>buildOpeningResolverDebug(expectedMoveResolution),[expectedMoveResolution]);
app/page.tsx:884:  // v2.7.41 TDZ Fix: expectedMovesForValidation + curated / lichess end signals placed early
app/page.tsx:885:  // (strict ordering: after expectedMoveResolution, before continuationPolicyCandidate and anything that consumes them)
app/page.tsx:886:  const expectedMovesForValidation = useMemo(() => {
app/page.tsx:887:    // Must be computed only from raw upstream state and/or expectedMoveResolution.
app/page.tsx:888:    // Never from continuationPolicyCandidate, currentInstructionFrame, or instructionTarget.
app/page.tsx:889:    const candidates = expectedMoveResolution?.candidateMoves ?? [];
app/page.tsx:897:  }, [expectedMoveResolution?.candidateMoves, userColor]);
app/page.tsx:899:  const expectedMovesForValidationKey = useMemo(
app/page.tsx:900:    () => expectedMovesForValidation.map((move) => `${move.uci}:${move.san ?? ""}`).join("|"),
app/page.tsx:901:    [expectedMovesForValidation]
app/page.tsx:905:  // Never infer from temporary expectedMovesForValidation.length === 0 or source includes("curated"/"terminal")
app/page.tsx:907:    const len = expectedMoveResolution?.lineLength ?? 0;
app/page.tsx:908:    const cur = expectedMoveResolution?.lineCursor ?? 0;
app/page.tsx:910:  }, [expectedMoveResolution?.lineCursor, expectedMoveResolution?.lineLength]);
app/page.tsx:980:    const hasCurated = Boolean(expectedMoveResolution?.expectedMoveUci) &&
app/page.tsx:981:      (expectedMoveResolution?.source === "lesson_line" ||
app/page.tsx:982:       expectedMoveResolution?.source === "opening_branch" ||
app/page.tsx:983:       (expectedMoveResolution?.lineLength ?? 0) > 0);
app/page.tsx:994:    expectedMoveResolution?.expectedMoveUci,
app/page.tsx:995:    expectedMoveResolution?.source,
app/page.tsx:996:    expectedMoveResolution?.lineLength,
app/page.tsx:1009:    if ((expectedMoveResolution?.source ?? "") === "none" && !bookComplete && trainingMode === "restricted" && !trustedInstructionTargetExists) return true;
app/page.tsx:1018:    expectedMoveResolution?.source,
app/page.tsx:1046:    userContinuationCount:expectedMoveResolution.candidateMoves.filter((move)=>move.color===userColor).length,
app/page.tsx:1049:    knownBranchAvailable:expectedMoveResolution.candidateMoves.some((move)=>move.color===userColor),
app/page.tsx:1053:  }),[moveHistory.length,fen,repertoire.id,selectedRepertoireId,key,game,userColor,exactOpeningNodes,expectedMoveResolution.candidateMoves,opponentBookOptions.length,enginePreview]);
app/page.tsx:1158:        instructionTarget: null,
app/page.tsx:1159:        expectedMoveUci: null,
app/page.tsx:1160:        expectedMoveSan: null,
app/page.tsx:1168:        coachTitle: "Line complete",
app/page.tsx:1169:        coachBody: "You finished this training line. Continue from this position or train the line again.",
app/page.tsx:1170:        actions: ["continue_from_here","restart_line"],
app/page.tsx:1179:        instructionTarget: null,
app/page.tsx:1180:        expectedMoveUci: null,
app/page.tsx:1181:        expectedMoveSan: null,
app/page.tsx:1189:        coachTitle: "Line complete",
app/page.tsx:1190:        coachBody: "You finished this training line. Continue from this position or train the line again.",
app/page.tsx:1191:        actions: ["continue_from_here","restart_line"],
app/page.tsx:1196:      // Fall through to the normal buildCurrentInstructionFrame path below with a good guidedMove.
app/page.tsx:1205:        instructionTarget: null,
app/page.tsx:1206:        expectedMoveUci: null,
app/page.tsx:1207:        expectedMoveSan: null,
app/page.tsx:1215:        coachTitle: "Thinking...",
app/page.tsx:1216:        coachBody: "Finding the next teaching moment.",
app/page.tsx:1234:    return buildCurrentInstructionFrame({
app/page.tsx:1241:      guidedMove:expectedMoveResolution.expectedMoveUci&&expectedMoveResolution.source!=="continuation_candidate"?{
app/page.tsx:1242:        uci:expectedMoveResolution.expectedMoveUci,
app/page.tsx:1243:        san:expectedMoveResolution.expectedMoveSan,
app/page.tsx:1244:        source:expectedMoveResolution.source,
app/page.tsx:1245:        kind:expectedMoveResolution.source==="opening_branch"?"lichess_branch_move":expectedMoveResolution.source==="opening_family_plan"?"adaptive_branch_move":"guided_move",
app/page.tsx:1269:    expectedMoveResolution,
app/page.tsx:1282:  const instructionTarget=currentInstructionFrame.target;
app/page.tsx:1286:  if (instructionTarget?.kind === "continuation_candidate" && instructionTarget.uci) {
app/page.tsx:1296:        uci: instructionTarget.uci,
app/page.tsx:1297:        san: instructionTarget.san,
app/page.tsx:1298:        source: instructionTarget.source,
app/page.tsx:1311:    hasContinuationCandidate:instructionTarget?.kind==="continuation_candidate",
app/page.tsx:1313:  }),[fen,trainingMode,isUserTurn,userExplicitlyEnteredContinuation,instructionTarget?.kind,continuationAnalysisStatus]);
app/page.tsx:1314:  const expectedUserOptions=useMemo<Continuation[]>(()=>isBookLikeInstructionTarget(instructionTarget)?[{
app/page.tsx:1315:    san:instructionTarget.san,
app/page.tsx:1316:    uci:instructionTarget.uci,
app/page.tsx:1317:    color:instructionTarget.color,
app/page.tsx:1318:    resultingFen:instructionTarget.resultingFen,
app/page.tsx:1319:  }]:[],[instructionTarget]);
app/page.tsx:1320:  const currentSelectedCandidateUci=instructionTarget?.kind==="continuation_candidate"?instructionTarget.uci:null;
app/page.tsx:1321:  const currentSelectedCandidateSan=instructionTarget?.kind==="continuation_candidate"?instructionTarget.san:null;
app/page.tsx:1322:  const currentSelectedCandidateSource=instructionTarget?.source??"none";
app/page.tsx:1325:  // expectedMovesForValidation and expectedMovesForValidationKey are now declared early (from expectedMoveResolution only)
app/page.tsx:1327:  const expectedUserUcis=expectedMovesForValidation.map(move=>move.uci);
app/page.tsx:1328:  const expectedUserSans=expectedMovesForValidation.map(move=>move.san).filter(Boolean) as string[];
app/page.tsx:1335:    instructionTargetUci:instructionTarget?.uci??null,
app/page.tsx:1336:  }),[fen,trainerPhase,trainerView,trainingMode,isUserTurn,instructionTarget?.uci]);
app/page.tsx:1348:  const shouldValidateTrainingMove=activeTab==="train"&&trainingMode==="restricted"&&isUserTurn&&!bookComplete&&historyIndex>=positionHistory.length-1&&expectedMovesForValidation.length>0;
app/page.tsx:1356:    const expectedMove=expectedMovesForValidation[0];
app/page.tsx:1357:    if(!expectedMove)return null;
app/page.tsx:1358:    const expectedMoveBook=explorerMoves.find((m)=>m.uci===expectedMove.uci);
app/page.tsx:1360:    const moveGames=expectedMoveBook?.total??0;
app/page.tsx:1362:      return orchestrateTeaching({
app/page.tsx:1366:            san:expectedMove.san??expectedMove.uci,
app/page.tsx:1367:            uci:expectedMove.uci,
app/page.tsx:1368:            from:expectedMove.uci.slice(0,2),
app/page.tsx:1369:            to:expectedMove.uci.slice(2,4),
app/page.tsx:1370:            promotion:expectedMove.uci.length>4?expectedMove.uci.slice(4,5):undefined,
app/page.tsx:1393:        expectedMove:{uci:expectedMove.uci,san:expectedMove.san},
app/page.tsx:1396:        repertoireMoves:expectedMovesForValidation.map((move)=>({uci:move.uci,san:move.san})),
app/page.tsx:1411:  },[activeTab,trainingMode,isUserTurn,expectedMovesForValidationKey,fen,userColor,trainerView,showAnswer,shouldValidateTrainingMove,moveQualityUserStatus,moveQuality?.status,repertoire.name,historyIndex,positionHistory.length,lastMoveSan,explorerMoves,engineLines,progress.trainedPositions,progress.mistakes]);
app/page.tsx:1413:  const effectiveViewModeForVisual = (trainerView === "plain" && showMoreShown) ? "assisted" : trainerView;
app/page.tsx:1416:    expectedMoveUci:teachingOrchestration.cue.metadata.moveUci,
app/page.tsx:1417:    expectedMoveSan:teachingOrchestration.cue.metadata.moveSan,
app/page.tsx:1423:    revealState:showAnswer?"revealed":"hidden",
app/page.tsx:1426:  }):null,[teachingOrchestration,selectedRepertoireId,fen,trainerFrameId,trainerView,showAnswer,trainerPhase,isUserTurn,showMoreShown,effectiveViewModeForVisual]);
app/page.tsx:1428:  const visualRecipeTargetMatchesInstructionTarget=instructionTarget?.uci?(!visualRecipeMoveUci||visualRecipeMoveUci===instructionTarget.uci):"unknown";
app/page.tsx:1429:  const visualRecipeBlockedByTargetMismatch=Boolean(instructionTarget?.uci&&visualRecipeMoveUci&&visualRecipeMoveUci!==instructionTarget.uci);
app/page.tsx:1430:  const visualRecipeForRender=!instructionTarget?.uci||visualRecipeBlockedByTargetMismatch?null:visualRecipe;
app/page.tsx:1440:  }),[visualRecipeForRender,trainerPhase,isUserTurn,trainerView,boardFen,trainerFrameId,overlayFrameId,showMoreShown,effectiveViewModeForVisual]);
app/page.tsx:1463:    if(overlaySuppressedReason||!instructionTarget?.uci)return[];
app/page.tsx:1466:    const expectedFrom=instructionTarget.from;
app/page.tsx:1467:    const expectedTo=instructionTarget.to;
app/page.tsx:1469:    const primary=matching??{from:expectedFrom,to:expectedTo,kind:"plan" as const,label:instructionTarget.san};
app/page.tsx:1471:  },[overlaySuppressedReason,visualRecipePlayback.lines,instructionTarget?.uci,instructionTarget?.from,instructionTarget?.to,instructionTarget?.san]);
app/page.tsx:1476:    const moveUci=trainingMode==="restricted"&&isBookLikeInstructionTarget(instructionTarget)?instructionTarget.uci:null;
app/page.tsx:1477:    const moveSan=trainingMode==="restricted"&&isBookLikeInstructionTarget(instructionTarget)?instructionTarget.san:null;
app/page.tsx:1499:  },[activeBoard,trainerPhase,isUserTurn,trainerView,trainingMode,instructionTarget,visualRecipeMainLines.length,game]);
app/page.tsx:1513:  const coachMemoryForDecision=coachUtteranceMemoryRef.current;
app/page.tsx:1514:  const coachContextResult=useMemo(()=>buildCoachContext({
app/page.tsx:1518:    revealState:showAnswer?"revealed":"hidden",
app/page.tsx:1545:    hintUsed:coachHintRequestCount>0,
app/page.tsx:1550:    recentUtteranceIds:coachMemoryForDecision.slice(-5).map((entry:any)=>entry.utteranceId),
app/page.tsx:1551:    recentUtteranceFamilies:coachMemoryForDecision.slice(-5).map((entry:any)=>entry.utteranceFamily),
app/page.tsx:1552:  }),[trainerFrameId,fen,trainingMode,trainerView,showAnswer,trainerPhase,isUserTurn,bookComplete,teachingOrchestration,visualRecipe,progress,reviewingFen,coachHintRequestCount,selectedRepertoireId,coachMemoryForDecision]);
app/page.tsx:1554:    context:coachContextResult.context,
app/page.tsx:1555:    interaction:coachInteraction,
app/page.tsx:1557:    hintRequestCount:coachHintRequestCount,
app/page.tsx:1558:    utteranceMemory:coachMemoryForDecision,
app/page.tsx:1565:      expectedMoveUci:expectedUserOptions[0]?.uci,
app/page.tsx:1566:      expectedMoveSan:expectedUserOptions[0]?.san,
app/page.tsx:1575:      stale:coachContextResult.context?(!coachContextResult.context.recipeFrameMatchesBoard||!coachContextResult.context.recipeFenMatchesBoard):true,
app/page.tsx:1576:      expectedMoveSource:expectedMoveResolution.source,
app/page.tsx:1577:      expectedMoveCoverageTier:expectedMoveResolution.coverageTier,
app/page.tsx:1578:      expectedMoveResolutionReason:expectedMoveResolution.reason,
app/page.tsx:1580:  }),[coachContextResult,coachInteraction,reviewingFen,progress.mistakes,coachHintRequestCount,coachMemoryForDecision,fen,trainerFrameId,bookComplete,trainingMode,trainerView,expectedUserOptionsSignature,currentSelectedCandidateUci,currentSelectedCandidateSan,enginePreview,visualRecipe,teachingOrchestration,explorerMoves,expectedMoveResolution]);
app/page.tsx:1582:    if(trainerPhase==="ready_for_user"&&isUserTurn&&instructionTarget){
app/page.tsx:1590:        focusMove:instructionTarget?{uci:instructionTarget.uci}:null,
app/page.tsx:1598:      const brainFrameKey = computeInstructionFrameKey({ fen, trainingMode, isUserTurn, trainerPhase, source: instructionTarget?.kind || trainingMode });
app/page.tsx:1599:      const brainAnalysisForCoach = instructionTarget ? analyzeBlundrPosition({
app/page.tsx:1607:      const coachPipeline=buildCoachExplanationPipeline({
app/page.tsx:1609:        target:instructionTarget,
app/page.tsx:1623:        userRequestedHelp:coachInteraction==="hint"||coachInteraction==="why",
app/page.tsx:1626:      const text=silence.silent?"":coachPipeline.coachExplanation.body||pickLiveCoachCopy(selected?.opportunity??"silence",`${selectedRepertoireId}:${normalizeFen(fen)}`);
app/page.tsx:1627:      const lintedText=validateLiveCoachCopy(text).allowed&&!isDebugLeakText(text)?text:buildVerifiedUserFacingFallback(coachPipeline.moveFactPacket).body;
app/page.tsx:1631:      const selectedCandidate=candidates.find((candidate)=>candidate.moveUci===instructionTarget.uci)??null;
app/page.tsx:1632:      const selectedTemplateId=coachPipeline.coachExplanation.selectedTheme?`live:${coachPipeline.coachExplanation.selectedTheme}:${coachPipeline.coachExplanation.selectedTheme==="capture_or_recapture"||coachPipeline.coachExplanation.selectedTheme==="checkmate"?"explain_tactic":coachPipeline.coachExplanation.selectedTheme==="central_pawn_advance"?"explain_center":"explain_development"}`:(selected?`live:${selected.opportunity}:${selected.intent}`:null);
app/page.tsx:1635:        coachCopySource:"live_coach",
app/page.tsx:1638:        selectedOpportunityId:coachPipeline.coachExplanation.selectedTheme??selected?.opportunity??null,
app/page.tsx:1639:        selectedOpportunityMoveUci:selected?.candidateMoveUci??instructionTarget.uci,
app/page.tsx:1650:        coachDecisionSource:coachPipeline.coachExplanation.usedFallback?"verified_safe_fallback":"live_coach",
app/page.tsx:1651:        selectedTheme:coachPipeline.coachExplanation.selectedTheme,
app/page.tsx:1652:        selectedOpportunityLayer:coachPipeline.coachExplanation.selectedOpportunityLayer??null,
app/page.tsx:1653:        selectedOpportunityScore:coachPipeline.coachExplanation.selectedOpportunityScore??coachPipeline.opportunityPacket.selected?.score??null,
app/page.tsx:1654:        selectedPlanType:coachPipeline.coachExplanation.selectedPlanType??coachPipeline.planPacket.plans[0]?.planType??null,
app/page.tsx:1655:        coachQuality:coachPipeline.coachQuality,
app/page.tsx:1656:        moveFactPacket:coachPipeline.moveFactPacket,
app/page.tsx:1657:        positionDeltaPacket:coachPipeline.positionDeltaPacket,
app/page.tsx:1658:        featurePacket:{status:coachPipeline.featurePacket.status,...coachPipeline.featurePacket},
app/page.tsx:1659:        planPacket:{status:coachPipeline.planPacket.status,plans:coachPipeline.planPacket.plans},
app/page.tsx:1661:          status:coachPipeline.opportunityPacket.opportunities.length?"ran":"ran_empty",
app/page.tsx:1662:          opportunitiesTop5:coachPipeline.opportunityPacket.opportunities.slice(0,5),
app/page.tsx:1663:          selectedOpportunity:coachPipeline.opportunityPacket.selected,
app/page.tsx:1665:        safetyResult:coachPipeline.safetyResult,
app/page.tsx:1669:        title:coachPipeline.coachExplanation.title,
app/page.tsx:1675:        coachPipeline,
app/page.tsx:1677:        buttons:exactMoveAllowed?(["hint","show_plan","analyze_idea","show_move"] as CoachButton[]):(["hint","show_plan","analyze_idea"] as CoachButton[]),
app/page.tsx:1682:  },[bookComplete,trainingMode,trainerPhase,isUserTurn,trainerFrameId,fen,moveHistory,coachInteraction,selectedRepertoireId,instructionTarget,repertoire.id,repertoire.name]);
app/page.tsx:1685:    if(coachHiddenFrameId===String(trainerFrameId))return{...adaptiveCoachDecision,shouldShowCoachCard:false,suppressedReason:"hidden_for_frame"};
app/page.tsx:1698:        revealRisk:"none" as const,
app/page.tsx:1703:        debug:{coachIntent:"continuation_terminal",continuationRuntimeStatus:"terminal",continuationTerminalReason:continuationRuntimeState.reason,coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,verifiedFallbackUsed:true,fallbackReason:"terminal_position"},
app/page.tsx:1718:        revealRisk:"none" as const,
app/page.tsx:1723:        debug:{coachIntent:"opponent_replying",continuationRuntimeStatus:"opponent_replying",coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,verifiedFallbackUsed:true,fallbackReason:"opponent_replying"},
app/page.tsx:1738:        revealRisk:"none" as const,
app/page.tsx:1741:        debug:{coachIntent:"analyzing_continuation",coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,advancedFeatureClaimTypes:[],recognizedPlanTypes:[],selectedOpportunityId:undefined},
app/page.tsx:1758:        body:"This position does not have enough reliable continuation data to coach yet.",
app/page.tsx:1763:        revealRisk:"none" as const,
app/page.tsx:1766:        debug:{coachIntent:"no_reliable_continuation",coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,verifiedFallbackUsed:true,fallbackReason:"no_reliable_continuation"},
app/page.tsx:1779:        shouldMarkReviewWorthy:coachReviewMarked,
app/page.tsx:1781:        revealRisk:"none" as const,
app/page.tsx:1787:          coachMoveUci:instructionTarget?.uci??null,
app/page.tsx:1788:          coachPieceType:instructionTarget?.pieceType??null,
app/page.tsx:1789:          coachVerifiedFactsUsed:Boolean(instructionTarget),
app/page.tsx:1793:          selectedOpportunityMoveUci:(liveCoachState.debug as any)?.selectedOpportunityMoveUci??instructionTarget?.uci??null,
app/page.tsx:1804:  },[adaptiveCoachDecision,liveCoachState,coachHiddenFrameId,trainerFrameId,coachReviewMarked,instructionTarget,trainingMode,trainerPhase,isUserTurn,continuationAnalysisStatus,continuationRuntimeState,fen,userExplicitlyEnteredContinuation,forceContinuationPause,continuationPolicyCandidate?.source]);
app/page.tsx:1809:    expectedMoveSan:instructionTarget?.san??null,
app/page.tsx:1810:    expectedMoveUci:instructionTarget?.uci??null,
app/page.tsx:1812:    coachShouldShow:Boolean(rawCoachDecision?.shouldShowCoachCard),
app/page.tsx:1813:    coachButtons:(rawCoachDecision?.buttons??[]) as CoachButton[],
app/page.tsx:1814:  }),[trainerPhase,isUserTurn,trainingMode,instructionTarget,rawCoachDecision,selectedContinuationCandidateForCoach]);
app/page.tsx:1815:  const coachDecision=useMemo<any>(()=>{
app/page.tsx:1816:    const coachDebugBase={coachMoveUci:instructionTarget?.uci??null,coachPieceType:instructionTarget?.pieceType??null,coachVerifiedFactsUsed:Boolean(instructionTarget)};
app/page.tsx:1818:    const candidateCoachAllowed=trainingMode==="continuation"&&instructionTarget?.kind==="continuation_candidate"&&currentSelectedCandidateLegal;
app/page.tsx:1819:    const transitionCoachAllowed=trainingMode==="continuation"&&["continuation_terminal","opponent_replying","analyzing_continuation"].includes(String(rawCoachDecision?.debug?.coachIntent??""));
app/page.tsx:1820:    const rawIntent=rawCoachDecision?.debug?.coachIntent??rawCoachDecision?.debug?.selectedIntent;
app/page.tsx:1829:        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate}),
app/page.tsx:1832:    if(candidateCoachAllowed&&instructionTarget&&isEngineBestContinuationSource(instructionTarget.source)){
app/page.tsx:1833:      const engineCopy=buildEngineBestContinuationCopy(instructionTarget);
app/page.tsx:1844:        revealRisk:"low",
app/page.tsx:1847:        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate,coachIntent:"show_continued_plan",coachDecisionSource:"verified_safe_fallback",candidateCoachFallbackUsed:true,candidateCoachFallbackReason:"engine_best_move_fallback",selectedCandidateSource:"engine_best",verifiedFallbackUsed:true,fallbackReason:"engine_best_move_fallback"}),
app/page.tsx:1851:      const safeFallback=instructionTarget?buildUserFacingTargetFallback({
app/page.tsx:1853:        target:instructionTarget,
app/page.tsx:1872:        revealRisk:"low",
app/page.tsx:1875:        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate,coachIntent:"show_continued_plan",candidateCoachFallbackUsed:true,candidateCoachFallbackReason:"missing_template_or_silent_generic_candidate",coachSelectedCandidateMove:currentSelectedCandidateUci,coachDecisionSource:"verified_safe_fallback",selectedTheme:safeFallback?.theme,coachQuality:safeFallback?.quality,fallbackReason:safeFallback?.reason??"candidate_safe_fallback"}),
app/page.tsx:1884:        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate,coachRenderedDespiteSilentIntent:false}),
app/page.tsx:1890:      debug:{...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate},
app/page.tsx:1898:    if(repeatedGenericPattern&&instructionTarget){
app/page.tsx:1901:        target:instructionTarget,
app/page.tsx:1921:          coachDecisionSource:"verified_safe_fallback",
app/page.tsx:1923:          coachQuality:safeFallback.quality,
app/page.tsx:1932:      target:instructionTarget?{
app/page.tsx:1933:        pieceType:instructionTarget.pieceType,
app/page.tsx:1934:        isDevelopment:instructionTarget.isDevelopment,
app/page.tsx:1935:        isDiagonalMove:instructionTarget.isDiagonalMove,
app/page.tsx:1936:        isCapture:instructionTarget.isCapture,
app/page.tsx:1937:        isCheck:instructionTarget.isCheck,
app/page.tsx:1938:        isMate:instructionTarget.isMate,
app/page.tsx:1939:        isPromotion:instructionTarget.isPromotion,
app/page.tsx:1940:        isKingSafetyMove:instructionTarget.isKingSafetyMove,
app/page.tsx:1941:        isCentralPawnAdvance:instructionTarget.isCentralPawnAdvance,
app/page.tsx:1946:    if(instructionTarget&&claimValidation.unverifiedClaims.length){
app/page.tsx:1949:        target:instructionTarget,
app/page.tsx:1968:          coachDecisionSource:"verified_safe_fallback",
app/page.tsx:1970:          coachQuality:safeFallback.quality,
app/page.tsx:1984:  },[rawCoachDecision,phaseActionGate,trainingMode,currentSelectedCandidateUci,currentSelectedCandidateLegal,instructionTarget,fen,trainerPhase,repertoire.id,repertoire.name,selectedRepertoireId]);
app/page.tsx:1985:  const coachHiddenForFrame=coachHiddenFrameId===String(trainerFrameId);
app/page.tsx:1986:  const coachSurfacePolicy=useMemo(()=>decideCoachSurfacePolicy({
app/page.tsx:1987:    coachShouldShow:Boolean(coachDecision?.shouldShowCoachCard),
app/page.tsx:1988:    coachSuppressedReason:coachDecision?.suppressedReason,
app/page.tsx:1989:    coachHiddenForFrame,
app/page.tsx:1993:    exactMoveAllowed:Boolean(coachDecision?.exactMoveAllowed),
app/page.tsx:1995:    engineValidationStatus:(coachDecision?.debug as any)?.coachEngineStatus??(enginePreview?.pvs?.length?"ready":"idle"),
app/page.tsx:1997:  }),[coachDecision,coachHiddenForFrame,trainingMode,trainerView,expectedUserOptions.length,moveQuality?.status,enginePreview,visualRecipe,visualRecipeOverlay.adapterAllowed,trainerPhase,isUserTurn]);
app/page.tsx:2003:    const transitionButtons = ["continue_from_here","restart_line"] as const;
app/page.tsx:2035:    exactMoveAllowed:Boolean(coachDecision?.exactMoveAllowed),
app/page.tsx:2036:    engineStatus:(coachDecision?.debug as any)?.coachEngineStatus??(enginePreview?.pvs?.length?"ready":"idle"),
app/page.tsx:2037:    isSafeMove:Boolean((coachDecision?.debug as any)?.coachEngineSafeMoves?.length),
app/page.tsx:2038:    isPlayableMove:Boolean((coachDecision?.debug as any)?.coachSelectedCandidateMove),
app/page.tsx:2040:    reviewWorthy:Boolean(coachDecision?.shouldMarkReviewWorthy),
app/page.tsx:2041:  }),[coachDecision,enginePreview,teachingOrchestration]);
app/page.tsx:2044:    candidateUci:trainingMode==="continuation"&&instructionTarget?.kind==="continuation_candidate"?instructionTarget.uci:null,
app/page.tsx:2045:    candidateSan:trainingMode==="continuation"&&instructionTarget?.kind==="continuation_candidate"?instructionTarget.san:null,
app/page.tsx:2046:  }),[fen,trainingMode,instructionTarget]);
app/page.tsx:2048:  // v2.7.40 Agent 5: early brain analysis passed to TrainerPresentationFrame so coach copy comes from BlundrBrain (target->brain->pres->surface chain)
app/page.tsx:2050:  const brainAnalysisForPresentation = (instructionTarget && currentInstructionFrame) ? analyzeBlundrPosition({
app/page.tsx:2053:    frameKey: computeInstructionFrameKey({ fen, trainingMode, isUserTurn, trainerPhase, source: instructionTarget?.kind || trainingMode }),
app/page.tsx:2067:    answerShown:showAnswer || (trainerView === "plain" && showMoreShown),
app/page.tsx:2079:    coachShouldShow:Boolean(coachDecision?.shouldShowCoachCard),
app/page.tsx:2080:    coachHiddenForFrame,
app/page.tsx:2081:    coachIntent:(coachDecision?.debug as any)?.coachIntent,
app/page.tsx:2082:    coachTitle:coachDecision?.title,
app/page.tsx:2083:    coachBody:coachDecision?.body,
app/page.tsx:2084:    coachButtons:coachDecision?.buttons,
app/page.tsx:2085:    coachSuppressedReason:coachDecision?.suppressedReason,
app/page.tsx:2086:    coachUtteranceFamily:coachDecision?.utteranceFamily,
app/page.tsx:2087:    coachTemplateId:(coachDecision?.debug as any)?.selectedTemplateId,
app/page.tsx:2088:    coachSelectedTheme:(coachDecision?.debug as any)?.selectedTheme??null,
app/page.tsx:2089:    coachQuality:(coachDecision?.debug as any)?.coachQuality??null,
app/page.tsx:2090:    moveFactPacket:(coachDecision?.debug as any)?.moveFactPacket??null,
app/page.tsx:2091:    positionDeltaPacket:(coachDecision?.debug as any)?.positionDeltaPacket??null,
app/page.tsx:2092:    featurePacket:(coachDecision?.debug as any)?.featurePacket??null,
app/page.tsx:2093:    planPacket:(coachDecision?.debug as any)?.planPacket??null,
app/page.tsx:2094:    opportunityPacket:(coachDecision?.debug as any)?.opportunityPacket??null,
app/page.tsx:2095:    safetyResult:(coachDecision?.debug as any)?.safetyResult??null,
app/page.tsx:2100:    coachSurfacePolicy,
app/page.tsx:2101:    // Agent 5: brain for canonical coach copy (quarantines legacy liveCoach/coachDecision text from pres coach on teaching frames)
app/page.tsx:2103:  }),[trainerFrameId,fen,activeBoard,trainerView,trainerPhase,trainingMode,isUserTurn,visualRecipeForRender,visualRecipeMainLines,safeMoveArrowVisual.lines,continuationCandidateVisual.lines,legacyVisualLines,visualRecipePlayback.activePrimitiveIds,visualRecipePlayback.animationState,visualRecipeOverlay,overlayFrameId,coachDecision,coachHiddenForFrame,coachSurfacePolicy,branchTransitionSurface,brainAnalysisForPresentation,showMoreShown]);
app/page.tsx:2106:    const decisionFrameId=String((coachDecision as any)?.frameId??"");
app/page.tsx:2107:    const decisionFen=String((coachDecision as any)?.normalizedFen??"");
app/page.tsx:2108:    const staleCoachFrame=Boolean((coachDecision as any)?.shouldShowCoachCard&&(decisionFrameId&&decisionFrameId!==String(trainerFrameId)||decisionFen&&decisionFen!==normalizedCurrentFen));
app/page.tsx:2111:        ...coachDecision,
app/page.tsx:2113:        suppressedReason:"stale_coach_frame",
app/page.tsx:2115:          ...(coachDecision?.debug??{}),
app/page.tsx:2121:    if(presentationFrame.coach.owner!=="branch_transition_surface")return coachDecision;
app/page.tsx:2123:      ...coachDecision,
app/page.tsx:2125:      title:presentationFrame.coach.title??"Line complete",
app/page.tsx:2126:      body:presentationFrame.coach.body??"You finished this training line. Continue from this position or train the line again.",
app/page.tsx:2127:      buttons:(presentationFrame.coach.buttons as CoachButton[])??(["continue_from_here","restart_line"] as CoachButton[]),
app/page.tsx:2130:      revealRisk:"none" as const,
app/page.tsx:2134:        ...(coachDecision?.debug??{}),
app/page.tsx:2135:        coachIntent:"branch_transition",
app/page.tsx:2141:  },[presentationFrame.coach.owner,presentationFrame.coach.title,presentationFrame.coach.body,coachDecision,fen,trainerFrameId,frameKey]);
app/page.tsx:2142:  const coachFrameStale=Boolean((displayedCoachDecision?.debug as any)?.staleCoachFrame);
app/page.tsx:2144:  const revealTargetStale=Boolean((lastActionDebug as any)?.revealTargetUci&&instructionTarget?.uci&&(lastActionDebug as any)?.revealTargetUci!==instructionTarget.uci);
app/page.tsx:2150:    const frameId=(displayedCoachDecision as any)?.frameId??coachContextResult.context?.frameId??String(trainerFrameId);
app/page.tsx:2151:    const normalizedDecisionFen=(displayedCoachDecision as any)?.normalizedFen??coachContextResult.context?.normalizedFen??normalizeFen(fen);
app/page.tsx:2152:    const viewMode=coachContextResult.context?.viewMode??(trainerView==="assisted"?"assisted":"plain");
app/page.tsx:2157:      coachMode:displayedCoachDecision.mode,
app/page.tsx:2158:      coachAction:displayedCoachDecision.action,
app/page.tsx:2164:      patternId:coachContextResult.context?.patternId??normalizedDecisionFen,
app/page.tsx:2165:      conceptId:coachContextResult.context?.conceptId??"center_tension",
app/page.tsx:2166:      visualRecipeId:coachContextResult.context?.visualRecipeId??"",
app/page.tsx:2167:      coachMode:displayedCoachDecision.mode,
app/page.tsx:2168:      coachAction:displayedCoachDecision.action,
app/page.tsx:2171:      text:displayedCoachDecision.body??displayedCoachDecision.hint??displayedCoachDecision.answer??"",
app/page.tsx:2175:    coachUtteranceMemoryRef.current=next;
app/page.tsx:2176:    const bodyText=String(displayedCoachDecision.body??displayedCoachDecision.hint??displayedCoachDecision.answer??"");
app/page.tsx:2183:      instructionTargetKind:instructionTarget?.kind??null,
app/page.tsx:2184:      instructionTargetUci:instructionTarget?.uci??null,
app/page.tsx:2185:      instructionTargetSan:instructionTarget?.san??null,
app/page.tsx:2186:      instructionTargetPieceType:instructionTarget?.pieceType??null,
app/page.tsx:2187:      coachMoveUci:(displayedCoachDecision.debug as any)?.coachMoveUci??instructionTarget?.uci??null,
app/page.tsx:2188:      coachPieceType:(displayedCoachDecision.debug as any)?.coachPieceType??instructionTarget?.pieceType??null,
app/page.tsx:2190:      revealTargetUci:(lastActionDebug as any)?.revealTargetUci??instructionTarget?.uci??null,
app/page.tsx:2201:    const isInstructionalRecord=trainerPhase==="ready_for_user"&&isUserTurn&&Boolean(instructionTarget?.uci);
app/page.tsx:2211:    coachContextResult.context?.frameId,
app/page.tsx:2212:    coachContextResult.context?.viewMode,
app/page.tsx:2213:    coachContextResult.context?.patternId,
app/page.tsx:2214:    coachContextResult.context?.conceptId,
app/page.tsx:2215:    coachContextResult.context?.visualRecipeId,
app/page.tsx:2218:    displayedCoachDecision?.hint,
app/page.tsx:2223:    instructionTarget,
app/page.tsx:2229:    const visibleTitle=presentationFrame.coach.shouldRender?String(presentationFrame.coach.title??"").trim():(displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision?.title??"").trim():"");
app/page.tsx:2230:    const visibleBody=presentationFrame.coach.shouldRender?String(presentationFrame.coach.body??"").trim():(displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision?.body??"").trim():"");
app/page.tsx:2231:    const visibleButtons=(presentationFrame.coach.shouldRender?presentationFrame.coach.buttons:displayedCoachDecision?.buttons)??[];
app/page.tsx:2232:    const instructionTargetUci=instructionTarget?.uci??null;
app/page.tsx:2233:    const entryKind=normalizeCoachEntryKind({trainerPhase,isUserTurn,instructionTargetUci,runtimeCriticalIssues});
app/page.tsx:2238:      id:++coachTimelineSeqRef.current,
app/page.tsx:2246:      instructionTargetUci,
app/page.tsx:2247:      instructionTargetSan:instructionTarget?.san??null,
app/page.tsx:2248:      instructionTargetPieceType:instructionTarget?.pieceType??null,
app/page.tsx:2252:      coachDecisionSource:normalizedDebug.coachDecisionSource??null,
app/page.tsx:2260:      containsDebugLeak:Boolean(normalizedDebug.coachQuality?.containsDebugLeak||isDebugLeakText(visibleBody||"")),
app/page.tsx:2261:      qualityScore:typeof normalizedDebug.coachQuality?.qualityScore==="number"?normalizedDebug.coachQuality.qualityScore:null,
app/page.tsx:2262:      hasPedagogicalReason:Boolean(normalizedDebug.coachQuality?.hasPedagogicalReason),
app/page.tsx:2263:      repeatedGeneric:Boolean(normalizedDebug.coachQuality?.repeatedGeneric),
app/page.tsx:2264:      targetAligned:instructionTargetUci?Boolean(normalizedDebug.coachQuality?.targetAligned):"not_applicable",
app/page.tsx:2265:      pieceAligned:instructionTarget?.pieceType?Boolean(normalizedDebug.coachQuality?.pieceAligned):"not_applicable",
app/page.tsx:2280:    instructionTarget?.uci,
app/page.tsx:2281:    instructionTarget?.san,
app/page.tsx:2282:    instructionTarget?.pieceType,
app/page.tsx:2283:    presentationFrame.coach.shouldRender,
app/page.tsx:2284:    presentationFrame.coach.title,
app/page.tsx:2285:    presentationFrame.coach.body,
app/page.tsx:2286:    presentationFrame.coach.buttons,
app/page.tsx:2297:      hintShown:coachHintRequestCount>0,
app/page.tsx:2298:      coachInteraction,
app/page.tsx:2307:    // v2.7.40 stabilization: prefer VisibleTeachingSurface.actions (single source) for rendered button reporting in debug.
app/page.tsx:2308:    // This eliminates the "renderedButtonActions: ['hint'] vs lastClicked show_more" desync in diagnostics.
app/page.tsx:2309:    const renderedFromSurface = (visibleTeachingSurface?.coach?.shouldRender ? (visibleTeachingSurface.actions as any) : null);
app/page.tsx:2324:      revealExpectedMoveTriggered:input.normalizedAction==="answer"||input.normalizedAction==="reveal_next_move",
app/page.tsx:2325:      revealCandidateTriggered:input.normalizedAction==="show_move",
app/page.tsx:2328:      revealTargetUci:input.extra?.revealTargetUci??(input.normalizedAction.includes("reveal")||input.normalizedAction==="answer"?instructionTarget?.uci??null:null),
app/page.tsx:2329:      revealTargetSource:input.extra?.revealTargetSource??(instructionTarget?"instruction_target":"none"),
app/page.tsx:2330:      revealIdempotentNoop:Boolean(input.extra?.revealIdempotentNoop),
app/page.tsx:2331:      revealBlockedBecauseCoachHidden:Boolean(input.extra?.revealBlockedBecauseCoachHidden),
app/page.tsx:2335:    setDebugEventLog((events)=>appendDebugEvent(events,{type:"coach_action_clicked",action:input.action,normalizedAction:input.normalizedAction,before:input.before,after:input.after,result:input.result,reason:input.reason,details}));
app/page.tsx:2339:    if(button==="continue_from_here"){
app/page.tsx:2340:      const after={...before,coachInteraction:"continue_from_here",showAnswer:false};
app/page.tsx:2348:        normalizedAction:"continue_from_here",
app/page.tsx:2352:        reason:terminalDetected?"user_continue_from_here_terminal":"user_continue_from_here",
app/page.tsx:2366:    // Everything else (phaseActionGate, old coachDecision.buttons, legacy) is ignored for teaching actions.
app/page.tsx:2367:    const surfaceActionsAtClick = (visibleTeachingSurface?.coach?.shouldRender ? (visibleTeachingSurface.actions as any) : []) as string[];
app/page.tsx:2369:    const internalWhitelist = ["replay", "hide", "continue_from_here", "restart_line"];
app/page.tsx:2376:      const after={...before,coachInteraction:"replay",showAnswer:false,hintShown:false};
app/page.tsx:2381:    if(button==="hide"){const after={...before,coachInteraction:"hide"};setCoachHiddenFrameId(String(trainerFrameId));setCoachInteraction("hide");recordDebugAction({action:button,normalizedAction:"hide",before,after,result:"handled"});return;}
app/page.tsx:2382:    if(button==="hint"){const after={...before,hintShown:true,coachInteraction:"hint"};setCoachHintRequestCount((count)=>count+1);setCoachInteraction("hint");recordDebugAction({action:button,normalizedAction:"hint",before,after,result:"handled"});return;}
app/page.tsx:2383:    if(button==="show_more" || (button as any)==="show_more"){const after={...before,showMoreShown:true,coachInteraction:"show_plan"};setShowMoreShown(true);setCoachInteraction("show_plan");recordDebugAction({action:button,normalizedAction:"show_more",before,after,result:"handled",reason:"plain_show_more_escalation_to_full_content"});return;}
app/page.tsx:2384:    if(button==="answer"){const after={...before,answerShown:true,showAnswer:true,coachInteraction:"answer"};setCoachInteraction("answer");setCoachReviewMarked(true);recordDebugAction({action:button,normalizedAction:"answer",before,after,result:"handled"});handleReveal();return;}
app/page.tsx:2385:    if(button==="why"){const after={...before,coachInteraction:"why"};setCoachInteraction("why");recordDebugAction({action:button,normalizedAction:"why",before,after,result:"handled"});return;}
app/page.tsx:2386:    if(button==="show_plan"){const after={...before,coachInteraction:"show_plan"};setCoachInteraction("show_plan");recordDebugAction({action:button,normalizedAction:"show_plan",before,after,result:"handled"});return;}
app/page.tsx:2387:    if(button==="analyze_idea"){const after={...before,coachInteraction:"analyze_idea"};setCoachInteraction("analyze_idea");recordDebugAction({action:button,normalizedAction:"analyze_idea",before,after,result:"handled",reason:(bookComplete||trainingMode==="continuation")&&isUserTurn?"analysis_requested":"state_only"});if((bookComplete||trainingMode==="continuation")&&isUserTurn)void runBrain("coach_analyze",{skipGpt:true});return;}
app/page.tsx:2388:    if(button==="show_move"){if(!coachDecision?.exactMoveAllowed){recordDebugAction({action:button,normalizedAction:"show_move",before,after:before,result:"blocked",reason:"exact_move_not_allowed"});return;}const after={...before,answerShown:true,showAnswer:true,coachInteraction:"show_move"};setCoachInteraction("show_move");setCoachReviewMarked(true);setShowAnswer(true);recordDebugAction({action:button,normalizedAction:"show_move",before,after,result:"handled"});return;}
app/page.tsx:2400:  // v2.7.40 Agent 3 (late placement after all frame deps): VisibleTeachingSurface — single owner.
app/page.tsx:2401:  // Legacy coach paths are inputs only for debug/safety. Surface now owns visible teaching output.
app/page.tsx:2403:  const brainAnalysisForSurface = (instructionTarget && currentInstructionFrame) ? analyzeBlundrPosition({
app/page.tsx:2406:    frameKey: computeInstructionFrameKey({ fen, trainingMode, isUserTurn, trainerPhase, source: instructionTarget?.kind || trainingMode }),
app/page.tsx:2413:  const intendedCoachMoveUci = (displayedCoachDecision?.debug as any)?.coachMoveUci ?? (rawCoachDecision?.debug as any)?.coachMoveUci ?? instructionTarget?.uci ?? null;
app/page.tsx:2416:  const intendedShowMoreTargetUci = showMoreShown ? instructionTarget?.uci ?? null : null;
app/page.tsx:2417:  const intendedCoachPieceType = (displayedCoachDecision?.debug as any)?.coachPieceType ?? instructionTarget?.pieceType ?? null;
app/page.tsx:2419:  // v2.7.40 P0 Fix 2: on active teaching frames (CurrentInstructionFrame.target present + ready user turn), surface is sole visible owner.
app/page.tsx:2421:  const isActiveTeachingFrame = Boolean(instructionTarget) && trainerPhase === "ready_for_user" && isUserTurn;
app/page.tsx:2423:  const visibleTeachingSurface = buildVisibleTeachingSurface({
app/page.tsx:2426:    legacyCoachDecision: isActiveTeachingFrame ? null : (coachDecision ?? rawCoachDecision ?? (liveCoachState as any)?.coach ?? null),
app/page.tsx:2427:    showMoreShown, // v2.7.40 Agent 4: dedicated state (not showDetails)
app/page.tsx:2435:    // Agent 4: pass for ladder (progressive hints + evidence)
app/page.tsx:2436:    hintCount: coachHintRequestCount,
app/page.tsx:2440:    coachMoveUci: intendedCoachMoveUci,
app/page.tsx:2442:    showMoreTargetUci: intendedShowMoreTargetUci,
app/page.tsx:2443:    coachPieceType: intendedCoachPieceType,
app/page.tsx:2446:  // v2.7.41 Clean Convergence: Emergency legal fallback must never be presented as normal coached teaching.
app/page.tsx:2453:      coach: {
app/page.tsx:2454:        ...visibleTeachingSurface.coach,
app/page.tsx:2455:        title: visibleTeachingSurface.coach.title || "Continue from here",
app/page.tsx:2472:    expectedMove:expectedUserOptions[0]?.uci??null,
app/page.tsx:2577:    coachUtteranceMemoryRef.current=loaded;
app/page.tsx:2601:  useEffect(()=>{coachTimelineRef.current=coachTimeline},[coachTimeline]);
app/page.tsx:2717:    if(instructionTarget?.kind==="continuation_candidate"){
app/page.tsx:2730:  },[activeTab,trainingMode,trainerPhase,isUserTurn,instructionTarget?.kind,fen,game,forceContinuationPause,userExplicitlyEnteredContinuation,engineLines.length,continuationPolicyCandidate?.uci,continuationPolicyCandidate?.source,continuationAnalysisStatus]);
app/page.tsx:2741:    const expectedMoves=expectedMovesForValidation;
app/page.tsx:2742:    if(!expectedMoves.length){
app/page.tsx:2746:        expectedMovesUci:[],
app/page.tsx:2757:      expectedMovesUci:expectedMoves.map((move)=>move.uci),
app/page.tsx:2772:      expectedMovesUci:expectedMoves.map((move)=>move.uci),
app/page.tsx:2789:          expectedMoves,
app/page.tsx:2800:          expectedMovesUci:expectedMoves.map((move)=>move.uci),
app/page.tsx:2813:  },[fen,shouldValidateTrainingMove,expectedMovesForValidationKey]);
app/page.tsx:2846:      expectedMoveSan:cue.metadata.moveSan,
app/page.tsx:2847:      expectedMoveUci:cue.metadata.moveUci,
app/page.tsx:2899:      expectedMove:expectedUserOptions[0]?{san:expectedUserOptions[0].san,uci:expectedUserOptions[0].uci}:undefined,
app/page.tsx:2900:      expectedMoves:expectedUserOptions.map(m=>({san:m.san,uci:m.uci})),
app/page.tsx:2904:      coachingMemory:{
app/page.tsx:2920:  useEffect(()=>{if(activeTab!=="train")return;const fast=deriveFastAnnotation({fen,openingName:repertoire.name,userColor,trainingMode,expectedUserOptions,opponentBookOptions});setAnnotation(fast);setVisualReady(true);setThinkingStep("ready");setPipelineNote(trainingMode==="continuation"&&isUserTurn?continuationAnalysisStatus==="analyzing"?"Analyzing continuation candidate.":"Continuation candidate ready.":"Teaching cue ready.");setBrain(p=>({...p,source:"rule visual",gpt:"ready",note:"Manual reveal/debug only"}))},[fen,activeTab,selectedRepertoireId,trainingMode,ratingFilter,continuationAnalysisStatus]);
app/page.tsx:2928:  useEffect(()=>{if(activeTab==="train"&&trainingMode==="restricted"&&isUserTurn&&expectedMoveResolution.shouldTransitionToContinuation&&guidedCoveragePolicy.guidedCompleteAllowed&&!bookComplete&&!game.isGameOver()){setBookComplete(true);setFeedback("Guided line complete. Continue from here against the bot, or restart the opening.");setBrain(p=>({...p,book:"complete",source:guidedCoveragePolicy.guidedCoverageState,gpt:p.gpt}))}},[activeTab,trainingMode,isUserTurn,expectedMoveResolution.shouldTransitionToContinuation,guidedCoveragePolicy.guidedCompleteAllowed,guidedCoveragePolicy.guidedCoverageState,bookComplete,fen]);
app/page.tsx:2931:    if(expectedMoveResolution.source==="guided_branch_needs_continuation"){
app/page.tsx:2932:      setFeedback("This branch is beyond the guided line. Continue from here, or restart the opening.");
app/page.tsx:2933:      setBrain(p=>({...p,book:"ready",source:"guided branch needs continuation",note:expectedMoveResolution.reason,gpt:p.gpt}));
app/page.tsx:2936:    if(expectedUserOptions.length===0&&expectedMoveResolution.source==="none"){
app/page.tsx:2937:      setFeedback("This branch is not mapped yet. Continue from here, or restart the opening.");
app/page.tsx:2938:      setBrain(p=>({...p,book:"ready",source:"resolver unresolved",note:guidedCoveragePolicy.bookCompleteBlockedReason??expectedMoveResolution.reason,gpt:p.gpt}));
app/page.tsx:2940:  },[activeTab,trainingMode,isUserTurn,expectedUserOptions.length,expectedMoveResolution.source,expectedMoveResolution.reason,guidedCoveragePolicy.bookCompleteBlockedReason,guidedCoveragePolicy.guidedCompleteBlockedReason,bookComplete,fen,game.isGameOver()]);
app/page.tsx:2970:    const browserEngine=extra.skipClientEngine?null:await runBrowserStockfish(requestFen,rating.skill,eventType==="reveal"?1000:700);
app/page.tsx:2983:    const payload={fen:requestFen,openingId:repertoire.id,openingName:repertoire.name,userColor,trainingMode,eventType,selectedView:activeBoardView,moveHistory,lastMoveSan,lastMoveUci:lastMove,expectedMoves:expectedUserOptions.map(m=>({san:m.san,uci:m.uci})),opponentBookMoves:opponentBookOptions.map(m=>({san:m.san,uci:m.uci})),ratingPool:rating.target,ratingLabel:rating.label,ratingFilter,speedFilter,skill:rating.skill,clientEngine,...extra};
app/page.tsx:2985:    setPipelineNote(extra.skipGpt?"Manual analysis request sent.":"Sending local facts to Brain because the user requested reveal/debug.");
app/page.tsx:3004:      setBrain(p=>({...p,engine:data.engine?.fallback?"fallback":"active",gpt:data.annotation?.fallback?"fallback":"active",latency:Math.round(performance.now()-start),source:data.annotation?.fallback?"manual brain fallback":"manual brain",note:data.pipeline?.gpt||data.annotation?.reason||"Manual reveal/debug only"}));
app/page.tsx:3045:  function selectRepertoire(id:string){const startFen=new Chess().fen();setSelectedRepertoireId(id);setFen(startFen);resetHistory(startFen);setSelectedSquare(null);setFeedback("Opening loaded. Play the restricted training move.");setLastMove(null);setLastMoveSan("");setLastMoveColor(null);setReviewingFen(null);resetBranchAndContinuationState();setMoveHistory([]);setTrainingMode("restricted");setTrainerPhase("ready_for_user");setBookComplete(false);clearPendingOpponentReplyRequest({clearStaleIssue:true});setAnnotation(blankAnnotation());setEnginePreview(null);setBrain(p=>({...p,book:"ready",lichess:"ready",source:"rule visual",note:"Manual reveal/debug only"}));setActiveBoardView("plan");setActiveTab("train");bumpRuntimeFrame()}
app/page.tsx:3046:  function resetBoard(){const startFen=new Chess().fen();setFen(startFen);resetHistory(startFen);setSelectedSquare(null);setFeedback("Restarted. Find the first training move.");setLastMove(null);setLastMoveSan("");setLastMoveColor(null);setReviewingFen(null);resetBranchAndContinuationState();setMoveHistory([]);setTrainingMode("restricted");setTrainerPhase("ready_for_user");setBookComplete(false);clearPendingOpponentReplyRequest({clearStaleIssue:true});setAnnotation(blankAnnotation());setEnginePreview(null);setBrain(p=>({...p,book:"ready",lichess:"ready",source:"rule visual",note:"Manual reveal/debug only"}));setActiveTab("train");bumpRuntimeFrame()}
app/page.tsx:3301:  function handleReveal(){
app/page.tsx:3303:    if(!phaseActionGate.revealButtonVisible){
app/page.tsx:3304:      recordDebugAction({action:"reveal_next_move",normalizedAction:"reveal_next_move",before,after:before,result:"blocked",reason:coachHiddenForFrame?"coach_hidden":phaseActionGate.blockedReason??"no_revealable_move",extra:{revealBlockedBecauseCoachHidden:coachHiddenForFrame,revealTargetUci:instructionTarget?.uci??null,revealTargetSource:instructionTarget?"instruction_target":"none"}});
app/page.tsx:3308:      recordDebugAction({action:"reveal_next_move",normalizedAction:"reveal_next_move",before,after:before,result:"no_op",reason:"reveal_idempotent",extra:{revealIdempotentNoop:true,revealTargetUci:instructionTarget?.uci??null,revealTargetSource:instructionTarget?"instruction_target":"none"}});
app/page.tsx:3311:    const after={...before,answerShown:true,showAnswer:true,coachInteraction:coachInteraction==="none"?"answer":coachInteraction};
app/page.tsx:3312:    if(coachHiddenForFrame)setCoachHiddenFrameId(null);
app/page.tsx:3314:    recordDebugAction({action:"reveal_next_move",normalizedAction:"reveal_next_move",before,after,result:"handled",reason:"manual_reveal_button",extra:{revealTargetUci:instructionTarget?.uci??null,revealTargetSource:instructionTarget?"instruction_target":"none"}});
app/page.tsx:3316:      type:"cue_revealed",
app/page.tsx:3318:      expectedMoveSan:instructionTarget?.san,
app/page.tsx:3319:      expectedMoveUci:instructionTarget?.uci,
app/page.tsx:3321:    void runBrain("reveal");
app/page.tsx:3341:      trackLearningEvent({type:"cue_revealed",source:"train",fen,metadata:{eventType:"continuation_terminal",lastUserMoveSan:lastMoveSan,lastUserMoveUci:lastMove,terminalReason:current.isCheckmate?.()?"checkmate":"no_legal_moves"}});
app/page.tsx:3369:  function logMistake(positionFen:string,expected:string,played:string){const k=normalizeFen(positionFen);setProgress(prev=>{const old=prev.mistakes[k];return{...prev,attempts:prev.attempts+1,incorrect:prev.incorrect+1,streak:0,mistakes:{...prev.mistakes,[k]:{fen:positionFen,expectedMove:expected,playedMove:played,count:old?old.count+1:1,opening:repertoire.name,repertoireId:repertoire.id}}}})}
app/page.tsx:3383:    const expectedMove=expectedUserOptions[0];
app/page.tsx:3387:        const expected=expectedMove?.san??"No saved move";
app/page.tsx:3402:          expectedMoveSan:expectedMove?.san,
app/page.tsx:3403:          expectedMoveUci:expectedMove?.uci,
app/page.tsx:3445:      expectedMoveSan:expectedMove?.san,
app/page.tsx:3446:      expectedMoveUci:expectedMove?.uci,
app/page.tsx:3493:  // v2.7.40 Agent 3: Visual overlays prefer VisibleTeachingSurface (enforces alignment + plain-pre + mismatch blocks)
app/page.tsx:3497:    if(!instructionTarget?.uci)return[];
app/page.tsx:3498:    const expectedFrom=instructionTarget.from;
app/page.tsx:3499:    const expectedTo=instructionTarget.to;
app/page.tsx:3501:    const primary=matching??{from:expectedFrom,to:expectedTo,kind:"plan" as const,label:instructionTarget.san};
app/page.tsx:3503:  },[instructionTarget?.uci,instructionTarget?.from,instructionTarget?.to,instructionTarget?.san,rawBoardLines]);
app/page.tsx:3504:  if(!instructionTarget?.uci){
app/page.tsx:3507:    const allowedSquares=new Set([instructionTarget.from,instructionTarget.to]);
app/page.tsx:3514:  const expectedMoveLegal=expectedUserOptions[0]?legalVerboseMoves.some((move)=>moveToUci(move)===expectedUserOptions[0].uci):null;
app/page.tsx:3516:  const visualTargetMatchesInstructionTarget=instructionTarget?.uci?visualMoveUciForDebug===instructionTarget.uci:"unknown";
app/page.tsx:3519:  const legacyTrainingCardActuallyRendered=Boolean(activeBoard&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyTrainingCard && !visibleTeachingSurface?.coach?.shouldRender);
app/page.tsx:3520:  const legacyAnswerCardActuallyRendered=Boolean(showAnswer&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyAnswerCard && !visibleTeachingSurface?.coach?.shouldRender);
app/page.tsx:3521:  const legacyMoveImpactActuallyRendered=Boolean(legacyTrainingCardActuallyRendered&&coachSurfacePolicy.allowMoveImpactCard&&moveImpactPresentation.show);
app/page.tsx:3522:  const legacyNextTextActuallyRendered=Boolean(legacyTrainingCardActuallyRendered&&coachSurfacePolicy.allowNextMoveText&&patternCue.next&&(trainerView==="assisted"||showAnswer));
app/page.tsx:3533:    coachHintRequestCount,
app/page.tsx:3534:    coachHiddenForFrame,
app/page.tsx:3535:    coachInteraction,
app/page.tsx:3536:    instructionTargetUci:instructionTarget?.uci??null,
app/page.tsx:3537:    instructionTargetFrom:instructionTarget?.from??null,
app/page.tsx:3538:    instructionTargetTo:instructionTarget?.to??null,
app/page.tsx:3539:    instructionTargetPieceType:instructionTarget?.pieceType??null,
app/page.tsx:3540:    instructionTargetKind:instructionTarget?.kind??null,
app/page.tsx:3547:      source: instructionTarget?.kind || (trainingMode==="continuation" ? "continuation_candidate" : "guided"),
app/page.tsx:3549:    expectedMoveSan:expectedUserOptions[0]?.san,
app/page.tsx:3550:    expectedMoveUci:expectedUserOptions[0]?.uci,
app/page.tsx:3551:    expectedMoveResolution,
app/page.tsx:3552:    expectedMoveResolverDebug,
app/page.tsx:3568:    expectedMoveLegal,
app/page.tsx:3569:    expectedMoveResolvedFromSan:expectedUserOptions[0]?.san??null,
app/page.tsx:3570:    expectedMoveResolvedFromUci:expectedUserOptions[0]?.uci??null,
app/page.tsx:3571:    sanUciResolutionStatus:expectedUserOptions[0]?"resolved":expectedMoveResolution.source,
app/page.tsx:3572:    sanUciResolutionReason:expectedMoveResolution.reason,
app/page.tsx:3584:    coachSurfacePolicyAffectsVisualLayer:false,
app/page.tsx:3593:    selectedCandidateSafetySource:(coachDecision?.debug as any)?.coachEngineStatus,
app/page.tsx:3608:    continuationInstructionTargetBeforeClick:!continuationPauseClicked?instructionTarget?.uci??null:null,
app/page.tsx:3610:    continuationCoachTargetBeforeClick:!continuationPauseClicked?((displayedCoachDecision?.debug as any)?.coachMoveUci??instructionTarget?.uci??null):null,
app/page.tsx:3623:    coachDecision:displayedCoachDecision,
app/page.tsx:3624:    coachMoveUci:(displayedCoachDecision?.debug as any)?.coachMoveUci??instructionTarget?.uci??null,
app/page.tsx:3625:    coachPieceType:(displayedCoachDecision?.debug as any)?.coachPieceType??instructionTarget?.pieceType??null,
app/page.tsx:3626:    revealTargetUci:(lastActionDebug as any)?.revealTargetUci??instructionTarget?.uci??null,
app/page.tsx:3627:    revealTargetSource:(lastActionDebug as any)?.revealTargetSource??(instructionTarget?"instruction_target":"none"),
app/page.tsx:3629:    coachFrameStale,
app/page.tsx:3631:    revealTargetStale,
app/page.tsx:3633:    memoryMigratedOrCleared:coachMemoryMigration.migratedOrCleared,
app/page.tsx:3634:    coachMemoryLegacyDetected:coachMemoryMigration.legacyDetected,
app/page.tsx:3635:    coachMemoryClearedLegacyCount:coachMemoryMigration.clearedLegacyCount,
app/page.tsx:3638:    coachSurfacePolicy,
app/page.tsx:3645:    coachQuality:(displayedCoachDecision?.debug as any)?.coachQuality??null,
app/page.tsx:3658:    coachTimeline,
app/page.tsx:3686:    visibleCoachOwner: visibleTeachingSurface?.debug?.visibleCoachOwner ?? presentationFrame?.coach?.owner ?? "none",
app/page.tsx:3689:    showMoreTargetUci: intendedShowMoreTargetUci,
app/page.tsx:3697:    {activeTab==="home"&&<section className="space-y-6"><header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm"><Beaker size={20}/></div><div><h1 className="text-2xl font-bold tracking-tight">Blundr</h1><p className="text-sm text-stone-500">Visual opening training with a controlled trainer.</p></div></div><button onClick={()=>setShowSettings(true)} className="rounded-2xl bg-white p-3 shadow-sm"><Settings className="text-stone-500" size={20}/></button></header><div className="grid grid-cols-2 gap-3"><MetricCard label="Accuracy" value={`${accuracy}%`} sub="all time" icon={<Trophy size={19}/>}/><MetricCard label="Streak" value={String(progress.streak)} sub="correct" icon={<Flame size={19}/>}/><MetricCard label="Review" value={String(mistakes.length)} sub="mistakes" icon={<XCircle size={19}/>} warning/><MetricCard label="Openings" value={String(repertoires.length)} sub="available" icon={<BookOpen size={19}/>}/></div><div className="rounded-3xl bg-stone-900 p-4 text-white shadow-sm"><div className="flex items-center gap-2 text-sm font-bold text-green-300"><Cloud size={17}/> v2.7.33</div><p className="mt-2 text-sm leading-6 text-stone-300">Training now uses rule-only visual cues by default. Blundr Brain is reserved for manual reveal/debug, so normal practice stays fast, deterministic, and inexpensive.</p></div><div className="space-y-3">{repertoires.slice(0,5).map(r=><button key={r.id} onClick={()=>selectRepertoire(r.id)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-3 text-left shadow-sm"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">{r.color==="white"?"♙":"♟"}</div><div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-sm text-stone-500">{r.lines.length} lines • {countPositions(r)} positions</div><p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.description}</p></div><ChevronRight className="text-stone-400" size={20}/></button>)}</div></section>}
app/page.tsx:3741:          <p className="mt-2 text-[11px] font-semibold text-stone-500">{trainerView==="assisted"?"Shows the visual pattern cue before the move.":"Hides pre-move hints for independent recall."}</p>
app/page.tsx:3747:      {showDetails&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="font-black text-stone-800">Coach Debug</div><div className="mt-2">coachMode: {coachDecision.mode}</div><div>coachAction: {coachDecision.action}</div><div>coachUtteranceId: {coachDecision.utteranceId??"none"}</div><div>coachUtteranceFamily: {coachDecision.utteranceFamily??"none"}</div><div>coachVariationReason: {String((coachDecision.debug as any)?.coachVariationReason??"n/a")}</div><div>coachHintStrength: {String((coachDecision.debug as any)?.coachHintStrength??"none")}</div><div>coachRevealRisk: {coachDecision.revealRisk}</div><div>coachGivesAnswer: {coachDecision.givesAnswer?"true":"false"}</div><div>coachButtons: {displayedCoachDecision.buttons.join(", ")||"none"}</div><div>coachShouldMarkReviewWorthy: {coachDecision.shouldMarkReviewWorthy?"true":"false"}</div><div>coachSuppressedReason: {coachDecision.suppressedReason??"none"}</div><div>coachFrameMatchesBoard: {coachContextResult.context?.recipeFrameMatchesBoard?"true":"false"}</div><div>coachFenMatchesBoard: {coachContextResult.context?.recipeFenMatchesBoard?"true":"false"}</div><div>recentCoachUtteranceIds: {coachUtteranceMemory.slice(-5).map((entry:any)=>entry.utteranceId).join(", ")||"none"}</div><div>coachSafetyWarnings: {JSON.stringify((coachDecision.debug as any)?.coachSafetyWarnings??[])}</div><div>coachReviewMarked: {coachReviewMarked?"true":"false"}</div><div>selectedOpportunity: {String((coachDecision.debug as any)?.selectedOpportunity??liveCoachState?.selected?.opportunity??"none")}</div><div>selectedIntent: {String((coachDecision.debug as any)?.selectedIntent??liveCoachState?.selected?.intent??"none")}</div><div>exactMoveAllowed: {coachContextResult.context?.exactMoveAllowed?"true":"false"}</div><div>claimTypes: {coachDecision.claimTypes.join(", ")||"none"}</div><div>blockedClaims: {String((coachDecision.debug as any)?.blockedClaims??"none")}</div><div>silenceReason: {String((coachDecision.debug as any)?.silenceReason??liveCoachState?.debug?.silenceReason??"none")}</div><div>branchTransitionSurfaceRendered: {branchTransitionSurface?.render?"true":"false"}</div><div>branchTransitionReason: {branchTransitionSurface?.reason??"none"}</div><div>continueFromHereAvailable: {branchTransitionSurface?.render?"true":"false"}</div><div>continueFromHereClicked: {continueFromHereClicked?"true":"false"}</div><div>coachSurfaceOwner: {coachSurfacePolicy.owner}</div><div>allowLegacyTrainingCard: {coachSurfacePolicy.allowLegacyTrainingCard?"true":"false"}</div><div>allowMoveImpactCard: {coachSurfacePolicy.allowMoveImpactCard?"true":"false"}</div><div>allowNextMoveText: {coachSurfacePolicy.allowNextMoveText?"true":"false"}</div><div>legacyCueSuppressedReason: {coachSurfacePolicy.reason}</div><div>moveImpactPresenterReason: {moveImpactPresentation.reason}</div></div>}
app/page.tsx:3750:      {/* v2.7.40 Clean Intelligent Coach Checkpoint: "Reveal Next Move" button DELETED from all non-debug teaching paths.
app/page.tsx:3751:         Plain View must only ever show Hint + Show More. No Reveal/Show Answer/Show Move allowed.
app/page.tsx:3752:         handleReveal still exists for internal/debug paths only. */}
app/page.tsx:3754:      {false && showAnswer&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyAnswerCard&&!visibleTeachingSurface?.coach?.shouldRender&&!isActiveTeachingFrame&&<div className="rounded-3xl bg-stone-900 p-4 text-white"><div className="text-sm text-stone-300">Study-line move</div><div className="mt-2 text-2xl font-black">{expectedUserOptions.length?expectedUserOptions.map(m=>m.san).join(" / "):engineLines[0]?.san??"Analysis pending"}</div><p className="mt-2 text-xs leading-5 text-stone-400">Source: {trainingMode==="restricted"?"Saved repertoire line":"Continuation analysis"}</p></div>}
app/page.tsx:3756:      {false && activeBoard&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyTrainingCard&&!visibleTeachingSurface?.coach?.shouldRender&&!isActiveTeachingFrame&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wide text-green-700">{patternCueBadgeLabel.replace("Cue ready","Plan mode")}</div><h2 className="text-lg font-black">{patternCue.title}</h2></div><button onClick={()=>setShowDetails(!showDetails)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{showDetails?"Hide":"Show more"}</button></div><p className="text-sm leading-6 text-stone-700">{patternCue.snippet}</p>{opponentCue&&boardSettings.showOpponentCue&&shouldRenderOpponentLastMoveHighlight({committed:opponentCue.committed,cueFen:opponentCue.fen,boardFen:normalizeFen(fen)})&&<p className="mt-2 rounded-2xl bg-purple-50 p-3 text-sm leading-6 text-purple-800"><span className="font-black">Opponent cue: </span>{opponentCue.message}</p>}{coachSurfacePolicy.allowNextMoveText&&patternCue.next&&(trainerView==="assisted"||showAnswer)&&<p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600"><span className="font-black text-stone-900">Next: </span>{patternCue.next}</p>}{visualModelError&&<p className="mt-2 rounded-2xl bg-amber-50 p-2 text-[11px] font-bold leading-5 text-amber-700">Visual cue unavailable: {visualModelError}</p>}{coachSurfacePolicy.allowMoveImpactCard&&moveImpactPresentation.show&&<MoveImpact impact={{label:moveImpactPresentation.label,pct:moveImpact.pct,tone:moveImpact.tone,note:moveImpactPresentation.note}}/>}{showDetails&&<div className="mt-3 space-y-2"><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Headline: {patternCue.title}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual: {activeVisualModelOutput?.animationPackage?.name??annotation.visualExplanation}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Move Quality Gate</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Version: {MOVE_QUALITY_GATE_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Required: {shouldValidateTrainingMove?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Status: {moveQualityPending?"pending":moveQuality?.status??"idle"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected UCI: {moveQuality?.expectedMovesUci?.join(", ")||expectedUserUcis.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected SAN: {expectedUserSans.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Stockfish top two: {moveQuality?.topMoves?.map((line)=>line.uci).join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Reason: {moveQuality?.reason??"No validation result."}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Checked: {moveQuality?.checkedAt?new Date(moveQuality.checkedAt).toLocaleTimeString():"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Hints hidden: {hideUnverifiedTrainingHints?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Teaching Cue Compiler</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler version: {TEACHING_CUE_COMPILER_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler concept: {teachingOrchestration?.cue.conceptId??"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler confidence: {teachingOrchestration?Number((teachingOrchestration.cue.debug.confidence??0).toFixed(3)):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler reason: {teachingOrchestration?.cue.debug.selectedReason??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler delta: {teachingOrchestration?.cue.debug.deltaSummary?.join(" | ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler scores: {teachingOrchestration?.cue.debug.detectorScores?.map((s)=>`${s.conceptId}:${s.finalScore.toFixed(2)}`).slice(0,6).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Orchestrator tier: {teachingOrchestration?.classification.tier??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Selected story: {teachingOrchestration?.selectedStory?.kind??"n/a"} ({teachingOrchestration?.selectedStory?.score.total?.toFixed?.(2)??"n/a"})</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Rejected stories: {teachingOrchestration?.debug.rejectedStories?.map((r)=>`${r.kind}:${r.total.toFixed(2)}`).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual budget: {teachingOrchestration?JSON.stringify(teachingOrchestration.debug.visualBudget):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Suppressed visuals: {teachingOrchestration?.debug.suppressionReasons?.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Learning events are being stored locally for future progress and Review features.</div>{annotation.reason&&<div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Fallback reason: {annotation.reason}</div>}</div>}</div>}
app/page.tsx:3758:      {/* v2.7.40 Agent 3 wiring: CoachCard now driven exclusively by VisibleTeachingSurface (coach + hint + showMore + actions).
app/page.tsx:3761:      {convergedVisibleSurface.coach.shouldRender && (
app/page.tsx:3766:            title: convergedVisibleSurface.coach.title ?? "Training move",
app/page.tsx:3767:            body: convergedVisibleSurface.coach.body ?? convergedVisibleSurface.hint.text ?? "",
app/page.tsx:3772:            revealRisk: "none",
app/page.tsx:3774:            suppressedReason: visibleTeachingSurface.coach.suppressedReason,
app/page.tsx:3775:            // hint/showMore exposed via surface for future Agent 4
app/page.tsx:3776:            hint: visibleTeachingSurface.hint.text,
app/page.tsx:3777:            showMoreContent: visibleTeachingSurface.showMore.content,
app/page.tsx:3789:    {activeTab==="review"&&<section className="space-y-5"><header><h1 className="text-2xl font-bold tracking-tight">Review Mistakes</h1><p className="text-sm text-stone-500">Wrong opening moves are saved here.</p></header>{mistakes.length===0?<div className="rounded-3xl bg-white p-6 text-center shadow-sm"><CheckCircle2 className="mx-auto mb-3 text-green-700" size={40}/><h2 className="text-lg font-bold">No mistakes due</h2><p className="mt-2 text-sm text-stone-500">Missed training positions will appear here.</p></div>:<div className="space-y-3">{mistakes.map(m=><button key={m.fen} onClick={()=>practiceMistake(m)} className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="font-bold">{m.opening}</div><div className="mt-1 text-sm text-stone-500">Expected: <span className="font-bold text-green-700">{m.expectedMove}</span></div><div className="text-sm text-stone-500">You played: {m.playedMove}</div></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Missed {m.count}x</span></div></button>)}</div>}</section>}
components/board/TeachingOverlay.tsx:2:import { primitivesToTeachingOverlay, type TeachingOverlayLine, type TeachingOverlaySquare } from "./visualPrimitiveRenderers";
components/board/TeachingOverlay.tsx:5:export function TeachingOverlay({
components/board/TeachingOverlay.tsx:10:  children: (overlay: { lines: TeachingOverlayLine[]; squares: TeachingOverlaySquare[] }) => ReactNode;
components/board/TeachingOverlay.tsx:12:  const overlay = primitivesToTeachingOverlay(primitives);
components/board/VisualRecipeLayer.tsx:2:import { primitivesToTeachingOverlay, type TeachingOverlayLine, type TeachingOverlaySquare } from "./visualPrimitiveRenderers";
components/board/VisualRecipeLayer.tsx:7:export function VisualRecipeLayer({
components/board/VisualRecipeLayer.tsx:14:  const overlay = primitivesToTeachingOverlay(primitives);
components/board/VisualRecipeLayer.tsx:36:export type { TeachingOverlayLine, TeachingOverlaySquare };
components/board/useVisualRecipePlayback.ts:9:import { primitivesToTeachingOverlay } from "./visualPrimitiveRenderers";
components/board/useVisualRecipePlayback.ts:42:  lines: ReturnType<typeof primitivesToTeachingOverlay>["lines"];
components/board/useVisualRecipePlayback.ts:43:  squares: ReturnType<typeof primitivesToTeachingOverlay>["squares"];
components/board/useVisualRecipePlayback.ts:206:  const overlay = useMemo(() => primitivesToTeachingOverlay(snapshot.visiblePrimitives), [snapshot.visiblePrimitives]);
components/board/visualPrimitiveRenderers.tsx:3:export type TeachingOverlayLine = {
components/board/visualPrimitiveRenderers.tsx:10:export type TeachingOverlaySquare = {
components/board/visualPrimitiveRenderers.tsx:20:export function primitiveToTeachingLine(primitive: VisualPrimitive): TeachingOverlayLine | null {
components/board/visualPrimitiveRenderers.tsx:31:export function primitiveToTeachingSquare(primitive: VisualPrimitive): TeachingOverlaySquare | null {
components/board/visualPrimitiveRenderers.tsx:45:export function primitivesToTeachingOverlay(primitives: VisualPrimitive[]): {
components/board/visualPrimitiveRenderers.tsx:46:  lines: TeachingOverlayLine[];
components/board/visualPrimitiveRenderers.tsx:47:  squares: TeachingOverlaySquare[];
components/board/visualPrimitiveRenderers.tsx:50:  const lines = primitives.map(primitiveToTeachingLine).filter((line): line is TeachingOverlayLine => Boolean(line));
components/board/visualPrimitiveRenderers.tsx:51:  const squares = primitives.map(primitiveToTeachingSquare).filter((square): square is TeachingOverlaySquare => Boolean(square));
components/coach/CoachCard.tsx:5:import type { CoachDecision, CoachButton } from "@/lib/blundr/coach/coachTypes";
components/coach/CoachCard.tsx:7:import { getBranchTransitionIntent, isBranchTransitionActionSurface, resolveCoachActionStyle } from "@/lib/blundr/presentation/coachActionStylePolicy";
components/coach/CoachCard.tsx:21:    coachIntent: getBranchTransitionIntent(decision),
components/coach/CoachCard.tsx:34:      <p className="mt-2 text-sm leading-6 text-stone-700">{decision.body ?? decision.hint ?? decision.answer ?? ""}</p>
components/debug/BlundrDiagnosticsPanel.tsx:32:expectedMoveSan: ${snapshot.frame.expectedMoveSan ?? "none"}
components/debug/BlundrDiagnosticsPanel.tsx:33:expectedMoveUci: ${snapshot.frame.expectedMoveUci ?? "none"}
components/debug/BlundrDiagnosticsPanel.tsx:37:shouldRender: ${snapshot.visual.shouldRenderVisualRecipeLayer}
components/debug/BlundrDiagnosticsPanel.tsx:49:coach:
components/debug/BlundrDiagnosticsPanel.tsx:50:owner: ${snapshot.coach.visibleCoachOwner}
components/debug/BlundrDiagnosticsPanel.tsx:51:intent: ${snapshot.coach.coachIntent ?? "none"}
components/debug/BlundrDiagnosticsPanel.tsx:52:title: ${snapshot.coach.visibleTitle ?? "none"}
components/debug/BlundrDiagnosticsPanel.tsx:53:body: ${snapshot.coach.visibleBody ?? "none"}
components/debug/BlundrDiagnosticsPanel.tsx:54:selectedOpportunity: ${snapshot.coach.selectedOpportunityId ?? "none"}
components/debug/BlundrDiagnosticsPanel.tsx:55:selectedTemplate: ${snapshot.coach.selectedTemplateId ?? "none"}
components/debug/BlundrDiagnosticsPanel.tsx:56:failureKind: ${snapshot.coach.coachFailureKind}
components/debug/BlundrDiagnosticsPanel.tsx:91:      coach: status(snapshot?.coach.coachFailureKind !== "none", false),
components/debug/BlundrDiagnosticsPanel.tsx:98:  const coachTimeline = useMemo(() => (Array.isArray(snapshot?.coachTimeline) ? snapshot.coachTimeline : []), [snapshot]);
components/debug/BlundrDiagnosticsPanel.tsx:100:    return coachTimeline.filter((entry: any) => {
components/debug/BlundrDiagnosticsPanel.tsx:111:  }, [coachTimeline, timelineFilter]);
components/debug/BlundrDiagnosticsPanel.tsx:112:  const coachQaSummary = useMemo(() => {
components/debug/BlundrDiagnosticsPanel.tsx:113:    const instructional = coachTimeline.filter((entry: any) => entry?.entryKind === "instructional");
components/debug/BlundrDiagnosticsPanel.tsx:117:      totalCoachFrames: coachTimeline.length,
components/debug/BlundrDiagnosticsPanel.tsx:119:      opponentStatusFrameCount: coachTimeline.filter((entry: any) => entry?.entryKind === "opponent_status").length,
components/debug/BlundrDiagnosticsPanel.tsx:120:      terminalOrLineCompleteFrameCount: coachTimeline.filter((entry: any) => entry?.entryKind === "terminal" || entry?.entryKind === "line_complete").length,
components/debug/BlundrDiagnosticsPanel.tsx:121:      fallbackCount: coachTimeline.filter((entry: any) => Boolean(entry?.runtimeSafeFallbackUsed)).length,
components/debug/BlundrDiagnosticsPanel.tsx:122:      lowQualityCount: coachTimeline.filter((entry: any) => Number(entry?.qualityScore ?? 0) > 0 && Number(entry?.qualityScore ?? 0) < 80).length,
components/debug/BlundrDiagnosticsPanel.tsx:123:      debugLeakCount: coachTimeline.filter((entry: any) => Boolean(entry?.containsDebugLeak)).length,
components/debug/BlundrDiagnosticsPanel.tsx:124:      repeatedGenericCount: coachTimeline.filter((entry: any) => Boolean(entry?.repeatedGeneric)).length,
components/debug/BlundrDiagnosticsPanel.tsx:125:      pieceMismatchCount: coachTimeline.filter((entry: any) => entry?.pieceAligned === false).length,
components/debug/BlundrDiagnosticsPanel.tsx:126:      targetMismatchCount: coachTimeline.filter((entry: any) => entry?.targetAligned === false).length,
components/debug/BlundrDiagnosticsPanel.tsx:128:      uniqueSelectedThemes: Array.from(new Set(coachTimeline.map((entry: any) => String(entry?.selectedTheme ?? "").trim()).filter(Boolean))),
components/debug/BlundrDiagnosticsPanel.tsx:129:      visibleBodiesInOrder: coachTimeline.map((entry: any) => entry?.visibleBody).filter(Boolean),
components/debug/BlundrDiagnosticsPanel.tsx:130:      framesWithCriticalIssues: coachTimeline.filter((entry: any) => Array.isArray(entry?.criticalIssuesAtFrame) && entry.criticalIssuesAtFrame.length > 0).map((entry: any) => ({
components/debug/BlundrDiagnosticsPanel.tsx:135:  }, [coachTimeline]);
components/debug/BlundrDiagnosticsPanel.tsx:165:            <DebugBadge label="Coach" status={statuses.coach as any} />
components/debug/BlundrDiagnosticsPanel.tsx:174:            <DebugCopyButton label="Copy FEN/Opp" getText={() => JSON.stringify({ fen4: snapshot.board.boardFen4, expectedMoveSan: snapshot.frame.expectedMoveSan, expectedMoveUci: snapshot.frame.expectedMoveUci, selectedOpportunity: snapshot.coach.selectedOpportunityId }, null, 2)} />
components/debug/BlundrDiagnosticsPanel.tsx:175:            <DebugCopyButton label="Copy Coach Timeline JSON" getText={() => JSON.stringify(coachTimeline, null, 2)} />
components/debug/BlundrDiagnosticsPanel.tsx:176:            <DebugCopyButton label="Copy Coach QA Summary" getText={() => JSON.stringify(coachQaSummary, null, 2)} />
components/debug/BlundrDiagnosticsPanel.tsx:185:          <DebugSection title="Coach"><DebugJsonViewer value={snapshot.coach} /></DebugSection>
components/debug/BlundrDiagnosticsPanel.tsx:186:          <DebugSection title="Coach Pipeline"><DebugJsonViewer value={snapshot.coachPipeline} /></DebugSection>
components/debug/BlundrDiagnosticsPanel.tsx:209:                  {`Frame ${entry?.trainerFrameId} | ${entry?.entryKind} | ${entry?.instructionTargetSan ?? entry?.instructionTargetUci ?? "—"} | ${entry?.visibleTitle ?? "—"} | score ${entry?.qualityScore ?? "n/a"} | ${entry?.coachDecisionSource ?? "n/a"}`}
components/debug/BlundrDiagnosticsPanel.tsx:214:            <div className="mt-2"><DebugJsonViewer value={snapshot.coachTimelineSummary} /></div>
lib/blundr/animation/__tests__/animationConductor.test.ts:109:      revealRequired: false,
lib/blundr/animation/__tests__/animationConductor.test.ts:267:  const revealBlocked = conductor.sync({ recipe: recipe("reveal_answer"), context: baseContext({ adapterAllowed: false }), nowMs: 3300, reducedMotionMode: "full" });
lib/blundr/animation/__tests__/animationConductor.test.ts:268:  assert.equal(revealBlocked.playbackState, "suppressed");
lib/blundr/animation/__tests__/animationEndStatePersistence.test.ts:46:      revealRequired: false,
lib/blundr/brain/analyzeBlundrPosition.ts:8: * - Target is always respected from CurrentInstructionFrame.
lib/blundr/brain/analyzeBlundrPosition.ts:120:    coachClaims: [],
lib/blundr/brain/analyzeBlundrPosition.ts:127:      note: "Production Brain v2.7.40 Agent5 - target facts + concept + evidence + safe copy (pieceType enforced from CurrentInstructionFrame.target)",
lib/blundr/brain/analyzeBlundrPosition.ts:135:// v2.7.40 Agent 5: minimal helpers for safe, non-hallucinating, piece-matched coach copy foundation
lib/blundr/brain/analyzeBlundrPosition.ts:136:// All derive strictly from CurrentInstructionFrame.target facts. No SAN in prompt/hint copy. No banned terms.
lib/blundr/brain/analyzeBlundrPosition.ts:168:      hint: "Consider development and safety.",
lib/blundr/brain/analyzeBlundrPosition.ts:186:  let hint = `Think about how the ${pieceName} supports your overall plan.`;
lib/blundr/brain/analyzeBlundrPosition.ts:191:    hint = "Look for safety improvements before opening the center.";
lib/blundr/brain/analyzeBlundrPosition.ts:195:    hint = "Consider central influence and pawn structure.";
lib/blundr/brain/analyzeBlundrPosition.ts:199:    hint = "Weigh captures carefully against development.";
lib/blundr/brain/analyzeBlundrPosition.ts:207:  const lowerBody = (body + " " + title + " " + (hint || "")).toLowerCase();
lib/blundr/brain/analyzeBlundrPosition.ts:212:  // Controlled variation note: in full would use coachVariationPolicy + memory; here deterministic safe per target facts (no repetition within frame)
lib/blundr/brain/analyzeBlundrPosition.ts:216:    hint,
lib/blundr/brain/analyzeBlundrPosition.ts:217:    pieceType: target.pieceType, // enforced match to CurrentInstructionFrame.target
lib/blundr/brain/buildEvidenceGraph.ts:1:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/brain/buildEvidenceGraph.ts:29:  frame: CurrentInstructionFrame;
lib/blundr/brain/buildEvidenceGraph.ts:64:  frame: CurrentInstructionFrame;
lib/blundr/brain/buildEvidenceGraph.ts:70:  expectedMoveReason?: string;
lib/blundr/brain/buildEvidenceGraph.ts:86:    expectedMoveReason: input.expectedMoveReason,
lib/blundr/brain/hints/buildHintLadder.ts:3: * Single source for non-answer-leaking, progressive hints in Plain View.
lib/blundr/brain/hints/buildHintLadder.ts:6: * - Only called/used before showMoreShown for Plain teaching frames.
lib/blundr/brain/hints/buildHintLadder.ts:11: * - leaksAnswer=false for all pre-showMore.
lib/blundr/brain/hints/buildHintLadder.ts:12: * - Reset via hintCount reset on new instruction frame (upstream).
lib/blundr/brain/hints/buildHintLadder.ts:13: * - Never leaks target move before showMoreShown.
lib/blundr/brain/hints/buildHintLadder.ts:24:  hintCount: number;
lib/blundr/brain/hints/buildHintLadder.ts:26:  showMoreShown: boolean;
lib/blundr/brain/hints/buildHintLadder.ts:38:  hintIndex: number;
lib/blundr/brain/hints/buildHintLadder.ts:40:  hints: HintLevel[];
lib/blundr/brain/hints/buildHintLadder.ts:44: * Build progressive 3-rung hint ladder + select current based on hintCount.
lib/blundr/brain/hints/buildHintLadder.ts:51:    hintCount = 0,
lib/blundr/brain/hints/buildHintLadder.ts:52:    showMoreShown = false,
lib/blundr/brain/hints/buildHintLadder.ts:58:  if (!target || showMoreShown) {
lib/blundr/brain/hints/buildHintLadder.ts:61:      hintIndex: 0,
lib/blundr/brain/hints/buildHintLadder.ts:63:      hints: [],
lib/blundr/brain/hints/buildHintLadder.ts:88:    if (brainAnalysis.coachClaims && Array.isArray(brainAnalysis.coachClaims) && brainAnalysis.coachClaims.length > 0) {
lib/blundr/brain/hints/buildHintLadder.ts:89:      evidenceIds.push("brain_coach_claims");
lib/blundr/brain/hints/buildHintLadder.ts:140:  const hints: HintLevel[] = [
lib/blundr/brain/hints/buildHintLadder.ts:161:  // Progressive selection: hintCount 0 = no hint yet (current null)
lib/blundr/brain/hints/buildHintLadder.ts:162:  // count=1 shows level 0 (first hint), count=2 level1, count>=3 level2
lib/blundr/brain/hints/buildHintLadder.ts:163:  const effectiveCount = Math.max(0, Math.floor(hintCount || 0));
lib/blundr/brain/hints/buildHintLadder.ts:164:  const hintIndex = effectiveCount > 0 ? Math.min(effectiveCount - 1, maxHints - 1) : 0;
lib/blundr/brain/hints/buildHintLadder.ts:165:  const currentHint = effectiveCount > 0 && !showMoreShown ? hints[hintIndex].text : null;
lib/blundr/brain/hints/buildHintLadder.ts:169:    hintIndex,
lib/blundr/brain/hints/buildHintLadder.ts:171:    hints,
lib/blundr/brain/index.ts:2:// Per Coach-First Roadmap v2.0 — the future single source of coach intelligence.
lib/blundr/brain/index.ts:6:export { buildHintLadder, type HintLadderInput, type HintLadderOutput, type HintLevel } from "./hints/buildHintLadder"; // v2.7.40 Agent 4
lib/blundr/brain/providers/boardTruthProvider.ts:2:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/boardTruthProvider.ts:26:export function buildBoardTruth(input: { frame: CurrentInstructionFrame }): BoardTruth {
lib/blundr/brain/providers/moveSemanticsProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/moveSemanticsProvider.ts:16:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/moveSemanticsProvider.ts:56:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/openingContextProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/openingContextProvider.ts:5:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/openingContextProvider.ts:11:  expectedMoveReason?: string;
lib/blundr/brain/providers/openingContextProvider.ts:23:    expectedMoveReason: input.expectedMoveReason ?? null,
lib/blundr/brain/providers/strategicFeatureProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/strategicFeatureProvider.ts:5:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/strategicFeatureProvider.ts:35:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/tacticalMotifProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/tacticalMotifProvider.ts:5:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/tacticalMotifProvider.ts:33:  frame: CurrentInstructionFrame;
lib/blundr/brain/providers/visualEvidenceProvider.ts:1:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/brain/providers/visualEvidenceProvider.ts:5:  frame: CurrentInstructionFrame,
lib/blundr/brain/providers/visualEvidenceProvider.ts:33:  frame: CurrentInstructionFrame;
lib/blundr/brain/types.ts:6:import type { CurrentInstructionTarget, CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/brain/types.ts:140:  expectedMoveReason: string | null;
lib/blundr/brain/types.ts:153:  currentInstructionFrame: CurrentInstructionFrame | null;
lib/blundr/brain/types.ts:227:  // v2.7.40 Agent 5: minimal Brain foundation for coach intelligence chain
lib/blundr/brain/types.ts:228:  // CurrentInstructionFrame.target is source; these derive strictly from it + basic facts (no halluc)
lib/blundr/brain/types.ts:234:    hint?: string;
lib/blundr/brain/types.ts:245:  coachClaims: CoachClaim[];
lib/blundr/cache/explanationCache.ts:2:import { createCoachCache } from "./coachCacheTypes";
lib/blundr/cache/featureCache.ts:3:import { createCoachCache } from "./coachCacheTypes";
lib/blundr/cache/opportunityCache.ts:2:import { createCoachCache } from "./coachCacheTypes";
lib/blundr/cache/opportunityCache.ts:8:export function opportunityCacheKey(input: { fen: string; expectedMoveUci?: string; trainerView: string; interaction: string; trainingMode: string; visualRecipeId?: string; ratingBucket?: string; memorySignature?: string }): string {
lib/blundr/cache/opportunityCache.ts:9:  return [normalizedFenCacheKey(input.fen), input.expectedMoveUci ?? "", input.trainerView, input.interaction, input.trainingMode, input.visualRecipeId ?? "", input.ratingBucket ?? "intermediate", input.memorySignature ?? ""].join("|");
lib/blundr/cache/planCache.ts:3:import { createCoachCache } from "./coachCacheTypes";
lib/blundr/cache/planCache.ts:9:export function planCacheKey(input: { fen: string; expectedMoveUci?: string; openingId?: string; conceptId?: string; trainerMode?: string }): string {
lib/blundr/cache/planCache.ts:10:  return [normalizedFenCacheKey(input.fen), input.expectedMoveUci ?? "", input.openingId ?? "", input.conceptId ?? "", input.trainerMode ?? ""].join("|");
lib/blundr/cache/planCache.ts:14:  const key = planCacheKey({ fen: input.fen, expectedMoveUci: input.moveUci, openingId: input.openingId, conceptId: input.conceptId });
lib/blundr/coach/__tests__/coachCardPresenter.test.ts:2:import { presentCoachCard } from "../coachCardPresenter";
lib/blundr/coach/__tests__/coachContextBuilder.test.ts:2:import { buildCoachContext } from "../coachContextBuilder";
lib/blundr/coach/__tests__/coachContextBuilder.test.ts:9:    revealState: "hidden",
lib/blundr/coach/__tests__/coachContextBuilder.test.ts:30:    hintUsed: false,
lib/blundr/coach/__tests__/coachContextBuilder.test.ts:46:    revealState: "hidden",
lib/blundr/coach/__tests__/coachContextBuilder.test.ts:53:    hintUsed: false,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:2:import { decideCoachOutput } from "../coachDecisionEngine";
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:10:    revealState: "hidden",
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:26:    hintUsed: false,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:48:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:58:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:63:  assert.equal(plain.buttons.includes("hint"), true);
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:68:    interaction: "hint",
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:70:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:73:  assert.equal(softHint.action, "show_soft_hint");
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:78:    interaction: "hint",
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:80:    hintRequestCount: 1,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:83:  assert.equal(strongHint.action, "show_strong_hint");
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:87:    context: baseContext({ viewMode: "plain", revealState: "revealed", answerShown: true, exactMoveAllowed: true }),
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:90:    hintRequestCount: 1,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:100:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:109:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:118:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:127:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:132:  const revealBlocked = decideCoachOutput({
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:133:    context: baseContext({ viewMode: "plain", revealState: "hidden", answerShown: false, exactMoveAllowed: false }),
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:136:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:139:  assert.equal(revealBlocked.mode, "suppressed");
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:145:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachDecisionEngine.test.ts:154:    hintRequestCount: 0,
lib/blundr/coach/__tests__/coachHintEngine.test.ts:2:import { chooseHintLevel } from "../coachHintEngine";
lib/blundr/coach/__tests__/coachHintEngine.test.ts:6:    revealState: "hidden",
lib/blundr/coach/__tests__/coachHintEngine.test.ts:8:    hintUsed: false,
lib/blundr/coach/__tests__/coachHintEngine.test.ts:16:  assert.equal(chooseHintLevel(ctx(), 0), "soft_hint");
lib/blundr/coach/__tests__/coachHintEngine.test.ts:17:  assert.equal(chooseHintLevel(ctx({ wrongAttempts: 1 }), 0), "strong_hint");
lib/blundr/coach/__tests__/coachHintEngine.test.ts:18:  assert.equal(chooseHintLevel(ctx({ hintUsed: true }), 2), "strong_hint");
lib/blundr/coach/__tests__/coachSafety.test.ts:2:import { validateCoachCopyEntry, validateCoachDecision } from "../coachSafety";
lib/blundr/coach/__tests__/coachSafety.test.ts:13:    revealRisk: "low",
lib/blundr/coach/__tests__/coachSafety.test.ts:27:    revealRisk: "low",
lib/blundr/coach/__tests__/coachSafety.test.ts:36:      revealState: "hidden",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:3:import { buildCoachUtteranceRecordKey, parseCoachUtteranceMemory } from "../coachUtteranceMemory";
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:10:    coachMode: "assisted_teach",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:11:    coachAction: "show_explanation",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:18:    coachMode: "assisted_teach",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:19:    coachAction: "show_explanation",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:28:    coachMode: "assisted_teach",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:29:    coachAction: "show_explanation",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:40:        coachMode: "assisted_teach",
lib/blundr/coach/__tests__/coachUtteranceMemory.test.ts:41:        coachAction: "show_explanation",
lib/blundr/coach/__tests__/coachVariationPolicy.test.ts:2:import { selectCoachCopyVariant } from "../coachVariationPolicy";
lib/blundr/coach/__tests__/genericDominancePolicy.test.ts:3:import { canMakeCenterTensionDominant, canMakeKingSafetyDominant } from "../../coachBrain/boardClaimValidator";
lib/blundr/coach/__tests__/genericDominancePolicy.test.ts:4:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/coach/__tests__/genericDominancePolicy.test.ts:13:    expectedMoveUci: "c2c3",
lib/blundr/coach/__tests__/genericDominancePolicy.test.ts:14:    expectedMoveSan: "c3",
lib/blundr/coach/__tests__/intentFirstCoachEngine.test.ts:3:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/coach/__tests__/intentFirstCoachEngine.test.ts:13:    expectedMoveUci: "f1c4",
lib/blundr/coach/__tests__/intentFirstCoachEngine.test.ts:14:    expectedMoveSan: "Bc4",
lib/blundr/coach/__tests__/teachingIntent.test.ts:3:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/coach/__tests__/teachingIntent.test.ts:13:    expectedMoveUci: "f1c4",
lib/blundr/coach/__tests__/teachingIntent.test.ts:14:    expectedMoveSan: "Bc4",
lib/blundr/coach/__tests__/teachingIntent.test.ts:17:  assert.equal(resolveCoachTeachingIntent({ packet: { ...packet, viewMode: "plain" }, interaction: "hint", hasVisualRecipe: false }), "recall_hint");
lib/blundr/coach/coachCardPresenter.ts:1:import type { CoachButton, CoachDecision } from "./coachTypes";
lib/blundr/coach/coachCardPresenter.ts:14:    body: decision.body ?? decision.hint ?? decision.answer ?? "",
lib/blundr/coach/coachContextBuilder.ts:2:import type { CoachContext, CoachContextInput } from "./coachTypes";
lib/blundr/coach/coachContextBuilder.ts:23:        (input.viewMode === "assisted" || input.revealState === "revealed" || input.answerShown),
lib/blundr/coach/coachContextBuilder.ts:31:        revealState: input.revealState,
lib/blundr/coach/coachContextBuilder.ts:47:        hintUsed: input.hintUsed,
lib/blundr/coach/coachContextBuilder.ts:78:      (input.viewMode === "assisted" || input.revealState === "revealed" || input.answerShown),
lib/blundr/coach/coachContextBuilder.ts:87:      revealState: input.revealState,
lib/blundr/coach/coachContextBuilder.ts:103:      hintUsed: input.hintUsed,
lib/blundr/coach/coachCopyLibrary.ts:1:import type { CoachCopyEntry, CoachMode } from "./coachTypes";
lib/blundr/coach/coachCopyLibrary.ts:8:  e({ utteranceId: "dwp_a1", utteranceFamily: "dwp_assist", conceptId: "develop_with_pressure", title: "Develop with pressure", text: "The bishop develops and pressures f7.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["bishop", "f7", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:9:  e({ utteranceId: "dwp_a2", utteranceFamily: "dwp_assist", conceptId: "develop_with_pressure", title: "Develop with pressure", text: "White develops while creating a concrete target on f7.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["development", "target", "f7"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:10:  e({ utteranceId: "dwp_p1", utteranceFamily: "dwp_prompt", conceptId: "develop_with_pressure", text: "Look for a developing move that creates pressure.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:11:  e({ utteranceId: "dwp_hs1", utteranceFamily: "dwp_hint", conceptId: "develop_with_pressure", text: "Think about which move develops while creating pressure.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:12:  e({ utteranceId: "dwp_hg1", utteranceFamily: "dwp_hint", conceptId: "develop_with_pressure", text: "The key target is f7, and a bishop can pressure it.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["f7", "bishop", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:13:  e({ utteranceId: "dwp_ans1", utteranceFamily: "dwp_answer", conceptId: "develop_with_pressure", text: "Play Bc4. The bishop develops and pressures f7.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["bishop", "f7", "pressure"], claimTypes: ["engine_safe_recommendation", "opening_pattern"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:14:  e({ utteranceId: "dwp_r1", utteranceFamily: "dwp_reinforce", conceptId: "develop_with_pressure", text: "Good. You developed with pressure, not just development.", allowedModes: ["assisted_reinforce", "correct_fast", "correct_slow"], requiredConcreteObjects: ["development", "pressure"], claimTypes: ["opening_pattern"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:15:  e({ utteranceId: "dwp_w1", utteranceFamily: "dwp_why", conceptId: "develop_with_pressure", text: "Good opening moves often develop a piece while creating a concrete target.", allowedModes: ["assisted_teach", "assisted_wrong_move"], requiredConcreteObjects: ["development", "target"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:17:  e({ utteranceId: "cfs_a1", utteranceFamily: "castle_assist", conceptId: "castle_for_safety", text: "The king moves to safety before the center opens.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:18:  e({ utteranceId: "cfs_p1", utteranceFamily: "castle_prompt", conceptId: "castle_for_safety", text: "Ask whether the king should stay in the center much longer.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["king", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:19:  e({ utteranceId: "cfs_h1", utteranceFamily: "castle_hint", conceptId: "castle_for_safety", text: "Think about king safety before the center opens.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["king safety", "center"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:20:  e({ utteranceId: "cfs_h2", utteranceFamily: "castle_hint", conceptId: "castle_for_safety", text: "This is the moment to move the king to safety.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["king", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:21:  e({ utteranceId: "cfs_ans1", utteranceFamily: "castle_answer", conceptId: "castle_for_safety", text: "Castle kingside. The king moves to safety before the center opens.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["engine_safe_recommendation"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:22:  e({ utteranceId: "cfs_r1", utteranceFamily: "castle_reinforce", conceptId: "castle_for_safety", text: "Good. The king is safer before the center opens.", allowedModes: ["assisted_reinforce", "correct_fast", "correct_slow"], requiredConcreteObjects: ["king", "center", "king safety"], claimTypes: ["opening_pattern"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:23:  e({ utteranceId: "cfs_w1", utteranceFamily: "castle_why", conceptId: "castle_for_safety", text: "Castling moves the king away from the center and connects the rook.", allowedModes: ["assisted_teach", "assisted_wrong_move"], requiredConcreteObjects: ["king", "center", "rook"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:25:  e({ utteranceId: "pcb_a1", utteranceFamily: "c3_assist", conceptId: "prepare_center_break", text: "c3 supports a later d4 break and helps White build the center.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["pawn", "d4", "center", "pawn break"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:26:  e({ utteranceId: "pcb_p1", utteranceFamily: "c3_prompt", conceptId: "prepare_center_break", text: "Look for White’s quiet center-building move.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:27:  e({ utteranceId: "pcb_h1", utteranceFamily: "c3_hint", conceptId: "prepare_center_break", text: "Think about preparing d4 before playing it.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["d4", "pawn break"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:28:  e({ utteranceId: "pcb_h2", utteranceFamily: "c3_hint", conceptId: "prepare_center_break", text: "The c-pawn can help White prepare d4.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["pawn", "d4"], claimTypes: ["opening_pattern"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:29:  e({ utteranceId: "pcb_ans1", utteranceFamily: "c3_answer", conceptId: "prepare_center_break", text: "Play c3. It supports a later d4 break.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["pawn", "d4", "pawn break"], claimTypes: ["engine_safe_recommendation", "opening_pattern"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:31:  e({ utteranceId: "rtc_a1", utteranceFamily: "re1_assist", conceptId: "rook_to_center", text: "The rook moves toward the center so it can support White’s central plan.", allowedModes: ["assisted_teach"], requiredConcreteObjects: ["rook", "center", "central plan"], claimTypes: ["opening_pattern"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:32:  e({ utteranceId: "rtc_p1", utteranceFamily: "re1_prompt", conceptId: "rook_to_center", text: "Look for a quiet move that improves central support.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center", "central plan"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:33:  e({ utteranceId: "rtc_h1", utteranceFamily: "re1_hint", conceptId: "rook_to_center", text: "The rook can move onto the e-file to support the center.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["rook", "e-file", "center"], claimTypes: ["plan_principle"], revealRisk: "medium", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:34:  e({ utteranceId: "rtc_ans1", utteranceFamily: "re1_answer", conceptId: "rook_to_center", text: "Play Re1. The rook moves toward the center so it can support White’s central plan.", allowedModes: ["plain_answer_revealed", "supported_continuation"], requiredConcreteObjects: ["rook", "center", "central plan"], claimTypes: ["engine_safe_recommendation"], revealRisk: "full_answer", givesAnswer: true, requiresAnswerPermission: true }),
lib/blundr/coach/coachCopyLibrary.ts:36:  e({ utteranceId: "ct_a1", utteranceFamily: "center_assist", conceptId: "center_tension", text: "The fight in the center decides which pieces become active.", allowedModes: ["assisted_teach", "freeplay_principle"], requiredConcreteObjects: ["center", "piece activity"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:37:  e({ utteranceId: "ct_p1", utteranceFamily: "center_prompt", conceptId: "center_tension", text: "Study the center before choosing a move.", allowedModes: ["plain_prompt"], requiredConcreteObjects: ["center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:38:  e({ utteranceId: "ct_h1", utteranceFamily: "center_hint", conceptId: "center_tension", text: "Look at how the central pawns affect piece activity.", allowedModes: ["plain_hint", "plain_wrong_move"], requiredConcreteObjects: ["pawn", "center", "piece activity"], claimTypes: ["plan_principle"], revealRisk: "low", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:40:  e({ utteranceId: "ks_p1", utteranceFamily: "ks", conceptId: "king_safety", text: "Before the center opens, the king’s safety matters more than grabbing space.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["king safety", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:41:  e({ utteranceId: "dev_p1", utteranceFamily: "dev", conceptId: "development", text: "Improve the piece that has not joined the game yet.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["development", "least active piece"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachCopyLibrary.ts:42:  e({ utteranceId: "ofr_p1", utteranceFamily: "open_file", conceptId: "open_file_rook", text: "A rook becomes more useful when it supports an open or central file.", allowedModes: ["freeplay_principle", "supported_continuation"], requiredConcreteObjects: ["rook", "open file", "center"], claimTypes: ["plan_principle"], revealRisk: "none", givesAnswer: false, requiresAnswerPermission: false }),
lib/blundr/coach/coachDebug.ts:1:import type { CoachContext, CoachDecision } from "./coachTypes";
lib/blundr/coach/coachDebug.ts:5:    coachMode: decision.mode,
lib/blundr/coach/coachDebug.ts:6:    coachAction: decision.action,
lib/blundr/coach/coachDebug.ts:7:    coachUtteranceId: decision.utteranceId,
lib/blundr/coach/coachDebug.ts:8:    coachUtteranceFamily: decision.utteranceFamily,
lib/blundr/coach/coachDebug.ts:9:    coachVariationReason: decision.debug?.coachVariationReason,
lib/blundr/coach/coachDebug.ts:10:    coachHintStrength: decision.debug?.coachHintStrength,
lib/blundr/coach/coachDebug.ts:11:    coachRevealRisk: decision.revealRisk,
lib/blundr/coach/coachDebug.ts:12:    coachGivesAnswer: decision.givesAnswer,
lib/blundr/coach/coachDebug.ts:13:    coachButtons: decision.buttons,
lib/blundr/coach/coachDebug.ts:14:    coachShouldMarkReviewWorthy: decision.shouldMarkReviewWorthy,
lib/blundr/coach/coachDebug.ts:15:    coachSuppressedReason: decision.suppressedReason,
lib/blundr/coach/coachDebug.ts:16:    coachFrameMatchesBoard: context?.recipeFrameMatchesBoard ?? false,
lib/blundr/coach/coachDebug.ts:17:    coachFenMatchesBoard: context?.recipeFenMatchesBoard ?? false,
lib/blundr/coach/coachDebug.ts:19:    coachSafetyWarnings: decision.debug?.coachSafetyWarnings ?? [],
lib/blundr/coach/coachDecisionEngine.ts:1:import { getCoachCopyEntries, normalizeConceptId } from "./coachCopyLibrary";
lib/blundr/coach/coachDecisionEngine.ts:2:import { chooseHintLevel } from "./coachHintEngine";
lib/blundr/coach/coachDecisionEngine.ts:3:import { validateCoachDecision } from "./coachSafety";
lib/blundr/coach/coachDecisionEngine.ts:4:import type { CoachAction, CoachButton, CoachContext, CoachDecision, CoachDecisionInput, CoachMode } from "./coachTypes";
lib/blundr/coach/coachDecisionEngine.ts:5:import { selectCoachCopyVariant } from "./coachVariationPolicy";
lib/blundr/coach/coachDecisionEngine.ts:6:import { buildCoachEvidencePacket } from "../coachBrain/coachEvidenceBuilder";
lib/blundr/coach/coachDecisionEngine.ts:7:import { buildCoachCopyFromEvidence } from "../coachBrain/evidenceConditionedCopyBuilder";
lib/blundr/coach/coachDecisionEngine.ts:8:import { resolveCoachAction } from "../coachBrain/coachActionResolver";
lib/blundr/coach/coachDecisionEngine.ts:18:    revealRisk: "none",
lib/blundr/coach/coachDecisionEngine.ts:37:  if (context.answerShown || context.revealState === "revealed") return "plain_answer_revealed";
lib/blundr/coach/coachDecisionEngine.ts:42:function deriveAction(context: CoachContext, mode: CoachMode, input: CoachDecisionInput): { action: CoachAction; hintStrength?: string } {
lib/blundr/coach/coachDecisionEngine.ts:45:  if (input.interaction === "hint") {
lib/blundr/coach/coachDecisionEngine.ts:46:    const level = chooseHintLevel(context, input.hintRequestCount);
lib/blundr/coach/coachDecisionEngine.ts:47:    if (level === "soft_hint") return { action: "show_soft_hint", hintStrength: level };
lib/blundr/coach/coachDecisionEngine.ts:48:    if (level === "strong_hint") return { action: "show_strong_hint", hintStrength: level };
lib/blundr/coach/coachDecisionEngine.ts:49:    return { action: "show_answer", hintStrength: level };
lib/blundr/coach/coachDecisionEngine.ts:62:    return []; // assisted teaching: NO buttons per clean policy (visuals + coach text only)
lib/blundr/coach/coachDecisionEngine.ts:66:    return ["continue_from_here"];
lib/blundr/coach/coachDecisionEngine.ts:68:  if (mode === "plain_prompt" || mode === "plain_hint" || mode === "plain_wrong_move" || mode === "plain_answer_revealed") {
lib/blundr/coach/coachDecisionEngine.ts:69:    // Plain teaching pre-ShowMore / pre-answer: ONLY hint + show_more (Show More introduced as first-class; full wiring Agent 4)
lib/blundr/coach/coachDecisionEngine.ts:70:    if (context.answerShown || context.revealState === "revealed") {
lib/blundr/coach/coachDecisionEngine.ts:73:    return ["hint", "show_more"] as unknown as CoachButton[]; // cast transitional until CoachButton union updated
lib/blundr/coach/coachDecisionEngine.ts:84:      : action === "show_soft_hint" || action === "show_strong_hint"
lib/blundr/coach/coachDecisionEngine.ts:85:        ? "plain_hint"
lib/blundr/coach/coachDecisionEngine.ts:87:          ? "plain_answer_revealed"
lib/blundr/coach/coachDecisionEngine.ts:105:  const { action, hintStrength } = deriveAction(context, mode, input);
lib/blundr/coach/coachDecisionEngine.ts:110:    context.revealState === "hidden" &&
lib/blundr/coach/coachDecisionEngine.ts:123:    viewMode: input.brainInput?.viewMode ?? (context.viewMode === "reveal" ? "assisted" : context.viewMode),
lib/blundr/coach/coachDecisionEngine.ts:129:    expectedMoveUci: input.brainInput?.expectedMoveUci ?? context.moveUci,
lib/blundr/coach/coachDecisionEngine.ts:130:    expectedMoveSan: input.brainInput?.expectedMoveSan ?? context.moveSan,
lib/blundr/coach/coachDecisionEngine.ts:151:    previousHintLevel: input.hintRequestCount,
lib/blundr/coach/coachDecisionEngine.ts:164:      revealRisk: entry.revealRisk,
lib/blundr/coach/coachDecisionEngine.ts:186:      (action === "show_soft_hint" || action === "show_strong_hint" ? (preferFallbackCopy ? fallback?.body : evidenceCopy.hint) : undefined) ??
lib/blundr/coach/coachDecisionEngine.ts:189:    hint: action === "show_soft_hint" || action === "show_strong_hint" ? (preferFallbackCopy ? fallback?.body : evidenceCopy.hint) : undefined,
lib/blundr/coach/coachDecisionEngine.ts:204:    revealRisk: preferIntentFirstCopy ? (intentFirst.revealRisk === "high" ? "full_answer" : intentFirst.revealRisk) : preferFallbackCopy ? (fallback?.revealRisk ?? "low") : (evidenceCopy.givesAnswer ? "full_answer" : "low"),
lib/blundr/coach/coachDecisionEngine.ts:213:      coachVariationReason: fallback?.debugReason,
lib/blundr/coach/coachDecisionEngine.ts:214:      coachHintStrength: hintStrength ?? (input.interaction === "hint" ? "adaptive" : "none"),
lib/blundr/coach/coachDecisionEngine.ts:215:      reviewReason: intentFirst.reviewWorthy ? "intent_first_review_worthy" : evidenceCopy.reviewReason ?? (evidenceCopy.shouldMarkReviewWorthy ? "hint_answer_wrong_or_slow" : "none"),
lib/blundr/coach/coachDecisionEngine.ts:217:      coachIntent: intentFirst.intent,
lib/blundr/coach/coachDecisionEngine.ts:218:      coachEvidenceStatus: packet.evidenceStatus,
lib/blundr/coach/coachDecisionEngine.ts:219:      coachEvidenceStale: packet.stale,
lib/blundr/coach/coachDecisionEngine.ts:220:      coachSelectedCandidateMove: packet.selectedCandidateMoveSan ?? packet.selectedCandidateMoveUci ?? "none",
lib/blundr/coach/coachDecisionEngine.ts:221:      coachExactMoveAllowed: packet.exactMoveAllowed,
lib/blundr/coach/coachDecisionEngine.ts:222:      coachAllowedClaims: packet.allowedClaims,
lib/blundr/coach/coachDecisionEngine.ts:223:      coachBlockedClaims: packet.blockedClaims,
lib/blundr/coach/coachDecisionEngine.ts:224:      coachMoveFacts: packet.moveFacts,
lib/blundr/coach/coachDecisionEngine.ts:225:      coachBoardFactsSummary: packet.boardFacts,
lib/blundr/coach/coachDecisionEngine.ts:226:      coachEngineStatus: packet.engineSupport.status,
lib/blundr/coach/coachDecisionEngine.ts:227:      coachEngineBestMove: packet.engineSupport.bestMoveSan ?? packet.engineSupport.bestMoveUci,
lib/blundr/coach/coachDecisionEngine.ts:228:      coachEngineSafeMoves: packet.engineSupport.safeMoveUcis,
lib/blundr/coach/coachDecisionEngine.ts:229:      coachMaiaStatus: packet.maiaSupport.status,
lib/blundr/coach/coachDecisionEngine.ts:230:      coachRepertoireSupport: packet.repertoireSupport,
lib/blundr/coach/coachDecisionEngine.ts:231:      coachInteraction: input.interaction,
lib/blundr/coach/coachDecisionEngine.ts:232:      coachCopySource: preferIntentFirstCopy ? "intent_first" : evidenceCopy.copySource,
lib/blundr/coach/coachDecisionEngine.ts:233:      coachSuppressedReason: evidenceCopy.suppressedReason,
lib/blundr/coach/coachDecisionEngine.ts:234:      expectedMoveSource: input.brainInput?.expectedMoveSource,
lib/blundr/coach/coachDecisionEngine.ts:235:      expectedMoveCoverageTier: input.brainInput?.expectedMoveCoverageTier,
lib/blundr/coach/coachDecisionEngine.ts:236:      expectedMoveResolutionReason: input.brainInput?.expectedMoveResolutionReason,
lib/blundr/coach/coachDecisionEngine.ts:240:  if (mode === "plain_answer_revealed" && action === "show_answer" && context.moveSan) {
lib/blundr/coach/coachDecisionEngine.ts:241:    decision.title = "Revealed move";
lib/blundr/coach/coachDecisionEngine.ts:242:    decision.body = `The revealed move is ${context.moveSan}. Use this exact move to continue the plan.`;
lib/blundr/coach/coachDecisionEngine.ts:246:    decision.revealRisk = "full_answer";
lib/blundr/coach/coachDecisionEngine.ts:247:    decision.utteranceFamily = "revealed_move";
lib/blundr/coach/coachDecisionEngine.ts:250:      coachIntent: "reveal_answer",
lib/blundr/coach/coachDecisionEngine.ts:251:      revealedMoveFallbackUsed: true,
lib/blundr/coach/coachDecisionEngine.ts:252:      coachSelectedCandidateMove: context.moveSan,
lib/blundr/coach/coachDecisionEngine.ts:259:      ...quiet("safety_blocked", { coachSafetyWarnings: safety.warnings, blockedClaims: packet.blockedClaims }),
lib/blundr/coach/coachDecisionEngine.ts:270:      coachSafetyWarnings: safety.warnings,
lib/blundr/coach/coachHintEngine.ts:1:import type { CoachContext } from "./coachTypes";
lib/blundr/coach/coachHintEngine.ts:3:export type HintLevel = "soft_hint" | "strong_hint" | "answer";
lib/blundr/coach/coachHintEngine.ts:5:export function chooseHintLevel(context: CoachContext, hintRequestCount: number): HintLevel {
lib/blundr/coach/coachHintEngine.ts:6:  if (context.answerShown || context.revealState === "revealed") return "answer";
lib/blundr/coach/coachHintEngine.ts:7:  if (context.wrongAttempts >= 1) return "strong_hint";
lib/blundr/coach/coachHintEngine.ts:8:  if (context.hintUsed) return "strong_hint";
lib/blundr/coach/coachHintEngine.ts:9:  if (hintRequestCount >= 2) return "strong_hint";
lib/blundr/coach/coachHintEngine.ts:10:  if (context.elapsedMs >= 30000) return "strong_hint";
lib/blundr/coach/coachHintEngine.ts:11:  return "soft_hint";
lib/blundr/coach/coachSafety.ts:1:import type { CoachContext, CoachCopyEntry, CoachDecision } from "./coachTypes";
lib/blundr/coach/coachSafety.ts:84:  const text = `${decision.title ?? ""} ${decision.body ?? ""} ${decision.hint ?? ""} ${decision.answer ?? ""} ${decision.why ?? ""}`.trim();
lib/blundr/coach/coachSafety.ts:89:  if (context.viewMode === "plain" && context.revealState === "hidden" && decision.givesAnswer && !context.answerShown) {
lib/blundr/coach/coachSafety.ts:102:  if ((decision.body || decision.hint || decision.answer) && !hasRequiredObject(text)) {
lib/blundr/coach/coachTypes.ts:1:export type CoachViewMode = "assisted" | "plain" | "reveal" | "freeplay";
lib/blundr/coach/coachTypes.ts:8:  | "plain_hint"
lib/blundr/coach/coachTypes.ts:10:  | "plain_answer_revealed"
lib/blundr/coach/coachTypes.ts:20:  | "show_soft_hint"
lib/blundr/coach/coachTypes.ts:21:  | "show_strong_hint"
lib/blundr/coach/coachTypes.ts:28:  | "hint"
lib/blundr/coach/coachTypes.ts:37:  | "continue_from_here"
lib/blundr/coach/coachTypes.ts:41:export type CoachRevealRisk = "none" | "low" | "medium" | "full_answer";
lib/blundr/coach/coachTypes.ts:57:  revealState: "hidden" | "revealed";
lib/blundr/coach/coachTypes.ts:73:  hintUsed: boolean;
lib/blundr/coach/coachTypes.ts:85:  source: "visual_recipe" | "training_context" | "live_coach" | "none";
lib/blundr/coach/coachTypes.ts:95:  hint?: string;
lib/blundr/coach/coachTypes.ts:102:  revealRisk: CoachRevealRisk;
lib/blundr/coach/coachTypes.ts:121:  revealRisk: CoachRevealRisk;
lib/blundr/coach/coachTypes.ts:130:  coachMode: CoachMode;
lib/blundr/coach/coachTypes.ts:131:  coachAction: CoachAction;
lib/blundr/coach/coachTypes.ts:142:  revealState: "hidden" | "revealed";
lib/blundr/coach/coachTypes.ts:169:  hintUsed: boolean;
lib/blundr/coach/coachTypes.ts:180:  interaction: "none" | "hint" | "answer" | "why" | "hide" | "show_plan" | "analyze_idea" | "show_move";
lib/blundr/coach/coachTypes.ts:182:  hintRequestCount: number;
lib/blundr/coach/coachTypes.ts:190:    expectedMoveUci?: string;
lib/blundr/coach/coachTypes.ts:191:    expectedMoveSan?: string;
lib/blundr/coach/coachTypes.ts:202:    expectedMoveSource?: string;
lib/blundr/coach/coachTypes.ts:203:    expectedMoveCoverageTier?: string;
lib/blundr/coach/coachTypes.ts:204:    expectedMoveResolutionReason?: string;
lib/blundr/coach/coachUtteranceMemory.ts:1:import type { CoachUtteranceMemoryEntry } from "./coachTypes";
lib/blundr/coach/coachUtteranceMemory.ts:3:export const COACH_UTTERANCE_MEMORY_KEY = "blundr.coachUtteranceMemory.v1";
lib/blundr/coach/coachUtteranceMemory.ts:4:export const COACH_UTTERANCE_MEMORY_META_KEY = "blundr.coachUtteranceMemory.meta.v2";
lib/blundr/coach/coachUtteranceMemory.ts:17:  coachMode?: string;
lib/blundr/coach/coachUtteranceMemory.ts:18:  coachAction?: string;
lib/blundr/coach/coachUtteranceMemory.ts:25:    input.coachMode ?? "",
lib/blundr/coach/coachUtteranceMemory.ts:26:    input.coachAction ?? "",
lib/blundr/coach/coachUtteranceMemory.ts:40:        if (!candidate.patternId || !candidate.utteranceId || !candidate.coachMode || !candidate.coachAction) return null;
lib/blundr/coach/coachUtteranceMemory.ts:45:          coachMode: candidate.coachMode,
lib/blundr/coach/coachUtteranceMemory.ts:46:          coachAction: candidate.coachAction,
lib/blundr/coach/coachVariationPolicy.ts:1:import type { CoachCopyEntry, CoachUtteranceMemoryEntry } from "./coachTypes";
lib/blundr/coach/intentFirstCoachEngine.ts:1:import type { CoachButton } from "./coachTypes";
lib/blundr/coach/intentFirstCoachEngine.ts:3:import type { CoachEvidencePacket, CoachInteraction } from "../coachBrain/coachEvidenceTypes";
lib/blundr/coach/intentFirstCoachEngine.ts:21:  revealRisk: "none" | "low" | "medium" | "high";
lib/blundr/coach/intentFirstCoachEngine.ts:53:        revealRisk: "none",
lib/blundr/coach/intentFirstCoachEngine.ts:81:    moveUci: packet.expectedMoveUci ?? packet.selectedCandidateMoveUci,
lib/blundr/coach/intentFirstCoachEngine.ts:82:    moveSan: packet.expectedMoveSan ?? packet.selectedCandidateMoveSan,
lib/blundr/coach/intentFirstCoachEngine.ts:87:    expectedMoveUci: packet.expectedMoveUci ?? packet.selectedCandidateMoveUci,
lib/blundr/coach/intentFirstCoachEngine.ts:88:    expectedMoveSan: packet.expectedMoveSan ?? packet.selectedCandidateMoveSan,
lib/blundr/coach/intentFirstCoachEngine.ts:95:    intent: (intent === "recall_hint" && opportunity.intent === "recall_prompt" ? "recall_hint" : intent === "reveal_answer" ? "reveal_answer" : intent) as CoachTeachingIntent,
lib/blundr/coach/intentFirstCoachEngine.ts:112:        revealRisk: "none",
lib/blundr/coach/intentFirstCoachEngine.ts:138:    plainLeakPolicy: packet.viewMode === "plain" && intent !== "reveal_answer",
lib/blundr/coach/intentFirstCoachEngine.ts:152:        revealRisk: "none",
lib/blundr/coach/intentFirstCoachEngine.ts:175:  const givesAnswer = intent === "reveal_answer" || intent === "show_trusted_move";
lib/blundr/coach/intentFirstCoachEngine.ts:184:    revealRisk: givesAnswer ? "high" : packet.viewMode === "plain" ? "low" : "none",
lib/blundr/coach/intentFirstCoachEngine.ts:185:    reviewWorthy: packet.viewMode === "plain" && (givesAnswer || input.interaction === "hint"),
lib/blundr/coach/intentFirstCoachEngine.ts:207:  if (intent === "recall_prompt" || intent === "recall_hint" || intent === "reveal_answer") return ["hint", "answer"];
lib/blundr/coach/intentFirstCoachEngine.ts:220:    revealRisk: "none",
lib/blundr/coach/sessionCoachMemory.ts:3:  hintUsesByConcept: Record<string, number>;
lib/blundr/coach/sessionCoachMemory.ts:4:  answerRevealsByConcept: Record<string, number>;
lib/blundr/coach/sessionCoachMemory.ts:15:    hintUsesByConcept: {},
lib/blundr/coach/sessionCoachMemory.ts:16:    answerRevealsByConcept: {},
lib/blundr/coach/teachingIntent.ts:1:import type { CoachInteraction, CoachEvidencePacket } from "../coachBrain/coachEvidenceTypes";
lib/blundr/coach/teachingIntent.ts:10:  if (input.packet.trainingMode === "restricted" && input.packet.viewMode === "plain" && (input.interaction === "answer" || input.interaction === "show_move")) return "reveal_answer";
lib/blundr/coach/teachingIntent.ts:11:  if (input.packet.trainingMode === "restricted" && input.packet.viewMode === "plain" && input.interaction === "hint") return "recall_hint";
lib/blundr/coach/teachingIntent.ts:14:  if (input.packet.trainingMode === "restricted" && input.packet.expectedMoveUci) return "explain_training_move";
lib/blundr/coach/testAdaptiveCoach.ts:1:import { testCoachCardPresenter } from "./__tests__/coachCardPresenter.test";
lib/blundr/coach/testAdaptiveCoach.ts:2:import { testCoachContextBuilder } from "./__tests__/coachContextBuilder.test";
lib/blundr/coach/testAdaptiveCoach.ts:3:import { testCoachDecisionEngine } from "./__tests__/coachDecisionEngine.test";
lib/blundr/coach/testAdaptiveCoach.ts:4:import { testCoachHintEngine } from "./__tests__/coachHintEngine.test";
lib/blundr/coach/testAdaptiveCoach.ts:5:import { testCoachSafety } from "./__tests__/coachSafety.test";
lib/blundr/coach/testAdaptiveCoach.ts:6:import { testCoachUtteranceMemory } from "./__tests__/coachUtteranceMemory.test";
lib/blundr/coach/testAdaptiveCoach.ts:7:import { testCoachVariationPolicy } from "./__tests__/coachVariationPolicy.test";
lib/blundr/coach/testAdaptiveCoach.ts:8:import { testCoachBrain } from "../coachBrain/testCoachBrain";
lib/blundr/coach/testAdaptiveCoach.ts:9:import { testCoachSurface } from "../coachSurface/testCoachSurface";
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts:2:import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts:20:    expectedMoveUci: "f1c4",
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts:32:    expectedMoveUci: "f1b5",
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts:44:    expectedMoveUci: "c2c3",
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts:56:    expectedMoveUci: "a2a3",
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts:68:    expectedMoveUci: "f1e1",
lib/blundr/coachBrain/__tests__/boardClaimValidator.test.ts:80:    expectedMoveUci: "f1f2",
lib/blundr/coachBrain/__tests__/coachActionResolver.test.ts:2:import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
lib/blundr/coachBrain/__tests__/coachActionResolver.test.ts:3:import { resolveCoachAction } from "../coachActionResolver";
lib/blundr/coachBrain/__tests__/coachActionResolver.test.ts:19:  const hint = resolveCoachAction(packet, "hint");
lib/blundr/coachBrain/__tests__/coachActionResolver.test.ts:20:  assert.equal(hint.interaction, "hint");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:4:import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:5:import { buildCoachExplanationPipeline, lintCoachExplanation } from "../coachExplanationPipeline";
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:8:  const frame = buildCurrentInstructionFrame({
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:34:  assert.notEqual(nc3.coachExplanation.title, "Supported continuation");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:35:  assert.equal(/Verified move:/i.test(nc3.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:36:  assert.equal(/knight from/i.test(nc3.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:37:  assert.equal(/knight|develop|center/i.test(nc3.coachExplanation.body), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:38:  assert.equal(/\bbishop\b/i.test(nc3.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:39:  assert.equal(nc3.coachExplanation.coachMoveUci, "b1c3");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:40:  assert.equal(nc3.coachExplanation.coachPieceType, "n");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:41:  assert.equal(nc3.coachQuality.qualityScore >= 80, true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:42:  assert.equal(nc3.coachExplanation.selectedTheme, "minor_piece_development");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:43:  assert.equal(nc3.coachExplanation.selectedOpportunityId, "minor_piece_development");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:44:  assert.equal(nc3.coachExplanation.selectedOpportunityLayer, "development");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:45:  assert.equal(Number(nc3.coachExplanation.selectedOpportunityScore) >= 320, true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:46:  assert.equal(String(nc3.coachExplanation.selectedTemplateId).includes("minor_piece_development"), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:57:  assert.equal(/center|space|respond/i.test(e5.coachExplanation.body), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:58:  assert.equal(/Verified move:|pawn from/i.test(e5.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:59:  assert.equal(["central_pawn_advance", "center_support"].includes(String(e5.coachExplanation.selectedTheme)), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:60:  if (e5.coachExplanation.selectedTheme === "central_pawn_advance") {
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:61:    assert.equal(e5.coachExplanation.selectedOpportunityId, "central_pawn_advance");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:62:    assert.equal(e5.coachExplanation.selectedOpportunityLayer, "center");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:63:    assert.equal(Number(e5.coachExplanation.selectedOpportunityScore) >= 330, true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:64:    assert.equal(String(e5.coachExplanation.selectedTemplateId).includes("central_pawn_advance"), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:76:  assert.equal(nxa8.coachExplanation.selectedTheme, "capture_or_recapture");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:77:  assert.equal(nxa8.coachExplanation.selectedOpportunityId, "capture_or_recapture");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:78:  assert.equal(nxa8.coachExplanation.selectedOpportunityLayer, "tactical");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:79:  assert.equal(Number(nxa8.coachExplanation.selectedOpportunityScore) >= 450, true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:80:  assert.equal(String(nxa8.coachExplanation.selectedTemplateId).includes("capture_or_recapture"), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:81:  assert.equal(/\binitiative\b/i.test(nxa8.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:92:  assert.equal(/bishop|diagonal/i.test(bc4.coachExplanation.body), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:93:  assert.equal(bc4.coachExplanation.selectedTheme, "bishop_activation");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:94:  assert.equal(/knight from|pawn from/i.test(bc4.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:97:  assert.equal(/Bc4/i.test(bc4.coachExplanation.title), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:98:  assert.equal(/bishop/i.test(bc4.coachExplanation.title + " " + bc4.coachExplanation.body), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:99:  assert.equal(/Focus on development|repositioning your bishop|generic copy/i.test(bc4.coachExplanation.title + " " + bc4.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:111:  assert.equal(/Nf3/i.test(nf3.coachExplanation.title), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:112:  assert.equal(/knight/i.test(nf3.coachExplanation.title + " " + nf3.coachExplanation.body), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:113:  assert.equal(/Focus on development|repositioning|generic copy/i.test(nf3.coachExplanation.title + " " + nf3.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:125:  assert.equal(/d4/i.test(d4p.coachExplanation.title), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:126:  assert.equal(/pawn|advance|center/i.test(d4p.coachExplanation.body.toLowerCase()), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:127:  assert.equal(/Focus on development|repositioning|generic copy/i.test(d4p.coachExplanation.title + " " + d4p.coachExplanation.body), false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:138:  assert.equal(/checkmate/i.test(mate.coachExplanation.body), true);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:139:  assert.equal(mate.coachExplanation.selectedTheme, "checkmate");
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:140:  assert.equal(mate.coachExplanation.usedFallback, false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:144:      ...nc3.coachExplanation,
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:155:      ...nc3.coachExplanation,
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:162:  assert.equal(nc3.coachExplanation.usedFallback, false);
lib/blundr/coachBrain/__tests__/coachExplanationPipeline.test.ts:163:  assert.notEqual(nc3.coachExplanation.source, "verified_safe_fallback");
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts:2:import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts:15:    expectedMoveUci: "c4f7",
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts:16:    expectedMoveSan: "Bxf7+",
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts:29:    expectedMoveUci: "c4e2",
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts:41:  const hint = buildCoachCopyFromEvidence({
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts:43:    interaction: "hint",
lib/blundr/coachBrain/__tests__/evidenceConditionedCopyBuilder.test.ts:45:  assert.equal((hint.hint ?? "").toLowerCase().includes("bxf7"), false);
lib/blundr/coachBrain/__tests__/maiaStatus.test.ts:2:import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
lib/blundr/coachBrain/__tests__/portionAndThemePolicy.test.ts:2:import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
lib/blundr/coachBrain/__tests__/portionAndThemePolicy.test.ts:18:    expectedMoveUci: "e1g1",
lib/blundr/coachBrain/__tests__/portionAndThemePolicy.test.ts:19:    expectedMoveSan: "O-O",
lib/blundr/coachBrain/boardClaimValidator.ts:1:import type { CoachEvidencePacket } from "./coachEvidenceTypes";
lib/blundr/coachBrain/boardClaimValidator.ts:73:  return canClaimCenterTension(packet) && !packet.expectedMoveUci;
lib/blundr/coachBrain/boardFactExtractor.ts:4:import type { BoardFactPacket } from "./coachEvidenceTypes";
lib/blundr/coachBrain/coachActionResolver.ts:1:import type { CoachEvidencePacket, CoachInteraction } from "./coachEvidenceTypes";
lib/blundr/coachBrain/coachActionResolver.ts:5:  hintLevel: number;
lib/blundr/coachBrain/coachActionResolver.ts:9:    return { interaction: "show_plan", hintLevel: 0, allowExactMove: false };
lib/blundr/coachBrain/coachActionResolver.ts:12:    return { interaction, hintLevel: 2, allowExactMove: packet.exactMoveAllowed };
lib/blundr/coachBrain/coachActionResolver.ts:14:  if (interaction === "hint") {
lib/blundr/coachBrain/coachActionResolver.ts:15:    return { interaction, hintLevel: packet.viewMode === "plain" ? 1 : 0, allowExactMove: false };
lib/blundr/coachBrain/coachActionResolver.ts:18:    return { interaction, hintLevel: 0, allowExactMove: false };
lib/blundr/coachBrain/coachActionResolver.ts:20:  return { interaction, hintLevel: 0, allowExactMove: packet.exactMoveAllowed };
lib/blundr/coachBrain/coachBrainDebug.ts:1:import type { CoachEvidencePacket } from "./coachEvidenceTypes";
lib/blundr/coachBrain/coachBrainDebug.ts:5:    coachEvidenceStatus: packet.evidenceStatus,
lib/blundr/coachBrain/coachBrainDebug.ts:6:    coachEvidenceStale: packet.stale,
lib/blundr/coachBrain/coachBrainDebug.ts:7:    coachSelectedCandidateMove: packet.selectedCandidateMoveSan ?? packet.selectedCandidateMoveUci,
lib/blundr/coachBrain/coachBrainDebug.ts:8:    coachExactMoveAllowed: packet.exactMoveAllowed,
lib/blundr/coachBrain/coachBrainDebug.ts:9:    coachAllowedClaims: packet.allowedClaims,
lib/blundr/coachBrain/coachBrainDebug.ts:10:    coachBlockedClaims: packet.blockedClaims,
lib/blundr/coachBrain/coachBrainDebug.ts:11:    coachMoveFacts: packet.moveFacts,
lib/blundr/coachBrain/coachBrainDebug.ts:12:    coachBoardFactsSummary: {
lib/blundr/coachBrain/coachBrainDebug.ts:19:    coachEngineStatus: packet.engineSupport.status,
lib/blundr/coachBrain/coachBrainDebug.ts:20:    coachEngineBestMove: packet.engineSupport.bestMoveSan ?? packet.engineSupport.bestMoveUci,
lib/blundr/coachBrain/coachBrainDebug.ts:21:    coachEngineSafeMoves: packet.engineSupport.safeMoveUcis,
lib/blundr/coachBrain/coachBrainDebug.ts:22:    coachMaiaStatus: packet.maiaSupport.status,
lib/blundr/coachBrain/coachBrainDebug.ts:23:    coachRepertoireSupport: packet.repertoireSupport,
lib/blundr/coachBrain/coachEvidenceBuilder.ts:21:} from "./coachEvidenceTypes";
lib/blundr/coachBrain/coachEvidenceBuilder.ts:91:  expectedMoveUci?: string;
lib/blundr/coachBrain/coachEvidenceBuilder.ts:99:  if (input.bookStatus === "in_book" && input.expectedMoveUci) {
lib/blundr/coachBrain/coachEvidenceBuilder.ts:103:      supportedMoveUcis: Array.from(new Set([...supportedMoveUcis, input.expectedMoveUci])),
lib/blundr/coachBrain/coachEvidenceBuilder.ts:113:  expectedMoveUci?: string;
lib/blundr/coachBrain/coachEvidenceBuilder.ts:114:  expectedMoveSan?: string;
lib/blundr/coachBrain/coachEvidenceBuilder.ts:120:  if (input.trainingMode === "restricted") return { uci: input.expectedMoveUci, san: input.expectedMoveSan, reason: "restricted_expected" };
lib/blundr/coachBrain/coachEvidenceBuilder.ts:139:  expectedMoveUci?: string;
lib/blundr/coachBrain/coachEvidenceBuilder.ts:140:  expectedMoveSan?: string;
lib/blundr/coachBrain/coachEvidenceBuilder.ts:171:    expectedMoveUci: input.expectedMoveUci,
lib/blundr/coachBrain/coachEvidenceBuilder.ts:179:    expectedMoveUci: input.expectedMoveUci,
lib/blundr/coachBrain/coachEvidenceBuilder.ts:180:    expectedMoveSan: input.expectedMoveSan,
lib/blundr/coachBrain/coachEvidenceBuilder.ts:244:    expectedMoveUci: input.expectedMoveUci,
lib/blundr/coachBrain/coachEvidenceBuilder.ts:245:    expectedMoveSan: input.expectedMoveSan,
lib/blundr/coachBrain/coachEvidenceTypes.ts:10:  | "hint"
lib/blundr/coachBrain/coachEvidenceTypes.ts:151:  expectedMoveUci?: string;
lib/blundr/coachBrain/coachEvidenceTypes.ts:152:  expectedMoveSan?: string;
lib/blundr/coachBrain/coachExplanationPipeline.ts:117:  coachMoveUci: string;
lib/blundr/coachBrain/coachExplanationPipeline.ts:118:  coachPieceType: string;
lib/blundr/coachBrain/coachExplanationPipeline.ts:421:      source: "verified_coach_explanation",
lib/blundr/coachBrain/coachExplanationPipeline.ts:493:  // Step 3: Assisted View coaching copy must use verified SAN + piece + dest from moveFacts, in required format.
lib/blundr/coachBrain/coachExplanationPipeline.ts:546:    source: "verified_coach_explanation",
lib/blundr/coachBrain/coachExplanationPipeline.ts:547:    coachMoveUci: moveFacts.uci,
lib/blundr/coachBrain/coachExplanationPipeline.ts:548:    coachPieceType: moveFacts.pieceType,
lib/blundr/coachBrain/coachExplanationPipeline.ts:572:  if (mentions("checkmate") && !moveFacts.givesMate) blockedReasons.push("unsafe_unverified_coach_claim:checkmate");
lib/blundr/coachBrain/coachExplanationPipeline.ts:573:  if (mentions("check") && !mentions("checkmate") && !moveFacts.givesCheck && !moveFacts.givesMate) blockedReasons.push("unsafe_unverified_coach_claim:check");
lib/blundr/coachBrain/coachExplanationPipeline.ts:574:  if ((mentions("capture") || mentions("captures")) && !moveFacts.isCapture) blockedReasons.push("unsafe_unverified_coach_claim:capture");
lib/blundr/coachBrain/coachExplanationPipeline.ts:575:  if (mentions("initiative")) blockedReasons.push("unsafe_unverified_coach_claim:initiative");
lib/blundr/coachBrain/coachExplanationPipeline.ts:576:  if (text.includes("without creating unnecessary weaknesses")) blockedReasons.push("unsafe_unverified_coach_claim:weakness");
lib/blundr/coachBrain/coachExplanationPipeline.ts:577:  if (mentions("center") && !(moveFacts.centralPawnAdvance || moveFacts.controlsCenter || moveFacts.supportsCenter)) blockedReasons.push("unsafe_unverified_coach_claim:center");
lib/blundr/coachBrain/coachExplanationPipeline.ts:578:  if (mentions("space") && !moveFacts.gainsSpace) blockedReasons.push("unsafe_unverified_coach_claim:space");
lib/blundr/coachBrain/coachExplanationPipeline.ts:579:  if (mentions("bishop") && moveFacts.pieceType !== "b" && explanation.selectedTheme !== "bishop_activation") blockedReasons.push("unsafe_unverified_coach_claim:bishop");
lib/blundr/coachBrain/coachExplanationPipeline.ts:580:  if (mentions("knight") && moveFacts.pieceType !== "n" && explanation.selectedTheme !== "minor_piece_development") blockedReasons.push("unsafe_unverified_coach_claim:knight");
lib/blundr/coachBrain/coachExplanationPipeline.ts:581:  if (mentions("rook") && moveFacts.pieceType !== "r" && !moveFacts.connectsRooks) blockedReasons.push("unsafe_unverified_coach_claim:rook");
lib/blundr/coachBrain/coachExplanationPipeline.ts:582:  if ((mentions("castle") || mentions("castling")) && !(moveFacts.castlesKing || moveFacts.preparesCastling || moveFacts.isKingSafetyMove)) blockedReasons.push("unsafe_unverified_coach_claim:castling");
lib/blundr/coachBrain/coachExplanationPipeline.ts:603:    targetAligned: input.explanation.coachMoveUci === input.context.target.uci,
lib/blundr/coachBrain/coachExplanationPipeline.ts:604:    pieceAligned: input.explanation.coachPieceType === input.context.target.pieceType,
lib/blundr/coachBrain/coachExplanationPipeline.ts:622:  coachExplanation: CoachExplanation;
lib/blundr/coachBrain/coachExplanationPipeline.ts:624:  coachQuality: CoachQuality;
lib/blundr/coachBrain/coachExplanationPipeline.ts:656:  let coachExplanation = renderCoachExplanation(moveFactPacket, opportunityPacket.selected);
lib/blundr/coachBrain/coachExplanationPipeline.ts:657:  let safetyResult = lintCoachExplanation(coachExplanation, moveFactPacket);
lib/blundr/coachBrain/coachExplanationPipeline.ts:660:    coachExplanation = {
lib/blundr/coachBrain/coachExplanationPipeline.ts:661:      ...coachExplanation,
lib/blundr/coachBrain/coachExplanationPipeline.ts:669:      selectedTemplateId: `fallback:${coachExplanation.selectedTheme ?? "stable_continuation"}:verified_safe`,
lib/blundr/coachBrain/coachExplanationPipeline.ts:671:    safetyResult = lintCoachExplanation(coachExplanation, moveFactPacket);
lib/blundr/coachBrain/coachExplanationPipeline.ts:673:  const coachQuality = scoreCoachQuality({
lib/blundr/coachBrain/coachExplanationPipeline.ts:674:    explanation: coachExplanation,
lib/blundr/coachBrain/coachExplanationPipeline.ts:685:    coachExplanation,
lib/blundr/coachBrain/coachExplanationPipeline.ts:687:    coachQuality,
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:1:import type { CoachButton } from "../coach/coachTypes";
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:2:import type { CoachEvidencePacket, CoachInteraction, VerifiedCoachClaim } from "./coachEvidenceTypes";
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:7:  hint?: string;
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:141:  if (packet.viewMode === "plain" && packet.bookStatus === "in_book") return ["hint", "answer"];
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:186:  const hintLevel = input.previousHintLevel ?? 0;
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:190:    hintLevel > 0 && primary?.type === "attacks_square"
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:192:      : hintLevel > 0 && primary?.type === "piece_develops"
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:195:  const hint = capText(
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:196:    hintLevel > 0
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:202:  // Narrow fix for plain pre-showMore: ensure the .hint returned for interaction="hint" in plain does not include exact move name (raw verified fallback may name it; surface ladder also protects, but copy .hint must be safe for pre-answer).
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:203:  // This resolves the answer-leak test without broadly altering assisted/ post-showMore / continuation copy formats.
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:204:  let plainSafeHint = hint;
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:250:    hint: input.interaction === "hint" ? plainSafeHint : undefined,
lib/blundr/coachBrain/evidenceConditionedCopyBuilder.ts:257:    shouldMarkReviewWorthy: packet.viewMode === "plain" && (givesAnswer || input.interaction === "hint"),
lib/blundr/coachBrain/moveFactExtractor.ts:12:import type { MoveFactPacket } from "./coachEvidenceTypes";
lib/blundr/coachBrain/testCoachBrain.ts:3:import { testCoachActionResolver } from "./__tests__/coachActionResolver.test";
lib/blundr/coachCompiler/compileCoachFrame.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/compileCoachFrame.ts:6:import { buildRevealAction } from "./revealActionBuilder";
lib/blundr/coachCompiler/compileCoachFrame.ts:28:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:40:        body: "This line is complete. Continue from here when you are ready.",
lib/blundr/coachCompiler/compileCoachFrame.ts:58:        body: "This position is terminal, so no coaching target is available.",
lib/blundr/coachCompiler/compileCoachFrame.ts:74:    ? "Look for a move that supports {conceptLabel} and {moveVerb} without revealing the answer."
lib/blundr/coachCompiler/compileCoachFrame.ts:75:    : "Look for the move that improves your position without revealing the answer.";
lib/blundr/coachCompiler/compileCoachFrame.ts:89:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:129:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:166:    title: "Show More",
lib/blundr/coachCompiler/compileCoachFrame.ts:175:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compileCoachFrame.ts:192:  const revealAction = buildRevealAction({ frame: input.frame, graph: input.graph });
lib/blundr/coachCompiler/compileCoachFrame.ts:208:  const showMore = buildShowMoreBlock({
lib/blundr/coachCompiler/compileCoachFrame.ts:221:    revealTargetUci: revealAction.targetUci,
lib/blundr/coachCompiler/compileCoachFrame.ts:233:    showMore,
lib/blundr/coachCompiler/compileCoachFrame.ts:237:    revealAction,
lib/blundr/coachCompiler/compilerDebug.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/compilerDebug.ts:7:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/compilerDebug.ts:11:  revealTargetUci: string | null;
lib/blundr/coachCompiler/compilerDebug.ts:34:  if (input.revealTargetUci !== frameTarget && !(input.revealTargetUci === null && frameTarget === null)) {
lib/blundr/coachCompiler/compilerDebug.ts:35:    criticalIssues.push("reveal target mismatch against frame target");
lib/blundr/coachCompiler/compilerDebug.ts:42:    if (input.revealTargetUci !== null) {
lib/blundr/coachCompiler/compilerDebug.ts:43:      criticalIssues.push("null-target frame contains target reveal");
lib/blundr/coachCompiler/index.ts:6:export * from "./revealActionBuilder";
lib/blundr/coachCompiler/revealActionBuilder.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/revealActionBuilder.ts:3:import type { CompiledRevealAction } from "./types";
lib/blundr/coachCompiler/revealActionBuilder.ts:5:export function buildRevealAction(input: {
lib/blundr/coachCompiler/revealActionBuilder.ts:6:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/revealActionBuilder.ts:8:}): CompiledRevealAction {
lib/blundr/coachCompiler/revealActionBuilder.ts:13:      kind: "reveal_target",
lib/blundr/coachCompiler/revealActionBuilder.ts:14:      label: "Reveal move",
lib/blundr/coachCompiler/revealActionBuilder.ts:22:      kind: "continue_from_here",
lib/blundr/coachCompiler/revealActionBuilder.ts:23:      label: "Continue from here",
lib/blundr/coachCompiler/revealActionBuilder.ts:31:    label: "No reveal",
lib/blundr/coachCompiler/slotBuilder.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/slotBuilder.ts:19:  frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/templateRenderer.ts:49:    return "Look for the move that improves your position without revealing the answer.";
lib/blundr/coachCompiler/types.ts:44:export interface CompiledRevealAction {
lib/blundr/coachCompiler/types.ts:45:  kind: "reveal_target" | "continue_from_here" | "none";
lib/blundr/coachCompiler/types.ts:61:  showMore: CompiledCoachTextBlock;
lib/blundr/coachCompiler/types.ts:67:  revealAction: CompiledRevealAction;
lib/blundr/coachCompiler/types.ts:88:  frame: import("../runtime/currentInstructionFrame").CurrentInstructionFrame;
lib/blundr/coachCompiler/visualIntentBuilder.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/coachCompiler/visualIntentBuilder.ts:10:    frame: CurrentInstructionFrame;
lib/blundr/coachCompiler/visualIntentBuilder.ts:30:  frame: CurrentInstructionFrame;
lib/blundr/coachQuality/__tests__/coachBenchmarkRunner.test.ts:2:import { COACH_BENCHMARK_FIXTURES } from "../coachBenchmarkFixtures";
lib/blundr/coachQuality/__tests__/coachBenchmarkRunner.test.ts:3:import { runCoachBenchmark } from "../coachBenchmarkRunner";
lib/blundr/coachQuality/__tests__/coachCopyLint.test.ts:2:import { lintCoachCopy } from "../coachCopyLint";
lib/blundr/coachQuality/__tests__/coachQualityScorer.test.ts:2:import { scoreCoachBenchmarkFixture } from "../coachQualityScorer";
lib/blundr/coachQuality/__tests__/coachQualityScorer.test.ts:9:    userState: { answerShown: false, hintUsed: false },
lib/blundr/coachQuality/__tests__/coachQualityScorer.test.ts:22:    buttons: ["hint", "answer"],
lib/blundr/coachQuality/__tests__/coachQualityScorer.test.ts:32:    buttons: ["hint", "answer"],
lib/blundr/coachQuality/__tests__/coachQualityScorer.test.ts:43:    buttons: ["hint", "answer"],
lib/blundr/coachQuality/__tests__/coachQualityScorer.test.ts:66:    buttons: ["hint", "answer"],
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:1:import type { CoachBenchmarkFixture } from "./coachBenchmarkTypes";
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:20:      hintUsed: false,
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:39:      allowedCoachModes: ["assisted_teach", "plain_prompt", "plain_hint", "plain_answer_revealed"],
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:89:    userState: { attempts: 1, wrongAttempts: 1, hintUsed: false, answerShown: false, elapsedMs: 12000, priorPatternMisses: 1, priorPatternSuccesses: 0, weakConcepts: ["prepare_center_break"] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:91:      allowedCoachModes: ["plain_hint", "plain_wrong_move"],
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:138:    userState: { attempts: 3, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 10000, priorPatternMisses: 1, priorPatternSuccesses: 2, weakConcepts: [] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:158:    userState: { attempts: 2, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 9000, priorPatternMisses: 1, priorPatternSuccesses: 2, weakConcepts: ["center_tension"] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:191:    userState: { attempts: 1, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 10000, priorPatternMisses: 0, priorPatternSuccesses: 0, weakConcepts: [] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:230:    userState: { attempts: 1, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 8000, priorPatternMisses: 0, priorPatternSuccesses: 1, weakConcepts: [] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:269:    userState: { attempts: 1, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 5000, priorPatternMisses: 0, priorPatternSuccesses: 0, weakConcepts: [] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:302:    userState: { attempts: 2, wrongAttempts: 1, hintUsed: true, answerShown: false, elapsedMs: 20000, priorPatternMisses: 2, priorPatternSuccesses: 1, weakConcepts: ["king_safety"] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:335:    userState: { attempts: 2, wrongAttempts: 1, hintUsed: true, answerShown: false, elapsedMs: 13000, priorPatternMisses: 1, priorPatternSuccesses: 0, weakConcepts: ["development"] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:355:    userState: { attempts: 4, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 6000, priorPatternMisses: 1, priorPatternSuccesses: 3, weakConcepts: ["prepare_center_break"] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:382:    userState: { attempts: 1, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 7000, priorPatternMisses: 0, priorPatternSuccesses: 1, weakConcepts: [] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:402:    userState: { attempts: 0, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 2000, priorPatternMisses: 0, priorPatternSuccesses: 0, weakConcepts: [] },
lib/blundr/coachQuality/coachBenchmarkFixtures.ts:421:    userState: { attempts: 0, wrongAttempts: 0, hintUsed: false, answerShown: false, elapsedMs: 1000, priorPatternMisses: 0, priorPatternSuccesses: 0, weakConcepts: [] },
lib/blundr/coachQuality/coachBenchmarkRunner.ts:1:import { buildCoachContext } from "../coach/coachContextBuilder";
lib/blundr/coachQuality/coachBenchmarkRunner.ts:2:import { decideCoachOutput } from "../coach/coachDecisionEngine";
lib/blundr/coachQuality/coachBenchmarkRunner.ts:3:import type { CoachUtteranceMemoryEntry } from "../coach/coachTypes";
lib/blundr/coachQuality/coachBenchmarkRunner.ts:12:import { scoreCoachBenchmarkFixture } from "./coachQualityScorer";
lib/blundr/coachQuality/coachBenchmarkRunner.ts:13:import type { CoachBenchmarkEvaluation, CoachBenchmarkFixture, CoachBenchmarkResult } from "./coachBenchmarkTypes";
lib/blundr/coachQuality/coachBenchmarkRunner.ts:29:    revealState: fixture.userState.answerShown ? "revealed" : "hidden",
lib/blundr/coachQuality/coachBenchmarkRunner.ts:36:      moveTrust: fixture.expected.exactMoveAllowed ? "book_supported" : "reveal_only_unverified",
lib/blundr/coachQuality/coachBenchmarkRunner.ts:57:    hintUsed: fixture.userState.hintUsed,
lib/blundr/coachQuality/coachBenchmarkRunner.ts:68:    : fixture.viewMode === "plain" && (fixture.userState.hintUsed || fixture.userState.wrongAttempts > 0)
lib/blundr/coachQuality/coachBenchmarkRunner.ts:69:      ? "hint"
lib/blundr/coachQuality/coachBenchmarkRunner.ts:76:    hintRequestCount: fixture.userState.hintUsed ? 1 : 0,
lib/blundr/coachQuality/coachBenchmarkRunner.ts:82:    text: decision.answer ?? decision.hint ?? decision.body,
lib/blundr/coachQuality/coachBenchmarkRunner.ts:114:      hintsUsedRecently: fixture.userState.hintUsed ? 1 : 0,
lib/blundr/coachQuality/coachBenchmarkRunner.ts:115:      answerRevealsRecently: fixture.userState.answerShown ? 1 : 0,
lib/blundr/coachQuality/coachBenchmarkRunner.ts:126:    userRequestedHelp: fixture.userState.hintUsed,
lib/blundr/coachQuality/coachBenchmarkRunner.ts:143:  const buttons = exactMoveAllowed ? ["hint", "show_plan", "analyze_idea", "show_move"] : ["hint", "show_plan", "analyze_idea"];
lib/blundr/coachQuality/coachBenchmarkTypes.ts:1:import type { CoachClaimType, CoachMode } from "../coach/coachTypes";
lib/blundr/coachQuality/coachBenchmarkTypes.ts:23:    hintUsed: boolean;
lib/blundr/coachQuality/coachCopyLint.ts:1:import { COACH_COPY_LIBRARY } from "../coach/coachCopyLibrary";
lib/blundr/coachQuality/coachCopyLint.ts:49:      issues.push({ id: entry.utteranceId, issue: "hint_leaks_exact_move" });
lib/blundr/coachQuality/coachQualityScorer.ts:1:import type { CoachBenchmarkEvaluation, CoachBenchmarkFixture, CoachBenchmarkResult } from "./coachBenchmarkTypes";
lib/blundr/coachQuality/coachQualityScorer.ts:52:  if (fixture.viewMode === "plain" && !fixture.userState.answerShown && !fixture.userState.hintUsed && leaksMoveNotation(text)) {
lib/blundr/coachQuality/coachRegressionReport.ts:1:import type { CoachBenchmarkResult } from "./coachBenchmarkTypes";
lib/blundr/coachQuality/testCoachBenchmark.ts:1:import { COACH_BENCHMARK_FIXTURES } from "./coachBenchmarkFixtures";
lib/blundr/coachQuality/testCoachBenchmark.ts:2:import { runCoachBenchmark } from "./coachBenchmarkRunner";
lib/blundr/coachQuality/testCoachBenchmark.ts:3:import { lintCoachCopy } from "./coachCopyLint";
lib/blundr/coachQuality/testCoachQuality.ts:1:import { testCoachExplanationPipeline } from "../coachBrain/__tests__/coachExplanationPipeline.test";
lib/blundr/coachQuality/testCoachQuality.ts:4:  console.log("Running Blundr coach-quality QA...");
lib/blundr/coachQuality/testCoachQuality.ts:6:  console.log("✓ coach explanation pipeline passed");
lib/blundr/coachQuality/testCoachQuality.ts:7:  console.log("✓ Blundr coach-quality QA passed");
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts:2:import { decideCoachSurfacePolicy } from "../coachSurfacePolicy";
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts:6:    coachShouldShow: false,
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts:7:    coachSuppressedReason: "hidden_for_frame",
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts:8:    coachHiddenForFrame: true,
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts:21:    coachShouldShow: true,
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts:22:    coachHiddenForFrame: false,
lib/blundr/coachSurface/__tests__/coachHideSurface.test.ts:31:  assert.equal(nextFrame.owner, "evidence_coach");
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:2:import { decideCoachSurfacePolicy } from "../coachSurfacePolicy";
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:6:    coachShouldShow: true,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:7:    coachHiddenForFrame: false,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:16:  assert.equal(active.owner, "evidence_coach");
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:20:    coachShouldShow: false,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:21:    coachSuppressedReason: "hidden_for_frame",
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:22:    coachHiddenForFrame: true,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:35:    coachShouldShow: false,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:36:    coachHiddenForFrame: false,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:48:    coachShouldShow: false,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:49:    coachHiddenForFrame: false,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:61:    coachShouldShow: false,
lib/blundr/coachSurface/__tests__/coachSurfacePolicy.test.ts:62:    coachHiddenForFrame: false,
lib/blundr/coachSurface/__tests__/legacyCueSuppression.test.ts:2:import { decideCoachSurfacePolicy } from "../coachSurfacePolicy";
lib/blundr/coachSurface/__tests__/legacyCueSuppression.test.ts:6:    coachShouldShow: false,
lib/blundr/coachSurface/__tests__/legacyCueSuppression.test.ts:7:    coachHiddenForFrame: false,
lib/blundr/coachSurface/coachSurfacePolicy.ts:2:  | "evidence_coach"
lib/blundr/coachSurface/coachSurfacePolicy.ts:7:  coachShouldShow: boolean;
lib/blundr/coachSurface/coachSurfacePolicy.ts:8:  coachSuppressedReason?: string;
lib/blundr/coachSurface/coachSurfacePolicy.ts:9:  coachHiddenForFrame: boolean;
lib/blundr/coachSurface/coachSurfacePolicy.ts:38:  if (input.coachHiddenForFrame) {
lib/blundr/coachSurface/coachSurfacePolicy.ts:45:      reason: "coach_hidden_for_frame",
lib/blundr/coachSurface/coachSurfacePolicy.ts:49:  if (input.coachShouldShow) {
lib/blundr/coachSurface/coachSurfacePolicy.ts:51:      owner: "evidence_coach",
lib/blundr/coachSurface/coachSurfacePolicy.ts:56:      reason: "coach_owns_surface",
lib/blundr/coachSurface/coachSurfacePolicy.ts:72:  const allowLegacy = input.trainingMode === "restricted" && !input.coachShouldShow && input.visualRecipeValid;
lib/blundr/coachSurface/testCoachSurface.ts:1:import { testCoachHideSurface } from "./__tests__/coachHideSurface.test";
lib/blundr/coachSurface/testCoachSurface.ts:2:import { testCoachSurfacePolicy } from "./__tests__/coachSurfacePolicy.test";
lib/blundr/coaching/adaptiveContext.ts:2:import { chooseExplanationMode, type CoachingMemoryInput } from "./coachingMemory";
lib/blundr/concepts/TeachingConcept.ts:60:  showMoreTemplate: {
lib/blundr/concepts/TeachingConcept.ts:92:    showMore: boolean;
lib/blundr/concepts/dynamicConceptActivator.ts:19:  "continue_from_here_available",
lib/blundr/concepts/dynamicConceptActivator.ts:199:            showMore: true,
lib/blundr/concepts/dynamicConceptActivator.ts:242:        showMore: modeEligible(concept, "show_more"),
lib/blundr/concepts/teachingConceptRegistry.ts:39:  showMoreTemplate?: string;
lib/blundr/concepts/teachingConceptRegistry.ts:41:  showMoreSlots?: string[];
lib/blundr/concepts/teachingConceptRegistry.ts:77:  "show_more_reveal",
lib/blundr/concepts/teachingConceptRegistry.ts:158:  { id: "discovered_check", label: "Discovered Check", family: "tactics", summary: "Reveal a check by moving a blocking piece.", claimTypes: ["tactical_motif", "check"], minStrength: "verified", overclaimRisk: "high" },
lib/blundr/concepts/teachingConceptRegistry.ts:229:  { id: "continue_from_here_available", label: "Continue From Here Available", family: "continuation", summary: "Branch completion can safely offer a continuation option.", claimTypes: ["safe_fallback"], minStrength: "probable", allowInPlainBeforeShowMore: true },
lib/blundr/concepts/teachingConceptRegistry.ts:235:  { id: "plain_mode_recall", label: "Plain Mode Recall", family: "mistake_pattern", summary: "Plain mode should keep hints abstract until reveal policy allows detail.", claimTypes: ["safe_fallback", "strategic_feature"], minStrength: "probable", allowInPlainBeforeShowMore: true },
lib/blundr/concepts/teachingConceptRegistry.ts:236:  { id: "show_more_reveal", label: "Show More Reveal", family: "visual_pattern", summary: "Show More can reveal richer guidance under safety gating.", claimTypes: ["safe_fallback", "strategic_feature"], minStrength: "probable", leakRisk: "high", allowInPlainBeforeShowMore: false },
lib/blundr/concepts/teachingConceptRegistry.ts:278:    showMoreTemplate: {
lib/blundr/concepts/teachingConceptRegistry.ts:279:      template: spec.showMoreTemplate ?? "Detail how {conceptLabel} follows from {evidenceSummary} and board truth.",
lib/blundr/concepts/teachingConceptRegistry.ts:280:      requiredSlots: spec.showMoreSlots ?? ["conceptLabel", "evidenceSummary", "boardTruth"],
lib/blundr/concepts/teachingConceptRegistry.ts:314:    || !concept.showMoreTemplate.template.trim();
lib/blundr/concepts/teachingConceptRegistry.ts:348:    const joined = `${concept.label} ${concept.summary} ${concept.plainHintTemplate.template} ${concept.assistedTemplate.template} ${concept.showMoreTemplate.template}`.toLowerCase();
lib/blundr/continuedPlay/continuedPlayMovePolicy.ts:331: * Used to gate continuation candidate evaluation and target setting before explicit "Continue from here" click.
lib/blundr/debug/__tests__/fallbackCopyGuard.test.ts:8:  const coachCopy = fs.readFileSync(path.join(root, "lib/blundr/liveCoach/liveCoachCopyLibrary.ts"), "utf8");
lib/blundr/debug/__tests__/fallbackCopyGuard.test.ts:10:  assert.equal(coachCopy.includes("immediate center tension"), false);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:4:import { buildCoachContext } from "../../coach/coachContextBuilder";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:5:import { decideCoachOutput } from "../../coach/coachDecisionEngine";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:6:import { decideCoachSurfacePolicy } from "../../coachSurface/coachSurfacePolicy";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:11:import { resolveExpectedMoveForFrame } from "../../openings/expectedMoveResolver";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:13:import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:20:type CoachInteraction = "none" | "hint" | "answer" | "why" | "hide" | "show_plan" | "analyze_idea" | "show_move";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:32:  expectedMoveResolution: ResolvedExpectedMove;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:34:  coachDecision: ReturnType<typeof decideCoachOutput>;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:46:  revealTargetUci: string | null;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:47:  revealTargetSource: string | null;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:68:  expectedMoveUci: string;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:69:  expectedMoveSan: string;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:77:    expectedMoveUci: input.expectedMoveUci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:78:    expectedMoveSan: input.expectedMoveSan,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:81:      topMoves: [{ rank: 1, uci: input.expectedMoveUci, san: input.expectedMoveSan, scoreCp: 20 }],
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:99:  expectedMoveUci: string;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:100:  expectedMoveSan: string;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:104:    expectedMoveUci: input.expectedMoveUci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:105:    expectedMoveSan: input.expectedMoveSan,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:115:    revealState: input.answerShown ? "revealed" : "hidden",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:118:    expectedMoveUci: input.expectedMoveUci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:119:    expectedMoveSan: input.expectedMoveSan,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:125:function makeSafeArrowLines(expectedMoveUci: string): Array<{ from: string; to: string }> {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:126:  return [{ from: expectedMoveUci.slice(0, 2), to: expectedMoveUci.slice(2, 4) }];
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:137:  coachInteraction?: CoachInteraction;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:139:  coachHiddenForFrame?: boolean;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:143:  expectedMoveOverride?: { san?: string | null; uci?: string | null };
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:166:    legacyExpectedMoveCandidate: input.expectedMoveOverride ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:173:      ? input.enginePreviewMove ?? (baseExpectedMoveResolution.expectedMoveUci ? { uci: baseExpectedMoveResolution.expectedMoveUci, san: baseExpectedMoveResolution.expectedMoveSan ?? undefined } : pickLegalMove(game, input.candidatePreferredUci) ?? undefined)
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:174:      : baseExpectedMoveResolution.expectedMoveUci
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:175:        ? { uci: baseExpectedMoveResolution.expectedMoveUci, san: baseExpectedMoveResolution.expectedMoveSan ?? undefined }
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:176:          : input.expectedMoveOverride?.uci
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:177:            ? { uci: input.expectedMoveOverride.uci, san: input.expectedMoveOverride.san ?? undefined }
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:191:    userContinuationCount: isUserTurn && baseExpectedMoveResolution.expectedMoveUci ? 1 : 0,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:210:  let expectedMoveResolution = baseExpectedMoveResolution;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:226:      expectedMoveResolution = {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:228:        expectedMoveSan: selectedCandidate.san ?? applied.san,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:229:        expectedMoveUci: selectedCandidate.uci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:259:        expectedMoveUci: selectedCandidate.uci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:260:        expectedMoveSan: selectedCandidate.san ?? selectedCandidate.uci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:269:    input.visualMode === "recipe" && expectedMoveResolution.expectedMoveUci
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:277:          expectedMoveUci: expectedMoveResolution.expectedMoveUci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:278:          expectedMoveSan: expectedMoveResolution.expectedMoveSan ?? expectedMoveResolution.expectedMoveUci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:282:  const safeMoveArrowLines = input.visualMode === "safe_arrow" && expectedMoveResolution.expectedMoveUci ? makeSafeArrowLines(expectedMoveResolution.expectedMoveUci) : [];
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:293:    input.trainingMode === "restricted" && isUserTurn && !expectedMoveResolution.expectedMoveUci && !selectedCandidate?.uci;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:295:    !input.coachHiddenForFrame && (input.branchTransitionSurface || autoBranchTransition || expectedMoveResolution.source === "guided_branch_needs_continuation")
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:300:          buttons: ["continue_from_here", "restart_line"],
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:301:          reason: input.branchTransitionReason ?? expectedMoveResolution.reason ?? "guided_branch_needs_continuation",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:305:  const coachDecision =
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:306:    branchTransitionSurface && !expectedMoveResolution.expectedMoveUci && !selectedCandidate?.uci
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:313:          revealRisk: "none",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:317:          debug: { coachIntent: "silent", candidateCoachFallbackUsed: false, branchTransitionSurfaceRendered: true },
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:324:            revealState: input.answerShown ? "revealed" : "hidden",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:332:            hintUsed: input.coachInteraction === "hint",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:340:          interaction: input.coachInteraction ?? (isUserTurn && (expectedMoveResolution.expectedMoveUci || selectedCandidate?.uci) ? "show_plan" : "none"),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:342:          hintRequestCount: (input.coachInteraction ?? (isUserTurn && (expectedMoveResolution.expectedMoveUci || selectedCandidate?.uci) ? "show_plan" : "none")) === "hint" ? 1 : 0,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:351:                expectedMoveUci: expectedMoveResolution.expectedMoveUci ?? undefined,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:352:                expectedMoveSan: expectedMoveResolution.expectedMoveSan ?? undefined,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:358:                teachingOrchestration: { openingId: input.openingTree.openingId, lineId: String(expectedMoveResolution.debug?.selectedLineId ?? "qa") },
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:362:                expectedMoveSource: expectedMoveResolution.source,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:363:                expectedMoveCoverageTier: expectedMoveResolution.coverageTier,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:364:                expectedMoveResolutionReason: expectedMoveResolution.reason,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:369:  const coachSurfacePolicy = decideCoachSurfacePolicy({
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:370:    coachShouldShow: Boolean(coachDecision.shouldShowCoachCard),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:371:    coachSuppressedReason: coachDecision.suppressedReason,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:372:    coachHiddenForFrame: Boolean(input.coachHiddenForFrame),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:375:    hasExpectedMove: Boolean(expectedMoveResolution.expectedMoveUci),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:376:    exactMoveAllowed: Boolean(coachDecision.exactMoveAllowed),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:377:    moveQualityGateStatus: String(coachDecision.debug?.coachEngineStatus ?? "idle"),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:378:    engineValidationStatus: coachDecision.debug?.coachEngineStatus === "ready" ? "ready" : "idle",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:386:    expectedMoveSan: expectedMoveResolution.expectedMoveSan ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:387:    expectedMoveUci: expectedMoveResolution.expectedMoveUci ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:389:    coachShouldShow: Boolean(coachDecision.shouldShowCoachCard),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:390:    coachButtons: coachDecision.buttons,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:413:    coachShouldShow: Boolean(coachDecision.shouldShowCoachCard),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:414:    coachHiddenForFrame: Boolean(input.coachHiddenForFrame),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:415:    coachIntent: ((coachDecision.debug as any)?.coachIntent === "silent" && (expectedMoveResolution.expectedMoveUci || selectedCandidate?.uci)
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:417:      : (coachDecision.debug as any)?.coachIntent) as any,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:418:    coachTitle: coachDecision.title,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:419:    coachBody: coachDecision.body,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:420:    coachButtons: coachDecision.buttons,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:421:    coachSuppressedReason: coachDecision.suppressedReason,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:422:    coachUtteranceFamily: coachDecision.utteranceFamily,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:423:    coachTemplateId: coachDecision.debug?.selectedTemplateId as string | undefined,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:428:    coachSurfacePolicy,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:440:  const instructionFrame = buildCurrentInstructionFrame({
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:448:      input.trainingMode === "restricted" && expectedMoveResolution.expectedMoveUci
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:449:        ? { uci: expectedMoveResolution.expectedMoveUci, san: expectedMoveResolution.expectedMoveSan, source: expectedMoveResolution.source }
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:457:  const instructionTarget = instructionFrame.target;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:458:  const currentSelectedCandidateUci = instructionTarget?.kind === "continuation_candidate" ? instructionTarget.uci : null;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:459:  const currentSelectedCandidateSan = instructionTarget?.kind === "continuation_candidate" ? instructionTarget.san : null;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:462:  const coachDecisionForDebug = {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:463:    ...coachDecision,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:465:      ...(coachDecision.debug ?? {}),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:466:      coachMoveUci: (coachDecision.debug as any)?.coachMoveUci ?? instructionTarget?.uci ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:467:      coachPieceType: (coachDecision.debug as any)?.coachPieceType ?? instructionTarget?.pieceType ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:468:      coachIntent:
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:469:        (coachDecision.debug as any)?.coachIntent === "silent" && instructionTarget
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:471:          : (coachDecision.debug as any)?.coachIntent ?? (instructionTarget ? "show_plan" : "silent"),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:472:      advancedFeatureClaimTypes: (coachDecision.debug as any)?.advancedFeatureClaimTypes ?? (instructionTarget ? [`piece:${instructionTarget.pieceType}`] : []),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:473:      recognizedPlanTypes: (coachDecision.debug as any)?.recognizedPlanTypes ?? (instructionTarget ? [`target:${instructionTarget.kind}`] : []),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:474:      selectedOpportunityId: (coachDecision.debug as any)?.selectedOpportunityId ?? (instructionTarget ? `instruction_target:${instructionTarget.uci}` : undefined),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:475:      selectedTemplateId: (coachDecision.debug as any)?.selectedTemplateId ?? (instructionTarget ? "verified_move_fact_fallback" : undefined),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:476:      coachVerifiedFactsUsed: (coachDecision.debug as any)?.coachVerifiedFactsUsed ?? Boolean(instructionTarget),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:477:      verifiedFallbackUsed: (coachDecision.debug as any)?.verifiedFallbackUsed ?? true,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:478:      fallbackReason: (coachDecision.debug as any)?.fallbackReason ?? (instructionTarget ? "qa_fallback" : undefined),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:490:    expectedMoveResolution,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:491:    instructionTargetUci: instructionTarget?.uci ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:492:    instructionTargetPieceType: instructionTarget?.pieceType ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:505:    coachDecision: coachDecisionForDebug,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:506:    coachMoveUci: (coachDecisionForDebug.debug as any)?.coachMoveUci ?? instructionTarget?.uci ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:507:    coachPieceType: (coachDecisionForDebug.debug as any)?.coachPieceType ?? instructionTarget?.pieceType ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:508:    revealTargetUci: instructionTarget?.uci ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:525:    coachSurfacePolicyAffectsVisualLayer: false,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:527:    selectedLineId: String(expectedMoveResolution.debug?.selectedLineId ?? "qa"),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:530:    selectedOpportunityId: coachDecision.debug?.selectedOpportunityId ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:531:    selectedTemplateId: coachDecision.debug?.selectedTemplateId ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:532:    selectedOpportunityMoveSan: coachDecision.debug?.coachSelectedCandidateMove ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:533:    selectedOpportunityMoveUci: coachDecision.debug?.coachSelectedCandidateMove ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:534:    selectedOpportunityLayer: coachDecision.debug?.selectedOpportunityLayer ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:535:    visibleCoachOwner: presentationFrame.coach.owner,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:536:    coachInteraction: input.coachInteraction ?? "none",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:538:    coachHiddenForFrame: Boolean(input.coachHiddenForFrame),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:539:    lastActionDebug: input.coachInteraction
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:541:          lastClickedAction: input.coachInteraction,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:542:          normalizedAction: input.coachInteraction,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:543:          stateChanged: input.coachInteraction === "hide" ? false : true,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:544:          revealTargetUci: currentSelectedCandidateUci,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:545:          revealTargetSource: expectedMoveResolution.source,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:546:          revealIdempotentNoop: false,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:547:          revealBlockedBecauseCoachHidden: false,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:556:    selectedCandidateSource: input.trainingMode === "continuation" ? expectedMoveResolution.source : expectedMoveResolution.source,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:559:      opponentVariationReason: expectedMoveResolution.reason,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:561:      candidateOpponentBranches: expectedMoveResolution.candidateMoves.map((candidate) => ({
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:579:    expectedMoveResolution,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:581:    coachDecision: coachDecisionForDebug as any,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:593:    revealTargetUci: instructionTarget?.uci ?? null,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:594:    revealTargetSource: expectedMoveResolution.source,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:610:  const visibleCoach = frame.presentationFrame.coach.owner !== "none";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:612:  assert.equal(frame.coachDecision.shouldShowCoachCard || frame.presentationFrame.coach.owner === "branch_transition_surface", true, `${label}: coach should be visible or branch transition should render`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:613:  if (frame.presentationFrame.coach.owner !== "branch_transition_surface") {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:614:    assert.equal(String(frame.coachDecision.debug?.coachIntent ?? "silent") !== "silent", true, `${label}: coach intent should not be silent when coach is visible`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:617:    Boolean(frame.coachDecision.debug?.selectedOpportunityId || frame.coachDecision.debug?.selectedTemplateId || frame.coachDecision.debug?.candidateCoachFallbackUsed || frame.presentationFrame.coach.owner === "branch_transition_surface"),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:619:    `${label}: coach should be backed by a selected opportunity, template, candidate fallback, or branch transition surface`,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:621:  const body = String(frame.presentationFrame.coach.body ?? frame.coachDecision.body ?? "");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:626:  const quality = (frame.coachDecision.debug as any)?.coachQuality;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:628:    assert.equal(Number(quality.qualityScore) >= 65, true, `${label}: coach quality below threshold`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:639:function assertRevealTargetsCurrentMove(frame: BuiltFrame, expectedUci: string | null, label: string): void {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:641:    assert.equal(frame.phaseActionGate.revealButtonVisible, false, `${label}: reveal should stay hidden without an expected move`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:644:  assert.equal(frame.debugSnapshot.actions.revealTargetUci ?? frame.revealTargetUci, expectedUci, `${label}: reveal target should match the current move`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:648:  const instructionTargetUci = (frame.debugSnapshot.frame as any).instructionTargetUci ?? null;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:649:  const coachMoveUci = (frame.debugSnapshot.coach as any).coachMoveUci ?? null;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:651:  const revealTargetUci = (frame.debugSnapshot.actions as any).revealTargetUci ?? frame.revealTargetUci ?? null;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:652:  if (!instructionTargetUci) return;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:653:  assert.equal(coachMoveUci, instructionTargetUci, `${label}: coachMoveUci must match instruction target`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:654:  if (visualMoveUci) assert.equal(visualMoveUci, instructionTargetUci, `${label}: visualMoveUci must match instruction target`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:655:  if (revealTargetUci) assert.equal(revealTargetUci, instructionTargetUci, `${label}: revealTargetUci must match instruction target`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:663:function assertFrameContract(frame: BuiltFrame, label: string, expected: { trainerPhase: string; trainingMode: "restricted" | "continuation"; isUserTurn: boolean; sideToMove: "w" | "b"; expectedMoveSource: string | string[]; expectedMoveAllowed?: boolean; }) {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:668:  const allowed = Array.isArray(expected.expectedMoveSource) ? expected.expectedMoveSource : [expected.expectedMoveSource];
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:669:  assert.equal(allowed.includes(frame.expectedMoveResolution.source), true, `${label}: expectedMoveSource mismatch: ${frame.expectedMoveResolution.source}`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:670:  if (expected.expectedMoveAllowed !== undefined) {
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:671:    assert.equal(Boolean(frame.expectedMoveResolution.expectedMoveUci), expected.expectedMoveAllowed, `${label}: expectedMoveAllowed mismatch`);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:699:    expectedMoveOverride: { uci: "e2e4", san: "e4" },
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:701:  assertFrameContract(mainStart, "mainline start", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch"] , expectedMoveAllowed: true });
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:704:  assertNoCriticalIssues(mainStart, ["stale_selected_candidate", "visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition", "guided_complete_without_policy", "restricted_line_exhausted_but_completion_blocked", "branch_transition_missing", "reveal_failed_with_revealable_target"], "mainline start");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:705:  assertRevealTargetsCurrentMove(mainStart, mainStart.expectedMoveResolution.expectedMoveUci, "mainline start");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:720:  assertFrameContract(afterE4, "after e4 opponent turn", { trainerPhase: "opponent_selecting", trainingMode: "restricted", isUserTurn: false, sideToMove: "b", expectedMoveSource: ["opponent_to_move", "none"], expectedMoveAllowed: false });
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:722:  assert.equal(afterE4.phaseActionGate.revealButtonVisible, false);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:726:  assertNoCriticalIssues(afterE4, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition", "guided_complete_without_policy", "restricted_line_exhausted_but_completion_blocked", "branch_transition_missing"], "after e4");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:740:  assertFrameContract(afterE5, "after e5 user turn", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch", "transposition"], expectedMoveAllowed: true });
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:743:  assert.equal(afterE5.phaseActionGate.revealButtonVisible, true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:760:  assertFrameContract(afterNf3, "after Nf3 opponent turn", { trainerPhase: "opponent_selecting", trainingMode: "restricted", isUserTurn: false, sideToMove: "b", expectedMoveSource: ["opponent_to_move", "none"], expectedMoveAllowed: false });
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:777:  assertFrameContract(afterNc6, "after Nc6 user turn", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch", "transposition"], expectedMoveAllowed: true });
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:781:  assert.equal(afterNc6.coachDecision.debug?.coachSelectedCandidateMove === "Bc4" || afterNc6.coachDecision.debug?.coachSelectedCandidateMove === "f1c4", true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:797:  assertFrameContract(afterC5, "after c5 branch", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch", "transposition", "opening_family_plan", "guided_branch_needs_continuation"], expectedMoveAllowed: true });
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:817:  assert.equal(afterNf3Branch.phaseActionGate.revealButtonVisible, false);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:832:  assert.equal(afterSideline.expectedMoveResolution.source === "guided_branch_needs_continuation" || afterSideline.branchTransitionSurfaceRendered || afterSideline.expectedMoveResolution.source === "opening_family_plan", true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:850:  assertFrameContract(continuationStart, "continuation start", { trainerPhase: "ready_for_user", trainingMode: "continuation", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["continuation_candidate", "guided_branch_needs_continuation"], expectedMoveAllowed: true });
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:860:  assertNoCriticalIssues(continuationStart, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition"], "continuation start");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:877:    continuationAfter1.coachDecision.shouldShowCoachCard ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:878:      continuationAfter1.presentationFrame.coach.owner === "branch_transition_surface" ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:879:      continuationAfter1.presentationFrame.coach.owner === "none",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:900:    continuationAfter2.coachDecision.shouldShowCoachCard ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:901:      continuationAfter2.presentationFrame.coach.owner === "branch_transition_surface" ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:902:      continuationAfter2.presentationFrame.coach.owner === "none",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:916:  assert.equal(plainStart.phaseActionGate.revealButtonVisible, true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:917:  assert.equal(Boolean(String(plainStart.coachDecision.body ?? "").includes("Bc4")), false);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:918:  assert.equal(Boolean(String(plainStart.coachDecision.body ?? "").includes("Position context")), false);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:920:  const plainRevealed = buildFrame({
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:929:    coachInteraction: "answer",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:931:  assert.equal(plainRevealed.phaseActionGate.revealButtonVisible, true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:932:  const plainRevealedSan = plainRevealed.expectedMoveResolution.expectedMoveSan ?? plainRevealed.expectedMoveResolution.expectedMoveUci ?? "";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:933:  assert.equal(Boolean(plainRevealedSan && (String(plainRevealed.coachDecision.body ?? "").includes(plainRevealedSan) || String(plainRevealed.coachDecision.answer ?? "").includes(plainRevealedSan))), true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:948:  assert.equal(transpositionFrame.expectedMoveResolution.source, "transposition");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:949:  assert.equal(transpositionFrame.expectedMoveResolution.expectedMoveSan, "Nf3");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:962:  assert.equal(providedBranchRestricted.expectedMoveResolution.source === "none" || providedBranchRestricted.expectedMoveResolution.source === "opening_family_plan" || providedBranchRestricted.expectedMoveResolution.source === "guided_branch_needs_continuation", true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:963:  assert.equal(providedBranchRestricted.branchTransitionSurfaceRendered || Boolean(providedBranchRestricted.expectedMoveResolution.expectedMoveUci), true);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:984:    ["continuation_candidate", "guided_branch_needs_continuation", "none"].includes(providedContinuation.expectedMoveResolution.source),
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:993:    providedContinuation.coachDecision.shouldShowCoachCard ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:994:      providedContinuation.presentationFrame.coach.owner === "branch_transition_surface" ||
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:995:      providedContinuation.presentationFrame.coach.owner === "none",
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:998:  assertNoCriticalIssues(providedContinuation, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition"], "provided continuation");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:1017:    coachHiddenForFrame: true,
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:1021:  assert.equal(hiddenContinuation.presentationFrame.coach.shouldRender, false);
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:1026:  assertNoCriticalIssues(hiddenContinuation, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered"], "hidden continuation");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:1040:  assert.equal(Boolean(postRestartInitial.expectedMoveResolution.expectedMoveUci), true, "restart first frame must restore guided target");
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:1041:  assert.equal(["e2e4", "d2d4"].includes(String(postRestartInitial.expectedMoveResolution.expectedMoveUci ?? "")), true, "restart first guided target should be line start move");
lib/blundr/debug/__tests__/trainerDebugEventLog.test.ts:8:    events = appendDebugEvent(events, { type: "coach_action_clicked", action: "hint", result: "handled" });
lib/blundr/debug/__tests__/trainerDebugEventLog.test.ts:11:  assert.equal(events[events.length - 1].type, "coach_action_clicked");
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:5:import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:16:    expectedMoveSan: "Bc4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:17:    expectedMoveUci: "f1c4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:18:    coachDecision: {
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:25:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "intent_first_coach" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:41:    coachDecision: { exactMoveAllowed: true },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:43:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:49:  const reveal = buildTrainerDebugSnapshot({
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:57:    lastActionDebug: { lastClickedAction: "reveal_next_move", stateChanged: false },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:58:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:61:  assert.equal(reveal.health.criticalIssues.some((issue) => issue.includes("Action click")), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:71:    expectedMoveResolution: { source: "none", reason: "no_repertoire_node_or_plan_fallback", debug: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:72:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:88:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "branch_transition_surface", intent: "branch_transition", title: "Line complete", body: "You finished this training line. Continue from this position or train the line again.", buttons: ["continue_from_here","restart_line"] }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:93:  assert.equal(unresolvedWithTransition.coach.visibleTitle, "Line complete");
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:94:  assert.deepEqual(unresolvedWithTransition.coach.visibleButtons, ["continue_from_here","restart_line"]);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:104:    expectedMoveSan: "exd5",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:105:    expectedMoveUci: "e4d5",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:110:    coachDecision: {
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:116:      debug: { candidateCoachFallbackUsed: true, coachIntent: "show_continued_plan", coachVerifiedFactsUsed: true, coachMoveUci: "e4d5", coachPieceType: "p", advancedFeatureClaimTypes: ["piece:p"], recognizedPlanTypes: ["target:continuation_candidate"], selectedOpportunityId: "instruction_target:e4d5" },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:118:    instructionTargetUci: "e4d5",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:119:    instructionTargetPieceType: "p",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:120:    coachMoveUci: "e4d5",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:121:    coachPieceType: "p",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:123:    revealTargetUci: "e4d5",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:124:    presentationFrame: { visual: { shouldRender: true, source: "continuation_candidate", lines: [{ from: "e4", to: "d5" }] }, coach: { owner: "intent_first_coach" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:129:  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_coach_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:131:  assert.equal(continuationHealthy.health.criticalIssues.includes("instruction_target_reveal_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:132:  assert.equal((continuationHealthy.actions as any).revealTargetMatchesInstructionTarget, true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:134:  assert.equal((continuationHealthy.health.passFail as any).instructionTargetAligned, true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:136:  const idempotentReveal = buildTrainerDebugSnapshot({
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:144:    lastActionDebug: { lastClickedAction: "reveal_next_move", stateChanged: false, revealIdempotentNoop: true },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:145:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:148:  assert.equal(idempotentReveal.health.criticalIssues.some((issue) => issue.includes("Action click")), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:158:    instructionTargetUci: "g1f3",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:159:    instructionTargetPieceType: "n",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:160:    coachMoveUci: "g1f3",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:161:    coachPieceType: "b",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:163:    coachDecision: { debug: { advancedFeatureClaimTypes: ["piece:n"], recognizedPlanTypes: ["target:continuation_candidate"], selectedOpportunityId: "instruction_target:g1f3" } },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:164:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:168:  assert.equal(pieceMismatch.health.criticalIssues.includes("coach_piece_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:179:      { trainerPhase: "ready_for_user", instructionTargetUci: "e2e4", instructionTargetPieceType: "p", body: "e5 develops the bishop to e5 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:180:      { trainerPhase: "ready_for_user", instructionTargetUci: "f2f4", instructionTargetPieceType: "p", body: "f4 develops the bishop to f4 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:181:      { trainerPhase: "ready_for_user", instructionTargetUci: "g1f3", instructionTargetPieceType: "n", body: "Nf3 develops the bishop to f3 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:182:      { trainerPhase: "ready_for_user", instructionTargetUci: "g1f3", instructionTargetPieceType: "n", body: "Nf3 develops the bishop to f3 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:183:      { trainerPhase: "ready_for_user", instructionTargetUci: "e2e4", instructionTargetPieceType: "p", body: "e5 develops the bishop to e5 on an active diagonal.", normalizedBody: "{MOVE} develops the bishop to {SQUARE} on an active diagonal." },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:185:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:189:  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_coach_piece_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:190:  assert.equal(recentUnsafe.health.criticalIssues.includes("recent_repeated_generic_coach_copy"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:200:    instructionTargetUci: "e2e4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:201:    coachMoveUci: "e2e4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:203:    revealTargetUci: "e2e4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:204:    revealTargetSource: "instruction_target",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:205:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "intent_first_coach" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:218:    instructionTargetUci: "e2e4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:219:    coachMoveUci: "e2e4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:220:    revealTargetUci: "e2e4",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:221:    revealTargetSource: "instruction_target",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:222:    coachFrameStale: true,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:224:    revealTargetStale: true,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:226:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:229:  assert.equal(staleFrames.health.criticalIssues.includes("stale_coach_frame"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:231:  assert.equal(staleFrames.health.criticalIssues.includes("stale_reveal_target"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:249:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:265:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:271:  const nextFrame = buildCurrentInstructionFrame({
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:291:    expectedMoveUci: target.uci,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:292:    expectedMoveSan: target.san,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:293:    instructionTargetKind: target.kind,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:294:    instructionTargetUci: target.uci,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:295:    instructionTargetPieceType: target.pieceType,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:296:    coachMoveUci: target.uci,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:297:    coachPieceType: target.pieceType,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:299:    revealTargetUci: target.uci,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:300:    revealTargetSource: "instruction_target",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:302:    coachDecision: {
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:308:        coachMoveUci: target.uci,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:309:        coachPieceType: target.pieceType,
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:325:      coach: { shouldRender: true, owner: "intent_first_coach" },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:340:    instructionTargetUci: "b1c3",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:341:    instructionTargetPieceType: "n",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:342:    coachMoveUci: "b1c3",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:343:    coachPieceType: "n",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:344:    coachDecision: {
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:349:        coachDecisionSource: "live_coach",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:356:    presentationFrame: { visual: { shouldRender: true, source: "guided_target_fallback", lines: [{ from: "b1", to: "c3" }] }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:359:  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_theme_opportunity_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:360:  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_template_theme_mismatch"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:361:  assert.equal(provenanceMismatch.health.criticalIssues.includes("coach_score_missing"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:371:    instructionTargetUci: "b1c3",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:372:    instructionTargetPieceType: "n",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:373:    coachMoveUci: "b1c3",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:374:    coachPieceType: "n",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:375:    coachDecision: {
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:380:        coachDecisionSource: "live_coach",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:388:    coachTimeline: [
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:399:    presentationFrame: { visual: { shouldRender: true, source: "guided_target_fallback", lines: [{ from: "b1", to: "c3" }] }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:402:  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_theme_opportunity_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:403:  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_template_theme_mismatch"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:404:  assert.equal(provenanceHealthy.health.criticalIssues.includes("coach_score_missing"), false);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:405:  assert.equal((provenanceHealthy.coachTimelineSummary as any).instructionalFrames, 1);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:415:    instructionTargetUci: "e1e2",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:416:    instructionTargetPieceType: "k",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:417:    coachMoveUci: "e1e2",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:418:    coachPieceType: "k",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:419:    coachDecision: { debug: { coachDecisionSource: "verified_safe_fallback", selectedOpportunityScore: 100 } },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:420:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:423:  assert.equal(fallbackMismatch.health.criticalIssues.includes("coach_provenance_inconsistent"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:433:    instructionTargetUci: "e1e2",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:434:    instructionTargetPieceType: "k",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:435:    coachMoveUci: "e1e2",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:436:    coachPieceType: "k",
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:438:    coachDecision: { debug: { selectedOpportunityScore: 120 } },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:439:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { shouldRender: true, owner: "intent_first_coach" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:442:  assert.equal(historyWarning.health.warnings.includes("coach_status_copy_in_instructional_history"), true);
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:461:    presentationFrame: { visual: { shouldRender: false, source: "none" }, coach: { owner: "none" }, legacy: {} },
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:467:    // mirrors page.tsx declaration order (raw state -> expectedMoveResolution -> expectedMovesForValidation -> selectedLineCompleteConfirmed -> lichessEndConfirmed -> isInstructionLoading -> hardEndOfBookGate -> continuationPolicyCandidate -> currentInstructionFrame)
lib/blundr/debug/__tests__/trainerDebugSnapshot.test.ts:475:    const _frame = { frameKey: sel ? "end-of-book-transition" : "thinking", actions: gate ? ["continue_from_here"] : [] };
lib/blundr/debug/testTrainerDebug.ts:6:import { testCurrentInstructionFrame } from "../runtime/__tests__/currentInstructionFrame.test";
lib/blundr/debug/testTrainerDebug.ts:9:import { testCoachActionStylePolicy } from "../presentation/__tests__/coachActionStylePolicy.test";
lib/blundr/debug/testTrainerDebug.ts:19:  testCurrentInstructionFrame();
lib/blundr/debug/testTrainerDebug.ts:26:  console.log("✓ coach action style policy passed");
lib/blundr/debug/trainerDebugSnapshot.ts:29:  const body = String(input.coachDecision?.body ?? "");
lib/blundr/debug/trainerDebugSnapshot.ts:30:  const expected = input.expectedMoveSan || input.expectedMoveUci;
lib/blundr/debug/trainerDebugSnapshot.ts:31:  if (!input.coachDecision?.shouldShowCoachCard) return "none";
lib/blundr/debug/trainerDebugSnapshot.ts:32:  if (input.coachDebug?.selectedOpportunityLayer === "fallback" && expected) return "generic_fallback_won";
lib/blundr/debug/trainerDebugSnapshot.ts:34:  if (input.coachDebug?.mappingBlockedReasons?.length && input.coachDebug?.selectedTemplateId == null) return "template_blocked";
lib/blundr/debug/trainerDebugSnapshot.ts:35:  if (input.coachDebug?.coachSafetyWarnings?.length) return "safety_linter_blocked";
lib/blundr/debug/trainerDebugSnapshot.ts:36:  if (/Improve the knight/i.test(body) && input.expectedMoveUci && !/^[bg][1-8][a-h][1-8]/.test(input.expectedMoveUci)) return "generic_fallback_won";
lib/blundr/debug/trainerDebugSnapshot.ts:40:function expectedMoveAlignment(input: any): string {
lib/blundr/debug/trainerDebugSnapshot.ts:41:  const selectedMove = input.coachDebug?.selectedOpportunityMoveUci ?? input.coachDecision?.debug?.coachSelectedCandidateMove;
lib/blundr/debug/trainerDebugSnapshot.ts:42:  if (!input.expectedMoveUci && !input.expectedMoveSan) return "unknown";
lib/blundr/debug/trainerDebugSnapshot.ts:43:  if (selectedMove === input.expectedMoveUci || selectedMove === input.expectedMoveSan) return "matches_expected_move";
lib/blundr/debug/trainerDebugSnapshot.ts:44:  if (input.visualRecipe?.moveUci === input.expectedMoveUci) return "matches_visual_recipe";
lib/blundr/debug/trainerDebugSnapshot.ts:77:  const coachDebug = input.coachDecision?.debug ?? {};
lib/blundr/debug/trainerDebugSnapshot.ts:79:  const presentationCoach = presentation.coach ?? {};
lib/blundr/debug/trainerDebugSnapshot.ts:80:  const visibleTitle = presentationCoach.shouldRender ? presentationCoach.title ?? null : input.coachDecision?.shouldShowCoachCard ? input.coachDecision?.title ?? null : null;
lib/blundr/debug/trainerDebugSnapshot.ts:81:  const visibleBody = presentationCoach.shouldRender ? presentationCoach.body ?? null : input.coachDecision?.shouldShowCoachCard ? input.coachDecision?.body ?? null : null;
lib/blundr/debug/trainerDebugSnapshot.ts:83:  const visibleButtons = presentationCoach.shouldRender ? presentationCoach.buttons ?? [] : input.coachDecision?.shouldShowCoachCard ? input.coachDecision?.buttons ?? [] : [];
lib/blundr/debug/trainerDebugSnapshot.ts:85:  const visibleCoachIntent = presentationCoach.intent ?? input.coachDecision?.debug?.coachIntent ?? input.coachDecision?.debug?.selectedIntent ?? null;
lib/blundr/debug/trainerDebugSnapshot.ts:87:  const coachFailureKind = inferCoachFailure({ ...input, coachDebug });
lib/blundr/debug/trainerDebugSnapshot.ts:89:  const instructionTargetUci = input.instructionTargetUci ?? null;
lib/blundr/debug/trainerDebugSnapshot.ts:90:  const instructionTargetPieceType = input.instructionTargetPieceType ?? null;
lib/blundr/debug/trainerDebugSnapshot.ts:91:  const coachMoveUci = input.coachMoveUci ?? coachDebug.coachMoveUci ?? null;
lib/blundr/debug/trainerDebugSnapshot.ts:92:  const coachPieceType = input.coachPieceType ?? coachDebug.coachPieceType ?? null;
lib/blundr/debug/trainerDebugSnapshot.ts:94:  const revealTargetUci = input.revealTargetUci ?? input.lastActionDebug?.revealTargetUci ?? null;
lib/blundr/debug/trainerDebugSnapshot.ts:95:  const revealTargetSource = input.revealTargetSource ?? input.lastActionDebug?.revealTargetSource ?? null;
lib/blundr/debug/trainerDebugSnapshot.ts:99:    (instructionTargetUci && visualRecipeMoveUci ? visualRecipeMoveUci === instructionTargetUci : "unknown");
lib/blundr/debug/trainerDebugSnapshot.ts:102:  const coachQuality = (input.coachQuality ?? coachDebug.coachQuality ?? {}) as any;
lib/blundr/debug/trainerDebugSnapshot.ts:103:  const containsDebugLeak = Boolean(coachQuality.containsDebugLeak) || hasDebugLeakText(visibleBodyText);
lib/blundr/debug/trainerDebugSnapshot.ts:105:    ? input.lastCoachRecords.filter((record: any) => record?.trainerPhase === "ready_for_user" && record?.instructionTargetUci).slice(-5)
lib/blundr/debug/trainerDebugSnapshot.ts:108:  const coachTimeline = Array.isArray(input.coachTimeline) ? input.coachTimeline.slice(-100) : [];
lib/blundr/debug/trainerDebugSnapshot.ts:109:  const verifiedFallbackUsed = Boolean(coachDebug.verifiedFallbackUsed || coachDebug.candidateCoachFallbackUsed);
lib/blundr/debug/trainerDebugSnapshot.ts:110:  const expectedMoveExists = Boolean(input.expectedMoveSan || input.expectedMoveUci);
lib/blundr/debug/trainerDebugSnapshot.ts:111:  const selectedOpportunityMoveSan = String(input.coachDecision?.debug?.coachSelectedCandidateMove ?? input.coachDebug?.selectedOpportunityMoveSan ?? "").trim();
lib/blundr/debug/trainerDebugSnapshot.ts:113:  const selectedTheme = String(coachDebug.selectedTheme ?? coachQuality.selectedTheme ?? "").trim() || null;
lib/blundr/debug/trainerDebugSnapshot.ts:114:  const selectedOpportunityId = String(coachDebug.selectedOpportunityId ?? "").trim() || null;
lib/blundr/debug/trainerDebugSnapshot.ts:115:  const selectedTemplateId = String(coachDebug.selectedTemplateId ?? coachDebug.mappingTemplateId ?? "").trim() || null;
lib/blundr/debug/trainerDebugSnapshot.ts:116:  const selectedOpportunityLayer = String(coachDebug.selectedOpportunityLayer ?? "").trim() || null;
lib/blundr/debug/trainerDebugSnapshot.ts:117:  const selectedOpportunityScoreRaw = Number(coachDebug.selectedOpportunityScore ?? Number.NaN);
lib/blundr/debug/trainerDebugSnapshot.ts:119:  const coachSource = String(coachDebug.coachDecisionSource ?? coachQuality.source ?? "live_coach");
lib/blundr/debug/trainerDebugSnapshot.ts:120:  const qualityScoreRaw = Number(coachQuality.qualityScore ?? Number.NaN);
lib/blundr/debug/trainerDebugSnapshot.ts:122:  const expectedMoveResolution = input.expectedMoveResolution ?? {};
lib/blundr/debug/trainerDebugSnapshot.ts:129:      visibleButtons.includes("continue_from_here") &&
lib/blundr/debug/trainerDebugSnapshot.ts:141:  // AND there is no evidence of a terminal surface (presentation coach owner, explicit feedback, or continuation terminal detection).
lib/blundr/debug/trainerDebugSnapshot.ts:146:    presentationCoach.owner === "intent_first_coach" ||
lib/blundr/debug/trainerDebugSnapshot.ts:148:    input.coachDecision?.shouldShowCoachCard;
lib/blundr/debug/trainerDebugSnapshot.ts:156:    expectedMoveResolution.source === "none" &&
lib/blundr/debug/trainerDebugSnapshot.ts:167:    expectedMoveResolution.source === "guided_branch_needs_continuation" &&
lib/blundr/debug/trainerDebugSnapshot.ts:169:    !expectedMoveResolution.shouldTransitionToContinuation
lib/blundr/debug/trainerDebugSnapshot.ts:171:  if (input.trainingMode === "restricted" && expectedMoveResolution.source === "engine_preview_fallback" && !expectedMoveResolution.debug?.engineFallbackInRestrictedUsed) criticalIssues.push("expected_move_source_engine_used_in_restricted_without_policy");
lib/blundr/debug/trainerDebugSnapshot.ts:173:    expectedMoveResolution.expectedMoveUci &&
lib/blundr/debug/trainerDebugSnapshot.ts:178:  if (expectedMoveResolution.source === "opening_family_plan" && !expectedMoveResolution.debug?.openingFamilyPlanType) criticalIssues.push("opening_family_plan_used_without_plan_or_feature");
lib/blundr/debug/trainerDebugSnapshot.ts:179:  if (input.coachDecision?.title === "Opening pattern" && ["opening_branch", "opening_family_plan", "transposition"].includes(expectedMoveResolution.source)) warnings.push("generic_coach_copy_used_for_branch_response");
lib/blundr/debug/trainerDebugSnapshot.ts:180:  if (selectedOpportunityMoveExists && !expectedMoveResolution.expectedMoveUci && input.trainingMode === "restricted") criticalIssues.push("selectedOpportunityMoveSan exists but expectedMoveUci null");
lib/blundr/debug/trainerDebugSnapshot.ts:181:  if (expectedMoveExists && coachDebug.selectedOpportunityLayer === "fallback") criticalIssues.push("expectedMove exists but fallback opportunity selected");
lib/blundr/debug/trainerDebugSnapshot.ts:182:  if (input.coachDecision?.title === "Opening pattern" && expectedMoveExists && coachFailureKind !== "none") criticalIssues.push("Opening pattern title is paired with a suspicious/fallback coach decision");
lib/blundr/debug/trainerDebugSnapshot.ts:183:  if (/Improve the knight/i.test(String(input.coachDecision?.body ?? "")) && input.expectedMoveUci && !["b", "g"].includes(String(input.expectedMoveUci)[0])) criticalIssues.push("Knight improvement copy shown for non-knight expected move");
lib/blundr/debug/trainerDebugSnapshot.ts:184:  if (input.lastActionDebug?.lastClickedAction && input.lastActionDebug?.stateChanged === false && !input.lastActionDebug?.revealIdempotentNoop) criticalIssues.push("Action click did not change state");
lib/blundr/debug/trainerDebugSnapshot.ts:185:  if (input.trainingMode === "continuation" && input.selectedCandidateUci && input.coachDecision?.exactMoveAllowed && continuationLinesPassedToBoard === 0) criticalIssues.push("continuation_candidate_not_rendered");
lib/blundr/debug/trainerDebugSnapshot.ts:190:  if (continuationTerminalDetected && presentationCoach.owner !== "intent_first_coach" && presentationCoach.owner !== "continuation_terminal_surface" && presentationCoach.shouldRender !== true) criticalIssues.push("terminal_position_without_terminal_surface");
lib/blundr/debug/trainerDebugSnapshot.ts:193:  if (isTeachingFrame(input) && instructionTargetUci == null && !branchTransitionSurfaceRendered) criticalIssues.push("instruction_target_missing_on_teaching_frame");
lib/blundr/debug/trainerDebugSnapshot.ts:194:  if (input.isUserTurn && instructionTargetUci == null && String(input.trainerPhase) === "ready_for_user" && !branchTransitionSurfaceRendered) {
lib/blundr/debug/trainerDebugSnapshot.ts:198:  if (instructionTargetUci && presentationCoach.shouldRender === false && !branchTransitionSurfaceRendered) criticalIssues.push("coach_missing_for_instruction_target");
lib/blundr/debug/trainerDebugSnapshot.ts:199:  if (instructionTargetUci && presentationCoach.shouldRender === false && !branchTransitionSurfaceRendered) criticalIssues.push("silent_coach_with_instruction_target");
lib/blundr/debug/trainerDebugSnapshot.ts:200:  if (instructionTargetUci && containsDebugLeak) criticalIssues.push("debug_copy_leaked_to_user");
lib/blundr/debug/trainerDebugSnapshot.ts:201:  if (instructionTargetUci && coachMoveUci && instructionTargetUci !== coachMoveUci) {
lib/blundr/debug/trainerDebugSnapshot.ts:202:    criticalIssues.push("coach_move_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:203:    criticalIssues.push("instruction_target_coach_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:212:  if (instructionTargetUci && visualMoveUci && instructionTargetUci !== visualMoveUci) {
lib/blundr/debug/trainerDebugSnapshot.ts:216:  if (instructionTargetUci && revealTargetUci && instructionTargetUci !== revealTargetUci) {
lib/blundr/debug/trainerDebugSnapshot.ts:217:    criticalIssues.push("reveal_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:218:    criticalIssues.push("instruction_target_reveal_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:220:  if (instructionTargetUci && (coachMoveUci !== instructionTargetUci || (visualMoveUci && visualMoveUci !== instructionTargetUci) || (revealTargetUci && revealTargetUci !== instructionTargetUci))) {
lib/blundr/debug/trainerDebugSnapshot.ts:223:  if (instructionTargetPieceType && coachPieceType && instructionTargetPieceType !== coachPieceType) {
lib/blundr/debug/trainerDebugSnapshot.ts:224:    criticalIssues.push("coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:227:  if (instructionTargetUci && isTeachingFrame(input)) {
lib/blundr/debug/trainerDebugSnapshot.ts:228:    const featureStatus = String(coachDebug.featurePacket?.status ?? input.featurePacket?.status ?? "not_exposed_from_module");
lib/blundr/debug/trainerDebugSnapshot.ts:229:    const planStatus = String(coachDebug.planPacket?.status ?? input.planPacket?.status ?? "not_exposed_from_module");
lib/blundr/debug/trainerDebugSnapshot.ts:230:    const oppStatus = String(coachDebug.opportunityPacket?.status ?? input.opportunityPacket?.status ?? "not_exposed_from_module");
lib/blundr/debug/trainerDebugSnapshot.ts:234:    if ((coachQuality.targetAligned ?? (coachMoveUci === instructionTargetUci)) !== true) criticalIssues.push("coach_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:235:    if ((coachQuality.pieceAligned ?? (!instructionTargetPieceType || !coachPieceType || instructionTargetPieceType === coachPieceType)) !== true) criticalIssues.push("coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:236:    const score = Number(coachQuality.qualityScore ?? 0);
lib/blundr/debug/trainerDebugSnapshot.ts:238:      const source = String(coachDebug.coachDecisionSource ?? coachQuality.source ?? "live_coach");
lib/blundr/debug/trainerDebugSnapshot.ts:240:      if (score < required) criticalIssues.push("coach_low_quality");
lib/blundr/debug/trainerDebugSnapshot.ts:242:    if (selectedOpportunityScore == null) criticalIssues.push("coach_score_missing");
lib/blundr/debug/trainerDebugSnapshot.ts:244:      criticalIssues.push("coach_theme_opportunity_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:245:      criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:248:      criticalIssues.push("coach_template_theme_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:249:      criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:254:    if (!["live_coach", "verified_coach_explanation", "verified_safe_fallback"].includes(coachSource)) {
lib/blundr/debug/trainerDebugSnapshot.ts:255:      warnings.push("coach_source_unknown");
lib/blundr/debug/trainerDebugSnapshot.ts:259:        coachDebug.verifiedFallbackUsed ??
lib/blundr/debug/trainerDebugSnapshot.ts:260:        coachDebug.candidateCoachFallbackUsed ??
lib/blundr/debug/trainerDebugSnapshot.ts:261:        coachQuality.usedFallback ??
lib/blundr/debug/trainerDebugSnapshot.ts:262:        coachSource === "verified_safe_fallback",
lib/blundr/debug/trainerDebugSnapshot.ts:264:    const runtimeSafeFallbackReason = String(input.runtimeSafeFallbackReason ?? coachDebug.fallbackReason ?? coachQuality.fallbackReason ?? "").trim() || null;
lib/blundr/debug/trainerDebugSnapshot.ts:265:    const qualityUsedFallback = Boolean(coachQuality.usedFallback);
lib/blundr/debug/trainerDebugSnapshot.ts:266:    if (coachSource === "verified_safe_fallback" && !runtimeSafeFallbackUsed) criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:267:    if (runtimeSafeFallbackUsed && !qualityUsedFallback) criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:268:    if ((coachSource === "verified_safe_fallback" || runtimeSafeFallbackUsed || qualityUsedFallback) && !runtimeSafeFallbackReason) {
lib/blundr/debug/trainerDebugSnapshot.ts:269:      criticalIssues.push("coach_provenance_inconsistent");
lib/blundr/debug/trainerDebugSnapshot.ts:272:  const featurePipelineConnected = coachDebug.advancedFeaturePacketExists === true || Array.isArray(coachDebug.advancedFeatureClaimTypes);
lib/blundr/debug/trainerDebugSnapshot.ts:273:  const planPipelineConnected = coachDebug.strategicPlanPacketExists === true || Array.isArray(coachDebug.recognizedPlanTypes);
lib/blundr/debug/trainerDebugSnapshot.ts:275:    coachDebug.selectedOpportunityId != null || coachDebug.opportunityCount != null || input.opportunityCount != null || verifiedFallbackUsed;
lib/blundr/debug/trainerDebugSnapshot.ts:277:    coachDebug.selectedTemplateId != null ||
lib/blundr/debug/trainerDebugSnapshot.ts:278:    coachDebug.mappingTemplateId != null ||
lib/blundr/debug/trainerDebugSnapshot.ts:279:    Array.isArray(coachDebug.templateCandidatesTop5) ||
lib/blundr/debug/trainerDebugSnapshot.ts:281:  if (instructionTargetUci && !featurePipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("feature_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:282:  if (instructionTargetUci && !planPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("plan_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:283:  if (instructionTargetUci && !opportunityPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("opportunity_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:284:  if (instructionTargetUci && !explanationPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("explanation_pipeline_not_connected");
lib/blundr/debug/trainerDebugSnapshot.ts:285:  if (instructionTargetUci && visualRecipeMoveUci && visualRecipeMoveUci !== instructionTargetUci) criticalIssues.push("visual_recipe_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:286:  if (instructionTargetUci && revealTargetSource && revealTargetSource !== "instruction_target") criticalIssues.push("reveal_target_source_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:287:  if (input.coachFrameStale) criticalIssues.push("stale_coach_frame");
lib/blundr/debug/trainerDebugSnapshot.ts:289:  if (input.revealTargetStale) criticalIssues.push("stale_reveal_target");
lib/blundr/debug/trainerDebugSnapshot.ts:291:  if (input.trainingMode === "continuation" && input.trainerPhase === "ready_for_user" && input.isUserTurn && instructionTargetUci && continuationLinesPassedToBoard === 0) {
lib/blundr/debug/trainerDebugSnapshot.ts:296:  if (input.trainingMode === "continuation" && input.trainerPhase === "ready_for_user" && input.isUserTurn && input.continuationAnalysisStatus === "ready" && !instructionTargetUci) {
lib/blundr/debug/trainerDebugSnapshot.ts:300:  if (instructionTargetUci && coachDebug.candidateCoachFallbackUsed && !coachDebug.coachVerifiedFactsUsed) criticalIssues.push("generic_fallback_without_verified_facts");
lib/blundr/debug/trainerDebugSnapshot.ts:301:  if (instructionTargetUci && String(input.trainerView) === "assisted" && !visualMoveUci) criticalIssues.push("assisted_view_target_without_visual");
lib/blundr/debug/trainerDebugSnapshot.ts:302:  if (instructionTargetUci && String(input.trainerView) === "assisted" && !visualMoveUci) criticalIssues.push("missing_visual_for_instruction_target");
lib/blundr/debug/trainerDebugSnapshot.ts:303:  const currentUnverifiedClaims = Array.isArray(coachDebug.unverifiedClaims) ? coachDebug.unverifiedClaims.map(String) : [];
lib/blundr/debug/trainerDebugSnapshot.ts:304:  if (instructionTargetUci && currentUnverifiedClaims.length) {
lib/blundr/debug/trainerDebugSnapshot.ts:315:      if (claim.includes("unsafe_unverified_coach_claim")) criticalIssues.push("unsafe_unverified_coach_claim");
lib/blundr/debug/trainerDebugSnapshot.ts:320:    const targetPiece = String(record?.instructionTargetPieceType ?? "");
lib/blundr/debug/trainerDebugSnapshot.ts:323:      criticalIssues.push("recent_coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:327:      criticalIssues.push("recent_coach_piece_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:332:    if (/\bdevelops?\b/.test(body) && record?.instructionTargetKind && record?.instructionTargetPieceType && !["n", "b", "r"].includes(targetPiece)) {
lib/blundr/debug/trainerDebugSnapshot.ts:338:    if (record?.coachMoveUci && record?.instructionTargetUci && record.coachMoveUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:339:    if (record?.visualMoveUci && record?.instructionTargetUci && record.visualMoveUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:340:    if (record?.revealTargetUci && record?.instructionTargetUci && record.revealTargetUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:344:    warnings.push("coach_status_copy_in_instructional_history");
lib/blundr/debug/trainerDebugSnapshot.ts:354:      criticalIssues.push("recent_repeated_generic_coach_copy");
lib/blundr/debug/trainerDebugSnapshot.ts:357:  if (presentationCoach.shouldRender && visibleCoachIntent === "silent") criticalIssues.push("visible_coach_with_silent_intent");
lib/blundr/debug/trainerDebugSnapshot.ts:359:  if (input.trainingMode === "continuation" && input.selectedCandidateUci && presentationCoach.shouldRender && visibleCoachOwner !== "branch_transition_surface" && !coachDebug.selectedOpportunityId && !coachDebug.selectedTemplateId && !coachDebug.mappingTemplateId && !coachDebug.candidateCoachFallbackUsed) criticalIssues.push("visible_coach_missing_template_and_opportunity");
lib/blundr/debug/trainerDebugSnapshot.ts:364:  if (input.coachSurfacePolicyAffectsVisualLayer) criticalIssues.push("Coach surface policy affected visual layer");
lib/blundr/debug/trainerDebugSnapshot.ts:365:  if (input.coachMemoryLegacyDetected && !input.memoryMigratedOrCleared) criticalIssues.push("legacy_memory_not_migrated");
lib/blundr/debug/trainerDebugSnapshot.ts:370:  if (coachFailureKind !== "none") warnings.push(`coachFailureKind:${coachFailureKind}`);
lib/blundr/debug/trainerDebugSnapshot.ts:376:  if (!brainActive && isTeachingFrame(input) && !coachDebug.advancedFeatureClaimTypes && !instructionTargetUci) warnings.push("feature_pipeline_not_exposed");
lib/blundr/debug/trainerDebugSnapshot.ts:377:  if (!brainActive && isTeachingFrame(input) && !coachDebug.recognizedPlanTypes && !instructionTargetUci) warnings.push("plan_pipeline_not_exposed");
lib/blundr/debug/trainerDebugSnapshot.ts:378:  if (coachDebug.candidateCoachFallbackUsed) warnings.push("candidate_fallback_used");
lib/blundr/debug/trainerDebugSnapshot.ts:382:    if (b.features) (coachDebug as any).brainFeatures = b.features;
lib/blundr/debug/trainerDebugSnapshot.ts:383:    if (b.plans) (coachDebug as any).brainPlans = b.plans;
lib/blundr/debug/trainerDebugSnapshot.ts:384:    if (b.opportunities) (coachDebug as any).brainOpportunities = b.opportunities;
lib/blundr/debug/trainerDebugSnapshot.ts:390:      coachDebug.verifiedFallbackUsed ??
lib/blundr/debug/trainerDebugSnapshot.ts:391:      coachDebug.candidateCoachFallbackUsed ??
lib/blundr/debug/trainerDebugSnapshot.ts:392:      coachQuality.usedFallback ??
lib/blundr/debug/trainerDebugSnapshot.ts:393:      coachSource === "verified_safe_fallback",
lib/blundr/debug/trainerDebugSnapshot.ts:395:  const runtimeSafeFallbackReason = String(input.runtimeSafeFallbackReason ?? coachDebug.fallbackReason ?? coachQuality.fallbackReason ?? "").trim() || null;
lib/blundr/debug/trainerDebugSnapshot.ts:399:  if (instructionTargetUci && selectedOpportunityScore == null) provenanceIssues.push("score_missing");
lib/blundr/debug/trainerDebugSnapshot.ts:400:  if (coachSource === "verified_safe_fallback" && !runtimeSafeFallbackUsed) provenanceIssues.push("fallback_source_flag_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:401:  if (runtimeSafeFallbackUsed && !coachQuality.usedFallback) provenanceIssues.push("fallback_flag_quality_mismatch");
lib/blundr/debug/trainerDebugSnapshot.ts:402:  if ((coachSource === "verified_safe_fallback" || runtimeSafeFallbackUsed || coachQuality.usedFallback) && !runtimeSafeFallbackReason) provenanceIssues.push("fallback_reason_missing");
lib/blundr/debug/trainerDebugSnapshot.ts:403:  const instructionalTimelineEntries = coachTimeline.filter((entry: any) => entry?.entryKind === "instructional");
lib/blundr/debug/trainerDebugSnapshot.ts:411:  const fallbackEntries = coachTimeline.filter((entry: any) => Boolean(entry?.runtimeSafeFallbackUsed));
lib/blundr/debug/trainerDebugSnapshot.ts:416:  const coachTimelineSummary = {
lib/blundr/debug/trainerDebugSnapshot.ts:417:    totalFrames: coachTimeline.length,
lib/blundr/debug/trainerDebugSnapshot.ts:423:    lowQualityCount: coachTimeline.filter((entry: any) => Number(entry?.qualityScore ?? 0) > 0 && Number(entry?.qualityScore ?? 0) < 80).length,
lib/blundr/debug/trainerDebugSnapshot.ts:424:    debugLeakCount: coachTimeline.filter((entry: any) => Boolean(entry?.containsDebugLeak)).length,
lib/blundr/debug/trainerDebugSnapshot.ts:425:    repeatedGenericCount: coachTimeline.filter((entry: any) => Boolean(entry?.repeatedGeneric)).length,
lib/blundr/debug/trainerDebugSnapshot.ts:426:    pieceMismatchCount: coachTimeline.filter((entry: any) => entry?.pieceAligned === false).length,
lib/blundr/debug/trainerDebugSnapshot.ts:427:    targetMismatchCount: coachTimeline.filter((entry: any) => entry?.targetAligned === false).length,
lib/blundr/debug/trainerDebugSnapshot.ts:429:    uniqueThemes: Array.from(new Set(coachTimeline.map((entry: any) => String(entry?.selectedTheme ?? "").trim()).filter(Boolean))),
lib/blundr/debug/trainerDebugSnapshot.ts:448:      hintShown: input.coachHintRequestCount > 0,
lib/blundr/debug/trainerDebugSnapshot.ts:449:      coachHidden: input.coachHiddenForFrame,
lib/blundr/debug/trainerDebugSnapshot.ts:450:      coachInteraction: input.coachInteraction,
lib/blundr/debug/trainerDebugSnapshot.ts:451:      expectedMoveSan: input.expectedMoveSan ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:452:      expectedMoveUci: input.expectedMoveUci ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:453:      instructionTargetKind: input.instructionTargetKind ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:454:      instructionTargetUci,
lib/blundr/debug/trainerDebugSnapshot.ts:455:      instructionTargetFrom: input.instructionTargetFrom ?? (instructionTargetUci ? String(instructionTargetUci).slice(0, 2) : null),
lib/blundr/debug/trainerDebugSnapshot.ts:456:      instructionTargetTo: input.instructionTargetTo ?? (instructionTargetUci ? String(instructionTargetUci).slice(2, 4) : null),
lib/blundr/debug/trainerDebugSnapshot.ts:457:      instructionTargetPieceType,
lib/blundr/debug/trainerDebugSnapshot.ts:464:        source: input.instructionTargetKind || (input.trainingMode === "continuation" ? "continuation_candidate" : "guided"),
lib/blundr/debug/trainerDebugSnapshot.ts:475:      expectedMoveSource: expectedMoveResolution.source ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:476:      expectedMoveCoverageTier: expectedMoveResolution.coverageTier ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:477:      expectedMoveResolutionReason: expectedMoveResolution.reason ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:478:      expectedMoveLineCursor: expectedMoveResolution.lineCursor ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:479:      expectedMoveLineLength: expectedMoveResolution.lineLength ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:480:      expectedMoveCandidateCount: len(expectedMoveResolution.candidateMoves),
lib/blundr/debug/trainerDebugSnapshot.ts:481:      expectedMoveShouldTransitionToContinuation: Boolean(expectedMoveResolution.shouldTransitionToContinuation),
lib/blundr/debug/trainerDebugSnapshot.ts:482:      exactFenNodeFound: Boolean(expectedMoveResolution.debug?.exactFenNodeFound),
lib/blundr/debug/trainerDebugSnapshot.ts:483:      transpositionNodeFound: Boolean(expectedMoveResolution.debug?.transpositionNodeFound),
lib/blundr/debug/trainerDebugSnapshot.ts:484:      openingFamilyPlanFallbackUsed: Boolean(expectedMoveResolution.debug?.openingFamilyPlanFallbackUsed),
lib/blundr/debug/trainerDebugSnapshot.ts:485:      legacyRecoverableCandidateUsed: Boolean(expectedMoveResolution.debug?.legacyRecoverableCandidateUsed),
lib/blundr/debug/trainerDebugSnapshot.ts:486:      resolverCriticalIssue: expectedMoveResolution.source === "none" ? expectedMoveResolution.reason ?? "unresolved" : null,
lib/blundr/debug/trainerDebugSnapshot.ts:515:      continueFromHereButtonRendered: visibleButtons.includes("continue_from_here"),
lib/blundr/debug/trainerDebugSnapshot.ts:539:      expectedMoveLegal: input.expectedMoveLegal ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:540:      expectedMoveResolvedFromSan: input.expectedMoveResolvedFromSan ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:541:      expectedMoveResolvedFromUci: input.expectedMoveResolvedFromUci ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:542:      sanUciResolutionStatus: input.sanUciResolutionStatus ?? (instructionTargetUci ? "resolved_via_instruction_target" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:543:      sanUciResolutionReason: input.sanUciResolutionReason ?? (instructionTargetUci ? "instruction_target_authoritative" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:546:      shouldRenderVisualRecipeLayer: presentation.visual?.shouldRender ?? false,
lib/blundr/debug/trainerDebugSnapshot.ts:575:      coachSurfacePolicyAffectsVisualLayer: Boolean(input.coachSurfacePolicyAffectsVisualLayer),
lib/blundr/debug/trainerDebugSnapshot.ts:577:      visualTargetMatchesInstructionTarget: instructionTargetUci ? visualMoveUci === instructionTargetUci : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:588:      exactMoveAllowed: Boolean(input.coachDecision?.exactMoveAllowed),
lib/blundr/debug/trainerDebugSnapshot.ts:591:      enginePreviewSafeMoves: coachDebug.coachEngineSafeMoves ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:619:    coach: {
lib/blundr/debug/trainerDebugSnapshot.ts:624:      coachDecisionSource: coachSource,
lib/blundr/debug/trainerDebugSnapshot.ts:625:      coachIntent: visibleCoachIntent,
lib/blundr/debug/trainerDebugSnapshot.ts:626:      givesAnswer: input.coachDecision?.givesAnswer ?? false,
lib/blundr/debug/trainerDebugSnapshot.ts:627:      revealRisk: input.coachDecision?.revealRisk ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:629:      coachMoveUci,
lib/blundr/debug/trainerDebugSnapshot.ts:630:      coachPieceType,
lib/blundr/debug/trainerDebugSnapshot.ts:634:      selectedPlanId: coachDebug.mappingPlanIds?.[0] ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:635:      selectedPlanType: coachDebug.recognizedPlanTypes?.[0] ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:636:      utteranceFamily: input.coachDecision?.utteranceFamily ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:637:      genericFallbackUsed: coachDebug.selectedOpportunityLayer === "fallback",
lib/blundr/debug/trainerDebugSnapshot.ts:638:      genericFallbackReason: coachDebug.selectedOpportunityLayer === "fallback" ? "fallback_opportunity_selected" : null,
lib/blundr/debug/trainerDebugSnapshot.ts:641:      coachQuality,
lib/blundr/debug/trainerDebugSnapshot.ts:643:      expectedMoveAlignment: expectedMoveAlignment(input),
lib/blundr/debug/trainerDebugSnapshot.ts:644:      coachMismatchReason: coachFailureKind === "none" ? null : coachFailureKind,
lib/blundr/debug/trainerDebugSnapshot.ts:645:      blockedBetterCoachReasons: coachDebug.mappingBlockedReasons ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:647:      repetitionGuardApplied: Boolean(coachDebug.repetitionGuardApplied),
lib/blundr/debug/trainerDebugSnapshot.ts:648:      repetitionGuardReason: coachDebug.repetitionGuardReason ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:649:      coachFailureKind,
lib/blundr/debug/trainerDebugSnapshot.ts:660:      revealTargetUci,
lib/blundr/debug/trainerDebugSnapshot.ts:661:      revealTargetSource,
lib/blundr/debug/trainerDebugSnapshot.ts:662:      revealTargetMatchesInstructionTarget: instructionTargetUci ? revealTargetUci === instructionTargetUci : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:666:      advancedFeaturePacketExists: !!input.brainAnalysis?.features || coachDebug.advancedFeaturePacketExists || Array.isArray(coachDebug.advancedFeatureClaimTypes),
lib/blundr/debug/trainerDebugSnapshot.ts:669:      featureClaimCount: input.brainAnalysis?.features ? Object.keys(input.brainAnalysis.features).length : len(coachDebug.advancedFeatureClaimTypes),
lib/blundr/debug/trainerDebugSnapshot.ts:670:      userFacingFeatureClaimCount: input.brainAnalysis?.features ? Object.keys(input.brainAnalysis.features).length : len(coachDebug.advancedFeatureClaimTypes),
lib/blundr/debug/trainerDebugSnapshot.ts:671:      blockedFeatureClaimCount: len(coachDebug.coachBlockedClaims),
lib/blundr/debug/trainerDebugSnapshot.ts:672:      topFeatureClaims: input.brainAnalysis?.features ? Object.keys(input.brainAnalysis.features).filter(k => input.brainAnalysis.features[k]) : (coachDebug.advancedFeatureClaimTypes ?? []),
lib/blundr/debug/trainerDebugSnapshot.ts:673:      blockedFeatureClaims: coachDebug.coachBlockedClaims ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:674:      pawnStructureSummary: input.brainAnalysis?.features?.pawnStructure ? [input.brainAnalysis.features.pawnStructure] : (coachDebug.coachBoardFactsSummary?.plausiblePawnBreaks ?? []),
lib/blundr/debug/trainerDebugSnapshot.ts:675:      kingSafetySummary: input.brainAnalysis?.features?.kingSafety ? [input.brainAnalysis.features.kingSafety] : (coachDebug.coachBoardFactsSummary?.kingSafetyFacts ?? []),
lib/blundr/debug/trainerDebugSnapshot.ts:676:      pieceQualitySummary: input.brainAnalysis?.features?.pieceQuality ? [input.brainAnalysis.features.pieceQuality] : (coachDebug.advancedFeatureClaimTypes?.filter((type: string) => type.includes("piece") || type.includes("bishop") || type.includes("rook")) ?? []),
lib/blundr/debug/trainerDebugSnapshot.ts:677:      imbalanceSummary: coachDebug.advancedFeatureClaimTypes?.filter((type: string) => type.includes("lead") || type.includes("imbalance")) ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:679:      featureExtractionMs: coachDebug.featureExtractionMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:680:      featureCacheHit: input.brainAnalysis ? "brain_hit" : (coachDebug.featureCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module")),
lib/blundr/debug/trainerDebugSnapshot.ts:684:      strategicPlanPacketExists: !!input.brainAnalysis?.plans || coachDebug.strategicPlanPacketExists || Array.isArray(coachDebug.recognizedPlanTypes),
lib/blundr/debug/trainerDebugSnapshot.ts:687:      recognizedPlanCount: input.brainAnalysis?.plans?.recognized?.length || len(coachDebug.recognizedPlanTypes),
lib/blundr/debug/trainerDebugSnapshot.ts:688:      topPlans: input.brainAnalysis?.plans?.recognized ?? (coachDebug.recognizedPlanTypes ?? []),
lib/blundr/debug/trainerDebugSnapshot.ts:689:      blockedPlans: input.brainAnalysis?.plans?.blocked ?? (coachDebug.blockedPlans ?? []),
lib/blundr/debug/trainerDebugSnapshot.ts:690:      selectedPlanId: input.brainAnalysis?.plans?.primary?.id ?? (coachDebug.mappingPlanIds?.[0] ?? null),
lib/blundr/debug/trainerDebugSnapshot.ts:691:      selectedPlanType: input.brainAnalysis?.plans?.primary?.type ?? (coachDebug.recognizedPlanTypes?.[0] ?? null),
lib/blundr/debug/trainerDebugSnapshot.ts:692:      planRecognitionMs: coachDebug.planRecognitionMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:693:      planCacheHit: input.brainAnalysis ? "brain_hit" : (coachDebug.planCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module")),
lib/blundr/debug/trainerDebugSnapshot.ts:694:      openingRegistryHit: input.brainAnalysis?.plans?.recognized?.length > 0 || len(coachDebug.recognizedPlanTypes) > 0,
lib/blundr/debug/trainerDebugSnapshot.ts:695:      openingRegistryEntryId: input.brainAnalysis?.plans?.primary?.id ?? (coachDebug.mappingPlanIds?.[0] ?? null),
lib/blundr/debug/trainerDebugSnapshot.ts:696:      planMatchFailures: coachDebug.mappingBlockedReasons ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:700:      opportunityCount: input.brainAnalysis?.opportunities?.ranked?.length ?? (input.opportunityCount ?? coachDebug.opportunityCount ?? (instructionTargetUci ? 0 : "not_exposed_from_module")),
lib/blundr/debug/trainerDebugSnapshot.ts:701:      renderableOpportunityCount: input.brainAnalysis?.opportunities?.ranked?.length ?? (input.renderableOpportunityCount ?? coachDebug.renderableOpportunityCount ?? (instructionTargetUci ? 0 : "not_exposed_from_module")),
lib/blundr/debug/trainerDebugSnapshot.ts:704:      selectedOpportunityIntent: coachDebug.selectedIntent ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:706:      selectedOpportunityMoveSan: input.coachDecision?.debug?.coachSelectedCandidateMove ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:707:      selectedOpportunityMoveUci: coachDebug.selectedOpportunityMoveUci ?? input.selectedCandidateUci ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:708:      selectedOpportunityPlanId: coachDebug.mappingPlanIds?.[0] ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:709:      opportunitiesTop5: coachDebug.opportunitiesTop5 ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:710:      blockedOpportunitiesTop10: coachDebug.blockedOpportunitiesTop10 ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:711:      genericFallbackOpportunityExists: coachDebug.selectedOpportunityLayer === "fallback",
lib/blundr/debug/trainerDebugSnapshot.ts:712:      genericFallbackOpportunityScore: coachDebug.selectedOpportunityLayer === "fallback" ? coachDebug.selectedOpportunityScore : null,
lib/blundr/debug/trainerDebugSnapshot.ts:713:      whySelectedOpportunityWon: coachDebug.whySelectedOpportunityWon ?? (instructionTargetUci ? "missing_exposure" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:714:      whyExpectedMoveOpportunityLost: coachDebug.whyExpectedMoveOpportunityLost ?? (instructionTargetUci ? "missing_exposure" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:715:      whyVisualRecipeOpportunityLost: coachDebug.whyVisualRecipeOpportunityLost ?? "not_exposed_from_module",
lib/blundr/debug/trainerDebugSnapshot.ts:716:      whyContinuationCandidateOpportunityLost: coachDebug.whyContinuationCandidateOpportunityLost ?? "not_exposed_from_module",
lib/blundr/debug/trainerDebugSnapshot.ts:720:      selectedTemplateCategory: input.coachDecision?.utteranceFamily ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:721:      selectedTemplateIntent: coachDebug.coachIntent ?? coachDebug.selectedIntent ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:722:      selectedTemplateRequiredVariables: coachDebug.selectedTemplateRequiredVariables ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:723:      resolvedVariables: coachDebug.resolvedVariables ?? {},
lib/blundr/debug/trainerDebugSnapshot.ts:724:      missingVariables: coachDebug.missingVariables ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:725:      templateCandidatesTop5: coachDebug.templateCandidatesTop5 ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:726:      blockedTemplatesTop10: (coachDebug.mappingBlockedReasons ?? []).slice(0, 10).map((reason: string) => ({ id: reason.split(":")[0], category: "unknown", blockedReason: reason })),
lib/blundr/debug/trainerDebugSnapshot.ts:727:      safetyLinterStatus: coachDebug.coachSafetyWarnings?.length ? "blocked_or_warned" : "passed",
lib/blundr/debug/trainerDebugSnapshot.ts:728:      safetyLinterBlockedTerms: coachDebug.coachSafetyWarnings ?? [],
lib/blundr/debug/trainerDebugSnapshot.ts:732:        (input.trainerView === "plain" && input.expectedMoveSan ? String(input.coachDecision?.body ?? "").includes(input.expectedMoveSan) : false)
lib/blundr/debug/trainerDebugSnapshot.ts:736:      explanationCacheHit: coachDebug.explanationCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:737:      explanationRenderMs: coachDebug.explanationRenderMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:745:      presentationCoachShouldRender: presentation.coach?.shouldRender ?? false,
lib/blundr/debug/trainerDebugSnapshot.ts:746:      presentationCoachOwner: presentation.coach?.owner ?? "none",
lib/blundr/debug/trainerDebugSnapshot.ts:747:      presentationCoachIntent: presentation.coach?.intent ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:748:      presentationCoachSuppressedReason: presentation.coach?.suppressedReason ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:756:      coachSurfacePolicyAffectsVisualLayer: Boolean(input.coachSurfacePolicyAffectsVisualLayer),
lib/blundr/debug/trainerDebugSnapshot.ts:760:      visualTargetMatchesInstructionTarget: input.visualTargetMatchesInstructionTarget ?? (instructionTargetUci ? visualMoveUci === instructionTargetUci : "unknown"),
lib/blundr/debug/trainerDebugSnapshot.ts:762:      coachFrameStale: Boolean(input.coachFrameStale),
lib/blundr/debug/trainerDebugSnapshot.ts:764:      revealTargetStale: Boolean(input.revealTargetStale),
lib/blundr/debug/trainerDebugSnapshot.ts:766:      // Agent 6: surface owner + 4-target/2-piece + leak/bypass from VisibleTeachingSurface guard
lib/blundr/debug/trainerDebugSnapshot.ts:768:      visibleCoachOwner: input.visibleCoachOwner ?? input.visibleTeachingSurface?.debug?.visibleCoachOwner ?? (presentation?.coach?.owner ?? "none"),
lib/blundr/debug/trainerDebugSnapshot.ts:771:      showMoreTargetUci: input.showMoreTargetUci ?? input.visibleTeachingSurface?.targetUci ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:787:      // v2.7.40 P0 Fix 2: when VisibleTeachingSurface owns the coach render on teaching, live coach path is not "actually rendered" visibly (internal evidence only).
lib/blundr/debug/trainerDebugSnapshot.ts:788:      liveCoachActuallyRendered: input.visibleTeachingSurface?.coach?.shouldRender ? false : (input.coachDecision?.debug?.coachCopySource === "live_coach"),
lib/blundr/debug/trainerDebugSnapshot.ts:789:      legacySuppressionReasons: [input.coachSurfacePolicy?.reason, presentation.legacy?.legacySuppressedReason].filter(Boolean),
lib/blundr/debug/trainerDebugSnapshot.ts:792:      coachMemoryLegacyDetected: Boolean(input.coachMemoryLegacyDetected),
lib/blundr/debug/trainerDebugSnapshot.ts:793:      coachMemoryClearedLegacyCount: Number(input.coachMemoryClearedLegacyCount ?? 0) || 0,
lib/blundr/debug/trainerDebugSnapshot.ts:797:      featureCacheKey: coachDebug.featureCacheKey ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:798:      featureCacheHit: coachDebug.featureCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:799:      planCacheKey: coachDebug.planCacheKey ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:800:      planCacheHit: coachDebug.planCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:801:      opportunityCacheKey: coachDebug.opportunityCacheKey ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:802:      opportunityCacheHit: coachDebug.opportunityCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:803:      explanationCacheKey: coachDebug.explanationCacheKey ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:804:      explanationCacheHit: coachDebug.explanationCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
lib/blundr/debug/trainerDebugSnapshot.ts:810:      geometryMs: coachDebug.geometryMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:811:      featureMs: coachDebug.featureExtractionMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:812:      planMs: coachDebug.planRecognitionMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:813:      opportunityMs: coachDebug.opportunityRankMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:814:      explanationMs: coachDebug.explanationRenderMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:815:      presentationMs: coachDebug.presentationFrameMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:816:      totalCoachDecisionMs: coachDebug.totalCoachDecisionMs ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:819:    coachPipeline: {
lib/blundr/debug/trainerDebugSnapshot.ts:825:      source: coachSource,
lib/blundr/debug/trainerDebugSnapshot.ts:828:      evidenceTags: Array.isArray(coachQuality.evidenceTags) ? coachQuality.evidenceTags.map(String) : [],
lib/blundr/debug/trainerDebugSnapshot.ts:833:    coachTimelineSummary,
lib/blundr/debug/trainerDebugSnapshot.ts:834:    coachTimeline,
lib/blundr/debug/trainerDebugSnapshot.ts:840:        coachMatchesExpectedMove: expectedMoveExists ? coachFailureKind === "none" : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:841:      revealButtonFunctional: input.lastActionDebug?.lastClickedAction?.includes("reveal") ? Boolean(input.lastActionDebug?.stateChanged) : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:842:        instructionTargetAligned:
lib/blundr/debug/trainerDebugSnapshot.ts:843:          instructionTargetUci
lib/blundr/debug/trainerDebugSnapshot.ts:844:            ? coachMoveUci === instructionTargetUci && visualMoveUci === instructionTargetUci && revealTargetUci === instructionTargetUci
lib/blundr/debug/trainerDebugSnapshot.ts:848:        noGenericFallbackWhenSpecificExists: !(expectedMoveExists && coachDebug.selectedOpportunityLayer === "fallback"),
lib/blundr/debug/trainerDebugSnapshot.ts:849:        noPlainLeak: !(input.trainerView === "plain" && input.expectedMoveSan && String(input.coachDecision?.body ?? "").includes(input.expectedMoveSan)) && !Boolean(input.plainLeakDetected || input.visibleTeachingSurface?.safety?.plainLeakDetected),
lib/blundr/debug/trainerDebugSnapshot.ts:853:        surfaceTargetsAligned: instructionTargetUci ? !(input.surfaceFourTargetMismatch || input.visibleTeachingSurface?.debug?.fourTargetMismatch) : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:854:        surfacePiecesAligned: (instructionTargetPieceType || input.instructionTargetPieceType) ? !(input.surfaceTwoPieceMismatch || input.visibleTeachingSurface?.debug?.twoPieceTypeMismatch) : "unknown",
lib/blundr/debug/trainerDebugTypes.ts:11:    | "coach_decision_changed"
lib/blundr/debug/trainerDebugTypes.ts:15:    | "coach_action_clicked"
lib/blundr/debug/trainerDebugTypes.ts:16:    | "reveal_state_changed"
lib/blundr/debug/trainerDebugTypes.ts:42:  coach: Record<string, unknown>;
lib/blundr/debug/trainerDebugTypes.ts:52:  coachPipeline: {
lib/blundr/debug/trainerDebugTypes.ts:66:  coachTimelineSummary: {
lib/blundr/debug/trainerDebugTypes.ts:82:  coachTimeline: Array<Record<string, unknown>>;
lib/blundr/explanation/__tests__/coachTemplateLibrary.test.ts:3:import { getCoachTemplates } from "../coachTemplateLibrary";
lib/blundr/explanation/__tests__/proceduralExplanationEngine.test.ts:13:  const selected = rankTeachingOpportunities(mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" }))!;
lib/blundr/explanation/coachTemplateLibrary.ts:18:  reveal_answer: 20,
lib/blundr/explanation/coachTemplateLibrary.ts:37:  reveal_answer: "Play {moveSan}. It supports {planName}.",
lib/blundr/explanation/coachTemplateLibrary.ts:51:            : category === "reveal_answer"
lib/blundr/explanation/coachTemplateLibrary.ts:52:              ? "reveal_answer"
lib/blundr/explanation/coachTemplateLibrary.ts:63:        tone: category === "king_safety" ? "urgent" : category === "reveal_answer" ? "review" : "plain",
lib/blundr/explanation/coachTemplateLibrary.ts:70:          leaksAnswerInPlain: category === "reveal_answer",
lib/blundr/explanation/coachTemplateLibrary.ts:76:          mentionsExactMove: ["reveal_answer", "castling", "development", "bishop_activity", "italian_c3_d4", "rook_activity"].includes(category),
lib/blundr/explanation/coachTemplateLibrary.ts:112:  if (category === "strategic_plan" || category === "reveal_answer") return ["moveSan", "planName"];
lib/blundr/explanation/explanationTypes.ts:18:  | "reveal_answer"
lib/blundr/explanation/opportunityTemplateMatcher.ts:16:    (input.opportunity.intent === "recall_hint" && input.template.intent === "recall_prompt");
lib/blundr/explanation/proceduralExplanationEngine.ts:6:import { getCoachTemplates } from "./coachTemplateLibrary";
lib/blundr/explanation/proceduralExplanationEngine.ts:7:import { validateRenderedCoachClaims } from "./coachClaimValidator";
lib/blundr/explanation/proceduralExplanationEngine.ts:10:import { normalizeCoachVoice } from "./coachVoicePolicy";
lib/blundr/explanation/templateRegistryStats.ts:1:import { getCoachTemplates } from "./coachTemplateLibrary";
lib/blundr/explanation/testProceduralExplanation.ts:2:import { testCoachTemplateLibrary } from "./__tests__/coachTemplateLibrary.test";
lib/blundr/featurePacketBuilder.ts:125:  expectedMove?: string;
lib/blundr/featurePacketBuilder.ts:141:  expectedMove?: string | { uci?: string; move?: string; san?: string };
lib/blundr/featurePacketBuilder.ts:142:  expectedMoves?: Array<{ uci?: string; move?: string; san?: string }>;
lib/blundr/featurePacketBuilder.ts:401:  addCandidate(rawCandidates, seen, input.expectedMove, "expected");
lib/blundr/featurePacketBuilder.ts:402:  for (const move of input.expectedMoves ?? []) {
lib/blundr/featurePacketBuilder.ts:482:    expectedMove: asUci(input.expectedMove)?.uci,
lib/blundr/golden/__tests__/continuationGolden.test.ts:3:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/golden/__tests__/continuationGolden.test.ts:4:import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
lib/blundr/golden/__tests__/continuationGolden.test.ts:9:  const coach = decideIntentFirstCoach({ packet, interaction: "show_plan" });
lib/blundr/golden/__tests__/continuationGolden.test.ts:10:  assertNoRawLabels(coach.body);
lib/blundr/golden/__tests__/continuationGolden.test.ts:11:  assert.equal(/Strong|Verified|Blundr Brain likes/i.test(coach.body), false);
lib/blundr/golden/__tests__/featureMappingGolden.test.ts:11:  const opportunities = mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" });
lib/blundr/golden/__tests__/italianBc4Golden.test.ts:3:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/golden/__tests__/italianBc4Golden.test.ts:4:import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
lib/blundr/golden/__tests__/italianBc4Golden.test.ts:9:  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "assisted", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
lib/blundr/golden/__tests__/italianBc4Golden.test.ts:10:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
lib/blundr/golden/__tests__/italianBc4Golden.test.ts:11:  assert.equal(/bishop|development/i.test(coach.body), true);
lib/blundr/golden/__tests__/italianBc4Golden.test.ts:12:  if (coach.body.includes("f7")) assert.equal(packet.moveFacts?.movedPieceAttacksAfter.includes("f7"), true);
lib/blundr/golden/__tests__/italianC3Golden.test.ts:3:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/golden/__tests__/italianC3Golden.test.ts:4:import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
lib/blundr/golden/__tests__/italianC3Golden.test.ts:9:  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "assisted", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
lib/blundr/golden/__tests__/italianC3Golden.test.ts:10:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
lib/blundr/golden/__tests__/italianC3Golden.test.ts:11:  assert.equal(/d4|center/i.test(coach.body), true);
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:4:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:5:import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:11:  const recipe = compileVisualRecipe({ trainingContext: { mode: "move_teaching", moveTrust: "book_supported", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: g.conceptId, metadata: { moveUci: g.moveUci, moveSan: g.moveSan } } } as any, fen: g.fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan, frameId: 1 });
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:17:  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "assisted", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:18:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: recipe.visualRecipeId });
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:19:  assert.equal(/castle|king|rook/i.test(coach.body), true);
lib/blundr/golden/__tests__/italianRe1Golden.test.ts:3:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/golden/__tests__/italianRe1Golden.test.ts:4:import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
lib/blundr/golden/__tests__/italianRe1Golden.test.ts:9:  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "assisted", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
lib/blundr/golden/__tests__/italianRe1Golden.test.ts:10:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian", visualRecipeId: "r" });
lib/blundr/golden/__tests__/italianRe1Golden.test.ts:11:  assert.equal(/fork|pin|skewer|mate|forced win/i.test(coach.body), false);
lib/blundr/golden/__tests__/plainViewGolden.test.ts:1:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/golden/__tests__/plainViewGolden.test.ts:2:import { decideIntentFirstCoach } from "../../coach/intentFirstCoachEngine";
lib/blundr/golden/__tests__/plainViewGolden.test.ts:8:  const packet = buildCoachEvidencePacket({ frameId: "1", fen: g.fen, viewMode: "plain", trainingMode: "restricted", bookStatus: "in_book", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan });
lib/blundr/golden/__tests__/plainViewGolden.test.ts:9:  const coach = decideIntentFirstCoach({ packet, interaction: "none", conceptId: g.conceptId, openingId: "italian" });
lib/blundr/golden/__tests__/plainViewGolden.test.ts:10:  assertNoPlainLeak(coach.body, g.moveSan);
lib/blundr/index.ts:12:export * from "./coaching/adaptiveContext";
lib/blundr/index.ts:13:export * from "./coaching/coachingMemory";
lib/blundr/index.ts:14:export * from "./coaching/contextVariants";
lib/blundr/learning/learningEvents.ts:6:  | "cue_revealed"
lib/blundr/learning/learningEvents.ts:31:  expectedMoveSan?: string;
lib/blundr/learning/learningEvents.ts:32:  expectedMoveUci?: string;
lib/blundr/liveCoach/liveCoachTypes.ts:93:  hintsUsedRecently: number;
lib/blundr/liveCoach/liveCoachTypes.ts:94:  answerRevealsRecently: number;
lib/blundr/liveCoach/liveCoachTypes.ts:177:export type LiveCoachIntent = "ask_question" | "warn" | "reinforce" | "explain_plan" | "compare_instincts" | "connect_pattern" | "nudge" | "reveal" | "stay_silent";
lib/blundr/liveCoach/liveCoachTypes.ts:188:  revealRisk: number;
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:10:    score.revealRisk * 0.2 -
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:16:  if (evidence.stale) return [scoreOpportunity({ opportunity: "silence", intent: "stay_silent", confidenceScore: 0, pedagogicalValue: 0, userRelevance: 0, novelty: 0, revealRisk: 0, exactMoveAllowed: false, evidenceSources: ["position_features"], reason: "stale_position" })];
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:28:      revealRisk: 0.05,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:46:      revealRisk: 0.2,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:64:      revealRisk: 0.25,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:81:      revealRisk: 0.1,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:96:      revealRisk: 0.1,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:111:      revealRisk: 0.08,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:126:      revealRisk: 0.05,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:142:      revealRisk: 0.2,
lib/blundr/liveCoach/pedagogicalOpportunityEngine.ts:159:      revealRisk: 0,
lib/blundr/openings/__tests__/branchResolver.test.ts:5:import { resolveExpectedMoveForFrame } from "../expectedMoveResolver";
lib/blundr/openings/__tests__/branchResolver.test.ts:25:  assert.equal(resolved.coverageTier, "known_branch_deep_coached");
lib/blundr/openings/__tests__/expectedMoveResolver.test.ts:5:import { resolveExpectedMoveForFrame } from "../expectedMoveResolver";
lib/blundr/openings/__tests__/expectedMoveResolver.test.ts:37:  assert.equal(exact.expectedMoveSan, "Nf3");
lib/blundr/openings/__tests__/expectedMoveResolver.test.ts:80:  assert.equal(engineGuard.expectedMoveSan, "c4");
lib/blundr/openings/__tests__/transpositionMatcher.test.ts:5:import { resolveExpectedMoveForFrame } from "../expectedMoveResolver";
lib/blundr/openings/__tests__/transpositionMatcher.test.ts:27:  assert.equal(resolved.expectedMoveSan, "Nf3");
lib/blundr/openings/expectedMoveResolver.ts:10:    expectedMoveSan: null,
lib/blundr/openings/expectedMoveResolver.ts:11:    expectedMoveUci: null,
lib/blundr/openings/expectedMoveResolver.ts:47:    expectedMoveSan: input.continuation.san,
lib/blundr/openings/expectedMoveResolver.ts:48:    expectedMoveUci: input.continuation.uci,
lib/blundr/openings/expectedMoveResolver.ts:138:      coverageTier: classifiedSource === "opening_branch" ? "known_branch_deep_coached" : "exact_line_deep_coached",
lib/blundr/openings/expectedMoveResolver.ts:155:      coverageTier: "transposition_deep_coached",
lib/blundr/openings/expectedMoveResolver.ts:176:        coverageTier: "known_branch_deep_coached",
lib/blundr/openings/expectedMoveResolver.ts:189:      expectedMoveSan: null,
lib/blundr/openings/expectedMoveResolver.ts:190:      expectedMoveUci: null,
lib/blundr/openings/expectedMoveResolver.ts:239:        coverageTier: "opening_family_plan_coached",
lib/blundr/openings/expectedMoveResolver.ts:262:        coverageTier: "general_feature_coached",
lib/blundr/openings/openingResolverDebug.ts:5:    expectedMoveSource: resolution.source,
lib/blundr/openings/openingResolverDebug.ts:6:    expectedMoveCoverageTier: resolution.coverageTier,
lib/blundr/openings/openingResolverDebug.ts:7:    expectedMoveResolutionReason: resolution.reason,
lib/blundr/openings/openingResolverDebug.ts:8:    expectedMoveLineCursor: resolution.lineCursor,
lib/blundr/openings/openingResolverDebug.ts:9:    expectedMoveLineLength: resolution.lineLength,
lib/blundr/openings/openingResolverDebug.ts:10:    expectedMoveCandidateCount: resolution.candidateMoves.length,
lib/blundr/openings/openingResolverDebug.ts:11:    expectedMoveShouldTransitionToContinuation: resolution.shouldTransitionToContinuation,
lib/blundr/openings/openingTypes.ts:79:  | "exact_line_deep_coached"
lib/blundr/openings/openingTypes.ts:80:  | "known_branch_deep_coached"
lib/blundr/openings/openingTypes.ts:81:  | "transposition_deep_coached"
lib/blundr/openings/openingTypes.ts:82:  | "opening_family_plan_coached"
lib/blundr/openings/openingTypes.ts:83:  | "general_feature_coached"
lib/blundr/openings/openingTypes.ts:88:  expectedMoveSan: string | null;
lib/blundr/openings/openingTypes.ts:89:  expectedMoveUci: string | null;
lib/blundr/openings/testOpeningResolver.ts:2:import { testExpectedMoveResolver } from "./__tests__/expectedMoveResolver.test";
lib/blundr/opportunity/__tests__/featureOpportunityMapper.test.ts:11:  const opportunities = mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", visualRecipeId: "recipe", conceptId: "develop_with_pressure", trainerView: "assisted" });
lib/blundr/opportunity/__tests__/mappingPipeline.test.ts:5:import { getCoachTemplates } from "../../explanation/coachTemplateLibrary";
lib/blundr/opportunity/__tests__/mappingPipeline.test.ts:15:  const opportunity = rankTeachingOpportunities(mapFeaturesToOpportunities({ features, plans, expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", trainerView: "assisted", visualRecipeId: "r", conceptId: "develop_with_pressure" }))!;
lib/blundr/opportunity/expectedMoveOpportunityLayer.ts:3:export function expectedMoveOpportunity(opportunity: TeachingOpportunity): TeachingOpportunity {
lib/blundr/opportunity/featureOpportunityMapper.ts:8:  expectedMoveUci?: string;
lib/blundr/opportunity/featureOpportunityMapper.ts:9:  expectedMoveSan?: string;
lib/blundr/opportunity/featureOpportunityMapper.ts:16:  const expectedPlan = input.plans.plans.find((plan) => plan.canMention && (plan.moveUci === input.expectedMoveUci || plan.conceptId === input.conceptId)) ?? input.plans.plans.find((plan) => plan.canMention);
lib/blundr/opportunity/featureOpportunityMapper.ts:17:  if (input.expectedMoveUci && expectedPlan) {
lib/blundr/opportunity/featureOpportunityMapper.ts:19:      id: `expected:${input.expectedMoveUci}:${expectedPlan.type}`,
lib/blundr/opportunity/featureOpportunityMapper.ts:22:      moveUci: input.expectedMoveUci,
lib/blundr/opportunity/featureOpportunityMapper.ts:23:      moveSan: input.expectedMoveSan,
lib/blundr/opportunity/featureOpportunityMapper.ts:43:      moveUci: input.expectedMoveUci,
lib/blundr/opportunity/featureOpportunityMapper.ts:44:      moveSan: input.expectedMoveSan,
lib/blundr/opportunity/opportunityTypes.ts:15:  | "recall_hint"
lib/blundr/opportunity/opportunityTypes.ts:16:  | "reveal_answer"
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:2:import { getBranchTransitionIntent, isBranchTransitionActionSurface, resolveCoachActionStyle } from "../coachActionStylePolicy";
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:6:  const branchActions: VisibleCoachAction[] = ["continue_from_here", "restart_line"];
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:10:    coachIntent: "",
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:11:    visibleActions: ["hint"],
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:14:  assert.equal(resolveCoachActionStyle("hint", startTrainingSurface), "default");
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:18:    coachIntent: "",
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:22:  assert.equal(resolveCoachActionStyle("continue_from_here", branchByTitle), "branch_continue");
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:27:    coachIntent: "continuation_pause",
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:34:    coachIntent: "",
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:35:    visibleActions: ["hint", "show_more"],
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:45:    buttons: ["continue_from_here", "restart_line"],
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:48:    revealRisk: "none",
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:51:    debug: { coachIntent: "branch_transition" },
lib/blundr/presentation/__tests__/coachHideDoesNotSuppressVisuals.test.ts:22:    coachHiddenForFrame: true,
lib/blundr/presentation/__tests__/coachHideDoesNotSuppressVisuals.test.ts:23:    coachShouldShow: false,
lib/blundr/presentation/__tests__/coachHideDoesNotSuppressVisuals.test.ts:24:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "hidden_for_frame" } as any,
lib/blundr/presentation/__tests__/coachHideDoesNotSuppressVisuals.test.ts:27:  assert.equal(frame.coach.shouldRender, false);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:11:    expectedMoveSan: null,
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:12:    expectedMoveUci: null,
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:14:    coachShouldShow: true,
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:15:    coachButtons: ["hint", "show_more"],
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:19:  assert.equal(opponentSelecting.revealButtonVisible, false);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:26:    expectedMoveSan: "Nbd2",
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:27:    expectedMoveUci: "b1d2",
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:29:    coachShouldShow: true,
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:30:    coachButtons: ["hint", "show_more", "continue_from_here", "hide"],
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:34:  assert.deepEqual(userTurn.filteredButtons, ["hint", "show_more", "continue_from_here"]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:35:  assert.equal(userTurn.revealButtonVisible, true);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:41:    expectedMoveSan: null,
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:42:    expectedMoveUci: null,
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:44:    coachShouldShow: true,
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:45:    coachButtons: ["hint", "show_more"],
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:48:  assert.equal(missingExpectedMove.revealButtonVisible, false);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:80:  // Plain teaching frame pre-ShowMore produces exactly ["hint", "show_more"]
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:82:  assert.deepEqual(plainPre.actions, ["hint", "show_more"] as VisibleCoachAction[]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:85:  // Branch transition produces exactly ["continue_from_here","restart_line"]
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:86:  const branch = getVisibleCoachActions({ trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true, trainingMode: "continuation", isBranchTransition: true, coachOwner: "branch_transition_surface" });
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:87:  assert.deepEqual(branch.actions, ["continue_from_here", "restart_line"] as VisibleCoachAction[]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:100:    assert.ok(!/reveal|show answer|show move|show plan|analyze|attack|defense|plan|verified/i.test(lbl), `Forbidden label leaked: ${lbl}`);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:102:  const filteredLegacy = filterToVisibleCoachActions(["hint", "answer", "show_plan", "analyze_idea", "continue_from_here"]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:103:  assert.deepEqual(filteredLegacy, ["hint", "continue_from_here"] as VisibleCoachAction[]);
lib/blundr/presentation/__tests__/phaseActionGating.test.ts:105:  console.log("✓ v2.7.40 visibleActionPolicy regression tests passed (assisted=[], plain=[hint,show_more], branch=[continue,restart], terminal=[], no forbidden)");
lib/blundr/presentation/__tests__/presentationLegacySuppression.test.ts:21:    coachShouldShow: false,
lib/blundr/presentation/__tests__/presentationLegacySuppression.test.ts:22:    coachHiddenForFrame: true,
lib/blundr/presentation/__tests__/presentationLegacySuppression.test.ts:23:    coachSurfacePolicy: { allowLegacyTrainingCard: true, allowLegacyAnswerCard: true, allowMoveImpactCard: true, allowNextMoveText: true, owner: "none", reason: "test" } as any,
lib/blundr/presentation/__tests__/presentationVisualIndependence.test.ts:22:    coachHiddenForFrame: true,
lib/blundr/presentation/__tests__/presentationVisualIndependence.test.ts:23:    coachShouldShow: false,
lib/blundr/presentation/__tests__/presentationVisualIndependence.test.ts:24:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "hidden_for_frame" } as any,
lib/blundr/presentation/__tests__/presentationVisualIndependence.test.ts:27:  assert.equal(frame.coach.shouldRender, false);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:4:import { buildVisibleTeachingSurface, detectPlainTeachingLeak } from "../buildVisibleTeachingSurface";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:6:import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:10:import { buildCoachEvidencePacket } from "../../coachBrain/coachEvidenceBuilder";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:11:import { buildCoachCopyFromEvidence } from "../../coachBrain/evidenceConditionedCopyBuilder";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:12:import { buildCoachExplanationPipeline } from "../../coachBrain/coachExplanationPipeline";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:31:    coachShouldShow: true,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:32:    coachTitle: "Opening pattern",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:33:    coachBody: "The bishop develops.",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:34:    coachButtons: ["why"],
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:35:    coachHiddenForFrame: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:36:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "evidence_coach", reason: "coach_active" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:39:  assert.equal(frame.coach.shouldRender, true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:58:    coachShouldShow: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:59:    coachHiddenForFrame: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:60:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:82:    coachShouldShow: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:83:    coachHiddenForFrame: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:84:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:104:    coachShouldShow: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:105:    coachHiddenForFrame: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:107:    branchTransitionTitle: "Continue from here",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:110:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "none", reason: "no_recipe" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:112:  assert.equal(branchTransitionFrame.coach.shouldRender, true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:113:  assert.equal(branchTransitionFrame.coach.owner, "branch_transition_surface");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:116:// v2.7.40 VisibleTeachingSurface + Agent4/5 tests (imports consolidated at top)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:117:import { buildHintLadder } from "../../brain/hints/buildHintLadder"; // v2.7.40 Agent 4 tests
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:119:function makeMockInstructionFrame(targetKind: "guided_move" | "continuation_candidate", uci = "e2e4", san = "e4", piece = "p"): CurrentInstructionFrame {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:161:function makeMockPresentationFrame(visualShould = true, coachShould = true, visualSource = "guided_target_fallback", coachOwner = "intent_first_coach"): TrainerPresentationFrame {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:175:    coach: {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:176:      shouldRender: coachShould,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:177:      owner: coachOwner as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:178:      title: coachShould ? "Develop the pawn" : undefined,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:179:      body: coachShould ? "e4 claims the center." : undefined,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:181:      suppressedReason: coachShould ? undefined : "test",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:186:    debug: { visualLayerSource: visualSource, coachSurfaceOwner: coachOwner },
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:190:export function testVisibleTeachingSurface(): void {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:193:  const pres1 = makeMockPresentationFrame(true, true, "guided_target_fallback", "intent_first_coach");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:194:  const s1 = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:202:  assert.ok(s1.coach.shouldRender || s1.coach.suppressedReason != null); // content may be gated by plain
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:206:  const pres2 = makeMockPresentationFrame(true, true, "continuation_candidate", "intent_first_coach");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:207:  const s2 = buildVisibleTeachingSurface({ currentInstructionFrame: contFrame, trainerPresentationFrame: pres2, trainingMode: "continuation", trainerView: "assisted" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:212:  // 3/4. v2.7.40 Agent 4 update: Plain pre renders *prompt coach* (for Hint+Show More buttons + progressive body) but hides visuals + full assisted body. Actions exactly hint+show_more. (required for Plain View hygiene)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:213:  const sPlain = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:214:  if (sPlain.coach.shouldRender !== true) { throw new Error("coach prompt must render in plain pre for Hint/Show More buttons"); }
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:216:  if (sPlain.hint.suppressed !== false) { throw new Error("hint not suppressed in plain pre"); }
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:218:  assert.ok(plainActions.includes("hint"), "hint action present");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:220:  assert.equal(plainActions.length, 2, "exactly hint + show_more in plain pre");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:221:  if (sPlain.coach.body && /e4|e2e4|Play|to e/.test(sPlain.coach.body)) { throw new Error("plain pre body must not leak move"); }
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:225:  const sMismatch = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, legacyCoachDecision: badLegacy as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:229:  assert.equal(sMismatch.coach.shouldRender, false);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:234:  const sPiece = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, legacyCoachDecision: badPieceLegacy as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:240:  const sLegacy = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: makeMockPresentationFrame(true, true, "legacy_fallback", "legacy_fallback"), legacyCoachDecision: { body: "legacy" } as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:246:  // 7. Target mismatch blocks surface + sets critical flags + suppresses output (4-target coverage via coach/visual inputs)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:247:  const s4Target = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:250:    coachMoveUci: "e2e5", // mismatch
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:252:    showMoreTargetUci: "e2e4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:253:    coachPieceType: "p",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:257:  assert.equal(s4Target.coach.shouldRender, false);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:262:  const s2Piece = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:265:    coachPieceType: "n", // mismatch vs p
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:269:  assert.equal(s2Piece.coach.shouldRender, false);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:271:  // 9. Plain leak detector standalone + blocks when triggered (pre-showMore)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:273:  const leakYes = detectPlainTeachingLeak(["Play e4 now"], JSON.stringify(["hint","show_more"]), "[]");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:274:  const leakNo = detectPlainTeachingLeak(["Develop your pieces toward the center"], JSON.stringify(["hint","show_more"]), "[]");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:276:  if (leakNo) throw new Error("detector must not false-positive clean hint");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:277:  // simulate leak via coach body override in plain pre (test path; real ladder prevents)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:278:  const sLeak = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:282:    showMoreShown: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:295:  const sTerm = buildVisibleTeachingSurface({ currentInstructionFrame: termInput, trainerPresentationFrame: pres1, isTerminal: true, isUserTurn: false, trainerPhase: "terminal" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:299:  const sOpp = buildVisibleTeachingSurface({ currentInstructionFrame: oppInput, trainerPresentationFrame: pres1, trainerPhase: "opponent_replying", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:303:  const sClean = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, coachMoveUci: "e2e4", visualMoveUci: "e2e4", coachPieceType: "p" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:312:  console.log("✓ v2.7.40 buildVisibleTeachingSurface tests passed (6 cases + 6 Agent6 invariant guard cases)");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:318:  const pres = makeMockPresentationFrame(true, true, "guided_target_fallback", "intent_first_coach");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:320:  // 1. Hint 1/2/3 never contain SAN/UCI/direct move/target square before showMore
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:321:  const l0 = buildHintLadder({ target: guidedFrame.target, hintCount: 0, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:322:  const l1 = buildHintLadder({ target: guidedFrame.target, hintCount: 1, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:323:  const l2 = buildHintLadder({ target: guidedFrame.target, hintCount: 2, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:324:  const l3 = buildHintLadder({ target: guidedFrame.target, hintCount: 3, trainerView: "plain", showMoreShown: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:336:  // 2. Plain pre showMore: surface coach may render prompt, but body/visuals suppressed unless progressive hint; actions exactly hint+show_more
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:337:  const sPlainPre0 = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:338:  if (sPlainPre0.actions.length !== 2 || !sPlainPre0.actions.includes("hint") || !sPlainPre0.actions.includes("show_more")) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:339:    throw new Error("Plain pre must expose exactly hint+show_more");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:341:  if (sPlainPre0.visual.shouldRender) throw new Error("visuals must be hidden pre showMore in plain");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:342:  // coach prompt allowed for buttons, but no full body leak
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:343:  if (sPlainPre0.coach.body && sPlainPre0.coach.body.includes("e4")) throw new Error("pre body leaks");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:345:  // 3. After showMore in plain: shows full assisted-style content aligned to target (no leak check needed post)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:346:  const sPlainPost = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: true, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:347:  if (!sPlainPost.coach.shouldRender) throw new Error("post showMore must render coach");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:348:  if (sPlainPost.showMore.content == null && !pres.coach.body) { /* ok if pres has none in mock */ }
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:349:  if (sPlainPost.targetUci !== "e2e4") throw new Error("Show More target must match instruction target");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:351:  // 4. No Reveal/Show Answer/Show Move strings ever in plain surface actions or hint pre
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:353:  if (/reveal|answer|show_move|show answer/i.test(plainPreActionsStr)) throw new Error("Forbidden action label in plain");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:354:  if (l1.currentHint && /reveal|answer|show move/i.test(l1.currentHint)) throw new Error("Hint leaks reveal lang");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:356:  // 5. Hint count + showMoreShown reset behavior (simulated via new frame input)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:357:  const sNewFrame = buildVisibleTeachingSurface({ currentInstructionFrame: { ...guidedFrame, frameId: "f99", target: { ...guidedFrame.target!, uci: "d2d4" } } as any, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:358:  if (sNewFrame.hint.text != null && sNewFrame.hint.text !== "") { /* count 0 */ }
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:360:  if (buildHintLadder({ target: guidedFrame.target, hintCount: 0, trainerView: "plain", showMoreShown: false }).currentHint != null) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:364:  // 6. Show More target always matches instruction target (already in sPlainPost)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:367:  console.log("✓ v2.7.40 Agent4 hint ladder + Plain View hygiene tests passed (6 cases)");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:373:  const presBase = makeMockPresentationFrame(true, false, "guided_target_fallback", "none"); // legacy coach off to test brain path
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:396:    throw new Error("Brain coach copy pieceType must match target pieceType");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:400:  const copyText = (brain.safeFallbackCopy!.title + " " + brain.safeFallbackCopy!.body + " " + (brain.safeFallbackCopy!.hint || "")).toLowerCase();
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:408:  // 4. PresentationFrame uses brain copy for coach when passed (chain)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:413:    coachShouldShow: false, // legacy off
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:414:    coachHiddenForFrame: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:418:  if (presWithBrain.coach.owner !== "brain_skeleton") {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:419:    throw new Error(`Presentation must use brain_skeleton owner for coach when brain safe copy present; got ${presWithBrain.coach.owner}`);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:421:  if (!presWithBrain.coach.shouldRender || !presWithBrain.coach.body) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:422:    throw new Error("Presentation coach must render body from brain safe copy");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:424:  if (presWithBrain.coach.body && presWithBrain.coach.body.includes("e4")) { // non-leak for non-answer
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:428:  // 5. Visible surface receives brain-derived coach via pres; target/piece from instruction only
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:429:  const surface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:434:    showMoreShown: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:435:    hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:442:    throw new Error("Surface target/pieceType must come ONLY from CurrentInstructionFrame.target");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:447:  // coach from pres/brain, not legacy body
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:448:  if (surface.coach.body && surface.coach.body.includes("LEAKY LEGACY")) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:449:    throw new Error("Surface must not promote legacy coach text to visible output");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:459:  console.log("✓ v2.7.40 Agent5 coach intelligence consolidation + brain chain tests passed (6 cases)");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:462:// v2.7.40 Agent 7: Full prompt coverage tests for all listed items (UI forbidden labels non-debug; continuation branch clean + candidate locked + no emergency legal fallback as teaching target; stale buttons cleared; Show More not on terminal/opp; debug invariants coach/visual/showMore targets==instruction; piece match; mismatch blocks)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:465:  const pres = makeMockPresentationFrame(true, true, "guided_target_fallback", "intent_first_coach");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:469:  const sAssisted = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:471:  if (/reveal|show answer|show move|show plan|analyze idea|analyze_idea/i.test(assistedActionsStr)) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:475:  const sPlainPre = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:476:  const plainStr = JSON.stringify(sPlainPre.actions) + (sPlainPre.coach.body || "") + (sPlainPre.hint.text || "");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:477:  if (/reveal|show answer|show move/i.test(plainStr)) throw new Error("Forbidden in plain non-debug UI");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:479:  // Show More: not available on terminal/opponent (and actions=[])
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:481:  const sTerm = buildVisibleTeachingSurface({ currentInstructionFrame: termInput, trainerPresentationFrame: pres, isTerminal: true, trainerPhase: "terminal", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:482:  if (sTerm.showMore.actionAvailable !== false) throw new Error("Show More must not be available on terminal");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:486:  const sOpp = buildVisibleTeachingSurface({ currentInstructionFrame: oppInput, trainerPresentationFrame: pres, trainerPhase: "opponent_replying", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:487:  if (sOpp.showMore.actionAvailable !== false) throw new Error("Show More must not be available on opponent");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:491:  const sBranch = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:499:  assert.deepEqual(sBranch.actions, ["continue_from_here", "restart_line"] as any, "branch must expose Continue + Train Again (stale cleared)");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:504:  const noTargetBranchSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:513:  assert.equal(noTargetBranchSurface.actions.includes("continue_from_here"), true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:522:  // Architecture + Invariant: coach/visual/showMore targets == instruction target; piece types match; mismatch blocks (reaffirm + explicit)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:525:  if (sAssisted.showMore.shown && sAssisted.showMore.content && sAssisted.targetUci !== guidedFrame.target!.uci) {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:526:    throw new Error("showMore target must match instruction target");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:540:  // Use bc4 teaching context (trusted book) to drive recipe + copy + surface for plain pre/post showMore
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:544:    expectedMoveUci: "f1c4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:545:    expectedMoveSan: "Bc4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:555:    trainingContext: plainBc4Tc, fen: plainBc4Fen, viewMode: "assisted", revealState: "hidden",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:556:    expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", openingId: "italian", lineId: "italian", frameId: 99,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:560:    bookStatus: "in_book", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", repertoireMoves: ["f1c4"],
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:562:  const plainCopy = buildCoachCopyFromEvidence({ packet: { ...plainBc4Packet, viewMode: "plain", exactMoveAllowed: false, allowedClaims: [] }, interaction: "hint" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:564:  // simulate presentation frame input for pre (showMoreShown=false) and post (true)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:570:    coachShouldShow: true, coachTitle: "Opening pattern", coachBody: plainCopy.body || "Focus...", coachButtons: ["hint", "show_more"], coachHiddenForFrame: false,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:571:    coachSurfacePolicy: { allowLegacyTrainingCard: false, allowLegacyAnswerCard: false, allowMoveImpactCard: false, allowNextMoveText: false, owner: "evidence_coach", reason: "" } as any,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:572:    brainAnalysis: null, branchTransitionSurface: null, showMoreShown: false, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:573:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: null,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:576:  // pre showMore: build surface, prove does not expose SAN/UCI/source/target/arrow/hint (task4)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:577:  const preSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:579:    trainerPresentationFrame: computeTrainerPresentationFrame({ ...basePresInput, showMoreShown: false, answerShown: false, visualRecipeLines: plainBc4Recipe.beats.flatMap((b: any) => b.primitives.map((p: any) => ({ from: p.from, to: p.to, kind: p.type }))) as any, coachBody: plainCopy.body } as any),
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:580:    showMoreShown: false, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:581:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: null,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:583:  const preText = ((preSurface.coach?.body || "") + " " + (preSurface.hint?.text || "")).toLowerCase();
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:589:  assert.equal(preSurface.hint.suppressed || !preSurface.hint.text || !/f1|c4|bc4/i.test(preSurface.hint.text || ""), true, "plain pre hint must not name squares/move");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:591:  // post showMore: reuses assisted primary recipe (task5)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:592:  const postSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:594:    trainerPresentationFrame: computeTrainerPresentationFrame({ ...basePresInput, showMoreShown: true, answerShown: true, visualRecipeLines: plainBc4Recipe.beats.flatMap((b: any) => b.primitives.map((p: any) => ({ from: p.from, to: p.to, kind: p.type }))) as any, coachBody: plainCopy.body } as any),
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:595:    showMoreShown: true, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:596:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: "f1c4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:598:  assert.equal(postSurface.showMore.shown, true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:602:    assert.equal(postArrows >= 1, true, "post showMore should have the primary move arrow");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:604:    assert.equal(postHasPressure, false, "post showMore primary must have no pressure lines");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:614:  // Step 3: Show More uses same SAN/target/piece as the main coaching box (from the copy passed)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:615:  // build a pipeline copy for the bc4 and feed to post pres to verify showMore matches
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:616:  const showMorePipeline = buildCoachExplanationPipeline({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:625:    showMoreShown: true,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:627:    coachTitle: showMorePipeline.coachExplanation.title,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:628:    coachBody: showMorePipeline.coachExplanation.body,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:631:  const postSurfForShow = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:634:    showMoreShown: true, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:635:    coachMoveUci: null, visualMoveUci: "f1c4", showMoreTargetUci: "f1c4",
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:637:  const mainTitle = showMorePipeline.coachExplanation.title;
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:638:  const showMoreContent = postSurfForShow.showMore?.content || "";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:640:  assert.equal(/Bc4/i.test(showMoreContent || mainTitle), true, "Show More must include same SAN as main coaching box");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:641:  assert.equal(/bishop|b/i.test(mainTitle + " " + showMoreContent), true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:642:  assert.equal(postSurfForShow.showMore.shown, true);
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:644:  // Step 4: final Plain View Show More verification (pre no reveal Bc4, post shows assisted payload + primary f1-c4 only)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:646:  const preBc4Surf = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:648:    trainerPresentationFrame: computeTrainerPresentationFrame({ ...basePresInput, showMoreShown: false, answerShown: false, visualRecipeLines: plainBc4Recipe.beats.flatMap((b: any) => b.primitives.map((p: any) => ({ from: p.from, to: p.to, kind: p.type }))) as any, coachBody: "Find the next move." } as any),
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:649:    showMoreShown: false, trainerView: "plain", trainingMode: "restricted", isUserTurn: true, trainerPhase: "ready_for_user", bookStatus: "in_book", isBranchTransition: false, isTerminal: false, brainAnalysis: null, hintCount: 0,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:650:    coachMoveUci: null, visualMoveUci: null, showMoreTargetUci: null,
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:653:  assert.equal(/bc4|f1c4| f1 | c4 |bishop|arrow|target/i.test(preAll) && !/find the next move|hint/i.test(preAll) ? false : true, true); // pre must not reveal SAN/UCI/sq/piece/arrow/target for Bc4
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:655:  if (preBc4Surf.coach && preBc4Surf.coach.body && /bc4|f1c4|bishop to c4/i.test(preBc4Surf.coach.body)) throw new Error("plain pre coach body must not reveal Bc4 details");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:671:  const postCoachText = (postSurfForShow.coach && (postSurfForShow.coach.body || postSurfForShow.coach.title) || "") + " " + (postSurfForShow.showMore && postSurfForShow.showMore.content || "");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:675:  // Show More reuses Assisted payload and visual recipe (same uci etc)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:684:  console.log("✓ Step 3 coaching copy format + Show More same payload tests passed");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:685:  console.log("✓ Step 4 Plain View Show More verification (pre no Bc4 reveal, post reuses assisted Bc4 payload + f1-c4 only) passed");
lib/blundr/presentation/actionPolicyBuilder.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/presentation/actionPolicyBuilder.ts:40:    if (safeFrame.revealAction.kind === "continue_from_here") {
lib/blundr/presentation/actionPolicyBuilder.ts:43:          kind: "continue_from_here",
lib/blundr/presentation/actionPolicyBuilder.ts:44:          label: safeFrame.revealAction.label || "Continue from Here",
lib/blundr/presentation/actionPolicyBuilder.ts:54:    if (safeFrame.revealAction.kind === "reveal_target") {
lib/blundr/presentation/actionPolicyBuilder.ts:57:          kind: "reveal_target",
lib/blundr/presentation/actionPolicyBuilder.ts:58:          label: safeFrame.revealAction.label || "Reveal target",
lib/blundr/presentation/actionPolicyBuilder.ts:59:          targetUci: safeFrame.revealAction.targetUci,
lib/blundr/presentation/actionPolicyBuilder.ts:60:          targetSan: safeFrame.revealAction.targetSan,
lib/blundr/presentation/actionPolicyBuilder.ts:77:    if (safeFrame.targetUci && safeFrame.revealAction.kind === "reveal_target") {
lib/blundr/presentation/actionPolicyBuilder.ts:80:          kind: "reveal_target",
lib/blundr/presentation/actionPolicyBuilder.ts:81:          label: safeFrame.revealAction.label || "Reveal target",
lib/blundr/presentation/actionPolicyBuilder.ts:82:          targetUci: safeFrame.revealAction.targetUci,
lib/blundr/presentation/actionPolicyBuilder.ts:83:          targetSan: safeFrame.revealAction.targetSan,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/presentation/buildVisibleTeachingSurface.ts:8:import type { VisibleTeachingSurface } from "./types";
lib/blundr/presentation/buildVisibleTeachingSurface.ts:11:export interface BuildVisibleTeachingSurfaceInput {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:12:  frame: CurrentInstructionFrame;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:16:  showMoreRevealed: boolean;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:19:type LegacyBuildVisibleTeachingSurfaceInput = {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:20:  currentInstructionFrame?: CurrentInstructionFrame;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:23:  showMoreShown?: boolean;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:27:function isCanonicalInput(input: unknown): input is BuildVisibleTeachingSurfaceInput {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:28:  const candidate = input as BuildVisibleTeachingSurfaceInput;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:32:function buildLegacyCompatibilitySurface(input: LegacyBuildVisibleTeachingSurfaceInput): any {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:36:  const showMoreShown = Boolean(input.showMoreShown);
lib/blundr/presentation/buildVisibleTeachingSurface.ts:37:  const plainPre = trainerView === "plain" && !showMoreShown;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:45:    coach: {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:48:      body: plainPre ? null : "Follow the coaching guidance.",
lib/blundr/presentation/buildVisibleTeachingSurface.ts:51:    hint: {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:55:    showMore: {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:56:      shown: showMoreShown,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:57:      content: showMoreShown ? "Additional explanation is available." : null,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:67:    actions: plainPre ? ["hint", "show_more"] : ["hint"],
lib/blundr/presentation/buildVisibleTeachingSurface.ts:100:export function buildVisibleTeachingSurface(input: BuildVisibleTeachingSurfaceInput): VisibleTeachingSurface;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:101:export function buildVisibleTeachingSurface(input: LegacyBuildVisibleTeachingSurfaceInput): any;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:102:export function buildVisibleTeachingSurface(
lib/blundr/presentation/buildVisibleTeachingSurface.ts:103:  input: BuildVisibleTeachingSurfaceInput | LegacyBuildVisibleTeachingSurfaceInput,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:104:): VisibleTeachingSurface | any {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:112:    showMoreRevealed: input.showMoreRevealed,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:117:  const surfaceBase: VisibleTeachingSurface = {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:152:export default buildVisibleTeachingSurface;
lib/blundr/presentation/coachActionStylePolicy.ts:1:import type { CoachDecision } from "@/lib/blundr/coach/coachTypes";
lib/blundr/presentation/coachActionStylePolicy.ts:8:  coachIntent?: string | null;
lib/blundr/presentation/coachActionStylePolicy.ts:12:const BRANCH_ACTION_IDS: VisibleCoachAction[] = ["continue_from_here", "restart_line"];
lib/blundr/presentation/coachActionStylePolicy.ts:16:  const coachIntent = String(input.coachIntent ?? "").trim();
lib/blundr/presentation/coachActionStylePolicy.ts:24:    coachIntent === "branch_transition" ||
lib/blundr/presentation/coachActionStylePolicy.ts:25:    coachIntent === "continuation_pause" ||
lib/blundr/presentation/coachActionStylePolicy.ts:32:  if (action === "continue_from_here") return "branch_continue";
lib/blundr/presentation/coachActionStylePolicy.ts:39:  const debugIntent = debug.coachIntent;
lib/blundr/presentation/copySurfaceBuilder.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/presentation/copySurfaceBuilder.ts:32:    return toVisibleCopy("show_more", safeFrame.showMore);
lib/blundr/presentation/index.ts:7:export * from "./buildVisibleTeachingSurface";
lib/blundr/presentation/modeSurfacePolicy.ts:1:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/presentation/modeSurfacePolicy.ts:7:  showMoreRevealed: boolean;
lib/blundr/presentation/modeSurfacePolicy.ts:8:  frame: CurrentInstructionFrame;
lib/blundr/presentation/modeSurfacePolicy.ts:31:  return input.showMoreRevealed ? "plain_after_show_more" : "plain_before_show_more";
lib/blundr/presentation/modeSurfacePolicy.ts:34:export function surfaceModeAllowsTargetReveal(mode: TeachingSurfaceMode): boolean {
lib/blundr/presentation/phaseActionGating.ts:1:import type { CoachButton } from "../coach/coachTypes";
lib/blundr/presentation/phaseActionGating.ts:6:const VISIBLE_TEACHING_ACTIONS = new Set<VisibleCoachAction>(["hint", "show_more"]);
lib/blundr/presentation/phaseActionGating.ts:8:  "hint",
lib/blundr/presentation/phaseActionGating.ts:10:  "continue_from_here",
lib/blundr/presentation/phaseActionGating.ts:19:  expectedMoveSan?: string | null;
lib/blundr/presentation/phaseActionGating.ts:20:  expectedMoveUci?: string | null;
lib/blundr/presentation/phaseActionGating.ts:22:  coachShouldShow: boolean;
lib/blundr/presentation/phaseActionGating.ts:23:  coachButtons: CoachButton[];
lib/blundr/presentation/phaseActionGating.ts:29:  revealButtonVisible: boolean;
lib/blundr/presentation/phaseActionGating.ts:30:  revealableExpectedMove: boolean;
lib/blundr/presentation/phaseActionGating.ts:31:  revealableContinuationCandidate: boolean;
lib/blundr/presentation/phaseActionGating.ts:35:export function hasExpectedMove(input: Pick<TrainerPhaseActionGateInput, "expectedMoveSan" | "expectedMoveUci">): boolean {
lib/blundr/presentation/phaseActionGating.ts:36:  return Boolean(input.expectedMoveSan || input.expectedMoveUci);
lib/blundr/presentation/phaseActionGating.ts:40:  const expectedMovePresent = hasExpectedMove(input);
lib/blundr/presentation/phaseActionGating.ts:43:  const revealableExpectedMove = activeUserMoveFrame && input.trainingMode === "restricted" && expectedMovePresent;
lib/blundr/presentation/phaseActionGating.ts:44:  const revealableContinuationCandidate =
lib/blundr/presentation/phaseActionGating.ts:46:  const revealButtonVisible = revealableExpectedMove || revealableContinuationCandidate;
lib/blundr/presentation/phaseActionGating.ts:52:      revealButtonVisible: false,
lib/blundr/presentation/phaseActionGating.ts:53:      revealableExpectedMove: false,
lib/blundr/presentation/phaseActionGating.ts:54:      revealableContinuationCandidate: false,
lib/blundr/presentation/phaseActionGating.ts:59:  if (input.trainingMode === "restricted" && !expectedMovePresent) {
lib/blundr/presentation/phaseActionGating.ts:63:      revealButtonVisible: false,
lib/blundr/presentation/phaseActionGating.ts:64:      revealableExpectedMove: false,
lib/blundr/presentation/phaseActionGating.ts:65:      revealableContinuationCandidate: false,
lib/blundr/presentation/phaseActionGating.ts:70:  const filteredButtons = input.coachButtons.filter((button) => {
lib/blundr/presentation/phaseActionGating.ts:73:    if (button === "show_more" || button === "hint") {
lib/blundr/presentation/phaseActionGating.ts:77:    if (button === "continue_from_here") return true; // branch allowed
lib/blundr/presentation/phaseActionGating.ts:95:    shouldRenderCoach: input.coachShouldShow,
lib/blundr/presentation/phaseActionGating.ts:97:    revealButtonVisible,
lib/blundr/presentation/phaseActionGating.ts:98:    revealableExpectedMove,
lib/blundr/presentation/phaseActionGating.ts:99:    revealableContinuationCandidate,
lib/blundr/presentation/presentationDebug.ts:9:    coachSurfaceOwner: frame.debug.coachSurfaceOwner,
lib/blundr/presentation/presentationDebug.ts:10:    coachBlockedReason: frame.debug.coachBlockedReason,
lib/blundr/presentation/surfaceDebug.ts:1:import type { VisibleTeachingSurface } from "./types";
lib/blundr/presentation/surfaceDebug.ts:4:  surface: VisibleTeachingSurface;
lib/blundr/presentation/surfaceDebug.ts:5:}): VisibleTeachingSurface["debug"] {
lib/blundr/presentation/testPresentationFrame.ts:1:import { testCoachHideDoesNotSuppressVisuals } from "./__tests__/coachHideDoesNotSuppressVisuals.test";
lib/blundr/presentation/testVisualLayerIndependence.ts:1:import { testCoachHideDoesNotSuppressVisuals } from "./__tests__/coachHideDoesNotSuppressVisuals.test";
lib/blundr/presentation/trainerPresentationFrame.ts:1:// v2.7.40 Agent 5: brain for coach intelligence in chain (skeletal ok)
lib/blundr/presentation/trainerPresentationFrame.ts:6:export type TrainerCoachOwner = "none" | "coach_decision" | "branch_transition_surface" | "brain_skeleton";
lib/blundr/presentation/trainerPresentationFrame.ts:30:  coachQuality?: unknown;
lib/blundr/presentation/trainerPresentationFrame.ts:59:  coachShouldShow?: boolean;
lib/blundr/presentation/trainerPresentationFrame.ts:60:  coachHiddenForFrame?: boolean;
lib/blundr/presentation/trainerPresentationFrame.ts:61:  coachIntent?: string | null;
lib/blundr/presentation/trainerPresentationFrame.ts:62:  coachTitle?: string | null;
lib/blundr/presentation/trainerPresentationFrame.ts:63:  coachBody?: string | null;
lib/blundr/presentation/trainerPresentationFrame.ts:64:  coachButtons?: string[] | readonly string[] | null;
lib/blundr/presentation/trainerPresentationFrame.ts:65:  coachSuppressedReason?: string | null;
lib/blundr/presentation/trainerPresentationFrame.ts:66:  coachUtteranceFamily?: string | null;
lib/blundr/presentation/trainerPresentationFrame.ts:67:  coachTemplateId?: string | null;
lib/blundr/presentation/trainerPresentationFrame.ts:68:  coachSelectedTheme?: string | null;
lib/blundr/presentation/trainerPresentationFrame.ts:69:  coachQuality?: unknown;
lib/blundr/presentation/trainerPresentationFrame.ts:80:  coachSurfacePolicy?: unknown;
lib/blundr/presentation/trainerPresentationFrame.ts:81:  // v2.7.40 Agent 5: pass brainAnalysis (from analyzeBlundrPosition) so coach copy derives from CurrentInstructionFrame.target via Brain -> PresentationFrame
lib/blundr/presentation/trainerPresentationFrame.ts:95:    // Step 4: allow plain so that when showMoreShown, the (effective-assisted) visualRecipeLines
lib/blundr/presentation/trainerPresentationFrame.ts:97:    // for plain pre-showMore via !isPlainPreShowMore. This enables plain post to reuse assisted
lib/blundr/presentation/trainerPresentationFrame.ts:140:  let coach: TrainerCoachFrame = {
lib/blundr/presentation/trainerPresentationFrame.ts:146:    suppressedReason: input.coachSuppressedReason ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:147:    intent: input.coachIntent ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:148:    utteranceFamily: input.coachUtteranceFamily ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:149:    templateId: input.coachTemplateId ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:150:    selectedTheme: input.coachSelectedTheme ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:151:    coachQuality: input.coachQuality ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:160:  if (input.coachShouldShow && !input.coachHiddenForFrame) {
lib/blundr/presentation/trainerPresentationFrame.ts:161:    coach = {
lib/blundr/presentation/trainerPresentationFrame.ts:162:      ...coach,
lib/blundr/presentation/trainerPresentationFrame.ts:163:      owner: "coach_decision",
lib/blundr/presentation/trainerPresentationFrame.ts:165:      title: input.coachTitle ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:166:      body: input.coachBody ?? null,
lib/blundr/presentation/trainerPresentationFrame.ts:167:      buttons: [...(input.coachButtons ?? [])],
lib/blundr/presentation/trainerPresentationFrame.ts:171:    coach = {
lib/blundr/presentation/trainerPresentationFrame.ts:172:      ...coach,
lib/blundr/presentation/trainerPresentationFrame.ts:177:      buttons: [...(input.branchTransitionButtons ?? ["continue_from_here", "restart_line"])],
lib/blundr/presentation/trainerPresentationFrame.ts:182:  // v2.7.40 Agent 5: Brain provides the coach copy content for the canonical chain
lib/blundr/presentation/trainerPresentationFrame.ts:183:  // CurrentInstructionFrame.target -> BlundrBrainAnalysis.safeFallbackCopy (piece-matched, evidence-backed, no halluc) -> TrainerPresentationFrame -> VisibleTeachingSurface
lib/blundr/presentation/trainerPresentationFrame.ts:184:  // Legacy coachDecision / liveCoach text remains input-only for debug/bypass; brain copy used for visible coach title/body on teaching frames.
lib/blundr/presentation/trainerPresentationFrame.ts:194:    // Defense: pieceType always from target via brain; surface will also cross-check vs instructionTarget
lib/blundr/presentation/trainerPresentationFrame.ts:195:    coach = {
lib/blundr/presentation/trainerPresentationFrame.ts:196:      ...coach,
lib/blundr/presentation/trainerPresentationFrame.ts:204:      // coachPieceType implicitly brainCopy.pieceType (matches target)
lib/blundr/presentation/trainerPresentationFrame.ts:216:    coach,
lib/blundr/presentation/trainerPresentationFrame.ts:231:      coachSurfacePolicy: input.coachSurfacePolicy ?? null,
lib/blundr/presentation/trainerPresentationTypes.ts:24:  coach: {
lib/blundr/presentation/trainerPresentationTypes.ts:26:    owner: "intent_first_coach" | "legacy_fallback" | "branch_transition_surface" | "none";
lib/blundr/presentation/trainerPresentationTypes.ts:45:    coachSurfaceOwner: string;
lib/blundr/presentation/trainerPresentationTypes.ts:46:    coachBlockedReason?: string;
lib/blundr/presentation/types.ts:13:  | "reveal_target"
lib/blundr/presentation/types.ts:14:  | "continue_from_here"
lib/blundr/presentation/types.ts:53:export interface VisibleTeachingSurface {
lib/blundr/presentation/visibleActionPolicy.ts:6: * - Plain View active teaching frame: ONLY ["hint", "show_more"]
lib/blundr/presentation/visibleActionPolicy.ts:8: * - Branch transition: EXACTLY ["continue_from_here", "restart_line"]
lib/blundr/presentation/visibleActionPolicy.ts:10: * - No forbidden labels ever emitted: "Reveal Next Move", "Reveal Move", "Show Answer", "Show Move", "Show Plan", "Analyze Idea", "Attack", "Defense", "Plan" etc.
lib/blundr/presentation/visibleActionPolicy.ts:15:  | "hint"
lib/blundr/presentation/visibleActionPolicy.ts:17:  | "continue_from_here"
lib/blundr/presentation/visibleActionPolicy.ts:31:  coachOwner?: string; // e.g. "branch_transition_surface" from presentation
lib/blundr/presentation/visibleActionPolicy.ts:55:    coachOwner,
lib/blundr/presentation/visibleActionPolicy.ts:76:    coachOwner === "branch_transition_surface" ||
lib/blundr/presentation/visibleActionPolicy.ts:82:      actions: ["continue_from_here", "restart_line"],
lib/blundr/presentation/visibleActionPolicy.ts:89:  // Per strict: Plain View teaching ONLY hint/show_more; Assisted teaching frame: []
lib/blundr/presentation/visibleActionPolicy.ts:98:  // Plain View teaching frames (recall mode): ONLY hint + show_more pre-reveal
lib/blundr/presentation/visibleActionPolicy.ts:102:        actions: [], // post-reveal or after show more may evolve; for now clean per pre-ShowMore spec
lib/blundr/presentation/visibleActionPolicy.ts:108:      actions: ["hint", "show_more"],
lib/blundr/presentation/visibleActionPolicy.ts:110:      reason: "plain_teaching_pre_showmore_only_hint_show_more",
lib/blundr/presentation/visibleActionPolicy.ts:117:      actions: ["continue_from_here", "restart_line"], // branch fallback
lib/blundr/presentation/visibleActionPolicy.ts:137:    case "hint":
lib/blundr/presentation/visibleActionPolicy.ts:140:      return "Show More";
lib/blundr/presentation/visibleActionPolicy.ts:141:    case "continue_from_here":
lib/blundr/presentation/visibleActionPolicy.ts:158:  const allowed: VisibleCoachAction[] = ["hint", "show_more", "continue_from_here", "restart_line", "review_pattern"];
lib/blundr/presentation/visibleActionPolicy.ts:167:  answer: null, // removed from teaching UI; reveal is separate / debug
lib/blundr/presentation/visualRecipeMapper.ts:1:import type { CompiledCoachVisualIntent, CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:4:import { buildCurrentInstructionFrame, buildVerifiedMoveFacts, isBookLikeInstructionTarget } from "../currentInstructionFrame";
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:12:export function testCurrentInstructionFrame(): void {
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:21:  const e5 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:30:  const f4 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:39:  const nf3 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:48:  const bc4 = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:56:  const castle = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:65:  const nxc6Check = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:75:  const qxe7Mate = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:85:  const promotion = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:98:  const lichessBranch = buildCurrentInstructionFrame({
lib/blundr/runtime/__tests__/currentInstructionFrame.test.ts:107:  const adaptiveBranch = buildCurrentInstructionFrame({
lib/blundr/runtime/continuationRuntimeState.ts:3:import type { CurrentInstructionFrame } from "./currentInstructionFrame";
lib/blundr/runtime/continuationRuntimeState.ts:127:export function buildContinuationRuntimeAuthorityState(frame: CurrentInstructionFrame): ContinuationRuntimeAuthorityState {
lib/blundr/runtime/currentInstructionFrame.ts:9:  type CurrentInstructionFrameKind,
lib/blundr/runtime/currentInstructionFrame.ts:30:export type CurrentInstructionFrame = {
lib/blundr/runtime/currentInstructionFrame.ts:32:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:72:export type LegacyBuildCurrentInstructionFrameInput = {
lib/blundr/runtime/currentInstructionFrame.ts:84:export type CanonicalBuildCurrentInstructionFrameInput = {
lib/blundr/runtime/currentInstructionFrame.ts:85:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:103:  debug?: Partial<CurrentInstructionFrame["debug"]>;
lib/blundr/runtime/currentInstructionFrame.ts:106:export type BuildCurrentInstructionFrameInput =
lib/blundr/runtime/currentInstructionFrame.ts:107:  | LegacyBuildCurrentInstructionFrameInput
lib/blundr/runtime/currentInstructionFrame.ts:108:  | CanonicalBuildCurrentInstructionFrameInput;
lib/blundr/runtime/currentInstructionFrame.ts:156:function mapMode(trainingMode: TrainingMode | string, hasTarget: boolean, kind: CurrentInstructionFrameKind): CurrentInstructionMode {
lib/blundr/runtime/currentInstructionFrame.ts:243:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:281:function isCanonicalBuildInput(input: BuildCurrentInstructionFrameInput): input is CanonicalBuildCurrentInstructionFrameInput {
lib/blundr/runtime/currentInstructionFrame.ts:295:  kind: CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:305:function buildCanonicalFrame(input: CanonicalBuildCurrentInstructionFrameInput): CurrentInstructionFrame {
lib/blundr/runtime/currentInstructionFrame.ts:515:export function buildCurrentInstructionFrame(input: BuildCurrentInstructionFrameInput): CurrentInstructionFrame {
lib/blundr/runtime/currentInstructionFrame.ts:520:  const legacyInput = input as LegacyBuildCurrentInstructionFrameInput;
lib/blundr/runtime/currentInstructionFrame.ts:546:    const kind: CurrentInstructionFrameKind = "opponent_replying";
lib/blundr/runtime/currentInstructionFrame.ts:570:    const kind: CurrentInstructionFrameKind = legacyInput.trainerPhase === "terminal" ? "terminal" : "transitioning";
lib/blundr/runtime/currentInstructionFrame.ts:612:      const kind = target.kind as CurrentInstructionFrameKind;
lib/blundr/runtime/currentInstructionFrame.ts:640:  const kind: CurrentInstructionFrameKind = "blocked";
lib/blundr/runtime/currentInstructionFrame.ts:685:export function isUserTurnTeachingFrame(frame: CurrentInstructionFrame): boolean {
lib/blundr/runtime/currentInstructionFrame.ts:693:export function isGuidedTeachingFrame(frame: CurrentInstructionFrame): boolean {
lib/blundr/runtime/currentInstructionFrame.ts:698:export function isContinuationTeachingFrame(frame: CurrentInstructionFrame): boolean {
lib/blundr/runtime/currentInstructionFrame.ts:703:export function getInstructionTargetOrNull(frame: CurrentInstructionFrame): CurrentInstructionTarget | null {
lib/blundr/runtime/currentInstructionFrame.ts:707:export function assertLockedInstructionTarget(frame: CurrentInstructionFrame): CurrentInstructionTarget {
lib/blundr/runtime/currentInstructionFrame.ts:710:    throw new Error("CurrentInstructionFrame has no locked instruction target.");
lib/blundr/runtime/currentInstructionFrame.ts:713:    throw new Error("CurrentInstructionFrame target is not locked.");
lib/blundr/runtime/currentInstructionFrame.ts:718:export function getFrameTargetSignature(frame: CurrentInstructionFrame): string {
lib/blundr/runtime/currentInstructionFrame.ts:727:  CurrentInstructionFrameKind,
lib/blundr/runtime/currentInstructionTarget.ts:20:export type CurrentInstructionFrameKind =
lib/blundr/runtime/instructionFrameLock.ts:5:  type CurrentInstructionFrame,
lib/blundr/runtime/instructionFrameLock.ts:25:export function createInstructionFrameLock(frame: CurrentInstructionFrame): InstructionFrameLock {
lib/blundr/runtime/instructionFrameLock.ts:36:  frame: CurrentInstructionFrame;
lib/blundr/runtime/instructionFrameLock.ts:102:export function assertFrameTargetLocked(frame: CurrentInstructionFrame): CurrentInstructionTarget {
lib/blundr/safety/coachSafetyGate.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/coachSafetyGate.ts:4:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/safety/coachSafetyGate.ts:14:  frame: CurrentInstructionFrame;
lib/blundr/safety/index.ts:8:export * from "./coachSafetyGate";
lib/blundr/safety/nullTargetPolicy.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/nullTargetPolicy.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/safety/nullTargetPolicy.ts:15:  frame: CurrentInstructionFrame;
lib/blundr/safety/nullTargetPolicy.ts:23:      code: "null_target_move_coaching",
lib/blundr/safety/nullTargetPolicy.ts:30:  if (input.compiled.revealAction.kind === "reveal_target") {
lib/blundr/safety/nullTargetPolicy.ts:32:      code: "null_target_reveal",
lib/blundr/safety/nullTargetPolicy.ts:34:      message: "Null-target frame must not include reveal_target action.",
lib/blundr/safety/nullTargetPolicy.ts:35:      surface: "reveal",
lib/blundr/safety/nullTargetPolicy.ts:49:  const coachingText = `${input.compiled.assisted.title} ${input.compiled.assisted.body} ${input.compiled.showMore.title} ${input.compiled.showMore.body}`;
lib/blundr/safety/nullTargetPolicy.ts:50:  if (looksLikeMoveCoaching(coachingText)) {
lib/blundr/safety/nullTargetPolicy.ts:52:      code: "null_target_move_coaching",
lib/blundr/safety/nullTargetPolicy.ts:54:      message: "Null-target frame contains move-coaching language.",
lib/blundr/safety/nullTargetPolicy.ts:61:    && input.compiled.revealAction.kind === "continue_from_here"
lib/blundr/safety/nullTargetPolicy.ts:65:      code: "null_target_reveal",
lib/blundr/safety/nullTargetPolicy.ts:67:      message: "continue_from_here action present without branch-complete eligibility.",
lib/blundr/safety/nullTargetPolicy.ts:68:      surface: "reveal",
lib/blundr/safety/plainLeakPolicy.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/plainLeakPolicy.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/safety/plainLeakPolicy.ts:29:  frame: CurrentInstructionFrame;
lib/blundr/safety/plainLeakPolicy.ts:50:      message: "Plain text leaks target information before Show More.",
lib/blundr/safety/providerAuthorityPolicy.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/providerAuthorityPolicy.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/safety/providerAuthorityPolicy.ts:9:  frame: CurrentInstructionFrame;
lib/blundr/safety/safeFallbackFrame.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/safeFallbackFrame.ts:2:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/safety/safeFallbackFrame.ts:10:  frame: CurrentInstructionFrame;
lib/blundr/safety/safeFallbackFrame.ts:20:    "null_target_move_coaching",
lib/blundr/safety/safeFallbackFrame.ts:22:  const nullViolation = hasCode(input.issues, ["null_target_visual", "null_target_reveal", "null_target_move_coaching"]);
lib/blundr/safety/safeFallbackFrame.ts:24:  const revealValid = !hasCritical
lib/blundr/safety/safeFallbackFrame.ts:25:    && !hasCode(input.issues, ["reveal_mismatch", "null_target_reveal"])
lib/blundr/safety/safeFallbackFrame.ts:27:    && input.compiled.revealAction.kind === "reveal_target"
lib/blundr/safety/safeFallbackFrame.ts:28:    && input.compiled.revealAction.targetUci === input.frame.target.uci;
lib/blundr/safety/safeFallbackFrame.ts:42:      bullets: ["Detailed coaching was blocked for safety."],
lib/blundr/safety/safeFallbackFrame.ts:56:          body: "No move-specific coaching is available in this frame.",
lib/blundr/safety/safeFallbackFrame.ts:61:    showMore: {
lib/blundr/safety/safeFallbackFrame.ts:71:    revealAction: revealValid
lib/blundr/safety/safeFallbackFrame.ts:72:      ? input.compiled.revealAction
lib/blundr/safety/safeFallbackFrame.ts:75:          label: "No reveal",
lib/blundr/safety/strongClaimPolicy.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/strongClaimPolicy.ts:39:  const text = `${input.compiled.plain.title} ${input.compiled.plain.body} ${input.compiled.assisted.title} ${input.compiled.assisted.body} ${input.compiled.showMore.title} ${input.compiled.showMore.body}`;
lib/blundr/safety/targetInvariantPolicy.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/targetInvariantPolicy.ts:3:import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
lib/blundr/safety/targetInvariantPolicy.ts:13:  frame: CurrentInstructionFrame;
lib/blundr/safety/targetInvariantPolicy.ts:81:    if (input.compiled.revealAction.kind === "reveal_target" && input.compiled.revealAction.targetUci !== frameTargetUci) {
lib/blundr/safety/targetInvariantPolicy.ts:83:        code: "reveal_mismatch",
lib/blundr/safety/targetInvariantPolicy.ts:85:        message: "Reveal target does not match frame target.",
lib/blundr/safety/targetInvariantPolicy.ts:86:        surface: "reveal",
lib/blundr/safety/targetInvariantPolicy.ts:88:        actual: input.compiled.revealAction.targetUci,
lib/blundr/safety/targetInvariantPolicy.ts:93:    const showMoreText = `${input.compiled.showMore.title} ${input.compiled.showMore.body}`.toLowerCase();
lib/blundr/safety/targetInvariantPolicy.ts:95:    const showMoreHasTarget = containsToken(showMoreText, input.compiled.targetSan) || containsToken(showMoreText, input.compiled.targetUci);
lib/blundr/safety/targetInvariantPolicy.ts:97:    if (assistedHasTarget !== showMoreHasTarget) {
lib/blundr/safety/targetInvariantPolicy.ts:101:        message: "Assisted and Show More target references are not aligned.",
lib/blundr/safety/types.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/types.ts:11:  | "reveal_mismatch"
lib/blundr/safety/types.ts:23:  | "null_target_move_coaching"
lib/blundr/safety/types.ts:25:  | "null_target_reveal"
lib/blundr/safety/types.ts:41:    | "reveal"
lib/blundr/salience/__tests__/salienceVisualSelector.test.ts:12:    expectedMove: { uci: "g1f3", san: "Nf3" },
lib/blundr/salience/__tests__/salienceVisualSelector.test.ts:23:    expectedMove: { uci: "e2e4", san: "e4" },
lib/blundr/salience/__tests__/salienceVisualSelector.test.ts:37:    expectedMove: { uci: "f1c4", san: "Bc4" },
lib/blundr/salience/__tests__/salienceVisualSelector.test.ts:59:    expectedMove: { uci: "e1g1", san: "O-O" },
lib/blundr/salience/__tests__/salienceVisualSelector.test.ts:73:    expectedMove: { uci: "d2d4", san: "d4" },
lib/blundr/salience/salienceScorer.ts:9:  expectedMove: number;
lib/blundr/salience/salienceScorer.ts:52:    expectedMove: packet.expectedMove === candidate.move ? 1000 : 0,
lib/blundr/teaching/__tests__/overlayLifecycle.test.ts:7:  shouldRenderMoveTeachingOverlay,
lib/blundr/teaching/__tests__/overlayLifecycle.test.ts:14:    shouldRenderMoveTeachingOverlay({
lib/blundr/teaching/__tests__/overlayLifecycle.test.ts:28:    shouldRenderMoveTeachingOverlay({
lib/blundr/teaching/__tests__/overlayLifecycle.test.ts:42:    shouldRenderMoveTeachingOverlay({
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:9:    expectedMoveUci: "e1g1",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:10:    expectedMoveSan: "O-O",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:43:    expectedMoveUci: "f1c4",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:44:    expectedMoveSan: "Bc4",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:64:    expectedMoveUci: "c2c3",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:65:    expectedMoveSan: "c3",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:90:    expectedMoveUci: "d3d4",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:91:    expectedMoveSan: "d4",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:96:      expectedMoveCp: -180,
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:114:  const revealOnly = buildTrainingContext({
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:116:    expectedMoveUci: "c2c3",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:117:    expectedMoveSan: "c3",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:133:  assert.equal(revealOnly.visualDecision.visualLines.length >= 1, true);
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:134:  assert.equal(revealOnly.visualDecision.visualLines.some((line) => line.from === "c2" && line.to === "c3"), true);
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:135:  assert.equal(revealOnly.moveTrust, "reveal_only_unverified");
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:136:  assert.equal(revealOnly.userLabel, "Study-line move");
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:137:  assert.equal(revealOnly.cue.userFacing.badge === "Blundr Brain Validated", false);
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:142:    expectedMoveUci: "f1e1",
lib/blundr/teaching/__tests__/trainingContextEngine.test.ts:143:    expectedMoveSan: "Re1",
lib/blundr/teaching/conceptDetectors.ts:29:  const moveFrom = delta?.from ?? evidence.expectedMoveUci?.slice(0, 2) ?? "";
lib/blundr/teaching/conceptDetectors.ts:30:  const moveTo = delta?.to ?? evidence.expectedMoveUci?.slice(2, 4) ?? "";
lib/blundr/teaching/evidenceCollector.ts:98:  expectedMoveSan?: string;
lib/blundr/teaching/evidenceCollector.ts:99:  expectedMoveUci?: string;
lib/blundr/teaching/evidenceCollector.ts:112:  expectedMoveSemanticAnalysis?: MoveSemanticAnalysis;
lib/blundr/teaching/evidenceCollector.ts:135:  expectedMove?: { uci?: string; san?: string };
lib/blundr/teaching/evidenceCollector.ts:384:  const expectedUci = input.expectedMove?.uci ?? teachingInput.move.uci;
lib/blundr/teaching/evidenceCollector.ts:385:  const expectedSan = input.expectedMove?.san ?? teachingInput.move.san;
lib/blundr/teaching/evidenceCollector.ts:403:  let expectedMoveSemanticAnalysis: MoveSemanticAnalysis | undefined;
lib/blundr/teaching/evidenceCollector.ts:411:      expectedMoveSemanticAnalysis = analyzeMoveSemantics({
lib/blundr/teaching/evidenceCollector.ts:436:      expectedMoveUci: expectedUci,
lib/blundr/teaching/evidenceCollector.ts:437:      expectedMoveSan: expectedSan,
lib/blundr/teaching/evidenceCollector.ts:463:    expectedMoveSan: expectedSan,
lib/blundr/teaching/evidenceCollector.ts:464:    expectedMoveUci: expectedUci,
lib/blundr/teaching/evidenceCollector.ts:477:    expectedMoveSemanticAnalysis,
lib/blundr/teaching/moveQualityGate.ts:23:  expectedMovesUci: string[];
lib/blundr/teaching/moveQualityGate.ts:28:  expectedMoveCp?: number;
lib/blundr/teaching/moveQualityGate.ts:51:  expectedMovesUci: string[];
lib/blundr/teaching/moveQualityGate.ts:53:  const expected = input.expectedMovesUci
lib/blundr/teaching/moveQualityGate.ts:64:  expectedMoves: Array<{ uci: string; san?: string }>;
lib/blundr/teaching/moveQualityGate.ts:67:  const expected = input.expectedMoves
lib/blundr/teaching/moveQualityGate.ts:89:      expectedMovesUci: [],
lib/blundr/teaching/moveQualityGate.ts:100:      expectedMovesUci: expected.map((move) => move.uci),
lib/blundr/teaching/moveQualityGate.ts:113:      expectedMovesUci: expected.map((move) => move.uci),
lib/blundr/teaching/moveQualityGate.ts:118:      expectedMoveCp: match.scoreCp,
lib/blundr/teaching/moveQualityGate.ts:132:    expectedMovesUci: expected.map((move) => move.uci),
lib/blundr/teaching/moveQualityGate.ts:134:    expectedMoveCp: undefined,
lib/blundr/teaching/moveSemanticAnalyzer.ts:96:function effect(input: Omit<MoveSemanticEffect, "claimSafety" | "revealRisk"> & {
lib/blundr/teaching/moveSemanticAnalyzer.ts:98:  revealRisk?: MoveSemanticEffect["revealRisk"];
lib/blundr/teaching/moveSemanticAnalyzer.ts:103:    revealRisk: input.revealRisk ?? (input.requiresMoveRecommendation ? "high" : "low"),
lib/blundr/teaching/overlayLifecycle.ts:32:export function shouldRenderMoveTeachingOverlay(input: {
lib/blundr/teaching/storyRanker.ts:45:  const riskPenalty = candidate.revealRisk === "high" ? 0.25 : candidate.revealRisk === "medium" ? 0.12 : candidate.revealRisk === "low" ? 0.05 : 0;
lib/blundr/teaching/storyRanker.ts:83:  const moveUci = evidence.expectedMoveUci;
lib/blundr/teaching/storyRanker.ts:84:  const moveSan = evidence.expectedMoveSan ?? "this move";
lib/blundr/teaching/storyRanker.ts:99:      revealRisk: concept.requiresMoveRecommendation ? "high" : concept.claimSafety === "safe" ? "low" : "medium",
lib/blundr/teaching/storyRanker.ts:137:    if (candidate.revealRisk === "high" && !permissionContext.canShowAnswerOverlays) rejectionReasons.push("reveal_risk_blocked");
lib/blundr/teaching/storyTypes.ts:38:  | "reveal_risk_blocked"
lib/blundr/teaching/storyTypes.ts:55:  revealRisk: "none" | "low" | "medium" | "high";
lib/blundr/teaching/teachingCueCompiler.ts:13:    id: cueId("tc", evidence.expectedMoveUci ?? "none"),
lib/blundr/teaching/teachingCueCompiler.ts:46:      moveSan: evidence.expectedMoveSan ?? "",
lib/blundr/teaching/teachingCueCompiler.ts:47:      moveUci: evidence.expectedMoveUci ?? "",
lib/blundr/teaching/teachingCueCompiler.ts:62:    moveSan: input.evidence.expectedMoveSan,
lib/blundr/teaching/teachingCueCompiler.ts:101:    moveSan: input.evidence.expectedMoveSan,
lib/blundr/teaching/teachingCueCompiler.ts:116:      next: input.evidence.expectedMoveSan ? `Play ${input.evidence.expectedMoveSan}.` : undefined,
lib/blundr/teaching/teachingOrchestrator.ts:27:  if (result.moveTrust === "reveal_only_unverified") return "context_only";
lib/blundr/teaching/teachingOrchestrator.ts:34:export function orchestrateTeaching(input: CollectTeachingEvidenceInput & {
lib/blundr/teaching/teachingOrchestrator.ts:44:    expectedMoveUci: input.expectedMove?.uci ?? input.teachingInput.move.uci,
lib/blundr/teaching/teachingOrchestrator.ts:45:    expectedMoveSan: input.expectedMove?.san ?? input.teachingInput.move.san,
lib/blundr/teaching/teachingOrchestrator.ts:64:    repertoireSupport: Boolean(input.repertoireMoves?.some((move) => move.uci === (input.expectedMove?.uci ?? input.teachingInput.move.uci))),
lib/blundr/teaching/teachingPermissions.ts:12:  canShowRevealMove: boolean;
lib/blundr/teaching/teachingPermissions.ts:39:      userLabel: "Plain View • No hints",
lib/blundr/teaching/teachingPermissions.ts:46:      canShowRevealMove: true,
lib/blundr/teaching/teachingPermissions.ts:64:    canShowRevealMove: true,
lib/blundr/teaching/topMoveComparison.ts:8:  expectedMoveUci?: string;
lib/blundr/teaching/topMoveComparison.ts:9:  expectedMoveSan?: string;
lib/blundr/teaching/topMoveComparison.ts:46:  const expected = normalizeUci(input.expectedMoveUci);
lib/blundr/teaching/topMoveComparison.ts:52:    moveSan: input.expectedMoveSan,
lib/blundr/teaching/topMoveComparison.ts:80:          expectedMoveTheme: expectedTheme,
lib/blundr/teaching/topMoveComparison.ts:93:          expectedMoveTheme: expectedTheme,
lib/blundr/teaching/topMoveComparison.ts:106:          expectedMoveTheme: expectedTheme,
lib/blundr/teaching/topMoveComparison.ts:118:        expectedMoveTheme: expectedTheme,
lib/blundr/teaching/trainingContextEngine.ts:70:function expectedMoveValidated(fen: string, expectedUci?: string): boolean {
lib/blundr/teaching/trainingContextEngine.ts:77:  expectedMoveUci?: string;
lib/blundr/teaching/trainingContextEngine.ts:78:  expectedMoveIsValidated: boolean;
lib/blundr/teaching/trainingContextEngine.ts:79:  expectedMoveCp?: number;
lib/blundr/teaching/trainingContextEngine.ts:84:  revealModeActive: boolean;
lib/blundr/teaching/trainingContextEngine.ts:94:  if (!input.expectedMoveUci) {
lib/blundr/teaching/trainingContextEngine.ts:97:  if (!input.expectedMoveIsValidated) {
lib/blundr/teaching/trainingContextEngine.ts:117:      trust: "reveal_only_unverified",
lib/blundr/teaching/trainingContextEngine.ts:118:      reason: topTwoOnlyRejected ? "Move is a study-line choice that fell outside Stockfish top-two; reveal mode can still show it." : "Move is a study-line choice without enough validation to auto-recommend.",
lib/blundr/teaching/trainingContextEngine.ts:123:  if (input.revealModeActive && !severeBlunder && input.hasSafeSemanticExplanation) {
lib/blundr/teaching/trainingContextEngine.ts:124:    return { trust: "reveal_only_unverified", reason: "Reveal mode can show the stored study-line move with caution.", safeToRecommend: false, validationFailureReason: status === "rejected" ? "reveal_mode_override" : undefined };
lib/blundr/teaching/trainingContextEngine.ts:147:    revealRiskPenalty: input.revealRiskPenalty ?? 0,
lib/blundr/teaching/trainingContextEngine.ts:164:      score.revealRiskPenalty -
lib/blundr/teaching/trainingContextEngine.ts:179:  revealRisk?: GroundingContract["revealRisk"];
lib/blundr/teaching/trainingContextEngine.ts:189:    revealRisk: input.revealRisk ?? "low",
lib/blundr/teaching/trainingContextEngine.ts:205:    mainLineTheme: comparison?.expectedMoveTheme,
lib/blundr/teaching/trainingContextEngine.ts:234:      revealRisk: trusted ? "low" : effect.revealRisk,
lib/blundr/teaching/trainingContextEngine.ts:251:      revealRiskPenalty: trusted ? 0 : effect.revealRisk === "high" ? 0.18 : 0,
lib/blundr/teaching/trainingContextEngine.ts:264:    mainLineTheme: comparison.expectedMoveTheme,
lib/blundr/teaching/trainingContextEngine.ts:283:      revealRisk: "low",
lib/blundr/teaching/trainingContextEngine.ts:494:      if (!showAnswer && story.grounding.revealRisk === "high" && !safeToRecommend) next.rejectionReasons.push("high_reveal_risk_without_trust");
lib/blundr/teaching/trainingContextEngine.ts:558:      userLabel: "No hints",
lib/blundr/teaching/trainingContextEngine.ts:561:  const revealUnverified = moveTrust === "reveal_only_unverified";
lib/blundr/teaching/trainingContextEngine.ts:562:  const forceRecommend = (trustedExpectedMove && !severeSafetyWarning) || (revealUnverified && input.showAnswer);
lib/blundr/teaching/trainingContextEngine.ts:570:    moveTrust === "reveal_only_unverified" ? "Study-line move" :
lib/blundr/teaching/trainingContextEngine.ts:596:  expectedMoveUci?: string;
lib/blundr/teaching/trainingContextEngine.ts:597:  expectedMoveSan?: string;
lib/blundr/teaching/trainingContextEngine.ts:601:  const revealForceRecommend = input.moveTrust === "reveal_only_unverified" && input.permission.canRecommendMove;
lib/blundr/teaching/trainingContextEngine.ts:602:  const forceRecommend = (input.trustedExpectedMove && !input.severeSafetyWarning) || revealForceRecommend;
lib/blundr/teaching/trainingContextEngine.ts:607:  const from = normalizeUci(input.expectedMoveUci).slice(0, 2);
lib/blundr/teaching/trainingContextEngine.ts:608:  const to = normalizeUci(input.expectedMoveUci).slice(2, 4);
lib/blundr/teaching/trainingContextEngine.ts:631:      next: canRecommend && input.expectedMoveSan ? `Play ${input.expectedMoveSan}.` : undefined,
lib/blundr/teaching/trainingContextEngine.ts:650:      moveSan: input.expectedMoveSan ?? "",
lib/blundr/teaching/trainingContextEngine.ts:651:      moveUci: input.expectedMoveUci ?? "",
lib/blundr/teaching/trainingContextEngine.ts:665:  revealModeActive: boolean;
lib/blundr/teaching/trainingContextEngine.ts:666:  expectedMoveUci?: string;
lib/blundr/teaching/trainingContextEngine.ts:675:      suppressedReasons: ["plain_view_no_hints"],
lib/blundr/teaching/trainingContextEngine.ts:678:      revealLevel: "context",
lib/blundr/teaching/trainingContextEngine.ts:688:  const from = normalizeUci(input.expectedMoveUci).slice(0, 2);
lib/blundr/teaching/trainingContextEngine.ts:689:  const to = normalizeUci(input.expectedMoveUci).slice(2, 4);
lib/blundr/teaching/trainingContextEngine.ts:702:  if (input.revealModeActive && input.trainerView === "assisted" && from && to && visualLines.length === 0) {
lib/blundr/teaching/trainingContextEngine.ts:703:    visualLines.push({ from, to, kind: "plan", label: input.cue.userFacing.next?.replace(/^Play\s+/, "").replace(/\.$/, "") || safeSan({ fen: input.cue.metadata.fenBefore, uci: input.expectedMoveUci }) });
lib/blundr/teaching/trainingContextEngine.ts:732:    revealLevel: input.permission.canShowAnswerOverlays ? "answer" : input.permission.canShowContextOverlays ? "context" : "plan",
lib/blundr/teaching/trainingContextEngine.ts:745:  if (moveTrust === "reveal_only_unverified") return { label: "Study-line", pct: 56, tone: "bg-sky-600", note: "Shown as a stored study move, not engine-validated." };
lib/blundr/teaching/trainingContextEngine.ts:751:  const expectedUci = normalizeUci(input.expectedMoveUci);
lib/blundr/teaching/trainingContextEngine.ts:752:  const expectedSan = safeSan({ fen: input.fenBefore, uci: expectedUci, san: input.expectedMoveSan });
lib/blundr/teaching/trainingContextEngine.ts:753:  const expectedMoveExists = Boolean(expectedUci);
lib/blundr/teaching/trainingContextEngine.ts:754:  const expectedMoveIsValidated = expectedMoveExists && expectedMoveValidated(input.fenBefore, expectedUci);
lib/blundr/teaching/trainingContextEngine.ts:769:    expectedMoveUci: expectedUci,
lib/blundr/teaching/trainingContextEngine.ts:770:    expectedMoveSan: expectedSan,
lib/blundr/teaching/trainingContextEngine.ts:773:  const revealModeActive = Boolean(input.showAnswer);
lib/blundr/teaching/trainingContextEngine.ts:777:  const expectedMoveCp = typeof input.moveQuality?.expectedMoveCp === "number" ? input.moveQuality.expectedMoveCp : expectedLine?.scoreCp;
lib/blundr/teaching/trainingContextEngine.ts:781:      : typeof bestMoveCp === "number" && typeof expectedMoveCp === "number"
lib/blundr/teaching/trainingContextEngine.ts:782:        ? Math.max(0, bestMoveCp - expectedMoveCp)
lib/blundr/teaching/trainingContextEngine.ts:788:    expectedMoveUci: expectedUci,
lib/blundr/teaching/trainingContextEngine.ts:789:    expectedMoveIsValidated,
lib/blundr/teaching/trainingContextEngine.ts:790:    expectedMoveCp,
lib/blundr/teaching/trainingContextEngine.ts:795:    revealModeActive,
lib/blundr/teaching/trainingContextEngine.ts:798:  const trustedFromTrust = expectedMoveExists && expectedMoveIsValidated && trustedMoveTrust(trust.trust);
lib/blundr/teaching/trainingContextEngine.ts:799:  const trustedFromGate = expectedMoveExists && expectedMoveIsValidated && moveQualityTrustedStatus(input.moveQuality?.status);
lib/blundr/teaching/trainingContextEngine.ts:849:    expectedMoveUci: expectedUci,
lib/blundr/teaching/trainingContextEngine.ts:850:    expectedMoveSan: expectedSan,
lib/blundr/teaching/trainingContextEngine.ts:861:    revealModeActive,
lib/blundr/teaching/trainingContextEngine.ts:862:    expectedMoveUci: expectedUci,
lib/blundr/teaching/trainingContextEngine.ts:867:  const revealShowsExpectedMove = trust.trust === "reveal_only_unverified" && revealModeActive;
lib/blundr/teaching/trainingContextEngine.ts:870:      (revealShowsExpectedMove && cue.userFacing.next) ||
lib/blundr/teaching/trainingContextEngine.ts:875:  if (expectedMoveExists && trustedMoveTrust(trust.trust) && mode !== "move_teaching") warnings.push("verified_expected_move_not_in_move_teaching_mode");
lib/blundr/teaching/trainingContextEngine.ts:876:  if (expectedMoveExists && trustedExpectedMove && !nextAllowed) warnings.push("verified_expected_move_next_play_suppressed");
lib/blundr/teaching/trainingContextEngine.ts:877:  if (expectedMoveExists && trustedExpectedMove && input.trainerView === "assisted" && visualDecision.visualLines.length === 0) warnings.push("verified_expected_move_without_answer_line");
lib/blundr/teaching/trainingContextEngine.ts:878:  if (expectedMoveIsValidated && input.repertoireSupport && input.moveQuality?.status === "rejected" && /top two/i.test(input.moveQuality?.reason ?? "") && trust.trust !== "untrusted") {
lib/blundr/teaching/trainingContextEngine.ts:881:  if (revealModeActive && expectedMoveExists && visualDecision.visualLines.length === 0) warnings.push("reveal_next_move_without_answer_line");
lib/blundr/teaching/trainingContextEngine.ts:882:  if (input.moveQuality?.status === "rejected" && typeof expectedMoveCp !== "number") warnings.push("expected_move_eval_missing");
lib/blundr/teaching/trainingContextEngine.ts:910:    expectedMoveCp: expectedMoveCp ?? null,
lib/blundr/teaching/trainingContextEngine.ts:913:    revealModeActive,
lib/blundr/teaching/trainingContextEngine.ts:949:      expectedMoveCp,
lib/blundr/teaching/trainingContextEngine.ts:954:      revealModeActive,
lib/blundr/teaching/trainingContextTypes.ts:9:  | "reveal_only_unverified"
lib/blundr/teaching/trainingContextTypes.ts:47:  revealRisk: "none" | "low" | "medium" | "high";
lib/blundr/teaching/trainingContextTypes.ts:104:  revealRisk: "none" | "low" | "medium" | "high";
lib/blundr/teaching/trainingContextTypes.ts:164:  expectedMoveTheme: string;
lib/blundr/teaching/trainingContextTypes.ts:182:  revealRiskPenalty: number;
lib/blundr/teaching/trainingContextTypes.ts:235:  expectedMoveCp?: number;
lib/blundr/teaching/trainingContextTypes.ts:240:  revealModeActive: boolean;
lib/blundr/teaching/trainingContextTypes.ts:253:  expectedMoveUci?: string;
lib/blundr/teaching/trainingContextTypes.ts:254:  expectedMoveSan?: string;
lib/blundr/teaching/trainingContextTypes.ts:298:  revealLevel: "answer" | "context" | "plan";
lib/blundr/teaching/trustClassifier.ts:109:    const expectedMove = norm(evidence.expectedMoveUci);
lib/blundr/teaching/trustClassifier.ts:110:    const userAlternative = Boolean(userMove && expectedMove && userMove !== expectedMove);
lib/blundr/teaching/visualOverlayRouter.ts:5:export type VisualRevealLevel = "answer" | "context" | "plan";
lib/blundr/teaching/visualOverlayRouter.ts:28:  revealLevel: VisualRevealLevel;
lib/blundr/teaching/visualOverlayRouter.ts:56:      suppressedReasons: ["plain_view_no_hints"],
lib/blundr/teaching/visualOverlayRouter.ts:59:      revealLevel: "context",
lib/blundr/teaching/visualOverlayRouter.ts:69:  const revealLevel: VisualRevealLevel = canAnswer ? "answer" : canContext ? "context" : "plan";
lib/blundr/teaching/visualOverlayRouter.ts:93:      revealLevel,
lib/blundr/teaching/visualOverlayRouter.ts:116:    revealLevel,
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts:10:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts:11:    expectedMoveUci: "e1g1",
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts:12:    expectedMoveSan: "O-O",
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:51:      revealRequired: false,
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:166:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:167:    expectedMoveUci: "c2c3",
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:168:    expectedMoveSan: "c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:41:    expectedMoveUci: "f1c4",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:42:    expectedMoveSan: "Bc4",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:51:  const bc4Recipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 10 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:65:    expectedMoveUci: "e1g1",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:66:    expectedMoveSan: "O-O",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:75:  const castleRecipe = compileVisualRecipe({ trainingContext: castleTc, fen: castleFen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "e1g1", expectedMoveSan: "O-O", openingId: "italian", lineId: "italian", frameId: 11 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:86:    expectedMoveUci: "c2c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:87:    expectedMoveSan: "c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:96:  const c3Recipe = compileVisualRecipe({ trainingContext: c3Tc, fen: c3Fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "c2c3", expectedMoveSan: "c3", openingId: "italian", lineId: "italian", frameId: 12 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:107:    expectedMoveUci: "f1e1",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:108:    expectedMoveSan: "Re1",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:117:  const re1Recipe = compileVisualRecipe({ trainingContext: re1Tc, fen: re1Fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "f1e1", expectedMoveSan: "Re1", openingId: "italian", lineId: "italian", frameId: 13 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:125:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:126:    expectedMoveUci: "c2c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:127:    expectedMoveSan: "c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:136:  const plainRecipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "plain", revealState: "hidden", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 15 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:141:  const revealHiddenRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:142:    trainingContext: mockContext({ moveTrust: "reveal_only_unverified", mode: "assisted_context", contextTrust: "safe_context", cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:145:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:146:    expectedMoveUci: "c2c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:147:    expectedMoveSan: "c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:150:  assert.equal(hasPrimitive(revealHiddenRecipe, "move_arrow", () => true), false);
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:152:  const revealShownRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:153:    trainingContext: mockContext({ moveTrust: "reveal_only_unverified", mode: "move_teaching", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: "center_tension", metadata: { moveUci: "c2c3", moveSan: "c3", fenBefore: c3Fen, compilerVersion: "2.7.35d", createdAt: "now" } } }),
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:156:    revealState: "revealed",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:157:    expectedMoveUci: "c2c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:158:    expectedMoveSan: "c3",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:161:  assert.equal(revealShownRecipe.mode, "primary_move_only");
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:162:  assert.equal(hasPrimitive(revealShownRecipe, "move_arrow", (p) => p.from === "c2" && p.to === "c3"), true);
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:163:  assert.equal(revealShownRecipe.secondaryVisualsSuppressed, true);
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:164:  assert.equal(revealShownRecipe.primaryMoveUci, "c2c3");
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:170:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:171:    expectedMoveUci: "h2h4",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:172:    expectedMoveSan: "h4",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:188:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:189:    expectedMoveUci: "f1c4",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:190:    expectedMoveSan: "Bc4",
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:199:  const bc4RecipeSameAgain = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 10 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:204:  const changedRecipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: castleFen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "e1g1", expectedMoveSan: "O-O", frameId: 20 });
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:105:    expectedMoveUci: "e1g1",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:106:    expectedMoveSan: "O-O",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:120:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:123:    expectedMoveUci: "e1g1",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:124:    expectedMoveSan: "O-O",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:131:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:134:    expectedMoveUci: "e1g1",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:135:    expectedMoveSan: "O-O",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:147:    revealState: "hidden",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:150:    expectedMoveUci: "e1g1",
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:151:    expectedMoveSan: "O-O",
lib/blundr/visualRecipe/visualRecipeAdapter.ts:5:  shouldRenderMoveTeachingOverlay,
lib/blundr/visualRecipe/visualRecipeAdapter.ts:208:    allowed = shouldRenderMoveTeachingOverlay({
lib/blundr/visualRecipe/visualRecipeAdapter.ts:218:  } else if (recipe.mode === "reveal_answer") {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:36:function expectedMove(input: VisualRecipeCompileInput): { uci?: string; san?: string } {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:37:  const uci = (input.expectedMoveUci ?? input.trainingContext?.cue.metadata.moveUci ?? "").toLowerCase();
lib/blundr/visualRecipe/visualRecipeCompiler.ts:38:  const san = input.expectedMoveSan ?? input.trainingContext?.cue.metadata.moveSan;
lib/blundr/visualRecipe/visualRecipeCompiler.ts:149:      revealRequired: false,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:264:  if (input.mode === "primary_move_only" || input.mode === "move_teaching" || input.mode === "reveal_answer") {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:345:  if ((input.mode as any) === "move_teaching" || (input.mode as any) === "reveal_answer" || (input.mode as any) === "primary_move_only") addMoveArrow(beat, from, to, "primary", "answer_move");
lib/blundr/visualRecipe/visualRecipeCompiler.ts:358:  const move = expectedMove(input);
lib/blundr/visualRecipe/visualRecipeCompiler.ts:377:    revealState: input.revealState,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:491:      : (permissionDecision.mode === "reveal_answer" || permissionDecision.mode === "primary_move_only" || permissionDecision.mode === "move_teaching")
lib/blundr/visualRecipe/visualRecipePermissions.ts:24:    revealRequired: false,
lib/blundr/visualRecipe/visualRecipePermissions.ts:65:  if (trust === "reveal_only_unverified") {
lib/blundr/visualRecipe/visualRecipePermissions.ts:66:    if (input.revealState === "revealed") {
lib/blundr/visualRecipe/visualRecipePermissions.ts:74:          revealRequired: true,
lib/blundr/visualRecipe/visualRecipePermissions.ts:89:          revealRequired: true,
lib/blundr/visualRecipe/visualRecipePermissions.ts:98:      permissions: { ...basePermissions(), revealRequired: true },
lib/blundr/visualRecipe/visualRecipePermissions.ts:99:      suppressedReason: "reveal_required",
lib/blundr/visualRecipe/visualRecipeTypes.ts:14:  | "reveal_answer"
lib/blundr/visualRecipe/visualRecipeTypes.ts:177:  revealRequired: boolean;
lib/blundr/visualRecipe/visualRecipeTypes.ts:244:  expectedMoveUci?: string;
lib/blundr/visualRecipe/visualRecipeTypes.ts:245:  expectedMoveSan?: string;
lib/blundr/visualRecipe/visualRecipeTypes.ts:251:  revealState: "hidden" | "revealed";
lib/blundr/visualRecipe/visualRecipeTypes.ts:278:  revealState: "hidden" | "revealed";
tests/coach/antiHallucination.test.ts:3:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/antiHallucination.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/antiHallucination.test.ts:7:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/antiHallucination.test.ts:44:  const frame = buildCurrentInstructionFrame({
tests/coach/antiHallucination.test.ts:71:  const compiledText = `${compiled.assisted.body} ${compiled.showMore.body}`.toLowerCase();
tests/coach/browserContract.test.ts:6:    coachCard: '[data-testid="coach-card"]',
tests/coach/browserContract.test.ts:7:    plainHint: '[data-testid="plain-hint"]',
tests/coach/browserContract.test.ts:8:    showMoreButton: '[data-testid="show-more-button"]',
tests/coach/browserContract.test.ts:10:    revealButton: '[data-testid="reveal-move-button"]',
tests/coach/browserContract.test.ts:14:    plainPreShowMoreNoAnswerLeak: "Plain hint must not expose SAN/UCI/from/to/piece before Show More.",
tests/coach/browserContract.test.ts:15:    showMoreRevealsSameTarget: "After Show More, revealed visual target must equal CurrentInstructionFrame.target.",
tests/coach/browserContract.test.ts:16:    continueBeforeCandidate: "Before Continue from Here, continuation candidate target is null and action is visible.",
tests/coach/browserContract.test.ts:18:    safetyGateBlocksMismatches: "SafetyGate must block target/reveal/visual mismatches before UI rendering.",
tests/coach/browserContract.test.ts:19:    visibleSurfaceSafeFrameOnly: "VisibleTeachingSurface must be built from SafetyGateOutput.safeFrame only.",
tests/coach/browserContract.test.ts:25:  assert.equal(typeof browserContract.selectors.coachCard, "string");
tests/coach/coachCompiler.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/coachCompiler.test.ts:6:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/coachCompiler.test.ts:8:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/coachCompiler.test.ts:16:  return buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:80:  assert.equal(bc4.compiled.revealAction.targetUci, bc4Frame.target?.uci ?? null);
tests/coach/coachCompiler.test.ts:83:  const branchComplete = buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:96:  assert.equal(branchCompiled.revealAction.kind, "continue_from_here");
tests/coach/coachCompiler.test.ts:99:  const opponent = buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:110:  assert.equal(opponentCompiled.revealAction.kind, "none");
tests/coach/coachCompiler.test.ts:113:  const terminal = buildCurrentInstructionFrame({
tests/coach/coachCompiler.test.ts:124:  assert.equal(terminalCompiled.revealAction.kind, "none");
tests/coach/coachCompiler.test.ts:127:  assert.equal(/wins material/i.test(`${bc4.compiled.assisted.body} ${bc4.compiled.showMore.body}`), false);
tests/coach/coachCompiler.test.ts:128:  assert.equal(/best move/i.test(`${bc4.compiled.assisted.body} ${bc4.compiled.showMore.body}`), false);
tests/coach/coachCompiler.test.ts:158:console.log("coachCompiler ok");
tests/coach/coachSafetyGate.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/coachSafetyGate.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/coachSafetyGate.test.ts:7:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/coachSafetyGate.test.ts:8:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/coachSafetyGate.test.ts:17:  return buildCurrentInstructionFrame({
tests/coach/coachSafetyGate.test.ts:77:  const badReveal = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:80:    compiled: { ...bc4.compiled, revealAction: { ...bc4.compiled.revealAction, targetUci: "g1f3" } },
tests/coach/coachSafetyGate.test.ts:83:  assert.equal(badReveal.result.allowed, false);
tests/coach/coachSafetyGate.test.ts:84:  assert.equal(badReveal.result.criticalIssues.some((i) => i.code === "reveal_mismatch"), true);
tests/coach/coachSafetyGate.test.ts:148:    compiled: { ...bc4.compiled, showMore: { ...bc4.compiled.showMore, body: "This is a forced mate." } },
tests/coach/coachSafetyGate.test.ts:166:      showMore: { ...checkmateCompiled.showMore, body: "Qe7+ leads to checkmate." },
tests/coach/coachSafetyGate.test.ts:178:  const opponent = buildCurrentInstructionFrame({
tests/coach/coachSafetyGate.test.ts:190:  const opponentReveal = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:193:    compiled: { ...opponentCompiled, revealAction: { kind: "reveal_target", label: "Reveal", targetUci: "f1c4", targetSan: "Bc4" } },
tests/coach/coachSafetyGate.test.ts:195:  assert.equal(opponentReveal.result.allowed, false);
tests/coach/coachSafetyGate.test.ts:216:  const branchComplete = buildCurrentInstructionFrame({
tests/coach/coachSafetyGate.test.ts:231:  const branchRevealBad = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:234:    compiled: { ...branchCompiled, revealAction: { kind: "reveal_target", label: "Reveal", targetUci: "f1c4", targetSan: "Bc4" } },
tests/coach/coachSafetyGate.test.ts:236:  assert.equal(branchRevealBad.result.allowed, false);
tests/coach/coachSafetyGate.test.ts:238:  const terminal = buildCurrentInstructionFrame({
tests/coach/coachSafetyGate.test.ts:285:  assert.equal(providerMismatch.safeFrame.revealAction.kind, "none");
tests/coach/coachSafetyGate.test.ts:286:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/coachSafetyGate.test.ts:291:    showMoreRevealed: false,
tests/coach/coachSafetyGate.test.ts:295:  assert.equal(blockedSurface.actions.some((action) => action.kind === "reveal_target"), false);
tests/coach/coachSafetyGate.test.ts:298:  assert.equal(bc4.compiled.revealAction.kind, "reveal_target");
tests/coach/coachSafetyGate.test.ts:302:console.log("coachSafetyGate ok");
tests/coach/continuationFlow.test.ts:3:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/continuationFlow.test.ts:4:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/continuationFlow.test.ts:6:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/continuationFlow.test.ts:7:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/continuationFlow.test.ts:33:    instructionTarget: afterContinue.selectedContinuationCandidate?.uci ?? null,
tests/coach/continuationFlow.test.ts:35:    coachTarget: "g8f6",
tests/coach/continuationFlow.test.ts:37:    revealTarget: "g8f6",
tests/coach/continuationFlow.test.ts:44:  assert.equal(alignment.instructionTarget, alignment.coachTarget);
tests/coach/continuationFlow.test.ts:45:  assert.equal(alignment.instructionTarget, alignment.visualTarget);
tests/coach/continuationFlow.test.ts:46:  assert.equal(alignment.instructionTarget, alignment.revealTarget);
tests/coach/continuationFlow.test.ts:64:  const branchFrame = buildCurrentInstructionFrame({
tests/coach/continuationFlow.test.ts:77:  const branchSurface = buildVisibleTeachingSurface({
tests/coach/continuationFlow.test.ts:82:    showMoreRevealed: false,
tests/coach/continuationFlow.test.ts:86:  assert.equal(branchSurface.actions.some((action) => action.kind === "continue_from_here"), true);
tests/coach/currentInstructionFrame.test.ts:6:  buildCurrentInstructionFrame,
tests/coach/currentInstructionFrame.test.ts:15:export function testCurrentInstructionFrameRuntimeAuthority(): void {
tests/coach/currentInstructionFrame.test.ts:25:  const guided = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:39:  const lichess = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:57:  const adaptive = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:75:  const continuation = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:98:  const continuationUnlocked = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:117:  const opponent = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:128:  const opponentWithTarget = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:140:  const branchComplete = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:157:  const terminal = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:168:  const terminalWithTarget = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:182:  const changedTarget = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:200:  const changedFen = buildCurrentInstructionFrame({
tests/coach/currentInstructionFrame.test.ts:233:testCurrentInstructionFrameRuntimeAuthority();
tests/coach/dynamicConceptActivator.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/dynamicConceptActivator.test.ts:15:  return buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:99:  const branchCompleteFrame = buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:114:        "continue_from_here_available",
tests/coach/dynamicConceptActivator.test.ts:125:  const opponentFrame = buildCurrentInstructionFrame({
tests/coach/dynamicConceptActivator.test.ts:142:  assert.equal(activatedIds(bc4Plain).includes("show_more_reveal"), false);
tests/coach/evidenceGraph.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/evidenceGraph.test.ts:15:  return buildCurrentInstructionFrame({
tests/coach/evidenceGraph.test.ts:106:  const branchComplete = buildCurrentInstructionFrame({
tests/coach/evidenceGraph.test.ts:120:  const opponent = buildCurrentInstructionFrame({
tests/coach/evidenceGraph.test.ts:141:  const hasCoachCopyFields = JSON.stringify(illegal).includes("assisted") || JSON.stringify(illegal).includes("plain.hint") || JSON.stringify(illegal).includes("showMore");
tests/coach/goldenPositions.test.ts:5:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/goldenPositions.test.ts:73:      const nullFrame = buildCurrentInstructionFrame({
tests/coach/goldenPositions.test.ts:97:      const guidedFrame = buildCurrentInstructionFrame({
tests/coach/liveChainSmoke.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/liveChainSmoke.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/liveChainSmoke.test.ts:7:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/liveChainSmoke.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/liveChainSmoke.test.ts:17:  return buildCurrentInstructionFrame({
tests/coach/liveChainSmoke.test.ts:36:  frame: ReturnType<typeof buildCurrentInstructionFrame>;
tests/coach/liveChainSmoke.test.ts:40:  showMoreRevealed?: boolean;
tests/coach/liveChainSmoke.test.ts:60:  const surface = buildVisibleTeachingSurface({
tests/coach/liveChainSmoke.test.ts:65:    showMoreRevealed: input.showMoreRevealed ?? false,
tests/coach/liveChainSmoke.test.ts:121:  assert.equal(bc4.compiled.revealAction.targetUci, "f1c4");
tests/coach/liveChainSmoke.test.ts:125:  assert.equal(bc4.surface.actions.some((action) => action.kind === "reveal_target" && action.targetUci === "f1c4"), true);
tests/coach/liveChainSmoke.test.ts:139:  const branchFrame = buildCurrentInstructionFrame({
tests/coach/liveChainSmoke.test.ts:152:  assert.equal(branch.compiled.revealAction.kind, "continue_from_here");
tests/coach/liveChainSmoke.test.ts:156:  assert.equal(branch.surface.actions.some((action) => action.kind === "continue_from_here"), true);
tests/coach/liveChainSmoke.test.ts:159:  const opponentFrame = buildCurrentInstructionFrame({
tests/coach/liveChainSmoke.test.ts:170:  assert.equal(opponent.compiled.revealAction.kind, "none");
tests/coach/liveChainSmoke.test.ts:174:  assert.equal(opponent.surface.actions.some((action) => action.kind === "reveal_target"), false);
tests/coach/liveChainSmoke.test.ts:185:  assert.equal(mismatchGate.safeFrame.revealAction.kind, "none");
tests/coach/liveChainSmoke.test.ts:195:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/liveChainSmoke.test.ts:200:    showMoreRevealed: false,
tests/coach/plainLeak.test.ts:3:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/plainLeak.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/plainLeak.test.ts:7:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/plainLeak.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/plainLeak.test.ts:37:  const frame = buildCurrentInstructionFrame({
tests/coach/plainLeak.test.ts:55:  assert.equal(plainActivated.activated.some((entry) => entry.conceptId === "show_more_reveal"), false);
tests/coach/plainLeak.test.ts:68:  const plainPreSurface = buildVisibleTeachingSurface({
tests/coach/plainLeak.test.ts:73:    showMoreRevealed: false,
tests/coach/plainLeak.test.ts:76:  assert.equal(plainPreSurface.actions.some((action) => action.kind === "reveal_target"), false);
tests/coach/providerFailure.test.ts:8:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/providerFailure.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/providerFailure.test.ts:10:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/providerFailure.test.ts:48:  const nullFrame = buildCurrentInstructionFrame({
tests/coach/providerFailure.test.ts:63:  const guided = buildCurrentInstructionFrame({
tests/coach/showMoreVisualReveal.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/showMoreVisualReveal.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/showMoreVisualReveal.test.ts:7:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/showMoreVisualReveal.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/showMoreVisualReveal.test.ts:11:export function testShowMoreVisualReveal(): void {
tests/coach/showMoreVisualReveal.test.ts:12:  const frame = buildCurrentInstructionFrame({
tests/coach/showMoreVisualReveal.test.ts:32:  assert.equal(compiled.revealAction.targetUci, frame.target?.uci ?? null);
tests/coach/showMoreVisualReveal.test.ts:37:  const assistedSurface = buildVisibleTeachingSurface({
tests/coach/showMoreVisualReveal.test.ts:42:    showMoreRevealed: false,
tests/coach/showMoreVisualReveal.test.ts:44:  const plainShowMoreSurface = buildVisibleTeachingSurface({
tests/coach/showMoreVisualReveal.test.ts:49:    showMoreRevealed: true,
tests/coach/showMoreVisualReveal.test.ts:58:testShowMoreVisualReveal();
tests/coach/showMoreVisualReveal.test.ts:59:console.log("showMoreVisualReveal ok");
tests/coach/targetInvariant.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/targetInvariant.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/targetInvariant.test.ts:7:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/targetInvariant.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/targetInvariant.test.ts:12:  const frame = buildCurrentInstructionFrame({
tests/coach/targetInvariant.test.ts:34:  assert.equal(compiled.revealAction.targetUci, frame.target?.uci ?? null);
tests/coach/targetInvariant.test.ts:36:  assert.equal(compiled.showMore.body.toLowerCase().includes("bc4"), true);
tests/coach/targetInvariant.test.ts:39:  const surface = buildVisibleTeachingSurface({
tests/coach/targetInvariant.test.ts:44:    showMoreRevealed: false,
tests/coach/targetInvariant.test.ts:48:  const mismatch = createTargetMismatchIssue({ expected: "f1c4", actual: "g1f3", surface: "showMore" });
tests/coach/teachingConceptRegistry.test.ts:9:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/teachingConceptRegistry.test.ts:27:  const frame = buildCurrentInstructionFrame({
tests/coach/teachingConceptRegistry.test.ts:63:    assert.equal(concept.showMoreTemplate.template.trim().length > 0, true, `${concept.id}: empty showMore template`);
tests/coach/teachingConceptRegistry.test.ts:65:    const textBlob = `${concept.label} ${concept.summary} ${concept.plainHintTemplate.template} ${concept.assistedTemplate.template} ${concept.showMoreTemplate.template}`.toLowerCase();
tests/coach/typeContracts.test.ts:3:import type { CompiledCoachFrame } from "../../lib/blundr/coachCompiler/types";
tests/coach/typeContracts.test.ts:7:import type { VisibleTeachingSurface } from "../../lib/blundr/presentation/types";
tests/coach/typeContracts.test.ts:8:import { assertLockedInstructionTarget, type CurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/typeContracts.test.ts:11:  const guidedFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:62:  const terminalFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:73:  const opponentFrame: CurrentInstructionFrame = {
tests/coach/typeContracts.test.ts:151:  const safeFallbackSurface: VisibleTeachingSurface = {
tests/coach/typeContracts.test.ts:208:    showMore: {
tests/coach/typeContracts.test.ts:229:    revealAction: {
tests/coach/typeContracts.test.ts:230:      kind: "reveal_target",
tests/coach/typeContracts.test.ts:233:      label: "Reveal move",
tests/coach/visibleTeachingSurface.test.ts:4:import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
tests/coach/visibleTeachingSurface.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/visibleTeachingSurface.test.ts:7:import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
tests/coach/visibleTeachingSurface.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/visibleTeachingSurface.test.ts:17:  return buildCurrentInstructionFrame({
tests/coach/visibleTeachingSurface.test.ts:41:  frame: ReturnType<typeof buildCurrentInstructionFrame>;
tests/coach/visibleTeachingSurface.test.ts:43:  showMoreRevealed: boolean;
tests/coach/visibleTeachingSurface.test.ts:46:  const concepts = activateTeachingConcepts({ graph, mode: input.showMoreRevealed ? "show_more" : "assisted", maxConcepts: 20 });
tests/coach/visibleTeachingSurface.test.ts:49:  const surface = buildVisibleTeachingSurface({
tests/coach/visibleTeachingSurface.test.ts:54:    showMoreRevealed: input.showMoreRevealed,
tests/coach/visibleTeachingSurface.test.ts:59:export function testVisibleTeachingSurface(): void {
tests/coach/visibleTeachingSurface.test.ts:67:  const assistedBc4 = buildSurfacePack({ frame: bc4Frame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:70:  assert.equal(assistedBc4.surface.actions.some((action) => action.kind === "reveal_target" && action.targetUci === "f1c4"), true);
tests/coach/visibleTeachingSurface.test.ts:72:  const plainPreBc4 = buildSurfacePack({ frame: bc4Frame, requestedMode: "plain", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:80:  assert.equal(plainPreBc4.surface.actions.some((action) => action.kind === "reveal_target"), false);
tests/coach/visibleTeachingSurface.test.ts:82:  const plainPostBc4 = buildSurfacePack({ frame: bc4Frame, requestedMode: "plain", showMoreRevealed: true });
tests/coach/visibleTeachingSurface.test.ts:88:  assert.equal(plainPostBc4.surface.actions.some((action) => action.kind === "reveal_target"), true);
tests/coach/visibleTeachingSurface.test.ts:89:  assert.equal(plainPostBc4.surface.copy.body.includes(plainPostBc4.safetyOutput.safeFrame.showMore.body), true);
tests/coach/visibleTeachingSurface.test.ts:97:  const nf3 = buildSurfacePack({ frame: nf3Frame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:100:  const bc4Again = buildSurfacePack({ frame: bc4Frame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:103:  const branchFrame = buildCurrentInstructionFrame({
tests/coach/visibleTeachingSurface.test.ts:113:  const branch = buildSurfacePack({ frame: branchFrame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:116:  assert.equal(branch.surface.actions.some((action) => action.kind === "continue_from_here"), true);
tests/coach/visibleTeachingSurface.test.ts:119:  const opponentFrame = buildCurrentInstructionFrame({
tests/coach/visibleTeachingSurface.test.ts:128:  const opponent = buildSurfacePack({ frame: opponentFrame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:131:  assert.equal(opponent.surface.actions.some((action) => action.kind === "reveal_target"), false);
tests/coach/visibleTeachingSurface.test.ts:134:  const terminalFrame = buildCurrentInstructionFrame({
tests/coach/visibleTeachingSurface.test.ts:143:  const terminal = buildSurfacePack({ frame: terminalFrame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:146:  assert.equal(terminal.surface.actions.some((action) => action.kind === "reveal_target"), false);
tests/coach/visibleTeachingSurface.test.ts:156:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/visibleTeachingSurface.test.ts:161:    showMoreRevealed: false,
tests/coach/visibleTeachingSurface.test.ts:182:    showMoreRevealed: false,
tests/coach/visibleTeachingSurface.test.ts:184:  const nf3Chain = buildSurfacePack({ frame: nf3Frame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:185:  const bc4Chain = buildSurfacePack({ frame: bc4Frame, requestedMode: "assisted", showMoreRevealed: false });
tests/coach/visibleTeachingSurface.test.ts:194:    showMoreRevealed: false,
tests/coach/visibleTeachingSurface.test.ts:199:testVisibleTeachingSurface();

$ npm run build

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...

$ node --import tsx tests/coach/uiSurfaceAdapter.test.ts
uiSurfaceAdapter ok
$ node --import tsx tests/coach/visibleTeachingSurface.test.ts
visibleTeachingSurface ok
$ node --import tsx tests/coach/liveChainSmoke.test.ts
liveChainSmoke ok
$ node --import tsx tests/coach/coachSafetyGate.test.ts
coachSafetyGate ok
$ node --import tsx tests/coach/coachCompiler.test.ts
coachCompiler ok
$ node --import tsx tests/coach/teachingConceptRegistry.test.ts
teachingConceptRegistry ok
$ node --import tsx tests/coach/dynamicConceptActivator.test.ts
dynamicConceptActivator ok
$ node --import tsx tests/coach/evidenceGraph.test.ts
evidenceGraph ok
$ node --import tsx tests/coach/currentInstructionFrame.test.ts
currentInstructionFrame ok
$ node --import tsx tests/coach/typeContracts.test.ts
typeContracts ok
$ node --import tsx tests/coach/goldenPositions.test.ts
goldenPositions ok
$ node --import tsx tests/coach/targetInvariant.test.ts
targetInvariant ok
$ node --import tsx tests/coach/continuationFlow.test.ts
continuationFlow ok
$ node --import tsx tests/coach/plainLeak.test.ts
plainLeak ok
$ node --import tsx tests/coach/showMoreVisualReveal.test.ts
showMoreVisualReveal ok
$ node --import tsx tests/coach/providerFailure.test.ts
providerFailure ok
$ node --import tsx tests/coach/antiHallucination.test.ts
antiHallucination ok
$ node --import tsx tests/coach/browserContract.test.ts
browserContract ok

$ npm test

$ npm run lint

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 9.5s
  Running TypeScript ...
  Finished TypeScript in 10.0s ...
  Collecting page data using 1 worker ...
  Generating static pages using 1 worker (0/3) ...
✓ Generating static pages using 1 worker (3/3) in 403ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/blundr-visual-model
├ ƒ /api/brain
└ ƒ /api/explorer


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


# Package 10 Validation (post-escalated build)

$ node --import tsx tests/coach/uiSurfaceAdapter.test.ts
uiSurfaceAdapter ok
$ node --import tsx tests/coach/visibleTeachingSurface.test.ts
visibleTeachingSurface ok
$ node --import tsx tests/coach/liveChainSmoke.test.ts
liveChainSmoke ok
$ node --import tsx tests/coach/coachSafetyGate.test.ts
coachSafetyGate ok
$ node --import tsx tests/coach/coachCompiler.test.ts
coachCompiler ok
$ node --import tsx tests/coach/teachingConceptRegistry.test.ts
teachingConceptRegistry ok
$ node --import tsx tests/coach/dynamicConceptActivator.test.ts
dynamicConceptActivator ok
$ node --import tsx tests/coach/evidenceGraph.test.ts
evidenceGraph ok
$ node --import tsx tests/coach/currentInstructionFrame.test.ts
currentInstructionFrame ok
$ node --import tsx tests/coach/typeContracts.test.ts
typeContracts ok
$ node --import tsx tests/coach/goldenPositions.test.ts
goldenPositions ok
$ node --import tsx tests/coach/targetInvariant.test.ts
targetInvariant ok
$ node --import tsx tests/coach/continuationFlow.test.ts
continuationFlow ok
$ node --import tsx tests/coach/plainLeak.test.ts
plainLeak ok
$ node --import tsx tests/coach/showMoreVisualReveal.test.ts
showMoreVisualReveal ok
$ node --import tsx tests/coach/providerFailure.test.ts
providerFailure ok
$ node --import tsx tests/coach/antiHallucination.test.ts
antiHallucination ok
$ node --import tsx tests/coach/browserContract.test.ts
browserContract ok

$ npm test

$ npm run lint

$ git status --short
 M app/page.tsx
 M components/board/TeachingOverlay.tsx
 M components/board/VisualRecipeLayer.tsx
 M components/coach/CoachCard.tsx
 M lib/blundr/presentation/index.ts
 M tests/coach/browserContract.test.ts
?? .agent_runs/v2.8.0-intelligent-coach/20260603_150001/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? "docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_10_UI_INTEGRATION_REPORT.md"
?? lib/blundr/presentation/buildLiveVisibleTeachingSurface.ts
?? lib/blundr/presentation/featureFlags.ts
?? lib/blundr/presentation/uiSurfaceAdapter.ts
?? tests/coach/uiSurfaceAdapter.test.ts

$ git diff --stat
 app/page.tsx                           | 98 +++++++++++++++++++++++++++++++---
 components/board/TeachingOverlay.tsx   | 16 ++++++
 components/board/VisualRecipeLayer.tsx | 13 ++++-
 components/coach/CoachCard.tsx         | 39 ++++++++++++--
 lib/blundr/presentation/index.ts       |  3 ++
 tests/coach/browserContract.test.ts    |  3 +-
 6 files changed, 159 insertions(+), 13 deletions(-)
