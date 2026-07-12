import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { BLUNDR_EMPTY_STATE_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrButton } from "./BlundrButton";
import { BlundrCard } from "./BlundrCard";
import { BlundrChip } from "./BlundrChip";

type StateKind = "empty" | "loading" | "error" | "offline" | "success";

type StateCta = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type BlundrStateCardProps = {
  kind: StateKind;
  title: string;
  copy: string;
  asset?: string;
  eyebrow?: string;
  cta?: StateCta;
  secondary?: ReactNode;
  className?: string;
};

const defaultAssetByKind: Record<StateKind, string> = {
  empty: BLUNDR_EMPTY_STATE_ASSETS.emptyReviewQueue,
  loading: BLUNDR_EMPTY_STATE_ASSETS.loadingTempo,
  error: BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback,
  offline: BLUNDR_EMPTY_STATE_ASSETS.offlineLocalDemo,
  success: BLUNDR_EMPTY_STATE_ASSETS.emptyDailyBlundr,
};

export function BlundrStateCard({
  kind,
  title,
  copy,
  asset,
  eyebrow,
  cta,
  secondary,
  className,
}: BlundrStateCardProps) {
  const tone = kind === "error" ? "danger" : kind === "success" ? "green" : "default";
  const chipTone = kind === "error" ? "red" : kind === "loading" ? "blue" : kind === "success" ? "green" : "stone";
  const Icon = kind === "loading" ? Loader2 : kind === "error" ? AlertTriangle : CheckCircle2;

  return (
    <BlundrCard tone={tone} className={className}>
      <div className="flex flex-col items-center px-2 py-3 text-center">
        <div className="relative mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-[#2e6b4f]/[0.07]">
          <div className="absolute inset-4 rounded-full bg-[#2e6b4f]/[0.06]" />
          <BlundrAssetImage
            asset={asset ?? defaultAssetByKind[kind]}
            alt={title}
            variant="emptyState"
            className="relative !h-32 !w-32 !max-w-none !p-0"
          />
        </div>
        <div className="min-w-0">
          <BlundrChip tone={chipTone} icon={<Icon size={13} className={kind === "loading" ? "animate-spin" : ""} />}>
            {eyebrow ?? kind}
          </BlundrChip>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">{title}</h2>
          <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-6 text-stone-600">{copy}</p>
          {cta ? (
            <BlundrButton
              href={cta.href}
              onClick={cta.onClick}
              fullWidth
              className="mt-6"
              variant={kind === "error" ? "secondary" : "primary"}
            >
              {cta.label}
            </BlundrButton>
          ) : null}
          {secondary ? <div className="mt-4">{secondary}</div> : null}
        </div>
      </div>
    </BlundrCard>
  );
}
