"use client";

import type { ReactElement } from "react";

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "true");
  area.style.position = "fixed";
  area.style.top = "-9999px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(area);
  }
  return copied;
}

export function DebugCopyButton({ label, getText }: { label: string; getText: () => string }): ReactElement {
  async function copy() {
    const text = getText();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {}
    legacyCopy(text);
  }
  return <button type="button" onClick={copy} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black text-stone-900">{label}</button>;
}
