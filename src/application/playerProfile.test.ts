import test from 'node:test';
import assert from 'node:assert/strict';
import { addInteger, canAfford, earnCoins, gainXp, levelThreshold, nextLevelRequirement, progressionFromLifetime, spendCoins, validatePlayerProfile, validateProgressionTuning } from '../domain/playerProfile.ts';
import { progressionTuning as tuning } from '../content/progressionTuning.ts';
import { createPlayerProfile } from '../domain/playerProfile.ts';
const empty = () => createPlayerProfile('synthetic', 1000, { bartenderId: 'b', environmentId: 'e', counterId: 'c', bottleSetId: 'bottles', effectOverride: null }, ['b','e','c','bottles']);
test('starter schema begins at level 1 with zero XP/coins and immutable ID entitlements', () => {
  const p = empty(); assert.equal(p.schemaVersion, 1); assert.deepEqual(p.progression, { level: 1, currentXp: 0, lifetimeXp: 0 });
  assert.deepEqual(p.wallet, { coins: 0, lifetimeCoinsEarned: 0, lifetimeCoinsSpent: 0 }); assert.equal(p.ownership.length, 4);
  assert.ok(Object.isFrozen(p)); assert.ok(Object.isFrozen(p.ownership[0])); assert.equal(validatePlayerProfile(p,tuning),p);
});
test('level curve and inclusive boundaries retain exactly all lifetime XP', () => {
  assert.deepEqual([1,2,3,4].map(l => nextLevelRequirement(l,tuning)),[100,150,200,250]);
  assert.deepEqual([1,2,3,4,5].map(l => levelThreshold(l,tuning)),[0,100,250,450,700]);
  for (const lifetimeXp of [0,99,100,249,250,449,450,700,10450]) {
    const p=progressionFromLifetime(lifetimeXp,tuning); assert.equal(levelThreshold(p.level,tuning)+p.currentXp,lifetimeXp);
    assert.ok(p.currentXp<nextLevelRequirement(p.level,tuning));
  }
  assert.equal(progressionFromLifetime(10450,tuning).level,20);
});
test('one large XP grant crosses several levels and preserves leftover XP', () => {
  const near = gainXp(empty(),99,tuning), after=gainXp(near,601,tuning);
  assert.deepEqual(after.progression,{level:5,currentXp:0,lifetimeXp:700});
  assert.deepEqual(gainXp(after,17,tuning).progression,{level:5,currentXp:17,lifetimeXp:717});
  assert.equal(near.progression.currentXp,99);
});
test('technical maximum retains excess lifetime XP safely without a long loop', () => {
  const capped={...tuning,levels:{...tuning.levels,technicalMaximum:3}};
  const p=progressionFromLifetime(10000,capped); assert.deepEqual(p,{level:3,currentXp:9750,lifetimeXp:10000});
});
test('central wallet primitives keep fictional balances nonnegative and integer', () => {
  const start=empty().wallet, earned=earnCoins(start,45); assert.equal(canAfford(earned,45),true);
  assert.deepEqual(spendCoins(earned,10),{coins:35,lifetimeCoinsEarned:45,lifetimeCoinsSpent:10});
  assert.throws(()=>spendCoins(earned,46),RangeError);
  for(const amount of [-1,1.5,NaN,Infinity]) {assert.throws(()=>earnCoins(start,amount),RangeError);assert.throws(()=>spendCoins(earned,amount),RangeError);}
  assert.deepEqual(start,{coins:0,lifetimeCoinsEarned:0,lifetimeCoinsSpent:0});
});
test('XP, wallet and identity counters reject safe-integer overflow', () => {
  assert.throws(()=>addInteger(Number.MAX_SAFE_INTEGER,1),RangeError);
  const max={...empty(),progression:progressionFromLifetime(Number.MAX_SAFE_INTEGER,tuning)};
  assert.throws(()=>gainXp(max,1,tuning),RangeError);
  assert.throws(()=>earnCoins({coins:Number.MAX_SAFE_INTEGER,lifetimeCoinsEarned:Number.MAX_SAFE_INTEGER,lifetimeCoinsSpent:0},1),RangeError);
});
test('schema rejects corrupt projections, fractional values, duplicates and inconsistent wallet/stats', () => {
  const p=empty();
  for(const changed of [{...p,schemaVersion:2},{...p,progression:{...p.progression,currentXp:2}},
    {...p,wallet:{...p.wallet,coins:1}},{...p,stats:{...p.stats,roundsPlayed:1}},
    {...p,ownership:[...p.ownership,p.ownership[0]]},{...p,nextAttemptOrdinal:1.5},{...p,updatedAt:999}]) assert.throws(()=>validatePlayerProfile(changed,tuning),RangeError);
});
test('progression configuration rejects unsafe cadence, levels and duplicate unlock rules', () => {
  assert.doesNotThrow(()=>validateProgressionTuning(tuning));
  for(const changed of [{...tuning,xp:{...tuning.xp,scoreDivisor:0}},{...tuning,ledgerLimit:0},{...tuning,levels:{...tuning.levels,firstRequirement:0}},
    {...tuning,levels:{...tuning.levels,technicalMaximum:Number.MAX_SAFE_INTEGER}},{...tuning,unlocks:[{requirementId:'a',contentId:'test',minimumLevel:2},{requirementId:'b',contentId:'test',minimumLevel:3}]}]) assert.throws(()=>validateProgressionTuning(changed),RangeError);
});
