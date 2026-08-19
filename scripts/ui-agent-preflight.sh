#!/usr/bin/env bash
set -euo pipefail

EXPECTED_BRANCH="feat/apple-sleek-ui-20260819"
BASE_SHA="cf8bafd0be884c51a880504d4b82818c446a2fe6"

BRANCH="$(git branch --show-current)"
HEAD_SHA="$(git rev-parse HEAD)"
MERGE_BASE="$(git merge-base HEAD "$BASE_SHA")"

test "$BRANCH" = "$EXPECTED_BRANCH" || {
  echo "ERROR: expected branch $EXPECTED_BRANCH; found $BRANCH" >&2
  exit 1
}

test "$MERGE_BASE" = "$BASE_SHA" || {
  echo "ERROR: UI branch is not based on the frozen baseline." >&2
  exit 1
}

echo "UI_AGENT_PREFLIGHT=pass"
echo "BRANCH=$BRANCH"
echo "HEAD_SHA=$HEAD_SHA"
echo "BASE_SHA=$BASE_SHA"
echo "WORKTREE=$(pwd)"
echo
bash scripts/verify-ui-only-diff.sh
