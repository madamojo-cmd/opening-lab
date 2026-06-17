# Stage 2 Approved-Content Candidate App Validation Report

## Summary

- Packages: 3
- Package IDs: stage2-approved-content-candidates-batch2-5openings-v1, stage2-approved-content-candidates-batch3-5openings-v1, stage2-approved-content-candidates-batch4-6openings-v1-castling-normalized
- Openings: 16
- Lines: 400
- Packets: 1975
- Approved packets: 1975
- Rejected packets: 0
- Runtime data source: `local_crawled_package`
- Live Lichess called: `false`

## Package Coverage

- `stage2-approved-content-candidates-batch2-5openings-v1`: 5 openings, 125 lines, 725 packets
  - Openings: english-white, scandinavian-black, colle-white, slav-black, french-black
  - Approved packets: 725
  - Rejected packets: 0
- `stage2-approved-content-candidates-batch3-5openings-v1`: 5 openings, 125 lines, 625 packets
  - Openings: reti-white, pirc-black, petroff-black, qgd-black, vienna-white
  - Approved packets: 625
  - Rejected packets: 0
- `stage2-approved-content-candidates-batch4-6openings-v1-castling-normalized`: 6 openings, 150 lines, 625 packets
  - Openings: italian-black, ruy-lopez-white, kings-indian-black, nimzo-indian-black, queens-indian-black, scotch-white
  - Approved packets: 625
  - Rejected packets: 0

## Validation Outcome

All candidate packets passed validation gates.

## Notes

- Candidate packets were validated against the local runtime book and the existing TrainerFrameResolution parity layer.
- Batch 4 castling-normalized packets were validated using normalized app-authority UCI/sequence fields while preserving raw runtime trace data.
- Plain View exact SAN/UCI leakage checks passed before promotion.
- No runtime move authority or continuation behavior was modified.
