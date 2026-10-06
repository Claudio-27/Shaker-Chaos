import type { MechanicalReactionTierId } from '../domain/model.ts';
import type { ReactionId, VisualCatalog } from './visualModel.ts';
export interface MechanicalReactionPresentation {
  readonly byBartender: Readonly<Record<string, Readonly<Record<MechanicalReactionTierId, ReactionId>>>>;
  readonly fallback: ReactionId;
}
/** Explicit presentation policy, never inference from score, tier ordering or filenames. */
export function presentationForMechanicalTier(catalog: VisualCatalog, bartenderId: string,
  tier: MechanicalReactionTierId, mapping: MechanicalReactionPresentation): ReactionId {
  const bartender = Object.hasOwn(catalog.bartenders, bartenderId) ? catalog.bartenders[bartenderId] : undefined;
  if (!bartender) throw new RangeError('Unknown bartender');
  const table = Object.hasOwn(mapping.byBartender, bartenderId) ? mapping.byBartender[bartenderId] : undefined;
  const requested = table && Object.hasOwn(table, tier) ? table[tier] : undefined;
  const usable = (id: ReactionId | undefined) => id && Object.hasOwn(catalog.reactions, id) && Object.hasOwn(bartender.reactions, id);
  if (usable(requested)) return requested!;
  if (usable(mapping.fallback)) return mapping.fallback;
  throw new RangeError('Mechanical tier needs a valid deterministic presentation fallback');
}
