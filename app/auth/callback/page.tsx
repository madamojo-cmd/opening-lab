import { Suspense } from "react";

import { AuthCallbackClient } from "@/components/auth/AuthCallbackClient";

type AuthCallbackPageProps = {
  searchParams?: {
    next?: string;
    type?: string;
    flow_type?: string;
  };
};

export default function AuthCallbackPage({
  searchParams,
}: AuthCallbackPageProps) {
  const isRecovery =
    searchParams?.type === "recovery" ||
    searchParams?.flow_type === "recovery" ||
    String(searchParams?.next ?? "").startsWith("/reset-password");

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">
          {isRecovery ? "Password recovery" : "Account confirmation"}
        </h1>
        <Suspense
          fallback={
            <p className="mt-3 text-stone-700" role="status">
              {isRecovery
                ? "Confirming your password recovery link…"
                : "Confirming your account…"}
            </p>
          }
        >
          <AuthCallbackClient />
        </Suspense>
      </section>
    </main>
  );
}
