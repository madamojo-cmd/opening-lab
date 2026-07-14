"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { BlundrButton } from "./BlundrButton";
import { classNames } from "./utils";

type BlundrModalAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "premium";
  disabled?: boolean;
};

type BlundrModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  actions?: BlundrModalAction[];
  tone?: "default" | "reward" | "danger";
  size?: "sm" | "md" | "lg";
  closeLabel?: string;
  className?: string;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function BlundrModal({
  open,
  title,
  description,
  onClose,
  children,
  actions,
  tone = "default",
  size = "md",
  closeLabel = "Close",
  className,
}: BlundrModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => closeRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-stone-950/35 px-4 py-4 backdrop-blur-[3px] sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="blundr-modal-title"
        aria-describedby={description ? "blundr-modal-description" : undefined}
        onClick={(event) => event.stopPropagation()}
        className={classNames(
          "w-full overflow-hidden rounded-[2rem] border bg-white shadow-[0_30px_90px_rgba(15,23,42,0.30)]",
          "max-h-[88vh] overflow-y-auto",
          sizeClasses[size],
          tone === "reward" && "border-[#ead8ad] bg-[#fffdf6]",
          tone === "danger" && "border-red-200",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 p-4">
          <div className="min-w-0">
            <h2 id="blundr-modal-title" className="text-xl font-black tracking-tight text-stone-950">
              {title}
            </h2>
            {description ? (
              <p id="blundr-modal-description" className="mt-1 text-sm leading-6 text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>
        {children ? <div className="p-4">{children}</div> : null}
        {actions?.length ? (
          <div className="grid gap-2 border-t border-stone-100 p-4 sm:grid-cols-2">
            {actions.map((action, index) => (
              <BlundrButton
                key={`${action.label}:${index}`}
                variant={action.variant ?? (index === 0 ? "primary" : "secondary")}
                fullWidth
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </BlundrButton>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
