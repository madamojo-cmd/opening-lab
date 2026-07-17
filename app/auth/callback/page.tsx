"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBlundrSupabaseBrowserClient } from "@/lib/blundr/backend/supabaseBrowserClient";
import { normalizeAppNext } from "@/lib/blundr/routing/appRouteSafety";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Confirming your account…");
  useEffect(() => {
    const next = normalizeAppNext(params.get("next"));
    const client = createBlundrSupabaseBrowserClient();
    if (!client) { setMessage("Authentication is temporarily unavailable. Return to login and try again."); return; }
    void client.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
      else setMessage("This link is invalid or expired. Request a new confirmation link from login.");
    }).catch(() => setMessage("This link is invalid or expired. Request a new confirmation link from login."));
  }, [params, router]);
  return <main className="min-h-screen bg-stone-50 p-6"><section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm"><h1 className="text-2xl font-black">Account confirmation</h1><p className="mt-3 text-stone-700" role="status">{message}</p></section></main>;
}
