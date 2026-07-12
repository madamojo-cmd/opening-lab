# Final Rewards Presentation Audit

## Current canonical paths

- Domain and policy: `lib/blundr/rewards/rewardTypes.ts`, `rewardRollService.ts`, `rewardRarity.ts`, and `rewardPityService.ts` define trigger, rarity, roll, grant, and Tempo Cache policy contracts.
- Transaction and persistence: `rewardGrantService.ts`, `rewardInventoryService.ts`, `rewardHistoryService.ts`, `tempoCacheService.ts`, and the repertoire persistence/unlock services own remote-first mutation, idempotency, history, inventory, points, and selected-opening unlocks.
- Persisted reward record: `RewardGrantRecord` is the canonical successful grant input for presentation. A popup must adapt this record rather than define a second persisted contract.
- Popup queue: `lib/blundr/rewards/rewardPopupBus.ts` is the only existing global queue and already caches referentially stable snapshots for `useSyncExternalStore`.
- Popup host: `components/rewards/RewardPopupHost.tsx` is mounted once from `app/layout.tsx`.
- Dev validation route: `app/dev/rewards/page.tsx` delegates access control to `RewardsAccessShell` and the existing `RewardsDebugPanel` controls.

## Duplicates and obsolete runtime paths

- `RewardPopupHost.tsx` imports `RewardPopup`, `TempoCachePopup`, and `StreakPopup` from `components/figma-source/5304-reward-popups/`. These are production runtime imports and must be migrated to canonical local templates.
- `TempoCacheModal.tsx` independently renders the generated Tempo Cache popup and is used by `TrainingCompletionSummary`; it bypasses the global queue and does not render its persisted `rewardGrants` dynamically.
- `StreakModal.tsx` independently renders the generated streak popup.
- `RewardRevealCard.tsx` and `TempoCacheCard.tsx` are older presentation implementations. They can remain for non-popup design/reference surfaces only after production popup callers migrate.
- `RewardsMobilePreview.tsx` directly imports generated popup implementations. It is dev-only, but the final validation surface should preview the same canonical production templates.
- Popup icon/presentation mapping currently lives across generated components, `RewardRevealCard`, and `RewardIcon`; it needs one presentation adapter and one icon mapping.

## Migration targets

- Add a pure adapter from `RewardGrantRecord` to a validated `RewardPresentationModel`, including explicit Epic Bonus presentation and a safe unknown-type fallback that preserves the raw reward type.
- Refine the existing popup event union around five canonical templates: direct reward, milestone, Tempo Cache deck, opening unlocked, and failure.
- Extend the existing queue rather than create another queue. Preserve stable snapshots, session dedupe, strict-mode safety, and FIFO order within documented priority bands.
- Replace generated production imports with local popup components using one modal accessibility base.
- Publish persisted Tempo Cache results to the queue only after the transaction service reports an applied grant; publish failures without success events.
- Reorganize `/dev/rewards` so previews only enqueue presentation events while real controls continue through authenticated canonical services.

## Transaction and state risks

- `shared_sync_failed` must never enqueue a reward or Tempo Cache success card.
- Duplicate/idempotent application results (`applied: false`) must not append history or enqueue success.
- Queue priority must not reorder unrelated persisted transactions; priority replacement is limited to failure superseding an unshown success for the same transaction, with opening-unlock and Tempo Cache priority applied only among events not yet shown.
- Popup mount, reveal, dismiss, retry, and route changes must not invoke a grant service or mutate inventory.
- Existing selected-opening unlock behavior must remain authoritative: three fragments or one token are deducted only for the selected opening after persistence succeeds.
- The current host has Escape handling but no complete focus trap or focus restoration. Consolidation must add both without nested dialogs.
- The Tempo Cache flip must keep the flipping container visually transparent and place backgrounds/borders only on separate front/reverse faces to avoid the mirrored opaque-shell regression.

## Protecting tests

- Domain and transaction ordering: `rewardGrantService.test.ts`, `tempoCacheService.test.ts`, `rewardInventoryService.test.ts`, and `rewardTargetModel.test.ts`.
- Queue dedupe and snapshot stability: `rewardPopupBus.test.ts`.
- Host event rendering and no-mutation behavior: `rewardPopupHost.test.tsx`.
- Auth and dev access: `accountSession.test.ts`, `devAccess.test.ts`, and `rewardsValidationPageModel.test.ts`.
- Admin isolation: `adminRewardGrantService.test.ts`.
- Daily-ring idempotency and reconciliation: `dailyRingService.test.ts` and `dailyRingBlundrReconciliation.test.ts`.
- Selected-opening ownership, exact deduction, and sync: `repertoireProgressService.test.ts`, `repertoireSyncOwnership.test.ts`, and `repertoireUnlockFlow.test.ts`.
- New focused coverage will protect the presentation adapter, queue priority/dedupe, five canonical templates, Tempo Cache variable reverse face, reduced motion, failure-only behavior, and dev preview non-mutation.

## Change-boundary classification

The complete raw path inventories are preserved in `/tmp/blundr-final-rewards-tracked-files.txt` and `/tmp/blundr-final-rewards-untracked-files.txt`. Classification below covers every path in those inventories.

### Final rewards implementation and direct dependencies

- `app/dev/rewards/page.tsx`, `app/api/blundr/dev/access/route.ts`, `app/api/blundr/dev/rewards/admin-grant/route.ts`
- `components/dev/RewardsAccessShell.tsx`, `components/dev/RewardsAdminGrantPanel.tsx`, `components/dev/RewardsEventLog.tsx`, `components/dev/RewardsMobilePreview.tsx`, `components/dev/RewardsPopupPreviewPanel.tsx`, `components/dev/RewardsResetPanel.tsx`, `components/dev/RewardsStatePanel.tsx`, `components/dev/RewardsTargetPanel.tsx`, `components/dev/RewardsTriggerPanel.tsx`, `components/dev/RewardsValidationConsole.tsx`, `components/dev/rewardsDebugTypes.ts`, `components/dev/rewardsValidationModel.ts`
- `components/rewards/RewardModalBase.tsx`, `components/rewards/RewardPopupHost.tsx`, `components/rewards/StreakModal.tsx`, `components/rewards/popups/MilestonePopup.tsx`, `components/rewards/popups/OpeningUnlockedPopup.tsx`, `components/rewards/popups/RewardFailurePopup.tsx`, `components/rewards/popups/RewardGrantedPopup.tsx`, `components/rewards/popups/TempoCacheDeckPopup.tsx`, `components/rewards/popups/TempoCacheRewardCard.tsx`, `components/rewards/rewards.css`
- `lib/blundr/rewards/rewardInventoryTypes.ts`, `lib/blundr/rewards/rewardPopupBus.ts`, `lib/blundr/rewards/rewardPopupTypes.ts`, `lib/blundr/rewards/rewardPresentationAdapter.ts`, `lib/blundr/rewards/rewardTargetModel.ts`
- `components/rewards/RewardIcon.tsx`, `components/rewards/TempoCacheModal.tsx`, `components/completion/TrainingCompletionSummary.tsx`, `app/globals.css`, `app/layout.tsx`

### Earlier intended rewards foundation work

- All remaining tracked paths in `/tmp/blundr-final-rewards-tracked-files.txt` are earlier foundation changes covering account/session, daily-ring, persistence, repertoire, reward policy, and synchronization behavior.
- `components/account/BlundrSharedAccountHydrator.tsx`, all `components/blundr/ui/*`, `components/repertoire/RepertoireRewardInventoryCard.tsx`, `components/repertoire/RepertoireUnlockModal.tsx`, `components/repertoire/UnlockConfirmSlider.tsx`, `components/training/TrainSelectionPage.tsx`, and the Supabase reward migration are earlier foundation dependencies.
- `lib/blundr/accounts/*` additions, `lib/blundr/backend/__tests__/devAccess.test.ts`, all listed daily-ring additions/tests, all listed repertoire additions/tests, and the existing reward tests in the untracked inventory are earlier foundation tests and services.

### Generated or design-source paths

- `node_modules` is generated dependency output.
- `components/figma-source/5303-dashboard-daily-review/svg-lrkovulksy.ts` and `components/figma-source/5304-reward-popups/*` are design references. They are not imported by production reward runtime code.

### Unrelated or uncertain paths

- No path was deleted or reverted. Any path not named as a rewards implementation, foundation dependency, test, design source, or generated output above remains unchanged and is retained as uncertain until the owning feature is reviewed.

## Generated-popup import audit

`rg -n 'figma-source/5304-reward-popups|Figma.*Reward|TempoCachePopup|RewardPopup|StreakPopup' app components lib -g '!components/figma-source/**'` finds no generated-popup import or obsolete helper name. Remaining `RewardPopup*` matches are canonical queue/type/host names and tests; `RewardsPopupPreviewPanel` and `RewardsValidationConsole` are dev-only validation surfaces. No `TempoCachePopup`, generated `RewardPopup`, or generated `StreakPopup` runtime import remains.
