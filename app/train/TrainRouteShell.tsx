"use client";

import { useSearchParams } from "next/navigation";
import BlundrApp from "../page";
import { TrainSelectionPage } from "@/components/training/TrainSelectionPage";
import { resolveStage2CanonicalOpeningId } from "@/lib/blundr/openings/openingIdentity";

type TrainRouteShellProps = {
  initialOpeningId?: string | null;
};

export function TrainRouteShell({ initialOpeningId = null }: TrainRouteShellProps) {
  const searchParams = useSearchParams();
  const routeOpeningId = searchParams.get("openingId") ?? initialOpeningId;
  const canonicalOpeningId = routeOpeningId ? resolveStage2CanonicalOpeningId(routeOpeningId) ?? routeOpeningId : null;

  if (!canonicalOpeningId) {
    return <TrainSelectionPage />;
  }

  return <BlundrApp key={canonicalOpeningId} initialTab="train" initialOpeningId={canonicalOpeningId} />;
}
