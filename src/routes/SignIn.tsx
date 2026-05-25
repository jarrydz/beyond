import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrap, useToast } from '@/components';
import { PinPad } from '@/components/PinPad';
import { useData } from '@/services';
import type { Role } from '@/types';

const PIN_LENGTH = 4;

export function SignIn() {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<Role | null>(null);

  const ready = pin.length === PIN_LENGTH && role !== null;

  function continueIn() {
    if (!ready || role === null) {
      toast('Enter a 4-digit PIN and pick a role');
      return;
    }
    data.signIn(role);
    navigate(role === 'coach' ? '/c' : '/m', { replace: true });
  }

  return (
    <ScreenWrap withBottomNav={false}>
      <section className="px-6 pt-3 pb-8">
        <h2 className="font-serif font-semibold text-[24px] mt-2 mb-1 text-center">
          Welcome back
        </h2>
        <p className="text-muted text-[13.5px] text-center mb-6">
          Any 4-digit PIN works for the demo.
        </p>

        <PinPad value={pin} onChange={setPin} length={PIN_LENGTH} />

        <div className="mt-7">
          <div className="text-[11px] tracking-[0.13em] uppercase text-green-soft font-semibold mb-3 text-center">
            Sign in as
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <RoleTile
              label="I'm a member"
              caption="Your retreat, continued"
              active={role === 'member'}
              onClick={() => setRole('member')}
            />
            <RoleTile
              label="I'm a coach"
              caption="Run your cohort"
              active={role === 'coach'}
              onClick={() => setRole('coach')}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={continueIn}
          disabled={!ready}
          className={[
            'mt-6 w-full font-semibold text-sm rounded-btn py-[13px] transition active:scale-[0.975]',
            ready
              ? 'bg-green text-cream hover:brightness-110'
              : 'bg-sand text-muted cursor-not-allowed',
          ].join(' ')}
        >
          Continue
        </button>
      </section>
    </ScreenWrap>
  );
}

function RoleTile({
  label,
  caption,
  active,
  onClick,
}: {
  label: string;
  caption: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[18px] border p-3 text-left transition',
        active
          ? 'border-green bg-[#F1F4ED] text-ink'
          : 'border-line bg-white text-ink hover:border-sage',
      ].join(' ')}
    >
      <div className="font-serif font-semibold text-[16px] leading-tight">{label}</div>
      <div className="text-muted text-[12px] mt-1">{caption}</div>
    </button>
  );
}
