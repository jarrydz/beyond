import type { CheckIn, Post, Profile } from '@/types';

export interface AttentionFlag {
  member: Profile;
  reasons: string[];
  lastScore?: number;
}

const SEVEN_DAYS = 7 * 86_400_000;

/**
 * "Members needing attention" — low recent goal score OR no recent group post.
 * From section 8 of the brief; used on the coach Today screen and Members roster.
 */
export function membersNeedingAttention(
  members: Profile[],
  checkIns: CheckIn[],
  posts: Post[],
  now = Date.now(),
): AttentionFlag[] {
  const flags: AttentionFlag[] = [];
  for (const m of members) {
    const reasons: string[] = [];
    const lastCompleted = checkIns
      .filter(
        (c) =>
          c.memberId === m.id &&
          c.status === 'completed' &&
          typeof c.goalScore === 'number',
      )
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0];
    const lastScore = lastCompleted?.goalScore;
    if (typeof lastScore === 'number' && lastScore < 5) {
      reasons.push(`Last goal score ${lastScore}/10`);
    }
    const recentPost = posts.find(
      (p) => p.authorId === m.id && now - new Date(p.createdAt).getTime() < SEVEN_DAYS,
    );
    if (!recentPost) {
      reasons.push('Quiet in the group this week');
    }
    if (reasons.length > 0) flags.push({ member: m, reasons, lastScore });
  }
  return flags;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Start of the current ISO-ish week (Monday 00:00 local). */
export function startOfWeek(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0 = Sun
  const diff = (dow + 6) % 7; // distance back to Monday
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(now = new Date()): Date {
  const d = startOfWeek(now);
  d.setDate(d.getDate() + 7);
  return d;
}
