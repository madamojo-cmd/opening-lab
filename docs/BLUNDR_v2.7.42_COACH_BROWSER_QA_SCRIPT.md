# BLUNDR v2.7.42 Coach Browser QA Script

**Port:** 3061 (fresh, safe launch only — no broad pkill)  
**URL:** Forwarded Codespaces port 3061 (or localhost:3061)  
**Mode:** Test **without** `?debug=1` first, then **with** `?debug=1`.

## Prerequisites
- Server running cleanly on 3061 via the exact nohup + PIDFILE procedure in Phase 9.
- Fresh incognito / clean profile recommended.
- Italian Game (or any standard 1.e4 e5 repertoire) selected in Restricted trainer.

---

## Normal Mode Acceptance (no ?debug=1) — 16 points

1. **UI is clean** — No GPT Debug Cell, Visual Debug Panel, Active Board ON, old level grid, Attack/Defense/Plan toggles visible in Settings or anywhere in normal train tab.

2. **Lesson starts** — Selecting a repertoire and entering Train produces a coach instruction on the first user turn.

3. **First coach instruction states exact move** — Text begins with "Play e4." (or the actual first curated SAN) followed by specific explanation. No generic language.

4. **Board accepts the correct first move** — Clicking the instructed piece then the correct destination square is accepted. Feedback indicates correctness.

5. **Opponent reply occurs** — After correct user move, opponent replies from the book (or the line continues).

6. **Next coach instruction appears** — After opponent move, a new instruction for the user's next target appears with matching piece/move.

7. **Coach text matches piece and move** — Every coach message correctly names the piece type and SAN of `CurrentInstructionFrame.target`. No bishop/knight swaps.

8. **Visual target matches coach target** — The highlighted square(s)/arrow(s) on the board correspond exactly to the move described in the coach text.

9. **Plain View does not leak move** — Switch to Plain. Before clicking Show More / Hint, no SAN, UCI, from-square, to-square, or answer arrow/highlight is visible.

10. **Hint does not leak** — Plain Hint text is conceptual only ("Develop toward the center", "Improve king safety"). No exact move information.

11. **Show More text equals Assisted content** — Click Show More. The revealed text is identical to what Assisted View would have shown for the same target.

12. **Show More board highlight equals Assisted board highlight** — After Show More, the board now shows the full Assisted-style visual recipe (arrows, highlights, recipe) for the **exact same** `CurrentInstructionFrame.target`. No stale or alternate visuals.

13. **End-of-Book shows Continue** — When the curated line is complete (Book: complete / Move review N/N), "Opening line complete." + "Continue from here?" appears. No candidate move is shown before clicking.

14. **No candidate before Continue** — Before clicking Continue from here, no continuation candidate, Bd4, a4, or unrelated highlight appears.

15. **Continue click starts same-FEN continuation** — Click Continue. Training mode becomes continuation. Board position does **not** reset. Analysis begins from the exact FEN where the book ended.

16. **Console has no runtime errors** — No Runtime ReferenceError, no "Cannot access before initialization", no hydration crashes, no uncaught exceptions during the full playthrough.

---

## Debug Mode Acceptance (?debug=1) — 9 points

Open the same session with `?debug=1` (or enable via localStorage) and inspect the debug snapshot / critical issues panel:

1. `criticalIssues.length === 0`
2. `targetMismatchCount === 0`
3. `pieceMismatchCount === 0`
4. `plainLeakCount === 0`
5. `legacyBypassCount === 0`
6. `staleFrameCount === 0`
7. `visualMismatchCount === 0`
8. `showMoreMismatchCount === 0`
9. `showMoreVisualMismatchCount === 0`

All golden positions exercised in the browser session must report zero of the above.

---

## Failure Criteria (Any of these = QA failure)

- Coach describes the wrong piece for the highlighted target.
- Plain View reveals SAN / UCI / from-to before Show More.
- Show More text differs from Assisted text for the same target.
- Show More board visual differs from (or does not appear as) the Assisted visual for the same target.
- Hint reveals the answer move.
- Branch transition shows a move coach or move visual.
- Emergency legal fallback is presented as a normal lesson.
- Candidate move appears before "Continue from here" is clicked.
- Any Runtime error appears in console during normal play.
- Any of the 9 debug counters > 0 on a user-turn teaching frame.

---

## Recommended Playthrough Sequence (minimum)

1. Italian Game, start position → Play e4 (verify 3,4,7,8).
2. Continue through Nf3, Bc4, O-O (verify alignment on each).
3. Switch to Plain View mid-lesson → verify no leaks (9,10).
4. Click Show More → verify text + visual match Assisted (11,12).
5. Play to the end of a known line until "Opening line complete" + Continue appears (13,14).
6. Click Continue → verify same-FEN continuation starts (15).
7. Repeat key positions with `?debug=1` and confirm all 9 debug counters are zero.

**QA is only complete when the entire sequence above can be performed cleanly in normal mode and all debug counters remain zero.**

---

**This script is the final gate.** No v2.7.42 coach deployment work may be considered complete until a human has executed this script on port 3061 and confirmed every point.