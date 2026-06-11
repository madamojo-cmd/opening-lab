# Blundr Overall App Roadmap: v2.8.0 to MVP

**Project:** Blundr  
**Current branch:** `codespace-improved-succotash-p7rq4759qpg6f7pgp`  
**Current milestone:** Provider, branch-complete, and continuation stabilization  
**Recommended current checkpoint:** `checkpoint/v2.8.0-provider-branch-continuation-stable`  
**Next target checkpoint:** `checkpoint/v2.8.0-coaching-stage-stable`

---

## 0. Current Status

Blundr has reached the first true stability milestone for the core training loop.

The following flow is now functioning in live QA:

```text
Guided restricted line
→ Line Complete surface
→ Continue from Here
→ Continuation mode
→ Maia opponent reply
→ Continuation candidate generation
→ CurrentInstructionFrame target promotion
→ CoachCard and board visuals aligned
→ Terminal/checkmate handled cleanly
```

Recent successful commits:

```text
5096d10 Restore branch-complete controls at restricted line exhaustion
9865aae Validate Maia moves by request FEN and promote continuation targets
```

Current live debug status:

```text
criticalIssues: []
Maia: pass
Visual: pass
Coach: pass
Actions: pass
Legacy: pass
```

Remaining non-blocking warning:

```text
stockfish_provider_unavailable
```

This warning appears on terminal or non-user-turn frames and should be treated as a debug-noise cleanup item unless reproduced on a real user-turn continuation frame where Stockfish is required.

---

## 1. Immediate Checkpoint: Provider, Branch, Continuation Stable

Before additional work, lock in the current state.

### Commands

```bash
git status --short

git checkout -b checkpoint/v2.8.0-provider-branch-continuation-stable
git push -u origin checkpoint/v2.8.0-provider-branch-continuation-stable

git tag v2.8.0-provider-branch-continuation-stable
git push origin v2.8.0-provider-branch-continuation-stable
```

### Meaning of this checkpoint

This checkpoint certifies that:

```text
Branch complete works.
Continue from Here works.
Maia runtime works in browser.
Maia request-FEN legality works.
Continuation candidates render.
Instruction, coach, visual, and reveal targets align.
Terminal/checkmate states complete cleanly.
No critical issues are present in live debug.
```

### Do not call this final MVP

This is a **provider and continuation stability checkpoint**, not the full coaching-stage or MVP checkpoint.

---

## 2. Stage One: Final Coaching Safety and Copy Quality Pass

### Goal

Complete the current v2.8.0 coaching stage so the core trainer is stable, safe, clear, and product-ready.

### Remaining work

```text
1. Suppress false stockfish_provider_unavailable warning on terminal / non-user-turn frames.
2. Clean awkward coach-copy themes.
3. Remove generic or misleading labels such as:
   - Active Piece Development
   - Avoid Blocking Center Pawn
4. Reduce overuse of claim_validation_failed fallbacks.
5. Ensure strong claims are only rendered when supported by board evidence.
6. Improve continuation copy without hallucinating.
7. Confirm Plain View does not leak answers before Show More.
8. Confirm Assisted View and Plain View both use the same CurrentInstructionFrame target authority.
9. Confirm Show More restores assisted-equivalent visuals only after the user requests them.
10. Confirm no legacy visual/action path bypasses visible_surface_v28.
```

### Non-negotiable architecture invariants

Every user-turn teaching frame must obey:

```text
instructionTargetUci === coachMoveUci === visualMoveUci === revealTargetUci
instructionTargetPieceType === coachPieceType
```

Continuation user-turn flow must remain:

```text
Stockfish or continuation policy resolves candidate
→ effectiveContinuationCandidate
→ CurrentInstructionFrame.target
→ visible teaching surface
→ CoachCard
→ board visuals
→ reveal/show-more target
```

Restricted line-complete flow must remain:

```text
restricted line exhausted
→ instructionTarget null
→ Line Complete surface
→ Continue from Here
→ user click required
→ continuation mode
```

Maia must remain opponent-context only:

```text
Maia may choose opponent replies in continuation mode.
Maia must not touch instruction target.
Maia must not touch coach copy.
Maia must not touch visible action policy.
Maia must not touch branch-complete state.
```

### Acceptance criteria

```text
criticalIssues: []
warnings: [] or only explicitly accepted dev-only warnings
No Safety Blocked on valid teaching frames
No stale target
No target-source mismatch
No piece mismatch
No plain-mode answer leak
No visual leakage before Show More
No unsupported strong claim
No unverified center-tension claim
No unsafe template rendered
No reveal target source mismatch
No legacy UI bypass
```

### Recommended checkpoint

```text
checkpoint/v2.8.0-coaching-stage-stable
```

### Suggested commit message

```bash
git commit -m "Complete coaching safety and copy quality pass"
```

---

## 3. Stage Two: Opening Curriculum and Content System

### Goal

Turn Blundr from a single working trainer flow into a structured opening-learning product.

### Build

```text
Opening library
Line selection
Concept tagging
Difficulty tiers
Color selection
Opening family pages
Curated line metadata
Branch-complete rules
Continuation eligibility rules
Coach explanation metadata
Visual recipe metadata
```

### First polished module

```text
Italian Game, White repertoire
```

This should become the flagship demo line because it already exercises:

```text
Development
Center control
Castling
Bishop pressure
Restricted line completion
Continuation play
Tactical continuation
Checkmate terminal handling
```

### Recommended beginner opening set

```text
White openings:
- Italian Game
- London System
- Queen's Gambit

Black openings:
- Caro-Kann Defense
- French Defense basics
- Sicilian Defense basics
- King's Indian setup basics
```

### Required data shape

Each line should eventually include:

```ts
type OpeningLine = {
  openingId: string;
  lineId: string;
  name: string;
  color: "white" | "black";
  difficulty: "new" | "beginner" | "intermediate" | "advanced";
  moves: string[];
  conceptIds: string[];
  terminalPolicy: "line_complete" | "continue_from_here" | "review";
  minimumGuidedDepthPly: number;
  hardGuidedDepthPly: number;
  continuationEligible: boolean;
  visualRecipeIds: string[];
  coachMetadata: {
    mainIdea: string;
    commonMistakes: string[];
    tacticalMotifs: string[];
    strategicThemes: string[];
  };
};
```

### Acceptance criteria

```text
User can choose an opening.
User can choose a line.
Each line has stable guided-mode behavior.
Each line reaches branch complete deterministically.
Each line can enter continuation if eligible.
Each line has concept metadata.
No raw debug labels appear in user-facing UI.
```

---

## 4. Stage Three: Blundr Review Queue and Spaced Repetition

### Goal

Make Blundr useful beyond a single lesson by creating a daily training loop.

### Build

```text
Blundr Review Queue
Mistake capture
Move recall scoring
Line mastery score
Concept mastery score
Review scheduling
Repeated miss detection
Graduation of mastered moves
Daily due items
```

### User-facing language

Use clean product language:

```text
Due Today
Needs Practice
Getting Stronger
Mastered
Review Again
Blundr Brain Review
```

Avoid raw technical labels in visible UI:

```text
Do not show: spaced_repetition_score
Do not show: failed_node_id
Do not show: stockfish_validated
Do not show: verified_top2
Do not show: continuation_candidate_source
```

### Suggested review model

Track mastery at multiple levels:

```text
Move-level mastery
Line-level mastery
Concept-level mastery
Opening-level mastery
```

Example fields:

```ts
type ReviewItem = {
  id: string;
  userId: string;
  openingId: string;
  lineId: string;
  fen4: string;
  targetUci: string;
  targetSan: string;
  conceptIds: string[];
  lastReviewedAt: string | null;
  nextReviewAt: string;
  intervalDays: number;
  ease: number;
  missCount: number;
  successCount: number;
  status: "due" | "learning" | "strengthening" | "mastered";
};
```

### Acceptance criteria

```text
Missed moves are captured.
Correct moves increase mastery.
Repeated misses return sooner.
Mastered moves return later.
User has a daily queue.
User can complete the queue.
Progress persists.
```

---

## 5. Stage Four: Onboarding

### Goal

Help a new user understand Blundr quickly and reach a useful first success state.

### Build

```text
Experience level selection
Goal selection
Color preference
Opening preference
First lesson recommendation
Assisted View explanation
Plain View explanation
First guided lesson
First review item creation
```

### Experience levels

Use clean, friendly levels:

```text
New to Chess
Casual Player
Club Player
Advanced Player
```

Optional ELO mapping can exist internally but should not dominate the UI.

### Goal options

```text
Learn openings
Stop early blunders
Build a repertoire
Prepare for online games
Improve recall
```

### First-session target

The first session should end with:

```text
User completes one short guided line.
User sees Line Complete.
User understands Continue from Here.
User receives first review item.
User lands on dashboard with progress.
```

### Acceptance criteria

```text
New user can start without reading documentation.
No debug language appears.
Assisted vs Plain View is understandable.
A review item is created after the first lesson.
User reaches the dashboard with visible progress.
```

---

## 6. Stage Five: Accounts and Persistence

### Goal

Persist user progress so Blundr becomes a real product instead of a local demo.

### Build

```text
Authentication
User profile
Saved progress
Opening repertoire
Review history
Mistake history
Settings
Daily streak
Device sync
```

### Recommended stack

```text
Next.js
Supabase or Firebase Auth
Postgres-backed progress tables
Local cache for fast lesson state
Server persistence for account sync
```

### Core database tables

```text
users
user_settings
opening_progress
line_progress
concept_progress
review_items
review_attempts
mistake_events
lesson_sessions
```

### Privacy and product principles

```text
Make personalization opt-in when appropriate.
Avoid storing unnecessary sensitive data.
Use clear product language for learning history.
Use anonymized or aggregated analytics where possible.
Keep debug/dev fields out of production UI.
```

### Acceptance criteria

```text
User can create account.
User can log in/out.
Progress persists across sessions.
Review queue persists.
Settings persist.
No local-only progress loss after refresh.
```

---

## 7. Stage Six: Gamification and Progress Design

### Goal

Make daily training motivating without making the app feel childish.

### Build

```text
Daily goal
Streak
XP
Opening mastery percentage
Concept mastery percentage
Review completion status
Blundr Brain score
Badges
Weekly progress summary
```

### Product tone

Blundr should feel like:

```text
Duolingo's habit loop
Chessable's repetition value
Chess.com's coach familiarity
Apple-like visual clarity
```

But it should avoid clutter, childish badges, or overwhelming stats.

### Possible badges

```text
First Line Complete
First Perfect Recall
Three-Day Streak
Opening Explorer
Tactic Spotter
Endgame Finisher
No-Hint Clear
```

### Acceptance criteria

```text
User has a clear daily reason to return.
Progress is visible.
Review completion feels rewarding.
Mastery improves with correct recall.
Gamification does not interfere with training clarity.
```

---

## 8. Stage Seven: MVP UI and UX Polish

### Goal

Make Blundr feel like a premium consumer app.

### Design priorities

```text
Clean Apple-like UI
Beautiful board
Smooth arrows and highlights
No flicker
No debug labels in production
Clear coach cards
Clear transition states
Mobile responsive layout
Clean empty states
Fast perceived performance
```

### Required views

```text
Home dashboard
Opening library
Lesson screen
Review queue
Progress screen
Settings
Account screen
```

### Lesson screen requirements

```text
Board remains the center of the experience.
Coach card is concise and useful.
Actions are minimal.
Assisted View shows visuals.
Plain View hides answer until requested.
Show More restores explanation and visuals.
Continuation mode feels intentional, not random.
Terminal state gives a satisfying completion.
```

### Acceptance criteria

```text
No old buttons remain.
No duplicate controls.
No answer appears in Plain View before Show More.
No raw debug or internal labels appear.
Board visuals match the coach target.
The app works on desktop and mobile widths.
```

---

## 9. Stage Eight: Backend Hardening and Deployment

### Goal

Prepare Blundr for private beta deployment.

### Build

```text
Production database
Auth rules
Rate limits
Server logging
Error boundaries
Crash reporting
Analytics
Vercel deployment
Environment variable separation
Provider health checks
Provider fallback policy
```

### Provider strategy decision

Before beta, decide whether Maia is:

```text
A local/dev-only feature
A hosted beta feature
Deferred behind fallback policy
Replaced temporarily by Stockfish/database opponent policy
```

For MVP, Stockfish plus curated/database opponent replies may be enough if Maia hosting becomes too heavy.

### Environment separation

```text
.local development
preview deployment
production deployment
```

Each should have explicit values for:

```text
NEXT_PUBLIC_MAIA_API_ENABLED
MAIA_ENABLED
MAIA_LC0_PATH
MAIA_WEIGHTS_PATH
MAIA_SKILL_LEVEL
STOCKFISH_PROVIDER_ENABLED
DATABASE_URL
AUTH_SECRET
```

### Acceptance criteria

```text
Preview deploy builds cleanly.
Production deploy builds cleanly.
Provider failures degrade gracefully.
No debug panels are visible in production by default.
No secrets are exposed client-side.
Errors are captured and actionable.
```

---

## 10. Stage Nine: Private Beta

### Goal

Test whether real users understand and retain openings with Blundr.

### Beta size

```text
20 to 50 users
```

### Beta scope

```text
1 to 3 polished openings
Assisted View
Plain View
Review Queue
Basic accounts
Daily training loop
Feedback capture
```

### What to measure

```text
Where users quit
Which lessons confuse users
Which explanations feel generic
Which visuals help recall
How often users return
Whether Plain View improves retention
Whether Review Queue feels useful
How many users complete first lesson
How many users complete first review queue
```

### Acceptance criteria

```text
Users can onboard without help.
Users can complete lessons.
Users can complete reviews.
No critical trainer bugs are reported repeatedly.
Coach copy is understandable.
Users understand why they are being shown a move.
```

---

## 11. Stage Ten: Mobile and App Store Path

### Goal

Move from web MVP to mobile distribution.

### Recommended path

```text
PWA first
Then Capacitor wrapper
Then App Store submission
```

### Mobile requirements

```text
Touch-first board
Portrait layout
Responsive coach card
Bottom-sheet actions
Offline-ish cached lessons
Account sync
App icons
Launch screen
Privacy policy
Terms of service
Analytics disclosure
Subscription/payment policy if monetized
```

### App Store readiness

```text
Production auth
Production database
Stable mobile UI
No visible debug tools
No broken provider dependencies
Privacy policy live
Terms live
Support email live
Crash reporting configured
Basic analytics configured
```

---

## 12. Immediate Next Three Moves

Do these in order.

### Move 1: Create the provider checkpoint

```bash
git status --short

git checkout -b checkpoint/v2.8.0-provider-branch-continuation-stable
git push -u origin checkpoint/v2.8.0-provider-branch-continuation-stable

git tag v2.8.0-provider-branch-continuation-stable
git push origin v2.8.0-provider-branch-continuation-stable
```

### Move 2: Run the final coaching-stage cleanup pass

Codex stage name:

```text
v2.8.0 Final Coaching Safety and Copy Quality Pass
```

Primary goals:

```text
Suppress false Stockfish terminal warning.
Clean coach-copy titles and bodies.
Reduce fallback overuse.
Preserve all target invariants.
Confirm Plain View answer protection.
Confirm Assisted/View Show More parity.
```

### Move 3: Begin MVP product architecture

Start with:

```text
Review Queue
Onboarding
Accounts and persistence
```

These three features convert Blundr from a working trainer engine into a real MVP product.

---

## 13. Definition of MVP

Blundr MVP is ready when a user can:

```text
Create an account.
Choose their level and goals.
Start a recommended opening path.
Complete an Assisted View lesson.
Retry in Plain View.
Enter continuation after a line completes.
Receive useful coach feedback.
Save progress.
Return later to a Review Queue.
Improve mastery over time.
See clear progress on a dashboard.
```

Technical MVP requirements:

```text
No critical debug issues.
No answer leak.
No target mismatch.
No piece mismatch.
No stale continuation candidate.
No Safety Blocked on valid frames.
No legacy UI bypass.
Provider failures degrade gracefully.
Progress persists.
Review items persist.
Production UI contains no debug labels.
```

---

## 14. Long-Term Product Direction

After MVP, Blundr can expand into:

```text
Full repertoire builder
Adaptive difficulty
User mistake model
Personalized opening recommendations
Lichess import
Chess.com import, if available and permitted
Game review integration
Tactics-from-opening training
Community-created repertoires
Coach personality tuning
Mobile-first subscription product
```

Long-term differentiator:

```text
Blundr should not just show moves.
Blundr should teach opening decisions through active recall, visual pattern learning, and personalized review.
```

