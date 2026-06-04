# BLUNDR v2.8.0 PACKAGE 0 CODEX PROMPT
## Baseline, Branch, and Execution Artifacts Only

You are Agent 0 working on **Blundr v2.8.0 Intelligent Coach**.

This is **Package 0: Baseline, Branch, and Execution Artifacts**.

Canonical roadmap file to read first:
```txt
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
```

If the roadmap file is not already in the repo, place the uploaded roadmap at exactly:
```txt
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_LIVE_VERSION_ROADMAP.md
```

## Objective

Create a clean rollback point, create or switch to the v2.8.0 working branch, record baseline build/test/lint status, and create the execution artifact structure for the supervised v2.8.0 Intelligent Coach implementation.

This package is **protective only**.

## Absolutely forbidden in Package 0

Do **not** implement coach logic.  
Do **not** modify app behavior.  
Do **not** edit `app/page.tsx`.  
Do **not** edit `components/`.  
Do **not** edit `lib/blundr/` product logic.  
Do **not** add tests yet.  
Do **not** add dependencies.  
Do **not** deploy.  
Do **not** tag.  
Do **not** push unless explicitly instructed after this package is reviewed.  
Do **not** delete or overwrite uncommitted work.

Allowed changed paths for this package:
```txt
docs/
.agent_runs/
```

If any product code changes, revert those product-code changes before finishing Package 0 and document the incident.

## Non-negotiables to preserve for later packages

1. `CurrentInstructionFrame.target` is the only visible teaching authority.
2. No UI component may invent coach targets, reveal targets, hint targets, visual targets, or continuation targets.
3. All future visible teaching output must flow through:
   ```txt
   CurrentInstructionFrame
   → EvidenceGraph
   → DynamicConceptActivator
   → BlundrCoachCompiler
   → CoachSafetyGate
   → buildVisibleTeachingSurface
   → UI
   ```
4. Plain View must not leak SAN, UCI, source square, destination square, source/destination highlight, answer arrow, or exact answer before Show More.
5. After Show More, Plain View must reveal the same text and board visual recipe as Assisted View for the same locked target.
6. Stockfish is evidence and claim-strength only. It never owns the instruction target.
7. Maia is continuation context only. It never owns the instruction target.
8. Opening knowledge is contextual evidence only. It never renders directly.
9. Provider failure must not crash the app.
10. No false testing is allowed.
11. Browser QA is required before release.

## Required branch

```txt
v2.8.0-intelligent-coach-live
```

Required naming:
```txt
Release: v2.8.0 Intelligent Coach
Branch: v2.8.0-intelligent-coach-live
Future release candidate tag: v2.8.0-intelligent-coach-rc1
```

Forbidden naming:
```txt
old Foundation/Advanced split release numbers
pre-v2.8.0 deployment labels
old coach-deployment-lock version labels
```

---

# Step A — Inspect current repository state

Run:

```bash
pwd
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -20
cat package.json
```

Record the full command list and relevant outputs in:

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/command_log.md
```

Use a timestamp format safe for paths, for example:

```txt
20260603_HHMMSS
```

---

# Step B — Create or switch to branch

If the branch does not exist locally:

```bash
git checkout -b v2.8.0-intelligent-coach-live
```

If it already exists locally:

```bash
git checkout v2.8.0-intelligent-coach-live
```

If uncommitted changes prevent checkout:
1. Stop.
2. Do not discard changes.
3. Create or update:
   ```txt
   .agent_runs/v2.8.0-intelligent-coach/<timestamp>/risk_register.md
   ```
4. Set `blocked: true` in `state.json` if it exists.
5. Report the issue.

---

# Step C — Create run directory

Create:

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/phase_reports/
```

Create these files:

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/state.json
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/command_log.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/risk_register.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/00_baseline.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/phase_reports/00_baseline.md
```

---

# Step D — Create state.json

Create:

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/state.json
```

Use this shape, filling in real values:

```json
{
  "release": "v2.8.0-intelligent-coach",
  "branch": "v2.8.0-intelligent-coach-live",
  "baseSha": "<sha at start of Package 0>",
  "currentSha": "<current sha after branch checkout>",
  "phase": "00_baseline",
  "gates": {
    "package0_baseline": "in_progress",
    "productCodeChanged": false,
    "buildResult": "unknown",
    "testResult": "unknown",
    "lintResult": "unknown",
    "customTrainerDebugResult": "unknown",
    "customCoachQualityResult": "unknown",
    "customMultiMoveQaResult": "unknown"
  },
  "blocked": false,
  "blockReason": null
}
```

Update this file at the end of Package 0.

---

# Step E — Create required docs

Create:

```txt
docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md
docs/BLUNDR_v2.8.0_INTELLIGENT_COACH_EXECUTION_CONTRACT.md
docs/BLUNDR_v2.8.0_AGENTIC_RUNBOOK.md
docs/BLUNDR_v2.8.0_GROUND_TRUTH_TESTING_MATRIX.md
docs/BLUNDR_v2.8.0_PROVIDER_FAILURE_POLICY.md
```

These docs may be based on the uploaded templates, but they must be adjusted to the actual repo state where applicable.

The baseline freeze report must be generated from real command output, not guessed.

---

# Step F — Run baseline validation

Run:

```bash
npm run build
```

Then inspect package.json and run only commands that exist. If available, run:

```bash
npm test
npm run lint
npm run test:trainer-debug
npm run test:coach-quality
npm run test:multi-move-qa
```

For every command:
- record command,
- exit code,
- relevant output excerpt,
- whether it passed, failed, or did not exist.

Record this in:

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/command_log.md
docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/00_baseline.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/phase_reports/00_baseline.md
```

If tests fail, do not fix them in Package 0 unless the failure is caused by a documentation-only mistake you introduced. Document failures as baseline conditions.

---

# Step G — Required baseline report content

Create or complete:

```txt
docs/BLUNDR_v2.8.0_BASELINE_FREEZE_REPORT.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/00_baseline.md
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/phase_reports/00_baseline.md
```

Each report must include:

```txt
Branch before
Branch after
Base SHA
Current SHA
Working tree status before
Working tree status after
Package scripts discovered
Commands run
Build result
Test result
Lint result
Custom script results
Known failures
Known dirty files
Known untracked files
Whether product code changed
Risk notes
Gate verdict
```

Gate verdict options:
```txt
PASS
PASS_WITH_BASELINE_RISKS
BLOCKED
```

---

# Step H — Risk register

Create or update:

```txt
.agent_runs/v2.8.0-intelligent-coach/<timestamp>/risk_register.md
```

Include any baseline risks, such as:

```txt
dirty working tree
existing build failure
missing test script
missing lint script
package-lock drift
untracked generated files
unknown current browser behavior
Vercel preview unknown
current continuation behavior unknown
current Plain View behavior unknown
current debug counter behavior unknown
```

Do not hide failures. Baseline risks are acceptable if documented.

---

# Step I — Final verification

Run:

```bash
git status --short
git diff --stat
```

Confirm that only these paths changed:

```txt
docs/
.agent_runs/
```

If any product code changed:
1. revert the product-code change,
2. document what happened,
3. re-run `git status --short`.

Do not commit automatically unless explicitly instructed.

---

# Final response format

Respond with:

```md
# Package 0 Complete / Blocked

## Branch
## Base SHA
## Current SHA
## Files Created
## Commands Run
## Results
## Product Code Changed?
## Risks
## Gate Verdict
## Next Recommended Package
```

The next recommended package should be:

```txt
Package 1 — Authority Audit and Legacy Bypass Map
```
