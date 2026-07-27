"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

type PasswordFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  name?: string;
  helperText?: ReactNode;
  errorText?: ReactNode;
};

type SelectionSnapshot = {
  start: number | null;
  end: number | null;
  direction: "forward" | "backward" | "none" | null;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  minLength,
  disabled,
  name,
  helperText,
  errorText,
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef<SelectionSnapshot | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const snapshot = selectionRef.current;
    const input = inputRef.current;
    if (!snapshot || !input) return;
    const frame = window.requestAnimationFrame(() => {
      const nextInput = inputRef.current;
      if (!nextInput) return;
      try {
        nextInput.focus({ preventScroll: true });
        if (snapshot.start !== null && snapshot.end !== null) {
          nextInput.setSelectionRange(
            snapshot.start,
            snapshot.end,
            snapshot.direction ?? "none",
          );
        }
      } catch {
        nextInput.focus({ preventScroll: true });
      } finally {
        selectionRef.current = null;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  const toggleVisibility = () => {
    const input = inputRef.current;
    if (input) {
      selectionRef.current = {
        start: input.selectionStart,
        end: input.selectionEnd,
        direction: input.selectionDirection,
      };
    }
    setVisible((current) => !current);
  };

  const describedByIds = [
    helperText ? `${inputId}-helper` : null,
    errorText ? `${inputId}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label
      className="grid gap-2 text-sm font-bold text-stone-700"
      htmlFor={inputId}
    >
      {label}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={describedByIds || undefined}
          className="min-h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-28 text-sm font-medium text-stone-950 shadow-sm outline-none ring-0 placeholder:text-stone-400 focus:border-green-300 disabled:cursor-not-allowed disabled:bg-stone-100"
        />
        <button
          type="button"
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-2 my-auto min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-xs font-black uppercase tracking-[0.12em] text-stone-700 shadow-sm outline-none transition hover:border-green-300 hover:text-green-800 focus:border-green-400 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {helperText ? (
        <p
          id={`${inputId}-helper`}
          className="text-xs font-medium leading-5 text-stone-500"
        >
          {helperText}
        </p>
      ) : null}
      {errorText ? (
        <p
          id={`${inputId}-error`}
          className="text-xs font-semibold leading-5 text-red-700"
        >
          {errorText}
        </p>
      ) : null}
    </label>
  );
}
