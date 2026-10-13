import { addInteger, earnCoins, gainXp, identifier, immutable, integer, settlementId, validateProgressionTuning } from './playerProfile.ts';
import type { PlayerProfileV1, ProgressionReward, ProgressionTuningProfile, RoundIdentity } from './playerProfile.ts';
export interface RoundResult { readonly totalScore: number; readonly failed: boolean; readonly mechanicalReactionTierId: string }
export interface OwnershipPolicy { readonly starterIds: readonly string[]; readonly availablePublicIds: readonly string[] }
export function evaluateProgressionUnlocks(profile: PlayerProfileV1, tuning: ProgressionTuningProfile, policy: OwnershipPolicy, at: number) {
  integer(at, profile.createdAt); const owned = new Set(profile.ownership.map(item => item.contentId));
  const additions: PlayerProfileV1['ownership'][number][] = [];
  const grant = (contentId: string, source: 'starter' | 'progression') => {
    if (!owned.has(contentId) && policy.availablePublicIds.includes(contentId)) { owned.add(contentId); additions.push({ contentId, source, grantedAt: at }); }
  };
  policy.starterIds.forEach(id => grant(id, 'starter'));
  tuning.unlocks.filter(rule => profile.progression.level >= rule.minimumLevel).forEach(rule => grant(rule.contentId, 'progression'));
  return { profile: additions.length ? immutable({ ...profile, ownership: [...profile.ownership, ...additions], updatedAt: Math.max(at, profile.updatedAt) }) : profile,
    unlockedContentIds: additions.map(item => item.contentId) };
}
export function rewardAmounts(result: RoundResult, tuning: ProgressionTuningProfile) {
  validateProgressionTuning(tuning); integer(result.totalScore); identifier(result.mechanicalReactionTierId);
  if (typeof result.failed !== 'boolean' || result.totalScore > tuning.scoreMaximum || (result.failed && result.totalScore !== 0)) throw new RangeError('Invalid completed round result');
  return immutable(result.failed ? { xp: tuning.xp.failure, coins: tuning.coins.failure } : {
    xp: addInteger(tuning.xp.base, Math.floor(result.totalScore / tuning.xp.scoreDivisor)),
    coins: addInteger(tuning.coins.base, Math.floor(result.totalScore / tuning.coins.scoreDivisor)),
  });
}
export function issueRoundIdentity(profile: PlayerProfileV1, sessionId: string, attemptStartSequence: number, at: number) {
  identifier(sessionId); integer(at, profile.createdAt); integer(attemptStartSequence);
  return { profile: immutable({ ...profile, nextAttemptOrdinal: addInteger(profile.nextAttemptOrdinal, 1), updatedAt: Math.max(profile.updatedAt, at) }),
    round: immutable({ profileId: profile.profileId, sessionId, attemptStartSequence, ordinal: profile.nextAttemptOrdinal }) };
}
/** Downstream of the frozen cocktail result. No gameplay state, clock, browser or presentation inputs. */
export function settleRoundReward(profile: PlayerProfileV1, result: RoundResult, round: RoundIdentity,
  tuning: ProgressionTuningProfile, policy: OwnershipPolicy, at: number): { readonly profile: PlayerProfileV1; readonly reward: ProgressionReward | null; readonly duplicate: boolean } {
  identifier(round.profileId); identifier(round.sessionId); integer(round.ordinal, 1); integer(round.attemptStartSequence); integer(at, profile.createdAt);
  if (round.profileId !== profile.profileId || round.ordinal >= profile.nextAttemptOrdinal) throw new RangeError('Unissued round identity');
  if (round.ordinal <= profile.lastSettledOrdinal) {
    const previous = profile.rewardSettlementLedger.find(e => e.settlementId === settlementId(round));
    if (previous && (previous.round.sessionId !== round.sessionId || previous.round.attemptStartSequence !== round.attemptStartSequence)) throw new RangeError('Round identity collision');
    return { profile, reward: previous ?? null, duplicate: true };
  }
  const amounts = rewardAmounts(result, tuning), progressed = gainXp(profile, amounts.xp, tuning);
  const granted = evaluateProgressionUnlocks(progressed, tuning, policy, at);
  const reward: ProgressionReward = immutable({ settlementId: settlementId(round), round: { ...round }, settledAt: at, ...amounts,
    levelBefore: profile.progression.level, levelAfter: granted.profile.progression.level, xpBefore: profile.progression.currentXp,
    xpAfter: granted.profile.progression.currentXp, levelsGained: granted.profile.progression.level - profile.progression.level,
    unlockedContentIds: granted.unlockedContentIds });
  const stats = profile.stats;
  const updated = immutable({ ...granted.profile, updatedAt: Math.max(profile.updatedAt, at), wallet: earnCoins(profile.wallet, amounts.coins),
    stats: { roundsPlayed: addInteger(stats.roundsPlayed, 1), successfulDrinks: addInteger(stats.successfulDrinks, result.failed ? 0 : 1),
      failedDrinks: addInteger(stats.failedDrinks, result.failed ? 1 : 0), bestScore: result.failed ? stats.bestScore : Math.max(stats.bestScore, result.totalScore),
      lifetimeScore: addInteger(stats.lifetimeScore, result.failed ? 0 : result.totalScore),
      legendaryCount: addInteger(stats.legendaryCount, !result.failed && result.mechanicalReactionTierId === tuning.legendaryTierId ? 1 : 0) },
    lastSettledOrdinal: round.ordinal, rewardSettlementLedger: [...profile.rewardSettlementLedger, reward].slice(-tuning.ledgerLimit) });
  return { profile: updated, reward, duplicate: false };
}
