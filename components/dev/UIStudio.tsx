"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, BookOpen, CheckCircle2, Clock3, Loader2, LockKeyhole, Shield, Sparkles, XCircle } from "lucide-react";
import { BLUNDR_EMPTY_STATE_ASSETS, BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { RepertoirePointsSummary } from "@/components/repertoire/RepertoirePointsSummary";
import { RepertoireUnlockProgress } from "@/components/repertoire/RepertoireUnlockProgress";
import { RewardAnimation } from "@/components/rewards/RewardAnimation";
import { RewardRevealCard } from "@/components/rewards/RewardRevealCard";
import { TempoCacheModal } from "@/components/rewards/TempoCacheModal";
import { StreakSummaryCard } from "@/components/streaks/StreakSummaryCard";
import { createDefaultRewardHistory, createDefaultStreakRecord, createDefaultTrainingProfile } from "@/lib/blundr/accounts/accountDefaults";
import type { UserTrainingProfile } from "@/lib/blundr/accounts/accountTypes";
import { createRepertoirePointEvent } from "@/lib/blundr/repertoire/repertoirePoints";
import { createDefaultRepertoireProgress, earnRepertoirePoints, unlockOpening } from "@/lib/blundr/repertoire/repertoireUnlockService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import type { RewardGrantRecord } from "@/lib/blundr/rewards/rewardTypes";
import type { UserRewardHistory } from "@/lib/blundr/accounts/accountTypes";
import type { StreakProgressRecord } from "@/lib/blundr/streaks/streakTypes";

type FrameDriver = (doc: Document, win: Window) => Promise<void> | void;

type ScreenSpec = {
  id: string;
  title: string;
  subtitle: string;
  mode: "route" | "component";
  approximate?: boolean;
  route?: string;
  drive?: FrameDriver;
  settleMs?: number;
  content?: ReactNode;
};

const STUDIO_USER_ID = "studio-user";
const STUDIO_NOW = "2026-07-06T12:00:00.000Z";
const STUDIO_LOCAL_DATE = "2026-07-06";
const NOOP = () => {};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function normalizeControlText(element: HTMLElement): string {
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

async function waitForSelector(doc: Document, selector: string, timeoutMs = 5000): Promise<HTMLElement | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const element = doc.querySelector(selector);
    if (element instanceof HTMLElement) return element;
    await sleep(50);
  }
  return null;
}

async function waitForControlByText(scope: ParentNode, text: string, timeoutMs = 5000): Promise<HTMLElement | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const controls = Array.from(scope.querySelectorAll("button, a, [role='button']"));
    const exact = controls.find((node) => node instanceof HTMLElement && normalizeControlText(node) === text);
    if (exact instanceof HTMLElement) return exact;
    const partial = controls.find((node) => node instanceof HTMLElement && normalizeControlText(node).includes(text));
    if (partial instanceof HTMLElement) return partial;
    await sleep(50);
  }
  return null;
}

async function clickNavButton(doc: Document, label: string): Promise<void> {
  const nav = await waitForSelector(doc, "nav");
  if (!nav) return;
  const target = await waitForControlByText(nav, label);
  target?.click();
}

async function clickHeaderButton(doc: Document): Promise<void> {
  const header = await waitForSelector(doc, "header");
  if (!header) return;
  const button = header.querySelector("button");
  if (button instanceof HTMLElement) {
    button.click();
  }
}

async function clickControl(doc: Document, label: string): Promise<void> {
  const target = await waitForControlByText(doc, label);
  target?.click();
}

function buildStudioRewardGrant(overrides: Partial<RewardGrantRecord> & Pick<RewardGrantRecord, "id" | "rewardId" | "rewardRollId" | "trigger" | "triggerEventId" | "rarity" | "rewardType" | "amount" | "displayName" | "description" | "pointsApplied" | "applied" | "pendingChoice" | "grantMode" | "createdAt">): RewardGrantRecord {
  return {
    ...overrides,
  };
}

function buildStudioRepertoire(): RepertoireProgress {
  let progress = createDefaultRepertoireProgress({
    userId: STUDIO_USER_ID,
    starterPackId: "classical_attacker",
    now: STUDIO_NOW,
  });

  progress = earnRepertoirePoints(
    progress,
    createRepertoirePointEvent({
      userId: STUDIO_USER_ID,
      source: "reward_bonus",
      points: 96,
      id: "studio:repertoire:points",
      createdAt: STUDIO_NOW,
    }),
  );

  const openingIds = progress.lockedOpeningIds.slice(0, 2);
  for (const openingId of openingIds) {
    const result = unlockOpening(progress, openingId);
    if (result.ok) {
      progress = result.progress;
    }
  }

  return progress;
}

function buildStudioStreakRecord(): StreakProgressRecord {
  return {
    ...createDefaultStreakRecord(STUDIO_USER_ID, STUDIO_NOW),
    currentStreakDays: 7,
    longestStreakDays: 12,
    totalAllRingsClosedDays: 18,
    lastCompletedLocalDate: STUDIO_LOCAL_DATE,
    updatedAt: STUDIO_NOW,
  };
}

function buildStudioRewardHistory(): UserRewardHistory {
  return {
    ...createDefaultRewardHistory(STUDIO_USER_ID, STUDIO_NOW),
    allRingsDaysSinceRandomReward: 4,
    randomBonusPityCounter: 4,
    lastRandomRewardLocalDate: "2026-07-02",
    lastRandomBonusAt: "2026-07-02T12:00:00.000Z",
    appliedRewardIds: ["studio-common-reward", "studio-rare-reward"],
    updatedAt: STUDIO_NOW,
  };
}

function buildStudioTrainingProfile(): UserTrainingProfile {
  return {
    ...createDefaultTrainingProfile(STUDIO_USER_ID, STUDIO_NOW),
    onboardingCompleted: true,
    preferredTrainingMode: "assisted" as const,
    ratingBandId: "1200-1600" as const,
    selectedStarterPackId: "classical_attacker" as const,
    dailyTempoGoal: 12,
    dailyBatteryGoal: 4,
    dailyBlundrGoal: 2,
    updatedAt: STUDIO_NOW,
  };
}

const studioRepertoire = buildStudioRepertoire();
const studioStreakRecord = buildStudioStreakRecord();
const studioRewardHistory = buildStudioRewardHistory();
const studioTrainingProfile = buildStudioTrainingProfile();

const studioEpicGrant = buildStudioRewardGrant({
  id: "studio-epic-reward",
  rewardId: "studio-epic-reward",
  rewardRollId: "studio-roll-epic",
  trigger: "monthly_cache",
  triggerEventId: "reward-cache:monthly:studio-user:2026-07-06:30",
  rarity: "epic",
  rewardType: "unlock_points",
  amount: 100,
  displayName: "+100 repertoire points",
  description: "Tempo turned a major milestone into a big direct training boost.",
  pointsApplied: 100,
  applied: true,
  pendingChoice: false,
  grantMode: "guaranteed_cache",
  createdAt: STUDIO_NOW,
});

const studioTempoGrant = buildStudioRewardGrant({
  id: "studio-weekly-reward",
  rewardId: "studio-weekly-reward",
  rewardRollId: "studio-roll-weekly",
  trigger: "weekly_cache",
  triggerEventId: "reward-cache:weekly:studio-user:2026-07-06:7",
  rarity: "uncommon",
  rewardType: "unlock_points",
  amount: 25,
  displayName: "+25 repertoire points",
  description: "Tempo turned a weekly streak cache into a clean training boost.",
  pointsApplied: 25,
  applied: true,
  pendingChoice: false,
  grantMode: "guaranteed_cache",
  createdAt: STUDIO_NOW,
});

const studioTempoCacheRewards = [studioTempoGrant];

function MiniStateCard({
  icon,
  title,
  copy,
  asset,
  tone = "neutral",
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  asset: string;
  tone?: "neutral" | "positive" | "warning" | "error";
}) {
  const toneClasses =
    tone === "positive"
      ? "border-green-200 bg-green-50"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50"
        : tone === "error"
          ? "border-red-200 bg-red-50"
          : "border-stone-200 bg-white";

  return (
    <div className={classNames("rounded-[1.5rem] border p-3 shadow-sm", toneClasses)}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white p-2 ring-1 ring-stone-200">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black text-stone-950">{title}</div>
          <p className="mt-1 text-xs leading-5 text-stone-600">{copy}</p>
        </div>
        <BlundrAssetImage asset={asset} alt={title} variant="emptyState" className="w-[6rem] shrink-0" />
      </div>
    </div>
  );
}

function SampleSettingRow({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-stone-200">
      <div>
        <div className="text-sm font-black text-stone-950">{label}</div>
        <div className="mt-1 text-xs leading-5 text-stone-500">{value}</div>
      </div>
      <div className={classNames("rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]", active ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500")}>
        {active ? "On" : "Off"}
      </div>
    </div>
  );
}

function GateMockCard({ title, copy, cta }: { title: string; copy: string; cta: string }) {
  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.reward} alt={title} variant="rewardHero" className="w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Access gate</div>
          <h3 className="mt-1 text-lg font-black tracking-tight text-stone-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <div className="rounded-2xl bg-stone-50 px-3 py-3 text-sm font-semibold leading-6 text-stone-600 ring-1 ring-stone-200">
          This screen is a simplified mock because the production app does not have a dedicated paywall route.
        </div>
        <button type="button" disabled className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white opacity-55">
          {cta}
        </button>
      </div>
    </div>
  );
}

function MockStage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-auto bg-[#f7f7f4] px-4 py-4 text-stone-950">
      <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">{title}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function MockBackdrop({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.2),_transparent_38%),linear-gradient(180deg,_rgba(17,24,39,0.34),_rgba(17,24,39,0.56))] px-4 py-6">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.06))]" />
      <div className="relative w-full space-y-3">
        <div className="rounded-[1.5rem] bg-white/90 px-4 py-3 shadow-sm ring-1 ring-white/70 backdrop-blur">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-green-700">{title}</div>
          <p className="mt-1 text-sm leading-6 text-stone-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function RoutePreviewFrame({ spec, onSettled }: { spec: ScreenSpec; onSettled: (id: string) => void }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const driveStartedRef = useRef(false);
  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
      }
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  function scheduleSettled() {
    if (settleTimerRef.current) {
      window.clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = window.setTimeout(() => onSettled(spec.id), spec.settleMs ?? 1200);
  }

  function tryStartDrive() {
    if (driveStartedRef.current) {
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !iframe.contentWindow) {
      driveStartedRef.current = true;
      scheduleSettled();
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    if (iframe.contentDocument.readyState !== "complete") {
      return;
    }

    driveStartedRef.current = true;
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    void (async () => {
      try {
        await sleep(900);
        if (spec.drive) {
          await spec.drive(iframe.contentDocument, iframe.contentWindow);
        }
      } catch (error) {
        console.warn(`[ui-screens] drive failed for ${spec.id}`, error);
      } finally {
        scheduleSettled();
      }
    })();
  }

  useEffect(() => {
    tryStartDrive();

    if (driveStartedRef.current) {
      return;
    }

    pollTimerRef.current = window.setInterval(() => {
      tryStartDrive();
    }, 100);

    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [spec.drive, spec.id, spec.settleMs]);

  return (
    <iframe
      ref={iframeRef}
      title={spec.title}
      src={spec.route}
      onLoad={tryStartDrive}
      className="h-full w-full border-0 bg-[#f7f7f4]"
    />
  );
}

function ScreenFrame({ spec, onSettled }: { spec: ScreenSpec; onSettled: (id: string) => void }) {
  const badgeLabel = spec.mode === "route" ? "Actual route" : spec.approximate ? "Simplified mock" : "Actual component";
  const badgeTone =
    spec.mode === "route"
      ? "bg-green-50 text-green-700 ring-green-200"
      : spec.approximate
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-stone-100 text-stone-600 ring-stone-200";

  return (
    <section className="space-y-2" data-ui-screen={spec.id} data-ui-screen-kind={spec.mode} data-ui-screen-approximate={spec.approximate ? "true" : "false"}>
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">{spec.title}</div>
          <p className="mt-1 text-xs leading-5 text-stone-500">{spec.subtitle}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className={classNames("rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ring-1", badgeTone)}>{badgeLabel}</span>
          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-green-700 ring-1 ring-green-200">390 × 844</span>
        </div>
      </div>

      <div
        className={classNames(
          "relative h-[844px] w-[390px] overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[#f7f7f4] shadow-[0_30px_90px_rgba(15,23,42,0.12)]",
          spec.mode === "component" ? "transform-gpu" : "",
        )}
        style={{ transform: spec.mode === "component" ? "translateZ(0)" : undefined }}
      >
        {spec.mode === "route" ? (
          <RoutePreviewFrame spec={spec} onSettled={onSettled} />
        ) : (
          <div className="h-full w-full">{spec.content}</div>
        )}
      </div>
    </section>
  );
}

function drivePlainFromHash() {
  return async (doc: Document) => {
    await clickControl(doc, "Plain");
    await sleep(500);
  };
}

function driveReview() {
  return async (doc: Document) => {
    await clickNavButton(doc, "Review");
    await sleep(600);
  };
}

function driveSettings() {
  return async (doc: Document) => {
    await clickHeaderButton(doc);
    await sleep(600);
  };
}

function buildScreens(): ScreenSpec[] {
  const openingSelection = "/repertoire";
  const homeRoute = "/";

  return [
    {
      id: "home",
      title: "Home / dashboard",
      subtitle: "Actual home route preview with the production shell and fixed nav.",
      mode: "route",
      route: homeRoute,
      settleMs: 1800,
    },
    {
      id: "opening-selection",
      title: "Opening selection",
      subtitle: "Actual repertoire route preview.",
      mode: "route",
      route: openingSelection,
      settleMs: 1400,
    },
    {
      id: "opening-detail",
      title: "Opening detail",
      subtitle: "Actual home route after selecting the Italian Game hash opening.",
      mode: "route",
      route: "/#italian-white",
      settleMs: 1800,
    },
    {
      id: "assisted-view",
      title: "Assisted View",
      subtitle: "Actual train tab after the hash selects the Italian Game opening.",
      mode: "route",
      route: "/#italian-white",
      settleMs: 1800,
    },
    {
      id: "plain-view",
      title: "Plain View",
      subtitle: "Actual train tab after switching the live trainer to plain mode.",
      mode: "route",
      route: "/#italian-white",
      drive: drivePlainFromHash(),
      settleMs: 1800,
    },
    // These frames stay explicit mock previews because the production app does not expose dedicated route-level surfaces for them.
    {
      id: "continuation",
      title: "Continuation / play screen",
      subtitle: "Simplified mock: there is no dedicated production route for the handoff preview.",
      mode: "component",
      approximate: true,
      content: (
        <MockBackdrop
          title="Continuation / play screen"
          subtitle="Simplified mock: the continuation handoff is not exposed as a standalone production route."
        >
          <div className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Continuation</div>
                <h3 className="mt-1 text-lg font-black tracking-tight text-stone-950">Continue from here</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Tempo is checking the line handoff after the book ends.
                </p>
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">Preview</div>
            </div>
            <DailyBlundrBoard fen="r1bqkbnr/pppp1ppp/2n5/1B2p3/8/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3" />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm">
                Continue line
              </button>
              <button type="button" className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-700">
                Restart
              </button>
            </div>
          </div>
        </MockBackdrop>
      ),
    },
    {
      id: "daily-blundr",
      title: "Daily Blundr",
      subtitle: "Actual production daily route preview.",
      mode: "route",
      route: "/daily",
      settleMs: 1800,
    },
    {
      id: "review-queue",
      title: "Review Queue",
      subtitle: "Actual home route driven into the review tab.",
      mode: "route",
      route: homeRoute,
      drive: driveReview(),
      settleMs: 1800,
    },
    {
      id: "reward-popup",
      title: "Reward popup",
      subtitle: "Real reward card component preview.",
      mode: "component",
      content: (
        <MockBackdrop title="Reward popup" subtitle="Real reward card component preview on a studio-style backdrop.">
          <RewardRevealCard grant={studioEpicGrant} onPrimaryAction={NOOP} primaryActionLabel="Done" />
        </MockBackdrop>
      ),
    },
    {
      id: "tempo-cache-popup",
      title: "Tempo Cache popup",
      subtitle: "Real Tempo Cache modal component preview.",
      mode: "component",
      content: (
        <div className="h-full w-full">
          <TempoCacheModal
            open
            userId={STUDIO_USER_ID}
            localDate={STUDIO_LOCAL_DATE}
            state="opening"
            rewardGrants={studioTempoCacheRewards}
            rewardHistory={studioRewardHistory}
            onClose={NOOP}
            onPrimaryAction={NOOP}
          />
        </div>
      ),
    },
    {
      id: "streak-popup",
      title: "Streak popup",
      subtitle: "Real streak summary component preview.",
      mode: "component",
      content: (
        <MockBackdrop title="Streak popup" subtitle="Real streak component preview, framed like the production overlay.">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mx-auto mb-4 flex justify-center">
              <RewardAnimation kind="streakFlare" ariaLabel="Streak milestone animation" className="mx-auto" />
            </div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Streak bonus</div>
            <div className="mt-1 text-lg font-black tracking-tight text-stone-950">7-day all-rings streak</div>
            <p className="mt-2 text-sm leading-6 text-stone-600">Tempo marks the milestone and keeps the reward language centered on training progress.</p>
            <div className="mt-4">
              <StreakSummaryCard streakRecord={studioStreakRecord} />
            </div>
          </div>
        </MockBackdrop>
      ),
    },
    {
      id: "onboarding",
      title: "Onboarding",
      subtitle: "Actual onboarding route preview.",
      mode: "route",
      route: "/onboarding",
      settleMs: 1600,
    },
    {
      id: "profile",
      title: "Profile",
      subtitle: "Simplified mock: the production app does not have a dedicated profile route.",
      mode: "component",
      approximate: true,
      content: (
        <MockStage
          title="Profile"
          subtitle="Simplified mock: the production app does not expose a dedicated profile route yet, so this screen combines real summary components."
        >
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.avatar} alt="Tempo avatar" variant="tempoInline" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Local demo profile</div>
                <div className="mt-1 text-lg font-black tracking-tight text-stone-950">Tempo User</div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  The profile surface should feel calm, compact, and easy to scan on mobile.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">Assisted</span>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-stone-600">Local demo</span>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-stone-600">Classical Attacker</span>
                </div>
              </div>
            </div>
          </div>
          <StreakSummaryCard streakRecord={studioStreakRecord} />
          <RepertoirePointsSummary progress={studioRepertoire} compact />
          <RepertoireUnlockProgress progress={studioRepertoire} />
          <div className="grid gap-2">
            <SampleSettingRow label="Rating band" value={studioTrainingProfile.ratingBandId} active />
            <SampleSettingRow label="Preferred mode" value="Assisted view" active />
            <SampleSettingRow label="Daily Tempo goal" value={`${studioTrainingProfile.dailyTempoGoal} reps`} active />
          </div>
        </MockStage>
      ),
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "Actual home route driven into the settings modal.",
      mode: "route",
      route: homeRoute,
      drive: driveSettings(),
      settleMs: 1800,
    },
    {
      id: "paywall",
      title: "Paywall",
      subtitle: "Simplified mock: there is no production subscription route to mount.",
      mode: "component",
      approximate: true,
      content: (
        <MockStage
          title="Paywall"
          subtitle="Simplified mock: Blundr currently has no dedicated paywall route, so this screen shows the locked-state visual language only."
        >
          <GateMockCard
            title="No purchase flow in Blundr"
            copy="This studio preview keeps the paywall layout visible without introducing payment or subscription logic."
            cta="No purchase flow"
          />
        </MockStage>
      ),
    },
    {
      id: "empty-state",
      title: "Empty state",
      subtitle: "Simplified mock: empty surfaces use real assets and card language, not a dedicated route.",
      mode: "component",
      approximate: true,
      content: (
        <MockStage
          title="Empty states"
          subtitle="Simplified mock: there is no single production route for these states, so the studio shows the real empty-state copy and assets."
        >
          <MiniStateCard
            icon={<BookOpen size={16} className="text-green-700" />}
            title="Review queue empty"
            copy="No missed moves are waiting yet. Tempo will surface them when the queue fills."
            asset={BLUNDR_EMPTY_STATE_ASSETS.emptyReviewQueue}
            tone="positive"
          />
          <MiniStateCard
            icon={<CheckCircle2 size={16} className="text-green-700" />}
            title="Daily Blundr complete"
            copy="Daily Blundr is done and the review loop is caught up for now."
            asset={BLUNDR_EMPTY_STATE_ASSETS.emptyDailyBlundr}
            tone="positive"
          />
          <MiniStateCard
            icon={<LockKeyhole size={16} className="text-stone-600" />}
            title="Repertoire empty"
            copy="No starter pack has been initialized yet. Tempo will help you pick one."
            asset={BLUNDR_EMPTY_STATE_ASSETS.emptyRepertoire}
          />
        </MockStage>
      ),
    },
    {
      id: "loading-state",
      title: "Loading state",
      subtitle: "Simplified mock: the loading states are route-adjacent, not dedicated screens.",
      mode: "component",
      approximate: true,
      content: (
        <MockStage
          title="Loading states"
          subtitle="Simplified mock: the production app uses small loading fallbacks rather than dedicated loading routes."
        >
          <MiniStateCard
            icon={<Loader2 size={16} className="animate-spin text-green-700" />}
            title="Loading account"
            copy="Tempo is restoring the account and repertoire state."
            asset={BLUNDR_EMPTY_STATE_ASSETS.loadingTempo}
            tone="neutral"
          />
          <MiniStateCard
            icon={<Clock3 size={16} className="text-stone-600" />}
            title="Loading Daily Blundr"
            copy="The daily review loop is lining up in the background."
            asset={BLUNDR_TEMPO_ASSETS.thinking}
          />
          <MiniStateCard
            icon={<Sparkles size={16} className="text-green-700" />}
            title="Loading reward history"
            copy="Tempo Cache history will appear once the local or authenticated state is ready."
            asset={BLUNDR_EMPTY_STATE_ASSETS.offlineLocalDemo}
            tone="neutral"
          />
        </MockStage>
      ),
    },
    {
      id: "error-state",
      title: "Error state",
      subtitle: "Simplified mock: route errors are handled inline, not in a standalone error page.",
      mode: "component",
      approximate: true,
      content: (
        <MockStage
          title="Error states"
          subtitle="Simplified mock: the production app falls back inline, so this frame collects the safe fallback states in one place."
        >
          <MiniStateCard
            icon={<XCircle size={16} className="text-red-700" />}
            title="Auth failed"
            copy="Tempo could not complete sign-in, so the local demo fallback stays available."
            asset={BLUNDR_TEMPO_ASSETS.sad}
            tone="error"
          />
          <MiniStateCard
            icon={<AlertTriangle size={16} className="text-amber-700" />}
            title="Sync error"
            copy="A network or persistence issue should fall back to the safe copy and keep the UI calm."
            asset={BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback}
            tone="warning"
          />
          <MiniStateCard
            icon={<Shield size={16} className="text-green-700" />}
            title="Offline demo"
            copy="When Supabase is unavailable, the app can keep moving in local demo mode."
            asset={BLUNDR_EMPTY_STATE_ASSETS.offlineLocalDemo}
            tone="positive"
          />
        </MockStage>
      ),
    },
  ];
}

export function UIStudio() {
  const screens = useMemo(() => buildScreens(), []);
  const routeScreenIds = useMemo(() => screens.filter((screen) => screen.mode === "route").map((screen) => screen.id), [screens]);
  const [settledRoutes, setSettledRoutes] = useState<Record<string, boolean>>(() => Object.fromEntries(routeScreenIds.map((id) => [id, false])));
  const readyTimerRef = useRef<number | null>(null);
  const routeReadyPollRef = useRef<number | null>(null);
  const routeReadySinceRef = useRef<number | null>(null);
  const [allScreensReady, setAllScreensReady] = useState(false);

  useEffect(() => {
    const complete = routeScreenIds.every((id) => settledRoutes[id]);
    if (!complete) {
      if (readyTimerRef.current) {
        window.clearTimeout(readyTimerRef.current);
        readyTimerRef.current = null;
      }
      return;
    }

    if (readyTimerRef.current) {
      window.clearTimeout(readyTimerRef.current);
    }
    readyTimerRef.current = window.setTimeout(() => {
      setAllScreensReady(true);
    }, 600);

    return () => {
      if (readyTimerRef.current) {
        window.clearTimeout(readyTimerRef.current);
        readyTimerRef.current = null;
      }
      };
  }, [routeScreenIds, settledRoutes]);

  useEffect(() => {
    if (allScreensReady) {
      if (routeReadyPollRef.current) {
        window.clearInterval(routeReadyPollRef.current);
        routeReadyPollRef.current = null;
      }
      return;
    }

    const checkRouteFramesReady = () => {
      const routeFrames = Array.from(document.querySelectorAll('section[data-ui-screen-kind="route"] iframe')) as HTMLIFrameElement[];
      const allRouteFramesComplete =
        routeFrames.length === routeScreenIds.length && routeFrames.every((iframe) => iframe.contentDocument?.readyState === "complete");

      if (!allRouteFramesComplete) {
        routeReadySinceRef.current = null;
        return;
      }

      if (routeReadySinceRef.current == null) {
        routeReadySinceRef.current = Date.now();
        return;
      }

      if (Date.now() - routeReadySinceRef.current >= 1500) {
        setAllScreensReady(true);
      }
    };

    checkRouteFramesReady();
    routeReadyPollRef.current = window.setInterval(checkRouteFramesReady, 250);

    return () => {
      if (routeReadyPollRef.current) {
        window.clearInterval(routeReadyPollRef.current);
        routeReadyPollRef.current = null;
      }
    };
  }, [allScreensReady, routeScreenIds]);

  useEffect(() => {
    return () => {
      if (readyTimerRef.current) {
        window.clearTimeout(readyTimerRef.current);
      }
      if (routeReadyPollRef.current) {
        window.clearInterval(routeReadyPollRef.current);
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 text-stone-950">
      <header className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-green-700">Internal only</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-950">Blundr UI Screen Studio</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
              Actual route previews are mounted in 390 × 844 frames whenever a production route exists. When the app does not expose a dedicated route, the studio uses a small explicit mock and labels it clearly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-green-700">390 × 844 frames</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600">Dev gated</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600">Real routes first</span>
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap justify-center gap-8" data-ui-screens-ready={allScreensReady ? "true" : "false"}>
        {screens.map((screen) => (
          <ScreenFrame
            key={screen.id}
            spec={screen}
            onSettled={(id) => {
              if (screen.mode !== "route") return;
              setSettledRoutes((current) => (current[id] ? current : { ...current, [id]: true }));
            }}
          />
        ))}
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-600 shadow-sm">
        The studio is intentionally hidden under <span className="font-black text-stone-900">/dev</span> and is not linked from production navigation. Route preview screens use the real production components, shell, theme classes, and layout wrappers whenever the app exposes them.
      </div>
    </div>
  );
}
