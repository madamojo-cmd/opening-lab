import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata = {
  title: "Progress | Blundr",
  description: "See training momentum, streaks, weak areas, and next actions.",
};

export default function ProgressPage() {
  return <ProgressDashboard homeHref="/" settingsHref="/settings" />;
}
