"use client";

import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";

export async function persistContinuationCompletion(input: {
  trainerSessionId: string;
  pathUci: readonly string[];
}) {
  return authenticatedApiFetch<{
    status: "inserted" | "duplicate";
    evidenceId: string;
    trainerSessionId: string;
  }>("/api/blundr/continuation/completions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
