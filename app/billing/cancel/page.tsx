import { BillingResultPage } from "@/components/billing/BillingResultPage";

export const metadata = {
  title: "Billing canceled | Blundr",
  description: "Return to Blundr plan selection.",
};

export default function BillingCancelPage() {
  return <BillingResultPage mode="cancel" />;
}
