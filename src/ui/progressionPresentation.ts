import { environmentBackground } from '../content/visualPlan.ts';
import type { PlayerSnapshot } from '../application/playerController.ts';
import type { ContentItem } from '../content/contentModel.ts';
import type { VisualCatalog, AssetId } from '../content/visualModel.ts';
import type { PlayerProfile, ProgressionReward } from '../domain/playerProfile.ts';
import { nextLevelRequirement } from '../domain/playerProfile.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { coinPurchaseMinimumLevel } from '../application/store.ts';
import { canEquip, contentSlot } from '../application/playerContent.ts';
export const collectionGroups = [
  { kind: 'bartender', label: 'Bartender' }, { kind: 'environment', label: 'Ambienti' },
  { kind: 'counter', label: 'Banchi' }, { kind: 'effect', label: 'Effetti' },
] as const;
export function playerHudView(profile: PlayerProfile) {
  const capped = profile.progression.level >= progressionTuning.levels.technicalMaximum;
  const maximum = nextLevelRequirement(profile.progression.level, progressionTuning);
  return { level: 'Livello ' + profile.progression.level, xp: capped ? 'Livello massimo' : profile.progression.currentXp + ' / ' + maximum + ' XP',
    value: capped ? maximum : profile.progression.currentXp, maximum, coins: profile.wallet.coins + ' monete' };
}
export function profileWarning(snapshot: PlayerSnapshot): string {
  if (snapshot.progressionError) return 'Il mix funziona, ma questo aggiornamento dei progressi non è riuscito.';
  if (snapshot.status === 'conflict') return 'I progressi sono cambiati in un’altra scheda. Riprova.';
  if (snapshot.status === 'memory') return 'Progressi solo per questa sessione: il browser non riesce a salvarli. Non chiudere o ricaricare prima di aver riprovato.';
  if (snapshot.status === 'unsupported') return 'Il salvataggio originale è conservato. Questo giro usa progressi temporanei.';
  if(snapshot.status==='recovered'||snapshot.diagnostics.some(d=>d.kind==='corrupt'))return 'Il vecchio salvataggio non era leggibile. Riparti con nuovi progressi; una copia del precedente è conservata.';
  return '';
}
export function collectionCard(profile: PlayerProfile, item: ContentItem) {
  const owned = canEquip(profile, item), slot = contentSlot[item.kind as keyof typeof contentSlot];
  const equipped = owned && profile.equippedLoadout[slot] === item.id;
  const rule = progressionTuning.unlocks.find(rule => rule.contentId === item.id);
  const purchase=item.unlock.some(u=>u.kind==='currency'&&u.currencyId==='coins')&&item.price?.currency==='coins';
  const acquisition=rule ? 'Gratis al livello '+rule.minimumLevel : purchase ?
    (profile.progression.level<coinPurchaseMinimumLevel(item) ? 'Acquistabile dal livello '+coinPurchaseMinimumLevel(item) : 'Acquista nel Negozio')+' · '+item.price!.amount+' monete' : 'Non ancora disponibile';
  return { owned, equipped, action: equipped ? 'Equipaggiato' : owned ? 'Equipaggia ' + item.displayName : acquisition,
    label: item.displayName + ', ' + (owned ? equipped ? 'equipaggiato' : 'posseduto' : 'bloccato') };
}
export function collectionItems() { return publicContentCatalog.items.filter(item => item.visibility === 'public' && item.publication!=='unpublished' && !item.unlock.some(u => u.kind === 'development')); }
export function contentPortrait(item: ContentItem, visuals: VisualCatalog): AssetId | undefined {
  const id = item.visualDefinitionId;
  if (item.kind === 'bartender') return visuals.bartenders[id]?.portrait ?? visuals.bartenders[id]?.idle;
  if (item.kind === 'environment') { const environment = visuals.environments[id]; return environment ? environmentBackground(visuals, environment).preferred : undefined; }
  if (item.kind === 'counter') return visuals.counters[id]?.surface;
  if (item.kind === 'effect') return visuals.effects[id]?.asset;
  if (item.kind === 'ingredient') return visuals.ingredients[item.ingredientId??id]?.bottle;
}
export function rewardView(reward: ProgressionReward) {
  return { xp: '+' + reward.xp + ' XP', coins: '+' + reward.coins + ' monete',
    levelUp: reward.levelsGained ? 'Nuovo livello! ' + reward.levelBefore + ' → ' + reward.levelAfter : null,
    unlocks: reward.unlockedContentIds.map(id => publicContentCatalog.items.find(item => item.id === id)).filter((item): item is ContentItem => !!item) };
}

export function equipmentFeedback(before:PlayerProfile['equippedLoadout'],after:PlayerProfile['equippedLoadout']):string {
  const changed=(Object.keys(after) as (keyof typeof after)[]).filter(key=>before[key]!==after[key]);
  if(!changed.length)return '';
  return changed.map(key=>after[key]?'Equipaggiato: '+(publicContentCatalog.items.find(item=>item.id===after[key])?.displayName??'nuova scelta'):'Effetto disattivato').join(' · ');
}
