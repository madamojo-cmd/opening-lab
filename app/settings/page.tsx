import { SettingsPage } from "@/components/settings/SettingsPage";

export const metadata = {
  title: "Settings | Blundr",
  description: "Account, board, and training preferences.",
};

export default function SettingsRoutePage() {
  return <SettingsPage homeHref="/" />;
}
