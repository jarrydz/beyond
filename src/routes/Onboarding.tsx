import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Eyebrow, ScreenWrap, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';

type Step = 'cohort' | 'goal';

export function Onboarding() {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const cohort = useStoreState((s) => s.cohort);

  const [step, setStep] = useState<Step>('cohort');
  const [goalTitle, setGoalTitle] = useState('Asleep before 10pm');
  const [goalTarget, setGoalTarget] = useState('7 nights a week');

  function finish() {
    const title = goalTitle.trim();
    if (!title) {
      toast('Give your goal a name');
      return;
    }
    data.setActiveGoal(me.id, title, goalTarget.trim() || undefined);
    data.setOnboarded(me.id);
    navigate('/paywall', { replace: true });
  }

  return (
    <ScreenWrap withBottomNav={false}>
      <section className="px-5 pt-3 pb-8">
        <div className="flex items-center gap-1.5 mb-5 mt-1.5">
          <Dot active={step === 'cohort'} />
          <Dot active={step === 'goal'} />
        </div>

        {step === 'cohort' ? (
          <>
            <h2 className="font-serif font-semibold text-[25px] mb-1">Welcome, {me.fullName}</h2>
            <p className="text-muted text-[13.5px] mb-5">
              Two quick things and you're in.
            </p>

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

            <Button onClick={() => setStep('goal')}>Yes, that's me</Button>
          </>
        ) : (
          <>
            <h2 className="font-serif font-semibold text-[25px] mb-1">Set your first goal</h2>
            <p className="text-muted text-[13.5px] mb-5">
              The one thing from the retreat you want to keep going. You can change it later.
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
              <label className="block mt-4">
                <Eyebrow>Target (optional)</Eyebrow>
                <input
                  className="w-full bg-transparent border-0 border-b border-line focus:border-green outline-none py-2 text-[14px]"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="e.g. 7 nights a week"
                />
              </label>
            </Card>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep('cohort')}
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
