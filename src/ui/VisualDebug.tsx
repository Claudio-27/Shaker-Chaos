import type { EnvironmentVisualDefinition } from '../content/visualModel.ts';
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { PlayerPhase, PourFeedback, ShakeRisk } from './gameplayPresentation.ts';
import type { ResultStage } from './resultPresentation.ts';
import { BARTENDER_ANCHOR, BARTENDER_BOUNDS, BOTTLE_SHELF_BOUNDS, COUNTER_BOUNDS, GRID_STEP, HUD_BOUNDS, MESSAGE_PANEL_BOUNDS, MIXING_BOUNDS, PRIMARY_ACTION_ANCHORS, PRIMARY_BUTTON_BOUNDS, STAGE_HEIGHT, STAGE_LAYERS, STAGE_WIDTH, bottleSlot, interactionBounds } from './classicStageLayout.ts';
import { VISUAL_SAMPLES } from './classicVisualFraming.ts';
interface OpaqueDiagnostic { readonly id: string; readonly bounds: { x: number; y: number; width: number; height: number }; readonly detail: string }
export interface PresentationDiagnostics {
  readonly phase: PlayerPhase; readonly pour: PourFeedback; readonly risk: ShakeRisk;
  readonly result: ResultStage; readonly reduced: boolean;
}
export function VisualDebug({ stageRef, presentation, environment, scale = 1 }: {
  readonly environment: EnvironmentVisualDefinition; readonly stageRef: RefObject<HTMLElement | null>; readonly presentation: PresentationDiagnostics; readonly scale?: number;
}) {
  const [background, setBackground] = useState('');
  const [info, setInfo] = useState(''), [geometry, setGeometry] = useState(false);
  const [art, setArt] = useState<readonly OpaqueDiagnostic[]>([]);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const bounds = stage.getBoundingClientRect();
      const composition = getComputedStyle(stage).getPropertyValue('--composition').trim().replaceAll('"', '');
      setArt(Array.from(stage.querySelectorAll<SVGSVGElement | HTMLImageElement>('[data-visual-framing]')).filter(image => !image.closest('.character-body') || getComputedStyle(image.closest('.character-body')!).visibility !== 'hidden').flatMap(image => {
        const id = image.dataset.resolvedAsset!, measured = VISUAL_SAMPLES[id];
        if (!measured) return [];
        const rect = image.getBoundingClientRect(), unit = bounds.width / STAGE_WIDTH;
        const factor = rect.height / unit / measured.source.height;
        const visible = { x: (rect.x - bounds.x) / unit + measured.opaque.x * factor, y: (rect.y - bounds.y) / unit + measured.opaque.y * factor, width: measured.opaque.width * factor, height: measured.opaque.height * factor };
        return [{ id, bounds: visible, detail: id + ' · source ' + measured.source.width + '×' + measured.source.height + ' · canvas ' + (rect.width / unit).toFixed(1) + '×' + (rect.height / unit).toFixed(1) + ' · opaque ' + visible.width.toFixed(1) + '×' + visible.height.toFixed(1) + ' · anchor ' + (visible.x + visible.width / 2).toFixed(1) + ',' + (visible.y + visible.height).toFixed(1) + ' · scale ' + factor.toFixed(4) }];
      }));
      const image = stage.querySelector<SVGSVGElement>('.environment-background');
      const resolved = image?.dataset.resolvedAsset;
      setBackground(environment.id + ' · Background visual: ' + (resolved === environment.backgroundClean ? 'CLEAN' : 'LEGACY') + ' · Fallback: ' + (environment.backgroundClean && environment.background ? 'available' : 'none') + ' · ' + (image?.dataset.runtimePath ?? 'SVG'));
      setInfo(`${window.innerWidth}×${window.innerHeight} · scena ${Math.round(bounds.width)}×${Math.round(bounds.height)} · ${composition} · scala ${scale.toFixed(3)}`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    const mutation = new MutationObserver(update); mutation.observe(stage, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'data-resolved-asset', 'data-served'] });
    window.addEventListener('resize', update); update();
    return () => { observer.disconnect(); mutation.disconnect(); window.removeEventListener('resize', update); };
  }, [stageRef, scale, environment]);
  if (!import.meta.env.DEV) return null;
  const regions = { shelf: BOTTLE_SHELF_BOUNDS, host: BARTENDER_BOUNDS, counter: COUNTER_BOUNDS, mixing: MIXING_BOUNDS, message: MESSAGE_PANEL_BOUNDS, HUD: HUD_BOUNDS };
  return <>
    <aside className="visual-debug-info" style={{ top: 38, bottom: 'auto', left: 8, fontSize: 6, padding: 3, maxWidth: 380, zIndex: STAGE_LAYERS.debug }} aria-label="Diagnostica composizione">
      {info}<br /><span data-background-diagnostic="CLEAN_ENVIRONMENT_DIAGNOSTIC_DEV_ONLY">{background}</span><br />Presentation · {presentation.phase} / {presentation.pour} / {presentation.risk} / {presentation.result} / reduced {String(presentation.reduced)}<br />
      <label style={{ display: 'flex', alignItems: 'center', minHeight: 44 / scale, pointerEvents: 'auto' }}><input type="checkbox" checked={geometry} onChange={event => setGeometry(event.target.checked)} />Griglia classica 600×440</label>
      <a href="?visualDebug=1&classicExact=1" style={{ color: '#fff0bf', pointerEvents: 'auto' }}>Vista DEV 1:1 · 600×440 CSS px</a>
      <details style={{ maxHeight: 100, overflow: 'auto', pointerEvents: 'auto' }}><summary>Sagome opache e dimensioni</summary>{art.map(item => <p key={item.id}>{item.detail}</p>)}</details>
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
      {art.map(item => <g key={item.id}><rect {...item.bounds} fill="none" stroke="#8aff9e" strokeWidth={.8} /><line x1={item.bounds.x} x2={item.bounds.x + item.bounds.width} y1={item.bounds.y + item.bounds.height} y2={item.bounds.y + item.bounds.height} stroke="#ff845e" strokeWidth={1} /><circle cx={item.bounds.x + item.bounds.width / 2} cy={item.bounds.y + item.bounds.height} r={1.5} fill="#ff845e" /></g>)}
      <line x1={BARTENDER_BOUNDS.x} x2={BARTENDER_BOUNDS.x + BARTENDER_BOUNDS.width} y1={BARTENDER_ANCHOR.baseline} y2={BARTENDER_ANCHOR.baseline} stroke="#f783e0" strokeWidth={1} />
    </svg>}
  </>;
}
