import type { MasteryStatus } from "@/lib/blundr/masteryMap";
export function MasteryNodeBadge({ status }: { status: MasteryStatus }) {
  return (
    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black capitalize text-stone-700">
      {status.replaceAll("_", " ")}
    </span>
  );
}
