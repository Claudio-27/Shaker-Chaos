import type { PlayerSnapshot } from '../application/playerController.ts';
import type { ContentItem } from '../content/contentModel.ts';
import type { VisualCatalog, AssetId } from '../content/visualModel.ts';
import type { PlayerProfileV1, ProgressionReward } from '../domain/playerProfile.ts';
import { nextLevelRequirement } from '../domain/playerProfile.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { canEquip, contentSlot } from '../application/playerContent.ts';
export const collectionGroups = [
  { kind: 'bartender', label: 'Bartender' }, { kind: 'environment', label: 'Ambienti' },
  { kind: 'counter', label: 'Banchi' }, { kind: 'effect', label: 'Effetti' },
] as const;
export function playerHudView(profile: PlayerProfileV1) {
  const capped = profile.progression.level >= progressionTuning.levels.technicalMaximum;
  const maximum = nextLevelRequirement(profile.progression.level, progressionTuning);
  return { level: 'Livello ' + profile.progression.level, xp: capped ? 'Livello massimo' : profile.progression.currentXp + ' / ' + maximum + ' XP',
    value: capped ? maximum : profile.progression.currentXp, maximum, coins: profile.wallet.coins + ' monete' };
}
export function profileWarning(snapshot: PlayerSnapshot): string {
  if (snapshot.progressionError) return 'Il mix funziona, ma questo aggiornamento dei progressi non è riuscito.';
  if (snapshot.status === 'memory') return 'Progressi temporanei: questo browser non riesce a salvarli.';
  if (snapshot.status === 'unsupported') return 'Il salvataggio originale è conservato. Questo giro usa progressi temporanei.';
  return '';
}
export function collectionCard(profile: PlayerProfileV1, item: ContentItem) {
  const owned = canEquip(profile, item), slot = contentSlot[item.kind as keyof typeof contentSlot];
  const equipped = owned && profile.equippedLoadout[slot] === item.id;
  const rule = progressionTuning.unlocks.find(rule => rule.contentId === item.id);
  return { owned, equipped, action: equipped ? 'Equipaggiato' : owned ? 'Usa ' + item.displayName : rule ? 'Sblocca al livello ' + rule.minimumLevel : 'Non ancora disponibile',
    label: item.displayName + ', ' + (owned ? equipped ? 'equipaggiato' : 'posseduto' : 'bloccato') };
}
export function collectionItems() { return publicContentCatalog.items.filter(item => item.visibility === 'public' && !item.unlock.some(u => u.kind === 'development')); }
export function contentPortrait(item: ContentItem, visuals: VisualCatalog): AssetId | undefined {
  const id = item.visualDefinitionId;
  if (item.kind === 'bartender') return visuals.bartenders[id]?.portrait ?? visuals.bartenders[id]?.idle;
  if (item.kind === 'environment') return visuals.environments[id]?.background;
  if (item.kind === 'counter') return visuals.counters[id]?.surface;
  if (item.kind === 'effect') return visuals.effects[id]?.asset;
}
export function rewardView(reward: ProgressionReward) {
  return { xp: '+' + reward.xp + ' XP', coins: '+' + reward.coins + ' monete',
    levelUp: reward.levelsGained ? 'Nuovo livello! ' + reward.levelBefore + ' → ' + reward.levelAfter : null,
    unlocks: reward.unlockedContentIds.map(id => publicContentCatalog.items.find(item => item.id === id)).filter((item): item is ContentItem => !!item) };
}
