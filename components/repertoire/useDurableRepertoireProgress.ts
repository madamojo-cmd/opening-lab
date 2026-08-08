"use client";

import { useCallback, useEffect, useState } from "react";
import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";

export type DurableRepertoireProgressState =
  | { status: "loading"; progress: null; error: null }
  | { status: "signed_out"; progress: null; error: null }
  | { status: "error"; progress: null; error: string }
  | { status: "ready"; progress: RepertoireProgress; error: null };

type DurableRepertoireResponse = {
  ok: true;
  data: RepertoireProgress;
};

export function useDurableRepertoireProgress(): [
  DurableRepertoireProgressState,
  () => Promise<void>,
] {
  const [state, setState] = useState<DurableRepertoireProgressState>({
    status: "loading",
    progress: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) =>
      current.status === "ready"
        ? { status: "loading", progress: null, error: null }
        : { status: "loading", progress: null, error: null },
    );
    try {
      const response = await authenticatedApiFetch<DurableRepertoireResponse>(
        "/api/blundr/repertoire/progress",
        { cache: "no-store" },
      );
      setState({
        status: "ready",
        progress: response.data,
        error: null,
      });
    } catch (error) {
      if (
        error instanceof AuthenticatedApiError &&
        error.code === "authentication_required"
      ) {
        setState({ status: "signed_out", progress: null, error: null });
        return;
      }
      setState({
        status: "error",
        progress: null,
        error:
          error instanceof Error && error.message.trim()
            ? error.message
            : "Repertoire progress could not be loaded.",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return [state, refresh];
}
