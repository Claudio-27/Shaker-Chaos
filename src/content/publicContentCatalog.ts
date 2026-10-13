import type { ContentCatalog, ContentItem, ContentKind } from './contentModel.ts';
import { progressionTuning, starterContentIds } from './progressionTuning.ts';
const item = (id: string, displayName: string, kind: ContentKind): ContentItem =>
  ({ id, displayName, kind, visibility: 'public', visualDefinitionId: id, unlock: starterContentIds.some(starter => starter === id) ? [{ kind: 'default' }] :
    progressionTuning.unlocks.some(rule => rule.contentId === id) ? [{ kind: 'progression', requirementId: progressionTuning.unlocks.find(rule => rule.contentId === id)!.requirementId }] :
    [{ kind: 'development', entitlementId: 'legacy-visual-preview' }] });
/** One canonical item per ID; bundles contain references, never copies or visual configurations. */
export const publicContentCatalog: ContentCatalog = {
  items: [
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
