import type { VisualLoadout } from '../content/visualModel.ts';
import { createSessionClock } from '../platform/sessionClock.ts';
import type { VolumeUnit } from '../domain/quantity.ts';
import type { OperationEndReason } from '../domain/session.ts';
import { formatVolumeUnits } from './volumePresentation.ts';
import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { gameDependencies, gamePresentation } from '../application/bootstrap.ts';
import { newGame, transitionGame } from '../application/game.ts';
import { totalVolumeUnits } from '../domain/mix.ts';
import { registerOfflineShell } from '../platform/pwa.ts';
import type { ShellStatus } from '../platform/pwa.ts';
import { AssetImage, VisualAssetsProvider } from './AssetVisual.tsx';
import { BartenderArea, BottleShelf, ControlsArea, CounterArea, GameStage, MixingStation, ReactionOverlay, ScoreHUD } from './GameStage.tsx';
import { selectReactionId } from '../content/visualPlan.ts';
import { primeSceneVisuals } from '../platform/visualPreload.ts';
import { HoldButton } from './HoldButton.tsx';

const { catalog: publicCatalog, input: inputConfiguration, volumeDisplay, guide, scoringNotice, visuals, scene: initialScene } = gamePresentation;
const shellLabels: Record<ShellStatus, string> = {
  development: 'Sessione locale', unavailable: 'Offline non disponibile', ready: 'Pronto anche offline', error: 'Cache offline non disponibile',
};
const formatter = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 });
const visualDebug = import.meta.env.DEV && new URLSearchParams(window.location.search).get('visualDebug') === '1';

const AssetLab = import.meta.env.DEV ? lazy(() => import('./AssetLab.tsx')) : null;
const assetLab = import.meta.env.DEV && new URLSearchParams(window.location.search).get('assetLab') === '1';

export function App() {
  const [loadout, setLoadout] = useState<VisualLoadout>(initialScene);
  const scene = useMemo(() => ({ ...loadout, ingredientIds: initialScene.ingredientIds }), [loadout]);
  const [state, dispatch] = useReducer(
    (current: ReturnType<typeof newGame>, action: Parameters<typeof transitionGame>[1]) => transitionGame(current, action, gameDependencies),
    undefined, () => newGame(gameDependencies.mixingRules),
  );
  const [selectedId, setSelectedId] = useState(publicCatalog.ingredients[0]?.id ?? '');
  const [sessionTime] = useState(() => createSessionClock());
  const nextOperation = useRef(0);
  const pourOperation = useRef<number | null>(null);
  const shakeOperation = useRef<number | null>(null);
  const [shellStatus, setShellStatus] = useState<ShellStatus>('development');
  const resultTitle = useRef<HTMLHeadingElement>(null);
  const volume = totalVolumeUnits(state.view.mix);
  const { capacityUnits, maximumIceUnits, maximumShakeDurationMs } = gameDependencies.mixingRules;
  const served = state.view.phase === 'served';
  const selected = publicCatalog.ingredients.find((item) => item.id === selectedId);
  const bartender = publicCatalog.bartenders.find((item) => item.id === scene.bartenderId);
  const reactionTier = state.result?.reactionTier ?? 'unrated';
  const reaction = publicCatalog.reactions.find((item) => item.tier === reactionTier);
  const garnish = publicCatalog.garnishes[0];
  const recipe = publicCatalog.recipes[0];
  const shaking = state.view.shakes.some((item) => item.endedAtMs === null);
  const beginPour = useCallback(() => {
    const operationId = nextOperation.current++;
    pourOperation.current = operationId;
    dispatch({ type: 'PourStarted', operationId, ingredientId: selectedId, atMs: sessionTime() });
  }, [selectedId, sessionTime]);
  const pourAction = useCallback(() => {
    if (pourOperation.current !== null) dispatch({ type: 'PourTick', operationId: pourOperation.current, ingredientId: selectedId,
      requestedUnits: inputConfiguration.pourStepUnits, atMs: sessionTime() });
  }, [selectedId, sessionTime]);
  const endPour = useCallback((reason: OperationEndReason) => {
    const operationId = pourOperation.current;
    pourOperation.current = null;
    if (operationId !== null) dispatch({ type: 'PourEnded', operationId, reason, atMs: sessionTime() });
  }, [sessionTime]);
  const beginShake = useCallback(() => {
    const operationId = nextOperation.current++;
    shakeOperation.current = operationId;
    dispatch({ type: 'ShakeStarted', operationId, atMs: sessionTime() });
  }, [sessionTime]);
  const shakeAction = useCallback(() => {
    if (shakeOperation.current !== null) dispatch({ type: 'ShakeTick', operationId: shakeOperation.current,
      durationMs: inputConfiguration.shakeStepMs, atMs: sessionTime() });
  }, [sessionTime]);
  const endShake = useCallback((reason: OperationEndReason) => {
    const operationId = shakeOperation.current;
    shakeOperation.current = null;
    if (operationId !== null) dispatch({ type: 'ShakeEnded', operationId, reason, atMs: sessionTime() });
  }, [sessionTime]);
  const formatVolume = (units: VolumeUnit) => formatVolumeUnits(units, volumeDisplay);
  useEffect(() => {
    let active = true;
    void registerOfflineShell(visuals, scene).then((status) => { if (active) setShellStatus(status); });
    return () => { active = false; };
  }, [scene]);
  useEffect(() => { if (served) resultTitle.current?.focus(); }, [served]);

  useEffect(() => primeSceneVisuals(visuals, scene, import.meta.env.BASE_URL), [scene]);
  const environment = visuals.environments[scene.environmentId];
  const counter = visuals.counters[scene.counterId];
  const reactionId = selectReactionId(visuals, reactionTier);
  if (!bartender || !environment || !counter || !reaction) throw new Error('Missing active scene content');
  return (
    <VisualAssetsProvider catalog={visuals}>
      <div className="app-shell">
        <header className="topbar">
          <a className="brand" href="./" aria-label="Shaker-Chaos, pagina iniziale"><span className="brand-icon" aria-hidden="true">✳</span><span>SHAKER<span className="brand-dash">—</span>CHAOS</span></a>
          <div className="topbar-meta"><span className="phase-chip">LAB / FASE 0.3</span><span className="connection"><i aria-hidden="true" />{shellLabels[shellStatus]}</span></div>
        </header>
        <main>
          <div className="intro"><div><p className="eyebrow">IL TUO PICCOLO LABORATORIO AL BANCO</p><h1>Un po’ di ritmo. <em>Un po’ di caos.</em></h1></div><p>Tre ingredienti. Un nuovo esperimento.</p></div>
          {assetLab && AssetLab && <Suspense fallback={null}><AssetLab loadout={loadout} visuals={visuals} ingredientIds={scene.ingredientIds} onChange={setLoadout} /></Suspense>}
          <GameStage environment={environment} debug={visualDebug}>
            <BottleShelf loadout={loadout} ingredients={publicCatalog.ingredients} visuals={visuals} mix={state.view.mix} selectedId={selectedId} disabled={served} onSelect={setSelectedId} formatVolume={formatVolume} symbol={volumeDisplay.symbol} />
            <BartenderArea loadout={loadout} bartender={bartender} visuals={visuals} reactionId={reactionId} served={served} attemptKey={state.view.currentAttemptStart} />
            <ReactionOverlay title={reaction.title} line={bartender.lines[reactionTier]} served={served} titleRef={resultTitle} />
            <CounterArea assetId={counter.surface} fit={counter.fit}>
              <MixingStation mix={state.view.mix} volume={volume} capacity={capacityUnits} visuals={visuals} formatVolume={formatVolume} symbol={volumeDisplay.symbol} shaking={shaking} served={served} />
              <ControlsArea>
                <div className="mix-controls">
                  <HoldButton label={`Versa ${selected?.name ?? 'ingrediente'}: tieni premuto`} className="pour-button" disabled={served || volume >= capacityUnits || !selected} intervalMs={inputConfiguration.pourIntervalMs} onAction={pourAction} onStart={beginPour} onEnd={endPour} resetToken={state.view.currentAttemptStart}><AssetImage assetId={visuals.controls.pour} /><strong>Versa</strong><small>{selected?.shortLabel.toLowerCase()}</small></HoldButton>
                  <HoldButton label="Agita: tieni premuto" className="shake-button" disabled={served || volume === 0 || state.view.mix.shakeDurationMs >= maximumShakeDurationMs} intervalMs={inputConfiguration.shakeIntervalMs} onAction={shakeAction} onStart={beginShake} onEnd={endShake} resetToken={state.view.currentAttemptStart}><AssetImage assetId={visuals.controls.shake} /><strong>Agita</strong><small>{formatter.format(state.view.mix.shakeDurationMs / 1000)} s</small></HoldButton>
                </div>
                <div className="extras">
                  <button type="button" disabled={served || state.view.mix.iceUnits >= maximumIceUnits} onClick={() => dispatch({ type: 'IceAdded', requestedUnits: 1, atMs: sessionTime() })}><AssetImage assetId={visuals.gameplay.ice} />Ghiaccio <b>{state.view.mix.iceUnits}/{maximumIceUnits}</b></button>
                  {garnish && <button type="button" disabled={served} aria-pressed={state.view.mix.garnishId === garnish.id} onClick={() => dispatch({ type: 'GarnishChanged', atMs: sessionTime(), garnishId: state.view.mix.garnishId ? null : garnish.id })}><AssetImage assetId={visuals.gameplay.garnish} />Agrume <b>{state.view.mix.garnishId ? '✓' : '+'}</b></button>}
                </div>
                <div className="serve-row"><button type="button" className="serve-button" disabled={served || volume === 0} onClick={() => dispatch({ type: 'Served', atMs: sessionTime() })}><span>Servi il mix</span><AssetImage assetId={visuals.controls.serve} /></button><button type="button" className="reset-button" aria-label="Svuota e ricomincia" onClick={() => dispatch({ type: 'Reset', atMs: sessionTime() })}><AssetImage assetId={visuals.controls.reset} /></button></div>
                <p className="hold-hint">Tieni premuto · touch, mouse o Invio/Spazio</p>
              </ControlsArea>
            </CounterArea>
            <ScoreHUD result={state.result} recipe={recipe} ingredients={publicCatalog.ingredients} guide={guide} notice={scoringNotice} />
          </GameStage>
        </main>
        <footer><span>Un progetto indipendente. Forme originali, un mix alla volta.</span><span>DEMO <b>·</b> {gameDependencies.scoringEngine.configurationId}</span></footer>
      </div>
    </VisualAssetsProvider>
  );
}