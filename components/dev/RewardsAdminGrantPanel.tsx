"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";
import { BlundrButton, BlundrCard, BlundrChip, BlundrStateCard } from "@/components/blundr/ui";
import { getOnboardingAuthSession } from "@/lib/blundr/onboarding/onboardingAuth";
import { enqueueRewardPopup } from "@/lib/blundr/rewards/rewardPopupBus";
import type { RewardsPersistenceTarget } from "@/lib/blundr/rewards/rewardTargetModel";
import type { RewardsEventLogEntry } from "./rewardsDebugTypes";

type RewardsAdminGrantPanelProps = {
  target: RewardsPersistenceTarget;
  adminUserId: string;
  adminEmail?: string | null;
  onRefreshState: () => Promise<void> | void;
  appendEventLog: (entry: RewardsEventLogEntry) => void;
};

type AdminGrantType = "repertoire_points" | "opening_fragment" | "choice_token" | "epic_bonus";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function createIdempotencyKey(prefix: string, adminUserId: string, targetUserId: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}:${adminUserId}:${targetUserId}:${suffix}`;
}

export function RewardsAdminGrantPanel({ target, adminUserId, adminEmail, onRefreshState, appendEventLog }: RewardsAdminGrantPanelProps) {
  const [targetUserId, setTargetUserId] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [grantType, setGrantType] = useState<AdminGrantType>("repertoire_points");
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() => createIdempotencyKey("admin-grant", adminUserId || "admin", "target"));
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resultJson, setResultJson] = useState<unknown>(null);

  useEffect(() => {
    if (grantType === "epic_bonus") {
      setAmount(100);
    } else if (amount <= 0) {
      setAmount(grantType === "repertoire_points" ? 10 : 1);
    }
  }, [grantType]);

  const amountLabel = useMemo(() => {
    if (grantType === "epic_bonus") return "Fixed 100 points";
    if (grantType === "repertoire_points") return "Points";
    if (grantType === "opening_fragment") return "Fragments";
    return "Tokens";
  }, [grantType]);

  async function handleApplyGrant() {
    const normalizedTargetUserId = normalizeText(targetUserId);
    const normalizedReason = normalizeText(reason);
    if (!normalizedTargetUserId) {
      setErrorMessage("Target user id is required.");
      return;
    }
    if (!normalizedReason) {
      setErrorMessage("A reason is required.");
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const session = await getOnboardingAuthSession().catch(() => null);
      if (!session?.accessToken) {
        throw new Error("No authenticated admin session was found.");
      }

      const response = await fetch("/api/blundr/dev/rewards/admin-grant", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
        body: JSON.stringify({
          targetUserId: normalizedTargetUserId,
          targetEmail: normalizeText(targetEmail) || undefined,
          grantType,
          amount,
          reason: normalizedReason,
          idempotencyKey,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; result?: unknown; error?: { message?: string; code?: string } }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error?.message || "Admin reward grant failed.");
      }

      setResultJson(payload.result ?? null);
      setStatusMessage("Admin reward grant applied.");
      enqueueRewardPopup({
        id: `${idempotencyKey}:popup`,
        kind: "admin_grant",
        preview: false,
        title: "Admin grant applied",
        description: `Granted ${grantType} to ${normalizedTargetUserId}.`,
        createdAt: new Date().toISOString(),
        success: true,
        targetUserId: normalizedTargetUserId,
        targetEmail: normalizeText(targetEmail) || null,
        grantType,
        amount,
        reason: normalizedReason,
        auditId: (payload?.result as { auditId?: string } | null | undefined)?.auditId,
        beforeSummary: "See result JSON for before state.",
        afterSummary: "See result JSON for after state.",
      });
      appendEventLog({
        id: `${idempotencyKey}:event`,
        timestamp: new Date().toISOString(),
        trigger: "admin_manual_reward_grant",
        action: `Grant ${grantType} to ${normalizedTargetUserId}`,
        rewardGenerated: grantType,
        storageUpdated: "Shared reward inventory / repertoire",
        popupShown: "None",
        persistenceTarget: target.targetMode,
        idempotencyKey,
        beforeSummary: `${adminUserId} -> ${normalizedTargetUserId}`,
        afterSummary: "Grant applied",
        success: true,
      });
      await onRefreshState();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Admin reward grant failed.";
      setErrorMessage(message);
      enqueueRewardPopup({
        id: `${idempotencyKey}:popup:error`,
        kind: "admin_grant",
        preview: false,
        title: "Admin grant failed",
        description: message,
        createdAt: new Date().toISOString(),
        success: false,
        targetUserId: normalizedTargetUserId,
        targetEmail: normalizeText(targetEmail) || null,
        grantType,
        amount,
        reason: normalizedReason,
        beforeSummary: "No storage change",
        afterSummary: message,
      });
      appendEventLog({
        id: `${idempotencyKey}:event:error`,
        timestamp: new Date().toISOString(),
        trigger: "admin_manual_reward_grant",
        action: `Grant ${grantType} to ${normalizeText(targetUserId) || "target"}`,
        rewardGenerated: "None",
        storageUpdated: "No storage change",
        popupShown: "None",
        persistenceTarget: target.targetMode,
        idempotencyKey,
        beforeSummary: `${adminUserId} -> ${normalizeText(targetUserId) || "target"}`,
        afterSummary: message,
        success: false,
        error: message,
      });
    } finally {
      setBusy(false);
    }
  }

  if (!target.isAuthenticatedShared) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Admin manual reward grant</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">Grant rewards to a specific user</h2>
        </div>
        <BlundrChip tone="stone" icon={<ShieldAlert size={13} />}>
          Admin only
        </BlundrChip>
      </div>

      <BlundrCard className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Target user id</span>
            <input
              value={targetUserId}
              onChange={(event) => setTargetUserId(event.target.value)}
              placeholder="UUID or auth user id"
              className="min-h-12 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-green-300"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Target email</span>
            <input
              value={targetEmail}
              onChange={(event) => setTargetEmail(event.target.value)}
              placeholder="Optional"
              className="min-h-12 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-green-300"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Grant type</span>
            <select
              value={grantType}
              onChange={(event) => setGrantType(event.target.value as AdminGrantType)}
              className="min-h-12 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-green-300"
            >
              <option value="repertoire_points">Repertoire Points</option>
              <option value="opening_fragment">Opening Fragment</option>
              <option value="choice_token">Choice Token</option>
              <option value="epic_bonus">Epic Bonus</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">{amountLabel}</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
              disabled={grantType === "epic_bonus"}
              className="min-h-12 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-green-300 disabled:bg-stone-100"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Reason</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="QA manual grant"
            className="min-h-24 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-green-300"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Idempotency key</span>
          <div className="flex gap-2">
            <input
              value={idempotencyKey}
              onChange={(event) => setIdempotencyKey(event.target.value)}
              className="min-h-12 flex-1 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-green-300"
            />
            <BlundrButton
              type="button"
              variant="secondary"
              onClick={() => setIdempotencyKey(createIdempotencyKey("admin-grant", adminUserId || "admin", targetUserId || "target"))}
              disabled={busy}
            >
              <KeyRound size={14} />
              Generate
            </BlundrButton>
          </div>
        </label>

        {errorMessage ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">{errorMessage}</div> : null}
        {statusMessage ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900">{statusMessage}</div> : null}

        <div className="flex flex-wrap items-center gap-2">
          <BlundrButton variant="primary" onClick={() => void handleApplyGrant()} disabled={busy}>
            {busy ? "Granting..." : "Apply grant"}
          </BlundrButton>
          <div className="text-xs font-semibold text-stone-500">
            {target.isAuthenticatedShared ? "Writes to the authenticated shared account through the server." : "Admin grant unavailable."}
          </div>
        </div>

        {resultJson ? (
          <div className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Last result</div>
            <pre className="mt-2 max-h-72 overflow-auto text-xs leading-5 text-stone-700">{JSON.stringify(resultJson, null, 2)}</pre>
          </div>
        ) : null}

        <div className="rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
          <div className="font-black uppercase tracking-[0.18em] text-stone-500">Safety note</div>
          <p className="mt-2">
            Signed in as {adminEmail ?? adminUserId}. This route is dev/admin gated and writes only to the selected target user.
          </p>
        </div>
      </BlundrCard>

      <BlundrStateCard
        kind="success"
        eyebrow="Admin preview"
        title="Reward grants stay server-side."
        copy="The browser only submits an authenticated admin request. The server verifies the session, validates the target, and writes the shared account state."
      />
    </section>
  );
}
