#!/usr/bin/env bash
set -euo pipefail

BASE_SHA="${BLUNDR_UI_BASE_SHA:-cf8bafd0be884c51a880504d4b82818c446a2fe6}"

git cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null || {
  echo "ERROR: UI baseline commit is unavailable locally: $BASE_SHA" >&2
  exit 1
}

MERGE_BASE="$(git merge-base HEAD "$BASE_SHA")"
test "$MERGE_BASE" = "$BASE_SHA" || {
  echo "ERROR: current branch is not descended from the frozen UI baseline." >&2
  echo "BASE_SHA=$BASE_SHA" >&2
  echo "MERGE_BASE=$MERGE_BASE" >&2
  exit 1
}

mapfile -t CHANGED < <(git diff --name-only "$BASE_SHA"...HEAD; git diff --name-only; git diff --cached --name-only)
if [ "${#CHANGED[@]}" -eq 0 ]; then
  echo "UI_ONLY_DIFF_GUARD=pass"
  echo "CHANGED_FILES=0"
  exit 0
fi

# Unique/sorted path set.
mapfile -t UNIQUE < <(printf '%s\n' "${CHANGED[@]}" | sed '/^$/d' | sort -u)

DENIED_PREFIXES=(
  ".github/workflows/"
  "app/api/"
  "supabase/"
  "release/"
  "services/maia/"
  "lib/blundr/accounts/"
  "lib/blundr/continuation/"
  "lib/blundr/daily/"
  "lib/blundr/daily-rings/"
  "lib/blundr/gameData/"
  "lib/blundr/maia/"
  "lib/blundr/onboarding/"
  "lib/blundr/openingAccess/"
  "lib/blundr/repertoire/"
  "lib/blundr/rewards/"
  "lib/blundr/runtime/"
  "lib/blundr/trainerCompletion/"
  "lib/blundr/trainingRuntime/"
)

DENIED_EXACT=(
  "release/blundr-mvp-release-manifest.json"
)

FAILED=0

for path in "${UNIQUE[@]}"; do
  for prefix in "${DENIED_PREFIXES[@]}"; do
    if [[ "$path" == "$prefix"* ]]; then
      echo "DENIED_CHANGE=$path"
      FAILED=1
    fi
  done
  for exact in "${DENIED_EXACT[@]}"; do
    if [ "$path" = "$exact" ]; then
      echo "DENIED_CHANGE=$path"
      FAILED=1
    fi
  done
done

# The canonical ring rendering component is frozen for the UI migration.
if ! git diff --quiet "$BASE_SHA" -- components/daily-rings/NestedDailyRings.tsx; then
  echo "DENIED_CHANGE=components/daily-rings/NestedDailyRings.tsx"
  echo "REASON=canonical Daily ring component is frozen"
  FAILED=1
fi

if [ "$FAILED" -ne 0 ]; then
  echo "UI_ONLY_DIFF_GUARD=fail"
  exit 1
fi

echo "UI_ONLY_DIFF_GUARD=pass"
echo "CHANGED_FILES=${#UNIQUE[@]}"
printf 'UI_CHANGED=%s\n' "${UNIQUE[@]}"
