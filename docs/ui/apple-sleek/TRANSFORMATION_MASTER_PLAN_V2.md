# BLUNDR APPLE-SLEEK UI TRANSFORMATION — MASTER 1:1 MIGRATION PLAN v2

**Baseline branch:** `release/blundr-staging-3.99`
**Baseline source authority:** `cf8bafd0be884c51a880504d4b82818c446a2fe6`
**Reviewed:** 2026-08-18
**Scope:** presentation-focused transformation of the complete Blundr web application
**Primary principle:** **Same Blundr product, same live owners, same state, same routes, same authority, same actions and same outcomes — new presentation grammar only.**

---

# 0. STATUS OF THIS DOCUMENT

This revision supersedes the prior transformation plan.

It incorporates the second code-review notes and an additional pass over the baseline implementation. It corrects several areas where a visually focused engineer could otherwise:

- replace a behavior-bearing wrapper with a lower-level visualization;
- consolidate intentionally different route gates;
- normalize state enums whose ownership is intentionally split;
- alter reward dismissal lifecycle;
- remove live opening-detail information;
- alter keyed Trainer remount semantics;
- lose Daily/minigame visible fields or recovery states;
- delete fallback navigation because only one primary nav is normally rendered;
- strip existing manifest-managed imagery while deferring *new* assets;
- accidentally refactor authentication/onboarding behavior while trying to share forms;
- change chessboard semantic colors through global visual tokens;
- delete code that only appears dead without first proving reachability.

The document is now intended to be safe enough to function as the governing UI migration contract.

---

# 1. TWO GIANT RED-LINE RULES

> **RED LINE 1 — Do not replace a behavior-bearing owner merely because one of its child components is visually canonical. Preserve the owner actually reached at the baseline SHA. A wrapper/component ownership change is architecture work, not visual work.**

> **RED LINE 2 — Do not use “UI cleanup” to normalize route gates, state enums, modal lifecycles, API calls, request payloads, idempotency keys, remount semantics, fallback navigation, auth flows, feature flags, developer permissions or persistence behavior.**

A visual PR must not become a hidden architecture refactor.

---

# 2. BASELINE / IMMUTABLE AUTHORITY

## 2.1 Exact baseline

All work begins from:

`cf8bafd0be884c51a880504d4b82818c446a2fe6`

on:

`release/blundr-staging-3.99`

Before the first UI change, record:

- branch and exact commit;
- full test status;
- route inventory;
- feature flags relevant to UI;
- screenshots at 360, 390, 430, 768, 1024, 1280 and 1440 px;
- a working Home;
- exact Daily ring animation;
- Train selection;
- restricted Trainer;
- line completion;
- explicit continuation;
- Maia normal reply;
- Maia unavailable + retry;
- learner checkmate → Battery evidence;
- Daily correct/incorrect/Reveal/Retry/Continue;
- all three minigames;
- Progress;
- Repertoire unlock;
- opening-detail ready + non-ready states;
- Settings saves;
- Chess.com/Lichess connected-game-data states;
- Profile;
- all V11 onboarding steps;
- login/signup/recovery;
- reward claim/presentation/dismiss/acknowledge;
- global error;
- legal pages that are actually present;
- developer pages/gating.

No implementation begins until this evidence exists.

## 2.2 No dead-code cleanup during the visual PR

The current application has overlapping historical and newer presentation paths. A component that appears unused must not be deleted simply because the new UI no longer seems to need it.

Rules:

- prove route/render reachability first;
- record the proof in the PR;
- do not delete behavior-bearing legacy paths in the same PR;
- perform dead-code removal later, separately, after production parity is proven.

This is especially important in `app/page.tsx`.

---

# 3. LIVE OWNERSHIP MATRIX — PRESERVE THESE BOUNDARIES

The implementation agent must begin with this ownership map.

| Surface | Baseline live behavior owner | Critical rule |
|---|---|---|
| Root shell | `ResponsiveAppShellGate` → `AppShell` | Restyle; do not change route mapping/exemption behavior. |
| Onboarding protection | `OnboardingRouteGate` | Preserve independent exemption list and fail-closed behavior. |
| Account hydration | `AuthenticatedAccountHydrationGate` | Preserve bootstrap, timeout, snapshot persistence and Rewards V2 ownership. |
| Home | `BlundrApp` Home early-return → `Figma5303HomeScreen` | Preserve its live data/refresh behavior. Do not swap in another Home wrapper during UI work. |
| Daily ring visualization | `NestedDailyRings` | Freeze visual/animation component. |
| Alternate/legacy Home ring owner | `DailyRingsCard` exists in `app/page.tsx` | Do not adopt, remove or merge it into live Home without a separate reachability/behavior decision. |
| Train routing | `TrainRouteShell` | Preserve canonical opening resolution and keyed `BlundrApp` remount. |
| Active Trainer | `BlundrApp` in `app/page.tsx` | Recompose render only; no state-machine refactor. |
| Trainer board | `TapChessboard` | Same props, handlers, visual semantics and board behavior. |
| Review | `ReviewHub` | Same Daily/minigame capability ownership. |
| Daily | `ProductionDailyBlundrScreen` | Same action controller/version/first-attempt semantics. |
| Daily board | `DailyBlundrBoard` | Same FEN, move validation, preferences and ARIA. |
| Minigame route runner | `MiniGamePracticeRunner` | Same secure instance/revision/actions. |
| Progress | `ProgressDashboard` | Same summary endpoint/listeners/manual refresh. |
| Repertoire | `RepertoireProgressPanel` | Same durable hook/unlock analytics/idempotency. |
| Opening inventory | `RepertoireOpeningGrid` | Same unlock/train ordering and callbacks. |
| Opening detail live route | `OpeningDetailRouteClient` → `OpeningDetailPage` | Do not implement production UI from fixture-only `OpeningDetailShell`. |
| Settings | `SettingsPage` | Preserve all nine sections and all persistence semantics. |
| Connected game data | `ConnectedGameDataPanel` | Preserve live + compatibility state ownership/mapping. |
| Profile | `BlundrProfilePage` | Preserve public username/private identity split. |
| Standalone auth routes | `AppAuthForm` | Preserve safe-next/signup/login semantics. |
| Embedded Settings auth | `SettingsPage`’s current handlers | Do not replace with `AppAuthForm` unless semantics are explicitly mapped. |
| V11 onboarding | `OnboardingV11Flow` | Same route steps, persistence and explicit-choice behavior. |
| Rewards V2 | `RewardPresentationHost` | Sole authenticated server-leased presentation owner. |
| Global error | `app/global-error.tsx` | Keep Sentry capture + reset. |

**Ownership changes require a separate architecture review.**

---

# 4. RED-LINE SYSTEMS / CHANGED-FILE BOUNDARY

The UI migration must not modify these domains except for an explicitly reviewed narrow presentation/accessibility exception:

- `app/api/**`
- `supabase/**`
- migrations
- release manifests / release authority
- protected runtime data/packages
- `lib/blundr/daily/**` authority/repository/action semantics
- `lib/blundr/trainerCompletion/**`
- `lib/blundr/continuation/**`
- `lib/blundr/maia/**`
- `lib/blundr/runtime/**`
- `lib/blundr/rewards/**` authority/business semantics
- `lib/blundr/daily-rings/**` completion authority
- `lib/blundr/repertoire/**` unlock/progress authority
- `lib/blundr/accounts/**` persistence semantics
- `lib/blundr/onboarding/**` contracts/routing semantics
- `lib/blundr/engine/**`
- `lib/blundr/coach/**`
- `lib/blundr/coachBrain/**`
- `lib/blundr/liveCoach/**`
- learning-event contracts
- telemetry contracts
- game-data worker/server logic
- runtime opening/candidate/node data.

Do not refactor the Trainer controller in `app/page.tsx`.

Do not extract “cleaner shared hooks” for Home/Daily rings, auth, route gates, game-data states or Trainer as part of this PR.

---

# 5. APPROVED NARROW EXCEPTIONS

## 5.1 Accessibility zoom exception — APPROVED FOR ISOLATED CHANGE

Baseline `app/layout.tsx` currently sets:

`maximumScale: 1`

That conflicts with the target accessibility requirement for mobile zoom.

This revision explicitly authorizes one narrow accessibility correction:

- remove the `maximumScale: 1` restriction;
- preserve `width: "device-width"` and `initialScale: 1`;
- make the change in its own commit;
- add a mobile zoom/accessibility regression test/manual acceptance;
- do not combine it with shell or route behavior changes.

This is an additive accessibility capability, not permission to alter other viewport behavior.

## 5.2 Developer-link production hardening — SEPARATE COMMIT / EXCEPTION

Baseline Settings currently exposes UI Studio / Dev Admin links in Support & About even though the separate Developer Tools section is gated by `snapshot.devToolsEnabled`.

Strict 1:1 parity would preserve those links.

Recommended release hardening:

- gate the Support & About developer links using the existing developer-tools authority;
- do this in a separate, explicitly labeled hardening commit or PR;
- add a normal-user vs dev-enabled test;
- do not silently hide them during an unrelated visual commit.

Until that separate hardening change is approved/applied, the visual migration preserves baseline link behavior.

---

# 6. THREE DAILY RINGS — FROZEN PRODUCT ASSET

## 6.1 Canonical visualization

`components/daily-rings/NestedDailyRings.tsx`

is the canonical three-ring visualization.

For this UI PR:

**Freeze this component byte-for-byte unless a separately approved bug fix is required.**

Do not recreate it in Figma-generated JSX.
Do not create a “sleeker equivalent.”
Do not replace it with bars.
Do not move its animation logic into global CSS.
Do not change its colors to fit the new palette.

## 6.2 Exact preserved ring geometry

### Tempo — outer
- id: `daily_tempo`
- stroke `#38b366`
- track `#d5edd8`
- radius `78`
- width `10`
- glow RGB `56, 179, 102`

### Battery — middle
- id: `daily_battery`
- stroke `#c79a2a`
- track `#f4e4b4`
- radius `60`
- width `9`
- glow RGB `199, 154, 42`

### Blundr — inner
- id: `daily_blundr`
- stroke `#3b82f6`
- track `#dbeafe`
- radius `42`
- width `9`
- glow RGB `59, 130, 246`

### Shared geometry
- view box `180`
- center `90`
- center card size `68`
- maximum visual width `240px`
- rounded caps
- -90° progress start

## 6.3 Exact preserved motion

- `stroke-dashoffset` progress: `700ms ease-out`
- opacity/filter/transform transition: `250ms ease-out`
- newly closed ring pulse: `1100ms`
- all-rings celebration: `1400ms`
- progress update after animation frame
- completion glow
- reduced motion jumps directly to final state and disables animation

## 6.4 Exact preserved semantic content

- center `Today`
- `x/3`
- `Open` / `In progress` / `Complete`
- three detail cards beneath the ring
- progress / goal values
- per-ring state
- streak footer
- group ARIA label

## 6.5 Home ownership clarification

The current visible Home route at this baseline is rendered by `Figma5303HomeScreen`, which itself:

- loads or receives repertoire progress;
- loads authoritative progress-summary ring state;
- handles local-demo state;
- listens to storage;
- listens to `BLUNDR_DAILY_RING_REFRESH_EVENT`;
- listens to focus;
- listens to visibility;
- converts summary data into Home ring items;
- renders `NestedDailyRings`;
- renders Current Openings;
- renders Daily navigation;
- renders streak and repertoire-point information.

`DailyRingsCard` also exists in the codebase and owns a richer alternate/legacy ring card lifecycle, including analytics/completion/reward presentation.

**Do not switch the live Home from `Figma5303HomeScreen` to `DailyRingsCard` inside the visual PR.**
That is a behavior-owner change.

Instead:

- preserve the currently reachable Home owner and its effects;
- preserve the exact `NestedDailyRings`;
- restyle/recompose the current Home markup;
- leave `DailyRingsCard` intact until a separate reachability/consolidation decision.

If a future architecture task intentionally chooses `DailyRingsCard` as the sole Home ring owner, it must separately prove behavior equivalence and account for analytics, completion and reward differences.

## 6.6 Progress ownership

Progress is different.

`ProgressDashboard` directly owns its progress-summary request/listeners and directly renders `NestedDailyRings`.

Keep that exact ownership.

## 6.7 Linear bars

Linear bars may remain for:

- repertoire unlock percentage;
- mastery percentage;
- other naturally linear percentages.

They may not replace Daily rings.

Redundant Home linear summaries that merely duplicate the same ring progress may be removed/reduced as presentation-only simplification **only if no unique data/action/state is lost**.

---

# 7. ROUTE GATES — PRESERVE THEIR ASYMMETRY

The three gates do not have identical exemption lists.

Do not create a shared `PUBLIC_ROUTES` list in this PR.

Do not deduplicate them.

Do not “correct” the difference.

## 7.1 `ResponsiveAppShellGate` baseline exemptions

- `/signup`
- `/login`
- `/forgot-password`
- `/auth`
- `/confirm`
- `/reset-password`
- `/onboarding`
- `/privacy`
- `/terms`
- `/acceptable-use`
- `/subscription-terms`
- `/account-deletion`

## 7.2 `AuthenticatedAccountHydrationGate` baseline exemptions

- `/signup`
- `/login`
- `/forgot-password`
- `/auth`
- `/confirm`
- `/reset-password`
- `/onboarding`
- `/privacy`
- `/terms`
- `/acceptable-use`
- `/subscription-terms`

**No `/account-deletion` entry at baseline.**

## 7.3 `OnboardingRouteGate` baseline exemptions

- `/signup`
- `/login`
- `/forgot-password`
- `/auth`
- `/confirm`
- `/reset-password`
- `/onboarding`
- `/privacy`
- `/terms`
- `/acceptable-use`
- `/subscription-terms`

**No `/account-deletion` entry at baseline.**

## 7.4 Prefix semantics

Preserve current prefix matching:

a route is exempt when it equals a prefix or starts with `prefix + "/"`.

Do not convert to exact-only route matching.

## 7.5 Gate entries are not route inventory

An exemption prefix does not prove a live page exists.

Do not add `/terms`, `/acceptable-use`, `/subscription-terms` or `/account-deletion` to the verified live-page inventory merely because a gate knows those prefixes.

Maintain two separate artifacts:

1. verified current page-route inventory;
2. route-gate prefix contract.

---

# 8. GLOBAL SHELL / NAVIGATION

## 8.1 Gate order

Keep the exact root order:

1. `ResponsiveAppShellGate`
2. `OnboardingRouteGate`
3. `AuthenticatedAccountHydrationGate`
4. route content

`RewardPresentationHost` remains owned by authenticated hydration.

## 8.2 One rendered primary nav — not one source definition

Baseline has:

- `APP_SHELL_NAV_ITEMS` in `AppShell`;
- `NAV_ITEMS` in `BlundrBottomNav`.

`BlundrBottomNav` intentionally returns `null` when `AppShell` context is active.

Therefore the correct invariant is:

> **Only one primary navigation renders at a time.**

Do not interpret this as permission to delete `BlundrBottomNav`.

Preserve its fallback behavior when no AppShell is active.

A future shared static nav definition is allowed only if href, labels and active-state behavior remain exactly equivalent.

## 8.3 Exact primary destinations

- Home `/`
- Train `/train`
- Review `/review`
- Progress `/progress`
- Repertoire `/repertoire`

Daily remains under Review.

Minigames remain under Review.

Settings/Profile remain secondary.

`BlundrBottomNav` currently treats `/profile`, `/settings` and `/paywall` as Home for fallback active-state purposes. Preserve this fallback contract even if a corresponding route is not part of the verified live-page inventory.

## 8.4 Desktop target

- one warm neutral canvas;
- restrained/translucent left rail;
- restrained utility header;
- approximate content max 1280–1360px;
- no page-sized rounded container;
- route title on the canvas;
- full monitor use;
- board-centric workspaces use available width.

## 8.5 Mobile target

- one bottom nav;
- safe-area padding;
- no fake phone status spacer;
- no route-local full-height phone viewport;
- document scroll is primary;
- no duplicate fixed bottom navigation;
- board approaches edge-to-edge while preserving usable margins.

## 8.6 Do not use AppShell task/context slots to justify lifting Trainer state

`AppShell` exposes `task` and `context`, but the current Trainer controller is deeply owned by `BlundrApp`.

Do not lift Trainer state into `TrainRouteShell`/`AppShell` just to use shell columns.

Implement the board/coach two-column presentation **inside the existing Trainer render boundary** unless a separate architecture task is approved.

---

# 9. GLOBAL DESIGN SYSTEM BOUNDARIES

Create a shared application presentation token layer for:

- canvas;
- surfaces;
- elevated surfaces;
- subtle surfaces;
- app forest green;
- text tones;
- semantic status colors;
- border alpha;
- shadows;
- radius;
- spacing;
- typography;
- focus;
- overlay backdrop;
- max content widths.

## 9.1 Do not absorb chess-semantic colors into global tokens

Board and instructional visuals are behaviorally meaningful.

Do not globally normalize:

- board square colors;
- selected-square colors;
- legal-move dots;
- capture indicators;
- last-move highlights;
- evaluation bar;
- visual-recipe primitives;
- projective tactical overlays;
- teaching from/to highlights;
- check/checkmate states;
- promotion visuals.

Existing board theme/piece/visual semantics remain independently owned.

## 9.2 Scope global CSS carefully

Avoid broad global rules against:

- all `button`
- all `section`
- all `svg`
- all `main`
- chessboard square elements

when they could change geometry or interaction.

Prefer scoped classes/CSS modules/tokens.

## 9.3 New motion

Do not add gratuitous route/page animations.

Any new presentation transition must respect `prefers-reduced-motion`.

Existing ring and reward motion keeps existing behavior.

---

# 10. CARD / PAGE HIERARCHY

Canvas is not a card.

Page header is usually not a card.

A section should have one meaningful surface, not multiple decorative nested frames.

Remove page-within-page debt such as:

- child `min-h-screen` backgrounds inside AppShell;
- `max-w-md` phone shells on desktop;
- fake status bars;
- nested route-level scrolling;
- redundant bordered wrappers.

Do not remove inner containers that carry actual state/action semantics.

---

# 11. SCREEN-BY-SCREEN TRANSFORMATION

# 11A. HOME `/`

## Baseline live owner

`BlundrApp` home branch → `Figma5303HomeScreen`.

Do not switch behavior owner in this PR.

## Preserve live behavior

- repertoire progress prop/fallback loading;
- local-demo distinction;
- authoritative progress-summary ring fetch;
- date-key behavior;
- storage refresh;
- Daily-ring event refresh;
- focus refresh;
- visibility refresh;
- ring conversion;
- current streak;
- longest streak;
- total all-ring days;
- repertoire points;
- unlock progress;
- Current Openings;
- Train opening callbacks;
- Daily `/daily`;
- Start training `/train`;
- profile/settings access;
- existing fallback/loading presentation semantics.

## Preserve ring child

Use the exact frozen `NestedDailyRings`.

Do not recreate rings.

## Presentation debt to remove

- `max-w-[430px]`;
- fake 48px status spacer;
- whole-route phone frame;
- nested route scrolling;
- excessive duplicate progress decoration.

## Desktop target

Top row:

- page/brand context;
- streak/profile utility.

Primary grid:

- left: Today / exact concentric rings / next action / training CTA;
- right: Current Openings and next relevant repertoire action.

Supporting area:

- Daily Blundr entry;
- streak/best/closed-days;
- repertoire points/unlock progress.

## Mobile target

1. header
2. exact rings
3. next action
4. Train CTA
5. Current Openings
6. Daily Blundr
7. stats
8. bottom nav

## Home-specific red line

Do not replace the live Figma Home data lifecycle with a direct `DailyRingsCard` mount during this PR.

Do not delete `DailyRingsCard` as “unused” during this PR.

First prove reachability and behavior ownership separately.

---

# 11B. TRAIN SELECTION `/train` WITHOUT `openingId`

## Route contract

`TrainRouteShell` resolves query/initial opening ID.

No canonical opening → `TrainSelectionPage`.

Canonical opening → keyed `BlundrApp`.

Preserve exact canonicalization.

## Preserve keyed remount

Current Trainer mount is effectively:

`<BlundrApp key={canonicalOpeningId} initialTab="train" initialOpeningId={canonicalOpeningId} />`

That `key` intentionally resets the large Trainer controller when the canonical opening changes.

**Do not remove the key.**

Do not replace it with an effect-driven state reset.

## Preserve selection states/actions

- loading;
- signed out;
- error;
- no progress;
- ready;
- unlocked openings;
- locked openings;
- Open Daily shortcut;
- “Need a different opening?” → Repertoire path;
- canonical opening IDs;
- Train callback;
- unlock ordering.

## Target

Desktop: 2–3 column opening browser.

Mobile: one-column cards.

No second opening list.

---

# 11C. ACTIVE TRAINER

Highest-risk surface.

## Absolute rules

- do not rewrite `TapChessboard`;
- do not refactor Trainer state;
- do not alter `BlundrApp` ownership;
- do not move behavior into AppShell;
- do not resurrect disabled legacy teaching surfaces;
- do not delete debug state;
- do not change reward/ring completion calls.

## Preserve session/runtime behavior

- repertoire/opening identity;
- canonical opening;
- White/Black;
- orientation;
- restricted/continuation;
- account rating band;
- reviewing-history;
- reset;
- current trainer phase/frame;
- authoritative trainer session;
- runtime line/fingerprint;
- restricted completion;
- learning persistence;
- first-recall authority.

## Assisted / Plain

Exact semantics remain.

Assisted:
- shows visual pattern cue before the move.

Plain:
- independent recall;
- no pre-answer leakage.

Keep view-change telemetry/clearing behavior.

## Preserve exact `TapChessboard` contract

- game
- orientation
- selectedSquare
- squareStyles
- lines
- transientLines
- projective visuals
- fade/line/label visibility
- `onSquareTap`
- evaluation
- settings
- captured
- userColor
- animation
- adaptive opening identity
- pending promotion
- promotion select/cancel

## Board auxiliaries

Preserve:

- captured strips;
- material advantage;
- eval bar;
- coordinates;
- board themes;
- piece rendering;
- move/legal state;
- opponent last-move display;
- visual recipes;
- replay/skip where currently reachable;
- projective tactics;
- promotion chooser;
- board history.

## History / lesson progress

History remains **below the board**.

No new lesson-progress line beside the board.

If restricted learner progress is supplied through current `HistoryControls`, it stays there only.

## Teaching owner

Preserve current visible teaching ownership.

Do not re-enable branches currently hard-disabled with `false && ...`.

Do not add a second “next move”/answer card.

Do not expose exact move in Plain mode before existing authority.

## Feedback

Preserve:

- Your move
- Opponent thinking
- Correct
- Not quite
- Illegal
- Review mode
- terminal/game-end feedback
- Maia retry action

## Completion

Preserve exact:

- line-complete latch;
- Continue;
- Repeat;
- Finish;
- explicit continuation entry.

Do not auto-continue.

## Continuation / Maia

Preserve:

- exact current FEN;
- continuation session/path;
- approved candidate behavior;
- fail-closed Maia;
- no stockfish/random substitute opponent;
- stale-request guard;
- retry from same continuation position;
- current last-move identity;
- terminal state.

## Battery

Battery remains a server-verified learner checkmate award.

Never reinterpret continuation completion as Battery completion.

## Target desktop

Approximately:

- 60–65% board workspace;
- 35–40% coach/context.

Board may grow toward ~600–720px as space allows.

History stays below board.

## Mobile

1. title/opening/rating/mode
2. Assisted/Plain
3. captured
4. board/eval
5. captured
6. history
7. teaching/feedback
8. actions
9. continuation/terminal
10. bottom nav

---

# 11D. RESTRICTED LINE COMPLETION / HANDOFF

Treat as separate QA state.

Preserve exact:

- completion proof;
- availability condition;
- Continue;
- Repeat;
- Finish;
- explicit continuation.

Do not pre-schedule Maia.

Do not auto-enter continuation.

---

# 11E. CONTINUATION / MAIA

Preserve the current fail-closed contract.

If Maia is unavailable:

- say it is unavailable;
- do not play a substitute;
- expose Retry only when current authority allows;
- retry from exact current position.

Do not mask provider failure behind an indefinite loading state.

---

# 11F. REVIEW `/review`

Keep `ReviewHub` as controller.

Preserve:

- capability loading;
- Daily availability;
- Daily first/primary placement;
- Daily completed/remaining/reserved/server-owned metrics;
- Start / Resume / Complete;
- exactly three production minigames;
- capability disabled/unavailable states.

Production minigames:

- Deep Tactic Shots
- Knight Gymnasium
- King & Pawn Lab

Daily remains separate from standalone minigames.

Do not imply minigames close the Daily ring unless authority says so.

---

# 11G. DAILY `/daily`

## Route

`/daily` remains canonical.

`/daily-blundr` continues redirecting to `/daily`.

## Controller

Keep `ProductionDailyBlundrScreen`.

Keep `DailyBlundrBoard`.

## Preserve load/recovery

- `/api/blundr/daily/today`;
- auth-required message;
- feature-disabled message;
- generic failure message;
- opening-selection-required message;
- exact recovery route `/onboarding/starter-pack`;
- Try again;
- server-owned loading copy.

## Preserve card-visible content

For every current card retain:

- activity ID;
- `Task x of y`;
- title;
- prompt;
- `why`;
- board state;
- interaction type;
- choices when present;
- feedback;
- verified teaching move;
- teaching `from → to`;
- teaching note;
- resulting verified-position explanation.

## Preserve completed state

When no card remains:

- Daily complete;
- first-attempt immutability message.

Do not replace it with a generic “Done.”

## Preserve action authority

- completed-fingerprint selection;
- action ID;
- expected version;
- attempt;
- reveal;
- retry;
- correct answer;
- checkpoint;
- Continue;
- 409 reload;
- unchanged deck on failed safe save;
- ring refresh on completion;
- reward-presentation refresh.

## Preserve board disable conditions

Board remains disabled when current behavior says:

- action busy;
- resolved checkpoint;
- teaching already displayed;
- card does not accept board input.

## Desktop target

Board left, content/actions right.

## Mobile target

task/title → board → prompt/why → choices → feedback → Reveal/Retry → verified teaching → Continue.

---

# 11H. `/minigames` ALIAS/HUB

Keep current relationship to Review hub.

Do not create a second catalog/registry/API.

---

# 11I. MINIGAME RUNNER `/review/minigames/[miniGameId]`

Keep `MiniGamePracticeRunner`.

Preserve:

- authenticated secure instance creation;
- 15-second timeout;
- server-owned solution;
- revision;
- prompt;
- goal;
- truncated instance ID;
- status;
- advance;
- reveal;
- retry;
- reset;
- board move submission;
- feedback;
- error;
- Next Game;
- Review;
- Home.

## Explicit terminal/disable states

Preserve board-disable behavior for:

- `completed`;
- `revealed`;
- `expired`;
- submission in progress.

Do not collapse `expired` into generic unavailable.

All six controls remain:

- Reveal
- Retry
- Reset
- Review
- Home
- Next Game

---

# 11J. PROGRESS `/progress`

Keep `ProgressDashboard`.

Preserve `/api/blundr/progress/summary`.

Preserve listeners:

- storage;
- Daily ring refresh;
- focus.

Preserve **manual Refresh** button/action.

## Daily rings

Exact frozen `NestedDailyRings`.

## Today

Preserve:

- next best action;
- ring status;
- ring values;
- Continue Training / Daily destinations as currently derived.

## Weekly consistency

Preserve full seven-day data.

For each day preserve:

- date/label;
- has training;
- all rings closed;
- review count.

Do not replace the weekly grid with one total.

## Training volume

Preserve today/week:

- opening runs;
- Battery;
- Daily Blundr;
- review attempts if currently displayed/available;
- minigames.

## Accuracy / recall

Preserve:

- correct;
- incorrect;
- `accuracyPct`;
- enough-data gating;
- message.

## Repertoire

Preserve:

- unlocked;
- locked;
- available points;
- next unlock cost;
- next unlock percentage;
- most trained;
- recommended.

## Weak areas

Preserve all items/miss counts/message.

## Milestones

Preserve every returned item.

## Recent activity

Preserve every returned item/tone.

## Next actions

Preserve current first five and hrefs.

## Footer

Preserve:

- generatedAt;
- refresh count.

---

# 11K. REPERTOIRE `/repertoire`

Keep `RepertoireProgressPanel`.

Preserve:

- durable progress hook;
- page-view analytics;
- unlock attempt/failure analytics;
- unlock endpoint;
- UUID idempotency key;
- refresh after unlock;
- loading;
- signed-out;
- error;
- Train callback.

Preserve components/content:

- `RepertoirePointsSummary`;
- `RepertoireUnlockProgress`;
- `RepertoireTempoCallout`;
- `RepertoireOpeningGrid`;
- reward history;
- starter pack.

`RepertoireOpeningGrid` remains the only opening inventory source.

Preserve:

- unlocked/locked order;
- Train;
- Unlock;
- unlocking state;
- all-unlocked empty state;
- “Tempo will open them in order”.

## Reward history

Retain:

- reward name;
- rarity;
- Applied/Granted;
- description;
- trigger;
- amount;
- timestamp;
- empty-state imagery;
- pity status;
- last random reward date.

## Starter pack

Retain:

- display name;
- short name if shown;
- White opening;
- Black opening.

---

# 11L. OPENING DETAIL `/repertoire/[openingId]`

## Production owner

Use:

`OpeningDetailRouteClient` → `OpeningDetailPage`

Do not substitute the fixture-oriented `OpeningDetailShell` as production source.

## Route-client states

Preserve:

- auth loading / “Checking your account session”;
- signed out;
- authenticated request;
- 403 locked/unavailable-access copy;
- 404 unavailable copy;
- generic temporarily-unavailable copy.

Locked/unknown are route-response outcomes, not merely interchangeable `model.state` values.

## Read-model states

Preserve distinct:

- `ready`;
- `empty`;
- `stale`;
- `partial`;
- `error`.

Do not normalize them.

## Exact production composition

Preserve current functional sections:

- `OpeningHeroCard`;
- `OpeningIntelligenceStrip`;
- correct state component;
- `OpeningMasteryMap`;
- `WeakBranchCards`;
- `OpeningGameIntelligence`;
- `OpeningProgressTimeline`.

## Hero fields/actions

Preserve:

- opening name;
- side;
- Active access;
- mastery percentage;
- Train opening → exact opening route;
- Practice today’s weaknesses → `/daily`.

## Intelligence strip — all six values

- Mastered
- Learning
- Weak
- Unseen
- Imported games
- Unaided accuracy

## Mastery / weakness

Preserve:

- nodes/tree;
- weak branches;
- categories;
- priority values;
- opening IDs used for actions.

## Game intelligence

Preserve imported/matched game information and freshness semantics.

## Progress timeline

Preserve first-attempt unaided accuracy and retention/progress status currently surfaced.

No live metric/action may be removed because the mockup did not include it.

---

# 11M. SETTINGS `/settings`

Keep `SettingsPage` as owner.

Remove only the decorative nested whole-page frame.

Safer desktop pattern:

- sticky left anchor index;
- all sections remain in DOM;
- existing section IDs remain;
- browser anchor behavior remains.

Do not convert to hidden stateful tabs in the first pass.

## Exact nine sections

1. Account
2. Connected Game Data
3. Subscription
4. Training Preferences
5. Daily Goals
6. Display & Accessibility
7. Data & Privacy
8. Support & About
9. Developer Tools

## Account

Preserve:

- auth unresolved;
- authenticated;
- local demo;
- account label;
- goal summary;
- board summary;
- sign out;
- existing delete-account-later placeholder;
- embedded sign-in/create modes;
- email;
- password;
- Continue local demo;
- current profile;
- selected starter pack;
- username editor;
- private email;
- auth message;
- auth error.

### Embedded Settings auth must not be “unified” with `AppAuthForm`

The Settings account section currently has its own lifecycle/helpers.

Standalone `/signup` has a different route/API flow.

Do not replace the Settings embedded form with `AppAuthForm` merely for code reuse.

Presentation components can be shared only if the existing handlers remain owner.

## Connected Game Data

Keep `ConnectedGameDataPanel`.

### Preserve live state ownership/mapping

The live panel currently maps account/job states through its own `ProviderState`.

The broader compatibility `GameDataStatus` model additionally contains:

- disconnected
- verifying
- queued
- connected
- syncing
- current
- delayed
- partial
- retryable_error
- permanent_error
- deletion_in_progress
- deletion_success
- deletion_failure

`ProviderConnectionCard` also recognizes compatibility display states:

- deleting
- deleted

**Do not normalize these models in the UI PR.**

Preserve the existing owner/mapping even if the naming looks inconsistent.

### Preserve provider behavior

- Chess.com
- Lichess
- public username only copy
- no provider passwords copy
- Privacy link
- auth loading
- signed out
- feature-disabled message
- session-expired message
- connect username
- first-sync waiting state
- last successful sync
- fetched/scanned count
- accepted count
- matched count
- gated count
- findings count
- Sync now
- Disconnect
- Disconnect and delete
- disconnect dialog
- refresh on focus
- 4-second polling while queued/leased/running
- busy/disabled controls.

Do not rewrite job/provider state logic.

## Subscription

Preserve current truth:

- billing is not wired;
- Pro is coming later.

Do not add prices/checkout/paywall/entitlement behavior.

## Training Preferences

Preserve exact rating bands and descriptions.

Preserve authenticated save behavior and rollback.

Preserve rollback of **all relevant profile-controlled values**, not only rating:

- rating band;
- goals;
- preferred mode.

Preserve board preferences:

- Default
- Blue
- Walnut
- Unicode
- Neo
- Letters
- coordinates
- White/Black orientation

Preserve current local storage + sync semantics.

## Daily Goals

- Tempo
- Battery
- Daily Blundr
- min 1
- max 100
- existing onBlur persistence
- current goal summary
- starter pack reference

## Display & Accessibility

Preserve current truth:

- reduced motion follows system;
- compact mode is not wired.

Do not invent compact-mode state.

Viewport zoom correction is the isolated exception in section 5.

## Data & Privacy

Preserve:

- local demo/account explanation;
- Reset local data;
- existing `window.confirm`;
- Export later placeholder;
- delete-account/support placeholder copy;
- Privacy link.

## Support & About

Preserve baseline links/copy during strict parity.

If developer links are gated, do it only via the isolated hardening exception.

## Developer Tools

Preserve current `snapshot.devToolsEnabled` condition.

Preserve:

- Admin gate;
- game-data health.

Do not expose gated content.

---

# 11N. PROFILE `/profile`

Keep `BlundrProfilePage`.

Preserve:

- auth loading;
- loading skeleton;
- signed-out state;
- exact signed-out path `/login?next=%2Fprofile`;
- load error;
- retry via load-attempt increment;
- ready;
- saving;
- API error;
- saved success.

## Username

Preserve:

- 3–24 chars;
- letter first;
- lowercase letters/numbers/underscore;
- server validation result;
- changed-state gating;
- `autoCapitalize="none"`;
- `autoComplete="username"`;
- `spellCheck={false}`;
- `aria-invalid`;
- `aria-describedby`;
- status region;
- Save disabled until valid + changed.

## Identity separation

Preserve:

- public username;
- private sign-in/recovery email.

Do not merge them into one “Account” label.

Keep Settings destination.

---

# 11O. ONBOARDING V11

Keep current route/state ownership.

## Exact step order

1. `welcome`
2. `level`
3. `priorities`
4. `training-loop`
5. `pace`
6. `starter-pack`
7. `training-mode`
8. `plan`
9. `ready`

Preserve saved resume routing.

Preserve PATCH-per-step.

Preserve complete endpoint.

Preserve completed redirect.

Preserve errors and busy state.

## Level — explicit choice is intentional

The current flow intentionally does **not** treat the database default rating as a user decision when the durable resume step is `level`.

Do not preselect a default Level merely because a profile value exists.

The user must make the explicit current choice when baseline logic requires it.

Choices:

- Beginner — Under 800
- Improver — 800–1200
- Club — 1200–1600
- Advanced — 1600–2000
- Expert — 2000+

## Priorities

Preserve multi-select semantics and non-empty requirement:

- Stop forgetting openings
- Build a complete repertoire
- Know what to do after the opening
- Review mistakes every day
- Prepare for games

## Training loop

Preserve conceptual three-ring explanation:

- Tempo
- Battery
- Daily Blundr

and close-all-three streak concept.

Do not fake real user progress in onboarding merely for aesthetics.

## Pace

Preserve existing:

- Light
- Standard
- Focused

and current server goal mapping.

## Starter pack

Use actual packs/IDs.

## Training mode

- Assisted
- Plain

## Plan

Render actual persisted state.

## Ready

Preserve selected-pack first-Tempo routing.

## Legacy onboarding

Do not delete older onboarding support/migration components in this visual PR.

---

# 11P. LOGIN / SIGNUP

Keep `AppAuthForm`.

Preserve:

- safe `next` target resolution;
- `source`;
- password-reset-success query state;
- login helper;
- signup POST behavior;
- email-confirmation outcome;
- age ≥13 confirmation;
- password requirements;
- forgot-password link;
- support email;
- busy state;
- status messages;
- Login/Create Account cross-link.

Do not use the Settings embedded auth implementation here.

Do not merge the two auth lifecycles without separate architecture review.

---

# 11Q. PASSWORD RECOVERY / CONFIRM / AUTH CALLBACKS

Keep them shell-exempt according to their current gate behavior.

Style only.

Do not modify:

- token parsing;
- query parsing;
- redirects;
- callback ownership;
- Supabase/auth lifecycle;
- password autocomplete semantics;
- success/error state meanings.

---

# 11R. AUTHENTICATED ACCOUNT HYDRATION GATE

Keep exact:

- authentication requirement;
- 8-second bootstrap timeout;
- POST bootstrap;
- bearer token;
- timezone;
- snapshot persistence;
- analytics;
- ring refresh dispatch;
- signed-out redirect;
- fail-closed error;
- Retry;
- Rewards V2 host ownership.

Do not render protected content optimistically.

Do not consolidate its exemption list with another gate.

---

# 11S. ONBOARDING ROUTE GATE

Keep:

- V11 feature flag;
- auth loading;
- signed-out redirect;
- onboarding state request;
- incomplete-state redirect;
- completed-state pass;
- fail-closed load error;
- retry requestVersion;
- exact independent exemption list.

---

# 11T. REWARDS

## Rewards V2 owner

`RewardPresentationHost` remains the sole authenticated server-leased owner.

Preserve:

- env enable flag;
- per-tab claimant;
- claim endpoint;
- focus resume;
- visibility resume;
- reward refresh event;
- rendered-state POST;
- acknowledged-state POST;
- dismissed-state POST;
- active presentation;
- claim next;
- unavailable SR-only state.

## Critical modal lifecycle rule

The current reward overlay has explicit:

- Dismiss
- Done

It does **not** currently gain dismissal through generic `BlundrModal` Escape/backdrop behavior.

Therefore:

**Preferred UI implementation: restyle the existing RewardPresentationHost dialog structure.**

Do not wrap it with `BlundrModal` unless a separately reviewed behavior mapping defines:

- what Escape means;
- what backdrop click means;
- what close-X means;
- which server state each maps to;
- what happens if that server update fails.

Without that mapping, Escape/backdrop must not silently close the reward.

## Other reward surfaces

Audit/preserve:

- `TempoCacheModal`
- `TempoCacheCard`
- `RewardRevealCard`
- `RewardAnimation`
- `RewardPointsFloat`
- `RewardHistoryList`
- rarity badges/icons
- any reachable local/legacy presentation path

Do not delete them based only on apparent duplication.

---

# 11U. GLOBAL ERROR

Keep:

- `Sentry.captureException(error)`;
- `reset()`.

Preserve Next global-error html/body requirements.

Restyle only.

---

# 11V. PRIVACY / LEGAL

Privacy text is not part of a UI rewrite.

Preserve:

- metadata;
- effective/updated date;
- every current heading;
- every current paragraph;
- generated heading IDs;
- hierarchy.

Only alter presentation.

Any future legal-route implementation implied by gate prefixes is a separate task.

---

# 11W. DEVELOPER ROUTES

Verified dev tree includes:

- `/dev/admin`
- `/dev/ui-screens`

Preserve all gating and diagnostics.

Apply design tokens only where they do not obscure functional/debug information.

Developer-link hardening follows the isolated exception above.

---

# 12. EXISTING ASSETS VS NEW ASSETS

## 12.1 Existing production assets must remain

The application already uses:

- `BLUNDR_BRAND_ASSETS`;
- `BLUNDR_TEMPO_ASSETS`;
- `BLUNDR_EMPTY_STATE_ASSETS`;
- `BlundrAssetImage`;
- manifest-managed favicon/app icon/apple touch icon;
- existing Review/Repertoire/Settings imagery.

The structural UI pass must not strip these because “assets come later.”

## 12.2 What “asset integration later” actually means

Do not add the **newly supplied asset package** until structural presentation is stable.

When adding it:

- normalize approved exports;
- register through `blundrAssetManifest`;
- use `BlundrAssetImage`;
- avoid direct raw duplicated paths;
- avoid changing existing semantic asset contracts unless explicitly reviewed.

Suggested *new* asset mapping remains:

- wordmark → shell/auth/onboarding
- neutral Tempo → onboarding/profile
- coach → Trainer/Repertoire guidance
- pointing → next action
- thinking → loading/analysis
- success/celebration → major completion
- reward → reward presentation
- sad → failures sparingly

Use restraint.

---

# 13. PRESENTATIONAL COMPONENT RULES

Safe new primitives are small/stateless wrappers:

- page header
- page grid
- section
- surface
- toolbar
- segmented-control **presentation**
- inline status
- sheet frame

They may not:

- fetch;
- call APIs;
- transform IDs;
- infer completion;
- infer access;
- change action IDs;
- generate idempotency keys;
- decide route gates;
- own business state;
- reset Trainer state.

If a component needs one of those responsibilities, it is no longer merely presentational.

---

# 14. MODAL / SHEET CONTRACT

Generic `BlundrModal` currently:

- locks body scroll;
- focuses close;
- closes on Escape;
- closes on backdrop;
- has dialog ARIA.

Use it only where those semantics are already compatible.

Do not force all overlays into one modal abstraction.

Audit independently:

- Add Custom Line
- board settings
- provider disconnect
- promotion chooser
- Tempo Cache
- generic confirmations
- Rewards V2

**Rewards V2 is explicitly not automatically compatible.**

Preserve each overlay's existing close/dismiss lifecycle.

---

# 15. TRUTHFUL STATE CONTRACT

A unified visual style must not unify semantic states.

Keep distinctions such as:

- auth required ≠ generic error
- locked ≠ empty
- unknown route ≠ locked read model
- partial ≠ delayed ≠ current
- stale ≠ network failure
- feature disabled ≠ offline
- Maia unavailable ≠ generic opponent thinking
- expired minigame ≠ completed
- durable-store failure ≠ local-demo success
- Daily opening-selection-required ≠ generic Daily failure
- reward unavailable ≠ no reward queued.

---

# 16. RESPONSIVE CONTRACT

Required QA widths:

- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440

## 360 / 390

- no horizontal route scroll;
- board usable;
- bottom nav clears CTA;
- safe-area;
- rings un-clipped;
- modal/sheet usable;
- Settings stacks;
- 44px controls where feasible;
- mobile zoom enabled after approved viewport exception.

## 430

Same hierarchy with slightly wider spacing.

## 768

No narrow phone frame floating inside tablet.

## 1024

Trainer may switch to board+context only when comfortable.

## 1280 / 1440

Use full workspace.

Board visually dominant.

No phone-shaped route column.

---

# 17. VERIFIED ROUTE INVENTORY VS GATE CONTRACT

Maintain two artifacts.

## 17.1 Verified page surfaces at baseline

Include the verified app surfaces in QA:

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- auth/callback surfaces actually present under `/auth`
- `/confirm`
- `/onboarding`
- `/onboarding/[step]`
- `/train`
- `/daily`
- `/daily-blundr` redirect
- `/review`
- `/review/minigames/[miniGameId]`
- `/minigames`
- `/progress`
- `/repertoire`
- `/repertoire/[openingId]`
- `/settings`
- `/profile`
- `/privacy`
- `/dev/admin`
- `/dev/ui-screens`
- global error

## 17.2 Gate-contract-only prefixes

Keep the exact per-gate prefix lists from section 7 even when a matching page was not verified.

Do not invent a route to satisfy a prefix.

---

# 18. TEST / CI GATES

# 18.1 Changed-file guard

Fail if visual PR touches unapproved behavior domains.

Any exception must be separately labeled and justified.

# 18.2 Render-ownership baseline test

Before changing visual composition, prove current owner for each route.

Especially:

- Home live owner;
- Train keyed remount;
- Daily;
- Progress;
- Opening detail;
- Rewards owner.

Do not infer ownership from imports alone.

# 18.3 Home test

Preserve current reachable Home lifecycle:

- initial load;
- authenticated progress-summary request;
- local demo;
- storage refresh;
- Daily-ring event;
- focus;
- visibility;
- rings;
- Current Openings;
- Train;
- Daily;
- streak;
- points.

Assert UI migration does not silently switch from the baseline owner to a different ring wrapper.

# 18.4 Ring preservation

Do **not** require Home and Progress to have identical direct imports.

Instead test the rendered invariant:

- canonical `NestedDailyRings` present on required surfaces;
- exactly three ring IDs/order;
- exact radii/colors/widths;
- exact center constants;
- 700ms progress transition;
- 1100ms close pulse;
- 1400ms all-close celebration;
- no pulse on initial mount;
- reduced motion;
- detail cards;
- streak footer;
- ARIA group label.

Optional: temporary source-file hash gate.

# 18.5 Route-gate contract tests

Snapshot independently:

- Responsive shell exemptions;
- hydration exemptions;
- onboarding exemptions;
- prefix matching.

Explicit regression:

`/account-deletion` stays shell-exempt at baseline while not being silently added to the other two gate arrays.

# 18.6 Navigation

Assert:

- only one rendered `nav[aria-label="Primary"]`;
- five exact links;
- exact hrefs;
- `aria-current`;
- AppShell suppression of BottomNav;
- BottomNav fallback when shell absent;
- Settings/Profile/paywall fallback active-state semantics.

Do not require only one source array.

# 18.7 Trainer route

Test switching canonical opening IDs remounts/resets Trainer as baseline key semantics require.

# 18.8 Trainer

All target widths:

- White;
- Black;
- Assisted;
- Plain;
- correct;
- incorrect;
- illegal;
- visual recipe;
- projective tactic;
- board theme;
- piece set;
- coordinates;
- eval;
- captured;
- history;
- promotion;
- line complete;
- Repeat;
- Finish;
- Continue;
- Maia normal;
- Maia unavailable;
- Retry;
- terminal;
- learner mate;
- Battery +1;
- refresh exact-once.

# 18.9 Daily

- load;
- activity ID;
- Task x/y;
- title;
- prompt;
- why;
- board;
- non-board choice card;
- correct;
- incorrect;
- Reveal;
- verified move;
- from/to;
- Retry;
- Continue;
- completion/immutability copy;
- 409 reload;
- opening-selection-required → `/onboarding/starter-pack`;
- signed out;
- feature disabled;
- generic failure;
- ring refresh;
- reward refresh.

# 18.10 Minigames

Each of three:

- secure instance;
- timeout;
- prompt;
- goal;
- instance ID/status;
- board;
- advance;
- Reveal;
- Retry;
- Reset;
- completed;
- revealed;
- expired;
- Next Game;
- Review;
- Home;
- auth loading;
- signed out;
- unavailable.

# 18.11 Progress

- manual Refresh;
- storage/ring/focus refresh;
- exact rings;
- seven days;
- per-day training/all-closed/review count;
- all volume fields;
- accuracy gating;
- repertoire;
- weak areas;
- milestones;
- recent activity;
- first five next actions;
- generatedAt;
- refresh count.

# 18.12 Repertoire

- load;
- auth;
- error;
- points;
- unlock;
- UUID idempotency;
- locked/unlocked order;
- train;
- reward history;
- pity;
- starter pack;
- all-unlocked.

# 18.13 Opening detail

Route outcomes:

- auth loading;
- signed out;
- 403;
- 404;
- generic error.

Read model:

- ready;
- empty;
- stale;
- partial;
- error.

Ready content:

- side;
- active access;
- mastery;
- Train opening;
- Daily weaknesses;
- Mastered;
- Learning;
- Weak;
- Unseen;
- Imported games;
- Unaided accuracy;
- mastery map;
- weak branches;
- game intelligence;
- progress timeline/retention.

# 18.14 Settings

All nine sections.

Test:

- embedded auth stays its current lifecycle;
- username remains in Settings;
- rating rollback;
- goal rollback;
- mode rollback;
- themes;
- pieces;
- coordinates;
- orientation;
- goals/onBlur;
- reset confirm;
- placeholders;
- game-data exact state mapping;
- 4s polling;
- disconnect/delete;
- developer tools flag.

# 18.15 Profile

- exact signed-out next path;
- input autocomplete/capitalization/spellcheck;
- validation;
- ARIA;
- save state;
- private email;
- Settings link.

# 18.16 Onboarding

- exact 9 steps;
- resume;
- back;
- save;
- failure;
- complete;
- **level step requires explicit choice when baseline requires**;
- priorities multi-select;
- pace mapping;
- starter pack;
- mode;
- plan;
- ready route.

# 18.17 Standalone auth/recovery

- safe next;
- signup age;
- email confirmation;
- reset success;
- forgot-password;
- callback routes;
- no semantic merge with Settings embedded auth.

# 18.18 Rewards

- env disabled;
- claim;
- rendered state;
- Dismiss → dismissed;
- Done → acknowledged;
- next queued;
- focus/visibility refresh;
- unavailable SR status;
- **Escape/backdrop do not silently close or mutate the V2 presentation unless a separately approved mapping exists**;
- reduced motion where applicable.

# 18.19 Existing assets

Assert existing manifest-managed assets still render on their current production surfaces before new asset integration.

# 18.20 Accessibility

- landmarks;
- one rendered primary nav;
- keyboard;
- focus;
- truthful dialogs;
- status/alert;
- board square labels;
- contrast;
- reduced motion;
- desktop/browser 200% zoom;
- mobile pinch zoom after `maximumScale` exception;
- no horizontal overflow.

---

# 19. IMPLEMENTATION SEQUENCE

## Phase 0 — evidence + reachability map

- exact SHA;
- test baseline;
- screenshot/video baseline;
- live owner map;
- legacy/alternate render map;
- route-gate prefix snapshot;
- no code deletion.

## Phase 1 — token + shell

- global presentation tokens;
- AppShell CSS;
- desktop rail;
- mobile nav presentation;
- typography;
- content width;
- focus;
- no child behavior changes.

## Phase 1A — accessibility viewport exception

Separate commit:

- remove `maximumScale: 1`;
- validate mobile zoom;
- no other layout behavior changes.

## Phase 2 — remove decorative nested route frames

One surface at a time.

Remove decorative:

- `min-h-screen` child canvas;
- duplicate backgrounds;
- phone-width route frame;
- fake status spacer;
- nested route scroll.

Do not alter live controller/effects.

## Phase 3 — Home

Recompose the **currently live Home owner**.

- exact rings;
- same effects/data;
- Current Openings;
- Daily;
- stats.

Do not switch to `DailyRingsCard`.

Do not delete legacy alternate Home code.

## Phase 4 — lower-risk dashboards

- Progress;
- Repertoire;
- Opening Detail;
- Review.

## Phase 5 — Settings / Profile / Auth / Onboarding

Presentation only.

Do not unify lifecycle code.

## Phase 6 — Daily / Minigames

Recompose board/action layouts.

Keep controllers.

## Phase 7 — Active Trainer

Last large surface.

Recompose render only.

No state-machine cleanup.

## Phase 8 — rewards / overlays / system states

Restyle each existing owner.

Do not force Rewards V2 into `BlundrModal`.

## Phase 9 — NEW asset package

Preserve all old manifest asset use.

Add new approved assets through manifest only.

## Phase 9A — optional developer-link hardening

Separate reviewed hardening commit/PR.

Not buried in visual changes.

## Phase 10 — full immutable QA candidate

One exact candidate.

All screen/function parity.

No stable promotion until green.

---

# 20. COMMIT STRATEGY

Recommended reviewable commits:

1. `test: freeze UI ownership and parity baseline`
2. `ui: establish Blundr presentation tokens`
3. `ui: normalize application shell`
4. `a11y: allow user zoom`
5. `ui: remove decorative nested route frames`
6. `ui: migrate live Home without changing ownership`
7. `ui: migrate Review and Progress`
8. `ui: migrate Repertoire and opening intelligence`
9. `ui: migrate Settings and Profile presentation`
10. `ui: migrate standalone auth and onboarding presentation`
11. `ui: migrate Daily and minigame presentation`
12. `ui: migrate Trainer workspace presentation`
13. `ui: restyle overlays rewards and system states`
14. `ui: integrate approved new brand assets`
15. `test: prove responsive zero-loss parity`

Optional separately reviewed:

16. `hardening: hide developer links for non-dev users`

Each commit should be revertible.

No server/business migrations in these commits.

---

# 21. PER-COMPONENT REVIEW QUESTIONS

For every modified component answer:

1. What live state/effect did this component own before?
2. Is it still the live owner?
3. Did any reachable owner get swapped?
4. Did any API URL change?
5. Did method/body/header change?
6. Did expected version change?
7. Did idempotency/action ID change?
8. Did any event/listener disappear?
9. Did any route/href/recovery path change?
10. Did any callback change?
11. Did any keyed remount disappear?
12. Did any feature flag move?
13. Did any state enum get “simplified”?
14. Did any distinct error/locked/stale/expired state disappear?
15. Did any modal gain a new dismissal path?
16. Did any auth lifecycle get unified with a different auth implementation?
17. Did keyboard order change?
18. Did focus behavior change?
19. Did mobile/desktop hide a current feature?
20. Did debug UI become public?
21. Did a placeholder accidentally become a real feature?
22. Did existing asset usage disappear?
23. Did global CSS alter board semantics?
24. Did reward ownership duplicate?
25. Did ring implementation change?
26. Did board implementation change?
27. Did a new lesson-progress element appear beside the board?
28. Was apparently-dead code deleted without reachability proof?

Any unexplained “yes” blocks merge.

---

# 22. MOCKUP CORRECTIONS BEFORE DESIGN AUTHORITY

The conceptual Apple-sleek mockup remains inspiration only until it includes/protects:

- actual concentric rings;
- exact center/detail/streak behavior;
- live Home owner/data semantics;
- Current Openings;
- all Progress data including week grid/manual refresh;
- all Repertoire/reward/starter-pack state;
- opening-detail full intelligence strip;
- mastery map/weak branches/game intelligence/progress timeline;
- Train/Daily-weakness actions;
- exact nine V11 steps;
- explicit Level choice behavior;
- all nine Settings areas;
- exact game-data state families;
- embedded Settings auth;
- all Daily visible fields;
- `/onboarding/starter-pack` Daily recovery;
- Daily immutable-complete message;
- minigame instance/status/expired state;
- all six minigame actions;
- existing Trainer history/progress placement;
- keyed opening remount;
- Maia unavailable/retry;
- reward explicit Dismiss/Done lifecycle;
- hydration/onboarding gate errors;
- profile input semantics;
- existing asset use;
- developer-link baseline vs hardening exception;
- Privacy/global error/dev surfaces.

---

# 23. ZERO-LOSS DEFINITION OF DONE

The migration is complete only when all are true:

- [ ] Exact baseline lineage documented.
- [ ] Reachability/owner matrix captured.
- [ ] No behavior-owner swap hidden in UI changes.
- [ ] No dead-code cleanup in the visual PR.
- [ ] Root gate order unchanged.
- [ ] Three gate exemption lists remain independently correct.
- [ ] `/account-deletion` asymmetry is not silently normalized.
- [ ] One rendered primary nav at a time.
- [ ] Five primary destinations unchanged.
- [ ] BottomNav fallback/suppression preserved.
- [ ] Daily stays under Review.
- [ ] `/daily-blundr` alias intact.
- [ ] Exactly three production minigames.
- [ ] Exact concentric rings preserved.
- [ ] Ring timing preserved.
- [ ] Ring reduced-motion preserved.
- [ ] Home live owner preserved.
- [ ] Progress ring owner preserved.
- [ ] Current Openings unchanged.
- [ ] Train selection Open Daily/Repertoire paths preserved.
- [ ] Canonical Train opening resolution unchanged.
- [ ] Keyed Trainer remount unchanged.
- [ ] Restricted Trainer unchanged.
- [ ] Assisted/Plain unchanged.
- [ ] No answer leakage.
- [ ] Board behavior unchanged.
- [ ] Board themes/pieces/coordinates unchanged.
- [ ] Global palette does not alter chess semantics.
- [ ] Captured/eval unchanged.
- [ ] Visual recipes/projective tactics unchanged.
- [ ] Promotion unchanged.
- [ ] History unchanged.
- [ ] No new lesson progress beside board.
- [ ] Line completion actions unchanged.
- [ ] Explicit continuation unchanged.
- [ ] Maia fail-closed/retry unchanged.
- [ ] Battery learner-checkmate authority unchanged.
- [ ] Daily action/version/first-attempt authority unchanged.
- [ ] Daily activity/task/title/prompt/why preserved.
- [ ] Daily verified teaching preserved.
- [ ] Daily starter-pack recovery preserved.
- [ ] Daily completion immutability copy preserved.
- [ ] Minigame revision/action semantics unchanged.
- [ ] Minigame expired state preserved.
- [ ] Minigame instance/status preserved.
- [ ] Progress seven-day grid preserved.
- [ ] Progress manual Refresh preserved.
- [ ] All Progress data sections preserved.
- [ ] Repertoire points/unlocks/rewards/pity unchanged.
- [ ] Opening detail route outcomes preserved.
- [ ] Opening intelligence all six values preserved.
- [ ] Opening Train/Daily actions preserved.
- [ ] Mastery map/weak/game/progress sections preserved.
- [ ] All nine Settings sections preserved.
- [ ] Settings auth lifecycle preserved.
- [ ] Settings username editor preserved.
- [ ] Settings save rollback preserved.
- [ ] Connected-game-data state ownership preserved.
- [ ] Chess.com/Lichess polling/actions preserved.
- [ ] Profile exact signed-out route preserved.
- [ ] Profile username browser/input semantics preserved.
- [ ] V11 nine steps preserved.
- [ ] Level explicit-choice semantics preserved.
- [ ] Auth standalone vs Settings embedded flows not conflated.
- [ ] Hydration remains fail-closed.
- [ ] Onboarding gate remains fail-closed.
- [ ] Rewards V2 remains sole owner.
- [ ] Reward explicit dismiss/ack semantics preserved.
- [ ] Reward overlay does not silently gain Escape/backdrop lifecycle.
- [ ] Sentry global-error capture preserved.
- [ ] Privacy text unchanged.
- [ ] Existing manifest asset uses intact.
- [ ] New assets manifest-driven only.
- [ ] Developer behavior baseline preserved or separately hardened.
- [ ] Mobile zoom exception tested.
- [ ] 360/390/430/768/1024/1280/1440 QA green.
- [ ] Keyboard/focus/status/ARIA green.
- [ ] No horizontal overflow.
- [ ] No duplicate shell.
- [ ] No page-within-page visual artifact.
- [ ] Same immutable candidate passes complete acceptance.
- [ ] No stable promotion until all green.

---

# 24. FINAL PRINCIPLE

The target is a dramatically newer-looking Blundr, not a newly implemented Blundr.

The safe transformation method is:

**Preserve the currently reachable controllers and lifecycle owners. Preserve authority. Preserve behavior-bearing components. Preserve intentionally separate models and gates. Remove only decorative wrapper debt. Replace only the presentation grammar.**

For the rings, 1:1 means the literal existing ring component.

For Home, 1:1 means the currently reachable Home lifecycle — not whichever ring wrapper looks architecturally cleaner.

For Trainer, 1:1 means the same keyed `BlundrApp`, same state machine and same `TapChessboard`.

For Daily, 1:1 means the same `ProductionDailyBlundrScreen` action controller and `DailyBlundrBoard`.

For connected-game data, 1:1 means preserving current state ownership even where the type model is not aesthetically normalized.

For rewards, 1:1 means the same server-leased owner and the same explicit acknowledgement/dismissal semantics.

For onboarding, 1:1 means the same durable step contract and explicit-choice behavior.

For Settings auth vs standalone auth, 1:1 means they may look alike without being silently merged into one lifecycle.

For existing assets, “integrate new assets later” does not mean removing what production already uses.

**If a change makes the code architecture cleaner but changes which component owns state/effects, it does not belong in this visual migration.**
