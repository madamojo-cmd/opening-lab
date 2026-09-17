# Reconciled asset manifest

| Source | Destination | Actual consumers | Purpose |
| --- | --- | --- | --- |
| shell package `assets/tempo-transparent.png` | `/public/brand/tempo-transparent.png` | Header completion, Hero completion, Momentum corrected, Mastery demo, Footer completion | Brand mark, animated mascot, reward art |
| existing production chess assets | unchanged | `ProductionBoardBridge` via all four adapters | Pieces and board rendering |

No component depends on the prototype URL. Header and Footer now actually render the Tempo asset, matching this manifest.
