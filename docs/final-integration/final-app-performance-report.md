# Final App Performance Report

## Evidence

- Baseline workspace disk: 1.7 GB free (95% used).
- Cleanup workspace disk: 3.2 GB free (90% used).
- Build workspace disk: approximately 2.1 GB free while `.next` was generated.
- Reproducible `.next`, `.turbo`, coverage, stale panic logs, stale Blundr logs, and npm download cache were removed before the build.
- Canonical `node_modules` remained the existing shared installation/symlink.
- Production webpack build completed successfully in approximately 4.8 minutes with `BUILD_EXIT=0`.

## Runtime import boundary

The selected minigame practice route uses `minigameContentLoader.ts` dynamic per-game imports, promise caching, failed-load retry, deterministic selection, and a raw-free adapter. The legacy daily deck and packaged registry remain available to existing validation/tooling paths; they are not imported by `MiniGamePracticeRunner`.

## Remaining evidence

Browser route smoke was attempted but the sandbox denied listening on localhost (`EPERM`), so browser-visible performance and mobile layout remain pending manual QA. No claim is made for animation frame rates or visual responsiveness without a browser run.
