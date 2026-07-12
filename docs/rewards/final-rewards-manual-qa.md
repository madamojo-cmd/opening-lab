# Final Rewards Manual QA

Browser automation is unavailable in this checkout. These checks are intentionally pending until a human opens `/dev/rewards` at each viewport.

## Viewports

- [ ] Popup fits at 375 px
- [ ] Popup fits at 390 px
- [ ] Popup fits at 414 px
- [ ] No horizontal scrolling
- [ ] No clipped buttons

## Tempo Cache card

- [ ] Card front does not show reward data
- [ ] Card reverse shows the actual persisted reward
- [ ] Reverse is not mirrored
- [ ] Rear cards fan correctly
- [ ] Button changes to `Done`
- [ ] Reward is not duplicated outside card
- [ ] Common styling
- [ ] Uncommon styling
- [ ] Rare styling
- [ ] Epic styling
- [ ] Unknown fallback
- [ ] Reduced motion

## Accessibility and queue

- [ ] Keyboard reveal
- [ ] Escape behavior
- [ ] Focus trap
- [ ] Focus restoration
- [ ] Queue ordering
- [ ] Duplicate suppression
- [ ] Failure replacement

## State and security

- [ ] Browser A/B shared sync
- [ ] Selected-opening unlock
- [ ] Daily one-cache rule
- [ ] No console errors
- [ ] No hydration warnings
- [ ] No subscription loop

Record browser, viewport, authenticated/local mode, event ID, and result beside each failed check. Do not mark a checkbox from static markup or a build result alone.
