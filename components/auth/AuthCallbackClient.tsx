"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBlundrSupabaseBrowserClient } from "@/lib/blundr/backend/supabaseBrowserClient";
import { normalizeAppNext } from "@/lib/blundr/routing/appRouteSafety";

export function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Confirming your account…");
  useEffect(() => {
    const next = normalizeAppNext(params.get("next"));
    const client = createBlundrSupabaseBrowserClient();
    if (!client) {
      setMessage("Authentication is temporarily unavailable. Return to login and try again.");
      return;
    }
    void client.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) router.replace(next);
        else
          setMessage(
            "This link is invalid or expired. Request a new confirmation link from login.",
          );
      })
      .catch(() =>
        setMessage(
          "This link is invalid or expired. Request a new confirmation link from login.",
        ),
      );
  }, [params, router]);
  return <p className="mt-3 text-stone-700" role="status">{message}</p>;
}
