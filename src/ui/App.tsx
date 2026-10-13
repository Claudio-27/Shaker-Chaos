import type { VisualLoadout } from '../content/visualModel.ts';
import { classicFailurePresentation, classicReactionPresentation } from '../content/classicPresentation.ts';
import { presentationForMechanicalTier } from '../content/reactionPresentation.ts';
import { createSessionClock } from '../platform/sessionClock.ts';
import type { VolumeUnit } from '../domain/quantity.ts';
import type { OperationEndReason } from '../domain/session.ts';
import { formatVolumeUnits } from './volumePresentation.ts';
import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { gameDependencies, gamePresentation } from '../application/productionBootstrap.ts';
import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import { totalVolumeUnits } from '../domain/mix.ts';
import { registerOfflineShell } from '../platform/pwa.ts';
import type { ShellStatus } from '../platform/pwa.ts';
import { AssetImage, VisualAssetsProvider } from './AssetVisual.tsx';
import { BartenderArea, BottleShelf, ControlsArea, CounterArea, GameStage, MixingStation, ReactionOverlay, ScoreHUD } from './GameStage.tsx';
import { primeSceneVisuals } from '../platform/visualPreload.ts';
import { HoldButton } from './HoldButton.tsx';

const { catalog, volumeDisplay, visuals, scene: initialScene } = gamePresentation;
const profile = gameDependencies.profile;
const shellLabels: Record<ShellStatus, string> = {
  development: 'Sessione locale', unavailable: 'Offline non disponibile', ready: 'Pronto anche offline', error: 'Cache offline non disponibile',
};
const query = new URLSearchParams(window.location.search);
const visualDebug = import.meta.env.DEV && query.get('visualDebug') === '1';
const AssetLab = import.meta.env.DEV ? lazy(() => import('./AssetLab.tsx')) : null;
const CompatibilityLab = import.meta.env.DEV ? lazy(() => import('./CompatibilityLab.tsx')) : null;
const TuningInspector = import.meta.env.DEV ? lazy(() => import('./TuningInspector.tsx')) : null;
const assetLab = import.meta.env.DEV && query.get('assetLab') === '1';
const compatLab = import.meta.env.DEV && query.get('compatLab') === '1';
const tuningLab = import.meta.env.DEV && (query.get('tuningLab') === '1' || visualDebug || compatLab);

export function App() {
  const [loadout, setLoadout] = useState<VisualLoadout>(initialScene);
  const scene = useMemo(() => ({ ...loadout, ingredientIds: initialScene.ingredientIds }), [loadout]);
  const [state, dispatch] = useReducer(
    (current: ReturnType<typeof newClassicGame>, action: Parameters<typeof transitionClassicGame>[1]) => transitionClassicGame(current, action, gameDependencies),
    undefined, () => newClassicGame(gameDependencies),
  );
  const [selectedId, setSelectedId] = useState(catalog.ingredients[0]?.id ?? '');
  const [sessionTime] = useState(() => createSessionClock());
  const nextOperation = useRef(0), pourOperation = useRef<number | null>(null), shakeOperation = useRef<number | null>(null);
  const [shellStatus, setShellStatus] = useState<ShellStatus>('development');
  const resultTitle = useRef<HTMLHeadingElement>(null);
  const mix = state.view.derived.mix, volume = totalVolumeUnits(mix);
  const terminal = state.view.phase === 'RESULT', mixing = state.view.phase === 'MIXING';
  const selected = catalog.ingredients.find(item => item.id === selectedId);
  const bartender = catalog.bartenders.find(item => item.id === scene.bartenderId);
  const shaking = state.view.derived.shakes.some(item => item.endedAtMs === null);
  const pouring = state.view.derived.pours.some(item => item.endedAtMs === null);
  const mechanicalTier = state.result?.mechanicalReactionTierId ?? 'unrated';
  const reactionId = presentationForMechanicalTier(visuals, scene.bartenderId, mechanicalTier, classicReactionPresentation(visuals));
  const presentationTier = reactionId === 'lab.rough' ? 'rough' : reactionId === 'lab.balanced' ? 'balanced' : reactionId === 'lab.excellent' ? 'excellent' : 'unrated';
  const reactionTitle = state.view.failed ? classicFailurePresentation.title
    : profile.score.tiers.find(tier => tier.id === mechanicalTier)?.title ?? 'Tutto da inventare';
  const warning = !terminal && (state.view.shakeCount >= profile.shake.failureCount - 1 || mix.shakeDurationMs >= profile.shake.warningDurationMs);
  const phaseLabel = terminal ? state.view.failed ? 'Un nuovo giro?' : 'Mix servito'
    : mixing ? 'Miscela i tuoi ingredienti' : shaking ? 'Agitazione in corso' : state.view.completedShakeCount ? 'Pronto per l’assaggio' : 'Agita e rilascia';
  const beginPour = useCallback((atMs: number) => {
    const operationId = nextOperation.current++; pourOperation.current = operationId;
    dispatch({ type: 'PourStarted', operationId, ingredientId: selectedId, atMs });
  }, [selectedId]);
  const pourAction = useCallback((atMs: number) => {
    if (pourOperation.current !== null) dispatch({ type: 'HoldAdvanced', operationId: pourOperation.current, atMs });
  }, []);
  const endPour = useCallback((reason: OperationEndReason, atMs: number) => {
    const operationId = pourOperation.current; pourOperation.current = null;
    if (operationId !== null) dispatch({ type: 'PourEnded', operationId, reason, atMs });
  }, []);
  const beginShake = useCallback((atMs: number) => {
    const operationId = nextOperation.current++; shakeOperation.current = operationId;
    dispatch({ type: 'ShakeStarted', operationId, atMs });
  }, []);
  const shakeAction = useCallback((atMs: number) => {
    if (shakeOperation.current !== null) dispatch({ type: 'HoldAdvanced', operationId: shakeOperation.current, atMs });
  }, []);
  const endShake = useCallback((reason: OperationEndReason, atMs: number) => {
    const operationId = shakeOperation.current; shakeOperation.current = null;
    if (operationId !== null) dispatch({ type: 'ShakeEnded', operationId, reason, atMs });
  }, []);
  const formatVolume = (units: VolumeUnit) => formatVolumeUnits(units, volumeDisplay);
  useEffect(() => {
    let active = true;
    void registerOfflineShell(visuals, scene).then(status => { if (active) setShellStatus(status); });
    return () => { active = false; };
  }, [scene]);
  useEffect(() => { if (terminal) resultTitle.current?.focus(); }, [terminal]);
  useEffect(() => primeSceneVisuals(visuals, scene, import.meta.env.BASE_URL), [scene]);
  const environment = visuals.environments[scene.environmentId], counter = visuals.counters[scene.counterId];
  if (!bartender || !environment || !counter) throw new Error('Missing active scene content');
  return <VisualAssetsProvider catalog={visuals}>
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Shaker-Chaos, pagina iniziale"><span className="brand-icon" aria-hidden="true">✳</span><span>SHAKER<span className="brand-dash">—</span>CHAOS</span></a>
        <div className="topbar-meta"><span className="phase-chip">IL BANCO È TUO</span><span className="connection"><i aria-hidden="true" />{shellLabels[shellStatus]}</span></div>
      </header>
      <main>
        <div className="intro"><div><p className="eyebrow">IL TUO PICCOLO LABORATORIO AL BANCO</p><h1>Un po’ di ritmo. <em>Un po’ di caos.</em></h1></div><p>Tre ingredienti. Un nuovo esperimento.</p></div>
        {compatLab && CompatibilityLab && <Suspense fallback={null}><CompatibilityLab currentSession={state.session} /></Suspense>}
        {assetLab && AssetLab && <Suspense fallback={null}><AssetLab loadout={loadout} visuals={visuals} ingredientIds={scene.ingredientIds} onChange={setLoadout} /></Suspense>}
        {tuningLab && TuningInspector && <Suspense fallback={null}><TuningInspector profile={profile} /></Suspense>}
        <GameStage environment={environment} debug={visualDebug}>
          <BottleShelf loadout={loadout} ingredients={catalog.ingredients} visuals={visuals} mix={mix} selectedId={selectedId}
            disabled={!mixing || pouring} onSelect={setSelectedId} formatVolume={formatVolume} symbol={volumeDisplay.symbol} />
          <BartenderArea loadout={loadout} bartender={bartender} visuals={visuals} reactionId={reactionId} served={terminal} attemptKey={state.view.derived.currentAttemptStart} />
          <ReactionOverlay title={reactionTitle} line={state.view.failed ? classicFailurePresentation.line : bartender.lines[presentationTier]} served={terminal} titleRef={resultTitle} />
          <CounterArea assetId={counter.surface} fit={counter.fit}>
            <MixingStation mix={mix} volume={volume} capacity={profile.capacityUnits} visuals={visuals} formatVolume={formatVolume}
              symbol={volumeDisplay.symbol} shaking={shaking} served={terminal && !state.view.failed} failed={state.view.failed} />
            <ControlsArea>
              <p className="phase-status" role="status">{phaseLabel}</p>
              <div className="mix-controls">
                <HoldButton label={`Versa ${selected?.name ?? 'ingrediente'}: tieni premuto`} className="pour-button"
                  disabled={!mixing || volume >= profile.capacityUnits || !selected} clock={sessionTime}
                  onAction={pourAction} onStart={beginPour} onEnd={endPour} resetToken={state.view.derived.currentAttemptStart}>
                  <AssetImage assetId={visuals.controls.pour} /><strong>Versa</strong><small>{pouring ? 'in corso…' : selected?.shortLabel.toLowerCase()}</small>
                </HoldButton>
                <HoldButton label="Agita: tieni premuto" className="shake-button" disabled={terminal || volume === 0 || pouring}
                  clock={sessionTime} onAction={shakeAction} onStart={beginShake} onEnd={endShake} resetToken={state.view.derived.currentAttemptStart}>
                  <AssetImage assetId={visuals.controls.shake} /><strong>Agita</strong><small>{shaking ? 'in corso…' : 'trova il ritmo'}</small>
                </HoldButton>
              </div>
              <div className="extras">
                <button type="button" disabled={!mixing || mix.iceUnits >= profile.ice.maximumActions}
                  onClick={() => dispatch({ type: 'IceAdded', requestedUnits: 1, atMs: sessionTime() })}>
                  <AssetImage assetId={visuals.gameplay.ice} />Ghiaccio <b>{mix.iceUnits}/{profile.ice.maximumActions}</b>
                </button>
                <button type="button" disabled={state.view.phase !== 'READY_TO_SERVE' || !!mix.garnishId} aria-pressed={!!mix.garnishId}
                  onClick={() => dispatch({ type: 'GarnishChanged', garnishId: profile.garnish.id, atMs: sessionTime() })}>
                  <AssetImage assetId={visuals.gameplay.garnish} />Agrume <b>{mix.garnishId ? '✓' : '+'}</b>
                </button>
              </div>
              <div className="serve-row">
                <button type="button" className="serve-button" disabled={terminal || pouring || shaking}
                  onClick={() => dispatch({ type: 'Served', atMs: sessionTime() })}><span>Servi il mix</span><AssetImage assetId={visuals.controls.serve} /></button>
                <button type="button" className="reset-button" aria-label="Svuota e ricomincia"
                  onClick={() => dispatch({ type: 'Reset', atMs: sessionTime() })}><AssetImage assetId={visuals.controls.reset} /></button>
              </div>
              <p className="hold-hint">Tieni premuto · touch, mouse o Invio/Spazio</p>
              <p className={`play-feedback ${warning ? 'is-warning' : ''}`} aria-live="polite">
                {state.feedback || (warning ? 'Piano con il ritmo… lo shaker sta per perdere la calma!' : '')}
              </p>
            </ControlsArea>
          </CounterArea>
          <ScoreHUD result={state.result} ingredients={catalog.ingredients} profile={profile} />
        </GameStage>
      </main>
      <footer><span>Un progetto indipendente. Forme originali, un mix alla volta.</span><span>SHAKER-CHAOS</span></footer>
    </div>
  </VisualAssetsProvider>;
}
