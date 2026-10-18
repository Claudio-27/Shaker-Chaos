import { barIngredients } from './ingredientCatalog.ts';
import type { ContentCatalog, ContentItem, ContentKind } from './contentModel.ts';
import { progressionTuning, starterContentIds } from './progressionTuning.ts';
const coinPurchases: Readonly<Record<string, { readonly amount: number; readonly availableFromLevel: number }>> = {
  'bartender.b02': { amount: 300, availableFromLevel: 3 },
  'effect.ice-blue': { amount: 150, availableFromLevel: 2 },
};
const item = (id: string, displayName: string, kind: ContentKind): ContentItem => {
  const purchase = coinPurchases[id], grant = progressionTuning.unlocks.find(rule => rule.contentId === id);
  const unlock: ContentItem['unlock'] = starterContentIds.some(starter => starter === id) ? [{ kind: 'default' }] : [
    ...(grant ? [{ kind: 'progression' as const, requirementId: grant.requirementId }] : []),
    ...(purchase ? [{ kind: 'currency' as const, currencyId: 'coins', availableFromLevel: purchase.availableFromLevel }] : []),
    ...(!grant && !purchase ? [{ kind: 'development' as const, entitlementId: 'legacy-visual-preview' }] : []),
  ];
  return { id, displayName, kind, visibility: 'public', visualDefinitionId: id, unlock,
    ...(purchase ? { price: { currency: 'coins', amount: purchase.amount } } : {}) };
};
/** One canonical item per ID; bundles contain references, never copies or visual configurations. */
export const publicContentCatalog: ContentCatalog = {
  items: [
    ...barIngredients.map((i):ContentItem=>({id:i.contentId,displayName:i.name,kind:'ingredient',visibility:'public',visualDefinitionId:i.id,ingredientId:i.id,publication:i.published?'published':'unpublished',
      unlock:i.acquisition.kind==='starter'?[{kind:'default'}]:i.acquisition.kind==='coins'?[{kind:'currency',currencyId:'coins',availableFromLevel:i.acquisition.availableFromLevel}]:[{kind:'progression',requirementId:i.acquisition.requirementId}],
      ...(i.acquisition.kind==='coins'?{price:{currency:'coins',amount:i.acquisition.price}}:{})})),
    item('milo', 'Milo · segnaposto', 'bartender'),
    item('bartender.b01', 'Bartender 01', 'bartender'),
    item('bartender.b02', 'Bartender 02', 'bartender'),
    item('studio', 'Studio · segnaposto', 'environment'),
    item('environment.e01', 'Bar tiki al tramonto', 'environment'),
    item('counter.studio', 'Banco · segnaposto', 'counter'),
    item('counter.c01', 'Banco in legno intarsiato', 'counter'),
    item('effect.sparkles', 'Scintille condivise', 'effect'),
    item('effect.ice-blue', 'Scia azzurra', 'effect'),
    item('bottles.placeholder', 'Bottiglie · segnaposto', 'bottle-set'),
    item('bottles.supplied', 'Bottiglie fornite · abbinamento demo', 'bottle-set'),
  ],
  bundles: [
    { id: 'bundle.b02-ice-blue', displayName: 'Un nuovo turno', visibility: 'public', includedContentIds: ['bartender.b02', 'effect.ice-blue'] },
    { id: 'bundle.b01-environment', displayName: 'Esempio: barista e ambiente', visibility: 'public', includedContentIds: ['bartender.b01', 'environment.e01'] },
    { id: 'bundle.b02-counter', displayName: 'Esempio: barista e banco', visibility: 'public', includedContentIds: ['bartender.b02', 'counter.c01'] },
    { id: 'bundle.environment-counter', displayName: 'Esempio: ambiente e banco', visibility: 'public', includedContentIds: ['environment.e01', 'counter.c01'] },
    { id: 'bundle.full-scene', displayName: 'Esempio: composizione completa', visibility: 'public', includedContentIds: ['bartender.b02', 'environment.e01', 'counter.c01', 'effect.sparkles'] },
  ],
};
export function publicContentItem(id: string): ContentItem {
  const value = publicContentCatalog.items.find((entry) => entry.id === id);
  if (!value) throw new RangeError('Unknown public content ID: ' + id);
  return value;
}
