import { ingredientVisuals, optionalAsset, selectedEffect } from '../content/visualPlan.ts';
import { useMemo, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { BartenderDefinition, IngredientDefinition, MixState, RecipeDefinition, ScoreComponent, ScoreResult } from '../domain/model.ts';
import type { VolumeUnit } from '../domain/quantity.ts';
import { volumeUnits } from '../domain/quantity.ts';
import type { AssetId, EnvironmentVisualDefinition, ReactionId, VisualCatalog, VisualLoadout } from '../content/visualModel.ts';
import { AssetImage, SequenceArt } from './AssetVisual.tsx';
import { VisualDebug } from './VisualDebug.tsx';

export function GameStage({ environment, debug, children }: {
  readonly environment: EnvironmentVisualDefinition; readonly debug: boolean; readonly children: ReactNode;
}) {
  const stageRef = useRef<HTMLElement | null>(null);
  return <section className={`game-stage ${debug ? 'stage-debug' : ''}`} ref={stageRef} aria-label="Banco di miscelazione">
    <div className="environment-layers" aria-hidden="true">
      <AssetImage assetId={environment.background} className="environment-background" priority="high" />
      {environment.backBar && <AssetImage assetId={environment.backBar} className="environment-back-bar" />}
      {environment.decorations?.map((layer, index) => <AssetImage key={`${layer.asset}:${index}`} assetId={layer.asset}
        className={`environment-decoration depth-${layer.depth}`} style={{ objectFit: layer.fit }} />)}
    </div>
    {children}
    {import.meta.env.DEV && debug && <VisualDebug stageRef={stageRef} />}
  </section>;
}

export function BottleShelf({ loadout, ingredients, visuals, mix, selectedId, disabled, onSelect, formatVolume, symbol }: {
  readonly loadout: VisualLoadout; readonly ingredients: readonly IngredientDefinition[]; readonly visuals: VisualCatalog; readonly mix: MixState;
  readonly selectedId: string; readonly disabled: boolean; readonly onSelect: (id: string) => void;
  readonly formatVolume: (value: VolumeUnit) => string; readonly symbol: string;
}) {
  return <section className="bottle-shelf" data-zone="bottles" aria-labelledby="ingredients-title">
    <div className="zone-heading"><span>01 / LE NOTE</span><h2 id="ingredients-title">Scegli un ingrediente</h2></div>
    <div className="bottle-list">
      {ingredients.map((ingredient) => {
        const visual = ingredientVisuals(visuals, loadout, ingredient.id);
        if (!visual) throw new Error(`Missing ingredient visual: ${ingredient.id}`);
        const selected = ingredient.id === selectedId;
        return <button type="button" className={`bottle-hitbox ${selected ? 'is-selected' : ''}`} data-hitbox="bottle"
          disabled={disabled} aria-pressed={selected} key={ingredient.id} onClick={() => onSelect(ingredient.id)}>
          <AssetImage assetId={selected ? optionalAsset(visuals, visual.selectedBottle, visual.bottle)! : visual.bottle} fallback={visual.bottle} className="bottle-image" />
          <span className="bottle-copy"><strong>{ingredient.name}</strong><span>{ingredient.description}</span>
            <b>{formatVolume(mix.quantities[ingredient.id] ?? volumeUnits(0))} {symbol} nel mix</b></span>
          <span className="bottle-selected" aria-hidden="true">{selected ? '●' : '○'}</span>
        </button>;
      })}
    </div>
    <p className="shelf-hint">Scegli la bottiglia, poi tieni premuto Versa.</p>
  </section>;
}

export function BartenderArea({ loadout, bartender, visuals, reactionId, served, attemptKey }: {
  readonly loadout: VisualLoadout; readonly bartender: BartenderDefinition; readonly visuals: VisualCatalog; readonly reactionId: ReactionId;
  readonly served: boolean; readonly attemptKey: number;
}) {
  const visual = visuals.bartenders[bartender.id];
  const reaction = visuals.reactions[reactionId];
  const effect = selectedEffect(visuals, loadout);
  if (!visual || !reaction) throw new Error('Missing active bartender presentation');
  const sequence = useMemo(() => {
    const final = visual.reactions[reactionId];
    if (!final) throw new Error(`Missing reaction sequence: ${reactionId}`);
    return final;
  }, [visual, reactionId, served]);
  return <section className="bartender-area" data-zone="bartender" aria-label={`${bartender.name}, bartender del laboratorio`}>
    <div className="bartender-name"><AssetImage assetId={visual.portrait ?? visual.idle} fallback={visual.idle} /><span><strong>{bartender.name}</strong><small>Il tuo compagno di esperimenti</small></span></div>
    <div className="character-safe-area" data-safe-area="character">
      <SequenceArt key={`${bartender.id}:${reactionId}:${attemptKey}:${served}`} sequence={sequence} fallback={visual.idle} {...(served && visual.tasting ? { intro: visual.tasting } : {})} motion={served ? reaction.motion : 'none'} className="character-body" />
      {visual.accessories?.map((id) => <AssetImage key={id} assetId={id} className="character-accessory" />)}
      {served && reactionId === 'lab.excellent' && effect && <AssetImage assetId={effect} optional className="character-effect" />}
    </div>
  </section>;
}

export function ReactionOverlay({ title, line, served, titleRef }: {
  readonly title: string; readonly line: string; readonly served: boolean; readonly titleRef: RefObject<HTMLHeadingElement | null>;
}) {
  return <section className="reaction-overlay" data-zone="reaction" aria-live="polite" aria-atomic="true" aria-label="Reazione del bartender">
    <p className="eyebrow">{served ? 'IL VERDETTO DEL BANCO' : 'DUE PAROLE DAL BARTENDER'}</p>
    <h2 ref={titleRef} tabIndex={-1}>{title}</h2><p className="bartender-line">“{line}”</p>
    <p className="reaction-instruction">{served ? 'Un altro giro? Svuota lo shaker e riprova.' : 'Versa, agita e servi. Il prossimo mix è tuo.'}</p>
  </section>;
}

export function CounterArea({ assetId, fit, children }: { readonly assetId: AssetId; readonly fit: 'cover' | 'contain'; readonly children: ReactNode }) {
  return <section className="counter-area" data-zone="counter" aria-label="Banco e preparazione">
    <AssetImage assetId={assetId} className="counter-surface" style={{ objectFit: fit }} /><div className="counter-content">{children}</div>
  </section>;
}
const icePositions = [[8, 15], [56, 34], [25, 56], [58, 8], [6, 52], [38, 20], [56, 61], [28, 2]] as const;
export function MixingStation({ mix, volume, capacity, visuals, formatVolume, symbol, shaking, served }: {
  readonly mix: MixState; readonly volume: VolumeUnit; readonly capacity: VolumeUnit; readonly visuals: VisualCatalog;
  readonly formatVolume: (value: VolumeUnit) => string; readonly symbol: string; readonly shaking: boolean; readonly served: boolean;
}) {
  const region = visuals.gameplay.liquidWindows[served ? 'glass' : 'shaker'];
  return <div className="mixing-station" data-zone="mixing" data-hitbox="station-preview">
    <div className={`vessel-art ${shaking ? 'is-shaking' : ''}`} role="img" aria-label={`Mix di ${formatVolume(volume)} ${symbol}, ${mix.iceUnits} cubetti di ghiaccio`}>
      {visuals.gameplay.liquidMode !== 'meter' && <div className="liquid-window" style={{ left: `${region.leftPercent}%`, top: `${region.topPercent}%`, width: `${region.widthPercent}%`, height: `${region.heightPercent}%` }}>
        <div className="liquid-stack" style={{ height: `${volume / capacity * 100}%` }}>
          {Object.entries(visuals.ingredients).filter(([id]) => (mix.quantities[id] ?? 0) > 0).map(([id, ingredient]) =>
            <div key={id} style={{ background: ingredient.liquid.color, flexGrow: mix.quantities[id] }}>
              {ingredient.liquid.overlay && <AssetImage assetId={ingredient.liquid.overlay} className="liquid-overlay" />}
            </div>)}
        </div>
        {icePositions.slice(0, mix.iceUnits).map(([left, top], index) => <AssetImage key={index} assetId={visuals.gameplay.ice} className="ice-image" style={{ left: `${left}%`, top: `${top}%` }} />)}
      </div>}
      <AssetImage assetId={served ? visuals.gameplay.glass : visuals.gameplay.shaker} className="vessel-shell" />
      {mix.garnishId && <AssetImage assetId={visuals.gameplay.garnish} className="garnish-image" />}
    </div>
    <div className="mix-meter"><strong>{formatVolume(volume)} <small>/ {formatVolume(capacity)} {symbol}</small></strong>
      <div className="capacity-track" role="progressbar" aria-label="Capacità dello shaker" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={volume}><span style={{ width: `${volume / capacity * 100}%` }} /></div>
      {visuals.gameplay.liquidMode === 'meter' && <div className="composition-meter" aria-hidden="true">{Object.entries(visuals.ingredients).filter(([id]) => (mix.quantities[id] ?? 0) > 0).map(([id, ingredient]) => <i key={id} style={{ background: ingredient.liquid.color, flexGrow: mix.quantities[id] }} />)}</div>}
      <span className="mix-status">{served ? 'Mix servito' : shaking ? 'Agitazione in corso' : volume ? 'Esperimento in corso' : 'Shaker pronto'}</span>
    </div>
  </div>;
}
export function ControlsArea({ children }: { readonly children: ReactNode }) {
  return <section className="controls-area" data-zone="controls" aria-label="Comandi di miscelazione">
    <div className="zone-heading"><span>02 / IL MIX</span><h2>Trova il tuo equilibrio</h2></div>{children}
  </section>;
}
const scoreLabels: Record<ScoreComponent, string> = { balance: 'Proporzioni', ice: 'Ghiaccio', shake: 'Agitazione', garnish: 'Guarnizione' };
export function ScoreHUD({ result, recipe, ingredients, guide, notice }: {
  readonly result: ScoreResult | null; readonly recipe: RecipeDefinition | undefined; readonly ingredients: readonly IngredientDefinition[];
  readonly guide: { readonly idealIceUnits: number; readonly idealShakeDurationMs: number; readonly garnishLabel: string; readonly note: string };
  readonly notice: { readonly title: string; readonly description: string };
}) {
  return <section className="score-hud" data-zone="hud" aria-labelledby="score-title">
    <div className="score-top"><div><span className="eyebrow">03 / L'ASSAGGIO</span><h2 id="score-title">Il tuo risultato</h2></div>
      <div className="score-number" aria-live="polite"><strong>{result?.score ?? '—'}</strong><span>{result ? `/ ${result.maximum}` : 'da servire'}</span></div></div>
    <div className="breakdown">{result ? result.breakdown.map((item) => <div className="breakdown-row" key={item.component}>
      <span>{scoreLabels[item.component]}</span><div className="mini-track"><i style={{ width: `${item.maximum ? item.points / item.maximum * 100 : 0}%` }} /></div><b>{item.points}<small>/{item.maximum}</small></b>
    </div>) : <p className="waiting-note">Il tuo esperimento prende forma. Servi per scoprire il risultato.</p>}</div>
    <details className="demo-guide"><summary>Obiettivo della demo <span aria-hidden="true">+</span></summary><strong>{recipe?.name}</strong>
      <p>{Object.entries(recipe?.ingredientParts ?? {}).map(([id, parts]) => `${parts} ${ingredients.find((item) => item.id === id)?.shortLabel.toLowerCase() ?? id}`).join(' · ')}</p>
      <p>{guide.idealIceUnits} cubetti · {guide.idealShakeDurationMs / 1000} s · {guide.garnishLabel}</p><small>{guide.note}</small>
    </details>
    <p className="scoring-notice"><strong>{notice.title}</strong><span>{notice.description}</span></p>
  </section>;
}