import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

export type CommercialLegalDocumentSlug =
  | "pricing"
  | "terms"
  | "privacy"
  | "subscription-terms"
  | "cookies"
  | "legal";

export type CommercialLegalDocument = {
  slug: CommercialLegalDocumentSlug;
  title: string;
  description: string;
  sourceFile: string;
};

export const COMMERCIAL_LEGAL_DOCUMENTS: Record<
  CommercialLegalDocumentSlug,
  CommercialLegalDocument
> = {
  pricing: {
    slug: "pricing",
    title: "Pricing | Blundr",
    description: "Blundr Free and Pro launch pricing and entitlements.",
    sourceFile: "01_PRICING_AND_ENTITLEMENTS.md",
  },
  terms: {
    slug: "terms",
    title: "Terms of Service | Blundr",
    description:
      "The terms that apply when you create an account and use Blundr.",
    sourceFile: "02_TERMS_OF_SERVICE.md",
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy | Blundr",
    description:
      "How Blundr collects, uses, protects, and deletes information.",
    sourceFile: "03_PRIVACY_POLICY.md",
  },
  "subscription-terms": {
    slug: "subscription-terms",
    title: "Subscription Terms | Blundr",
    description: "Blundr Pro trial, renewal, cancellation, and refund terms.",
    sourceFile: "04_SUBSCRIPTION_TERMS.md",
  },
  cookies: {
    slug: "cookies",
    title: "Cookie Policy | Blundr",
    description: "How Blundr uses cookies and similar technologies.",
    sourceFile: "05_COOKIE_POLICY.md",
  },
  legal: {
    slug: "legal",
    title: "Legal Notice | Blundr",
    description:
      "Blundr operator, support, privacy, and legal contact details.",
    sourceFile: "06_LEGAL_NOTICE.md",
  },
};

export function readCommercialLegalMarkdown(
  slug: CommercialLegalDocumentSlug,
): string {
  return readFileSync(
    join(
      process.cwd(),
      "content",
      "legal",
      COMMERCIAL_LEGAL_DOCUMENTS[slug].sourceFile,
    ),
    "utf8",
  );
}
