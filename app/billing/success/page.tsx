import { BillingResultPage } from "@/components/billing/BillingResultPage";

export const metadata = {
  title: "Billing confirmation | Blundr",
  description: "Blundr Pro subscription confirmation.",
};

export default function BillingSuccessPage() {
  return <BillingResultPage mode="success" />;
}
