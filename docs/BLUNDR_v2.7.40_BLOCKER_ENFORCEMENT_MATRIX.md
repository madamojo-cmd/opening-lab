# BLUNDR v2.7.40 BLOCKER ENFORCEMENT MATRIX (Expanded Full Compilation)

**Date**: 2026-06-01  
**Source of Truth**: Authoritative v2.7.40 state at `/workspaces/opening-lab` (including the real `buildVisibleTeachingSurface.ts`)

This is an expanded version of the earlier matrix, incorporating deeper code inspection and the full set of Perfection Gate + checkpoint history.

---

## Main Matrix (30 Blockers)

| # | Blocker Name | Original Issue | Claimed Fix | Current Files | Key Functions | Status | Blocks Render? | Has Tests? | Browser QA? | Needs VisibleTeachingSurface? | Needs BlundrCoachCompiler? | Remaining Gap | Acceptance Test |
|---|--------------|----------------|-------------|---------------|---------------|--------|----------------|------------|-------------|--------------------------------|----------------------------|---------------|-----------------|
| 1 | Target Sync | Async swaps of instructionTarget | instructionFrameKey + lockedContinuationRef | page.tsx, currentInstructionFrame.ts | computeInstructionFrameKey, buildCurrentInstructionFrame | partially enforced | Partial | Yes | Yes | Yes (already does) | Yes | Not all consumers use the locked target | Continuation branch entry under load |
| 2 | CurrentInstructionFrame Lock | No stable key for the frame | Same as #1 | page.tsx + runtime | computeInstructionFrameKey + ref | partially enforced | Partial | Yes | Yes | Yes | Yes | Some Brain/live paths still diverge | Key stability test |
| 3 | Continuation Candidate Lock | continuation_candidate overwritten | Preferred ordering + lock | currentInstructionFrame.ts, page.tsx | buildCurrentInstructionFrame preference | partially enforced | Partial | Yes | Yes | Yes | Yes | Emergency fallback can still win | Locked continuation target test |
| 4 | Expected Move Alignment | Visual/coach uses resolver instead of instructionTarget | Visual target validation + fallback | page.tsx, trainerPresentationFrame, buildVisibleTeachingSurface | mismatch detection in surface | partially enforced | Yes (in surface) | Partial | Yes | Yes (core) | Yes | Legacy visual paths still exist | Mismatched recipe → blocked visual |
| 5 | Plain Mode Answer Leak | Body/hint/visuals leak target before reveal | isDebugLeakText + verified fallback + surface plain rules | page.tsx, coachExplanationPipeline, buildVisibleTeachingSurface | isDebugLeakText, plainLeakDetected logic | partially enforced | Yes (in surface + some paths) | Yes | Yes (was critical) | Yes (Agent 6) | Yes | Not every copy path goes through surface | Exact Nf3 / Stockfish target leak test |
| 6 | Hint Answer Leak | Hints reveal exact move too early | chooseHintLevel + progressive ladder (Agent 4) | coachHintEngine, buildVisibleTeachingSurface | chooseHintLevel, hint ladder | partially enforced | Partial | Yes | Yes | Yes | Yes | Some legacy hint paths bypass | 3x hint on plain never leaks exact move |
| 7 | Show More Target Alignment | Show More content not tied to instructionTarget | show_more button + surface .showMore | visibleActionPolicy, buildVisibleTeachingSurface | showMore handling | partially enforced | Partial | Partial | Yes | Yes | Yes | showMoreTargetUci surface is thin | Show More content must match or be generic |
| 8 | Legacy Visible Ownership | Old teachingOrchestrator etc. render directly | presentation owner model + surface legacyBypassDetected | page.tsx, teachingOrchestrator, buildVisibleTeachingSurface | orchestrateTeaching call + legacyBypass flag | partially enforced (flag exists, call still active) | Mostly detects | Yes | Yes | **Critical** | Yes | Direct call at page.tsx:1044 still executes | Legacy path on teaching frame → legacyBypassDetected + blocked |
| 9 | Missing VisibleTeachingSurface | Reports claimed it existed; it didn't in some snapshots | The module itself | buildVisibleTeachingSurface.ts now exists | buildVisibleTeachingSurface | **now present** (was claimed-but-missing) | Yes (when used) | Partial | Yes | It *is* the surface | Yes | Not yet the exclusive path | All teaching frames must flow through it |
| 10 | rawCoachDecision / TDZ | Early memo referenced later presentationFrame | Removed block + guard comment | app/page.tsx | Historical rawCoachDecision | TDZ fixed; structural risk remains | Only reports | Partial | Recommended | Yes | Yes | Memo ordering still complex | No TDZ under rapid frame changes |
| 11 | Branch Transition | No guidance on out-of-book | branchTransitionSurface in presentation | trainerPresentationFrame, coachSurfacePolicy | branchTransitionSurface injection | partially enforced | Partial | Yes | Yes | Yes | Yes | Can appear with stale target | "Continue from here" locks correct target |
| 12 | Terminal Stale Actions | Game-over frames still offer actions | isTerminal + policy | buildVisibleTeachingSurface, visibleActionPolicy | terminal checks | partially enforced | Yes (in surface) | Partial | Recommended | Yes | Yes | Not all terminal paths go through surface | Mate position offers zero actionable coach UI |
| 13 | Opponent Stale Actions | Stale user-turn content after opponent move | opponentReplyGuard + critical issues | page.tsx, runtime/opponentReplyGuard | shouldFlagStaleOpponentReplyCommit | partially enforced | Mostly reports | Partial | Yes | Yes | Yes | coachInteraction/hintCount not always cleared | Hint immediately after opponent move is safe |
| 14 | Visual Target Mismatch | Arrows don't match instructionTarget | Visual validation + fallback in surface/presentation | buildVisibleTeachingSurface, trainerPresentationFrame | mismatch → visual blocked | partially enforced | Yes (in surface) | Yes | Yes | Yes | Yes | Some direct visual paths remain | Mismatched visual → blocked + debug flag |
| 15 | Visual Stale Frame | Visuals lag the current frame | frameKey + health in presentation | trainerPresentationFrame | recipeFrameMatchesBoard etc. | partially enforced | Partial | Yes | Yes | Yes | Yes | Playback ready checks exist but not universal | Visual vs frame staleness test |
| 16 | Coach Piece Mismatch | Coach claims wrong piece | Piece check in surface (Agent 6) | buildVisibleTeachingSurface | twoPieceTypeMismatch | partially enforced | Yes (in surface) | Partial | Yes | Yes | Yes | Older debug packets can still mismatch | Coach piece != target piece → blocked |
| 17 | Coach Target Mismatch | Coach text about different move than target | 4-target check in surface | buildVisibleTeachingSurface | fourTargetMismatch | partially enforced | Yes (in surface) | Partial | Yes | Yes | Yes | Not all coach paths feed the 4 values | coachMoveUci must == instructionTargetUci or block |
| 18 | Reveal/ShowMore Target Mismatch | Reveal or Show More targets differ from instruction | showMoreTargetUci input + check | buildVisibleTeachingSurface | showMoreShown + target check | partially enforced | Partial | Low | Yes | Yes | Yes | showMoreTargetUci has low adoption | Show More target must align or be suppressed |
| 19 | Debug/Prod Parity | Debug shows more permissive output | Snapshot collects full truth; surface filters prod | trainerDebugSnapshot, buildVisibleTeachingSurface debug section | infer* functions + surface debug | partially enforced | Reports (panel sees raw) | Yes | **Yes (explicit requirement)** | Yes | Yes | Panel can still leak internal state | Rendered UI + snapshot visible content must match |
| 20 | Stockfish Provenance | Engine claims lack real provenance | Provider abstraction (claimed in reports) | brain/engineValidation/ | validateCandidateWithStockfish + provenance | claimed but missing / light | Reports only | Partial | Yes | Recommended | Yes | Mostly synthetic in current Brain skeleton | Real browser Stockfish must produce honest provenance |
| 21 | Generic Fallback Copy | "Improve the knight" style text on teaching frames | Leak detection + verified fallback | coachExplanationPipeline, coachDecisionEngine | isDebugLeakText + buildVerifiedUserFacingFallback | partially enforced | Partial | Yes | Yes | Yes | Yes | Adaptive fallback still uses old library | Teaching frame with clear target never gets generic copy |
| 22 | Unsafe Coach Claim | Text makes unsupported claims | boardClaimValidator + explanationSafetyLinter + surface | coachBrain/boardClaimValidator, explanationSafetyLinter, buildVisibleTeachingSurface | claim validation | partially enforced | Partial | Yes | Recommended | Yes | Yes | Old copy paths bypass full validation | Unsupported claim → blocked |
| 23 | Old Copy Library Fallback | coachCopyLibrary still wins on many frames | Preference for evidence/intentFirst when fresh | coachDecisionEngine | findEntry vs modern builders | partially enforced | Reports | Yes | Yes | Yes | Yes | Stale evidence still triggers old path | Count modern vs legacy copy usage on goldens |
| 24 | Old teachingOrchestrator / visualOverlayRouter Bypass | Direct legacy teaching computation | Legacy suppression shim + surface legacyBypass flag | app/page.tsx, teachingOrchestrator, buildVisibleTeachingSurface | direct orchestrateTeaching call | only detected in debug (call still active) | Mostly reports | Partial | Yes | **Must be quarantined** | Yes | Still the largest active bypass | No legacy teaching output on Brain teaching frames |
| 25 | Forbidden UI Actions | Legacy buttons leak into UI | visibleActionPolicy filter in CoachCard | visibleActionPolicy, CoachCard | filterToVisibleCoachActions | **fully enforced at render** | Yes (CoachCard) | Yes | Recommended | Already the contract | Yes | CoachButton type union still contains legacy values | No forbidden strings in rendered CoachCard |
| 26 | Show Plan / Analyze / Attack clutter | Old action clutter in Plain/Assisted | buttonsFor + visibleActionPolicy return canonical only | coachDecisionEngine, visibleActionPolicy | buttonsFor for plain/assisted | **fully enforced in policy** | Yes | Yes | No | Yes | Yes | Some old tests still reference them | Clean button set in prod UI |
| 27 | Plain View Reveal/Show Answer leakage | Buttons or content leak answer actions | Policy returns only hint + show_more pre-Show More | visibleActionPolicy, buildVisibleTeachingSurface | Plain mode button rules | partially enforced | Yes (in policy + surface) | Yes | Yes | Yes | Yes | Some state paths still allow reveal buttons | Plain frame before Show More has exactly hint + show_more |
| 28 | Branch Exhaustion Not Transitioning | User reaches end of line with no guidance | branchTransitionSurface + continuedPlay policy | trainerPresentationFrame, continuedPlayMovePolicy | branch transition injection | partially enforced | Partial | Yes | Yes | Yes | Yes | Transition can be delayed or missing | End of repertoire line immediately offers "Continue from here" |
| 29 | Emergency Fallback Becoming Visible Target | Heuristic legal move becomes the coached move without proper marking | emergencyFallbackMove + locking through frame | continuedPlayMovePolicy | emergencyFallbackMove | partially enforced (via frame) | Partial | Yes | Yes | Yes | Yes | Can become the visible target without clear "emergency" marking | Emergency fallback must be distinguishable in debug and surface |
| 30 | Browser QA Failure Context | Live browser reproduces target leaks, stale actions, lock failures | Checklists + multi-move QA + LATEST_LIVE | All of the above + docs checklists | All live paths | mostly only detected in debug | Reports + some blocks | Yes | **Yes — required** | Yes | Yes | Historical "fixed" items still reproduce | Full browser QA pass against this matrix must be green or accepted |

---

## Dedicated Sections

### A. Blockers that must become runtime guards in VisibleTeachingSurface
- All 4-target + 2-piece invariants (already partially present)
- Plain pre-Show More leak detector (already sketched)
- Legacy bypass on Brain teaching frames (flag exists; must become hard block or very loud)
- Stale frame / terminal / opponent stale action suppression
- Any content whose implied target != instructionTarget

### B. Blockers that must become tests before v2.7.40B Intelligent Coach Compiler
- Full invariant matrix (synthetic + golden + live)
- Plain Mode leak matrix (all combinations of guided/continuation + hint ladder + visuals)
- Legacy bypass never false-negative on teaching frames
- Show More content alignment
- Debug snapshot vs actual rendered UI parity for every flag
- Generic fallback never wins on a clear teaching frame
- Full browser QA checklist run against all 30 items

### C. Blockers that are currently only debug-detected and not render-blocking
- Many legacy bypasses (#8, #24)
- Some stale action cases (#13)
- Stockfish provenance (#20)
- Some coach target/piece mismatches when not flowing through the surface

### D. Blockers with claimed fixes that are missing or incomplete in actual source
- Full exclusive ownership by VisibleTeachingSurface (claimed in cutover reports; not yet true)
- Universal 4-target wiring (showMoreTargetUci is thin)
- Real Stockfish provenance in the Brain facade

### E. Blockers that are fully enforced today
- Forbidden UI actions at render time (#25)
- Clean button policy for Plain vs Assisted (#26, #27 in policy)
- Target locking mechanism itself (the key + ref)

### F. Blockers that are partially enforced today
- Most of the list (1–7, 11–18, 21–23, etc.). Real progress exists, especially inside `buildVisibleTeachingSurface`, but the "exclusive path" requirement is not yet met.

---

**End of Expanded Blocker Enforcement Matrix**