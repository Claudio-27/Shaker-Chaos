import './ProgressionLab.css';
import { useState } from 'react';
import type { PlayerController, PlayerSnapshot } from '../application/playerController.ts';
import { earnCoins, gainXp, immutable, nextLevelRequirement } from '../domain/playerProfile.ts';
import { progressionTuning } from '../content/progressionTuning.ts';
import { newBrowserProfile } from '../platform/playerBootstrap.ts';
import { resetDevelopmentProfile } from '../platform/developmentProfileReset.ts';
export default function ProgressionLab({ controller, snapshot, onReset }: {
  readonly controller: PlayerController; readonly snapshot: PlayerSnapshot; readonly onReset: () => void;
}) {
  const [xp, setXp] = useState('100'), [coins, setCoins] = useState('25'), [confirmed, setConfirmed] = useState(false), [message, setMessage] = useState('');
  const p = snapshot.profile;
  const amount = (text: string) => /^\d+$/.test(text) ? Number(text) : NaN;
  return <details className="asset-lab progression-lab" data-lab-marker="PROGRESSION_LAB_DEV_ONLY">
    <summary>Progression Lab · solo sviluppo</summary><p>Schema {p.schemaVersion} · persistence {snapshot.status} · {progressionTuning.id}</p>
    <dl><dt>Level / XP / next</dt><dd>{p.progression.level} / {p.progression.currentXp} / {nextLevelRequirement(p.progression.level, progressionTuning)}</dd>
      <dt>Coins</dt><dd>{p.wallet.coins}</dd><dt>Profile ID locale (non account)</dt><dd>{p.profileId}</dd></dl>
    <div className="dev-progression-actions"><label>XP di test<input inputMode="numeric" value={xp} onChange={e => setXp(e.target.value)} /></label>
      <button type="button" onClick={() => controller.update(profile => immutable({ ...gainXp(profile, amount(xp), progressionTuning), updatedAt: Math.max(Date.now(), profile.updatedAt) }))}>Aggiungi XP di test</button>
      <label>Monete di test<input inputMode="numeric" value={coins} onChange={e => setCoins(e.target.value)} /></label>
      <button type="button" onClick={() => controller.update(profile => immutable({ ...profile, wallet: earnCoins(profile.wallet, amount(coins)), updatedAt: Math.max(Date.now(), profile.updatedAt) }))}>Aggiungi monete di test</button>
      <button type="button" onClick={() => controller.refreshCatalog()}>Rivaluta sblocchi</button></div>
    <label className="motion-preview"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Confermo l’azzeramento del solo profilo locale Shaker-Chaos</label>
    <button type="button" disabled={!confirmed} onClick={() => {
      if (!confirmed) return;
      if (!resetDevelopmentProfile(newBrowserProfile())) { setMessage('Reset non riuscito: salvataggio originale conservato.'); return; }
      setConfirmed(false); onReset();
    }}>Azzera il profilo locale</button><p role="status">{message}</p>
    <details><summary>Profilo, ownership, loadout, stats e ledger</summary><pre>{JSON.stringify(p, null, 2)}</pre></details>
    <details><summary>Diagnostica di persistenza</summary><pre>{JSON.stringify(snapshot.diagnostics, null, 2)}</pre></details>
  </details>;
}
