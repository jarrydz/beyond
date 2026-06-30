import type { CheckIn, ContentItem, Goal, PillarId } from '@/types';
import { pillars } from '@/config/pillars';

/** Darken a #rrggbb hex toward black by `f` (0..1). Used for media-card gradients. */
export function darken(hex: string, f: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - f));
  const g = Math.round(((n >> 8) & 255) * (1 - f));
  const b = Math.round((n & 255) * (1 - f));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Content for one pillar, in seed order. */
export function contentForPillar(content: ContentItem[], pillarId: PillarId): ContentItem[] {
  return content.filter((c) => c.pillarId === pillarId);
}

/** Content grouped by pillar, ordered by the pillar order. Empty pillars are kept out. */
export function contentByPillar(
  content: ContentItem[],
): { pillarId: PillarId; items: ContentItem[] }[] {
  return pillars
    .map((p) => ({ pillarId: p.id, items: contentForPillar(content, p.id) }))
    .filter((g) => g.items.length > 0);
}

export interface PillarMomentum {
  /** 0..10 — a light, derived "where are you at" read for the overview rings. */
  value: number;
  /** Short status word for the card. */
  label: string;
  /** True when the member has an active goal in this pillar. */
  hasGoal: boolean;
  done: number;
  total: number;
}

/**
 * Derived (mock) momentum for a member in a pillar. Phase 2 replaces this with
 * real per-pillar streaks/analytics — for now it reads from real seeded signals:
 * the member's latest completed check-in in the pillar, else content marked done.
 */
export function pillarMomentum(
  pillarId: PillarId,
  opts: { content: ContentItem[]; goals: Goal[]; checkIns: CheckIn[]; meId: string },
): PillarMomentum {
  const items = contentForPillar(opts.content, pillarId);
  const done = items.filter((c) => c.doneBy.includes(opts.meId)).length;
  const total = items.length;
  const hasGoal = opts.goals.some(
    (g) => g.profileId === opts.meId && g.pillarId === pillarId && g.active,
  );

  const lastScored = opts.checkIns
    .filter(
      (c) =>
        c.memberId === opts.meId &&
        c.pillarId === pillarId &&
        c.status === 'completed' &&
        typeof c.goalScore === 'number',
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .at(-1);

  let value = 0;
  if (lastScored) value = lastScored.goalScore!;
  else if (total > 0) value = Math.round((done / total) * 10);

  const label =
    value >= 7 ? 'Strong' : value >= 4 ? 'Building' : value > 0 ? 'Starting' : 'Begin';

  return { value, label, hasGoal, done, total };
}
