"use client";

import type { ReactElement } from "react";
import { stringifyDebugJson } from "@/lib/blundr/debug/trainerDebugSanitizer";

export function DebugJsonViewer({ value }: { value: unknown }): ReactElement {
  return <pre className="max-h-80 overflow-auto rounded-xl bg-black/50 p-3 text-[10px] leading-4 text-green-100">{stringifyDebugJson(value)}</pre>;
}
