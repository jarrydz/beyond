import type { ReactNode } from 'react';
import type { PillarId } from '@/types';

/**
 * Line icons for each pillar, in the same bare style as components/BottomNav.tsx —
 * no fill/stroke attributes here; the consumer sets stroke + size via classes.
 * leaf · figure · heart · moon (app order).
 */
export const pillarIcons: Record<PillarId, ReactNode> = {
  nourishment: (
    <svg viewBox="0 0 24 24">
      <path d="M5 19c-1-8 5-15 14-15 1 9-5 16-14 15Z" />
      <path d="M5 19c2.5-4 6-6.5 10-8" />
    </svg>
  ),
  movement: (
    <svg viewBox="0 0 24 24">
      <circle cx="13" cy="4.5" r="2" />
      <path d="M13 7v5l-3.5 9" />
      <path d="M13 12l4 9" />
      <path d="M8.5 11l4.5-1.5L18 12" />
    </svg>
  ),
  emotional: (
    <svg viewBox="0 0 24 24">
      <path d="M12 21c5-4 8-7 8-11a4 4 0 0 0-8-1 4 4 0 0 0-8 1c0 4 3 7 8 11Z" />
    </svg>
  ),
  sleep: (
    <svg viewBox="0 0 24 24">
      <path d="M20 14.5A8 8 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" />
    </svg>
  ),
};
