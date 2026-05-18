# v2.7.34 Patch Notes

## Added
- Production-ready deterministic Teaching Cue Compiler.
- Generic chess concept detection across development, center, king safety, tactical, defensive, and endgame ideas.
- Deterministic teaching templates for clean Pattern Cue Card output.
- Before/after move delta analysis for concept selection.

## Changed
- Pattern Cue Card now prefers Teaching Cue Compiler output after Blundr Brain validation.
- Compiler-selected visuals now drive arrows/squares in Assisted View when available.
- Added compiler debug details in Show More.
- Added local learning event `teaching_cue_compiled`.

## Preserved
- Move Quality Gate remains required for restricted teaching cues.
- Existing visual model remains fallback/debug.
- No automatic /api/brain calls in normal training.
- Manual reveal/debug remains available.
- Plain View still hides pre-move hints.

## Not included
- GPT-based auto cue generation.
- Maia integration.
- Bot refactor.
