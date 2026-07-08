import { TrainRouteShell } from "./TrainRouteShell";

export const metadata = {
  title: "Train | Blundr",
  description: "Opening reps and trainer flow.",
};

export const dynamic = "force-dynamic";

export default async function TrainPage({
  searchParams,
}: {
  searchParams?: {
    openingId?: string | string[];
  };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const openingId = typeof resolvedSearchParams?.openingId === "string" ? resolvedSearchParams.openingId : Array.isArray(resolvedSearchParams?.openingId) ? resolvedSearchParams.openingId[0] : null;

  return <TrainRouteShell initialOpeningId={openingId} />;
}
