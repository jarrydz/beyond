import type { ComponentType } from 'react';
import type { ContentItem, InteractiveKey } from '@/types';
import { BreathPacer } from '@/components/BreathPacer';
import { StepSequence } from '@/components/StepSequence';
import { WeekPlanner } from '@/components/WeekPlanner';

/**
 * The interactive registry (PRD-07 decision 3): content rows carry a
 * componentKey, never markup — the row is metadata, the code lives here.
 * A key with no registration renders a plain "not available" state, never a
 * crash. That guard is what keeps a future backend honest: it can hold rows
 * pointing at components that don't exist yet.
 */
export interface InteractiveProps {
  item: ContentItem;
  /** Token substitution for personalised copy — see ContentDetailScreen. */
  vars?: Record<string, string>;
  onDone: () => void;
}

export const INTERACTIVE: Record<InteractiveKey, ComponentType<InteractiveProps>> = {
  breath_pacer: BreathPacer,
  step_sequence: StepSequence,
  week_planner: WeekPlanner,
};
