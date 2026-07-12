import { ClipboardCopy, RefreshCw, Trash2 } from "lucide-react";
import { BlundrButton, BlundrCard, BlundrChip } from "@/components/blundr/ui";
import type { RewardsEventLogEntry } from "./rewardsDebugTypes";

type RewardsEventLogProps = {
  entries: readonly RewardsEventLogEntry[];
  onClear: () => void;
  onCopy: () => void;
  onRefresh: () => void;
};

export function RewardsEventLog({ entries, onClear, onCopy, onRefresh }: RewardsEventLogProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Event log</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">Reward trigger history</h2>
        </div>
        <BlundrChip tone="stone">{entries.length} entries</BlundrChip>
      </div>

      <BlundrCard className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <BlundrButton variant="secondary" fullWidth iconLeading={<RefreshCw size={14} />} onClick={onRefresh}>
            Refresh state
          </BlundrButton>
          <BlundrButton variant="secondary" fullWidth iconLeading={<ClipboardCopy size={14} />} onClick={onCopy}>
            Copy event log JSON
          </BlundrButton>
          <BlundrButton variant="destructive" fullWidth iconLeading={<Trash2 size={14} />} onClick={onClear}>
            Clear event log
          </BlundrButton>
        </div>

        <div className="space-y-2">
          {entries.length ? (
            entries
              .slice()
              .reverse()
              .map((entry) => (
                <article key={entry.id} className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">{entry.trigger}</div>
                      <div className="mt-1 text-sm font-black text-stone-950">{entry.action}</div>
                      <div className="mt-1 text-xs text-stone-500">{entry.timestamp}</div>
                    </div>
                    <BlundrChip tone={entry.success ? "green" : "red"}>{entry.success ? "Success" : "Failure"}</BlundrChip>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs leading-5 text-stone-600 sm:grid-cols-2">
                    <div>
                      <div className="font-black uppercase tracking-[0.18em] text-stone-500">Idempotency</div>
                      <div className="break-all">{entry.idempotencyKey}</div>
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-[0.18em] text-stone-500">Reward / popup</div>
                      <div>{entry.rewardGenerated}</div>
                      <div>{entry.popupShown}</div>
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-[0.18em] text-stone-500">Persistence target</div>
                      <div>{entry.persistenceTarget}</div>
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-[0.18em] text-stone-500">Before</div>
                      <div>{entry.beforeSummary}</div>
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-[0.18em] text-stone-500">After</div>
                      <div>{entry.afterSummary}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="font-black uppercase tracking-[0.18em] text-stone-500">Storage</div>
                      <div>{entry.storageUpdated}</div>
                    </div>
                    {entry.error ? (
                      <div className="sm:col-span-2 rounded-2xl bg-red-50 px-3 py-2 text-red-900 ring-1 ring-red-200">
                        {entry.error}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
          ) : (
            <div className="rounded-2xl bg-white px-3 py-4 text-sm leading-6 text-stone-500 ring-1 ring-stone-200">
              No trigger events yet. Use the buttons above to populate the log.
            </div>
          )}
        </div>
      </BlundrCard>
    </section>
  );
}
