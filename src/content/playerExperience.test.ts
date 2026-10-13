import test from 'node:test';
import assert from 'node:assert/strict';
import { gameDependencies, gamePresentation } from '../application/productionBootstrap.ts';
import { classicReactionLines, playerCopy, reactionCopy } from './playerExperience.ts';
import { classicReactionPresentation } from './classicPresentation.ts';
import { presentationForMechanicalTier } from './reactionPresentation.ts';
const profile = gameDependencies.profile;
test('all nine tiers have distinct original dialogue and retain production titles and valid artwork', () => {
  assert.equal(Object.keys(classicReactionLines).length, profile.score.tiers.length);
  const mapping = classicReactionPresentation(gamePresentation.visuals);
  for (const tier of profile.score.tiers) for (const bartender of gamePresentation.catalog.bartenders) {
    const copy = reactionCopy(profile, tier.id, bartender.id); assert.equal(copy.title, tier.title); assert.ok(copy.line.length > 20);
    const id = presentationForMechanicalTier(gamePresentation.visuals, bartender.id, tier.id, mapping);
    assert.ok(gamePresentation.visuals.bartenders[bartender.id]?.reactions[id]);
  }
  assert.equal(new Set(Object.values(classicReactionLines)).size, 9);
});
test('bartender-specific copy can override one field without changing shared data or mapping', () => {
  const original = reactionCopy(profile, 'great', 'bartender.b01');
  const alternate = reactionCopy(profile, 'great', 'bartender.b01', { 'bartender.b01': { great: { line: 'Un brindisi alla prossima idea!' } } });
  assert.equal(alternate.title, original.title); assert.notEqual(alternate.line, original.line);
  assert.deepEqual(reactionCopy(profile, 'great', 'bartender.b01'), original);
  assert.deepEqual(reactionCopy(profile, 'unknown', 'unknown'), playerCopy.ready);
});
test('normal player data uses friendly copy without developer or research terms', () => {
  const text = JSON.stringify({ playerCopy, classicReactionLines, titles: profile.score.tiers.map(t => t.title), ingredients: gamePresentation.catalog.ingredients.map(i => [i.name,i.description]) });
  assert.doesNotMatch(text, /VolumeUnit|canonical|CompatibilityInput|reference observation|demo scorer|mechanicalReactionTierId/i);
});
