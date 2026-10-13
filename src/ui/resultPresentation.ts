import type { ClassicScoreResult } from '../domain/classicScoring.ts';
import { resultRevealTiming } from '../content/playerExperience.ts';

export type ResultStage = 'idle' | 'tasting' | 'score' | 'reaction' | 'breakdown';
export interface ResultPresentation {
  readonly attemptKey: number;
  readonly result: ClassicScoreResult | null;
  readonly stage: ResultStage;
}
export interface RevealScheduler {
  readonly after: (delayMs: number, callback: () => void) => number;
  readonly cancel: (id: number) => void;
}
const stages: readonly ResultStage[] = ['idle', 'tasting', 'score', 'reaction', 'breakdown'];
export const scoreVisible = (stage: ResultStage) => stages.indexOf(stage) >= stages.indexOf('score');
export const reactionVisible = (stage: ResultStage) => stages.indexOf(stage) >= stages.indexOf('reaction');

/** Presentation-only timers. There is no scorer or gameplay callback in this boundary. */
export function createResultPresentation(scheduler: RevealScheduler, changed: (view: ResultPresentation) => void) {
  let view: ResultPresentation = Object.freeze({ attemptKey: 0, result: null, stage: 'idle' });
  let generation = 0;
  const timers = new Set<number>();
  const clear = () => { generation++; timers.forEach(scheduler.cancel); timers.clear(); };
  const publish = (stage: ResultStage) => { view = Object.freeze({ ...view, stage }); changed(view); };
  const skip = () => {
    if (!view.result || view.stage === 'breakdown') return;
    clear(); publish('breakdown');
  };
  return {
    observe(result: ClassicScoreResult | null, attemptKey: number, reducedMotion: boolean) {
      if (view.result === result && view.attemptKey === attemptKey) { if (reducedMotion) skip(); return; }
      clear();
      view = Object.freeze({ result, attemptKey, stage: result ? result.failed || reducedMotion ? 'breakdown' : 'tasting' : 'idle' });
      changed(view);
      if (!result || result.failed || reducedMotion) return;
      const token = generation;
      const queue = (delay: number, stage: ResultStage) => {
        const id = scheduler.after(delay, () => {
          timers.delete(id);
          if (generation === token && stages.indexOf(stage) > stages.indexOf(view.stage)) publish(stage);
        });
        timers.add(id);
      };
      queue(resultRevealTiming.tastingMs, 'score');
      queue(resultRevealTiming.tastingMs + resultRevealTiming.scoreMs, 'reaction');
      queue(resultRevealTiming.tastingMs + resultRevealTiming.scoreMs + resultRevealTiming.reactionMs, 'breakdown');
    },
    skip,
    dispose() { clear(); view = Object.freeze({ attemptKey: -1, result: null, stage: 'idle' }); },
    current: () => view,
  };
}
