import type { OperationEndReason } from '../domain/session.ts';
export type HoldSource = { readonly kind: 'pointer'; readonly id: number } | { readonly kind: 'keyboard'; readonly key: string } | { readonly kind: 'assistive' };
export interface HoldCallbacks {
  readonly onStart: (atMs: number) => void;
  readonly onAction: (atMs: number) => void;
  readonly onEnd: (reason: OperationEndReason, atMs: number) => void;
}
export interface HoldScheduler {
  readonly start: (callback: () => void, intervalMs: number) => number;
  readonly stop: (id: number) => void;
}
export function createHoldController(clock: () => number, scheduler: HoldScheduler, callbacks: HoldCallbacks, intervalMs = 25) {
  let source: HoldSource | null = null, timer: number | null = null, generation = 0;
  const matching = (other: HoldSource) => source?.kind === other.kind &&
    (source.kind !== 'pointer' || (other.kind === 'pointer' && source.id === other.id)) &&
    (source.kind !== 'keyboard' || (other.kind === 'keyboard' && source.key === other.key));
  const cancel = (reason: OperationEndReason = 'cancelled') => {
    if (!source) return;
    source = null; generation++;
    if (timer !== null) scheduler.stop(timer);
    timer = null;
    const atMs = clock();
    callbacks.onAction(atMs); // Flush elapsed time on release/cancellation; no extra tick is invented.
    callbacks.onEnd(reason, atMs);
  };
  return {
    start(next: HoldSource) {
      if (source) return false;
      source = next; const token = ++generation;
      callbacks.onStart(clock());
      timer = scheduler.start(() => { if (source && token === generation) callbacks.onAction(clock()); }, intervalMs);
      return true;
    },
    stop(next: HoldSource, reason: OperationEndReason = 'completed') { if (matching(next)) cancel(reason); },
    cancel,
    isRunning: () => source !== null,
  };
}
export function bindHoldInterruptions(controller: Pick<ReturnType<typeof createHoldController>, 'cancel'>,
  surface: EventTarget, page: EventTarget & { readonly hidden: boolean }) {
  const interrupted = () => controller.cancel('cancelled');
  const visibility = () => { if (page.hidden) interrupted(); };
  surface.addEventListener('blur', interrupted);
  page.addEventListener('visibilitychange', visibility);
  return () => {
    surface.removeEventListener('blur', interrupted);
    page.removeEventListener('visibilitychange', visibility);
    controller.cancel('cancelled');
  };
}
