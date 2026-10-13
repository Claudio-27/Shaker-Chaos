import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ClassicScoreResult } from '../domain/classicScoring.ts';
import { observeReducedMotion } from '../platform/reducedMotion.ts';
import { createResultPresentation } from './resultPresentation.ts';
import type { ResultPresentation } from './resultPresentation.ts';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => observeReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)'), setReduced), []);
  return reduced;
}
export function useResultReveal(result: ClassicScoreResult | null, attemptKey: number, reduced: boolean) {
  const [view, setView] = useState<ResultPresentation>({ result: null, attemptKey: 0, stage: 'idle' });
  const controller = useMemo(() => createResultPresentation({
    after: (delay, callback) => window.setTimeout(callback, delay),
    cancel: id => window.clearTimeout(id),
  }, setView), []);
  useEffect(() => { controller.observe(result, attemptKey, reduced); }, [controller, result, attemptKey, reduced]);
  useEffect(() => () => controller.dispose(), [controller]);
  // A new frozen result cannot flash early during the render preceding the effect.
  const stage = view.result === result && view.attemptKey === attemptKey ? view.stage
    : result ? result.failed || reduced ? 'breakdown' : 'tasting' : 'idle';
  const skip = useCallback(() => { controller.observe(result, attemptKey, reduced); controller.skip(); }, [controller, result, attemptKey, reduced]);
  return { stage, skip };
}
