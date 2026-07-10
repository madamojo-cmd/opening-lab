"use client";

import { ProfileSettingsIcon } from "./ProfileSettingsIcon";
import { classNames } from "@/components/blundr/ui";

type BlundrTopBarProps = {
  className?: string;
};

export function BlundrTopBar({ className }: BlundrTopBarProps) {
  return (
    <div className={classNames("pointer-events-none fixed right-4 top-4 z-40", className)}>
      <div className="pointer-events-auto">
        <ProfileSettingsIcon />
      </div>
    </div>
  );
}
