# Final Rewards Feature File Manifest

This manifest covers the final rewards feature surface. “Dirty before completion” means the path was already modified or untracked when this completion pass began.

| Path | State | Purpose | Surface | Required | Dirty before completion |
|---|---|---|---|---|---|
| `app/dev/rewards/page.tsx` | modified | Dev route entry | dev | yes | yes |
| `app/api/blundr/dev/access/route.ts` | created | Access guard endpoint | dev/security | yes | yes |
| `app/api/blundr/dev/rewards/admin-grant/route.ts` | created | Secured admin grant endpoint | dev/security | yes | yes |
| `components/dev/RewardsAccessShell.tsx` | created | Access-gated shell | dev/security | yes | yes |
| `components/dev/RewardsDebugPanel.tsx` | modified | Existing service-backed panel integration | dev | yes | no |
| `components/dev/RewardsValidationConsole.tsx` | created | Eight-section validation console | dev | yes | no |
| `components/dev/rewardsValidationModel.ts` | created | Pure preview/viewport validation helpers | dev/test | yes | no |
| `components/dev/rewardsDebugTypes.ts` | created | Dev preview/event contracts | dev | yes | yes |
| `components/dev/RewardsStatePanel.tsx` | created | Current-state display | dev | yes | yes |
| `components/dev/RewardsPopupPreviewPanel.tsx` | created | Presentation-only previews | dev | yes | yes |
| `components/dev/RewardsTriggerPanel.tsx` | created | Canonical transaction controls | dev | yes | yes |
| `components/dev/RewardsResetPanel.tsx` | created | Guarded development resets | dev | yes | yes |
| `components/dev/RewardsEventLog.tsx` | created | Transaction/audit output | dev | yes | yes |
| `components/rewards/RewardPopupHost.tsx` | created | Canonical popup host | production | yes | yes |
| `components/rewards/RewardModalBase.tsx` | created | Accessible modal base | production | yes | yes |
| `components/rewards/popups/*` | created | Five canonical templates and Tempo Cache card | production | yes | yes |
| `components/rewards/rewards.css` | created | Deck animation and responsive styles | style | yes | yes |
| `components/rewards/RewardIcon.tsx` | modified | Shared reward icon mapping | production | yes | yes |
| `components/rewards/TempoCacheModal.tsx` | modified | Canonical Tempo Cache wrapper | production | yes | yes |
| `components/completion/TrainingCompletionSummary.tsx` | modified | Persistence-to-popup bridge | production | yes | yes |
| `lib/blundr/rewards/rewardPresentationAdapter.ts` | created | Persisted grant presentation adapter | production | yes | yes |
| `lib/blundr/rewards/rewardPopupBus.ts` | created | Stable queue/dedupe/priority | production | yes | yes |
| `lib/blundr/rewards/rewardPopupTypes.ts` | created | Popup event contracts | production | yes | yes |
| `lib/blundr/rewards/rewardInventoryTypes.ts` | created | Inventory contracts | foundation | yes | yes |
| `lib/blundr/rewards/rewardTargetModel.ts` | created | Dev persistence target model | foundation/dev | yes | yes |
| `lib/blundr/rewards/__tests__/rewardPresentationAdapter.test.ts` | created | Adapter coverage | test | yes | no |
| `lib/blundr/rewards/__tests__/tempoCacheRewardCard.test.tsx` | created | Card/reduced-motion coverage | test | yes | no |
| `lib/blundr/rewards/__tests__/rewardsValidationModel.test.ts` | created | Dev preview/viewport coverage | test | yes | no |
| `lib/blundr/rewards/__tests__/rewardsValidationConsole.test.ts` | created | Dev security/control-surface coverage | test | yes | no |
| `lib/blundr/rewards/__tests__/rewardPopupBus.test.ts` | created | Queue coverage | test | yes | yes |
| `lib/blundr/rewards/__tests__/rewardPopupHost.test.tsx` | created | Host/template coverage | test | yes | yes |
| `docs/rewards/final-rewards-audit.md` | modified | Boundary and migration audit | documentation | yes | yes |
| `docs/rewards/final-rewards-manual-qa.md` | created | Human mobile/accessibility checklist | documentation | yes | no |
| `supabase/migrations/20260709_001_blundr_reward_inventory.sql` | created | Shared inventory persistence | foundation | yes | yes |

The remaining paths in the worktree reports are earlier foundation work, direct account/repertoire/daily-ring dependencies, design references, generated `node_modules`, or retained uncertain work. No commit was created.
