import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { PlayerPhase, PourFeedback, ShakeRisk } from './gameplayPresentation.ts';
import type { ResultStage } from './resultPresentation.ts';
import { BARTENDER_ANCHOR, BARTENDER_BOUNDS, BOTTLE_SHELF_BOUNDS, COUNTER_BOUNDS, GRID_STEP, HUD_BOUNDS, MESSAGE_PANEL_BOUNDS, MIXING_BOUNDS, PRIMARY_ACTION_ANCHORS, PRIMARY_BUTTON_BOUNDS, STAGE_HEIGHT, STAGE_LAYERS, STAGE_WIDTH, bottleSlot, interactionBounds } from './classicStageLayout.ts';
export interface PresentationDiagnostics {
  readonly phase: PlayerPhase; readonly pour: PourFeedback; readonly risk: ShakeRisk;
  readonly result: ResultStage; readonly reduced: boolean;
}
export function VisualDebug({ stageRef, presentation, scale = 1 }: {
  readonly stageRef: RefObject<HTMLElement | null>; readonly presentation: PresentationDiagnostics; readonly scale?: number;
}) {
  const [info, setInfo] = useState(''), [geometry, setGeometry] = useState(false);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const bounds = stage.getBoundingClientRect();
      const composition = getComputedStyle(stage).getPropertyValue('--composition').trim().replaceAll('"', '');
      setInfo(`${window.innerWidth}×${window.innerHeight} · scena ${Math.round(bounds.width)}×${Math.round(bounds.height)} · ${composition} · scala ${scale.toFixed(3)}`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(stage); window.addEventListener('resize', update); update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [stageRef, scale]);
  if (!import.meta.env.DEV) return null;
  const regions = { shelf: BOTTLE_SHELF_BOUNDS, host: BARTENDER_BOUNDS, counter: COUNTER_BOUNDS, mixing: MIXING_BOUNDS, message: MESSAGE_PANEL_BOUNDS, HUD: HUD_BOUNDS };
  return <>
    <aside className="visual-debug-info" style={{ top: 38, bottom: 'auto', left: 8, fontSize: 6, padding: 3, maxWidth: 380, zIndex: STAGE_LAYERS.debug }} aria-label="Diagnostica composizione">
      {info}<br />Presentation · {presentation.phase} / {presentation.pour} / {presentation.risk} / {presentation.result} / reduced {String(presentation.reduced)}<br />
      <label style={{ display: 'flex', alignItems: 'center', minHeight: 44 / scale, pointerEvents: 'auto' }}><input type="checkbox" checked={geometry} onChange={event => setGeometry(event.target.checked)} />Griglia classica 600×440</label>
    </aside>
    {geometry && <svg viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`} data-classic-geometry="CLASSIC_STAGE_GEOMETRY_DEV_ONLY" aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: STAGE_LAYERS.debug, pointerEvents: 'none', overflow: 'visible' }}>
      <defs><pattern id="classic-stage-grid" width={GRID_STEP} height={GRID_STEP} patternUnits="userSpaceOnUse"><path d={`M${GRID_STEP} 0H0V${GRID_STEP}`} fill="none" stroke="#d5f4ff" strokeWidth={.4} /></pattern></defs>
      <rect width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="url(#classic-stage-grid)" stroke="#ffcc42" />
      {Array.from({ length: Math.floor(STAGE_WIDTH / GRID_STEP) + 1 }, (_, n) => <text key={'x' + n} x={n * GRID_STEP + 1} y={5} fontSize={5} fill="#fff">{n * GRID_STEP}</text>)}
      {Array.from({ length: Math.floor(STAGE_HEIGHT / GRID_STEP) + 1 }, (_, n) => <text key={'y' + n} x={1} y={n * GRID_STEP + 5} fontSize={5} fill="#fff">{n * GRID_STEP}</text>)}
      {Object.entries(regions).map(([name, bounds]) => <g key={name}><rect {...bounds} fill="none" stroke="#f5d159" strokeWidth={.7} /><text x={bounds.x + 2} y={bounds.y + 7} fontSize={6} fill="#fff">{name} {bounds.x},{bounds.y} {bounds.width}×{bounds.height}</text></g>)}
      {Object.entries(PRIMARY_BUTTON_BOUNDS).map(([name, bounds]) => <g key={name}><rect {...bounds} fill="none" stroke="#f783e0" strokeWidth={1} /><rect {...interactionBounds(bounds, scale)} fill="none" stroke="#96f6ff" strokeDasharray="2 2" strokeWidth={.6} /></g>)}
      {Array.from({ length: 4 }, (_, index) => <rect key={index} {...bottleSlot(index).target} fill="none" stroke="#96f6ff" strokeDasharray="2 2" strokeWidth={.6} />)}
      {Object.entries(PRIMARY_ACTION_ANCHORS).map(([key, anchor]) => <circle key={key} cx={anchor.x} cy={anchor.y} r={2} fill="#ffcc42" />)}
      <line x1={BARTENDER_BOUNDS.x} x2={BARTENDER_BOUNDS.x + BARTENDER_BOUNDS.width} y1={BARTENDER_ANCHOR.baseline} y2={BARTENDER_ANCHOR.baseline} stroke="#f783e0" strokeWidth={1} />
    </svg>}
  </>;
}
