"use client";

import { useState, type ReactNode, type ReactElement } from "react";

export function DebugSection({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }): ReactElement {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-stone-700 bg-stone-900/80">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-black text-stone-100">
        <span>{title}</span>
        <span className="text-stone-400">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-stone-700 p-3 text-[11px] leading-5 text-stone-200">{children}</div>}
    </section>
  );
}
