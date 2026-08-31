import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Blundr",
  description: "The terms that apply when you create an account and use Blundr.",
};

const sections = [
  [
    "1. Using Blundr",
    [
      "Blundr provides chess training, repertoire practice, Daily Blundr, review, progress, rewards, and related account services. You may use the Services only if you can form a binding agreement and meet the minimum age requirement stated in these Terms and our Privacy Policy.",
      "The Services are not directed to children under 13. If you are under 13, you may not create or use a Blundr account.",
    ],
  ],
  [
    "2. Your Account",
    [
      "You are responsible for keeping your sign-in credentials secure and for activity under your account. Provide accurate information and keep it current where the Services ask for account, training, or support details.",
      "You may not access another user's account, interfere with account security, or use automated access in a way that harms the Services.",
    ],
  ],
  [
    "3. Training Content",
    [
      "Blundr is a chess-training product. Training recommendations, opening practice, review queues, progress, and rewards are provided for learning and may change as the product, data, and repertoire content improve.",
      "You remain responsible for how you use the training, including decisions made in games, tournaments, or other chess settings.",
    ],
  ],
  [
    "4. Connected Services",
    [
      "If you connect or reference third-party chess services, you authorize Blundr to use the information needed to provide the requested features. Independent services such as Chess.com and Lichess are governed by their own terms and policies.",
    ],
  ],
  [
    "5. Acceptable Use",
    [
      "Do not misuse the Services, attempt to bypass authentication or authorization, scrape or overload systems, reverse engineer protected portions, upload malicious content, or use Blundr to violate law or third-party rights.",
    ],
  ],
  [
    "6. Subscriptions and Paid Features",
    [
      "Blundr may offer paid features or subscriptions. Any pricing, checkout, renewal, cancellation, refund, or app-store terms will be presented before purchase and may be handled by the applicable payment provider or app store.",
    ],
  ],
  [
    "7. Changes and Availability",
    [
      "We may update, suspend, or discontinue parts of the Services. We may also update these Terms when the product, law, or business needs change. Material changes may be announced through the product, website, or email.",
    ],
  ],
  [
    "8. Disclaimers and Limits",
    [
      "The Services are provided as available and are not guaranteed to be uninterrupted, error-free, or to produce any specific chess result. To the maximum extent allowed by law, Blundr is not liable for indirect, incidental, special, consequential, or punitive damages.",
    ],
  ],
  [
    "9. Contact",
    [
      "Questions about these Terms may be directed to support@blundr.io.",
    ],
  ],
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-10">
        <header className="border-b border-stone-200 pb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
            Blundr
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm font-semibold text-stone-600">
            Effective date: July 15, 2026
          </p>
          <p className="mt-4 leading-7 text-stone-700">
            These Terms govern your access to and use of Blundr&apos;s website,
            application, chess-training, repertoire, Daily Blundr, review,
            progress, rewards, account, and related services.
          </p>
        </header>
        <div className="divide-y divide-stone-200">
          {sections.map(([title, paragraphs]) => (
            <section
              key={title}
              className="py-6"
              aria-labelledby={title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}
            >
              <h2
                id={title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}
                className="text-xl font-black tracking-tight"
              >
                {title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-stone-700">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
