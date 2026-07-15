import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { loadOpeningDetailReadModel } from "@/lib/blundr/masteryMap/openingDetailRepository.server";
import { OpeningDetailPage } from "@/components/repertoire/openingDetail/OpeningDetailPage";

export const dynamic = "force-dynamic";

export default async function OpeningDetailRoute({
  params,
}: {
  params: Promise<{ openingId: string }>;
}) {
  const { openingId } = await params;
  const incoming = await headers();
  const request = new Request(
    "http://blundr.local/repertoire/" + encodeURIComponent(openingId),
    {
      headers: { authorization: incoming.get("authorization") ?? "" },
    },
  );
  const model = await loadOpeningDetailReadModel({ request, openingId });
  if (!model) notFound();
  return <OpeningDetailPage model={model} />;
}
