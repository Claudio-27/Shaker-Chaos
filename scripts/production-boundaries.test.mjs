import test from 'node:test';
import assert from 'node:assert/strict';
import { assertProductionBoundaries } from './production-boundaries.mjs';
test('production audit rejects either lab code or compatibility-only CSS in emitted output', () => {
  assert.doesNotThrow(() => assertProductionBoundaries([['assets/game.js', 'normal game'], ['assets/game.css', '.game-stage{}']]));
  for (const source of ['Anteprima movimento ridotto', 'Presentation ·', 'PRODUCTION_TUNING_DEV_ONLY', 'Production tuning inspector', 'COMPATIBILITY_LAB_DEV_ONLY', 'Asset Lab · solo sviluppo', '.compat-lab{}']) {
    assert.throws(() => assertProductionBoundaries([['assets/leak.js', source]]), /Development lab leaked/);
  }
});
