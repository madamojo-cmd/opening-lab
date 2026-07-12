# Final App Manual QA

Browser automation is unavailable in this environment. The checks below are intentionally pending until a human runs the app in a browser. Use `/dev/rewards` for the reward and viewport checks; use `/profile`, `/daily`, `/review/minigames/<id>`, and the selected-opening unlock flow for the remaining checks.

## Viewports

- [ ] Popup fits at 375 px
- [ ] Popup fits at 390 px
- [ ] Popup fits at 414 px
- [ ] No horizontal scrolling
- [ ] No clipped buttons

## Rewards

- [ ] Card front does not show reward data
- [ ] Card reverse shows actual persisted reward
- [ ] Reverse is not mirrored
- [ ] Rear cards fan correctly
- [ ] Button changes to Done
- [ ] Reward is not duplicated outside card
- [ ] Common styling
- [ ] Uncommon styling
- [ ] Rare styling
- [ ] Epic styling
- [ ] Unknown fallback
- [ ] Reduced motion
- [ ] Keyboard reveal
- [ ] Escape behavior
- [ ] Focus trap
- [ ] Focus restoration
- [ ] Queue ordering
- [ ] Duplicate suppression
- [ ] Failure replacement
- [ ] Browser A/B shared sync

## Profile, Rings, And Minigames

- [ ] Profile direct load and refresh
- [ ] Signed-out profile state
- [ ] Local-demo profile state
- [ ] Authenticated profile state
- [ ] Nested Daily Rings remains stable under Strict Mode
- [ ] Selected-opening unlock
- [ ] Daily one-cache rule
- [ ] Minigame board orientation remains fixed
- [ ] Minigame Back and Exit controls
- [ ] Legal and illegal move handling
- [ ] Promotion and castling
- [ ] Completion advances to a new scenario

## Runtime Health

- [ ] No console errors
- [ ] No hydration warnings
- [ ] No subscription loop
- [ ] No repeated reward grant after reload
