import type { ClassicInspiredTuningProfile } from '../domain/classicProfile.ts';
export default function TuningInspector({ profile }: { readonly profile: ClassicInspiredTuningProfile }) {
  return <details className="asset-lab" data-lab-marker="PRODUCTION_TUNING_DEV_ONLY">
    <summary>Production tuning inspector · solo sviluppo</summary>
    <p>ORIGINAL SHAKER-CHAOS TUNING · {profile.id} · nessuna mappatura ml.</p>
    <dl><dt>Capacità</dt><dd>{profile.capacityUnits}u</dd>
      <dt>Pour: avvio / intervallo / quantità</dt><dd>{profile.pour.startupMs}ms / {profile.pour.intervalMs}ms / {profile.pour.unitsPerStep}u</dd>
      <dt>Ice: bonus / limite</dt><dd>{profile.ice.pointsPerAction} × {profile.ice.maximumActions}</dd>
      <dt>Garnish</dt><dd>{profile.garnish.points}</dd>
      <dt>Shake: bonus per conteggio</dt><dd>{profile.shake.bonuses.join(', ')}</dd>
      <dt>Shake: fallimento</dt><dd>{profile.shake.failureCount} azioni oppure {profile.shake.failureDurationMs}ms cumulativi</dd>
      <dt>Score cap</dt><dd>{profile.score.maximum}</dd>
      <dt>Pesi ingredienti</dt><dd>{JSON.stringify(profile.score.ingredientWeights)}</dd>
      <dt>Bonus equilibrio</dt><dd>{profile.score.balanceBonus}, vicinanza alle proporzioni al quadrato</dd>
      <dt>Reaction thresholds</dt><dd>{profile.score.tiers.map(tier => tier.id + ' ≥ ' + tier.minimum).join(' · ')}</dd>
    </dl>
  </details>;
}
