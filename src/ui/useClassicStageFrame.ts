import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { classicLandscape, classicStageVariables, fitClassicStage } from './classicStageLayout.ts';
/** Only frame changes are measured. No polling, gameplay dependency or per-tick DOM read. */
export function useClassicStageFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => {
      if (!classicLandscape(window.innerWidth, window.innerHeight)) { setScale(1); return; }
      const fitted = fitClassicStage(frame.clientWidth, frame.clientHeight);
      if (fitted) setScale(fitted.scale);
    };
    const observer = new ResizeObserver(update); observer.observe(frame);
    window.addEventListener('resize', update); update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  const variables = useMemo(() => classicStageVariables(scale), [scale]);
  return { frameRef, variables, scale };
}
