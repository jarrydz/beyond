import { useState } from 'react';
import { Eyebrow, GoalWhyForm } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { pillars } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import type { PillarId } from '@/types';

interface Props {
  onBack: () => void;
}

/**
 * The keystone of the journey (PRD-05): the goal and the why, captured
 * before arrival. The capture itself is the shared GoalWhyForm — the same
 * component onboarding renders — so the two can never drift.
 */
export function GoalWhyScreen({ onBack }: Props) {
  const data = useData();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const existing = useStoreState((s) =>
    s.goals.find((g) => g.profileId === me.id && g.active),
  );

  const [pillarId, setPillarId] = useState<PillarId>(existing?.pillarId ?? 'sleep');

  return (
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-7">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-green-soft font-semibold text-[13.5px] mt-1.5 mb-3 transition hover:text-green"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Journey
      </button>

      <h2 className="font-serif font-semibold text-[25px] leading-tight mb-1">
        What do you want from this?
      </h2>
      <p className="text-muted text-[13.5px] mb-5">
        Not the brochure answer. The retreat sits in the middle of a story you're starting now
        — write the real one.
      </p>

      <Eyebrow>Where it lives</Eyebrow>
      <div className="flex gap-2 mb-5">
        {pillars.map((p) => {
          const on = p.id === pillarId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPillarId(p.id)}
              aria-label={p.label}
              title={p.label}
              className="flex-1 rounded-[14px] border p-2.5 grid place-items-center transition"
              style={
                on
                  ? { borderColor: p.accent, background: `${p.accent}1a`, color: p.accent }
                  : { borderColor: '#E2D9CB', color: '#7C766B' }
              }
            >
              <span className="w-5 h-5 block [&_svg]:w-5 [&_svg]:h-5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
                {pillarIcons[p.id]}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-muted text-[12.5px] mb-4 px-1">
        You'll see these words again — on your last day there, and on your first day home.
      </p>

      <GoalWhyForm
        pillarId={pillarId}
        initialTitle={existing?.title}
        initialWhy={existing?.why}
        cta="Keep it"
        onSaved={() => {
          data.completePrepTask('prep-goal-why');
          onBack();
        }}
      />
    </section>
  );
}
