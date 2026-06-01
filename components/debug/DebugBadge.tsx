"use client";

import type { ReactElement } from "react";
import type { DebugStatus } from "@/lib/blundr/debug/trainerDebugTypes";

export function DebugBadge({ label, status }: { label: string; status: DebugStatus }): ReactElement {
  const cls = status === "fail" ? "bg-red-100 text-red-800" : status === "warn" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800";
  return <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${cls}`}>{label}: {status}</span>;
}
