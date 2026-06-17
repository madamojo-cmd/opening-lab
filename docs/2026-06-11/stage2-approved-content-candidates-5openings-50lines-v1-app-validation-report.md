# Stage 2 Approved-Content Candidate App Validation Report

## Summary

- Package: `stage2-approved-content-candidates-5openings-50lines-v1`
- Zip: `/workspaces/opening-lab/docs/2026-06-17/stage2-approved-content-candidates-5openings-50lines-v1.zip`
- Openings: 5
- Lines: 100
- Packets: 540
- Approved packets: 540
- Rejected packets: 0
- Runtime data source: `local_crawled_package`
- Live Lichess called: `false`

## Opening Coverage

- `italian-white`: 20 lines, 80 packets, completed
- `london-white`: 20 lines, 120 packets, completed
- `queens-gambit-white`: 20 lines, 100 packets, completed
- `sicilian-black`: 20 lines, 120 packets, completed
- `caro-kann-black`: 20 lines, 120 packets, completed

## Validation Outcome

All candidate packets passed validation gates.

## Notes

- Candidate packets were validated against the local runtime book and the existing TrainerFrameResolution parity layer.
- Plain View exact SAN/UCI leakage checks passed before promotion.
- No runtime move authority or continuation behavior was modified.
