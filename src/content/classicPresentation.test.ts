import test from 'node:test';
import assert from 'node:assert/strict';
import { classicReactionPresentation } from './classicPresentation.ts';
import { presentationForMechanicalTier } from './reactionPresentation.ts';
import { publicVisualCatalog } from './publicVisualCatalog.ts';
import { classicInspiredTuning } from './classicInspiredTuning.ts';
test('all nine original mechanical tiers map explicitly across all supplied bartender packs', () => {
  const map = classicReactionPresentation(publicVisualCatalog);
  for (const bartender of Object.keys(publicVisualCatalog.bartenders)) {
    for (const tier of classicInspiredTuning.score.tiers) {
      const expected = tier.minimum < 5500 ? 'lab.rough' : tier.minimum < 9000 ? 'lab.balanced' : 'lab.excellent';
      assert.equal(presentationForMechanicalTier(publicVisualCatalog, bartender, tier.id, map), expected);
    }
    assert.equal(presentationForMechanicalTier(publicVisualCatalog, bartender, 'future-tier', map), 'lab.rough');
    assert.equal(presentationForMechanicalTier(publicVisualCatalog, bartender, 'unrated', map), 'lab.welcome');
  }
});
