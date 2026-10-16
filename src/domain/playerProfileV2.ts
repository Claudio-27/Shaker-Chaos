import { immutable, integer, identifier, validatePlayerProfile } from './playerProfile.ts';
import type { PlayerProfileV1, PlayerProfileV2, ProgressionTuningProfile } from './playerProfile.ts';
export const PURCHASE_LEDGER_LIMIT = 64;
export function purchaseTransactionId(profileId: string, ordinal: number): string { return profileId + ':purchase:' + ordinal; }
export function validPurchaseTransactionId(value:unknown,profileId:string,ordinal:number):value is string {
  const prefix=purchaseTransactionId(profileId,ordinal);
  return typeof value==='string'&&value.length<=400&&(value===prefix||value.startsWith(prefix+':'));
}
/** Adds only versioned metadata; all existing fields and original timestamps are retained. */
export function migrateV1ToV2(profile: PlayerProfileV1, tuning: ProgressionTuningProfile): PlayerProfileV2 {
  validatePlayerProfile(profile, tuning);
  return validatePlayerProfileV2({ ...profile, schemaVersion: 2, revision: 0, nextPurchaseOrdinal: 1, purchaseTransactionLedger: [] }, tuning);
}
export function validatePlayerProfileV2(value: unknown, tuning: ProgressionTuningProfile): PlayerProfileV2 {
  if (typeof value !== 'object' || value === null || !('schemaVersion' in value) || value.schemaVersion !== 2) throw new RangeError('Expected profile schema 2');
  const p = value as PlayerProfileV2;
  validatePlayerProfile({ ...p, schemaVersion: 1 }, tuning);
  integer(p.revision); integer(p.nextPurchaseOrdinal, 1);
  if (!Array.isArray(p.purchaseTransactionLedger) || p.purchaseTransactionLedger.length > PURCHASE_LEDGER_LIMIT) throw new RangeError('Invalid purchase ledger');
  let ordinal = Math.max(1, p.nextPurchaseOrdinal - p.purchaseTransactionLedger.length), spent = 0n;
  const owned = new Set(p.ownership.map(item => item.contentId));
  for (const r of p.purchaseTransactionLedger) {
    if (!r || typeof r !== 'object') throw new RangeError('Invalid purchase receipt');
    integer(r.ordinal, 1);identifier(r.offerId);integer(r.timestamp,p.createdAt);
    integer(r.coinsBefore);integer(r.coinsSpent);integer(r.coinsAfter);
    if (r.profileId !== p.profileId || r.ordinal !== ordinal++ || !validPurchaseTransactionId(r.transactionId,p.profileId,r.ordinal) ||
      r.timestamp > p.updatedAt || BigInt(r.coinsAfter) + BigInt(r.coinsSpent) !== BigInt(r.coinsBefore)) throw new RangeError('Invalid purchase transition');
    if (!Array.isArray(r.newlyGrantedContentIds) || !r.newlyGrantedContentIds.length || !Array.isArray(r.alreadyOwnedIncludedIds)) throw new RangeError('Invalid receipt contents');
    const ids = [...r.newlyGrantedContentIds,...r.alreadyOwnedIncludedIds];ids.forEach(identifier);
    if (new Set(ids).size !== ids.length || ids.some(id=>!owned.has(id))) throw new RangeError('Invalid receipt ownership');
    spent += BigInt(r.coinsSpent);
  }
  if ((p.nextPurchaseOrdinal > 1 && !p.purchaseTransactionLedger.length) || ordinal !== p.nextPurchaseOrdinal || spent > BigInt(p.wallet.lifetimeCoinsSpent)) throw new RangeError('Purchase watermark mismatch');
  return immutable(p);
}
