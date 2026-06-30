import type { Pillar, PillarId } from '@/types';

/**
 * The Five Pillars — single source of truth for copy, accent and order.
 * Components must read from here; never hard-code pillar strings.
 *
 * Canonical wording is taken from the per-pillar detail slides of the June '26
 * founders deck (the page-5 grid swaps the Emotional/Sleep blurbs — ignored here).
 * Keep the order below; it's the deck order.
 */
export const pillars: Pillar[] = [
  {
    id: 'nourishment',
    order: 1,
    label: 'Nourishment',
    tagline: 'Take-home dietary habits that stick',
    detail: [
      'Habits to take home — easing off coffee, booze, sugar, dairy and gluten',
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
      'A virtual PT — solo or with your group',
    ],
    accent: '#5C7470',
  },
  {
    id: 'emotional',
    order: 3,
    label: 'Emotional Wellbeing',
    tagline: 'Mindset, resilience, nervous-system regulation',
    detail: [
      'Mindset (re)alignment',
      'Stress resilience and breathwork',
      'Strategic rest and digital detox',
      'Nervous-system regulation',
    ],
    accent: '#8C7B9C',
  },
  {
    id: 'sleep',
    order: 4,
    label: 'Sleep',
    tagline: 'Better sleep quality, quantity, consistency',
    detail: [
      'Support to establish better sleep quality',
      'Build the quantity and consistency, night to night',
    ],
    accent: '#5B6B8C',
  },
  {
    id: 'toxic_load',
    order: 5,
    label: 'Toxic Load',
    tagline: 'Reduce the load on your body',
    detail: [
      'Organic, no-preservative food',
      'Low-tox spa and cleaning products',
      'Immersion in nature',
    ],
    accent: '#7E9B6E',
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
