import { useState } from 'react';
import { Button, Card, Eyebrow, useToast } from '.';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import type { Goal, PillarId } from '@/types';

const WINDOWS = ['30 days', '100 days'] as const;

interface Props {
  pillarId: PillarId;
  /** Prefill for the goal title — a suggestion (onboarding) or the existing goal (journey). */
  initialTitle?: string;
  initialWhy?: string;
  cta?: string;
  /** Called with the saved goal — the caller decides what completing means. */
  onSaved: (goal: Goal) => void;
}

/**
 * The one goal + why capture (JZ, 2026-08-17): onboarding's goal step and
 * the T-21 prep task render THIS component, backed by the same
 * setActiveGoal(..., why) call. The why is load-bearing — it's restated at
 * the handoff and in reintegration, and it's what a coach opens a session
 * with — so there is exactly one implementation of writing it.
 */
export function GoalWhyForm({ pillarId, initialTitle, initialWhy, cta = 'Keep it', onSaved }: Props) {
  const data = useData();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const existing = useStoreState((s) =>
    s.goals.find((g) => g.profileId === me.id && g.active),
  );

  const [title, setTitle] = useState(initialTitle ?? '');
  const [why, setWhy] = useState(initialWhy ?? '');
  const [goalWindow, setGoalWindow] = useState<(typeof WINDOWS)[number]>(
    existing?.target === '100 days' ? '100 days' : '30 days',
  );

  function save() {
    const goal = title.trim();
    const reason = why.trim();
    if (!goal) {
      toast('Give the goal a name');
      return;
    }
    if (!reason) {
      toast('The why is the part that lasts — one honest line');
      return;
    }
    onSaved(data.setActiveGoal(me.id, pillarId, goal, goalWindow, reason));
  }

  return (
    <>
      <Card>
        <label className="block mb-4">
          <Eyebrow>The goal</Eyebrow>
          <input
            className="w-full bg-transparent border-0 border-b border-line focus:border-green outline-none py-2 text-[16px] font-serif"
            placeholder="e.g. Asleep before 10pm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block mb-4">
          <Eyebrow>Your why</Eyebrow>
          <textarea
            className="w-full bg-transparent border-0 border-b border-line focus:border-green outline-none py-2 text-[15px] font-serif leading-relaxed resize-none"
            rows={4}
            placeholder="I want to stop waking at 3am. My daughter said I'm never really there."
            value={why}
            onChange={(e) => setWhy(e.target.value)}
          />
        </label>
        <Eyebrow>Goal window</Eyebrow>
        <div className="flex gap-2.5 mt-1">
          {WINDOWS.map((w) => {
            const on = w === goalWindow;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setGoalWindow(w)}
                className={[
                  'flex-1 font-semibold text-[13px] rounded-btn py-[10px] border transition',
                  on ? 'bg-green text-cream border-green' : 'bg-white text-muted border-line',
                ].join(' ')}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Card>
      <Button onClick={save}>{cta}</Button>
    </>
  );
}
