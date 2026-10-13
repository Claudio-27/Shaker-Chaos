import type { PlayerLoadout, PlayerProfileV1 } from '../domain/playerProfile.ts';
import { immutable, integer } from '../domain/playerProfile.ts';
import { evaluateProgressionUnlocks } from '../domain/progression.ts';
import type { ContentCatalog, ContentItem } from '../content/contentModel.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { progressionTuning, starterContentIds } from '../content/progressionTuning.ts';
import { gamePresentation } from './productionBootstrap.ts';
export const starterLoadout: PlayerLoadout = immutable({ bartenderId: gamePresentation.scene.bartenderId, environmentId: gamePresentation.scene.environmentId,
  counterId: gamePresentation.scene.counterId, bottleSetId: gamePresentation.scene.bottleSetId, effectOverride: gamePresentation.visuals.bartenders[gamePresentation.scene.bartenderId]!.defaultEffectId ?? null });
export const ownershipPolicy = { starterIds: starterContentIds, availablePublicIds: publicContentCatalog.items.filter(i => i.visibility === 'public').map(i => i.id) };
export const contentSlot = { bartender: 'bartenderId', environment: 'environmentId', counter: 'counterId', 'bottle-set': 'bottleSetId', effect: 'effectOverride' } as const;
export function ownsContent(profile: PlayerProfileV1, id: string): boolean { return profile.ownership.some(grant => grant.contentId === id); }
export function canEquip(profile: PlayerProfileV1, item: ContentItem): boolean { return item.visibility === 'public' && Object.hasOwn(contentSlot, item.kind) && ownsContent(profile, item.id); }
export function equipContent(profile: PlayerProfileV1, id: string | null, at: number, catalog: ContentCatalog = publicContentCatalog): PlayerProfileV1 {
  integer(at);
  const item = catalog.items.find(i => i.id === id);
  if (id !== null && (!item || !canEquip(profile, item))) throw new RangeError('Content is not an owned public cosmetic');
  const slot = item ? contentSlot[item.kind as keyof typeof contentSlot] : 'effectOverride';
  return immutable({ ...profile, updatedAt: Math.max(at, profile.updatedAt), equippedLoadout: { ...profile.equippedLoadout, [slot]: item?.id ?? null } });
}
/** Preserve inactive ownership IDs; only reconcile equipment against current definitions/ownership. */
export function reconcilePlayerProfile(profile: PlayerProfileV1, at: number, catalog: ContentCatalog = publicContentCatalog): PlayerProfileV1 {
  const granted = evaluateProgressionUnlocks(profile, progressionTuning, { ...ownershipPolicy, availablePublicIds: catalog.items.filter(i => i.visibility === 'public').map(i => i.id) }, at).profile;
  const loadout = { ...granted.equippedLoadout }; let repaired = false;
  for (const [kind, slot] of Object.entries(contentSlot)) {
    const id = loadout[slot]; if (slot === 'effectOverride' && id === null) continue;
    const item = catalog.items.find(i => i.kind === kind && i.id === id && canEquip(granted, i));
    if (!item) { Object.assign(loadout, { [slot]: starterLoadout[slot] }); repaired = true; }
  }
  return repaired ? immutable({ ...granted, equippedLoadout: loadout, updatedAt: Math.max(at, profile.updatedAt) }) : granted;
}

/** Persist canonical content IDs; resolve visual-definition IDs only for rendering. */
export function resolvePlayerLoadout(profile: PlayerProfileV1, catalog: ContentCatalog = publicContentCatalog): PlayerLoadout {
  const loadout = { ...profile.equippedLoadout };
  for (const [kind, slot] of Object.entries(contentSlot)) {
    const id = loadout[slot]; if (slot === 'effectOverride' && id === null) continue;
    const item = catalog.items.find(i => i.id === id && i.kind === kind && canEquip(profile, i));
    Object.assign(loadout, { [slot]: item?.visualDefinitionId ?? starterLoadout[slot] });
  }
  return loadout;
}
