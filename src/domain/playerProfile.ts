/** Local game data. None of these types are inputs to cocktail scoring. */
export interface PlayerLoadout {
  readonly bartenderId: string; readonly environmentId: string; readonly counterId: string;
  readonly bottleSetId: string; readonly effectOverride: string | null;
}
export type OwnershipSource = 'starter' | 'progression' | 'currency-purchased' | 'bundle-granted' | 'promotional' | 'private';
export interface ContentOwnership { readonly contentId: string; readonly source: OwnershipSource; readonly grantedAt: number }
export interface PlayerStats {
  readonly roundsPlayed: number; readonly successfulDrinks: number; readonly failedDrinks: number;
  readonly bestScore: number; readonly lifetimeScore: number; readonly legendaryCount: number;
}
export interface RoundIdentity {
  readonly profileId: string; readonly sessionId: string; readonly attemptStartSequence: number; readonly ordinal: number;
}
export interface ProgressionReward {
  readonly settlementId: string; readonly round: RoundIdentity; readonly settledAt: number;
  readonly xp: number; readonly coins: number; readonly levelBefore: number; readonly levelAfter: number;
  readonly xpBefore: number; readonly xpAfter: number; readonly levelsGained: number;
  readonly unlockedContentIds: readonly string[];
}
export interface PlayerProfileV1 {
  readonly schemaVersion: 1; readonly profileId: string; readonly createdAt: number; readonly updatedAt: number;
  readonly progression: { readonly level: number; readonly currentXp: number; readonly lifetimeXp: number };
  readonly wallet: { readonly coins: number; readonly lifetimeCoinsEarned: number; readonly lifetimeCoinsSpent: number };
  readonly ownership: readonly ContentOwnership[]; readonly equippedLoadout: PlayerLoadout; readonly stats: PlayerStats;
  readonly nextAttemptOrdinal: number; readonly lastSettledOrdinal: number;
  readonly rewardSettlementLedger: readonly ProgressionReward[];
}
/** Version 2 adds an explicit economy ledger; V1 remains the historical migration input. */
export interface PurchaseReceipt {
  readonly transactionId: string; readonly ordinal: number; readonly offerId: string; readonly profileId: string;
  readonly coinsBefore: number; readonly coinsSpent: number; readonly coinsAfter: number;
  readonly newlyGrantedContentIds: readonly string[]; readonly alreadyOwnedIncludedIds: readonly string[]; readonly timestamp: number;
}
export interface PlayerProfileV2 extends Omit<PlayerProfileV1, 'schemaVersion'> {
  readonly schemaVersion: 2; readonly revision: number; readonly nextPurchaseOrdinal: number;
  readonly purchaseTransactionLedger: readonly PurchaseReceipt[];
}
export type PlayerProfile = PlayerProfileV1 | PlayerProfileV2;
export interface ProgressionTuningProfile {
  readonly id: string; readonly scoreMaximum: number; readonly legendaryTierId: string;
  readonly xp: { readonly base: number; readonly scoreDivisor: number; readonly failure: number };
  readonly coins: { readonly base: number; readonly scoreDivisor: number; readonly failure: number };
  readonly levels: { readonly firstRequirement: number; readonly increment: number; readonly technicalMaximum: number };
  readonly ledgerLimit: number;
  readonly unlocks: readonly { readonly requirementId: string; readonly contentId: string; readonly minimumLevel: number }[];
}
export function integer(value: unknown, minimum = 0): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) throw new RangeError('Expected a safe integer');
}
export function identifier(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 160) throw new RangeError('Invalid stable identifier');
}
export function addInteger(a: number, b: number): number { integer(a); integer(b); const sum = a + b; integer(sum); return sum; }
export function immutable<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) { Object.values(value).forEach(immutable); Object.freeze(value); }
  return value;
}
export function levelThreshold(level: number, tuning: ProgressionTuningProfile): number {
  integer(level, 1); const n = BigInt(level - 1);
  const total = n * BigInt(tuning.levels.firstRequirement) + n * (n - 1n) / 2n * BigInt(tuning.levels.increment);
  const result = Number(total); integer(result); return result;
}
export function nextLevelRequirement(level: number, tuning: ProgressionTuningProfile): number {
  integer(level, 1); const result = tuning.levels.firstRequirement + (level - 1) * tuning.levels.increment; integer(result, 1); return result;
}
export function progressionFromLifetime(lifetimeXp: number, tuning: ProgressionTuningProfile) {
  integer(lifetimeXp); let low = 1, high = tuning.levels.technicalMaximum;
  while (low < high) { const mid = Math.ceil((low + high) / 2); if (levelThreshold(mid, tuning) <= lifetimeXp) low = mid; else high = mid - 1; }
  return immutable({ level: low, currentXp: lifetimeXp - levelThreshold(low, tuning), lifetimeXp });
}
export function gainXp<P extends PlayerProfile>(profile: P, xp: number, tuning: ProgressionTuningProfile): P {
  return immutable({ ...profile, progression: progressionFromLifetime(addInteger(profile.progression.lifetimeXp, xp), tuning) });
}
export function earnCoins(wallet: PlayerProfileV1['wallet'], coins: number): PlayerProfileV1['wallet'] {
  integer(wallet.coins); integer(wallet.lifetimeCoinsEarned); integer(wallet.lifetimeCoinsSpent);
  return immutable({ ...wallet, coins: addInteger(wallet.coins, coins), lifetimeCoinsEarned: addInteger(wallet.lifetimeCoinsEarned, coins) });
}
export function canAfford(wallet: PlayerProfileV1['wallet'], coins: number): boolean { integer(wallet.coins); integer(coins); return wallet.coins >= coins; }
/** Shared wallet invariant for fictional coins only. */
export function spendCoins(wallet: PlayerProfileV1['wallet'], coins: number): PlayerProfileV1['wallet'] {
  if (!canAfford(wallet, coins)) throw new RangeError('Insufficient fictional coins');
  return immutable({ ...wallet, coins: wallet.coins - coins, lifetimeCoinsSpent: addInteger(wallet.lifetimeCoinsSpent, coins) });
}
export function createPlayerProfile(profileId: string, at: number, loadout: PlayerLoadout, starterIds: readonly string[]): PlayerProfileV1 {
  identifier(profileId); integer(at); starterIds.forEach(identifier);
  return immutable({ schemaVersion: 1, profileId, createdAt: at, updatedAt: at,
    progression: { level: 1, currentXp: 0, lifetimeXp: 0 }, wallet: { coins: 0, lifetimeCoinsEarned: 0, lifetimeCoinsSpent: 0 },
    ownership: [...new Set(starterIds)].map(contentId => ({ contentId, source: 'starter' as const, grantedAt: at })),
    equippedLoadout: { ...loadout }, stats: { roundsPlayed: 0, successfulDrinks: 0, failedDrinks: 0, bestScore: 0, lifetimeScore: 0, legendaryCount: 0 },
    nextAttemptOrdinal: 1, lastSettledOrdinal: 0, rewardSettlementLedger: [],
  });
}
function record(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new RangeError('Invalid profile object');
}
export function validatePlayerProfile(value: unknown, tuning: ProgressionTuningProfile): PlayerProfileV1 {
  validateProgressionTuning(tuning);
  record(value); if (value.schemaVersion !== 1) throw new RangeError('Unsupported profile schema'); identifier(value.profileId);
  integer(value.createdAt); integer(value.updatedAt, value.createdAt); record(value.progression); record(value.wallet); record(value.stats); record(value.equippedLoadout);
  const p = value.progression; integer(p.lifetimeXp); integer(p.level, 1); integer(p.currentXp);
  const derived = progressionFromLifetime(p.lifetimeXp, tuning);
  if (p.level !== derived.level || p.currentXp !== derived.currentXp) throw new RangeError('Inconsistent XP projection');
  const w = value.wallet; integer(w.coins); integer(w.lifetimeCoinsEarned); integer(w.lifetimeCoinsSpent);
  if (BigInt(w.coins) + BigInt(w.lifetimeCoinsSpent) !== BigInt(w.lifetimeCoinsEarned)) throw new RangeError('Inconsistent wallet');
  const s = value.stats; for (const key of ['roundsPlayed','successfulDrinks','failedDrinks','bestScore','lifetimeScore','legendaryCount']) integer(s[key]);
  if (BigInt(s.roundsPlayed as number) !== BigInt(s.successfulDrinks as number) + BigInt(s.failedDrinks as number) ||
      (s.bestScore as number) > tuning.scoreMaximum || (s.bestScore as number) > (s.lifetimeScore as number) ||
      (s.legendaryCount as number) > (s.successfulDrinks as number)) throw new RangeError('Inconsistent stats');
  for (const slot of ['bartenderId','environmentId','counterId','bottleSetId']) identifier(value.equippedLoadout[slot]);
  if (value.equippedLoadout.effectOverride !== null) identifier(value.equippedLoadout.effectOverride);
  if (!Array.isArray(value.ownership) || value.ownership.length > 10000) throw new RangeError('Invalid ownership');
  const owned = new Set<string>();
  for (const grant of value.ownership) { record(grant); identifier(grant.contentId); integer(grant.grantedAt, value.createdAt); if (grant.grantedAt > value.updatedAt) throw new RangeError('Future grant timestamp');
    if (!['starter','progression','currency-purchased','bundle-granted','promotional','private'].includes(String(grant.source)) || owned.has(grant.contentId)) throw new RangeError('Invalid entitlement'); owned.add(grant.contentId); }
  integer(value.nextAttemptOrdinal, 1); integer(value.lastSettledOrdinal);
  if (value.lastSettledOrdinal >= value.nextAttemptOrdinal || !Array.isArray(value.rewardSettlementLedger) || value.rewardSettlementLedger.length > tuning.ledgerLimit) throw new RangeError('Invalid settlement bounds');
  let ordinal = 0; const ids = new Set<string>();
  for (const entry of value.rewardSettlementLedger) {
    record(entry); record(entry.round); identifier(entry.settlementId); identifier(entry.round.profileId); identifier(entry.round.sessionId);
    integer(entry.round.attemptStartSequence); integer(entry.round.ordinal, 1); integer(entry.settledAt, value.createdAt);
    for (const key of ['xp','coins','xpBefore','xpAfter','levelsGained']) integer(entry[key]); integer(entry.levelBefore, 1); integer(entry.levelAfter, 1);
    if (entry.round.profileId !== value.profileId || entry.round.ordinal <= ordinal || entry.round.ordinal > value.lastSettledOrdinal ||
      entry.settlementId !== settlementId(entry.round as unknown as RoundIdentity) || ids.has(entry.settlementId) ||
      entry.levelAfter < entry.levelBefore || entry.levelsGained !== entry.levelAfter - entry.levelBefore || !Array.isArray(entry.unlockedContentIds)) throw new RangeError('Invalid settlement');
    if (entry.settledAt > value.updatedAt || entry.levelAfter > tuning.levels.technicalMaximum ||
      BigInt(entry.xpBefore as number) + BigInt(entry.xp as number) !== BigInt(levelThreshold(entry.levelAfter, tuning) - levelThreshold(entry.levelBefore, tuning)) + BigInt(entry.xpAfter as number)) throw new RangeError('Invalid reward XP transition');
    entry.unlockedContentIds.forEach(identifier); ordinal = entry.round.ordinal; ids.add(entry.settlementId);
  }
  if (value.rewardSettlementLedger.length && ordinal !== value.lastSettledOrdinal) throw new RangeError('Settlement watermark mismatch');
  return immutable(value as unknown as PlayerProfileV1);
}
export function settlementId(round: RoundIdentity): string { return round.profileId + ':' + round.ordinal; }

export function validateProgressionTuning(tuning: ProgressionTuningProfile): void {
  identifier(tuning.id); identifier(tuning.legendaryTierId); integer(tuning.scoreMaximum, 1);
  for (const rewards of [tuning.xp, tuning.coins]) { integer(rewards.base); integer(rewards.failure); integer(rewards.scoreDivisor, 1); }
  integer(tuning.levels.firstRequirement, 1); integer(tuning.levels.increment); integer(tuning.levels.technicalMaximum, 1); integer(tuning.ledgerLimit, 1);
  if (tuning.ledgerLimit > 512) throw new RangeError('Settlement ledger must stay bounded');
  levelThreshold(tuning.levels.technicalMaximum, tuning); nextLevelRequirement(tuning.levels.technicalMaximum, tuning);
  const ids = new Set<string>();
  for (const rule of tuning.unlocks) { identifier(rule.requirementId); identifier(rule.contentId); integer(rule.minimumLevel, 1);
    if (rule.minimumLevel > tuning.levels.technicalMaximum || ids.has(rule.contentId)) throw new RangeError('Invalid unlock rule'); ids.add(rule.contentId); }
}
