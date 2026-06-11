# BLUNDR Stage 1 Roadmap: Final Coaching Safety, Copy Quality, and UI Behavior Stabilization

**Project:** Blundr  
**Stage:** Stage 1 — Finish the Coaching Stage  
**Target checkpoint:** `checkpoint/v2.8.0-coaching-stage-stable`  
**Current prerequisite checkpoint:** `checkpoint/v2.8.0-provider-branch-continuation-stable`  
**Prepared for:** Adam / Blundr engineering handoff  
**Status:** Ready to execute after the provider / branch / continuation checkpoint is created.

---

## 0. Executive Summary

Stage 1 is the final stabilization pass for Blundr’s core coach experience before the project moves into broader MVP product work such as opening curriculum, review queue, onboarding, accounts, gamification, and mobile packaging.

The provider and continuation architecture is now functionally stable enough to checkpoint:

- Guided line reaches **Line Complete**.
- **Continue from Here** renders.
- Clicking **Continue from Here** enters continuation mode.
- Maia runs in-browser through the API client.
- Maia-selected moves are validated against the request FEN.
- Maia legal moves are applied once.
- Continuation candidates render after opponent replies.
- Candidate target, visual target, and coach target align.
- Terminal / checkmate positions end cleanly.
- Latest live diagnostics showed `criticalIssues: []`.
- Maia diagnostics showed `maiaRuntimeEnabled: true`, `maiaApiClientEnabled: true`, `maiaRuntimeStatus: ready`, `maiaProviderStatus: ready`, `maiaSelectedLegal: true`, and `maiaRuntimeCandidateLegal: true`.

Stage 1 now focuses on making the coach safe, polished, non-generic, and production-worthy.

The main goals are:

1. Remove false or noisy warnings that do not reflect real runtime failure.
2. Improve coach copy quality without allowing hallucinated chess claims.
3. Prevent generic or mismatched theme language.
4. Ensure Plain View never leaks the move before the user requests help.
5. Ensure Assisted View and Show More behavior are consistent and target-authoritative.
6. Ensure all visible coach text, visuals, and actions consume the same `CurrentInstructionFrame.target`.
7. Run full automated and manual QA.
8. Create the final coaching-stage checkpoint.

---

## 1. Current Known Stable Base

Before starting Stage 1, the following commits should already be present on:

```bash
codespace-improved-succotash-p7rq4759qpg6f7pgp
```

Known recent commits:

```txt
5096d10 Restore branch-complete controls at restricted line exhaustion
9865aae Validate Maia moves by request FEN and promote continuation targets
```

Expected provider / continuation checkpoint:

```bash
checkpoint/v2.8.0-provider-branch-continuation-stable
v2.8.0-provider-branch-continuation-stable
```

If that checkpoint has not yet been created, create it first:

```bash
git status --short

git checkout -b checkpoint/v2.8.0-provider-branch-continuation-stable
git push -u origin checkpoint/v2.8.0-provider-branch-continuation-stable

git tag v2.8.0-provider-branch-continuation-stable
git push origin v2.8.0-provider-branch-continuation-stable
```

This checkpoint means:

```txt
Branch complete works.
Continue from Here works.
Maia local runtime works in-browser.
Maia request-FEN legality works.
Continuation candidates render.
Targets align.
Terminal/checkmate completes cleanly.
No critical issues in the provider/continuation flow.
```

---

## 2. Stage 1 Definition of Done

Stage 1 is complete only when all of the following are true.

### 2.1 Debug Health

Expected live health:

```json
{
  "criticalIssues": [],
  "warnings": []
}
```

Acceptable temporary exception only during local development:

```json
{
  "criticalIssues": [],
  "warnings": ["maia_runtime_unavailable"]
}
```

That exception is acceptable only when Maia is intentionally disabled. It is not acceptable when testing the provider-stable local environment.

The warning below should not appear on terminal / non-user-turn / non-continuation-analysis frames:

```txt
stockfish_provider_unavailable
```

If Stockfish is genuinely unavailable on a user-turn continuation frame where a Stockfish candidate is required, the warning is legitimate. Otherwise it should be suppressed or downgraded.

### 2.2 Core Target Invariant

On every user-turn teaching frame:

```txt
instructionTargetUci === coachMoveUci === visualMoveUci === revealTargetUci
```

And:

```txt
instructionTargetPieceType === coachPieceType
```

If the frame is not a teaching frame, target fields may be null, but the UI must not invent a target.

### 2.3 CurrentInstructionFrame Authority

`CurrentInstructionFrame` remains the single source of truth for:

```txt
coach move
visible title/body move reference
visual arrow/highlight target
reveal button target
show-more target
plain-mode help target
```

No legacy resolver, expected-move fallback, cached candidate, Maia result, or Stockfish preview may directly drive visible UI without being promoted into `CurrentInstructionFrame.target`.

### 2.4 Assisted View Requirements

Assisted View must:

```txt
show the target move visually
show a short useful coach explanation
show source/destination highlights
show move arrow or equivalent visual
avoid legacy buttons
avoid stale target visuals
avoid debug labels
avoid raw technical labels
avoid hallucinated chess claims
```

Assisted View should not expose raw technical language such as:

```txt
Stockfish validated
verified_top2
top-two
engine_best
continuation_candidate_source
claim_validation_failed
safety fallback
```

Use user-facing language such as:

```txt
Verified
Blundr Brain
Recommended
Continue the position
Line complete
```

Debug/dev panels may still expose technical detail.

### 2.5 Plain View Requirements

Plain View must:

```txt
hide move arrows before user help
hide destination highlights before user help
hide the target move text before Show More
show only approved help actions
never leak the answer through visual layer
never leak the answer through coach title
never leak the answer through coach body
never leak the answer through button labels
```

Allowed Plain View actions:

```txt
Hint
Show More
```

Plain View should not render:

```txt
Reveal Move
Reveal More
Attack
Defense
Plan
Show Plan
Analyze Idea
legacy target buttons
```

After Show More, Plain View may reveal the same teaching content and visuals as Assisted View for the current target only.

### 2.6 Show More Parity

After the user clicks Show More in Plain View:

```txt
Plain View visible text === Assisted View teaching text for the same frame, or an approved Plain-mode equivalent.
Plain View visuals === Assisted View visuals for the same frame.
Show More target === CurrentInstructionFrame.target.
No stale previous move appears.
No next move appears.
```

### 2.7 Coach Copy Quality

Coach copy should be:

```txt
short
specific
piece-aware
move-aware
safe
non-hallucinated
human-readable
not generic when a specific fact is available
```

Bad examples to remove or reduce:

```txt
Active Piece Development
Avoid Blocking Center Pawn
Play O-O with the king; it improves king safety through Avoid Blocking Center Pawn.
Play Re1 with the rook; it improves your position through Avoid Blocking Center Pawn.
Play Bc4 with the bishop; it improves central control through Active Piece Development.
```

Better examples:

```txt
Play Nf3 with the knight. This develops a piece and supports the center.
Play Bc4 with the bishop. This develops toward an active diagonal.
Castle kingside. This brings your king to safety and connects the rooks.
Play Re1 with the rook. This places the rook behind the center pawn and supports future central play.
Play cxd5 with the pawn. This captures in the center and clarifies the pawn structure.
Play Bxh7+ with the bishop. This gives check and forces the king to respond.
Play Qh7#. This is checkmate.
```

When evidence is weak, use safe neutral fallback:

```txt
Play {SAN} with the {piece}. This develops play and keeps the position moving.
```

### 2.8 No Unsafe Claims

The coach must not make unsupported claims about:

```txt
center tension
winning material
tactical threats
king attack
forcing sequence
mate threat
opening advantage
long-term weakness
pawn break
piece trap
pin
skewer
fork
discovered attack
deflection
overload
```

unless evidence exists from board truth, move delta, validated motifs, Stockfish/engine evidence, or explicitly curated opening metadata.

### 2.9 Terminal Frames

Terminal frames must:

```txt
show Line complete
not show Continue from Here if the game is checkmate/stalemate/terminal
not show Stockfish unavailable as a warning if no candidate is required
not show Maia unavailable if no opponent reply is required
not show target visuals
not show stale previous target
```

Terminal checkmate copy:

```txt
Line complete
This continuation ended in checkmate. Restart the line or train it again.
```

---

## 3. Stage 1 Scope

Stage 1 includes:

```txt
debug warning cleanup
coach safety cleanup
coach copy quality cleanup
plain view no-leak enforcement
assisted/show-more parity
final target authority checks
final QA/test package
final coaching-stage checkpoint
```

Stage 1 does not include:

```txt
new opening curriculum
review queue
spaced repetition
onboarding
accounts
database persistence
gamification
payments
App Store packaging
major redesign
new chess engine architecture
new Maia architecture
new Stockfish architecture
```

---

## 4. Architecture Rules That Must Not Be Broken

### 4.1 Single Visible Authority

All visible user-turn teaching outputs must come from:

```txt
CurrentInstructionFrame.target
```

Do not allow these to directly drive visible UI unless promoted into the frame:

```txt
expectedMove
selectedCandidate
selectedContinuationCandidate
enginePreviewBestMove
maiaSelectedMove
legacyRecoverableCandidate
openingTree fallback
cached visual recipe
```

### 4.2 Continuation Flow

Correct flow:

```txt
Guided line complete
→ Branch-complete surface
→ User clicks Continue from Here
→ trainingMode = continuation
→ if opponent to move, Maia replies
→ if user to move, Stockfish / continuation resolver selects candidate
→ effectiveContinuationCandidate is promoted into CurrentInstructionFrame.target
→ CoachCard and board visuals render the same target
→ user plays target
→ repeat until terminal or stop condition
```

### 4.3 Maia Role

Maia is opponent-context only.

Maia must not:

```txt
touch instruction target
touch visible surface
touch coach copy
touch rating badge
touch branch complete
directly generate user teaching moves
```

Maia may:

```txt
select opponent replies in continuation mode
provide opponent-like play
record candidate metadata
record request/apply FEN
```

### 4.4 Stockfish Role

Stockfish may:

```txt
validate or rank continuation user moves
provide a user-turn continuation target
support safety gating
```

Stockfish should not be required on:

```txt
terminal frames
branch-complete frames before Continue from Here
opponent-turn frames
restricted guided frames with known target
plain UI rendering before Show More
```

---

## 5. Implementation Roadmap

## Phase 1.0 — Create and Confirm Provider/Continuation Checkpoint

### Goal

Lock the current known-good continuation system before changing copy or UI behavior.

### Commands

```bash
git status --short
git log --oneline -5
```

Confirm current branch:

```bash
git branch --show-current
```

Expected:

```txt
codespace-improved-succotash-p7rq4759qpg6f7pgp
```

Create checkpoint:

```bash
git checkout -b checkpoint/v2.8.0-provider-branch-continuation-stable
git push -u origin checkpoint/v2.8.0-provider-branch-continuation-stable

git tag v2.8.0-provider-branch-continuation-stable
git push origin v2.8.0-provider-branch-continuation-stable
```

Return to working branch if needed:

```bash
git checkout codespace-improved-succotash-p7rq4759qpg6f7pgp
```

### Acceptance Criteria

```txt
checkpoint branch exists on origin
tag exists on origin
working branch unchanged
no runtime files committed
```

Do not commit:

```txt
.runtime
.maia
.next
node_modules
review bundles
zip/tgz archives
```

---

## Phase 1.1 — Suppress False Provider Warnings on Non-Relevant Frames

### Problem

Latest live health showed:

```txt
criticalIssues: []
warnings:
- stockfish_provider_unavailable
```

But the active frame was terminal/checkmate:

```txt
trainerPhase: terminal
trainingMode: continuation
isUserTurn: false
continuationRuntimeStatus: terminal
continuationTerminalReason: checkmate
legalMoveCount: 0
```

On this frame Stockfish is not needed. The warning is noisy and should not block Stage 1.

### Required Behavior

Emit `stockfish_provider_unavailable` only when:

```txt
trainingMode === continuation
isUserTurn === true
trainerPhase === ready_for_user
continuationRuntimeStatus is analyzing/candidate_required
no effective candidate exists
Stockfish is required to resolve a user continuation target
Stockfish provider is actually unavailable
```

Do not emit it when:

```txt
trainerPhase === terminal
continuationRuntimeStatus === terminal
continuationTerminalReason exists
isUserTurn === false
legalMoveCount === 0
branch_complete frame
restricted guided frame
opponent_replying frame
```

### Likely Files

Inspect before editing:

```txt
lib/blundr/debug/trainerDebugSnapshot.ts
lib/blundr/runtime/continuationRuntimeState.ts
app/page.tsx
```

### Test to Add

```txt
tests/coach/stockfishProviderWarningScope.test.ts
```

### Test Cases

#### Case 1 — Terminal continuation frame

Input:

```txt
trainingMode: continuation
trainerPhase: terminal
continuationRuntimeStatus: terminal
continuationTerminalReason: checkmate
isUserTurn: false
stockfish provider unavailable
```

Assert:

```txt
warnings does not include stockfish_provider_unavailable
criticalIssues []
```

#### Case 2 — Opponent-turn continuation frame

Input:

```txt
trainingMode: continuation
trainerPhase: opponent_replying
isUserTurn: false
stockfish provider unavailable
```

Assert:

```txt
warnings does not include stockfish_provider_unavailable
```

#### Case 3 — Branch-complete frame

Input:

```txt
trainingMode: restricted
visibleSurfaceMode: branch_complete
continueFromHereButtonRendered true
stockfish provider unavailable
```

Assert:

```txt
warnings does not include stockfish_provider_unavailable
```

#### Case 4 — User-turn continuation needs Stockfish

Input:

```txt
trainingMode: continuation
trainerPhase: ready_for_user
isUserTurn: true
continuationRuntimeStatus: analyzing
effectiveContinuationCandidateUci null
stockfish provider unavailable
```

Assert:

```txt
warnings includes stockfish_provider_unavailable
```

### Validation

```bash
npm run build
node --import tsx tests/coach/stockfishProviderWarningScope.test.ts
node --import tsx tests/coach/stockfishTargetPromotion.test.ts
node --import tsx tests/coach/stockfishReadyNoSafetyBlocked.test.ts
node --import tsx tests/coach/stockfishValidationGate.test.ts
```

---

## Phase 1.2 — Clean Coach Theme Selection and User-Facing Titles

### Problem

Several visible titles are technically safe but product-poor:

```txt
Active Piece Development
Avoid Blocking Center Pawn
```

Examples of awkward pairings:

```txt
O-O — Avoid Blocking Center Pawn
Re1 — Avoid Blocking Center Pawn
Bc4 — Active Piece Development
Nxe5 — Avoid Blocking Center Pawn
```

These make the coach feel generic and can undermine user trust.

### Required Behavior

Visible titles should be based on concrete, move-specific facts.

Preferred title patterns:

```txt
{SAN} — Develop the {piece}
{SAN} — Challenge the center
{SAN} — Castle to safety
{SAN} — Capture in the center
{SAN} — Give check
{SAN} — Checkmate
{SAN} — Continue the position
```

Allowed thematic titles only when evidence supports them:

```txt
Develop the knight
Develop the bishop
Castle to safety
Support the center
Challenge the center
Capture in the center
Give check
Finish with checkmate
Improve the position
Continue the position
```

Avoid abstract or system-generated category names:

```txt
Active Piece Development
Avoid Blocking Center Pawn
Stable Continuation
Central Pawn Advance
Capture Or Recapture
Minor Piece Development
```

Those may remain internal debug labels but should not be visible as polished copy.

### Likely Files

Inspect before editing:

```txt
lib/blundr/explanation/*
lib/blundr/coachCompiler/*
lib/blundr/coachBrain/*
lib/blundr/presentation/visibleTeachingSurface.ts
lib/blundr/safety/*
app/page.tsx
```

### Implementation Guidance

Create or update a user-facing title normalizer.

Possible helper:

```txt
normalizeUserFacingCoachTitle({
  san,
  piece,
  moveFacts,
  evidenceTags,
  isCapture,
  isCheck,
  isCheckmate,
  isCastle,
  sourceTheme
})
```

Priority:

```txt
1. Checkmate
2. Check
3. Castle
4. Capture
5. Development
6. Central pawn move / center challenge
7. Safe continuation fallback
```

Example mapping:

```txt
isCheckmate -> "{SAN} — Checkmate"
isCheck -> "{SAN} — Give check"
isCastle -> "Castle to safety"
isCapture && central square -> "{SAN} — Capture in the center"
isCapture -> "{SAN} — Capture material"
minor piece development -> "{SAN} — Develop the {piece}"
pawn move to e4/d4/c4/f4/e5/d5 -> "{SAN} — Challenge the center"
fallback -> "{SAN} — Continue the position"
```

### Tests to Add

```txt
tests/coach/userFacingCoachTitleQuality.test.ts
```

### Test Cases

Assert no visible title contains:

```txt
Active Piece Development
Avoid Blocking Center Pawn
Stable Continuation
Minor Piece Development
Capture Or Recapture
```

For representative moves:

```txt
e4 -> e4 — Challenge the center
Nf3 -> Nf3 — Develop the knight
Bc4 -> Bc4 — Develop the bishop
O-O -> Castle to safety OR O-O — Castle to safety
Re1 -> Re1 — Improve the position OR Re1 — Support central play
cxd5 -> cxd5 — Capture in the center
Bxh7+ -> Bxh7+ — Give check
Qh7# -> Qh7# — Checkmate
```

### Validation

```bash
npm run build
node --import tsx tests/coach/userFacingCoachTitleQuality.test.ts
```

---

## Phase 1.3 — Reduce Claim-Validation Fallback Overuse

### Problem

Many good frames are falling back because claim validation fails:

```txt
runtimeSafeFallbackUsed: true
runtimeSafeFallbackReason: claim_validation_failed
```

Fallback is safe, but excessive fallback makes the coach feel generic.

### Required Behavior

The system should distinguish between:

```txt
unsafe claim
unsupported strong claim
minor phrasing issue
missing optional evidence
safe generic fallback needed
safe specific fallback possible
```

If a strong claim fails, do not discard all specificity. Preserve verified low-risk facts:

```txt
SAN
piece
source square
destination square
capture
check
checkmate
castle
development
central pawn movement
```

### Example

Bad current fallback:

```txt
Play Re1 with the rook. This develops play and keeps the position moving.
```

Better safe fallback:

```txt
Play Re1 with the rook. This brings the rook to an active central file.
```

Only use that if file/rook fact is verified. Otherwise:

```txt
Play Re1 with the rook. This improves your piece placement.
```

### Claim Safety Tiers

#### Tier 0 — Always safe if board truth confirms

```txt
piece name
SAN
UCI
source square
destination square
capture
check
checkmate
castle
promotion
en passant
```

#### Tier 1 — Safe if simple board delta confirms

```txt
develops knight/bishop from back rank
moves pawn into center
captures in center
moves rook to open/semi-open file if verified
connects rooks after castling if verified
```

#### Tier 2 — Requires evidence tags or engine/curated support

```txt
creates a threat
wins material
traps a piece
weakens dark squares
builds kingside attack
prevents counterplay
improves long-term structure
prepares a pawn break
increases advantage
```

#### Tier 3 — Never render unless explicitly curated or engine-backed

```txt
winning
decisive
forced
only move
best move
crushing
guarantees
unstoppable
```

### Likely Files

Inspect before editing:

```txt
lib/blundr/safety/strongClaimPolicy.ts
lib/blundr/safety/safeFallbackFrame.ts
lib/blundr/explanation/*
lib/blundr/coachCompiler/*
lib/blundr/debug/trainerDebugSnapshot.ts
```

### Tests to Add

```txt
tests/coach/claimValidationSpecificFallback.test.ts
```

### Test Cases

#### Case 1 — Unsupported strong claim

Input claim:

```txt
This wins material next move.
```

No tactical evidence.

Assert:

```txt
strong claim blocked
visible text does not include wins material
visible text keeps SAN and piece
runtimeSafeFallbackUsed true
runtimeSafeFallbackReason unsupported_strong_claim or claim_validation_failed
criticalIssues []
```

#### Case 2 — Verified check

Move gives check.

Assert:

```txt
visible text may say This gives check.
not replaced by generic fallback
```

#### Case 3 — Verified checkmate

Move is mate.

Assert:

```txt
visible text says checkmate
not replaced by generic fallback
```

#### Case 4 — Castle

Move is castle.

Assert:

```txt
visible text says king safety/castle
does not say Avoid Blocking Center Pawn
```

---

## Phase 1.4 — Fix Remaining Unsafe Template / Unverified Claim Path

### Historical Issues to Confirm Gone

Earlier health showed:

```txt
unsafe_template_rendered
unverified_center_tension_claim
reveal_target_source_mismatch
```

The latest run did not show these, but Stage 1 should include tests that prevent regression.

### Required Behavior

If a template is unsafe:

```txt
do not render it
replace with safe teaching copy
record runtimeSafeFallbackUsed true
record runtimeSafeFallbackReason
do not emit unsafe_template_rendered after recovery
```

For center claims, only allow if evidence exists:

```txt
central pawn move
central capture
center_control evidence tag
center_tension evidence tag
pawn_break evidence tag
central_contact board delta
curated concept metadata
```

Do not say:

```txt
challenges the center
creates center tension
opens the center
prepares the central break
```

unless supported.

### Tests to Preserve / Add

```txt
tests/coach/unsafeTemplateFallback.test.ts
tests/coach/unverifiedCenterTensionClaim.test.ts
tests/coach/revealTargetSourceContract.test.ts
```

### Validation

```bash
node --import tsx tests/coach/unsafeTemplateFallback.test.ts
node --import tsx tests/coach/unverifiedCenterTensionClaim.test.ts
node --import tsx tests/coach/revealTargetSourceContract.test.ts
```

---

## Phase 1.5 — Plain View No-Leak Enforcement

### Problem

Plain View must be a true recall mode.

No target should leak through:

```txt
visual arrows
square highlights
coach title
coach body
button labels
debug-derived UI
automatic hint
automatic Show More
legacy reveal button
```

### Required Behavior Before Help

On a user-turn frame in Plain View before help:

```txt
instructionTarget exists internally
visible coach does not reveal SAN
visible coach does not reveal UCI
visible board does not show source/destination
visible board does not show move arrow
visible buttons: Hint, Show More only
hintShown false
answerShown false
showMore false
```

### Required Behavior After Hint

Hint may reveal a non-answer clue:

```txt
piece type
general idea
maybe source area if intentionally allowed
```

Hint must not reveal:

```txt
SAN
UCI
destination square
full arrow
exact move text
```

Example:

```txt
Look for a developing move with a minor piece.
```

Not:

```txt
Move the knight to f3.
```

### Required Behavior After Show More

Show More may reveal:

```txt
same target move as Assisted View
same safe coach text
same target visuals
```

It must use:

```txt
CurrentInstructionFrame.target
```

### Likely Files

Inspect before editing:

```txt
app/page.tsx
components/coach/CoachCard.tsx
components/board/TeachingOverlay.tsx
components/board/VisualRecipeLayer.tsx
lib/blundr/presentation/visibleTeachingSurface.ts
lib/blundr/presentation/visibleActionPolicy.ts
lib/blundr/debug/trainerDebugSnapshot.ts
```

### Tests to Add

```txt
tests/coach/plainViewNoLeakBeforeShowMore.test.ts
tests/coach/plainViewShowMoreParity.test.ts
tests/coach/plainViewAllowedButtons.test.ts
```

### Test Cases

#### Case 1 — Plain before help

Assert:

```txt
no visualMoveUci rendered
no renderedRevealTargetUci
no SAN in visible title/body
no UCI in visible title/body
buttons exactly Hint + Show More
no Reveal Move
no Attack/Defense/Plan
```

#### Case 2 — Plain hint only

Assert:

```txt
hint appears
hint does not contain SAN
hint does not contain UCI
hint does not contain destination square
visuals remain hidden
```

#### Case 3 — Plain Show More

Assert:

```txt
visible target equals CurrentInstructionFrame.target
visual target equals CurrentInstructionFrame.target
coach move equals CurrentInstructionFrame.target
rendered text matches assisted equivalent or approved equivalent
```

#### Case 4 — Frame transition

Assert:

```txt
hint resets on new frame
showMore resets on new frame
old target visuals do not persist
```

---

## Phase 1.6 — Assisted View Button and Surface Cleanup

### Required Assisted View Behavior

Assisted View should not show legacy or redundant buttons.

Remove or suppress:

```txt
Hint
Show Plan
Analyze Idea
Attack
Defense
Plan
Reveal Move when the move is already visible
Reveal More
```

Assisted View can show:

```txt
Continue from Here only on branch-complete frame
Restart Line / Train Again when appropriate
```

In Assisted View, if the move is already shown by the coach and board visuals, a "Reveal Move" button is redundant and should not appear.

### Tests to Add

```txt
tests/coach/assistedViewNoLegacyButtons.test.ts
tests/coach/assistedViewNoRedundantReveal.test.ts
```

### Assertions

On normal assisted teaching frame:

```txt
buttons should not include hint
buttons should not include show_plan
buttons should not include analyze_idea
buttons should not include attack
buttons should not include defense
buttons should not include plan
buttons should not include reveal_move
```

On branch-complete frame:

```txt
buttons include continue_from_here
buttons include restart_line or train_again
```

On terminal frame:

```txt
buttons include restart_line or train_again
buttons do not include continue_from_here if terminal/checkmate
```

---

## Phase 1.7 — Continuation Transient State Cleanup

### Problem

Live timelines show brief transitions:

```txt
Opponent is replying
Finding a continuation
Continuation candidate
```

This is expected, but must not become sticky or misleading.

### Required Behavior

Short transient states are acceptable if:

```txt
they last only while async provider/analysis is pending
they are replaced by candidate frame when target is ready
they do not emit critical issues
they do not leak stale target
they do not show wrong side-to-move copy
```

User-turn frame should not remain:

```txt
visibleTitle: Opponent is replying
isUserTurn: true
```

for longer than the analysis transition window.

If debug captures a transient frame, it may show `Opponent is replying` briefly, but the final stable user-turn frame must be:

```txt
instructionKind: continuation_candidate
instructionTargetUci: non-null
visibleTitle: {SAN} — Continue the position
targetAligned: true
visualTargetAligned: true
```

### Tests to Add / Preserve

```txt
tests/coach/continuationTransientStateContract.test.ts
tests/coach/maiaThenStockfishContinuationPromotion.test.ts
tests/coach/stockfishReadyNoSafetyBlocked.test.ts
```

### Assertions

```txt
candidate_ready outranks analyzing once effective candidate exists
candidate_ready outranks transitioning once effective candidate exists
opponent_replying cannot persist on stable user-turn candidate frame
```

---

## Phase 1.8 — Visual Recipe Quality and Target Alignment

### Required Behavior

Visuals must be target-specific and not stale.

On teaching frames:

```txt
visualRecipeMoveUci === instructionTargetUci
visualMoveUci === instructionTargetUci
renderedVisualPrimitiveCount > 0 in Assisted View
renderedVisualPrimitiveCount === 0 in Plain View before Show More
```

On non-teaching frames:

```txt
no target visuals
no stale prior target
```

On terminal frames:

```txt
no target visuals
```

### Tests to Add / Preserve

```txt
tests/coach/visualTargetAlignmentContract.test.ts
tests/coach/terminalNoStaleVisualTarget.test.ts
tests/coach/plainViewNoLeakBeforeShowMore.test.ts
```

### Assertions

```txt
previousSelectedCandidateUci may exist in debug
but visualMoveUci must be null unless current frame has target
staleSelectedCandidateDetected false or cleared
overlayFrameMatchesTrainerFrame true
visualTargetMatchesInstructionTarget true on teaching frames
```

---

## Phase 1.9 — Debug Panel Truthfulness

### Goal

The debug panel should distinguish between:

```txt
real blockers
acceptable transient states
terminal states
provider-required states
provider-not-required states
```

### Required Cleanup

Health categories should be meaningful:

```txt
Visual
Coach
Actions
Continuation
Maia
Legacy
Cache
```

Do not mark provider unavailable as warn when the provider is irrelevant.

Do not show `unknown` as fail. Unknown is acceptable when not applicable, but debug should prefer:

```txt
not_applicable
not_required
terminal
opponent_turn
branch_complete
```

over ambiguous:

```txt
unknown
```

### Likely File

```txt
lib/blundr/debug/trainerDebugSnapshot.ts
```

### Tests to Add

```txt
tests/coach/debugHealthFrameRelevance.test.ts
```

### Test Cases

```txt
terminal frame -> provider warnings suppressed
branch_complete -> Stockfish/Maia warnings suppressed
opponent_replying -> Stockfish warning suppressed
user-turn continuation requiring analysis -> Stockfish warning allowed
Maia disabled intentionally -> Maia warning only if continuation opponent reply needed
```

---

## Phase 1.10 — Final Automated Test Package

After implementing Phase 1 fixes, run:

```bash
npm run build
```

Then run targeted tests:

```bash
node --import tsx tests/coach/stockfishProviderWarningScope.test.ts
node --import tsx tests/coach/userFacingCoachTitleQuality.test.ts
node --import tsx tests/coach/claimValidationSpecificFallback.test.ts
node --import tsx tests/coach/unsafeTemplateFallback.test.ts
node --import tsx tests/coach/unverifiedCenterTensionClaim.test.ts
node --import tsx tests/coach/revealTargetSourceContract.test.ts
node --import tsx tests/coach/plainViewNoLeakBeforeShowMore.test.ts
node --import tsx tests/coach/plainViewShowMoreParity.test.ts
node --import tsx tests/coach/plainViewAllowedButtons.test.ts
node --import tsx tests/coach/assistedViewNoLegacyButtons.test.ts
node --import tsx tests/coach/assistedViewNoRedundantReveal.test.ts
node --import tsx tests/coach/continuationTransientStateContract.test.ts
node --import tsx tests/coach/visualTargetAlignmentContract.test.ts
node --import tsx tests/coach/terminalNoStaleVisualTarget.test.ts
node --import tsx tests/coach/debugHealthFrameRelevance.test.ts
```

Run existing core tests:

```bash
node --import tsx tests/coach/restrictedLineExhaustedBranchCompleteButtons.test.ts
node --import tsx tests/coach/maiaLegalityRequestFenContract.test.ts
node --import tsx tests/coach/maiaThenStockfishContinuationPromotion.test.ts
node --import tsx tests/coach/continuationFlow.test.ts
node --import tsx tests/coach/continuationFlowStability.test.ts
node --import tsx tests/coach/stockfishTargetPromotion.test.ts
node --import tsx tests/coach/stockfishReadyNoSafetyBlocked.test.ts
node --import tsx tests/coach/stockfishValidationGate.test.ts
node --import tsx tests/coach/maiaContinuationProvider.test.ts
node --import tsx tests/coach/maiaRuntimeAdapter.test.ts
node --import tsx tests/coach/maiaApiRoute.test.ts
```

Run related loop:

```bash
for f in $(find tests/coach -maxdepth 1 -type f \( \
  -name "*coach*.test.ts" -o \
  -name "*copy*.test.ts" -o \
  -name "*claim*.test.ts" -o \
  -name "*safety*.test.ts" -o \
  -name "*plain*.test.ts" -o \
  -name "*assisted*.test.ts" -o \
  -name "*visual*.test.ts" -o \
  -name "*continuation*.test.ts" -o \
  -name "*branch*.test.ts" -o \
  -name "*restricted*.test.ts" -o \
  -name "*stockfish*.test.ts" -o \
  -name "*maia*.test.ts" -o \
  -name "*debug*.test.ts" \
\) | sort); do
  echo "Running $f"
  node --import tsx "$f" || exit 1
done
```

---

## Phase 1.11 — Manual QA Script

Start with clean dev server:

```bash
pkill -f "next dev" || true
lsof -i :3000 || true
lsof -i :3001 || true
```

Export Maia environment:

```bash
export MAIA_ENABLED=true
export NEXT_PUBLIC_MAIA_API_ENABLED=true
export MAIA_LC0_PATH="$PWD/.runtime/lc0/build/release/lc0"
export MAIA_WEIGHTS_PATH="$PWD/.maia/maia-1500.pb.gz"
export MAIA_SKILL_LEVEL=maia-1500
export MAIA_TIMEOUT_MS=3000
export MAIA_NODES=1
```

Verify:

```bash
env | grep -E "MAIA|NEXT_PUBLIC_MAIA" | sort
npm run maia:check
npm run maia:bench
npm run dev
```

Open:

```txt
http://localhost:3000/?debug=1
```

### Manual Test A — Assisted Guided Line

1. Start fresh board.
2. Stay in Assisted View.
3. Play through the guided line.
4. Confirm every user-turn frame has:
   - visible move
   - board visual
   - no legacy buttons
   - no Safety Blocked
   - no piece mismatch
   - no target mismatch
5. Confirm awkward visible titles are gone:
   - no Active Piece Development
   - no Avoid Blocking Center Pawn

Expected:

```txt
criticalIssues: []
warnings: []
```

### Manual Test B — Branch Complete

1. Reach end of restricted line.
2. Confirm:
   - Line complete card appears.
   - Continue from Here button appears.
   - Restart Line / Train Again appears.
   - No target is shown.
   - No Stockfish warning.
   - No Maia warning unless relevant.

Expected:

```txt
visibleSurfaceMode: branch_complete
continueFromHereButtonRendered: true
criticalIssues: []
warnings: []
```

### Manual Test C — Continue from Here

1. Click Continue from Here.
2. If opponent to move, confirm Maia replies.
3. If user to move, confirm continuation analysis runs.
4. Confirm candidate appears.

Expected:

```txt
trainingMode: continuation
userExplicitlyEnteredContinuation: true
maiaRuntimeStatus: ready
maiaProviderStatus: ready
maiaSelectedLegal: true
continuation candidate appears
targetAligned: true
visualTargetAligned: true
```

### Manual Test D — Terminal

1. Continue until checkmate or terminal.
2. Confirm:
   - Line complete terminal card appears.
   - No Continue from Here if terminal.
   - No stale visual.
   - No Stockfish warning.
   - No Maia warning.
   - No critical issues.

Expected:

```txt
trainerPhase: terminal
visibleTitle: Line complete
visibleButtons: restart_line or train_again
criticalIssues: []
warnings: []
```

### Manual Test E — Plain View Before Help

1. Restart line.
2. Switch to Plain View.
3. On user-turn frame before help, confirm:
   - no arrows
   - no highlighted target square
   - no SAN in title/body
   - no UCI in title/body
   - only Hint and Show More actions
   - no automatic hint
   - no Reveal Move button

Expected:

```txt
noPlainLeak: true
noPlainLeakFromSurface: true
renderedVisualPrimitiveCount: 0
visibleButtons: Hint, Show More
```

### Manual Test F — Plain View Hint

1. Click Hint.
2. Confirm:
   - hint helps but does not reveal exact move
   - no destination square if that would reveal answer
   - no move arrow
   - no SAN
   - no UCI

### Manual Test G — Plain View Show More

1. Click Show More.
2. Confirm:
   - move is now revealed
   - visuals appear
   - visual target equals instruction target
   - coach text equals or matches Assisted equivalent
   - no stale previous target

Expected:

```txt
showMoreTargetUci === instructionTargetUci
visualMoveUci === instructionTargetUci
coachMoveUci === instructionTargetUci
```

---

## Phase 1.12 — Commit Stage 1 Fixes

Review status:

```bash
git status --short
```

Do not stage everything blindly.

Stage only relevant files. Example:

```bash
git add app/page.tsx
git add lib/blundr
git add components
git add tests/coach
```

Do not commit:

```txt
.runtime
.maia
.next
node_modules
review bundles
zip files
tgz files
```

Commit:

```bash
git commit -m "Complete coaching safety and copy quality stabilization"
git push origin codespace-improved-succotash-p7rq4759qpg6f7pgp
```

---

## Phase 1.13 — Create Final Coaching Stage Checkpoint

After automated and manual QA pass:

```bash
git status --short

git checkout -b checkpoint/v2.8.0-coaching-stage-stable
git push -u origin checkpoint/v2.8.0-coaching-stage-stable

git tag v2.8.0-coaching-stage-stable
git push origin v2.8.0-coaching-stage-stable
```

This checkpoint means:

```txt
The coach stage is stable.
The provider flow is stable.
Maia works locally in-browser.
Stockfish warnings are relevant and scoped.
Assisted View is clean.
Plain View is leak-free.
Show More parity works.
Coach copy is safer and less generic.
No critical issues.
No misleading warnings.
No stale targets.
No legacy UI bypass.
```

---

## 6. Codex Agent Plan

Stage 1 can be executed by focused agents. Do not ask one agent to do everything at once.

### Agent 1 — Debug Warning Scope Agent

Scope:

```txt
Suppress false stockfish_provider_unavailable warning.
Clean warning relevance logic.
Add stockfishProviderWarningScope.test.ts.
Add debugHealthFrameRelevance.test.ts.
```

Do not modify:

```txt
coach copy
Plain View
Maia runtime
Stockfish worker setup
```

### Agent 2 — Coach Copy Quality Agent

Scope:

```txt
Normalize visible titles.
Remove Active Piece Development and Avoid Blocking Center Pawn from user-facing copy.
Improve safe low-risk copy.
Add userFacingCoachTitleQuality.test.ts.
```

Do not modify:

```txt
provider runtime
continuation target promotion
Plain View behavior
```

### Agent 3 — Claim Safety Agent

Scope:

```txt
Reduce fallback overuse.
Preserve verified facts.
Block unsupported strong claims.
Add claimValidationSpecificFallback.test.ts.
Preserve unsafeTemplateFallback and unverifiedCenterTension tests.
```

Do not modify:

```txt
visual UI
buttons
provider setup
```

### Agent 4 — Plain/Assisted UI Contract Agent

Scope:

```txt
Plain View no leak.
Show More parity.
Assisted View button cleanup.
No redundant Reveal Move in Assisted.
Add Plain and Assisted button tests.
```

Do not modify:

```txt
coach claim engine
Maia/Stockfish providers
```

### Agent 5 — Final Integration QA Agent

Scope:

```txt
Run full automated test suite.
Run manual browser QA checklist.
Fix only integration regressions.
Prepare final checkpoint.
```

---

## 7. Codex Prompt for Stage 1

Use this prompt after creating the provider/continuation checkpoint.

```md
You are continuing Blundr on branch:

codespace-improved-succotash-p7rq4759qpg6f7pgp

Current stable base:
- Branch-complete flow works.
- Continue from Here works.
- Maia works in-browser through API client.
- Maia legality is validated against request FEN.
- Continuation candidates promote and render.
- Terminal/checkmate completes.
- Latest live debug showed criticalIssues: [].
- Maia showed ready and legal.
- Remaining issue is Stage 1 polish: warning scope, coach copy quality, Plain/Assisted contracts, final safety.

Target checkpoint:
checkpoint/v2.8.0-coaching-stage-stable

Non-negotiable architecture:
CurrentInstructionFrame.target is the single source of truth for all visible teaching targets.

On every user-turn teaching frame:
instructionTargetUci === coachMoveUci === visualMoveUci === revealTargetUci
instructionTargetPieceType === coachPieceType

Do not modify:
- Maia runtime setup
- Stockfish worker setup
- continuation target promotion architecture
- branch-complete flow
- provider environment
- account/onboarding/review queue/gamification

Stage 1 tasks:

1. Suppress false stockfish_provider_unavailable warning on irrelevant frames:
- terminal
- checkmate
- non-user-turn
- opponent_replying
- branch_complete
- restricted guided frames
Only warn when Stockfish is actually required for a user-turn continuation target and unavailable.

2. Improve user-facing coach titles:
Remove or suppress visible:
- Active Piece Development
- Avoid Blocking Center Pawn
- Stable Continuation
- Minor Piece Development
- Capture Or Recapture
Use safer titles:
- {SAN} — Develop the knight
- {SAN} — Develop the bishop
- Castle to safety
- {SAN} — Challenge the center
- {SAN} — Capture in the center
- {SAN} — Give check
- {SAN} — Checkmate
- {SAN} — Continue the position

3. Reduce claim-validation fallback overuse:
When strong claims fail, preserve verified low-risk facts:
- SAN
- piece
- capture
- check
- checkmate
- castle
- central pawn move if verified
- simple development if verified
Do not render unsupported strong claims.

4. Preserve existing safety:
- unsafe templates must not render
- unverified center tension claims must not render
- reveal target source must match CurrentInstructionFrame authority

5. Plain View:
Before help:
- no arrows
- no target square highlights
- no SAN/UCI in visible title/body
- only Hint and Show More
- no Reveal Move
- no automatic hint
After Hint:
- no exact move leak
After Show More:
- same target and equivalent visuals/text as Assisted for CurrentInstructionFrame.target

6. Assisted View:
- no legacy buttons
- no Hint/Show Plan/Analyze Idea/Attack/Defense/Plan
- no redundant Reveal Move when move is already visible
- branch-complete shows Continue from Here + Restart/Train Again
- terminal shows Restart/Train Again only

7. Add or update tests:
- tests/coach/stockfishProviderWarningScope.test.ts
- tests/coach/debugHealthFrameRelevance.test.ts
- tests/coach/userFacingCoachTitleQuality.test.ts
- tests/coach/claimValidationSpecificFallback.test.ts
- tests/coach/plainViewNoLeakBeforeShowMore.test.ts
- tests/coach/plainViewShowMoreParity.test.ts
- tests/coach/plainViewAllowedButtons.test.ts
- tests/coach/assistedViewNoLegacyButtons.test.ts
- tests/coach/assistedViewNoRedundantReveal.test.ts
- tests/coach/continuationTransientStateContract.test.ts
- tests/coach/visualTargetAlignmentContract.test.ts
- tests/coach/terminalNoStaleVisualTarget.test.ts

8. Preserve and rerun existing tests:
- restrictedLineExhaustedBranchCompleteButtons
- maiaLegalityRequestFenContract
- maiaThenStockfishContinuationPromotion
- continuationFlow
- continuationFlowStability
- stockfishTargetPromotion
- stockfishReadyNoSafetyBlocked
- stockfishValidationGate
- unsafeTemplateFallback
- unverifiedCenterTensionClaim
- revealTargetSourceContract

Validation:
npm run build

Then run all relevant tests in tests/coach. If a named new test already exists, update it. If not, create it.

Manual QA:
Start dev with Maia enabled.
Open http://localhost:3000/?debug=1.
Test Assisted guided line, Branch Complete, Continue from Here, continuation candidate flow, terminal checkmate, Plain View before help, Hint, and Show More.

Final expected live health:
criticalIssues: []
warnings: []

Commit:
git add app/page.tsx lib/blundr components tests/coach
git commit -m "Complete coaching safety and copy quality stabilization"
git push origin codespace-improved-succotash-p7rq4759qpg6f7pgp

Do not commit:
.runtime
.maia
.next
node_modules
zip/tgz bundles
```

---

## 8. Stage 1 Risk Register

### Risk 1 — Copy Quality Fix Breaks Safety

Mitigation:

```txt
Keep safety gates first.
Normalize only visible titles/body after safety validation.
Never allow unsupported claims to render.
```

### Risk 2 — Plain View Accidentally Leaks Target

Mitigation:

```txt
Plain View no-leak tests must inspect title/body/buttons/visuals.
Use CurrentInstructionFrame internally but suppress visible target until Show More.
```

### Risk 3 — Warning Suppression Hides Real Provider Failure

Mitigation:

```txt
Suppress warnings only when provider is not required.
Keep warnings on user-turn continuation frames requiring provider output.
```

### Risk 4 — Assisted Button Cleanup Removes Branch Buttons

Mitigation:

```txt
Separate normal teaching frame buttons from branch-complete/terminal actions.
Add tests for branch-complete and terminal buttons.
```

### Risk 5 — Fallback Reduction Reintroduces Hallucination

Mitigation:

```txt
Use evidence tiers.
Only preserve verified low-risk facts.
Block Tier 2/Tier 3 claims unless supported.
```

---

## 9. Handoff Summary for the Next Engineer

The app has crossed the hardest architecture barrier: branch completion, continuation entry, Maia replies, Stockfish/continuation candidates, candidate promotion, and terminal handling now work in live debug with no critical issues.

Do not rebuild provider architecture.

Do not rebuild continuation architecture.

Stage 1 is now a polish and safety stabilization pass. The main job is to make the visible coach experience production-worthy:

```txt
less generic
more specific
no hallucinated claims
no answer leaks
no legacy buttons
no false warnings
clean final health
```

The stage is complete when the final live debug shows:

```json
{
  "criticalIssues": [],
  "warnings": []
}
```

and manual QA confirms:

```txt
Assisted View clean
Plain View leak-free
Show More parity works
Branch Complete works
Continue from Here works
Maia works
Continuation candidates render
Terminal completes
No Safety Blocked
No stale target
No legacy bypass
```

After Stage 1 is checkpointed as:

```txt
checkpoint/v2.8.0-coaching-stage-stable
```

the project can move to Stage 2:

```txt
Opening curriculum and content system
```

Then Stage 3:

```txt
Blundr Review Queue and spaced repetition
```

Then Stage 4:

```txt
Onboarding
```

Then Stage 5:

```txt
Accounts and persistence
```
