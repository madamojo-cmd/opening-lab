import type { Metadata } from "next";
import { CommercialLegalPage } from "@/components/legal/CommercialLegalPage";
import { COMMERCIAL_LEGAL_DOCUMENTS } from "@/lib/blundr/legal/commercialLegalContent";

export const metadata: Metadata = COMMERCIAL_LEGAL_DOCUMENTS.privacy;

export default function PrivacyPage() {
  return <CommercialLegalPage document="privacy" />;
}
