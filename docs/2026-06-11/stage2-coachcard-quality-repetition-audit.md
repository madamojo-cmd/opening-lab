# Stage 2 CoachCard Quality and Repetition Audit

## Scope

- Scanned all 2,515 approved packets from the accepted Stage 2 bundles.
- Applied a narrow 20-packet copy-only polish patch on top of the accepted bundles.
- No move authority, runtime data, opening coverage, castling metadata, continuation behavior, or Plain View gating was changed.

## Branch And Baseline

- Branch: `work/stage2-approved-content-activation-phase5`
- Starting commit: `089916b` (`Consolidate Stage 2 app page trainer resolution`)

## Packets Scanned

- Total packets scanned: 2515
- Openings scanned: 21
- Packets after patch overlay: 2515
- Changed packets: 20

## Repetition Stats Before

- Unique CoachCard titles: 190
- Unique CoachCard bodies: 388
- Unique assisted bodies: 388
- Unique plain_hint bodies: 190
- Unique plain_show_more bodies: 389

### Most Repeated Titles Before
- 49x Keep the Pirc setup coherent
- 47x Keep Scandinavian development connected to the center
- 46x Keep Petroff play solid
- 42x Keep French counterplay aimed at the center
- 40x Keep Vienna development purposeful
- 39x Keep the English flexibility intact
- 33x Keep the QGD center solid
- 25x Add flank pressure on d5
- 25x Add kingside development to the Vienna center
- 25x Aim the Colle bishop at the kingside

### Most Repeated Bodies Before
- 25x b6 signals the Queen’s Indian plan: the c8 bishop is headed to the long diagonal. Black aims pressure at e4 and the central dark squares.
- 25x Bb4 is the Nimzo-Indian’s defining move: Black pressures the c3 knight that helps White control e4 and d5. This creates structural and central tension without overclaiming tactics.
- 25x Bb5 is the Spanish bishop move: it pressures the knight that helps defend Black’s e5 pawn. The idea is long-term central pressure, not an immediate pawn win.
- 25x Bc5 develops the bishop to an active Italian square, keeping pressure on White’s kingside and clearing Black to castle. It also keeps an eye on the central light squares.
- 25x Bd3 develops the bishop to the classic Colle diagonal toward the kingside. It supports castling and later attacking chances if the center opens.
- 25x Bg7 completes the King’s Indian fianchetto. The bishop now works against White’s central and queenside dark squares from a safe distance.
- 25x c3 completes the d4/e3/c3 Colle structure. White reinforces d4 and prepares to choose the right moment for e4.
- 25x c4 adds the Réti/English-style flank challenge to Black’s d5 square. White still keeps central pawn choices flexible while making Black defend the center.
- 25x c4 is the English Opening’s defining flank claim: White’s c-pawn controls d5 without committing the e-pawn or d-pawn immediately.
- 25x c6 is the Slav’s key support move: Black reinforces d5 with the c-pawn instead of locking in the light-square bishop immediately.

### Most Repeated Plain Hints Before
- 49x Develop behind the compact setup and prepare to challenge White’s center.
- 47x Develop behind the early central challenge and keep pressure on White’s pawns.
- 46x Maintain the e-pawn tension, develop cleanly, and avoid early tactical drift.
- 42x Build the e-pawn and queen-pawn center, then pressure White’s pawn chain.
- 40x Support the center, develop quickly, and avoid premature queen attacks.
- 39x Preserve flank control, central flexibility, and safe development.
- 33x Support the queen-pawn center and develop before resolving the c-pawn tension.
- 25x Answer the kingside knight by attacking White’s central pawn directly.
- 25x Bring the kingside knight into contact with White’s central pawn.
- 25x Bring the kingside knight into the central fight before chasing pawns.
- 25x Bring the kingside knight into the central fight while d5 remains supported.
- 25x Bring the kingside knight out once the Vienna center is supported.
- 25x Bring the queenside knight out to support the king-pawn center and keep kingside choices flexible.
- 25x Build the kingside fianchetto that will pressure the long diagonal.
- 25x Build the queen-pawn base that the compact Colle structure rests on.

### Most Repeated Show More Bodies Before
- 25x The target is b6. ...b6 is the defining queenside fianchetto setup for the Queen’s Indian. Exact move: move the b-pawn to b6 (b6).
- 25x The target is Bb4. The bishop pressure is directly tied to White’s c3 knight and central control. Exact move: move the bishop from f8 to b4 (Bb4).
- 25x The target is Bb5. The Ruy Lopez is defined by bishop pressure on the c6 knight and the e5 structure behind it. Exact move: move the bishop from f1 to b5 (Bb5).
- 25x The target is Bc5. ...Bc5 is the defining active Italian response when Black chooses development over passive defense. Exact move: move the bishop from f8 to c5 (Bc5).
- 25x The target is Bd3. Bd3 is a signature Colle piece placement once e3 has opened the diagonal. Exact move: move the bishop from f1 to d3 (Bd3).
- 25x The target is Bg7. The g7 bishop is one of Black’s main sources of counterplay in the King’s Indian. Exact move: move the bishop from f8 to g7 (Bg7).
- 25x The target is c3. The c3 move is opening-specific because it makes the Colle center sturdy before expansion. Exact move: move the c-pawn to c3 (c3).
- 25x The target is c4. The c-pawn push is relevant when the Réti structure shifts from knight pressure into flank pressure against d5. Exact move: move the c-pawn to c4 (c4).
- 25x The target is c4. The English often begins with side control of d5 and keeps transpositions available without overcommitting the center. Exact move: move the c-pawn to c4 (c4).
- 25x The target is c6. The Slav Defense is defined by ...c6 supporting ...d5 while keeping bishop options healthier than many ...e6 structures. Exact move: move the c-pawn to c6 (c6).

## Banned Phrase Results Before
- This is a good move.: 0
- Continue the position.: 0
- Develop a piece.: 0
- Improve your position.: 0
- This follows opening principles.: 0
- Active Piece Development.: 0
- Avoid Blocking Center Pawn.: 0
- Keep playing normally.: 0
- Make a useful move.: 0
- This is standard.: 0
- This is theory.: 0
- Good developing move.: 0
- Natural move.: 0
- Play the move.: 0

## Quality Issues Found

- Heavy repetition across a small number of opening-specific bodies and plain hints.
- Several CoachCards used generic opening-plan wording that read mechanically.
- The exact banned phrases from the brief were not present, but the copy still had a fallback-like feel in a few repeated families.

## Polish Scope Chosen

- Patched 20 high-priority packets only.
- Focused on repeated early-move cards, generic titles, fallback-like plain hints, and mechanical Show More phrasing.
- Preserved packet IDs and all move / runtime / castling / exact-match fields.

## Packets Changed
- italian-white.line-001.ply-05.f1c4
- london-white.line-001.ply-01.d2d4
- colle-white.line-001.ply-07.f1d3
- english-white.line-001.ply-11.b2c3
- french-black.line-001.ply-04.d7d5
- french-black.line-002.ply-08.f6d7
- scandinavian-black.line-001.ply-02.d7d5
- scandinavian-black.line-002.ply-08.c5d4
- petroff-black.line-001.ply-04.g8f6
- petroff-black.line-001.ply-12.d8d5
- pirc-black.line-001.ply-12.d8d1
- qgd-black.line-002.ply-08.b8c6
- reti-white.line-001.ply-03.c2c4
- vienna-white.line-001.ply-11.h2h3
- kings-indian-black.line-001.ply-08.d7d6
- kings-indian-black.line-001.ply-10.e8g8
- nimzo-indian-black.line-001.ply-06.f8b4
- queens-indian-black.line-001.ply-06.b7b6
- ruy-lopez-white.line-001.ply-05.f1b5
- scotch-white.line-001.ply-05.d2d4

## Fields Changed

- `coachCard.title`
- `coachCard.body`
- `coachCard.why`
- `coachCard.principle`
- `surfaces.assisted.title`
- `surfaces.assisted.body`
- `surfaces.plain_hint.title`
- `surfaces.plain_hint.body`
- `surfaces.plain_show_more.title`
- `surfaces.plain_show_more.body`
- `surfaces.review.title`
- `surfaces.review.body`

## Repetition Stats After

- Unique CoachCard titles: 208
- Unique CoachCard bodies: 404
- Unique assisted bodies: 405
- Unique plain_hint bodies: 207
- Unique plain_show_more bodies: 404

### Most Repeated Titles After
- 48x Keep the Pirc setup coherent
- 46x Keep Scandinavian development connected to the center
- 45x Keep Petroff play solid
- 41x Keep French counterplay aimed at the center
- 39x Keep Vienna development purposeful
- 38x Keep the English flexibility intact
- 32x Keep the QGD center solid
- 25x Add kingside development to the Vienna center
- 25x Complete the Colle d4/e3/c3 shell
- 25x Complete the King’s Indian bishop

### Most Repeated Bodies After
- 25x Bc5 develops the bishop to an active Italian square, keeping pressure on White’s kingside and clearing Black to castle. It also keeps an eye on the central light squares.
- 25x Bg7 completes the King’s Indian fianchetto. The bishop now works against White’s central and queenside dark squares from a safe distance.
- 25x c3 completes the d4/e3/c3 Colle structure. White reinforces d4 and prepares to choose the right moment for e4.
- 25x c4 is the English Opening’s defining flank claim: White’s c-pawn controls d5 without committing the e-pawn or d-pawn immediately.
- 25x c6 is the Slav’s key support move: Black reinforces d5 with the c-pawn instead of locking in the light-square bishop immediately.
- 25x d4 changes the English from pure flank control into direct d-pawn central pressure. White uses the earlier c-pawn setup to contest Black’s center.
- 25x d4 establishes the d-pawn base of the Colle System. White plans a compact Nf3/e3/c3 structure before choosing the central break.
- 25x d4 turns the Réti move order into direct central occupation. White uses earlier knight and c-pawn pressure to support the d-pawn center.
- 25x e3 supports d4 and forms the Colle pawn shell with c3 when available. It also opens the light-square bishop for Bd3.
- 25x e6 is the French Defense foundation: Black prepares ...d5 against White’s e-pawn. The move creates a solid center but can make the light-square bishop harder to activate.

### Most Repeated Plain Hints After
- 48x Develop behind the compact setup and prepare to challenge White’s center.
- 47x Develop behind the early central challenge and keep pressure on White’s pawns.
- 45x Maintain the e-pawn tension, develop cleanly, and avoid early tactical drift.
- 41x Build the e-pawn and queen-pawn center, then pressure White’s pawn chain.
- 39x Support the center, develop quickly, and avoid premature queen attacks.
- 38x Preserve flank control, central flexibility, and safe development.
- 32x Support the queen-pawn center and develop before resolving the c-pawn tension.
- 25x Bring the kingside knight into contact with White’s central pawn.
- 25x Bring the kingside knight into the central fight before chasing pawns.
- 25x Bring the kingside knight into the central fight while d5 remains supported.
- 25x Bring the kingside knight out once the Vienna center is supported.
- 25x Bring the queenside knight out to support the king-pawn center and keep kingside choices flexible.
- 25x Build the kingside fianchetto that will pressure the long diagonal.
- 25x Build the queen-pawn base that the compact Colle structure rests on.
- 25x Commit the queen pawn only after the piece and flank pressure already support the center.

### Most Repeated Show More Bodies After
- 25x The target is Bc5. ...Bc5 is the defining active Italian response when Black chooses development over passive defense. Exact move: move the bishop from f8 to c5 (Bc5).
- 25x The target is Bg7. The g7 bishop is one of Black’s main sources of counterplay in the King’s Indian. Exact move: move the bishop from f8 to g7 (Bg7).
- 25x The target is c3. The c3 move is opening-specific because it makes the Colle center sturdy before expansion. Exact move: move the c-pawn to c3 (c3).
- 25x The target is c4. The English often begins with side control of d5 and keeps transpositions available without overcommitting the center. Exact move: move the c-pawn to c4 (c4).
- 25x The target is c6. The Slav Defense is defined by ...c6 supporting ...d5 while keeping bishop options healthier than many ...e6 structures. Exact move: move the c-pawn to c6 (c6).
- 25x The target is d4. Many English lines transpose into queen-pawn structures when d4 becomes well supported. Exact move: move the d-pawn to d4 (d4).
- 25x The target is d4. The Colle is built around a restrained d-pawn center rather than early side-pawn tension. Exact move: move the d-pawn to d4 (d4).
- 25x The target is d4. The move is the core Scotch idea: central clarity rather than a slow closed setup. Exact move: move the d-pawn to d4 (d4).
- 25x The target is d4. The Réti often transposes into queen-pawn structures when White’s pieces already support the center. Exact move: move the d-pawn to d4 (d4).
- 25x The target is e3. e3 is central to the Colle because it supports d4 and prepares Bd3 plus castling. Exact move: move the e-pawn to e3 (e3).

## Banned Phrase Results After
- This is a good move.: 0
- Continue the position.: 0
- Develop a piece.: 0
- Improve your position.: 0
- This follows opening principles.: 0
- Active Piece Development.: 0
- Avoid Blocking Center Pawn.: 0
- Keep playing normally.: 0
- Make a useful move.: 0
- This is standard.: 0
- This is theory.: 0
- Good developing move.: 0
- Natural move.: 0
- Play the move.: 0

## Plain View No-Leak Result

- No plain_hint SAN/UCI leaks were detected after the polish pass.

## Copy Patch Path

- Patch file: `/workspaces/opening-lab/data/blundr/stage2-approved-content-copy-polish-patch-v1/copy-patch.jsonl`

## Exact-Match / Fallback / Opening Availability / Authority Notes

- The patch is copy-only and keeps packet IDs plus exact-match fields intact.
- Fallback behavior remains available when no exact match exists.
- Opening visibility remains unchanged.
- Move authority remains unchanged.

## Known Limitations

- Repetition is reduced only in the targeted 20-packet polish set; the remaining bundle still contains repeated opening-family language.
- This is a narrow quality pass, not a full copy rewrite.

## Recommended Next Phase

- Expand the copy-polish patch only if future QA identifies another concentrated repetition cluster.

STAGE_2_COACHCARD_QUALITY_REPETITION_AUDIT_STATUS: COMPLETE
