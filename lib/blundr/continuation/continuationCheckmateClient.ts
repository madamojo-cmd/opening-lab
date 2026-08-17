"use client";

import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";

export async function persistContinuationCheckmate(input: {
  trainerSessionId: string;
  pathUci: readonly string[];
}) {
  return authenticatedApiFetch<{
    status: "inserted" | "duplicate";
    evidenceId: string;
    trainerSessionId: string;
  }>("/api/blundr/continuation/checkmates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
