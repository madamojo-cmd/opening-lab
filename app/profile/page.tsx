import type { Metadata } from "next";

import { BlundrProfilePage } from "@/components/profile/BlundrProfilePage";

export const metadata: Metadata = {
  title: "Profile | Blundr",
  description: "Manage your Blundr username and account identity.",
};

export default function ProfilePage() {
  return <BlundrProfilePage />;
}
