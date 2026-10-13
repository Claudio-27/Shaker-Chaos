import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { HoldCallbacks } from '../platform/holdController.ts';
import { bindHoldInterruptions, createHoldController } from '../platform/holdController.ts';

interface HoldButtonProps extends HoldCallbacks {
  readonly clock: () => number;
  readonly resetToken: number;
  readonly disabled: boolean;
  readonly className?: string;
  readonly children: ReactNode;
  readonly label: string;
}
/** Mouse, touch and keyboard share one elapsed-time controller and one domain adapter. */
export function HoldButton({ clock, onStart, onAction, onEnd, resetToken, disabled, className = '', children, label }: HoldButtonProps) {
  const callbacks = useRef({ onStart, onAction, onEnd });
  callbacks.current = { onStart, onAction, onEnd };
  const [holding, setHolding] = useState(false);
  const controller = useMemo(() => createHoldController(clock, {
    start: (callback, interval) => window.setInterval(callback, interval), stop: id => window.clearInterval(id),
  }, {
    onStart: atMs => { setHolding(true); callbacks.current.onStart(atMs); },
    onAction: atMs => callbacks.current.onAction(atMs),
    onEnd: (reason, atMs) => { setHolding(false); callbacks.current.onEnd(reason, atMs); },
  }), [clock]);
  useEffect(() => { if (disabled) controller.cancel('limit'); }, [disabled, controller]);
  useEffect(() => { controller.cancel('reset'); }, [resetToken, controller]);
  useEffect(() => bindHoldInterruptions(controller, window, document), [controller]);
  return <button type="button" aria-label={label} disabled={disabled}
    className={`hold-button ${className} ${holding ? 'is-held' : ''}`}
    onPointerDown={event => {
      if (event.button !== 0 || disabled) return;
      event.preventDefault(); event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      controller.start({ kind: 'pointer', id: event.pointerId });
    }}
    onPointerUp={event => {
      controller.stop({ kind: 'pointer', id: event.pointerId });
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }}
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
    onContextMenu={event => event.preventDefault()}>{children}</button>;
}
