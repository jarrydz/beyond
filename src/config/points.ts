import type { PointsAction } from '@/types';

/** Earn actions — every PointsAction except the PRD-03 debit side. */
export type EarnAction = Exclude<PointsAction, 'marketplace_spend'>;

/**
 * Points — single source of truth for earn values.
 * Mirrors the pillars.ts pattern: services/components read from here,
 * never hard-code point amounts at call sites.
 *
 * Design intent: reward MEANINGFUL wellbeing actions, transparently.
 * No time-in-app rewards, no variable/random payouts, no dark patterns.
 * Rationale: the check-in is the habit spine so it pays little-and-often;
 * goals pay big because they're the real outcome; saves are a nudge.
 */
export const AWARDS: Record<EarnAction, number> = {
  daily_check_in: 10,
  content_complete: 15,
  save_recipe: 5,
  goal_30_day: 50,
  goal_100_day: 150,
  meal_delivery_interest: 5, // PRD-04 — wired when that ships
};

/** Human labels for the earn-history log. */
export const ACTION_LABELS: Record<PointsAction, string> = {
  daily_check_in: 'Daily check-in',
  content_complete: 'Completed a session',
  save_recipe: 'Saved a recipe',
  goal_30_day: '30-day goal reached',
  goal_100_day: '100-day goal reached',
  meal_delivery_interest: 'Joined the meal-delivery list',
  marketplace_spend: 'Marketplace redemption',
};

/** The single v1 milestone — one mechanic only, resist a badge zoo. */
export const STREAK = {
  action: 'daily_check_in' as PointsAction,
  days: 3,
  bonus: 25,
  label: '3-day check-in streak',
};
