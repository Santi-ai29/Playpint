import type { RoundClock } from "../../../../../packages/contracts/src";

export function createRoundTimerModel(
  clock: RoundClock,
  now: Date | string | number,
): {
  remainingSeconds: number;
  isExpired: boolean;
  progress: number;
} {
  const nowMs = toDate(now).getTime();
  const startsAtMs = Date.parse(clock.startsAt);
  const endsAtMs = Date.parse(clock.endsAt);
  const durationMs = Math.max(1, endsAtMs - startsAtMs);
  const remainingMs = Math.max(0, endsAtMs - nowMs);
  const elapsedMs = Math.min(durationMs, Math.max(0, nowMs - startsAtMs));

  return {
    remainingSeconds: Math.ceil(remainingMs / 1000),
    isExpired: remainingMs <= 0,
    progress: elapsedMs / durationMs,
  };
}

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}
