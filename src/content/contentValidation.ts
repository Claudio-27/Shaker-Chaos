import type { ContentCatalog } from './contentModel.ts';
import type { VisualCatalog } from './visualModel.ts';
export function validatePublicContent(catalog: ContentCatalog, visuals: VisualCatalog): void {
  const ids = new Set<string>();
  const price = (value: { readonly currency: string; readonly amount: number } | undefined) => {
    if (value && (!value.currency || !Number.isSafeInteger(value.amount) || value.amount < 0)) throw new RangeError('Invalid price metadata');
  };
  const tables = { bartender: visuals.bartenders, environment: visuals.environments, counter: visuals.counters, effect: visuals.effects, 'bottle-set': visuals.bottleSets };
  for (const item of catalog.items) {
    if (!item.id || ids.has(item.id) || item.visibility !== 'public') throw new RangeError('Duplicate or non-public item');
    ids.add(item.id); price(item.price);
    if (!(item.kind in tables) || !Object.hasOwn(tables[item.kind as keyof typeof tables], item.visualDefinitionId)) throw new RangeError('Unresolved public visual definition');
  }
  const bundles = new Set<string>();
  for (const bundle of catalog.bundles) {
    if (!bundle.id || bundles.has(bundle.id) || bundle.visibility !== 'public') throw new RangeError('Duplicate or non-public bundle');
    bundles.add(bundle.id); price(bundle.price);
    if (!bundle.includedContentIds.length || new Set(bundle.includedContentIds).size !== bundle.includedContentIds.length ||
      bundle.includedContentIds.some((id) => !ids.has(id))) throw new RangeError('Unresolved or duplicate bundle item');
  }
}
