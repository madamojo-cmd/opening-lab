"use client";

import { CheckCircle2, Trophy, XCircle, Sparkles } from "lucide-react";
import type { DailyBlundrCardFeedbackProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

function feedbackToneClasses(
  tone: DailyBlundrCardFeedbackProps["tone"],
): string {
  if (tone === "complete") {
    return "border-green-200/80 bg-green-50/90 text-green-950";
  }
  if (tone === "warning") {
    return "border-amber-200/80 bg-amber-50/90 text-amber-950";
  }
  if (tone === "success") {
    return "border-green-200/80 bg-green-50/90 text-green-950";
  }
  return "border-stone-200/80 bg-white/90 text-stone-700";
}

function feedbackToneIcon(tone: DailyBlundrCardFeedbackProps["tone"]) {
  if (tone === "complete") return <Trophy size={16} />;
  if (tone === "warning") return <XCircle size={16} />;
  if (tone === "success") return <CheckCircle2 size={16} />;
  return <Sparkles size={16} />;
}

function feedbackToneLabel(tone: DailyBlundrCardFeedbackProps["tone"]): string {
  if (tone === "complete") return "Complete";
  if (tone === "warning") return "Verified move";
  if (tone === "success") return "Correct";
  return "Daily";
}

export function DailyBlundrCardFeedback({
  message,
  tone,
}: DailyBlundrCardFeedbackProps) {
  return (
    <div
      className={`rounded-[1.5rem] border p-4 text-sm leading-6 shadow-[0_12px_30px_rgba(20,17,12,0.06)] ${feedbackToneClasses(tone)}`}
    >
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] opacity-80">
        {feedbackToneIcon(tone)}
        {feedbackToneLabel(tone)}
      </div>
      <p className="mt-2 font-semibold leading-6">{message}</p>
    </div>
  );
}
