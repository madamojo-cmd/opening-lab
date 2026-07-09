"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CircleUserRound, ChevronDown, Settings2 } from "lucide-react";
import { classNames } from "@/components/blundr/ui";

type ProfileSettingsIconProps = {
  className?: string;
};

export function ProfileSettingsIcon({ className }: ProfileSettingsIconProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current) return;
      if (event.target instanceof Node && rootRef.current.contains(event.target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={classNames("relative", className)}>
      <button
        type="button"
        aria-label="Profile and settings"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-3 text-stone-700 shadow-sm transition hover:bg-stone-50"
      >
        <CircleUserRound size={18} className="text-green-700" />
        <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Profile and settings"
          className="absolute right-0 mt-2 w-44 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-green-50 hover:text-green-700"
          >
            <CircleUserRound size={16} className="text-green-700" />
            Profile
          </Link>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-stone-100 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-green-50 hover:text-green-700"
          >
            <Settings2 size={16} className="text-green-700" />
            Settings
          </Link>
        </div>
      ) : null}
    </div>
  );
}
