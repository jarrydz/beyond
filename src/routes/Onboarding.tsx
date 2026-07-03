import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Eyebrow, ScreenWrap, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { pillars } from '@/config/pillars';
import { pillarIcons } from '@/config/pillarIcons';
import type { PillarId } from '@/types';

type Step = 'cohort' | 'pillar' | 'goal';

/** A goal-shaped suggestion per pillar, so the goal step starts with something real. */
const GOAL_SUGGESTION: Record<PillarId, string> = {
  nourishment: 'Plant-forward dinners, 5 nights',
  movement: 'Morning Chi Gong, daily',
  emotional: 'Breathe through the 3pm slump',
  sleep: 'Asleep before 10pm',
  toxic_load: 'One low-tox swap a week',
};

const WINDOWS = ['30 days', '100 days'] as const;

export function Onboarding() {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const cohort = useStoreState((s) => s.cohort);

  const [step, setStep] = useState<Step>('cohort');
  const [pillarId, setPillarId] = useState<PillarId>('sleep');
  const [goalTitle, setGoalTitle] = useState(GOAL_SUGGESTION.sleep);
  const [goalWindow, setGoalWindow] = useState<(typeof WINDOWS)[number]>('30 days');

  function pickPillar(id: PillarId) {
    setPillarId(id);
    setGoalTitle(GOAL_SUGGESTION[id]);
  }

  function finish() {
    const title = goalTitle.trim();
    if (!title) {
      toast('Give your goal a name');
      return;
    }
    data.setActiveGoal(me.id, pillarId, title, goalWindow);
    data.setOnboarded(me.id);
    navigate('/m', { replace: true });
  }

  function skip() {
    data.setOnboarded(me.id);
    navigate('/m', { replace: true });
  }

  return (
    <ScreenWrap withBottomNav={false}>
      <section className="px-5 pt-3 pb-8">
        <div className="flex items-center justify-between mb-5 mt-1.5">
          <div className="flex items-center gap-1.5">
            <Dot active={step === 'cohort'} />
            <Dot active={step === 'pillar'} />
            <Dot active={step === 'goal'} />
          </div>
          <button
            type="button"
            onClick={skip}
            className="text-[13px] font-semibold text-green-soft hover:text-green transition-colors"
          >
            Skip
          </button>
        </div>

        {step === 'cohort' && (
          <>
            <h2 className="font-serif font-semibold text-[25px] mb-1">Welcome, {me.fullName}</h2>
            <p className="text-muted text-[13.5px] mb-5">A few quick things and you're in.</p>

            <Card>
              <Eyebrow>Your cohort</Eyebrow>
              <div className="font-serif font-semibold text-[20px] leading-tight">
                {cohort.name}
              </div>
              <div className="text-muted text-[13px] mt-1">{cohort.retreatName} retreat</div>
              <div className="mt-3 text-[13.5px] leading-relaxed">
                You'll see posts, content and check-ins from this group only.
              </div>
            </Card>

            <Button onClick={() => setStep('pillar')}>Yes, that's me</Button>
          </>
        )}

        {step === 'pillar' && (
          <>
            <h2 className="font-serif font-semibold text-[25px] mb-1">Pick your focus</h2>
            <p className="text-muted text-[13.5px] mb-5">
              The Five Pillars are the work you took home. Choose the one to start with — you
              can switch any time.
            </p>

            <div className="space-y-2.5">
              {pillars.map((p) => {
                const on = p.id === pillarId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickPillar(p.id)}
                    className={[
                      'w-full text-left rounded-card border bg-white p-3 flex items-center gap-3 transition',
                      on ? 'shadow-card' : 'border-line',
                    ].join(' ')}
                    style={on ? { borderColor: p.accent, boxShadow: `0 0 0 1px ${p.accent}` } : undefined}
                  >
                    <div
                      className="w-10 h-10 rounded-[13px] grid place-items-center flex-none"
                      style={{ background: `${p.accent}1f`, color: p.accent }}
                    >
                      <span className="w-5 h-5 block [&_svg]:w-5 [&_svg]:h-5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
                        {pillarIcons[p.id]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14.5px] leading-tight">{p.label}</div>
                      <div className="text-muted text-[12px] leading-snug mt-0.5">{p.tagline}</div>
                    </div>
                    <span
                      className={[
                        'w-5 h-5 rounded-full border flex-none grid place-items-center',
                        on ? 'border-transparent' : 'border-line',
                      ].join(' ')}
                      style={on ? { background: p.accent } : undefined}
                    >
                      {on && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setStep('cohort')}
                className="flex-1 font-semibold text-sm rounded-btn py-[13px] text-muted border border-line bg-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('goal')}
                className="flex-1 font-semibold text-sm rounded-btn py-[13px] bg-green text-cream"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'goal' && (
          <>
            <h2 className="font-serif font-semibold text-[25px] mb-1">Set your first goal</h2>
            <p className="text-muted text-[13.5px] mb-5">
              One thing to keep going, in{' '}
              <span className="font-semibold">
                {pillars.find((p) => p.id === pillarId)!.label}
              </span>
              . You can change it later.
            </p>

            <Card>
              <label className="block">
                <Eyebrow>Goal</Eyebrow>
                <input
                  className="w-full bg-transparent border-0 border-b border-line focus:border-green outline-none py-2 text-[16px] font-serif"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Asleep before 10pm"
                />
              </label>

              <div className="mt-4">
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
                          'flex-1 font-semibold text-sm rounded-btn py-2.5 border transition',
                          on
                            ? 'bg-green text-cream border-transparent'
                            : 'bg-white text-muted border-line',
                        ].join(' ')}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep('pillar')}
                className="flex-1 font-semibold text-sm rounded-btn py-[13px] text-muted border border-line bg-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={finish}
                className="flex-1 font-semibold text-sm rounded-btn py-[13px] bg-green text-cream"
              >
                Save my goal
              </button>
            </div>
          </>
        )}
      </section>
    </ScreenWrap>
  );
}

function Dot({ active }: { active: boolean }) {
  return (
    <div
      className={[
        'h-[6px] rounded-full transition-all',
        active ? 'bg-green w-7' : 'bg-line w-3',
      ].join(' ')}
    />
  );
}
