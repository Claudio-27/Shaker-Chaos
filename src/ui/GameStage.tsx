import { ingredientVisuals, optionalAsset, selectedEffect } from '../content/visualPlan.ts';
import { lazy, Suspense, memo, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { BartenderDefinition, IngredientDefinition, MixState } from '../domain/model.ts';
import type { ClassicInspiredTuningProfile } from '../domain/classicProfile.ts';
import type { ClassicScoreResult } from '../domain/classicScoring.ts';
import type { VolumeUnit } from '../domain/quantity.ts';
import { volumeUnits } from '../domain/quantity.ts';
import type { AssetId, EnvironmentVisualDefinition, ReactionId, VisualCatalog, VisualLoadout, VisualSequence } from '../content/visualModel.ts';
import { playerCopy } from '../content/playerExperience.ts';
import { AssetImage, EnvironmentArt, SequenceArt } from './AssetVisual.tsx';
import { bottleSlot, bottleSlotVariables } from './classicStageLayout.ts';
import { BACKGROUND_STYLE } from './classicVisualFraming.ts';
import { useClassicStageFrame } from './useClassicStageFrame.ts';
import { VisualDebug } from './VisualDebug.tsx';
import type { PresentationDiagnostics } from './VisualDebug.tsx';
import type { PlayerPhase, PourFeedback, ShakeRisk } from './gameplayPresentation.ts';
import type { ResultStage } from './resultPresentation.ts';
import { reactionVisible, scoreVisible } from './resultPresentation.ts';

export function GameStage({ environment, debug, diagnostics, failed, children, meta }: {
  readonly environment: EnvironmentVisualDefinition; readonly debug: boolean; readonly diagnostics: PresentationDiagnostics;
  readonly failed: boolean; readonly children: ReactNode; readonly meta?: ReactNode;
}) {
  const stageRef = useRef<HTMLElement | null>(null);
  const { frameRef, variables, scale, exact } = useClassicStageFrame();
  return <div className="classic-stage-frame" data-classic-exact={exact || undefined} ref={frameRef} style={variables}><div className="classic-stage-sizer">
  <section className={`game-stage ${debug ? 'stage-debug' : ''}`} data-failed={failed} ref={stageRef} aria-label="Banco di miscelazione">
    <div className="environment-layers" style={BACKGROUND_STYLE} aria-hidden="true">
      <EnvironmentArt environment={environment} />
      {environment.backBar && <AssetImage assetId={environment.backBar} className="environment-back-bar" />}
      {environment.decorations?.map((layer, index) => <AssetImage key={layer.asset + ':' + index} assetId={layer.asset}
        className={`environment-decoration depth-${layer.depth}`} style={{ objectFit: layer.fit }} />)}
    </div>
    {meta}
    {children}
    {import.meta.env.DEV && debug && <VisualDebug environment={environment} scale={scale} stageRef={stageRef} presentation={diagnostics} />}
  </section></div></div>;
}
function sameLiquid(a: MixState, b: MixState) {
  const ids = Object.keys(a.quantities);
  return ids.length === Object.keys(b.quantities).length && ids.every(id => a.quantities[id] === b.quantities[id]);
}
export const BottleShelf = memo(function BottleShelf({ loadout, ingredients, visuals, mix, selectedId, disabled, pourFeedback, onSelect, formatVolume }: {
  readonly loadout: VisualLoadout; readonly ingredients: readonly IngredientDefinition[]; readonly visuals: VisualCatalog; readonly mix: MixState;
  readonly selectedId: string; readonly disabled: boolean; readonly pourFeedback: PourFeedback; readonly onSelect: (id: string) => void;
  readonly formatVolume: (value: VolumeUnit) => string;
}) {
  return <section className="bottle-shelf" data-zone="bottles" aria-labelledby="ingredients-title">
    <div className="zone-heading"><span>LE BOTTIGLIE DEL BANCO</span><h2 id="ingredients-title">Scegli un ingrediente</h2></div>
    <div className="bottle-list">{Array.from({ length: Math.ceil(ingredients.length / 4) }, (_, page) => <div className="bottle-page" role="group" aria-label={'Mensola ' + (page + 1)} key={page}>
      {ingredients.slice(page * 4, page * 4 + 4).map((ingredient, index) => {
      const visual = ingredientVisuals(visuals, loadout, ingredient.id);
      if (!visual) throw new Error('Missing ingredient visual: ' + ingredient.id);
      const selected = ingredient.id === selectedId;
      return <button type="button" className={`bottle-hitbox ${selected ? 'is-selected' : ''}`} data-hitbox="bottle" style={bottleSlotVariables(page * 4 + index)} data-slot={bottleSlot(page * 4 + index).centerX}
        aria-label={ingredient.name + ', ' + formatVolume(mix.quantities[ingredient.id] ?? volumeUnits(0)) + ' nel mix'}
        data-pour={selected ? pourFeedback : 'idle'} disabled={disabled} aria-pressed={selected} key={ingredient.id} onClick={() => onSelect(ingredient.id)}>
        <AssetImage assetId={selected ? optionalAsset(visuals, visual.selectedBottle, visual.bottle)! : visual.bottle} fallback={visual.bottle} className="bottle-image" framing="bottle" />
        <span className="bottle-copy"><strong>{ingredient.shortLabel}</strong><span>{ingredient.description}</span>
          <b>{formatVolume(mix.quantities[ingredient.id] ?? volumeUnits(0))} nel mix</b></span>
        <span className="bottle-selected" aria-hidden="true">{selected ? '✓' : ''}</span>
      </button>;
    })}</div>)}</div>
    <p className="shelf-hint">La bottiglia selezionata guida il prossimo versamento.</p>
  </section>;
}, (a, b) => a.loadout === b.loadout && a.ingredients === b.ingredients && a.visuals === b.visuals &&
  a.selectedId === b.selectedId && a.disabled === b.disabled && a.pourFeedback === b.pourFeedback &&
  a.onSelect === b.onSelect && a.formatVolume === b.formatVolume && sameLiquid(a.mix, b.mix));

const CalibrationPose = import.meta.env.DEV ? lazy(() => import('./ClassicCalibrationPose.tsx')) : null;
export const BartenderArea = memo(function BartenderArea({ loadout, bartender, visuals, reactionId, pose, working, attemptKey, reducedMotion, lastResort }: {
  readonly loadout: VisualLoadout; readonly bartender: BartenderDefinition; readonly visuals: VisualCatalog; readonly reactionId: ReactionId;
  readonly pose: 'idle' | 'tasting' | 'reaction' | 'failure'; readonly working: 'idle' | 'pouring' | 'shaking';
  readonly attemptKey: number; readonly reducedMotion: boolean; readonly lastResort: AssetId;
}) {
  const visual = visuals.bartenders[bartender.id], reaction = visuals.reactions[reactionId];
  const effect = selectedEffect(visuals, loadout);
  if (!visual || !reaction) throw new Error('Missing active bartender presentation');
  const sequence = useMemo<VisualSequence>(() => {
    const idle = { frames: [visual.idle], frameDurationMs: 1000 };
    if (pose === 'idle') return idle;
    if (pose === 'tasting') return visual.tasting ?? idle;
    const final = visual.reactions[reactionId];
    if (!final) throw new Error('Missing reaction sequence: ' + reactionId);
    return final;
  }, [visual, reactionId, pose]);
  return <section className={`bartender-area working-${working}`} data-zone="bartender" data-pose={pose} aria-label={bartender.name + ', il tuo bartender'}>
    <div className="bartender-name"><AssetImage assetId={visual.portrait ?? visual.idle} fallback={visual.idle} lastResort={lastResort} /><span><strong>{bartender.name}</strong><small>Il tuo compagno di esperimenti</small></span></div>
    <div className="character-safe-area" data-safe-area="character">
      {import.meta.env.DEV && CalibrationPose && <Suspense fallback={null}><CalibrationPose /></Suspense>}
      <SequenceArt key={bartender.id + ':' + reactionId + ':' + attemptKey + ':' + pose} sequence={sequence} fallback={visual.idle}
        reducedMotion={reducedMotion} lastResort={lastResort} motion={pose === 'reaction' && !reducedMotion ? reaction.motion : 'none'} className="character-body" />
      {visual.accessories?.map(id => <AssetImage key={id} assetId={id} className="character-accessory" />)}
      {pose === 'reaction' && reactionId === 'lab.excellent' && effect && !reducedMotion && <AssetImage assetId={effect} optional className="character-effect" />}
    </div>
  </section>;
});
export function CounterArea({ assetId, fit, children }: { readonly assetId: AssetId; readonly fit: 'cover' | 'contain'; readonly children: ReactNode }) {
  return <section className="counter-area" data-zone="counter" aria-label="Banco e preparazione">
    <AssetImage assetId={assetId} className="counter-surface" framing="counter" style={{ objectFit: fit }} /><div className="counter-content">{children}</div>
  </section>;
}

export const MixingStation = memo(function MixingStation({ mix, volume, capacity, maximumIce, visuals, formatVolume, shaking, served, failed, pourFeedback, risk, attemptKey }: {
  readonly mix: MixState; readonly volume: VolumeUnit; readonly capacity: VolumeUnit; readonly maximumIce: number; readonly visuals: VisualCatalog;
  readonly formatVolume: (value: VolumeUnit) => string; readonly shaking: boolean; readonly served: boolean; readonly failed: boolean;
  readonly pourFeedback: PourFeedback; readonly risk: ShakeRisk; readonly attemptKey: number;
}) {
  return <div className="mixing-station" data-zone="mixing" data-served={served} data-hitbox="station-preview" data-pour={pourFeedback} data-risk={risk}>
    <div className={`vessel-art ${shaking ? 'is-shaking' : ''} ${failed ? 'is-failed' : ''}`} role="img"
      aria-label={failed ? 'Il mix ha fatto boom!' : (served ? 'Bicchiere' : 'Shaker') + ', ' + formatVolume(volume) + ' di ' + formatVolume(capacity) + ', ghiaccio ' + mix.iceUnits}>
      {pourFeedback === 'pouring' && <span className="pour-stream" aria-hidden="true" />}
      <AssetImage assetId={served ? visuals.gameplay.glass : visuals.gameplay.shaker} className="vessel-shell" framing={served ? 'glass' : 'shaker'} />
      {mix.garnishId && <AssetImage key={attemptKey + ':' + mix.garnishId} assetId={visuals.gameplay.garnish} className="garnish-image garnish-cue" />}
      {failed && <span className="burst-ring" aria-hidden="true" />}
    </div>
    <div className="mix-meter">
      <span className="fill-label">Livello del mix</span>
      <strong>{formatVolume(volume)} <small>/ {formatVolume(capacity)}</small></strong>
      <div className="capacity-track" role="progressbar" aria-label="Riempimento dello shaker" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={volume}
        aria-valuetext={formatVolume(volume) + ' su ' + formatVolume(capacity)}>
        <span key={attemptKey} className="canonical-fill" style={{ width: volume / capacity * 100 + '%' }} />
      </div>
      <div className="composition-meter" aria-hidden="true">{Object.entries(visuals.ingredients).filter(([id]) => (mix.quantities[id] ?? 0) > 0).map(([id, ingredient]) =>
        <i key={id} style={{ background: ingredient.liquid.color, flexGrow: mix.quantities[id] }} />)}</div>
      <span className="mix-status">{failed ? 'Un nuovo giro!' : served ? 'Mix servito' : shaking ? 'Si agita!' :
        pourFeedback !== 'idle' ? playerCopy.pour[pourFeedback] : volume === capacity ? playerCopy.pour.full : volume ? 'Il mix prende forma' : 'Shaker pronto'}</span>
      <div className="ice-dock" aria-label={mix.iceUnits + ' aggiunte di ghiaccio, massimo ' + maximumIce}>
        {Array.from({ length: maximumIce }, (_, index) => <span key={attemptKey + ':' + index + ':' + (index < mix.iceUnits)}
          className={`ice-pip ${index < mix.iceUnits ? 'is-filled' : ''}`} aria-hidden="true">
          <AssetImage assetId={visuals.gameplay.ice} />
        </span>)}
      </div>
    </div>
  </div>;
}, (a, b) => a.volume === b.volume && a.capacity === b.capacity && a.maximumIce === b.maximumIce &&
  a.visuals === b.visuals && a.formatVolume === b.formatVolume && a.shaking === b.shaking && a.served === b.served &&
  a.failed === b.failed && a.pourFeedback === b.pourFeedback && a.risk === b.risk && a.attemptKey === b.attemptKey &&
  a.mix.iceUnits === b.mix.iceUnits && a.mix.garnishId === b.mix.garnishId && sameLiquid(a.mix, b.mix));

export function ControlsArea({ children }: { readonly children: ReactNode }) {
  return <section className="controls-area" data-zone="controls" aria-label="Comandi di miscelazione">{children}</section>;
}
export function RoundProgress({ phase }: { readonly phase: PlayerPhase }) {
  const phases = Object.keys(playerCopy.phases) as PlayerPhase[];
  const current = phases.indexOf(phase);
  return <ol className="round-progress" aria-label="Il tuo giro al banco">
    {phases.map((item, index) => <li key={item} className={index < current ? 'is-done' : ''} aria-current={phase === item ? 'step' : undefined}>
      <span aria-hidden="true">{index < current ? '✓' : index + 1}</span>{playerCopy.phases[item]}
    </li>)}
  </ol>;
}
const scoreLabels = { balance: 'Ingredienti', ice: 'Ghiaccio', shake: 'Agitazione', garnish: 'Guarnizione' } as const;
export const ScoreHUD = memo(function ScoreHUD({ result, stage, title, ingredients, profile, titleRef, skipRef, onSkip, onNewDrink, reward, line, children, resetAction, guidanceKey, milestone }: {
  readonly result: ClassicScoreResult | null; readonly stage: ResultStage; readonly title: string; readonly ingredients: readonly IngredientDefinition[];
  readonly profile: ClassicInspiredTuningProfile; readonly titleRef: RefObject<HTMLHeadingElement | null>;
  readonly line: string; readonly children?: ReactNode; readonly resetAction?: ReactNode; readonly guidanceKey?: string; readonly milestone?: ReactNode; readonly reward?: ReactNode; readonly skipRef: RefObject<HTMLButtonElement | null>; readonly onSkip: () => void; readonly onNewDrink: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [result, stage, guidanceKey]);
  const revealScore = result && scoreVisible(stage), revealReaction = result && reactionVisible(stage);
  return <section className={`score-hud result-${stage}`} data-zone="hud" data-result-stage={stage} aria-labelledby="score-title" aria-busy={!!result && stage !== 'breakdown'}>
    {milestone}
    <div className="result-scroll" ref={scrollRef} tabIndex={0} role="region" aria-label="Messaggi e dettagli del drink">
    <div className="score-top">
      <div><span className="eyebrow">{result ? "IL VERDETTO DEL BANCO" : "IL TUO GIRO"}</span>
        <h2 id="score-title" ref={titleRef} tabIndex={-1}>{revealReaction ? title : result ? playerCopy.tasting.title : title}</h2>
      </div>
      {result && <div className="score-number" aria-live="polite" aria-atomic="true"><strong>{revealScore ? new Intl.NumberFormat('it-IT', { useGrouping: true }).format(result.totalScore) : '—'}</strong><span>{revealScore ? '/ ' + new Intl.NumberFormat('it-IT', { useGrouping: true }).format(result.maximum) : result ? 'si assaggia…' : 'da scoprire'}</span></div>}
    </div>
    <p className="bartender-line" aria-live="polite">“{line}”</p>
    {result ? <>
      <div className="breakdown" data-revealed={stage === 'breakdown'}>
        {stage === 'breakdown' ? result.breakdown.map(item => <div className="breakdown-row" key={item.component}>
          <span>{scoreLabels[item.component]}</span><div className="mini-track"><i style={{ width: (item.maximum ? item.points / item.maximum * 100 : 0) + '%' }} /></div><b>{item.points}</b>
        </div>) : <p className="waiting-note" role="status">{playerCopy.tasting.status}<span className="tasting-dots" aria-hidden="true"> · · ·</span></p>}
      </div>
      {reward}

    </> : <div className="round-guidance">{children}</div>}
    {!result && <details className="demo-guide"><summary>Note del banco <span aria-hidden="true">+</span></summary>
      <strong>Un equilibrio da provare</strong>
      <p>{Object.entries(profile.score.targetParts).map(([id, parts]) => parts + ' ' + (ingredients.find(item => item.id === id)?.shortLabel.toLowerCase() ?? id)).join(' · ')}</p>
      <p>Il ghiaccio rinfresca, l’agrume completa. Agita con ritmo, senza esagerare!</p>
      <small>Ogni nuova pressione di Versa ha un breve avvio. Tieni premuto per far crescere il mix.</small>
    </details>}
    {!result && <p className="scoring-notice"><strong>Il tuo stile, un mix alla volta.</strong></p>}
    </div>
      <div className="result-actions">{result ? <>
        {stage !== 'breakdown' && <button type="button" className="skip-result" ref={skipRef} onClick={onSkip}>{playerCopy.skip}</button>}
        <button type="button" className="new-drink-button" onClick={onNewDrink}>{playerCopy.newDrink}<span aria-hidden="true">↻</span></button>
      </> : resetAction}</div>
  </section>;
});
