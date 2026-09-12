import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import {
  BLUNDR_CURRENT_LEGAL_DOCUMENTS,
  BLUNDR_LEGAL_DOCUMENT_TYPES,
  isBlundrLegalAcceptanceContext,
  isBlundrLegalDocumentType,
  type BlundrLegalAcceptanceContext,
  type BlundrLegalDocumentType,
} from "./legalConsent";

type LegalAcceptanceRow = {
  document_type: BlundrLegalDocumentType;
  document_version: string;
  accepted_at: string;
  acceptance_context: BlundrLegalAcceptanceContext;
  locale: string | null;
};

type LegalAcceptanceStatus = {
  documentType: BlundrLegalDocumentType;
  currentVersion: string;
  accepted: boolean;
  acceptedAt: string | null;
  acceptanceContext: BlundrLegalAcceptanceContext | null;
};

function normalizeLocale(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/.test(text)
    ? text.slice(0, 32)
    : null;
}

function normalizeContext(
  value: unknown,
  fallback: BlundrLegalAcceptanceContext,
): BlundrLegalAcceptanceContext {
  return isBlundrLegalAcceptanceContext(value) ? value : fallback;
}

export async function recordCurrentLegalAcceptances(input: {
  userId: string;
  context: BlundrLegalAcceptanceContext;
  locale?: unknown;
  documentTypes?: readonly BlundrLegalDocumentType[];
}): Promise<void> {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("legal_acceptance_persistence_unavailable");
  const context = normalizeContext(input.context, "reconsent");
  const locale = normalizeLocale(input.locale);
  const documentTypes = input.documentTypes?.length
    ? input.documentTypes.filter(isBlundrLegalDocumentType)
    : BLUNDR_LEGAL_DOCUMENT_TYPES;
  if (documentTypes.length === 0) throw new Error("legal_document_required");
  const acceptedAt = new Date().toISOString();
  const result = await admin.from("blundr_user_legal_acceptances").upsert(
    documentTypes.map((documentType) => ({
      user_id: input.userId,
      document_type: documentType,
      document_version: BLUNDR_CURRENT_LEGAL_DOCUMENTS[documentType],
      acceptance_context: context,
      locale,
      accepted_at: acceptedAt,
    })),
    {
      onConflict: "user_id,document_type,document_version,acceptance_context",
      ignoreDuplicates: true,
    },
  );
  if (result.error) throw new Error("legal_acceptance_persistence_failed");
}

export async function readCurrentLegalAcceptanceStatus(input: {
  userId: string;
}): Promise<LegalAcceptanceStatus[]> {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("legal_acceptance_persistence_unavailable");
  const result = await admin
    .from("blundr_user_legal_acceptances")
    .select(
      "document_type,document_version,accepted_at,acceptance_context,locale",
    )
    .eq("user_id", input.userId)
    .in("document_type", BLUNDR_LEGAL_DOCUMENT_TYPES)
    .order("accepted_at", { ascending: false });
  if (result.error) throw new Error("legal_acceptance_lookup_failed");
  const rows = (result.data ?? []) as LegalAcceptanceRow[];
  return BLUNDR_LEGAL_DOCUMENT_TYPES.map((documentType) => {
    const currentVersion = BLUNDR_CURRENT_LEGAL_DOCUMENTS[documentType];
    const row =
      rows.find(
        (item) =>
          item.document_type === documentType &&
          item.document_version === currentVersion,
      ) ?? null;
    return {
      documentType,
      currentVersion,
      accepted: Boolean(row),
      acceptedAt: row?.accepted_at ?? null,
      acceptanceContext: row?.acceptance_context ?? null,
    };
  });
}
