import test from 'node:test';
import assert from 'node:assert/strict';
import { runResearchFixture } from './harness.ts';
import type { ResearchFixture } from './harness.ts';
import { createCompatibilityInput, newSession } from '../domain/session.ts';
import { gameDependencies } from '../application/bootstrap.ts';

const fixture: ResearchFixture = {
  id: 'demo-empty', claim: 'Synthetic empty result is zero', verificationStatus: 'UNVERIFIED',
  evidence: 'Invented fixture; no original-game evidence', procedure: 'Evaluate empty chronological session',
  confidence: 'low', notes: 'Tests software only', input: createCompatibilityInput(newSession(gameDependencies.mixingRules)),
};

test('passing fixtures do not promote research evidence to VERIFIED', () => {
  const result = runResearchFixture({ ...fixture, expectedScore: 0 }, gameDependencies.scoringEngine);
  assert.equal(result.matchesExpectedScore, true);
  assert.equal(result.evidenceStatus, 'UNVERIFIED');
  assert.equal(result.result.verificationStatus, 'UNVERIFIED');
});

test('unmeasured findings remain unmeasured and mismatches remain visible', () => {
  assert.equal(runResearchFixture(fixture, gameDependencies.scoringEngine).matchesExpectedScore, null);
  assert.equal(runResearchFixture({ ...fixture, expectedScore: 999 }, gameDependencies.scoringEngine).matchesExpectedScore, false);
});
