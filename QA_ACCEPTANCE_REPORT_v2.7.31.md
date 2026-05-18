# QA Acceptance Report v2.7.31

- [x] package version updated
- [x] app builds
- [ ] normal trainer load does not call /api/brain
- [ ] changing position does not call /api/brain
- [ ] wrong restricted move does not call /api/brain
- [ ] Reveal does call /api/brain manually
- [ ] /api/blundr-visual-model still runs
- [ ] Assisted View shows cue
- [ ] Plain View hides cue/visual overlays before move
- [ ] Plain View still allows legal move dots
- [ ] Show more debug still works
- [ ] app works without OPENAI_API_KEY during normal training

## Notes

- `npm run build` passes in this branch.
- `node scripts/smoke-visual-model.mjs` fails if no dev server is running.
- Attempting to start `npm run dev` in this execution environment fails with `listen EPERM` on both `0.0.0.0:3000` and `127.0.0.1:3200`, so live network-tab QA must be completed in a normal local dev runtime.
