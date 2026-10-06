import test from 'node:test';
import assert from 'node:assert/strict';
import { presentationForMechanicalTier } from './reactionPresentation.ts';
import type { MechanicalReactionPresentation } from './reactionPresentation.ts';
import { publicVisualCatalog } from './publicVisualCatalog.ts';
test('arbitrary mechanical tiers map by bartender and multiple tiers can share one visual', () => {
  const mapping: MechanicalReactionPresentation = { fallback: 'lab.welcome', byBartender: {
    'bartender.b01': { 'tier-17': 'lab.excellent', 'tier-18': 'lab.excellent' },
    'bartender.b02': { 'tier-17': 'lab.balanced' },
  } };
  assert.equal(presentationForMechanicalTier(publicVisualCatalog, 'bartender.b01', 'tier-17', mapping), 'lab.excellent');
  assert.equal(presentationForMechanicalTier(publicVisualCatalog, 'bartender.b01', 'tier-18', mapping), 'lab.excellent');
  assert.equal(presentationForMechanicalTier(publicVisualCatalog, 'bartender.b02', 'tier-17', mapping), 'lab.balanced');
  assert.equal(presentationForMechanicalTier(publicVisualCatalog, 'bartender.b02', 'tier-999', mapping), 'lab.welcome');
});
test('mechanical tier fallback rejects absent/prototype visuals deterministically', () => {
  const mapping: MechanicalReactionPresentation = { fallback: 'lab.welcome', byBartender: { 'bartender.b01': { 'tier-1': 'lab.missing' } } };
  assert.equal(presentationForMechanicalTier(publicVisualCatalog, 'bartender.b01', 'tier-1', mapping), 'lab.welcome');
  assert.throws(() => presentationForMechanicalTier(publicVisualCatalog, 'constructor', 'tier-1', mapping));
  assert.throws(() => presentationForMechanicalTier(publicVisualCatalog, 'bartender.b01', 'tier-1', { ...mapping, fallback: 'lab.missing' }));
});
