"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; primaryLabel?: string; onPrimaryAction?: () => void; dismissible?: boolean };
const FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function RewardModalBase({ open, title, description, onClose, children, primaryLabel, onPrimaryAction, dismissible = true }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => (primaryRef.current ?? dialogRef.current)?.focus(), 0);
    const escape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape" && dismissible) onClose(); };
    window.addEventListener("keydown", escape);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", escape); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [dismissible, onClose, open]);

  function trapFocus(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!controls.length) { event.preventDefault(); dialogRef.current.focus(); return; }
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  if (!open) return null;
  return <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(12,22,16,.52)] p-4 backdrop-blur-[8px]" onMouseDown={(event) => { if (dismissible && event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} tabIndex={-1} onKeyDown={trapFocus} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className="max-h-[calc(100dvh-32px)] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-[26px] border border-[#dbc47f] bg-[#fffaf0] p-6 text-[#173c2b] shadow-[0_28px_80px_rgba(6,25,15,.32)]">
      <div className="flex items-start justify-between gap-3"><div><div className="text-[11px] font-bold uppercase tracking-[.2em] text-[#8b6b25]">Blundr reward</div><h2 id={titleId} className="mt-2 text-[26px] font-bold leading-tight">{title}</h2></div>{dismissible ? <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e6b4f]" aria-label="Close popup"><X size={20} /></button> : null}</div>
      {description ? <p id={descriptionId} className="mt-2 text-[15px] leading-6 text-[#52675a]">{description}</p> : null}
      <div className="py-5">{children}</div>
      {onPrimaryAction ? <button ref={primaryRef} type="button" onClick={onPrimaryAction} className="min-h-12 w-full rounded-2xl bg-[#2e6b4f] px-5 font-bold text-white transition hover:bg-[#24583f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8923a]">{primaryLabel ?? "Done"}</button> : null}
    </section>
  </div>;
}
