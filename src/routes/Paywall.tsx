import { useNavigate } from 'react-router-dom';
import { Button, Card, Eyebrow, ScreenWrap, useToast } from '@/components';
import { useData } from '@/services';

export function Paywall() {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();

  function subscribe() {
    data.startMockSubscription();
    toast('You\'re in. Welcome to Beyond.');
    navigate('/m', { replace: true });
  }

  return (
    <ScreenWrap withBottomNav={false}>
      <section className="px-5 pt-3 pb-8">
        <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-1">Keep going</h2>
        <p className="text-muted text-[13.5px] mb-5">
          The retreat got you here. This keeps you here.
        </p>

        <Card tone="dark">
          <Eyebrow className="!text-sage">Beyond · monthly</Eyebrow>
          <div className="flex items-baseline gap-1.5 mb-1">
            <div className="font-serif font-semibold text-[34px] leading-none">$29</div>
            <div className="text-[13px] opacity-80">/ month</div>
          </div>
          <div className="text-[13px] opacity-80 mb-4">Cancel any time. First 14 days free.</div>
          <ul className="space-y-2 text-[13.5px] leading-snug">
            <Bullet>Private cohort feed with your group</Bullet>
            <Bullet>1:1 check-ins with your coach</Bullet>
            <Bullet>Weekly recipes, movement and reflections</Bullet>
            <Bullet>Progress tracking and an AI summary of your month</Bullet>
          </ul>
        </Card>

        <Button onClick={subscribe}>Start subscription</Button>
        <p className="text-muted text-[11.5px] text-center mt-3">
          Mock paywall — no card needed in the demo.
        </p>
      </section>
    </ScreenWrap>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        className="mt-0.5 flex-none"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#A7B59C"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 12 5 5L20 7" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
