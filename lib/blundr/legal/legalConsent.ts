export type BlundrLegalDocumentType = "terms" | "privacy";
export type BlundrLegalAcceptanceContext = "signup" | "reconsent" | "upgrade";

export const BLUNDR_CURRENT_LEGAL_DOCUMENTS: Record<
  BlundrLegalDocumentType,
  string
> = {
  terms: "terms-20260904",
  privacy: "privacy-20260904",
};

export const BLUNDR_LEGAL_DOCUMENT_TYPES = Object.keys(
  BLUNDR_CURRENT_LEGAL_DOCUMENTS,
) as BlundrLegalDocumentType[];

export function isBlundrLegalDocumentType(
  value: unknown,
): value is BlundrLegalDocumentType {
  return value === "terms" || value === "privacy";
}

export function isBlundrLegalAcceptanceContext(
  value: unknown,
): value is BlundrLegalAcceptanceContext {
  return value === "signup" || value === "reconsent" || value === "upgrade";
}
