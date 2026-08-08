"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CircleHelp,
  CircleUserRound,
  ChevronDown,
  Scale,
  Settings2,
} from "lucide-react";
import { classNames } from "@/components/blundr/ui";

type ProfileSettingsIconProps = {
  className?: string;
};

export function ProfileSettingsIcon({ className }: ProfileSettingsIconProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current) return;
      if (
        event.target instanceof Node &&
        rootRef.current.contains(event.target)
      )
        return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = itemRefs.current.findIndex(
      (item) => item === document.activeElement,
    );
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        (Math.max(currentIndex, 0) + direction + itemRefs.current.length) %
        itemRefs.current.length;
      itemRefs.current[nextIndex]?.focus();
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      itemRefs.current[
        event.key === "Home" ? 0 : itemRefs.current.length - 1
      ]?.focus();
    }
  }

  return (
    <div ref={rootRef} className={classNames("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Profile and settings"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-2xl border border-stone-200 bg-white px-3 text-stone-700 shadow-sm transition hover:bg-stone-50"
      >
        <CircleUserRound size={18} className="text-green-700" />
        <ChevronDown
          size={14}
          className={open ? "rotate-180 transition" : "transition"}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Profile and settings"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 mt-2 w-44 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg"
        >
          <Link
            ref={(node) => {
              itemRefs.current[0] = node;
            }}
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-green-50 hover:text-green-700"
          >
            <CircleUserRound size={16} className="text-green-700" />
            Profile
          </Link>
          <Link
            ref={(node) => {
              itemRefs.current[1] = node;
            }}
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-stone-100 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-green-50 hover:text-green-700"
          >
            <Settings2 size={16} className="text-green-700" />
            Settings
          </Link>
          <Link
            ref={(node) => {
              itemRefs.current[2] = node;
            }}
            href="/settings#support_about"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-stone-100 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-green-50 hover:text-green-700"
          >
            <CircleHelp size={16} className="text-green-700" />
            Help
          </Link>
          <Link
            ref={(node) => {
              itemRefs.current[3] = node;
            }}
            href="/privacy"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-stone-100 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-green-50 hover:text-green-700"
          >
            <Scale size={16} className="text-green-700" />
            Legal
          </Link>
        </div>
      ) : null}
    </div>
  );
}
