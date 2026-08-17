import type { Pillar, PillarId } from '@/types';

/**
 * The Pillars — single source of truth for copy, accent and order.
 * Components must read from here; never hard-code pillar strings.
 *
 * Canonical wording is taken from the Aug '26 founders-deck update (four
 * pillars over two bands). Labels stay short and member-facing; the deck's
 * longer framework phrasing lives in the taglines. Keep the order below —
 * it's the shipped app order (sleep last, despite the deck listing it first).
 */
export const pillars: Pillar[] = [
  {
    id: 'nourishment',
    order: 1,
    label: 'Nourishment',
    tagline: 'Nutrition and hydration habits that stick',
    detail: [
      'Habits to take home — easing off coffee, booze, sugar, dairy and gluten',
      'Whole, organic food — nothing your body has to work around',
      'Mindful hydration — how much you drink, and when',
      'Saveable, shareable recipes from the retreat kitchen',
      'Goal windows to hold the line — 30 and 100 days',
    ],
    accent: '#C97B5A',
  },
  {
    id: 'movement',
    order: 2,
    label: 'Movement',
    tagline: 'Daily movement, solo or with your group',
    detail: [
      'Guided Chi Gong to start the day',
      'Yoga and tailored gym sessions',
      'Recovery through movement — mobility, stretching, active recovery',
      'A virtual PT — solo or with your group',
    ],
    accent: '#5C7470',
  },
  {
    id: 'emotional',
    order: 3,
    label: 'Emotional Wellbeing',
    tagline: 'Mindset, resilience and stress management',
    detail: [
      'Mindset (re)alignment',
      'Stress resilience and breathwork',
      'Strategic rest and digital detox',
      'Nervous-system regulation',
      'Immersion in nature',
    ],
    accent: '#8C7B9C',
  },
  {
    id: 'sleep',
    order: 4,
    label: 'Sleep',
    tagline: 'Sleep, rest and recovery — quality, quantity, consistency',
    detail: [
      'Support to establish better sleep quality',
      'Build the quantity and consistency, night to night',
      'Restorative practices — a wind-down that lets the day go',
    ],
    accent: '#5B6B8C',
  },
];

const byId = Object.fromEntries(pillars.map((p) => [p.id, p])) as Record<
  PillarId,
  Pillar
>;

/** Lookup a pillar by its stable id. */
export function getPillar(id: PillarId): Pillar {
  return byId[id];
}
