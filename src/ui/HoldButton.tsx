import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { HoldCallbacks, HoldOwnership } from '../platform/holdController.ts';
import { releasePointerHold, startPointerHold } from '../platform/pointerHold.ts';
import type { OwnedPointerCapture } from '../platform/pointerHold.ts';
import { bindHoldInterruptions, createHoldController } from '../platform/holdController.ts';

interface HoldButtonProps extends HoldCallbacks {
  readonly clock: () => number;
  readonly ownership: HoldOwnership;
  readonly resetToken: number;
  readonly disabled: boolean;
  readonly className?: string;
  readonly children: ReactNode;
  readonly label: string;
  readonly hint?: string;
  readonly buttonRef?: RefObject<HTMLButtonElement | null>;
}
/** One owner across both controls, before capture/focus. Rejected touches cannot steal either. */
export function HoldButton({ clock, ownership, onStart, onAction, onEnd, resetToken, disabled, className = '', children, label, hint, buttonRef }: HoldButtonProps) {
  const hintId=useId();
  const callbacks = useRef({ onStart, onAction, onEnd });
  callbacks.current = { onStart, onAction, onEnd };
  const captured = useRef<OwnedPointerCapture | null>(null);
  const [holding, setHolding] = useState(false);
  const controller = useMemo(() => createHoldController(clock, {
    start: (callback, interval) => window.setInterval(callback, interval), stop: id => window.clearInterval(id),
  }, {
    onStart: atMs => { setHolding(true); callbacks.current.onStart(atMs); },
    onAction: atMs => callbacks.current.onAction(atMs),
    onEnd: (reason, atMs) => {
      const capture = captured.current; captured.current = null;
      releasePointerHold(capture);
      setHolding(false); callbacks.current.onEnd(reason, atMs);
    },
  }, 25, ownership), [clock, ownership]);
  useEffect(() => { if (disabled) controller.cancel('limit'); }, [disabled, controller]);
  useEffect(() => { controller.cancel('reset'); }, [resetToken, controller]);
  useEffect(() => bindHoldInterruptions(controller, window, document), [controller]);
  return <button type="button" ref={buttonRef} aria-label={label} aria-describedby={hint?'hold-help '+hintId:'hold-help'} title={hint} aria-pressed={holding} disabled={disabled}
    data-hold-state={holding ? 'active' : 'idle'} className={`hold-button ${className} ${holding ? 'is-held' : ''}`}
    onPointerDown={event => {
      const capture = startPointerHold(controller, event, disabled);
      if (capture) captured.current = capture;
    }}
    onPointerUp={event => controller.stop({ kind: 'pointer', id: event.pointerId })}
    onPointerCancel={event => controller.stop({ kind: 'pointer', id: event.pointerId }, 'cancelled')}
    onLostPointerCapture={event => controller.stop({ kind: 'pointer', id: event.pointerId }, 'cancelled')}
    onBlur={() => controller.cancel('cancelled')}
    onKeyDown={event => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault(); if (!disabled && !event.repeat) controller.start({ kind: 'keyboard', key: event.key });
      }
    }}
    onKeyUp={event => {
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); controller.stop({ kind: 'keyboard', key: event.key }); }
    }}
    onClick={event => {
      if (event.detail === 0 && !disabled) { controller.start({ kind: 'assistive' }); controller.stop({ kind: 'assistive' }); }
    }}
    onContextMenu={event => event.preventDefault()}>{children}{hint&&<span id={hintId} hidden>{hint}</span>}</button>;
}
