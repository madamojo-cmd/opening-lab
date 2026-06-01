"use client";

import type { ReactElement } from "react";

export function DebugCopyButton({ label, getText }: { label: string; getText: () => string }): ReactElement {
  async function copy() {
    try {
      await navigator.clipboard.writeText(getText());
    } catch {}
  }
  return <button type="button" onClick={copy} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black text-stone-900">{label}</button>;
}
