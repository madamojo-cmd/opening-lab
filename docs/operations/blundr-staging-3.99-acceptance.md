# Blundr staging 3.99 acceptance

This procedure completes release evidence for one immutable Git SHA. It does
not authorize a public production release. Use the isolated `blundr-staging`
project and its isolated database only.

## Candidate prerequisites

1. Push the candidate branch and open a pull request against
   `release/blundr-staging-3.99`.
2. Run the complete release-candidate workflow from a clean checkout.
3. Record the full passing SHA. Do not deploy a dirty checkout or a branch
   name that can move.
4. Review and apply all 37 additive migrations through head
   `20260812192625` to the isolated staging database.
5. Retain the prior accepted full SHA and immutable deployment URL as the
   rollback target.

The two uploaded v1 JSONL files remain immutable source references. Staging
must use `blundr-opening-runtime-3.99.v2` and the checksums returned by
`/api/build-info`; CSV snapshots are not runtime replacements.

## Required staging configuration

Set secret values in the staging project or the protected GitHub environment,
never in source control. The deployment must use the Vercel Production target
inside the isolated staging project so `VERCEL_ENV=production`.

- Release: `BLUNDR_RELEASE_ID=blundr-staging-3.99`,
  `BLUNDR_FEATURE_PROFILE_ID=staging-3.99`,
  `BLUNDR_MIGRATION_HEAD=20260812192625`, and a unique
  `BLUNDR_RELEASE_EVIDENCE_TOKEN`.
- Persistence: staging Supabase URL, anon key, service-role key, and
  `NEXT_PUBLIC_BLUNDR_STORAGE_MODE=authenticated`.
- Onboarding: `NEXT_PUBLIC_BLUNDR_ONBOARDING_V11=true`.
- Maia: `NEXT_PUBLIC_MAIA_API_ENABLED=true`, `MAIA_ENABLED=true`, an HTTPS
  `MAIA_REMOTE_URL`, optional dedicated HTTPS health URL, and remote token.
  Local LC0 paths are not staging evidence.
- Worker: a unique `CRON_SECRET` and every provider/import flag enabled by
  `release/feature-profiles/staging-3.99.json`.
- Telemetry: external `BLUNDR_TELEMETRY_ENDPOINT` and its token when required.
- Capabilities: set every feature variable to the exact boolean value in the
  versioned feature profile; deliberately disabled flags must remain false.

Do not copy secrets, provider responses, raw PGNs, server-owned Daily answers,
or QA passwords into the evidence artifact.

## Deployment identity gate

Deploy the full candidate SHA to an immutable deployment URL. Before any user
journey, request:

- `GET /api/build-info` with header
  `x-blundr-release-evidence-token: <token>`;
- `GET /api/health` without credentials.

Both routes must return `200`. Build info must exactly match the requested
SHA, release ID, feature profile, migration head, runtime package, deployment
ID/URL, and Production target. Health must prove the same build plus database,
remote Maia, worker, and telemetry readiness. A Preview URL, missing build
metadata, or a local Maia process fails closed.

## Golden journeys

After browser/accessibility, telemetry-delivery, and rollback-rehearsal
evidence has stable HTTPS URLs, dispatch the `Blundr release candidate`
workflow with the immutable deployment URL, candidate SHA, rollback SHA, and
those three evidence URLs. The protected `blundr-staging` GitHub environment
must supply the disposable QA credentials, Supabase credentials, provider
usernames, cron secret, and release-evidence token.

The runner creates a unique QA identity and proves these ten journeys against
one deployment:

1. exact build identity;
2. dependency readiness;
3. authenticated QA account creation and sign-in;
4. V11 onboarding plus starter repertoire persistence;
5. Chess.com and Lichess connection persistence;
6. worker processing and normalized imported-game evidence;
7. exact-frame, rating-matched remote Maia response;
8. Trainer learning persistence and idempotent server reward;
9. five completed board-first Daily cards plus the three MVP minigames with
   load, feedback, and retry persistence;
10. durable Progress, telemetry delivery, and rollback evidence linkage.

The workflow uploads a 90-day JSON artifact even when a journey fails. A
partial, failed, mixed-SHA, or fabricated artifact cannot promote the registry.

## Acceptance and registry update

Review the artifact for one deployment ID/URL and one full SHA. Cross-check
the database rows, runtime checksums, worker result, Maia frame, telemetry
link, browser/accessibility link, and rollback link. Then update every
release-required registry entry proven by the artifact to `verified`, set
`lastVerifiedSha` to the same full SHA, and add an `exact_sha_staging` evidence
item whose HTTPS URL identifies the preserved artifact.

Run `npm run verify:registry:release` only after those updates. Move a stable
staging alias only after the strict gate passes. Public Production remains out
of scope until separately authorized.
