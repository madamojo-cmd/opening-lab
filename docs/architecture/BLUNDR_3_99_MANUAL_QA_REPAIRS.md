# Blundr 3.99 manual-QA repair decisions

This note records the smallest repairs selected after manual staging QA exposed
gaps not caught by the initial 3.99 recovery suite.

## Affected registry promises

- `AUTH-ACCOUNT-001`
- `TRAIN-RUNTIME-001`
- `REPERTOIRE-001`

All three entries remain `partial` until the final exact-SHA staging browser and
database evidence is recorded.

## Decisions

### Selected runtime line completion

The selected runtime sequence is the authoritative boundary for the active
guided line. Once the committed move count reaches that sequence length, the
guided line is complete even if a separate opening-tree lookup returns unknown
or broader child-node metadata. When no selected runtime sequence is present,
the legacy resolver still requires terminal child-node confirmation.

This prevents the trainer from remaining at move 5/5 while retaining the guard
against premature completion on fallback lines.

### Opponent reply provenance and copy

The selected runtime move remains the move authority. Its matching runtime-book
candidate supplies `playPct` for presentation. The user-facing message shows
that percentage to one decimal place and omits internal source/debug text.

Repeat-avoidance copy appears only when the variation policy actually blocked a
third consecutive repeat. Selecting an ordinary runtime reply is not itself a
variation.

### Evaluation display

The advantage bar is derived only from a current-position engine score. With no
verified score, the bar is absent; the UI does not manufacture a 50/50 state or
display an indefinite “Engine pending” label. When present, the bar contains
only the color balance and its evaluation label is rendered separately.

### Profile and username

`/profile` is an authenticated client route backed by the existing
`/api/blundr/profile` GET/PATCH contract and the existing unique profile table.
Client validation mirrors the shared username validator, while the server
remains authoritative for uniqueness. The private account email may be shown to
the signed-in user; the Supabase user UUID is not exposed.

### Numeric presentation

Repertoire point balances and progress percentages retain their precise stored
values. Shared presentation helpers round visible values to at most one decimal
place and clamp visible percentages to 0–100. No reward, unlock, or persistence
calculation is changed.

## Scope and rollback

This repair introduces no migration, environment variable, feature flag, or
runtime-data change. Rollback is an application-code rollback to the preceding
accepted SHA. Daily availability, Mastery Map availability, provider workers,
and Maia service configuration remain explicitly outside this repair and must
be completed in the subsequent staging/configuration pass.

Local production-build verification disables Sentry bundler telemetry while
deployment builds retain it. Runtime telemetry behavior is unchanged.
