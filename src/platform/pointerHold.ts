import type { HoldSource } from './holdController.ts';
export interface PointerCaptureTarget {
  readonly focus: (options: { preventScroll: boolean }) => void;
  readonly setPointerCapture: (id: number) => void;
  readonly hasPointerCapture: (id: number) => boolean;
  readonly releasePointerCapture: (id: number) => void;
}
export interface PointerHoldEvent {
  readonly button: number; readonly pointerId: number; readonly isPrimary: boolean;
  readonly currentTarget: PointerCaptureTarget; readonly preventDefault: () => void;
}
export interface PointerHoldController {
  readonly start: (source: HoldSource) => boolean;
  readonly cancel: (reason: 'cancelled') => void;
}
export interface OwnedPointerCapture { readonly element: PointerCaptureTarget; readonly pointerId: number }
/** Claim first: a rejected touch must not move focus or steal pointer capture. */
export function startPointerHold(controller: PointerHoldController, event: PointerHoldEvent, disabled: boolean): OwnedPointerCapture | null {
  if (event.button !== 0 || disabled) return null;
  event.preventDefault();
  if (!event.isPrimary || !controller.start({ kind: 'pointer', id: event.pointerId })) return null;
  event.currentTarget.focus({ preventScroll: true });
  try { event.currentTarget.setPointerCapture(event.pointerId); }
  catch { controller.cancel('cancelled'); return null; }
  return { element: event.currentTarget, pointerId: event.pointerId };
}
export function releasePointerHold(capture: OwnedPointerCapture | null) {
  if (capture?.element.hasPointerCapture(capture.pointerId)) capture.element.releasePointerCapture(capture.pointerId);
}
