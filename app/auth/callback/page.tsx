import { Suspense } from "react";
import { AuthCallbackClient } from "@/components/auth/AuthCallbackClient";

export default function AuthCallbackPage() {
  return <main className="min-h-screen bg-stone-50 p-6"><section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm"><h1 className="text-2xl font-black">Account confirmation</h1><Suspense fallback={<p className="mt-3 text-stone-700" role="status">Confirming your account…</p>}><AuthCallbackClient /></Suspense></section></main>;
}
