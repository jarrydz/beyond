import type { Booking, JourneyStage, PrepTask } from '@/types';

/**
 * The simulated clock (PRD-05). Every date calculation in the journey reads
 * these helpers with the store's demoDayOffset — never `new Date()` directly —
 * so the stage switcher can move the whole app to a canonical day at once.
 */

const DAY_MS = 86_400_000;

/** Local midnight of a date — journey maths works in whole days, never hours. */
function midnight(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  return m;
}

function parseISODate(iso: string): Date {
  // 'YYYY-MM-DD' parses as UTC midnight; anchor it to local midnight instead.
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The journey's "today": real today (local midnight) + the demo offset. */
export function today(offset: number): Date {
  return new Date(midnight(new Date()).getTime() + offset * DAY_MS);
}

/** Whole days from today(offset) to an ISO date. Negative = already past. */
export function daysUntil(iso: string, offset: number): number {
  return Math.round((parseISODate(iso).getTime() - today(offset).getTime()) / DAY_MS);
}

/**
 * Derive the lifecycle stage — the single source of truth (decision 6: a
 * stored flag and a stored date will disagree within a week).
 * Any day before arrival with a booking is pre_retreat; the task unlock
 * gating handles anything earlier than T-21 gracefully.
 */
export function stageFor(booking: Booking | null, offset: number): JourneyStage {
  if (!booking) return 'member';
  const toArrival = daysUntil(booking.arrivalDate, offset);
  const toDeparture = daysUntil(booking.departureDate, offset);
  if (toArrival > 0) return 'pre_retreat';
  if (toDeparture >= 0) return 'on_retreat';
  if (toDeparture >= -14) return 'reintegration';
  return 'member';
}

/** 1-based day of the stay — "Day 2 of 5". */
export function dayOfStay(booking: Booking, offset: number): number {
  return 1 - daysUntil(booking.arrivalDate, offset);
}

/** Total nights-inclusive length of the stay, for "of 5". */
export function stayLength(booking: Booking): number {
  return Math.round(
    (parseISODate(booking.departureDate).getTime() - parseISODate(booking.arrivalDate).getTime()) /
      DAY_MS,
  );
}

/** 1-based day of reintegration — "Day 3 of your first 14." */
export function dayOfReintegration(booking: Booking, offset: number): number {
  return -daysUntil(booking.departureDate, offset);
}

/**
 * The demoDayOffset that lands the app `delta` days from a booking date —
 * how the stage switcher computes its canonical days.
 */
export function offsetForDate(iso: string, delta: number): number {
  return daysUntil(iso, 0) + delta;
}

/**
 * Whether a prep task is open. The T-21 trio (connect, meet your host,
 * goal + why) is not date-dependent, so it is available from the moment a
 * booking exists — a guest who books four months out installs the app at
 * peak motivation and must find something to do, not twelve locked rows
 * (JZ, 2026-08-17). The taper stays genuinely time-bound at T-7.
 */
export function isTaskUnlocked(task: Pick<PrepTask, 'unlocksAt'>, daysToArrival: number): boolean {
  return task.unlocksAt >= 21 || daysToArrival <= task.unlocksAt;
}
