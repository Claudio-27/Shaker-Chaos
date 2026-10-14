import { memo, useEffect, useRef } from 'react';
import type { PlayerProfileV1, ProgressionReward } from '../domain/playerProfile.ts';
import type { PlayerSnapshot } from '../application/playerController.ts';
import type { VisualCatalog } from '../content/visualModel.ts';
import { AssetImage } from './AssetVisual.tsx';
import { collectionCard, collectionGroups, collectionItems, contentPortrait, playerHudView, profileWarning, rewardView } from './progressionPresentation.ts';
export const PlayerHUD = memo(function PlayerHUD({ snapshot }: { readonly snapshot: PlayerSnapshot }) {
  const view = playerHudView(snapshot.profile), warning = profileWarning(snapshot);
  return <section className="player-hud" aria-label="I tuoi progressi">
    <strong>{view.level}</strong><div className="player-xp"><span>{view.xp}</span>
      <div className="xp-track" role="progressbar" aria-label="Esperienza verso il prossimo livello" aria-valuemin={0} aria-valuemax={view.maximum} aria-valuenow={view.value} aria-valuetext={view.xp}>
        <i style={{ width: view.value / view.maximum * 100 + '%' }} />
      </div></div><span className="player-coins">{view.coins}</span>
    {warning && <p className="profile-warning" role="status">{warning}</p>}
  </section>;
});
export const RewardPresentation = memo(function RewardPresentation({ reward, visuals }: { readonly reward: ProgressionReward; readonly visuals: VisualCatalog }) {
  const view = rewardView(reward);
  return <section className={`round-reward ${reward.levelsGained ? 'is-level-up' : ''}`} aria-label="Progressi di questo giro" aria-live="polite">
    <div className="reward-amounts"><strong>{view.xp}</strong><span>{view.coins}</span></div>
    {view.levelUp && <p className="level-up"><span aria-hidden="true">✦ </span>{view.levelUp}</p>}
    {view.unlocks.map(item => {
      const portrait = contentPortrait(item, visuals), category = collectionGroups.find(g => g.kind === item.kind)?.label ?? 'Contenuto';
      return <div className="unlock-card" key={item.id}>{portrait && <AssetImage assetId={portrait} optional />}<div><small>Sbloccato · {category}</small><strong>{item.displayName}</strong></div></div>;
    })}
  </section>;
});
export function Collection({ profile, visuals, onEquip, onClose }: {
  readonly profile: PlayerProfileV1; readonly visuals: VisualCatalog; readonly onEquip: (id: string | null) => void; readonly onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const target = dialog.current, previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    target?.showModal(); heading.current?.focus({ preventScroll: true });
    return () => { target?.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  const items = collectionItems();
  return <dialog ref={dialog} className="collection-dialog" aria-labelledby="collection-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="collection-heading"><div><p className="eyebrow">IL TUO ANGOLO AL BANCO</p><h2 ref={heading} tabIndex={-1} id="collection-title">La tua collezione</h2></div>
      <button type="button" onClick={onClose} aria-label="Chiudi collezione">✕</button></div>
    <p className="collection-intro">Il tuo bartender, il tuo ambiente. Ogni scelta ha il suo posto.</p>
    {collectionGroups.map(group => <section key={group.kind} aria-label={group.label}><h3>{group.label}</h3><div className="collection-grid">
      {items.filter(item => item.kind === group.kind).map(item => {
        const card = collectionCard(profile, item), portrait = card.owned ? contentPortrait(item, visuals) : undefined;
        return <article className={`collection-card ${card.equipped ? 'is-equipped' : ''}`} aria-label={card.label} key={item.id} tabIndex={-1}>
          {portrait ? <AssetImage assetId={portrait} optional /> : <div className="collection-placeholder" aria-hidden="true">{card.owned ? '✦' : '◇'}</div>}
          <h4>{item.displayName}</h4><span className="ownership-label">{card.owned ? card.equipped ? '✓ Equipaggiato' : 'Nella tua collezione' : 'Bloccato'}</span>
          <button type="button" disabled={!card.owned || card.equipped} onClick={event => { onEquip(item.id); event.currentTarget.closest<HTMLElement>('article')?.focus({ preventScroll: true }); }} aria-label={card.action}>{card.action}</button>
        </article>;
      })}
    </div>{group.kind === 'effect' && <button className="no-effect-button" type="button" aria-pressed={profile.equippedLoadout.effectOverride === null} onClick={() => onEquip(null)}>Nessun effetto</button>}</section>)}
  </dialog>;
}

/** Decorative, temporary duplicate of the durable accessible reward details inside the panel. */
export function RoundMilestone({ reward }: { readonly reward: ProgressionReward }) {
  const view = rewardView(reward);
  if (!view.levelUp && !view.unlocks.length) return null;
  return <aside className="round-milestone" aria-hidden="true"><strong>{view.levelUp ?? 'Nuovo contenuto!'}</strong><span>{view.unlocks.map(item => item.displayName).join(' · ')}</span></aside>;
}
