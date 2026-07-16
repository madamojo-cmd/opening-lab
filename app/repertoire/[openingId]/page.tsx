import { OpeningDetailRouteClient } from "@/components/repertoire/openingDetail/OpeningDetailRouteClient";

export const dynamic = "force-dynamic";

export default async function OpeningDetailRoute({
  params,
}: {
  params: Promise<{ openingId: string }>;
}) {
  const { openingId } = await params;
  return <OpeningDetailRouteClient openingId={openingId} />;
}
