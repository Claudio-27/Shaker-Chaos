/** The adapter reads a clock; the domain receives only explicit integer relative times. */
export function createSessionClock(now: () => number = () => performance.now()): () => number {
  const origin = now();
  if (!Number.isFinite(origin)) throw new RangeError('Clock origin must be finite');
  let previous = 0;
  return () => {
    const value = Math.max(previous, Math.floor(now() - origin));
    if (!Number.isSafeInteger(value)) throw new RangeError('Session time must be a safe integer');
    previous = value;
    return value;
  };
}
