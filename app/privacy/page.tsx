import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Blundr",
  description: "How Blundr collects, uses, protects, and deletes information.",
};

const sections = [
  [
    "1. Information We Collect",
    [
      "We may collect account and profile information such as your email address, account identifier, display name, authentication and security information, rating range, repertoire preferences, training settings, entitlement status, account dates, and support communications.",
      "Chess-training information includes positions shown, moves and answers submitted, correct, incorrect, revealed, retried, or skipped results, response time, Daily Blundr sessions, review history, spaced-repetition schedules, mastery, retention, weakness and confidence measurements, activity and content versions, and technical evidence used to validate training.",
      "When you connect a public Chess.com or Lichess username, we may retrieve publicly available completed games, provider identifiers, dates, colors, moves, results, time controls, game IDs, opening segments, and findings derived from those games. We never request or store your Chess.com or Lichess password. Only positions in openings you have unlocked can create visible personalized training or recommendations.",
      "We may also collect device, browser, operating-system, language, approximate-region, usage, session, crash, API, performance, worker, security, authentication, and diagnostic information, together with subscription and support information. Operational telemetry excludes provider passwords, payment-card numbers, authentication tokens, full PGNs, answer solutions, and unnecessary diagnostic data.",
    ],
  ],
  [
    "2. How We Use Information",
    [
      "We use information to create and maintain accounts; provide training and personalized review; determine eligibility; generate Daily Blundr sessions; update mastery, weakness, retention, and progress; import and analyze public games at your request; identify learning opportunities; synchronize devices; preserve first-attempt history; process subscriptions; provide support and notices; prevent fraud and unauthorized access; monitor reliability and performance; diagnose errors; improve the Services; comply with law; and protect Blundr, our users, and the public.",
      "Imported games are evidence for your training and are not displayed as a public game inbox or made visible to other Blundr users.",
    ],
  ],
  [
    "3. Legal Bases for Processing",
    [
      "Where required, we rely on performance of a contract, legitimate interests, consent for optional provider connections or analytics, and legal obligations. You may withdraw consent where applicable; withdrawal does not affect prior processing.",
    ],
  ],
  [
    "4. How We Disclose Information",
    [
      "We use service providers for hosting, databases, authentication, error monitoring and operational telemetry, distribution, subscriptions, email, security, and infrastructure. These may include Vercel, Supabase, Sentry, Apple, and applicable app-store providers, subject to contractual and technical restrictions.",
      "At your direction, Blundr may retrieve public games from Chess.com or Lichess. We do not provide your Blundr password to those providers and do not request provider passwords. We may also disclose information for legal, safety, fraud-prevention, or business-transfer reasons, or in aggregated or deidentified form.",
    ],
  ],
  [
    "5. Sale, Sharing, and Targeted Advertising",
    [
      "Blundr does not sell personal information for money, share personal information for cross-context behavioral advertising, or use it for targeted advertising across unrelated companies' apps or websites.",
    ],
  ],
  [
    "6. Cookies and Similar Technologies",
    [
      "We may use cookies, local storage, session storage, software development kits, and similar technologies to maintain secure sessions, remember preferences, preserve local or offline progress, prevent duplicate actions, measure performance, detect abuse, and understand how the Services function. Necessary technologies may be required for parts of the Services to work.",
    ],
  ],
  [
    "7. Data Retention and Deletion",
    [
      "We retain information only as reasonably necessary for the purposes described here, including service delivery, security, disputes, legal compliance, and backups. Account and training information is generally retained while your account is active unless you request deletion. Connected provider information and imported games are retained until disconnect-and-delete, account deletion, or another retention rule requires removal.",
      "Disconnecting a provider stops future imports but may leave previously imported information. Disconnect-and-delete removes the provider account, import jobs, games, opening segments, and findings derived from that provider. Mastery and weakness insights are deleted or rebuilt without deleted source evidence.",
    ],
  ],
  [
    "8. Your Choices and Rights",
    [
      "Depending on your location, you may have rights to know, access, correct, delete, port, object to, restrict, or withdraw consent for processing, and to opt out of sale or sharing where applicable. Settings may allow you to update account information, change preferences, connect or disconnect providers, delete imported data, manage subscriptions, and request account deletion.",
      "For privacy requests, contact support@blundr.io with the subject Privacy Request. We may verify identity. Appeals may be sent with the subject Privacy Appeal.",
    ],
  ],
  [
    "9. California Privacy Notice",
    [
      "California residents may have rights concerning identifiers, account and subscription records, commercial information, electronic-network activity, approximate location, communications, credentials, and inferences such as chess mastery and recommendations. Blundr does not sell personal information or share it for cross-context behavioral advertising. Requests may be sent to support@blundr.io.",
    ],
  ],
  [
    "10. Other U.S. State Privacy Rights",
    [
      "Residents of states with applicable comprehensive privacy laws may have similar access, correction, deletion, portability, objection, and opt-out rights. Appeals may be sent to support@blundr.io with the subject Privacy Appeal.",
    ],
  ],
  [
    "11. European, United Kingdom, and Swiss Rights",
    [
      "Residents may have rights including access, correction, deletion, restriction, objection, portability, withdrawal of consent, and complaint to a data-protection authority. Contact support@blundr.io first. Where required, international transfers use recognized safeguards.",
    ],
  ],
  [
    "12. Data Security",
    [
      "We use safeguards including encrypted network transmission, authentication and authorization controls, row-level database access, user-data isolation, server-side ownership enforcement, restricted service credentials, answer separation for training solutions, access-controlled background processing, security testing, dependency and secret scanning, operational alerting, deletion controls, insight rebuilds, backups, and recovery practices. No system can be guaranteed completely secure.",
    ],
  ],
  [
    "13. International Data Transfers",
    [
      "Blundr and its service providers may process information in the United States and other countries. Where required, we use recognized safeguards for international transfers.",
    ],
  ],
  [
    "14. Children's Privacy",
    [
      "The Services are not directed to children under 13, who may not create or use a Blundr account. If we learn that we collected information from a child under 13 without appropriate authorization, we will take reasonable steps to delete it.",
    ],
  ],
  [
    "15. Third-Party Services",
    [
      "The Services may link to or interact with Chess.com, Lichess, Apple, and other independent services. Their privacy practices are governed by their own policies, and Blundr is not responsible for independently operated services.",
    ],
  ],
  [
    "16. Changes to This Policy",
    [
      "We may update this Policy for changes to the Services, technology, law, or business practices. Material changes may be announced through an updated date, in-product or website notice, email, or consent request where legally required.",
    ],
  ],
  [
    "17. Contact Us",
    [
      "Questions, privacy requests, and complaints may be directed to Blundr LLC at support@blundr.io. The website is blundr.io. Contact us at that email until any separate representative is identified.",
    ],
  ],
  [
    "18. Notice at Collection",
    [
      "At or before collection, Blundr provides notice that it may collect identifiers, account and subscription information, chess-training information, connected public-game information, device activity, approximate location, communications, diagnostic information, and inferences concerning chess mastery and recommendations. We use this information to provide, personalize, secure, maintain, and improve the Services, process subscriptions, provide support, and comply with law.",
    ],
  ],
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-10">
        <header className="border-b border-stone-200 pb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
            Blundr
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm font-semibold text-stone-600">
            Effective date: July 15, 2026 · Last updated: July 15, 2026
          </p>
          <p className="mt-4 leading-7 text-stone-700">
            Blundr LLC (&ldquo;Blundr,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This
            Policy explains how we collect, use, disclose, retain, and protect
            information when you use the Blundr website, mobile application,
            chess-training, repertoire, Daily Blundr, game-import, account, and
            subscription Services.
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
