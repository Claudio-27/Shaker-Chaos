import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { PlayerPhase, PourFeedback, ShakeRisk } from './gameplayPresentation.ts';
import type { ResultStage } from './resultPresentation.ts';
export interface PresentationDiagnostics {
  readonly phase: PlayerPhase; readonly pour: PourFeedback; readonly risk: ShakeRisk;
  readonly result: ResultStage; readonly reduced: boolean;
}
export function VisualDebug({ stageRef, presentation }: {
  readonly stageRef: RefObject<HTMLElement | null>; readonly presentation: PresentationDiagnostics;
}) {
  const [info, setInfo] = useState('');
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const bounds = stage.getBoundingClientRect();
      const composition = getComputedStyle(stage).getPropertyValue('--composition').trim().replaceAll('"', '');
      setInfo(`${window.innerWidth}×${window.innerHeight} · scena ${Math.round(bounds.width)}×${Math.round(bounds.height)} · ${composition} · DPR ${window.devicePixelRatio.toFixed(2)}`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(stage); window.addEventListener('resize', update); update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [stageRef]);
  if (!import.meta.env.DEV) return null;
  return <aside className="visual-debug-info" aria-label="Diagnostica composizione">{info}<br />Zone · area sicura · hitbox (anteprima shaker non interattiva)<br />
    Presentation · {presentation.phase} / {presentation.pour} / {presentation.risk} / {presentation.result} / reduced {String(presentation.reduced)}
  </aside>;
}
