import assert from 'node:assert/strict';
import test from 'node:test';
import { Chess } from 'chess.js';
import { MINIGAME_CONTENT_COUNTS, getProductionScenarios, selectProductionScenario, type ProductionMiniGameId } from '../minigameContentRegistry';

const ids = Object.keys(MINIGAME_CONTENT_COUNTS) as ProductionMiniGameId[];

test('all eight minigames expose legal runtime-ready base content', () => {
  assert.deepEqual(MINIGAME_CONTENT_COUNTS, { tactic_shots: 432, knight_gymnasium: 471, key_square_conquest: 30, structure_builder: 30, imbalance_arena: 30, technique_lab: 30, king_race: 30, pawn_wars: 30 });
  for (const id of ids) {
    const scenarios = getProductionScenarios(id);
    assert.equal(scenarios.length, MINIGAME_CONTENT_COUNTS[id]);
    assert.equal(new Set(scenarios.map((row) => row.id)).size, scenarios.length);
    for (const row of scenarios) {
      const chess = new Chess(row.fen);
      assert.ok(chess.moves({ verbose: true }).some((move) => `${move.from}${move.to}${move.promotion ?? ''}` === row.solution.primaryMoveUci), `${row.id} has an illegal solution`);
      assert.equal(row.lockedOrientation, true);
      assert.equal(row.quality.runtimeReady, true);
    }
  }
});

test('selection is deterministic and avoids recent scenarios', () => {
  const first = selectProductionScenario({ miniGameId: 'tactic_shots', selectionKey: 'user:day:1' });
  const again = selectProductionScenario({ miniGameId: 'tactic_shots', selectionKey: 'user:day:1' });
  assert.equal(first.id, again.id);
  const next = selectProductionScenario({ miniGameId: 'tactic_shots', selectionKey: 'user:day:1', recentlyPlayedIds: [first.id] });
  assert.notEqual(next.id, first.id);
});
