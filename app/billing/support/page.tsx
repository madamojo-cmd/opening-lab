import Link from "next/link";

export default function BillingSupportPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-10 text-stone-950 sm:px-6">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/settings#billing"
          className="text-sm font-black text-green-800 underline underline-offset-4"
        >
          Back to Billing
        </Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight">
          Billing Support
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          Contact Blundr support for unexpected charges, payment problems,
          cancellation questions, duplicate subscriptions, refund requests, or
          entitlement issues.
        </p>
        <div className="mt-8 space-y-4">
          {[
            "Unexpected charge",
            "Payment problem",
            "Cancellation help",
            "Refund request",
            "Duplicate subscription",
            "Pro entitlement issue",
          ].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-stone-200 bg-white p-4"
            >
              <h2 className="text-base font-black">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Email support with your account email and the approximate date
                of the billing event. Do not send full card numbers, passwords,
                or secret keys.
              </p>
            </div>
          ))}
        </div>
        <a
          href="mailto:support@blundr.io?subject=Blundr%20billing%20support"
          className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-4 text-sm font-black text-white"
        >
          Email billing support
        </a>
      </section>
    </main>
  );
}
