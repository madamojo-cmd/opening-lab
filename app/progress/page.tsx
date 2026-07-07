import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata = {
  title: "Progress | Blundr",
  description: "See training momentum, streaks, weak areas, and next actions.",
};

export default function ProgressPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
      <ProgressDashboard homeHref="/" settingsHref="/settings" />
    </main>
  );
}
