import type { VisualCatalog, VisualLoadout } from './visualModel.ts';
export function replaceVisualSlot<K extends keyof VisualLoadout>(loadout: VisualLoadout, slot: K, value: VisualLoadout[K]): VisualLoadout {
  return { ...loadout, [slot]: value };
}
export function validateLoadout(catalog: VisualCatalog, loadout: VisualLoadout): void {
  if (!Object.hasOwn(catalog.bartenders, loadout.bartenderId) || !Object.hasOwn(catalog.environments, loadout.environmentId) || !Object.hasOwn(catalog.counters, loadout.counterId))
    throw new RangeError('Unknown visual loadout slot');
  if (loadout.effectOverride && !Object.hasOwn(catalog.effects, loadout.effectOverride)) throw new RangeError('Unknown effect slot');
  if (loadout.bottleSetId && !Object.hasOwn(catalog.bottleSets, loadout.bottleSetId)) throw new RangeError('Unknown bottle set slot');
}
