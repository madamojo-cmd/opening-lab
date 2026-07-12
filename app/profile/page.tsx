import { BlundrBottomNav } from "@/components/navigation/BlundrBottomNav";
import { ProfilePage } from "@/components/profile/ProfilePage";

export const metadata = {
  title: "Profile | Blundr",
  description: "Your Blundr training profile, daily plan, streak, repertoire, and account status.",
};

export default function ProfileRoutePage() {
  return (
    <>
      <ProfilePage />
      <BlundrBottomNav />
    </>
  );
}
