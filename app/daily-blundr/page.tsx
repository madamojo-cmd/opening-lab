import { redirect } from "next/navigation";

/** Canonical architecture alias; existing Daily behavior remains at /daily. */
export default function DailyBlundrAliasPage() {
  redirect("/daily");
}
