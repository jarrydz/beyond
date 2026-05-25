// Phase 1 default: mock. Returns a canned but realistic AiSummary built from
// the member's seeded check-ins. Instant, free, no keys.
// Phase 2: same signatures, real LLM call behind a serverless function.

import type { AiSummary } from '@/types';
import type { DataService } from './dataService';

const pick = <T,>(arr: T[], n: number) => arr.slice(0, n);

export function createAiService(data: DataService) {
  return {
    async summariseMember(memberId: string): Promise<AiSummary> {
      const member = data.getProfile(memberId);
      const checkIns = data.getCheckIns(memberId).filter((c) => c.status === 'completed');
      const goals = data.getGoals(memberId).filter((g) => g.active);
      const goalTitle = goals[0]?.title ?? 'their goal';

      // tiny simulated latency so the UI gets to show a loading state
      await new Promise((r) => setTimeout(r, 400));

      if (checkIns.length === 0) {
        return {
          memberId,
          generatedAt: new Date().toISOString(),
          headline: `${member?.fullName.split(' ')[0] ?? 'They'} is just getting started.`,
          wins: ['Joined the cohort'],
          watchOuts: ['No check-ins recorded yet'],
          suggestedFocus: `Book the first check-in and set a clear goal.`,
        };
      }

      const scores = checkIns.map((c) => c.goalScore ?? 0);
      const first = scores[0];
      const last = scores[scores.length - 1];
      const trend = last - first;
      const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
      const blockers = checkIns
        .map((c) => c.topBlocker)
        .filter((b): b is string => Boolean(b));
      const commitments = checkIns
        .map((c) => c.commitment)
        .filter((c): c is string => Boolean(c));

      const headline =
        trend > 0
          ? `Trending up — averaging ${avg}/10 on "${goalTitle}".`
          : trend < 0
          ? `Wobbling on "${goalTitle}" — averaging ${avg}/10.`
          : `Holding steady at ${avg}/10 on "${goalTitle}".`;

      const wins = pick(
        [
          last >= 7 ? `Latest score ${last}/10 — strongest week yet.` : null,
          commitments[commitments.length - 1]
            ? `Stuck with the commitment: "${commitments[commitments.length - 1]}".`
            : null,
          checkIns.length >= 2 ? `${checkIns.length} check-ins kept in a row.` : null,
        ].filter((x): x is string => Boolean(x)),
        3,
      );

      const watchOuts = pick(
        Array.from(new Set(blockers)).map((b) => `Recurring blocker: ${b}.`),
        2,
      );

      const suggestedFocus =
        last < 5
          ? `Shrink the goal for this week — one small win beats a perfect plan.`
          : trend > 0
          ? `Lock in the routine before adding anything new.`
          : `Pick the single biggest blocker and pre-decide the response.`;

      return {
        memberId,
        generatedAt: new Date().toISOString(),
        headline,
        wins: wins.length ? wins : ['Showing up consistently.'],
        watchOuts: watchOuts.length ? watchOuts : ['Nothing flagged.'],
        suggestedFocus,
      };
    },
  };
}

export type AiService = ReturnType<typeof createAiService>;
