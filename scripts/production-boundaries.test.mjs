import test from 'node:test';
import assert from 'node:assert/strict';
import { assertProductionBoundaries } from './production-boundaries.mjs';
test('production audit rejects either lab code or compatibility-only CSS in emitted output', () => {
  assert.doesNotThrow(() => assertProductionBoundaries([['assets/game.js', 'normal game'], ['assets/game.css', '.game-stage{}']]));
  for (const source of ['cleanFailure', '__CLEAN_BACKGROUND_FAILURE_DEV_ONLY', 'CLEAN_ENVIRONMENT_DIAGNOSTIC_DEV_ONLY', '.progression-lab', 'dev-progression-actions', 'PROGRESSION_LAB_DEV_ONLY', 'Progression Lab · solo sviluppo', 'Aggiungi XP di test', 'Azzera il profilo locale', 'Anteprima movimento ridotto', 'Presentation ·', 'PRODUCTION_TUNING_DEV_ONLY', 'Production tuning inspector', 'COMPATIBILITY_LAB_DEV_ONLY', 'Asset Lab · solo sviluppo', '.compat-lab{}']) {
    assert.throws(() => assertProductionBoundaries([['assets/leak.js', source]]), /Development lab leaked/);
  }
});
