import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { OperationEndReason } from '../domain/session.ts';

interface HoldButtonProps {
  readonly onStart: () => void;
  readonly onAction: () => void;
  readonly onEnd: (reason: OperationEndReason) => void;
  readonly resetToken: number;
  readonly intervalMs: number;
  readonly disabled: boolean;
  readonly className?: string;
  readonly children: ReactNode;
  readonly label: string;
}

/** Same UI gestures; operation boundaries are reported independently from discrete ticks. */
export function HoldButton({ onStart, onAction, onEnd, resetToken, intervalMs, disabled, className = '', children, label }: HoldButtonProps) {
  const timer = useRef<number | null>(null);
  const running = useRef(false);
  const callbacks = useRef({ onStart, onAction, onEnd });
  const [holding, setHolding] = useState(false);
  useEffect(() => { callbacks.current = { onStart, onAction, onEnd }; }, [onStart, onAction, onEnd]);
  const stop = useCallback((reason: OperationEndReason = 'completed') => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    const wasRunning = running.current;
    running.current = false;
    setHolding(false);
    if (wasRunning) callbacks.current.onEnd(reason);
  }, []);
  const start = () => {
    if (disabled || running.current) return;
    running.current = true;
    callbacks.current.onStart();
    callbacks.current.onAction();
    setHolding(true);
    timer.current = window.setInterval(() => callbacks.current.onAction(), intervalMs);
  };
  useEffect(() => { if (disabled) stop('limit'); }, [disabled, stop]);
  useEffect(() => { stop('reset'); }, [resetToken, stop]);
  useEffect(() => {
    const interrupted = () => stop('cancelled');
    const visibility = () => { if (document.hidden) interrupted(); };
    window.addEventListener('blur', interrupted);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
      if (running.current) {
        running.current = false;
        callbacks.current.onEnd('cancelled');
      }
      window.removeEventListener('blur', interrupted);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [stop]);
  return (
    <button type="button" aria-label={label} disabled={disabled}
      className={`hold-button ${className} ${holding ? 'is-held' : ''}`}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        start();
      }}
      onPointerUp={(event) => {
        stop();
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => stop('cancelled')} onLostPointerCapture={() => stop('cancelled')} onBlur={() => stop('cancelled')}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); if (!event.repeat) start(); }
      }}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); stop(); }
      }}
      onClick={(event) => {
        // Assistive activation still records a complete start/tick/end operation.
        if (event.detail === 0 && !disabled) { start(); stop(); }
      }}
      onContextMenu={(event) => event.preventDefault()}>
      {children}
    </button>
  );
}
