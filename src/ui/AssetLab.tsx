import { useEffect, useState } from 'react';
import { publicContentCatalog } from '../content/publicContentCatalog.ts';
import { optionalAsset, planSceneAssets, selectedEffect } from '../content/visualPlan.ts';
import { replaceVisualSlot } from '../content/visualLoadout.ts';
import type { SceneSelection, VisualCatalog, VisualLoadout } from '../content/visualModel.ts';
export default function AssetLab({ loadout, visuals, ingredientIds, onChange }: {
  readonly loadout: VisualLoadout; readonly visuals: VisualCatalog; readonly ingredientIds: readonly string[];
  readonly onChange: (value: VisualLoadout) => void;
}) {
  const [dimensions, setDimensions] = useState('');
  useEffect(() => {
    const inspect = () => setDimensions(JSON.stringify({
      viewport: [window.innerWidth, window.innerHeight],
      images: [...document.querySelectorAll<HTMLImageElement>('.game-stage img')].map((image) => ({
        requested: image.dataset.assetId, resolved: image.dataset.resolvedAsset,
        actual: [image.naturalWidth, image.naturalHeight], fallback: image.dataset.fallback === 'true',
      })),
      missing: [...document.querySelectorAll('[data-asset-error]')].map((node) => node.getAttribute('data-asset-error')),
    }, null, 2));
    inspect(); const timer = window.setInterval(inspect, 1000);
    return () => window.clearInterval(timer);
  }, [loadout]);
  const bartender = visuals.bartenders[loadout.bartenderId]!;
  const plan = planSceneAssets(visuals, { ...loadout, ingredientIds } satisfies SceneSelection);
  return <aside className="asset-lab" aria-label="Asset Lab">
    <h2>Asset Lab · solo sviluppo</h2>
    <div className="asset-lab-slots">
      {([
        ['bartenderId', 'Barista', 'bartender'], ['environmentId', 'Ambiente', 'environment'],
        ['counterId', 'Banco', 'counter'], ['bottleSetId', 'Bottiglie', 'bottle-set'],
      ] as const).map(([slot, label, kind]) => <label key={slot}>{label}
        <select value={loadout[slot] ?? ''} onChange={(event) => onChange(replaceVisualSlot(loadout, slot, event.target.value))}>
          {publicContentCatalog.items.filter((item) => item.kind === kind).map((item) => <option key={item.id} value={item.id}>{item.displayName} · {item.id}</option>)}
        </select>
      </label>)}
      <label>Effetto<select value={loadout.effectOverride === undefined ? 'default' : loadout.effectOverride ?? 'none'}
        onChange={(event) => onChange(replaceVisualSlot(loadout, 'effectOverride', event.target.value === 'default' ? undefined : event.target.value === 'none' ? null : event.target.value))}>
        <option value="default">Predefinito del barista</option><option value="none">Nessuno</option>
        {publicContentCatalog.items.filter((item) => item.kind === 'effect').map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}
      </select></label>
    </div>
    <p>Gli effetti compaiono sulla reazione eccellente. Le scelte restano in memoria e non emettono eventi di gioco.</p>
    <details><summary>Diagnostica ID, dimensioni e fallback</summary>
      <pre>{JSON.stringify({ loadout, portrait: optionalAsset(visuals, bartender.portrait, bartender.idle), effect: selectedEffect(visuals, loadout), critical: plan.critical, deferred: plan.deferred }, null, 2)}</pre>
      <pre>{dimensions}</pre>
    </details>
  </aside>;
}
