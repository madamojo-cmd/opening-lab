# Blundr connected-game data disclosure

Blundr can read publicly available completed Chess.com and Lichess game
history when a user connects a public username. Blundr never requests or
stores a Chess.com or Lichess password, token, or private-game authorization.

Users can disconnect a provider without deleting already-imported source data,
or choose disconnect and delete. Delete removes the provider account, import
jobs, external games, opening segments, and findings for that provider. Derived
mastery and weakness projections are rebuilt from the remaining source facts.

Stored data includes normalized provider metadata, replayed moves needed for
opening matching, bounded import cursors, findings, and learning projections.
Logs exclude raw PGN, provider usernames, passwords, JWTs, and service keys.
Retention and publication of the public privacy policy require product/legal
approval and are staging/full-market blockers until deployed.
