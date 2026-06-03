# Package 8.5 Command Log

$ git branch --show-current
v2.8.0-intelligent-coach-live

$ git status --short
?? .agent_runs/v2.8.0-intelligent-coach/20260603_145214/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? tests/coach/liveChainSmoke.test.ts

$ npm run build

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...
$ npm run build (escalated rerun due sandbox turbopack restriction)

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...
✓ Compiled successfully in 8.0s
  Running TypeScript ...
  Finished TypeScript in 9.2s ...
  Collecting page data using 1 worker ...
  Generating static pages using 1 worker (0/3) ...
✓ Generating static pages using 1 worker (3/3) in 376ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/blundr-visual-model
├ ƒ /api/brain
└ ƒ /api/explorer


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


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
?? .agent_runs/v2.8.0-intelligent-coach/20260603_145214/
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? "docs/BLUNDR_v2.8.0 Foundation Stabilization Gate_AGENT_8_5_HEADLESS_LIVE_CHAIN_REPORT.md"
?? tests/coach/liveChainSmoke.test.ts

$ git diff --stat
\n# Package 9 Step A Inspection

$ git branch --show-current
v2.8.0-intelligent-coach-live

$ git status --short
 M .agent_runs/v2.8.0-intelligent-coach/20260603_145214/command_log.md
 M lib/blundr/presentation/buildVisibleTeachingSurface.ts
 M lib/blundr/presentation/types.ts
 M tests/coach/browserContract.test.ts
 M tests/coach/coachSafetyGate.test.ts
 M tests/coach/continuationFlow.test.ts
 M tests/coach/liveChainSmoke.test.ts
 M tests/coach/plainLeak.test.ts
 M tests/coach/showMoreVisualReveal.test.ts
 M tests/coach/targetInvariant.test.ts
 M tests/coach/typeContracts.test.ts
?? BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
?? BLUNDR_v2.8.0_PACKAGE_0_CODEX_PROMPT.md
?? lib/blundr/presentation/actionPolicyBuilder.ts
?? lib/blundr/presentation/copySurfaceBuilder.ts
?? lib/blundr/presentation/index.ts
?? lib/blundr/presentation/modeSurfacePolicy.ts
?? lib/blundr/presentation/surfaceDebug.ts
?? lib/blundr/presentation/visualRecipeMapper.ts
?? tests/coach/visibleTeachingSurface.test.ts

$ find lib/blundr/presentation -maxdepth 4 -type f | sort || true
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

$ find lib/blundr/safety -maxdepth 4 -type f | sort
lib/blundr/safety/coachSafetyGate.ts
lib/blundr/safety/index.ts
lib/blundr/safety/nullTargetPolicy.ts
lib/blundr/safety/plainLeakPolicy.ts
lib/blundr/safety/providerAuthorityPolicy.ts
lib/blundr/safety/safeFallbackFrame.ts
lib/blundr/safety/strongClaimPolicy.ts
lib/blundr/safety/targetInvariantPolicy.ts
lib/blundr/safety/types.ts

$ find lib/blundr/coachCompiler -maxdepth 4 -type f | sort
lib/blundr/coachCompiler/compileCoachFrame.ts
lib/blundr/coachCompiler/compilerDebug.ts
lib/blundr/coachCompiler/copyPolicy.ts
lib/blundr/coachCompiler/index.ts
lib/blundr/coachCompiler/revealActionBuilder.ts
lib/blundr/coachCompiler/slotBuilder.ts
lib/blundr/coachCompiler/templateRenderer.ts
lib/blundr/coachCompiler/types.ts
lib/blundr/coachCompiler/visualIntentBuilder.ts

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

$ git grep -n "VisibleTeachingSurface\|buildVisibleTeachingSurface\|VisualRecipe\|TeachingSurface\|showMoreRevealed\|plainMode\|assistedMode" lib app components tests || true
app/page.tsx:20:import { adaptVisualRecipe } from "@/lib/blundr/visualRecipe/visualRecipeAdapter";
app/page.tsx:21:import { compileVisualRecipe } from "@/lib/blundr/visualRecipe/visualRecipeCompiler";
app/page.tsx:22:import { useVisualRecipePlayback } from "@/components/board/useVisualRecipePlayback";
app/page.tsx:48:import { buildVisibleTeachingSurface } from "@/lib/blundr/presentation/buildVisibleTeachingSurface"; // v2.7.40 Agent 3: single visible owner surface
app/page.tsx:1414:  const visualRecipe=useMemo(()=>teachingOrchestration?compileVisualRecipe({
app/page.tsx:1431:  const visualRecipeOverlay=useMemo(()=>adaptVisualRecipe({
app/page.tsx:1441:  const visualRecipePlayback=useVisualRecipePlayback({
app/page.tsx:2307:    // v2.7.40 stabilization: prefer VisibleTeachingSurface.actions (single source) for rendered button reporting in debug.
app/page.tsx:2309:    const renderedFromSurface = (visibleTeachingSurface?.coach?.shouldRender ? (visibleTeachingSurface.actions as any) : null);
app/page.tsx:2365:    // The only source of truth for what buttons can be clicked is visibleTeachingSurface.actions (when the surface owns the frame).
app/page.tsx:2367:    const surfaceActionsAtClick = (visibleTeachingSurface?.coach?.shouldRender ? (visibleTeachingSurface.actions as any) : []) as string[];
app/page.tsx:2400:  // v2.7.40 Agent 3 (late placement after all frame deps): VisibleTeachingSurface — single owner.
app/page.tsx:2423:  const visibleTeachingSurface = buildVisibleTeachingSurface({
app/page.tsx:2449:  let convergedVisibleSurface = visibleTeachingSurface;
app/page.tsx:2452:      ...visibleTeachingSurface,
app/page.tsx:2454:        ...visibleTeachingSurface.coach,
app/page.tsx:2455:        title: visibleTeachingSurface.coach.title || "Continue from here",
app/page.tsx:3493:  // v2.7.40 Agent 3: Visual overlays prefer VisibleTeachingSurface (enforces alignment + plain-pre + mismatch blocks)
app/page.tsx:3494:  const surfaceVisualLines = (visibleTeachingSurface?.visual?.shouldRender ? (visibleTeachingSurface.visual.lines as ActiveLine[]) : null);
app/page.tsx:3519:  const legacyTrainingCardActuallyRendered=Boolean(activeBoard&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyTrainingCard && !visibleTeachingSurface?.coach?.shouldRender);
app/page.tsx:3520:  const legacyAnswerCardActuallyRendered=Boolean(showAnswer&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyAnswerCard && !visibleTeachingSurface?.coach?.shouldRender);
app/page.tsx:3684:    visibleTeachingSurface: convergedVisibleSurface as any,
app/page.tsx:3685:    visibleSurfaceOwner: visibleTeachingSurface?.owner ?? null,
app/page.tsx:3686:    visibleCoachOwner: visibleTeachingSurface?.debug?.visibleCoachOwner ?? presentationFrame?.coach?.owner ?? "none",
app/page.tsx:3687:    visibleVisualOwner: visibleTeachingSurface?.debug?.visibleVisualOwner ?? presentationFrame?.visual?.source ?? "none",
app/page.tsx:3688:    visibleActionOwner: visibleTeachingSurface?.debug?.visibleActionOwner ?? "visibleActionPolicy",
app/page.tsx:3690:    plainLeakDetected: visibleTeachingSurface?.safety?.plainLeakDetected ?? false,
app/page.tsx:3691:    legacyBypassDetectedFromSurface: visibleTeachingSurface?.safety?.legacyBypassDetected ?? false,
app/page.tsx:3692:    surfaceSafetyBlocked: visibleTeachingSurface?.safety?.blocked ?? false,
app/page.tsx:3693:    surfaceFourTargetMismatch: visibleTeachingSurface?.debug?.fourTargetMismatch ?? false,
app/page.tsx:3694:    surfaceTwoPieceMismatch: visibleTeachingSurface?.debug?.twoPieceTypeMismatch ?? false,
app/page.tsx:3754:      {false && showAnswer&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyAnswerCard&&!visibleTeachingSurface?.coach?.shouldRender&&!isActiveTeachingFrame&&<div className="rounded-3xl bg-stone-900 p-4 text-white"><div className="text-sm text-stone-300">Study-line move</div><div className="mt-2 text-2xl font-black">{expectedUserOptions.length?expectedUserOptions.map(m=>m.san).join(" / "):engineLines[0]?.san??"Analysis pending"}</div><p className="mt-2 text-xs leading-5 text-stone-400">Source: {trainingMode==="restricted"?"Saved repertoire line":"Continuation analysis"}</p></div>}
app/page.tsx:3756:      {false && activeBoard&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyTrainingCard&&!visibleTeachingSurface?.coach?.shouldRender&&!isActiveTeachingFrame&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wide text-green-700">{patternCueBadgeLabel.replace("Cue ready","Plan mode")}</div><h2 className="text-lg font-black">{patternCue.title}</h2></div><button onClick={()=>setShowDetails(!showDetails)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{showDetails?"Hide":"Show more"}</button></div><p className="text-sm leading-6 text-stone-700">{patternCue.snippet}</p>{opponentCue&&boardSettings.showOpponentCue&&shouldRenderOpponentLastMoveHighlight({committed:opponentCue.committed,cueFen:opponentCue.fen,boardFen:normalizeFen(fen)})&&<p className="mt-2 rounded-2xl bg-purple-50 p-3 text-sm leading-6 text-purple-800"><span className="font-black">Opponent cue: </span>{opponentCue.message}</p>}{coachSurfacePolicy.allowNextMoveText&&patternCue.next&&(trainerView==="assisted"||showAnswer)&&<p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600"><span className="font-black text-stone-900">Next: </span>{patternCue.next}</p>}{visualModelError&&<p className="mt-2 rounded-2xl bg-amber-50 p-2 text-[11px] font-bold leading-5 text-amber-700">Visual cue unavailable: {visualModelError}</p>}{coachSurfacePolicy.allowMoveImpactCard&&moveImpactPresentation.show&&<MoveImpact impact={{label:moveImpactPresentation.label,pct:moveImpact.pct,tone:moveImpact.tone,note:moveImpactPresentation.note}}/>}{showDetails&&<div className="mt-3 space-y-2"><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Headline: {patternCue.title}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual: {activeVisualModelOutput?.animationPackage?.name??annotation.visualExplanation}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Move Quality Gate</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Version: {MOVE_QUALITY_GATE_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Required: {shouldValidateTrainingMove?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Status: {moveQualityPending?"pending":moveQuality?.status??"idle"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected UCI: {moveQuality?.expectedMovesUci?.join(", ")||expectedUserUcis.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected SAN: {expectedUserSans.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Stockfish top two: {moveQuality?.topMoves?.map((line)=>line.uci).join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Reason: {moveQuality?.reason??"No validation result."}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Checked: {moveQuality?.checkedAt?new Date(moveQuality.checkedAt).toLocaleTimeString():"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Hints hidden: {hideUnverifiedTrainingHints?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Teaching Cue Compiler</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler version: {TEACHING_CUE_COMPILER_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler concept: {teachingOrchestration?.cue.conceptId??"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler confidence: {teachingOrchestration?Number((teachingOrchestration.cue.debug.confidence??0).toFixed(3)):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler reason: {teachingOrchestration?.cue.debug.selectedReason??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler delta: {teachingOrchestration?.cue.debug.deltaSummary?.join(" | ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler scores: {teachingOrchestration?.cue.debug.detectorScores?.map((s)=>`${s.conceptId}:${s.finalScore.toFixed(2)}`).slice(0,6).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Orchestrator tier: {teachingOrchestration?.classification.tier??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Selected story: {teachingOrchestration?.selectedStory?.kind??"n/a"} ({teachingOrchestration?.selectedStory?.score.total?.toFixed?.(2)??"n/a"})</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Rejected stories: {teachingOrchestration?.debug.rejectedStories?.map((r)=>`${r.kind}:${r.total.toFixed(2)}`).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual budget: {teachingOrchestration?JSON.stringify(teachingOrchestration.debug.visualBudget):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Suppressed visuals: {teachingOrchestration?.debug.suppressionReasons?.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Learning events are being stored locally for future progress and Review features.</div>{annotation.reason&&<div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Fallback reason: {annotation.reason}</div>}</div>}</div>}
app/page.tsx:3758:      {/* v2.7.40 Agent 3 wiring: CoachCard now driven exclusively by VisibleTeachingSurface (coach + hint + showMore + actions).
app/page.tsx:3774:            suppressedReason: visibleTeachingSurface.coach.suppressedReason,
app/page.tsx:3776:            hint: visibleTeachingSurface.hint.text,
app/page.tsx:3777:            showMoreContent: visibleTeachingSurface.showMore.content,
app/page.tsx:3785:      {showDetails&&visualRecipe&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="flex items-center justify-between gap-3"><div className="font-black text-stone-800">Animation Playback</div><div className="flex items-center gap-2"><button onClick={visualRecipePlayback.replay} disabled={!visualRecipePlayback.replayAvailable||trainerView==="plain"} className={classNames("rounded-full px-3 py-1 text-[11px] font-black",visualRecipePlayback.replayAvailable&&trainerView!=="plain"?"bg-stone-900 text-white":"bg-stone-100 text-stone-400")}>Replay</button><button onClick={visualRecipePlayback.skipToEnd} disabled={visualRecipePlayback.animationState!=="playing"} className={classNames("rounded-full px-3 py-1 text-[11px] font-black",visualRecipePlayback.animationState==="playing"?"bg-stone-900 text-white":"bg-stone-100 text-stone-400")}>Skip</button></div></div><div className="mt-2">animationState: {visualRecipePlayback.animationState}</div><div>activeVisualRecipeId: {visualRecipePlayback.activeVisualRecipeId??"none"}</div><div>activePatternId: {visualRecipePlayback.activePatternId??"none"}</div><div>activeBeatIndex: {visualRecipePlayback.activeBeatIndex??"n/a"}</div><div>activeBeatId: {visualRecipePlayback.activeBeatId??"n/a"}</div><div>activePrimitiveIds: {visualRecipePlayback.activePrimitiveIds.join(", ")||"none"}</div><div>animationReducedMotion: {visualRecipePlayback.animationReducedMotion?"true":"false"}</div><div>animationSkippedToEnd: {visualRecipePlayback.animationSkippedToEnd?"true":"false"}</div><div>animationClearedReason: {visualRecipePlayback.animationClearedReason??"none"}</div><div>animationSuppressedReason: {visualRecipePlayback.animationSuppressedReason??"none"}</div><div>recipeFrameMatchesBoard: {visualRecipePlayback.recipeFrameMatchesBoard?"true":"false"}</div><div>recipeFenMatchesBoard: {visualRecipePlayback.recipeFenMatchesBoard?"true":"false"}</div><div>replayAvailable: {visualRecipePlayback.replayAvailable?"true":"false"}</div><div>tacticalPrimitivesRendered: {visualRecipePlayback.tacticalPrimitivesRendered?"true":"false"}</div></div>}
components/board/VisualRecipeLayer.tsx:7:export function VisualRecipeLayer({
components/board/useVisualRecipePlayback.ts:7:import type { ActiveVisualRecipePlayback, AnimationConductorContext, ReducedMotionMode } from "@/lib/blundr/animation/animationTypes";
components/board/useVisualRecipePlayback.ts:8:import type { VisualRecipe } from "@/lib/blundr/visualRecipe/visualRecipeTypes";
components/board/useVisualRecipePlayback.ts:27:  recipe?: VisualRecipe | null;
components/board/useVisualRecipePlayback.ts:41:export type VisualRecipePlaybackResult = {
components/board/useVisualRecipePlayback.ts:45:  animationState: ActiveVisualRecipePlayback["playbackState"];
components/board/useVisualRecipePlayback.ts:46:  activeVisualRecipeId?: string;
components/board/useVisualRecipePlayback.ts:65:export function useVisualRecipePlayback(input: PlaybackInput): VisualRecipePlaybackResult {
components/board/useVisualRecipePlayback.ts:69:  const [snapshot, setSnapshot] = useState<ActiveVisualRecipePlayback>(conductorRef.current.snapshot());
components/board/useVisualRecipePlayback.ts:70:  const snapshotRef = useRef<ActiveVisualRecipePlayback>(snapshot);
components/board/useVisualRecipePlayback.ts:80:  const updateSnapshot = useCallback((next: ActiveVisualRecipePlayback) => {
components/board/useVisualRecipePlayback.ts:261:    activeVisualRecipeId: snapshot.recipeId,
components/debug/BlundrDiagnosticsPanel.tsx:37:shouldRender: ${snapshot.visual.shouldRenderVisualRecipeLayer}
lib/blundr/animation/__tests__/animationConductor.test.ts:5:import type { VisualRecipe } from "../../visualRecipe/visualRecipeTypes";
lib/blundr/animation/__tests__/animationConductor.test.ts:24:function recipe(mode: VisualRecipe["mode"] = "move_teaching"): VisualRecipe {
lib/blundr/animation/__tests__/animationConductor.test.ts:25:  const beats: VisualRecipe["beats"] = mode === "assisted_context"
lib/blundr/animation/__tests__/animationConductor.test.ts:256:  } as VisualRecipe;
lib/blundr/animation/__tests__/animationConductor.test.ts:289:    } as VisualRecipe,
lib/blundr/animation/__tests__/animationEndStatePersistence.test.ts:4:import type { VisualRecipe } from "../../visualRecipe/visualRecipeTypes";
lib/blundr/animation/__tests__/animationEndStatePersistence.test.ts:7:  const recipe: VisualRecipe = {
lib/blundr/animation/__tests__/visualRecipePlaybackHookKey.test.ts:5:export function testVisualRecipePlaybackHookKey(): void {
lib/blundr/animation/__tests__/visualRecipePlaybackSnapshot.test.ts:4:import type { ActiveVisualRecipePlayback } from "../animationTypes";
lib/blundr/animation/__tests__/visualRecipePlaybackSnapshot.test.ts:6:function baseSnapshot(): ActiveVisualRecipePlayback {
lib/blundr/animation/__tests__/visualRecipePlaybackSnapshot.test.ts:27:export function testVisualRecipePlaybackSnapshot(): void {
lib/blundr/animation/__tests__/visualRecipePlaybackSnapshot.test.ts:29:  const b: ActiveVisualRecipePlayback = {
lib/blundr/animation/animationConductor.ts:1:import type { VisualPrimitive, VisualRecipe } from "../visualRecipe/visualRecipeTypes";
lib/blundr/animation/animationConductor.ts:7:  ActiveVisualRecipePlayback,
lib/blundr/animation/animationConductor.ts:22:function endStatePrimitives(recipe: VisualRecipe): VisualPrimitive[] {
lib/blundr/animation/animationConductor.ts:51:  private state: ActiveVisualRecipePlayback;
lib/blundr/animation/animationConductor.ts:70:  snapshot(): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:74:  private setSuppressed(reason: AnimationSuppressionReason): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:83:  private setCleared(reason: AnimationClearReason): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:92:  private applyBeat(recipe: VisualRecipe, beatEntry: BeatTimelineEntry, playbackState: ActiveVisualRecipePlayback["playbackState"]): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:112:  private applyEndState(recipe: VisualRecipe, playbackState: ActiveVisualRecipePlayback["playbackState"]): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:133:  private startRecipe(recipe: VisualRecipe, nowMs: number, reducedMotion: boolean): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:156:  private validateRecipeFrameFen(recipe: VisualRecipe, context: AnimationConductorContext): { frameOk: boolean; fenOk: boolean } {
lib/blundr/animation/animationConductor.ts:165:    recipe?: VisualRecipe | null;
lib/blundr/animation/animationConductor.ts:169:  }): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:242:  clear(reason: AnimationClearReason): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:246:  skipToEnd(): ActiveVisualRecipePlayback {
lib/blundr/animation/animationConductor.ts:257:  replay(input: { context: AnimationConductorContext; nowMs: number; reducedMotionMode?: ReducedMotionMode }): ActiveVisualRecipePlayback {
lib/blundr/animation/animationStateMachine.ts:1:import type { ActiveVisualRecipePlayback, AnimationClearReason, AnimationPlaybackState, AnimationSuppressionReason } from "./animationTypes";
lib/blundr/animation/animationStateMachine.ts:9:  state: ActiveVisualRecipePlayback,
lib/blundr/animation/animationStateMachine.ts:11:): ActiveVisualRecipePlayback {
lib/blundr/animation/animationTimeline.ts:1:import type { VisualBeat, VisualRecipe } from "../visualRecipe/visualRecipeTypes";
lib/blundr/animation/animationTimeline.ts:17:export function buildAnimationTimeline(recipe: VisualRecipe, startsAtMs: number): BeatTimelineEntry[] {
lib/blundr/animation/animationTypes.ts:1:import type { VisualPrimitive, VisualRecipe } from "../visualRecipe/visualRecipeTypes";
lib/blundr/animation/animationTypes.ts:43:export type ActiveVisualRecipePlayback = {
lib/blundr/animation/animationTypes.ts:45:  recipe?: VisualRecipe;
lib/blundr/animation/playbackKey.ts:1:import type { VisualRecipe } from "../visualRecipe/visualRecipeTypes";
lib/blundr/animation/playbackKey.ts:5:  recipe?: Pick<VisualRecipe, "visualRecipeId" | "frameId" | "fen" | "mode" | "patternId" | "beats" | "endState"> | null;
lib/blundr/animation/playbackSnapshot.ts:1:import type { ActiveVisualRecipePlayback } from "./animationTypes";
lib/blundr/animation/playbackSnapshot.ts:11:export function snapshotsEqual(a: ActiveVisualRecipePlayback, b: ActiveVisualRecipePlayback): boolean {
lib/blundr/coach/__tests__/teachingIntent.test.ts:16:  assert.equal(resolveCoachTeachingIntent({ packet, interaction: "none", hasVisualRecipe: true }), "explain_visual_recipe");
lib/blundr/coach/__tests__/teachingIntent.test.ts:17:  assert.equal(resolveCoachTeachingIntent({ packet: { ...packet, viewMode: "plain" }, interaction: "hint", hasVisualRecipe: false }), "recall_hint");
lib/blundr/coach/__tests__/teachingIntent.test.ts:18:  assert.equal(resolveCoachTeachingIntent({ packet, interaction: "hide", hasVisualRecipe: true }), "silent");
lib/blundr/coach/intentFirstCoachEngine.ts:40:  const intent = resolveCoachTeachingIntent({ packet, interaction: input.interaction, hasVisualRecipe: Boolean(input.visualRecipeId ?? packet.visualRecipeFacts?.patternId) });
lib/blundr/coach/teachingIntent.ts:7:  hasVisualRecipe: boolean;
lib/blundr/coach/teachingIntent.ts:13:  if (input.packet.trainingMode === "restricted" && input.packet.viewMode === "assisted" && input.hasVisualRecipe) return "explain_visual_recipe";
lib/blundr/coachBrain/coachEvidenceTypes.ts:82:export interface VisualRecipeFactPacket {
lib/blundr/coachBrain/coachEvidenceTypes.ts:159:  visualRecipeFacts?: VisualRecipeFactPacket;
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:18:import { compileVisualRecipe } from "../../visualRecipe/visualRecipeCompiler";
lib/blundr/debug/__tests__/multiMoveTrainingQa.test.ts:111:  const recipe = compileVisualRecipe({
lib/blundr/debug/trainerDebugSnapshot.ts:206:  if (input.visibleTeachingSurface?.safety?.blocked && isTeachingFrame(input)) {
lib/blundr/debug/trainerDebugSnapshot.ts:207:    if (input.visibleTeachingSurface.safety.targetMismatch || input.visibleTeachingSurface.debug?.fourTargetMismatch) criticalIssues.push("surface_target_mismatch_blocked");
lib/blundr/debug/trainerDebugSnapshot.ts:208:    if (input.visibleTeachingSurface.safety.pieceMismatch || input.visibleTeachingSurface.debug?.twoPieceTypeMismatch) criticalIssues.push("surface_piece_mismatch_blocked");
lib/blundr/debug/trainerDebugSnapshot.ts:209:    if (input.visibleTeachingSurface.safety.plainLeakDetected) criticalIssues.push("plain_leak_detected_and_blocked");
lib/blundr/debug/trainerDebugSnapshot.ts:210:    if (input.visibleTeachingSurface.safety.legacyBypassDetected) criticalIssues.push("surface_legacy_bypass_flagged");
lib/blundr/debug/trainerDebugSnapshot.ts:363:  if (input.visualRecipe && input.visualReady === false && !presentation.visual?.shouldRender && input.visualRecipeOverlay?.adapterAllowed) criticalIssues.push("VisualRecipe exists but visual did not render while legacy ready was false");
lib/blundr/debug/trainerDebugSnapshot.ts:546:      shouldRenderVisualRecipeLayer: presentation.visual?.shouldRender ?? false,
lib/blundr/debug/trainerDebugSnapshot.ts:715:      whyVisualRecipeOpportunityLost: coachDebug.whyVisualRecipeOpportunityLost ?? "not_exposed_from_module",
lib/blundr/debug/trainerDebugSnapshot.ts:731:        input.visibleTeachingSurface?.safety?.plainLeakDetected ||
lib/blundr/debug/trainerDebugSnapshot.ts:766:      // Agent 6: surface owner + 4-target/2-piece + leak/bypass from VisibleTeachingSurface guard
lib/blundr/debug/trainerDebugSnapshot.ts:767:      visibleSurfaceOwner: input.visibleSurfaceOwner ?? input.visibleTeachingSurface?.owner ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:768:      visibleCoachOwner: input.visibleCoachOwner ?? input.visibleTeachingSurface?.debug?.visibleCoachOwner ?? (presentation?.coach?.owner ?? "none"),
lib/blundr/debug/trainerDebugSnapshot.ts:769:      visibleVisualOwner: input.visibleVisualOwner ?? input.visibleTeachingSurface?.debug?.visibleVisualOwner ?? "none",
lib/blundr/debug/trainerDebugSnapshot.ts:770:      visibleActionOwner: input.visibleActionOwner ?? input.visibleTeachingSurface?.debug?.visibleActionOwner ?? "visibleActionPolicy",
lib/blundr/debug/trainerDebugSnapshot.ts:771:      showMoreTargetUci: input.showMoreTargetUci ?? input.visibleTeachingSurface?.targetUci ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:772:      surfaceSafety: input.surfaceSafety ?? input.visibleTeachingSurface?.safety ?? null,
lib/blundr/debug/trainerDebugSnapshot.ts:773:      fourTargetMismatchFromSurface: input.surfaceFourTargetMismatch ?? input.visibleTeachingSurface?.debug?.fourTargetMismatch ?? false,
lib/blundr/debug/trainerDebugSnapshot.ts:774:      twoPieceMismatchFromSurface: input.surfaceTwoPieceMismatch ?? input.visibleTeachingSurface?.debug?.twoPieceTypeMismatch ?? false,
lib/blundr/debug/trainerDebugSnapshot.ts:787:      // v2.7.40 P0 Fix 2: when VisibleTeachingSurface owns the coach render on teaching, live coach path is not "actually rendered" visibly (internal evidence only).
lib/blundr/debug/trainerDebugSnapshot.ts:788:      liveCoachActuallyRendered: input.visibleTeachingSurface?.coach?.shouldRender ? false : (input.coachDecision?.debug?.coachCopySource === "live_coach"),
lib/blundr/debug/trainerDebugSnapshot.ts:790:      legacyBypassDetected: Boolean(input.legacyBypassDetected || input.legacyBypassDetectedFromSurface || input.visibleTeachingSurface?.safety?.legacyBypassDetected),
lib/blundr/debug/trainerDebugSnapshot.ts:839:        visualRecipeIndependent: !criticalIssues.some((issue) => issue.includes("VisualRecipe exists")),
lib/blundr/debug/trainerDebugSnapshot.ts:847:        noLegacyBypass: !input.legacyBypassDetected && !(input.visibleTeachingSurface?.safety?.legacyBypassDetected),
lib/blundr/debug/trainerDebugSnapshot.ts:849:        noPlainLeak: !(input.trainerView === "plain" && input.expectedMoveSan && String(input.coachDecision?.body ?? "").includes(input.expectedMoveSan)) && !Boolean(input.plainLeakDetected || input.visibleTeachingSurface?.safety?.plainLeakDetected),
lib/blundr/debug/trainerDebugSnapshot.ts:852:        surfaceNotBlockedOnTeaching: isTeachingFrame(input) ? !Boolean(input.visibleTeachingSurface?.safety?.blocked) : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:853:        surfaceTargetsAligned: instructionTargetUci ? !(input.surfaceFourTargetMismatch || input.visibleTeachingSurface?.debug?.fourTargetMismatch) : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:854:        surfacePiecesAligned: (instructionTargetPieceType || input.instructionTargetPieceType) ? !(input.surfaceTwoPieceMismatch || input.visibleTeachingSurface?.debug?.twoPieceTypeMismatch) : "unknown",
lib/blundr/debug/trainerDebugSnapshot.ts:855:        noPlainLeakFromSurface: !Boolean(input.visibleTeachingSurface?.safety?.plainLeakDetected),
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:6:import { compileVisualRecipe } from "../../visualRecipe/visualRecipeCompiler";
lib/blundr/golden/__tests__/italianCastlingGolden.test.ts:11:  const recipe = compileVisualRecipe({ trainingContext: { mode: "move_teaching", moveTrust: "book_supported", contextTrust: "safe_context", nextPlay: { allowed: true }, cue: { conceptId: g.conceptId, metadata: { moveUci: g.moveUci, moveSan: g.moveSan } } } as any, fen: g.fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: g.moveUci, expectedMoveSan: g.moveSan, frameId: 1 });
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:32:  const normalTeachingSurface = isBranchTransitionActionSurface({
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:37:  assert.equal(normalTeachingSurface, false, "normal teaching actions must not use branch transition styling");
lib/blundr/presentation/__tests__/coachActionStylePolicy.test.ts:38:  assert.equal(resolveCoachActionStyle("show_more", normalTeachingSurface), "default");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:4:import { buildVisibleTeachingSurface, detectPlainTeachingLeak } from "../buildVisibleTeachingSurface";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:9:import { compileVisualRecipe } from "../../visualRecipe/visualRecipeCompiler";
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:116:// v2.7.40 VisibleTeachingSurface + Agent4/5 tests (imports consolidated at top)
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:190:export function testVisibleTeachingSurface(): void {
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:194:  const s1 = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:207:  const s2 = buildVisibleTeachingSurface({ currentInstructionFrame: contFrame, trainerPresentationFrame: pres2, trainingMode: "continuation", trainerView: "assisted" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:213:  const sPlain = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:225:  const sMismatch = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, legacyCoachDecision: badLegacy as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:234:  const sPiece = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, legacyCoachDecision: badPieceLegacy as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:240:  const sLegacy = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: makeMockPresentationFrame(true, true, "legacy_fallback", "legacy_fallback"), legacyCoachDecision: { body: "legacy" } as any });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:247:  const s4Target = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:262:  const s2Piece = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:278:  const sLeak = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:295:  const sTerm = buildVisibleTeachingSurface({ currentInstructionFrame: termInput, trainerPresentationFrame: pres1, isTerminal: true, isUserTurn: false, trainerPhase: "terminal" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:299:  const sOpp = buildVisibleTeachingSurface({ currentInstructionFrame: oppInput, trainerPresentationFrame: pres1, trainerPhase: "opponent_replying", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:303:  const sClean = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres1, coachMoveUci: "e2e4", visualMoveUci: "e2e4", coachPieceType: "p" });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:312:  console.log("✓ v2.7.40 buildVisibleTeachingSurface tests passed (6 cases + 6 Agent6 invariant guard cases)");
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:337:  const sPlainPre0 = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:346:  const sPlainPost = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: true, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:357:  const sNewFrame = buildVisibleTeachingSurface({ currentInstructionFrame: { ...guidedFrame, frameId: "f99", target: { ...guidedFrame.target!, uci: "d2d4" } } as any, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:429:  const surface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:469:  const sAssisted = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "assisted", trainerPhase: "ready_for_user", isUserTurn: true });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:475:  const sPlainPre = buildVisibleTeachingSurface({ currentInstructionFrame: guidedFrame, trainerPresentationFrame: pres, trainerView: "plain", showMoreShown: false, hintCount: 0 });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:481:  const sTerm = buildVisibleTeachingSurface({ currentInstructionFrame: termInput, trainerPresentationFrame: pres, isTerminal: true, trainerPhase: "terminal", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:486:  const sOpp = buildVisibleTeachingSurface({ currentInstructionFrame: oppInput, trainerPresentationFrame: pres, trainerPhase: "opponent_replying", isUserTurn: false });
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:491:  const sBranch = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:504:  const noTargetBranchSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:554:  const plainBc4Recipe = compileVisualRecipe({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:577:  const preSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:592:  const postSurface = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:631:  const postSurfForShow = buildVisibleTeachingSurface({
lib/blundr/presentation/__tests__/trainerPresentationFrame.test.ts:646:  const preBc4Surf = buildVisibleTeachingSurface({
lib/blundr/presentation/buildVisibleTeachingSurface.ts:6:import { resolveTeachingSurfaceMode } from "./modeSurfacePolicy";
lib/blundr/presentation/buildVisibleTeachingSurface.ts:8:import type { VisibleTeachingSurface } from "./types";
lib/blundr/presentation/buildVisibleTeachingSurface.ts:11:export interface BuildVisibleTeachingSurfaceInput {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:16:  showMoreRevealed: boolean;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:19:type LegacyBuildVisibleTeachingSurfaceInput = {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:27:function isCanonicalInput(input: unknown): input is BuildVisibleTeachingSurfaceInput {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:28:  const candidate = input as BuildVisibleTeachingSurfaceInput;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:32:function buildLegacyCompatibilitySurface(input: LegacyBuildVisibleTeachingSurfaceInput): any {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:100:export function buildVisibleTeachingSurface(input: BuildVisibleTeachingSurfaceInput): VisibleTeachingSurface;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:101:export function buildVisibleTeachingSurface(input: LegacyBuildVisibleTeachingSurfaceInput): any;
lib/blundr/presentation/buildVisibleTeachingSurface.ts:102:export function buildVisibleTeachingSurface(
lib/blundr/presentation/buildVisibleTeachingSurface.ts:103:  input: BuildVisibleTeachingSurfaceInput | LegacyBuildVisibleTeachingSurfaceInput,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:104:): VisibleTeachingSurface | any {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:110:  const mode = resolveTeachingSurfaceMode({
lib/blundr/presentation/buildVisibleTeachingSurface.ts:112:    showMoreRevealed: input.showMoreRevealed,
lib/blundr/presentation/buildVisibleTeachingSurface.ts:117:  const surfaceBase: VisibleTeachingSurface = {
lib/blundr/presentation/buildVisibleTeachingSurface.ts:152:export default buildVisibleTeachingSurface;
lib/blundr/presentation/trainerPresentationFrame.ts:183:  // CurrentInstructionFrame.target -> BlundrBrainAnalysis.safeFallbackCopy (piece-matched, evidence-backed, no halluc) -> TrainerPresentationFrame -> VisibleTeachingSurface
lib/blundr/presentation/types.ts:1:export type TeachingSurfaceMode =
lib/blundr/presentation/types.ts:25:export interface SurfaceVisualRecipe {
lib/blundr/presentation/types.ts:53:export interface VisibleTeachingSurface {
lib/blundr/presentation/types.ts:55:  mode: TeachingSurfaceMode;
lib/blundr/presentation/types.ts:61:  visuals: SurfaceVisualRecipe[];
lib/blundr/salience/salienceVisualSelector.ts:10:import { renderVisualRecipe } from "./visualRecipes";
lib/blundr/salience/salienceVisualSelector.ts:26:    const output = renderVisualRecipe(candidate, packet);
lib/blundr/salience/visualRecipes.ts:184:export function renderVisualRecipe(candidate: TeachingCandidate, packet: BlundrFeaturePacket): BlundrVisualModelOutput {
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts:3:import { compileVisualRecipe } from "../visualRecipeCompiler";
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts:5:export function testCastlingVisualRecipe(): void {
lib/blundr/visualRecipe/__tests__/castlingVisualRecipe.test.ts:6:  const recipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:3:import { adaptVisualRecipe } from "../visualRecipeAdapter";
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:4:import { compileVisualRecipe } from "../visualRecipeCompiler";
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:78:export function testVisualRecipeAdapter(): void {
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:80:  const allowed = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:96:  const staleFrame = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:108:  const staleFen = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:120:  const selecting = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:131:  const plain = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:142:  const candidateBlocked = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:155:  const assistedContextRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:171:  const assistedContext = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:212:  const tacticalAdapted = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:226:  const frameStringMatch = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:237:  const differentSide = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:248:  const differentCastling = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:259:  const differentEnPassant = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:292:  const e2e4Adapted = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeAdapter.test.ts:304:  const trueStaleMismatch = adaptVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:4:import { compileVisualRecipe } from "../visualRecipeCompiler";
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:6:function hasPrimitive(recipe: ReturnType<typeof compileVisualRecipe>, type: string, matcher: (p: any) => boolean): boolean {
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:37:export function testVisualRecipeCompiler(): void {
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:51:  const bc4Recipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 10 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:75:  const castleRecipe = compileVisualRecipe({ trainingContext: castleTc, fen: castleFen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "e1g1", expectedMoveSan: "O-O", openingId: "italian", lineId: "italian", frameId: 11 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:96:  const c3Recipe = compileVisualRecipe({ trainingContext: c3Tc, fen: c3Fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "c2c3", expectedMoveSan: "c3", openingId: "italian", lineId: "italian", frameId: 12 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:117:  const re1Recipe = compileVisualRecipe({ trainingContext: re1Tc, fen: re1Fen, viewMode: "assisted", revealState: "hidden", expectedMoveUci: "f1e1", expectedMoveSan: "Re1", openingId: "italian", lineId: "italian", frameId: 13 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:121:  const assistedRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:136:  const plainRecipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "plain", revealState: "hidden", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 15 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:141:  const revealHiddenRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:152:  const revealShownRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:166:  const untrustedRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:178:  const budgetRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:199:  const bc4RecipeSameAgain = compileVisualRecipe({ trainingContext: bc4Tc, fen: bc4Fen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "f1c4", expectedMoveSan: "Bc4", frameId: 10 });
lib/blundr/visualRecipe/__tests__/visualRecipeCompiler.test.ts:204:  const changedRecipe = compileVisualRecipe({ trainingContext: bc4Tc, fen: castleFen, viewMode: "assisted", revealState: "hidden", openingId: "italian", lineId: "italian", expectedMoveUci: "e1g1", expectedMoveSan: "O-O", frameId: 20 });
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:4:import { adaptVisualRecipe } from "../visualRecipeAdapter";
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:5:import { compileVisualRecipe } from "../visualRecipeCompiler";
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:11:export function testVisualRecipePolicy(): void {
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:116:  const assistedRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:127:  const plainRecipe = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:143:  const assistedRecipeAgain = compileVisualRecipe({
lib/blundr/visualRecipe/__tests__/visualRecipePolicy.test.ts:174:  const adapted = adaptVisualRecipe({
lib/blundr/visualRecipe/testCastlingVisualLifecycle.ts:2:import { testCastlingVisualRecipe } from "./__tests__/castlingVisualRecipe.test";
lib/blundr/visualRecipe/testCastlingVisualLifecycle.ts:6:  testCastlingVisualRecipe();
lib/blundr/visualRecipe/visualRecipeAdapter.ts:8:import type { VisualPrimitive, VisualRecipe } from "./visualRecipeTypes";
lib/blundr/visualRecipe/visualRecipeAdapter.ts:10:export type VisualRecipeAdapterLine = {
lib/blundr/visualRecipe/visualRecipeAdapter.ts:17:export type VisualRecipeAdapterSquare = {
lib/blundr/visualRecipe/visualRecipeAdapter.ts:23:export type VisualRecipeAdapterInput = {
lib/blundr/visualRecipe/visualRecipeAdapter.ts:24:  recipe?: VisualRecipe | null;
lib/blundr/visualRecipe/visualRecipeAdapter.ts:34:export type VisualRecipeAdapterResult = {
lib/blundr/visualRecipe/visualRecipeAdapter.ts:39:  lines: VisualRecipeAdapterLine[];
lib/blundr/visualRecipe/visualRecipeAdapter.ts:40:  squares: VisualRecipeAdapterSquare[];
lib/blundr/visualRecipe/visualRecipeAdapter.ts:58:function asLine(primitive: VisualPrimitive): VisualRecipeAdapterLine | null {
lib/blundr/visualRecipe/visualRecipeAdapter.ts:64:function asSquare(primitive: VisualPrimitive): VisualRecipeAdapterSquare | null {
lib/blundr/visualRecipe/visualRecipeAdapter.ts:81:export function adaptVisualRecipe(input: VisualRecipeAdapterInput): VisualRecipeAdapterResult {
lib/blundr/visualRecipe/visualRecipeAdapter.ts:284:  const lines = teachingPrimitives.map(asLine).filter((line): line is VisualRecipeAdapterLine => Boolean(line));
lib/blundr/visualRecipe/visualRecipeAdapter.ts:285:  const squares = teachingPrimitives.map(asSquare).filter((square): square is VisualRecipeAdapterSquare => Boolean(square));
lib/blundr/visualRecipe/visualRecipeBudget.ts:1:import type { VisualPrimitive, VisualRecipeBudget } from "./visualRecipeTypes";
lib/blundr/visualRecipe/visualRecipeBudget.ts:3:export const DEFAULT_VISUAL_RECIPE_BUDGET: VisualRecipeBudget = {
lib/blundr/visualRecipe/visualRecipeBudget.ts:12:export type VisualRecipeBudgetResult = {
lib/blundr/visualRecipe/visualRecipeBudget.ts:26:export function enforceVisualRecipeBudget(
lib/blundr/visualRecipe/visualRecipeBudget.ts:28:  budget: VisualRecipeBudget = DEFAULT_VISUAL_RECIPE_BUDGET,
lib/blundr/visualRecipe/visualRecipeBudget.ts:29:): VisualRecipeBudgetResult {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:4:import { DEFAULT_VISUAL_RECIPE_BUDGET, enforceVisualRecipeBudget } from "./visualRecipeBudget";
lib/blundr/visualRecipe/visualRecipeCompiler.ts:9:  buildVisualRecipeId,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:11:import { deriveVisualRecipePermissions } from "./visualRecipePermissions";
lib/blundr/visualRecipe/visualRecipeCompiler.ts:20:  type VisualRecipe,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:21:  type VisualRecipeCompileInput,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:22:  type VisualRecipeDebug,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:23:  type VisualRecipeMode,
lib/blundr/visualRecipe/visualRecipeCompiler.ts:36:function expectedMove(input: VisualRecipeCompileInput): { uci?: string; san?: string } {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:49:function recipeSerializable(recipe: VisualRecipe): boolean {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:66:}): VisualRecipeDebug {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:101:}): VisualRecipe {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:109:  const visualRecipeId = buildVisualRecipeId({
lib/blundr/visualRecipe/visualRecipeCompiler.ts:125:  const recipe: VisualRecipe = {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:252:  mode: VisualRecipeMode;
lib/blundr/visualRecipe/visualRecipeCompiler.ts:355:export function compileVisualRecipe(input: VisualRecipeCompileInput): VisualRecipe {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:374:  const permissionDecision = deriveVisualRecipePermissions({
lib/blundr/visualRecipe/visualRecipeCompiler.ts:402:  const visualRecipeId = buildVisualRecipeId({
lib/blundr/visualRecipe/visualRecipeCompiler.ts:445:  const budgeted = enforceVisualRecipeBudget(priorityPolicy.kept, budget);
lib/blundr/visualRecipe/visualRecipeCompiler.ts:504:  const debug: VisualRecipeDebug = {
lib/blundr/visualRecipe/visualRecipeCompiler.ts:529:  const recipe: VisualRecipe = {
lib/blundr/visualRecipe/visualRecipeIds.ts:34:export function buildVisualRecipeId(input: {
lib/blundr/visualRecipe/visualRecipePermissions.ts:3:  VisualRecipePermissionDecision,
lib/blundr/visualRecipe/visualRecipePermissions.ts:4:  VisualRecipePermissionInput,
lib/blundr/visualRecipe/visualRecipePermissions.ts:5:  VisualRecipePermissions,
lib/blundr/visualRecipe/visualRecipePermissions.ts:15:function basePermissions(): VisualRecipePermissions {
lib/blundr/visualRecipe/visualRecipePermissions.ts:29:export function deriveVisualRecipePermissions(input: VisualRecipePermissionInput): VisualRecipePermissionDecision {
lib/blundr/visualRecipe/visualRecipeTypes.ts:7:export type VisualRecipeSchemaVersion = typeof VISUAL_RECIPE_SCHEMA_VERSION;
lib/blundr/visualRecipe/visualRecipeTypes.ts:9:export type VisualRecipeMode =
lib/blundr/visualRecipe/visualRecipeTypes.ts:156:export type VisualRecipeEndState = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:169:export type VisualRecipePermissions = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:196:export type VisualRecipeDebug = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:221:export type VisualRecipe = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:222:  recipeSchemaVersion: VisualRecipeSchemaVersion;
lib/blundr/visualRecipe/visualRecipeTypes.ts:226:  mode: VisualRecipeMode;
lib/blundr/visualRecipe/visualRecipeTypes.ts:233:  endState: VisualRecipeEndState;
lib/blundr/visualRecipe/visualRecipeTypes.ts:234:  permissions: VisualRecipePermissions;
lib/blundr/visualRecipe/visualRecipeTypes.ts:236:  debug?: VisualRecipeDebug;
lib/blundr/visualRecipe/visualRecipeTypes.ts:242:export type VisualRecipeCompileInput = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:263:  visualBudgetOverride?: Partial<VisualRecipeBudget>;
lib/blundr/visualRecipe/visualRecipeTypes.ts:266:export type VisualRecipeBudget = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:275:export type VisualRecipePermissionInput = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:283:export type VisualRecipePermissionDecision = {
lib/blundr/visualRecipe/visualRecipeTypes.ts:284:  mode: VisualRecipeMode;
lib/blundr/visualRecipe/visualRecipeTypes.ts:285:  permissions: VisualRecipePermissions;
tests/coach/browserContract.test.ts:19:    visibleSurfaceSafeFrameOnly: "VisibleTeachingSurface must be built from SafetyGateOutput.safeFrame only.",
tests/coach/coachSafetyGate.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/coachSafetyGate.test.ts:286:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/coachSafetyGate.test.ts:291:    showMoreRevealed: false,
tests/coach/continuationFlow.test.ts:4:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/continuationFlow.test.ts:77:  const branchSurface = buildVisibleTeachingSurface({
tests/coach/continuationFlow.test.ts:82:    showMoreRevealed: false,
tests/coach/liveChainSmoke.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/liveChainSmoke.test.ts:40:  showMoreRevealed?: boolean;
tests/coach/liveChainSmoke.test.ts:60:  const surface = buildVisibleTeachingSurface({
tests/coach/liveChainSmoke.test.ts:65:    showMoreRevealed: input.showMoreRevealed ?? false,
tests/coach/liveChainSmoke.test.ts:195:  const blockedSurface = buildVisibleTeachingSurface({
tests/coach/liveChainSmoke.test.ts:200:    showMoreRevealed: false,
tests/coach/plainLeak.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/plainLeak.test.ts:68:  const plainPreSurface = buildVisibleTeachingSurface({
tests/coach/plainLeak.test.ts:73:    showMoreRevealed: false,
tests/coach/showMoreVisualReveal.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/showMoreVisualReveal.test.ts:37:  const assistedSurface = buildVisibleTeachingSurface({
tests/coach/showMoreVisualReveal.test.ts:42:    showMoreRevealed: false,
tests/coach/showMoreVisualReveal.test.ts:44:  const plainShowMoreSurface = buildVisibleTeachingSurface({
tests/coach/showMoreVisualReveal.test.ts:49:    showMoreRevealed: true,
tests/coach/targetInvariant.test.ts:6:import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
tests/coach/targetInvariant.test.ts:39:  const surface = buildVisibleTeachingSurface({
tests/coach/targetInvariant.test.ts:44:    showMoreRevealed: false,
tests/coach/typeContracts.test.ts:7:import type { VisibleTeachingSurface } from "../../lib/blundr/presentation/types";
tests/coach/typeContracts.test.ts:151:  const safeFallbackSurface: VisibleTeachingSurface = {

$ git grep -n "SafetyGateOutput\|runCoachSafetyGate\|CompiledCoachFrame\|CompiledCoachVisualIntent" lib/blundr tests/coach || true
lib/blundr/coachCompiler/compileCoachFrame.ts:9:import type { CompiledCoachFrame, CompiledCoachTextBlock } from "./types";
lib/blundr/coachCompiler/compileCoachFrame.ts:179:}): CompiledCoachFrame {
lib/blundr/coachCompiler/types.ts:25:export interface CompiledCoachVisualIntent {
lib/blundr/coachCompiler/types.ts:51:export interface CompiledCoachFrame {
lib/blundr/coachCompiler/types.ts:66:  visualIntents: CompiledCoachVisualIntent[];
lib/blundr/coachCompiler/visualIntentBuilder.ts:4:import type { CompiledCoachVisualIntent } from "./types";
lib/blundr/coachCompiler/visualIntentBuilder.ts:8:  type: CompiledCoachVisualIntent["type"],
lib/blundr/coachCompiler/visualIntentBuilder.ts:12:    leakRisk?: CompiledCoachVisualIntent["leakRisk"];
lib/blundr/coachCompiler/visualIntentBuilder.ts:15:): CompiledCoachVisualIntent {
lib/blundr/coachCompiler/visualIntentBuilder.ts:33:}): CompiledCoachVisualIntent[] {
lib/blundr/coachCompiler/visualIntentBuilder.ts:38:  const intents: CompiledCoachVisualIntent[] = [
lib/blundr/presentation/buildVisibleTeachingSurface.ts:3:import type { SafetyGateOutput } from "../safety/types";
lib/blundr/presentation/buildVisibleTeachingSurface.ts:14:  safetyOutput: SafetyGateOutput;
lib/blundr/safety/coachSafetyGate.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/coachSafetyGate.ts:11:import type { CoachSafetyResult, SafetyGateOutput } from "./types";
lib/blundr/safety/coachSafetyGate.ts:13:export function runCoachSafetyGate(input: {
lib/blundr/safety/coachSafetyGate.ts:16:  compiled: CompiledCoachFrame;
lib/blundr/safety/coachSafetyGate.ts:18:}): SafetyGateOutput {
lib/blundr/safety/nullTargetPolicy.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/nullTargetPolicy.ts:16:  compiled: CompiledCoachFrame;
lib/blundr/safety/plainLeakPolicy.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/plainLeakPolicy.ts:30:  compiled: CompiledCoachFrame;
lib/blundr/safety/providerAuthorityPolicy.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/providerAuthorityPolicy.ts:11:  compiled: CompiledCoachFrame;
lib/blundr/safety/safeFallbackFrame.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/safeFallbackFrame.ts:11:  compiled: CompiledCoachFrame;
lib/blundr/safety/safeFallbackFrame.ts:13:}): CompiledCoachFrame {
lib/blundr/safety/strongClaimPolicy.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/strongClaimPolicy.ts:35:  compiled: CompiledCoachFrame;
lib/blundr/safety/targetInvariantPolicy.ts:2:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/targetInvariantPolicy.ts:15:  compiled: CompiledCoachFrame;
lib/blundr/safety/types.ts:1:import type { CompiledCoachFrame } from "../coachCompiler/types";
lib/blundr/safety/types.ts:57:export interface SafetyGateOutput {
lib/blundr/safety/types.ts:59:  safeFrame: CompiledCoachFrame;
tests/coach/antiHallucination.test.ts:7:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/antiHallucination.test.ts:79:  const gate = runCoachSafetyGate({ frame, graph, compiled: strongClaimCompiled, activatedConcepts: concepts.activated });
tests/coach/browserContract.test.ts:19:    visibleSurfaceSafeFrameOnly: "VisibleTeachingSurface must be built from SafetyGateOutput.safeFrame only.",
tests/coach/coachCompiler.test.ts:8:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/coachCompiler.test.ts:153:  const safety = runCoachSafetyGate({ frame: bc4Frame, graph: bc4.graph, compiled: bc4.compiled, activatedConcepts: bc4.concepts.activated });
tests/coach/coachSafetyGate.test.ts:7:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/coachSafetyGate.test.ts:53:  const valid = runCoachSafetyGate({ frame: bc4.frame, graph: bc4.graph, compiled: bc4.compiled, activatedConcepts: bc4.concepts.activated });
tests/coach/coachSafetyGate.test.ts:56:  const badTarget = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:65:  const badVisual = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:77:  const badReveal = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:86:  const badGraph = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:95:  const plainLeakSan = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:103:  const plainLeakUci = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:110:  const plainLeakSquares = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:117:  const plainLeakPiece = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:124:  const genericPlain = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:131:  const strongBest = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:138:  const strongWin = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:145:  const strongMate = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:160:  const withCheckmateWord = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:171:  const engineLanguage = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:190:  const opponentReveal = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:197:  const opponentVisual = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:228:  const branchPass = runCoachSafetyGate({ frame: branchComplete, graph: branchGraph, compiled: branchCompiled });
tests/coach/coachSafetyGate.test.ts:231:  const branchRevealBad = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:249:  const terminalVisualBad = runCoachSafetyGate({
tests/coach/coachSafetyGate.test.ts:280:  const providerMismatch = runCoachSafetyGate({ frame: bc4.frame, graph: providerMismatchGraph, compiled: bc4.compiled });
tests/coach/continuationFlow.test.ts:7:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/continuationFlow.test.ts:76:  const branchGate = runCoachSafetyGate({ frame: branchFrame, graph: branchGraph, compiled: branchCompiled });
tests/coach/liveChainSmoke.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/liveChainSmoke.test.ts:54:  const gated = runCoachSafetyGate({
tests/coach/liveChainSmoke.test.ts:182:  const mismatchGate = runCoachSafetyGate({ frame: bc4Frame, graph: bc4.graph, compiled: mismatchCompiled, activatedConcepts: bc4.concepts.activated });
tests/coach/liveChainSmoke.test.ts:192:  const plainLeakGate = runCoachSafetyGate({ frame: bc4Frame, graph: bc4.graph, compiled: plainLeakCompiled, activatedConcepts: bc4.concepts.activated });
tests/coach/liveChainSmoke.test.ts:210:  const strongClaimGate = runCoachSafetyGate({ frame: bc4Frame, graph: bc4.graph, compiled: strongClaimCompiled, activatedConcepts: bc4.concepts.activated });
tests/coach/plainLeak.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/plainLeak.test.ts:66:  const gatePass = runCoachSafetyGate({ frame, graph, compiled, activatedConcepts: assistedConcepts.activated });
tests/coach/plainLeak.test.ts:83:  const gateLeak = runCoachSafetyGate({ frame, graph, compiled: leaked, activatedConcepts: assistedConcepts.activated });
tests/coach/providerFailure.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/providerFailure.test.ts:93:  const gate = runCoachSafetyGate({ frame: guided, graph: providerMismatch, compiled });
tests/coach/showMoreVisualReveal.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/showMoreVisualReveal.test.ts:35:  const safety = runCoachSafetyGate({ frame, graph, compiled, activatedConcepts: concepts.activated });
tests/coach/targetInvariant.test.ts:9:import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
tests/coach/targetInvariant.test.ts:37:  const safety = runCoachSafetyGate({ frame, graph, compiled, activatedConcepts: concepts.activated });
tests/coach/typeContracts.test.ts:3:import type { CompiledCoachFrame } from "../../lib/blundr/coachCompiler/types";
tests/coach/typeContracts.test.ts:187:  const compiledFrame: CompiledCoachFrame = {

$ npm run build

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...

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

$ npm run build (escalated rerun due sandbox Turbopack port restriction)

> blundr-v2-7-professional-repair@2.7.3 build
> next build

▲ Next.js 16.2.6 (Turbopack)

  Creating an optimized production build ...

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
✓ Compiled successfully in 7.7s
  Running TypeScript ...
  Finished TypeScript in 9.2s ...
  Collecting page data using 1 worker ...
  Generating static pages using 1 worker (0/3) ...
✓ Generating static pages using 1 worker (3/3) in 385ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/blundr-visual-model
├ ƒ /api/brain
└ ƒ /api/explorer


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand


# Package 9 Validation (post-escalated build)

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
