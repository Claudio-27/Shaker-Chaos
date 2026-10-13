import type { VisualLoadout } from '../content/visualModel.ts';
import { classicFailurePresentation, classicReactionPresentation } from '../content/classicPresentation.ts';
import { playerCopy, reactionCopy } from '../content/playerExperience.ts';
import { presentationForMechanicalTier } from '../content/reactionPresentation.ts';
import { createSessionClock } from '../platform/sessionClock.ts';
import { createHoldOwnership } from '../platform/holdController.ts';
import { silentPresentationAudio } from '../platform/presentationAudio.ts';
import type { PresentationSound } from '../platform/presentationAudio.ts';
import type { VolumeUnit } from '../domain/quantity.ts';
import type { OperationEndReason } from '../domain/session.ts';
import { formatVolumeUnits } from './volumePresentation.ts';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { gameDependencies, gamePresentation } from '../application/productionBootstrap.ts';
import { newClassicGame, transitionClassicGame } from '../application/classicGame.ts';
import { totalVolumeUnits } from '../domain/mix.ts';
import { registerOfflineShell } from '../platform/pwa.ts';
import type { ShellStatus } from '../platform/pwa.ts';
import { AssetImage, VisualAssetsProvider } from './AssetVisual.tsx';
import { BartenderArea, BottleShelf, ControlsArea, CounterArea, GameStage, MixingStation, ReactionOverlay, RoundProgress, ScoreHUD } from './GameStage.tsx';
import { primeSceneVisuals } from '../platform/visualPreload.ts';
import { HoldButton } from './HoldButton.tsx';
import { createResetGuard, gameplayPresentation } from './gameplayPresentation.ts';
import { reactionVisible } from './resultPresentation.ts';
import { resolvePlayerLoadout } from '../application/playerContent.ts';
import { createBrowserPlayer } from '../platform/playerBootstrap.ts';
import { Collection, PlayerHUD, RewardPresentation } from './PlayerProgression.tsx';
import { useReducedMotion, useResultReveal } from './usePlayerPresentation.ts';

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
const ProgressionLab = import.meta.env.DEV ? lazy(() => import('./ProgressionLab.tsx')) : null;
const progressionLab = import.meta.env.DEV && query.get('progressionLab') === '1';
const assetLab = import.meta.env.DEV && query.get('assetLab') === '1';
const compatLab = import.meta.env.DEV && query.get('compatLab') === '1';
const tuningLab = import.meta.env.DEV && (query.get('tuningLab') === '1' || visualDebug || compatLab);
const soundByEvent: Partial<Record<string, PresentationSound>> = {
  PourStarted: 'pour', ShakeStarted: 'shake', IceAdded: 'ice', Served: 'serve',
};

export function App() {
  const [player, setPlayer] = useState(createBrowserPlayer);
  const playerSnapshot = useSyncExternalStore(player.subscribe, player.snapshot);
  const [previewLoadout, setPreviewLoadout] = useState<VisualLoadout | null>(null);
  const ownedLoadout = useMemo(() => resolvePlayerLoadout(playerSnapshot.profile), [playerSnapshot.profile.equippedLoadout, playerSnapshot.profile.ownership]);
  const loadout = previewLoadout ?? ownedLoadout;
  const scene = useMemo(() => ({ ...loadout, ingredientIds: initialScene.ingredientIds }), [loadout]);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [state, setState] = useState(() => newClassicGame(gameDependencies));
  const stateRef = useRef(state);
  const dispatch = useCallback((action: Parameters<typeof transitionClassicGame>[1]) => {
    const previous = stateRef.current, next = transitionClassicGame(previous, action, gameDependencies);
    if (next === previous) return;
    stateRef.current = next;
    if (next.session.history !== previous.session.history) player.bindAttempt(next.view.derived.currentAttemptStart);
    if (!previous.result && next.result) player.settle(next.result, next.view.derived.currentAttemptStart);
    setState(next);
  }, [player]);
  const equip = useCallback((id: string | null) => { player.equip(id); setPreviewLoadout(null); }, [player]);
  const [selectedId, setSelectedId] = useState(catalog.ingredients[0]?.id ?? '');
  const [sessionTime] = useState(() => createSessionClock());
  const [holdOwnership] = useState(createHoldOwnership);
  const [resetGuard] = useState(createResetGuard);
  const nextOperation = useRef(0), pourOperation = useRef<number | null>(null), shakeOperation = useRef<number | null>(null);
  const [shellStatus, setShellStatus] = useState<ShellStatus>('development');
  const [cue, setCue] = useState('');
  const [motionPreview, setMotionPreview] = useState(false);
  const systemReduced = useReducedMotion();
  const reducedMotion = systemReduced || (import.meta.env.DEV && motionPreview);
  const resultTitle = useRef<HTMLHeadingElement>(null), skipButton = useRef<HTMLButtonElement>(null), pourButton = useRef<HTMLButtonElement>(null);
  const shakeButton = useRef<HTMLButtonElement>(null), serveButton = useRef<HTMLButtonElement>(null);
  const attemptKey = state.view.derived.currentAttemptStart;
  const reveal = useResultReveal(state.result, attemptKey, reducedMotion);
  const mix = state.view.derived.mix, volume = totalVolumeUnits(mix);
  const selected = catalog.ingredients.find(item => item.id === selectedId);
  const ui = gameplayPresentation(state, profile, !!selected);
  const bartender = catalog.bartenders.find(item => item.id === scene.bartenderId);
  const mechanicalTier = state.result?.mechanicalReactionTierId ?? 'unrated';
  const mappedReaction = presentationForMechanicalTier(visuals, scene.bartenderId, mechanicalTier, classicReactionPresentation(visuals));
  const finalCopy = state.view.failed ? classicFailurePresentation : reactionCopy(profile, mechanicalTier, scene.bartenderId);
  const hasReaction = !!state.result && reactionVisible(reveal.stage);
  const anticipating = ui.terminal && !hasReaction;
  const reactionId = hasReaction ? mappedReaction : 'lab.welcome';
  const pose = state.view.failed ? 'failure' : hasReaction ? 'reaction' : anticipating ? 'tasting' : 'idle';
  const title = anticipating ? playerCopy.tasting.title : ui.terminal ? finalCopy.title : playerCopy.ready.title;
  const line = anticipating ? playerCopy.tasting.line : ui.terminal ? finalCopy.line : playerCopy.ready.line;
  const beginPour = useCallback((atMs: number) => {
    setCue('');
    const operationId = nextOperation.current++; pourOperation.current = operationId;
    dispatch({ type: 'PourStarted', operationId, ingredientId: selectedId, atMs });
  }, [selectedId, dispatch]);
  const pourAction = useCallback((atMs: number) => {
    if (pourOperation.current !== null) dispatch({ type: 'HoldAdvanced', operationId: pourOperation.current, atMs });
  }, [dispatch]);
  const endPour = useCallback((reason: OperationEndReason, atMs: number) => {
    const operationId = pourOperation.current; pourOperation.current = null;
    if (operationId !== null) dispatch({ type: 'PourEnded', operationId, reason, atMs });
  }, [dispatch]);
  const beginShake = useCallback((atMs: number) => {
    setCue('');
    const operationId = nextOperation.current++; shakeOperation.current = operationId;
    dispatch({ type: 'ShakeStarted', operationId, atMs });
  }, [dispatch]);
  const shakeAction = useCallback((atMs: number) => {
    if (shakeOperation.current !== null) dispatch({ type: 'HoldAdvanced', operationId: shakeOperation.current, atMs });
  }, [dispatch]);
  const endShake = useCallback((reason: OperationEndReason, atMs: number) => {
    const operationId = shakeOperation.current; shakeOperation.current = null;
    if (operationId !== null) dispatch({ type: 'ShakeEnded', operationId, reason, atMs });
  }, [dispatch]);
  const newDrink = useCallback(() => {
    if (!resetGuard.request(gameplayPresentation(stateRef.current, profile, true).controls.reset)) return;
    setCue(''); dispatch({ type: 'Reset', atMs: sessionTime() });
  }, [resetGuard, sessionTime, dispatch]);
  const formatVolume = useCallback((units: VolumeUnit) => formatVolumeUnits(units, volumeDisplay), []);
  useEffect(() => {
    resetGuard.settled();
    if (attemptKey > 0) pourButton.current?.focus({ preventScroll: true });
  }, [attemptKey, resetGuard]);
  useEffect(() => {
    let active = true;
    void registerOfflineShell(visuals, scene).then(status => { if (active) setShellStatus(status); });
    return () => { active = false; };
  }, [scene]);
  useEffect(() => {
    if (volume === profile.capacityUnits && ui.mixing && !ui.terminal) shakeButton.current?.focus({ preventScroll: true });
  }, [volume, ui.mixing, ui.terminal]);
  useEffect(() => {
    if (mix.garnishId && !ui.terminal) serveButton.current?.focus({ preventScroll: true });
  }, [mix.garnishId, ui.terminal]);
  const focusedResult = useRef(state.result);
  useEffect(() => {
    if (!state.result) { focusedResult.current = null; return; }
    if (hasReaction && focusedResult.current !== state.result) {
      focusedResult.current = state.result; resultTitle.current?.focus({ preventScroll: true });
    } else if (reveal.stage === 'tasting') skipButton.current?.focus({ preventScroll: true });
  }, [state.result, hasReaction, reveal.stage]);
  const soundedResult = useRef(state.result), seenEvents = useRef(0);
  useEffect(() => {
    const added = state.session.history.slice(seenEvents.current); seenEvents.current = state.session.history.length;
    for (const event of added) {
      const sound = soundByEvent[event.type]; if (sound) silentPresentationAudio.cue(sound);
      if (event.type === 'PourEnded' || event.type === 'ShakeEnded' || event.type === 'Reset') silentPresentationAudio.stop();
      if (event.type === 'IceAdded') setCue(playerCopy.ice.accepted);
      if (event.type === 'GarnishChanged') setCue(playerCopy.garnish.accepted);
      if (event.type === 'Reset') setCue('');
    }
    if (state.result?.failed && soundedResult.current !== state.result) {
      soundedResult.current = state.result; silentPresentationAudio.cue('failure');
    }
  }, [state.session.history, state.result]);
  useEffect(() => {
    if (!state.result) { soundedResult.current = null; return; }
    if (hasReaction && !state.result.failed && soundedResult.current !== state.result) {
      soundedResult.current = state.result;
      silentPresentationAudio.cue(mappedReaction === 'lab.rough' ? 'resultNegative' : 'resultPositive');
    }
  }, [state.result, hasReaction, mappedReaction]);
  useEffect(() => primeSceneVisuals(visuals, scene, import.meta.env.BASE_URL), [scene]);
  const environment = visuals.environments[scene.environmentId], counter = visuals.counters[scene.counterId];
  if (!bartender || !environment || !counter) throw new Error('Missing active scene content');
  const diagnostics = { phase: ui.phase, pour: ui.pourFeedback, risk: ui.risk, result: reveal.stage, reduced: reducedMotion };
  return <VisualAssetsProvider catalog={visuals}>
    <div className="app-shell" data-reduced-motion={reducedMotion}>
      <header className="topbar">
        <a className="brand" href="./" aria-label="Shaker-Chaos, pagina iniziale"><span className="brand-icon" aria-hidden="true">✳</span><span>SHAKER<span className="brand-dash">—</span>CHAOS</span></a>
        <div className="player-tools"><PlayerHUD snapshot={playerSnapshot} />
          <button type="button" className="collection-button" disabled={ui.pouring || ui.shaking} onClick={() => setCollectionOpen(true)}>Collezione</button>
          <span className="connection"><i aria-hidden="true" />{shellLabels[shellStatus]}</span></div>
      </header>
      <main>
        <div className="intro"><div><p className="eyebrow">IL TUO PICCOLO LABORATORIO AL BANCO</p><h1>Un po’ di ritmo. <em>Un po’ di caos.</em></h1></div><p>Tre ingredienti. Un nuovo esperimento.</p></div>
        {compatLab && CompatibilityLab && <Suspense fallback={null}><CompatibilityLab currentSession={state.session} /></Suspense>}
        {assetLab && AssetLab && <Suspense fallback={null}><AssetLab loadout={loadout} visuals={visuals} ingredientIds={scene.ingredientIds} onChange={setPreviewLoadout} /></Suspense>}
        {tuningLab && TuningInspector && <Suspense fallback={null}><TuningInspector profile={profile} presentation={diagnostics}
          motionPreview={motionPreview} onMotionPreview={setMotionPreview} /></Suspense>}
        {progressionLab && ProgressionLab && <Suspense fallback={null}><ProgressionLab controller={player} snapshot={playerSnapshot} onReset={() => {
          dispatch({ type: 'Reset', atMs: sessionTime() }); setPreviewLoadout(null); setPlayer(createBrowserPlayer());
        }} /></Suspense>}
        {collectionOpen && <Collection profile={playerSnapshot.profile} visuals={visuals} onEquip={equip} onClose={() => setCollectionOpen(false)} />}
        <GameStage environment={environment} debug={visualDebug} diagnostics={diagnostics} failed={state.view.failed}>
          <BottleShelf loadout={loadout} ingredients={catalog.ingredients} visuals={visuals} mix={mix} selectedId={selectedId}
            disabled={!ui.controls.ingredient} pourFeedback={ui.pourFeedback} onSelect={setSelectedId} formatVolume={formatVolume} />
          <BartenderArea loadout={loadout} bartender={bartender} visuals={visuals} reactionId={reactionId} pose={pose}
            working={ui.pouring ? 'pouring' : ui.shaking ? 'shaking' : 'idle'} attemptKey={attemptKey} reducedMotion={reducedMotion} lastResort={visuals.bartenders[initialScene.bartenderId]!.idle} />
          <ReactionOverlay title={title} line={line} terminal={ui.terminal} anticipating={anticipating} />
          <CounterArea assetId={counter.surface} fit={counter.fit}>
            <MixingStation mix={mix} volume={volume} capacity={profile.capacityUnits} maximumIce={profile.ice.maximumActions} visuals={visuals}
              formatVolume={formatVolume} shaking={ui.shaking} served={ui.terminal && !state.view.failed} failed={state.view.failed}
              pourFeedback={ui.pourFeedback} risk={ui.risk} attemptKey={attemptKey} />
            <ControlsArea>
              <RoundProgress phase={ui.phase} />
              {ui.terminal ? <div className="round-finish"><strong>{state.view.failed ? 'Un po’ troppo entusiasmo!' : 'Il tuo giro è completo.'}</strong>
                <p>{anticipating ? playerCopy.tasting.status : playerCopy.nextRound}</p>
              </div> : <>
                <p className="phase-status" role="status">{ui.instruction}</p>
                <div className="mix-controls">
                  <HoldButton label={`Versa ${selected?.name ?? 'ingrediente'}: tieni premuto`} className="pour-button" buttonRef={pourButton}
                    disabled={!ui.controls.pour} clock={sessionTime} ownership={holdOwnership}
                    onAction={pourAction} onStart={beginPour} onEnd={endPour} resetToken={attemptKey}>
                    <AssetImage assetId={visuals.controls.pour} /><strong>Versa</strong>
                    <small>{ui.pourFeedback === 'idle' ? selected?.shortLabel.toLowerCase() : playerCopy.pour[ui.pourFeedback]}</small>
                  </HoldButton>
                  <HoldButton label="Agita: tieni premuto" className="shake-button" buttonRef={shakeButton} disabled={!ui.controls.shake} clock={sessionTime} ownership={holdOwnership}
                    onAction={shakeAction} onStart={beginShake} onEnd={endShake} resetToken={attemptKey}>
                    <AssetImage assetId={visuals.controls.shake} /><strong>Agita</strong><small>{ui.shaking ? 'Si agita!' : 'tieni premuto'}</small>
                  </HoldButton>
                </div>
                <div className="extras">
                  <button type="button" className={mix.iceUnits === profile.ice.maximumActions ? 'is-complete' : ''} disabled={!ui.mixing}
                    aria-disabled={!ui.controls.ice} aria-label={'Ghiaccio, ' + mix.iceUnits + ' di ' + profile.ice.maximumActions}
                    onClick={() => {
                      if (!ui.controls.ice) { setCue(playerCopy.ice.maximum); return; }
                      dispatch({ type: 'IceAdded', requestedUnits: 1, atMs: sessionTime() });
                    }}>
                    <AssetImage assetId={visuals.gameplay.ice} />Ghiaccio <b>{mix.iceUnits}/{profile.ice.maximumActions}</b>
                  </button>
                  <button type="button" className={mix.garnishId ? 'is-complete' : ''} disabled={!ui.controls.garnish} aria-pressed={!!mix.garnishId}
                    aria-label={mix.garnishId ? playerCopy.garnish.added : 'Aggiungi agrume, dopo aver agitato'} onClick={() =>
                      dispatch({ type: 'GarnishChanged', garnishId: profile.garnish.id, atMs: sessionTime() })}>
                    <AssetImage assetId={visuals.gameplay.garnish} />Agrume <b>{mix.garnishId ? '✓' : '+'}</b>
                  </button>
                </div>
                <div className="serve-row">
                  <button type="button" className="serve-button" ref={serveButton} disabled={!ui.controls.serve}
                    onClick={() => dispatch({ type: 'Served', atMs: sessionTime() })}><span>Servi il mix</span><AssetImage assetId={visuals.controls.serve} /></button>
                  <button type="button" className="reset-button" aria-label={playerCopy.reset} disabled={!ui.controls.reset} onClick={newDrink}><AssetImage assetId={visuals.controls.reset} /></button>
                </div>
                {state.view.shakeCount > 0 && <p className="shake-risk" data-risk={ui.risk} role="status">
                  <span aria-hidden="true">{ui.risk === 'danger' ? '!' : ui.risk === 'risky' ? '≈' : '✦'}</span>{playerCopy.risk[ui.risk]}
                </p>}
                <p id="hold-help" className="hold-hint">{playerCopy.holdHelp}</p>
                <p className="play-feedback" key={cue} aria-live="polite">{cue}</p>
              </>}
            </ControlsArea>
          </CounterArea>
          <ScoreHUD result={state.result} stage={reveal.stage} title={finalCopy.title} ingredients={catalog.ingredients} profile={profile}
            titleRef={resultTitle} skipRef={skipButton} onSkip={reveal.skip} onNewDrink={newDrink}
            reward={playerSnapshot.reward && reveal.stage === 'breakdown' ? <RewardPresentation reward={playerSnapshot.reward} visuals={visuals} /> : null} />
        </GameStage>
      </main>
      <footer><span>Un progetto indipendente. Forme originali, un mix alla volta.</span><span>SHAKER-CHAOS</span></footer>
    </div>
  </VisualAssetsProvider>;
}
