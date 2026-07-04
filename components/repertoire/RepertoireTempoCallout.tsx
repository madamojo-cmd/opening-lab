"use client";

import { TempoCallout } from "../onboarding/TempoCallout";

type RepertoireTempoCalloutProps = {
  className?: string;
};

export function RepertoireTempoCallout({ className }: RepertoireTempoCalloutProps) {
  return (
    <TempoCallout
      title="Tempo"
      copy="Every rep makes your repertoire wider. Start with your pack, then unlock the lines you want next."
      tone="positive"
      className={className}
    />
  );
}
