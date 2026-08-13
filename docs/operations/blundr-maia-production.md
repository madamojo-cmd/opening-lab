# Blundr Maia production deployment

This runbook deploys the `TRAIN-MAIA-001` authority to an isolated Cloud Run
service, connects the isolated `blundr-staging` Vercel project, proves one exact
application SHA, and preserves a fail-closed rollback. It does not authorize
the public Blundr Production project; promote only after staging acceptance.

## Change impact

- Feature IDs: `TRAIN-MAIA-001`, `OBSERVABILITY-001`, and `RELEASE-001`.
- Path: continuation UI -> `/api/maia/opponent-reply` ->
  `MaiaRemoteRuntimeAdapter` -> authenticated Cloud Run `/move` -> pinned Maia
  model and LCZero single-node worker -> exact-frame/legal/provenance guards.
- State: no new database writer or migration. Existing operational telemetry
  records sanitized status, duration, skill, and legality only.
- Flags: `NEXT_PUBLIC_MAIA_API_ENABLED` and `MAIA_ENABLED` remain the two-step
  release gate.
- Rollback: disable both flags and redeploy the last accepted immutable Vercel
  deployment. Do not substitute Stockfish, opening runtime, random, fixture, or
  cached generic moves.

## 1. Record the third-party model decision

The official Maia repository labels its software GPL and distributes the nine
v1 networks from the same repository, but the weight files do not include a
separate explicit license notice. Before public commercial release, record one
of the following in the release ticket:

1. written maintainer confirmation that the published GPL license covers the
   v1 weight assets for the intended hosted use; or
2. counsel approval for the intended deployment and distribution model.

Internal isolated-staging validation may proceed while this release blocker is
open. The container retains both upstream license texts and the manifest keeps
`redistributionReviewRequired: true`.

## 2. Create the Cloud Run authority

Install the current Google Cloud CLI, choose a billable project, and authenticate.
Use `us-east4` when the app runs in Vercel `iad1`; otherwise choose the closest
Cloud Run region and keep it fixed for the release.

```bash
export BLUNDR_GCP_PROJECT="replace-with-your-gcp-project-id"
export BLUNDR_GCP_REGION="us-east4"
export BLUNDR_MAIA_SERVICE="blundr-maia"
export BLUNDR_MAIA_SECRET="blundr-maia-service-token"
export BLUNDR_MAIA_SERVICE_ACCOUNT="blundr-maia-runtime"

gcloud auth login
gcloud config set project "$BLUNDR_GCP_PROJECT"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com

BLUNDR_MAIA_TOKEN="$(openssl rand -hex 32)"
test "${#BLUNDR_MAIA_TOKEN}" -ge 64

if gcloud secrets describe "$BLUNDR_MAIA_SECRET" >/dev/null 2>&1; then
  printf '%s' "$BLUNDR_MAIA_TOKEN" |
    gcloud secrets versions add "$BLUNDR_MAIA_SECRET" --data-file=-
else
  printf '%s' "$BLUNDR_MAIA_TOKEN" |
    gcloud secrets create "$BLUNDR_MAIA_SECRET" \
      --replication-policy=automatic \
      --data-file=-
fi

gcloud iam service-accounts describe \
  "$BLUNDR_MAIA_SERVICE_ACCOUNT@$BLUNDR_GCP_PROJECT.iam.gserviceaccount.com" \
  >/dev/null 2>&1 ||
  gcloud iam service-accounts create "$BLUNDR_MAIA_SERVICE_ACCOUNT" \
    --display-name="Blundr Maia runtime"

gcloud secrets add-iam-policy-binding "$BLUNDR_MAIA_SECRET" \
  --member="serviceAccount:$BLUNDR_MAIA_SERVICE_ACCOUNT@$BLUNDR_GCP_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

From the exact candidate checkout, deploy only the standalone service directory:

```bash
cd services/maia
npm ci
npm run verify

gcloud run deploy "$BLUNDR_MAIA_SERVICE" \
  --source=. \
  --region="$BLUNDR_GCP_REGION" \
  --execution-environment=gen2 \
  --service-account="$BLUNDR_MAIA_SERVICE_ACCOUNT@$BLUNDR_GCP_PROJECT.iam.gserviceaccount.com" \
  --allow-unauthenticated \
  --cpu=1 \
  --memory=1Gi \
  --concurrency=1 \
  --min=1 \
  --max=20 \
  --timeout=10s \
  --cpu-boost \
  --startup-probe="httpGet.path=/ready,httpGet.port=8080,periodSeconds=5,failureThreshold=48,timeoutSeconds=2" \
  --liveness-probe="httpGet.path=/ready,httpGet.port=8080,periodSeconds=30,failureThreshold=3,timeoutSeconds=2" \
  --set-secrets="MAIA_SERVICE_TOKEN=$BLUNDR_MAIA_SECRET:latest" \
  --set-env-vars="MAIA_BACKEND=blas,MAIA_REQUEST_TIMEOUT_MS=2500,MAIA_QUEUE_LIMIT=32,MAIA_MAX_WARM_WORKERS=3"

BLUNDR_MAIA_URL="$(
  gcloud run services describe "$BLUNDR_MAIA_SERVICE" \
    --region="$BLUNDR_GCP_REGION" \
    --format='value(status.url)'
)"
test -n "$BLUNDR_MAIA_URL"
```

`--allow-unauthenticated` permits Vercel to reach the service; it does not make
inference unauthenticated. `/move`, `/health`, and `/metrics` still require the
32-byte bearer token and a pinned contract-version header. `/live` discloses
only service name/version; `/ready` discloses only a boolean and is used by the
platform probes.

## 3. Prove the service before connecting the app

```bash
curl -fsS "$BLUNDR_MAIA_URL/live"

curl -fsS "$BLUNDR_MAIA_URL/health" \
  -H "authorization: Bearer $BLUNDR_MAIA_TOKEN" \
  -H "x-blundr-maia-contract: blundr-maia-health.v1"

MAIA_SMOKE_URL="$BLUNDR_MAIA_URL" \
MAIA_SERVICE_TOKEN="$BLUNDR_MAIA_TOKEN" \
  npm run smoke
```

The health response must report `ready: true`, nine verified models, provider
commit `749204cf5979ce7f8b0412e804a4ee7c83c49ff8`, LCZero `0.32.1` commit
`fd71a2d921b689c5f479d3227c3806c8e272d9c5`, `classic`, and `nodes: 1`.

## 4. Connect isolated Vercel staging

Run this only from a checkout linked to `adamconnor00-gmailcoms-projects/blundr-staging`.
Replace the candidate SHA after the GitHub change is merged. The helper removes
and recreates only the named isolated-staging Production variable.

```bash
export BLUNDR_VERCEL_SCOPE="adamconnor00-gmailcoms-projects"
export BLUNDR_CANDIDATE_SHA="replace-with-the-full-merged-sha"
test "${#BLUNDR_CANDIDATE_SHA}" -eq 40

blundr_vercel_set() {
  local key="$1"
  local value="$2"
  npx --yes vercel@58.11.0 env rm "$key" production \
    --yes --scope "$BLUNDR_VERCEL_SCOPE" >/dev/null 2>&1 || true
  printf '%s' "$value" |
    npx --yes vercel@58.11.0 env add "$key" production \
      --scope "$BLUNDR_VERCEL_SCOPE"
}

blundr_vercel_set NEXT_PUBLIC_MAIA_API_ENABLED true
blundr_vercel_set MAIA_ENABLED true
blundr_vercel_set MAIA_REMOTE_URL "$BLUNDR_MAIA_URL/move"
blundr_vercel_set MAIA_REMOTE_HEALTH_URL "$BLUNDR_MAIA_URL/health"
blundr_vercel_set MAIA_REMOTE_TOKEN "$BLUNDR_MAIA_TOKEN"
blundr_vercel_set MAIA_SKILL_LEVEL maia-1500
blundr_vercel_set MAIA_TIMEOUT_MS 3000
blundr_vercel_set MAIA_NODES 1
blundr_vercel_set MAIA_MAX_CONCURRENT_REQUESTS 2
blundr_vercel_set MAIA_CACHE_ENABLED true

# The isolated CLI deployment needs explicit source identity. Never leave this
# variable pointing at the former rollback SHA.
blundr_vercel_set VERCEL_GIT_COMMIT_SHA "$BLUNDR_CANDIDATE_SHA"
blundr_vercel_set BLUNDR_BUILD_GIT_SHA "$BLUNDR_CANDIDATE_SHA"
blundr_vercel_set BLUNDR_MIGRATION_HEAD 20260812192625
```

Rotate the staging release-evidence token because a Sensitive Vercel value
cannot be recovered by `vercel pull`, then write the same new value to the
protected GitHub `blundr-staging` environment:

```bash
BLUNDR_RELEASE_EVIDENCE_TOKEN="$(openssl rand -hex 32)"
blundr_vercel_set \
  BLUNDR_RELEASE_EVIDENCE_TOKEN \
  "$BLUNDR_RELEASE_EVIDENCE_TOKEN"

printf '%s' "$BLUNDR_RELEASE_EVIDENCE_TOKEN" |
  gh secret set BLUNDR_RELEASE_EVIDENCE_TOKEN \
    --repo madamojo-cmd/opening-lab \
    --env blundr-staging \
    --body -
```

Do not print either token or commit `.vercel/.env.production.local`.

## 5. Deploy and perform manual acceptance

Create a clean detached worktree at the merged SHA and deploy that source. Do
not use `--skip-domain`; retain the immutable deployment URL and move a stable
alias only after every gate passes.

```bash
export TMPDIR=/tmp
export npm_config_cache=/tmp/blundr-npm-cache
export BLUNDR_CANDIDATE_WORKTREE="/tmp/opening-lab-maia-$BLUNDR_CANDIDATE_SHA"

git worktree add --detach \
  "$BLUNDR_CANDIDATE_WORKTREE" \
  "$BLUNDR_CANDIDATE_SHA"
cd "$BLUNDR_CANDIDATE_WORKTREE"
test -z "$(git status --porcelain)"

BLUNDR_DEPLOY_URL="$(
  npx --yes vercel@58.11.0 deploy \
    --prod --yes --scope "$BLUNDR_VERCEL_SCOPE"
)"
printf 'BLUNDR_DEPLOY_URL=%s\n' "$BLUNDR_DEPLOY_URL"
```

Verify:

1. `GET /api/health` returns `200`; `build.gitSha` equals the candidate,
   `migrationHead` is `20260812192625`, and `dependencies.maia.remoteEvidence`
   contains the pinned provider/model/engine evidence.
2. `GET /api/build-info` with the release-evidence header reports the same SHA.
3. `GET /api/maia/health` reports remote, ready, nine verified models, and no
   local LCZero/weights paths.
4. Sign in to the staging UI, finish a guided line, explicitly choose
   continuation, and make a legal user move. Maia must make one legal opponent
   move at the selected skill. Repeat at 1100, 1500, and 1900.
5. Stop or deny the Cloud Run service temporarily. The UI must say Maia is
   unavailable and play no opponent move. Re-enable the service and confirm a
   new request recovers without reloading stale state.
6. Run the exact-SHA golden journey workflow and retain its artifact before
   changing any stable alias.

## 6. Production controls and rollback

Create Cloud Monitoring alerts for Cloud Run 5xx responses, p95 latency over
three seconds, instance count at the configured maximum, and log events
`maia_startup_failed`, `maia_engine_exit`, or `maia_request_failed`. Route the
alerts to an owned on-call channel. Keep minimum instances at one for interactive
latency; this incurs idle-instance cost.

Emergency app rollback:

1. set `NEXT_PUBLIC_MAIA_API_ENABLED=false` and `MAIA_ENABLED=false`;
2. redeploy the last accepted immutable Vercel deployment;
3. confirm continuation visibly fails closed;
4. if credentials may be exposed, add a new Secret Manager version, update
   `MAIA_REMOTE_TOKEN` in Vercel, and deploy both services before revoking the
   old version.

Cloud Run revision rollback uses explicit traffic migration to the recorded
prior revision. Never roll back the database for this change; it adds no schema.
