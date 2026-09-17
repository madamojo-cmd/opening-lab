# Blundr training demo transfer package

This folder contains the production-facing contracts for all five interactive landing-page sections demonstrated in the prototype:

- “When theory ends” opening-continuation demo.
- “Daily Blundr” personalized daily-practice demo.
- “Smart Review” missed-position review-loop demo.
- “Repertoire Mastery” animated progress-dashboard demo.
- “Consistency” animated three-ring daily-routine demo.

## Fast integration

1. Copy this folder into the `blundr-marketing` project.
2. Implement one thin `BlundrBoardAdapter` around the production board component. It must satisfy `MarketingBoardProps` from `MarketingTrainingDemo.tsx`.
3. Pass that adapter to the section:

```tsx
<MarketingTrainingDemo Board={BlundrBoardAdapter} tempoImageSrc="/brand/tempo-transparent.png" />
<DailyBlundrMarketingDemo Board={DailyBlundrBoardAdapter} />
<SmartReviewMarketingDemo Board={SmartReviewBoardAdapter} />
<MasteryMarketingDemo tempoImageSrc="/brand/tempo-transparent.png" />
<DailyRingsMarketingDemo />
```

4. Insert the section directly below the landing-page hero.
5. Keep the demo data local and deterministic. Do not load trainer, authentication, Maia, database, or account state.

## Board adapter mapping

Map these portable props to the production board’s existing API:

- `fen`: the current scripted position.
- `orientation`: always `white`.
- `arrows`: empty for this exact demo line.
- `highlightedSquares`: blue emphasis on the `c2` pawn and `c3` destination before the move, then `c3` after the move.
- `highlightColor`: always `blue`.
- `emphasizedSquare`: briefly `c5` after the black bishop arrives.
- `lastMove`: the current animated move.
- `interactive`: always false.
- `animationDurationMs`: 620 ms.

Reuse production piece assets, colors, move transitions, arrows, highlights, sizing, and reduced-motion conventions inside the adapter. Do not ship a second board implementation in production.

The Daily adapter follows the same boundary and receives a deterministic FEN, Black orientation, green source/destination highlights, the `e6–d5` last move, and disabled interaction.

The Smart Review adapter receives a deterministic Fried Liver position with White orientation. It first animates the legal but inferior `Nf6–d5`, resets to the identical starting FEN, and then animates the correct `Nc6–a5`. Reuse the production board’s amber and green move highlights and keep interaction disabled.

The Repertoire Mastery section does not need a board adapter. It uses four deterministic local frames and requestAnimationFrame to count the dashboard from 0% to 26% mastery, while mastered/learning/accuracy rise and weak/unseen fall. Reuse the production repertoire card where practical, but do not connect the marketing demo to user data or production mastery calculations.

The Consistency section uses three deterministic local states and the production three-ring presentation where practical. Daily Blundr begins complete, Tempo moves from `6/10` to `10/10`, Battery moves from `2/3` to `3/3`, the center resolves to `3/3 COMPLETE`, and the streak advances from two to three days. Keep the demo disconnected from live daily state and streak logic.

## Verified chess story

The exact line is `1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3`. The opening state is the position immediately after `3.Bc4`. The sequence animates Black’s bishop from `f8` to `c5`, briefly emphasizes it, highlights the `c2` pawn and `c3` square in blue, and then animates `c2–c3`. Tempo explains that `c3` prepares `d4` while keeping the bishop active on `c4`. Every displayed move is legal and the board is White-oriented.

## Acceptance checklist

- The production board, not a screenshot, renders.
- The section loops in approximately 8.2 seconds without API calls.
- Tempo cue and personalized-review confirmation appear.
- Reduced motion shows the completed teaching state.
- Timers stop when the section leaves the viewport and clean up on unmount.
- Mobile places the cue beneath the board instead of covering it.
- Existing trainer behavior remains unchanged.
- Daily Blundr shows the legal Queen’s Gambit Declined position after `4.cxd5`, animates `4…exd5`, explains the recapture, records progress, and advances to “2 of 12.”
- Smart Review shows the legal Fried Liver position after `5.exd5`, captures `5…Nxd5?`, visibly returns the same position, solves it with `5…Na5`, and confirms that review was updated.
- Repertoire Mastery animates the Italian Game dashboard through all four local frames, fades cleanly before resetting, stops while offscreen, and shows the completed frame when reduced motion is enabled.
- Consistency closes the Tempo and Battery rings in sequence, updates the next-best-action card, ends in “Today complete,” pauses offscreen, and renders the three-ring completed state for reduced motion.
- Neither demo calls authentication, Supabase, Maia, or production training APIs.
