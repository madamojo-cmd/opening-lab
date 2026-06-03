# Risk Register — Package 10.5C

## Open Risks

1. Manual browser QA pending
- Runtime sequences (e4/d4/Nf3/bishop/show-more/branch-complete/terminal) not manually replayed in-browser in this environment.

2. Debug timeline parity edge cases
- `app/page.tsx` still has legacy/presentation-based logging paths that can diverge from rendered v2.8 surface card content in rare transitions.

3. Recoverable strong-claim downgrade quality
- Current downgrade is deterministic and safe, but phrasing quality may need future tuning for stronger pedagogy.
