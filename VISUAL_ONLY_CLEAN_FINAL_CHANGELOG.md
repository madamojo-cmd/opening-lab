# Visual Cleanup Final

This build keeps the v2.7 trainer intact and only refines the board overlay presentation.

## Changes
- Removed the midpoint gate marker so only source and destination circles remain.
- Disabled arrow markers by default to eliminate triangle clutter.
- Reduced glow intensity and made it consistent across move types.
- Simplified square highlighting to subtle rings instead of large radial glows.
- Cleaned the temporal path so it reads as a single intentional guide rail.
- Established a clear color system:
  - Attack = coral / amber
  - Defense = teal / mint
  - Plan = blue
  - Opponent = violet
- Kept motion, labels, gate text, arrows, and motifs as user toggles.

- Fixed opponent knight cues so they render as a single clean path instead of an L-shaped two-segment path.

- Restored true L-shaped rendering for all knight moves, including opponent/transient knight cues.
- Removed the previous over-correction that forced opponent knight moves into a diagonal path.
- Fixed the knight L-shape detection so it no longer depends on labels; any knight-geometry move now renders as an L-shape, including opponent/transient moves.
- Opponent move cue now explicitly sets pathStyle:"knight-l" for knight-geometry moves, so purple horse moves cannot fall back to a straight diagonal.

- Forced all knight-geometry lines, including opponent/transient horse moves, to render as explicit SVG polylines with three L-shape points. This removes any chance of falling back to a diagonal curve.
