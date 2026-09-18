import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata = {
  title: "Progress | Blundr",
  description: "See training momentum, streaks, weak areas, and next actions.",
};

export default function ProgressPage() {
  return (
    <main className="w-full">
      <ProgressDashboard homeHref="/" settingsHref="/settings" />
    </main>
  );
}
