"use client";

import { CheckCircle2, Trophy, XCircle, Sparkles } from "lucide-react";
import type { DailyBlundrCardFeedbackProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

function feedbackToneClasses(tone: DailyBlundrCardFeedbackProps["tone"]): string {
  if (tone === "complete") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "success") return "border-green-200 bg-green-50 text-green-900";
  return "border-stone-200 bg-stone-50 text-stone-700";
}

function feedbackToneIcon(tone: DailyBlundrCardFeedbackProps["tone"]) {
  if (tone === "complete") return <Trophy size={16} />;
  if (tone === "warning") return <XCircle size={16} />;
  if (tone === "success") return <CheckCircle2 size={16} />;
  return <Sparkles size={16} />;
}

export function DailyBlundrCardFeedback({ message, tone }: DailyBlundrCardFeedbackProps) {
  return (
    <div className={`rounded-3xl border p-4 text-sm leading-6 shadow-sm ${feedbackToneClasses(tone)}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] opacity-80">
        {feedbackToneIcon(tone)}
        Blundr
      </div>
      <p className="mt-2 font-semibold">{message}</p>
    </div>
  );
}
