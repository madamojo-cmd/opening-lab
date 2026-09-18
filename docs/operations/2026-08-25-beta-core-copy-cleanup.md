# Beta Core Copy Cleanup

Scope: wording-only cleanup for user-facing beta-core surfaces after Security, Review Queue, Daily card goal, and Settings/Profile integration.

| Surface | Old text | Replacement | Rationale |
| --- | --- | --- | --- |
| Daily Blundr | Your reserved practice / server-owned / first attempts immutable | Your Daily deck / account saved / first try counts | Removes implementation language while preserving the first-attempt contract. |
| Daily errors | reserved deck / safely save | Daily deck / could not save | Keeps recovery action clear without exposing persistence internals. |
| Review Queue | durable weakness projections | saved misses | Explains the inbox in user terms. |
| Progress | durable storage / durable review attempt | saved progress / review attempt | Removes storage terminology from ordinary UI. |
| Repertoire | durable repertoire state / server authority | saved repertoire | Keeps ownership truthful without implementation jargon. |
| Train selection | opening authority | rating band and training mode | Preserves behavior while avoiding internal authority language. |
| Auth | durable repertoire | saved repertoire | Consistent account-language cleanup. |
| Game data deletion | projections rebuilt | insights rebuilt | Replaces model jargon with user-facing outcome. |
| Mini-games | server-owned state | progress | Keeps copy direct and action-oriented. |
| Onboarding | Daily cards goals | Daily card goals | Aligns with the single Daily card goal product model. |

Compatibility notes:
- No database columns, API error codes, telemetry names, test IDs, datasets, migrations, rewards, Train layout, evaluation lifecycle, or navigation behavior were changed.
- The Daily goal copy remains the corrected single-goal model: Tempo goal, Battery goal, Daily card goal.
