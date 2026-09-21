import type { WellbeingDimension } from '@/types';

/**
 * The five things the day-5 check asks about — single source of truth, same
 * pattern as pillars.ts / focusQuestions.ts / points.ts.
 *
 * Every scale reads WORST → BEST so "has it moved?" is a subtraction, never a
 * per-dimension special case. That's why stress runs Wired → Calm rather than
 * low-to-high: a mixed-direction scale turns the movement summary into five
 * conditionals and one of them will be wrong.
 *
 * The stops are words, not numbers, and every one of them describes the GUEST.
 * None of them grades Gwinganna. That is the whole difference between this and
 * "rate our facilities 1–5" — a number invites a score, a word invites an
 * honest answer, and there's nothing here for the retreat to score well on.
 */
export interface WellbeingScale {
  id: WellbeingDimension;
  label: string;
  /** Ordered stop labels, index 0–4. Index 0 is the hardest place to be. */
  stops: [string, string, string, string, string];
}

export const WELLBEING_SCALES: WellbeingScale[] = [
  {
    id: 'sleep',
    label: 'Sleep',
    stops: ['Broken', 'Restless', 'Patchy', 'Solid', 'Deep'],
  },
  {
    id: 'energy',
    label: 'Energy',
    stops: ['Empty', 'Flat', 'Steady', 'Strong', 'Full'],
  },
  {
    id: 'stress',
    label: 'Stress',
    stops: ['Wired', 'Tense', 'Manageable', 'Settled', 'Calm'],
  },
  {
    id: 'movement',
    label: 'Movement',
    stops: ['None', 'Rarely', 'Some days', 'Most days', 'Every day'],
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    stops: ['Scattered', 'Hit and miss', 'Half and half', 'Mostly good', 'Deliberate'],
  },
];

/** Day of reintegration the check opens on. Before this it doesn't exist. */
export const WELLBEING_CHECK_DAY = 5;

/** Look up a scale's stop word — components never index the array themselves. */
export function stopLabel(id: WellbeingDimension, index: number): string {
  const scale = WELLBEING_SCALES.find((s) => s.id === id);
  return scale?.stops[index] ?? '';
}
