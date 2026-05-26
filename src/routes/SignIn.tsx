import { useNavigate } from 'react-router-dom';
import { ScreenWrap } from '@/components';
import { useData } from '@/services';
import type { Role } from '@/types';

export function SignIn() {
  const data = useData();
  const navigate = useNavigate();

  function enter(role: Role) {
    data.signIn(role);
    navigate(role === 'coach' ? '/c' : '/m', { replace: true });
  }

  return (
    <ScreenWrap withBottomNav={false}>
      <section className="px-6 pt-3 pb-8">
        <h2 className="font-serif font-semibold text-[24px] mt-2 mb-1 text-center">
          Welcome back
        </h2>
        <p className="text-muted text-[13.5px] text-center mb-8">
          Pick a view to jump straight in.
        </p>

        <div className="space-y-3">
          <RoleTile
            label="I'm a member"
            caption="Your retreat, continued"
            onClick={() => enter('member')}
          />
          <RoleTile
            label="I'm a coach"
            caption="Run your cohort"
            onClick={() => enter('coach')}
          />
        </div>
      </section>
    </ScreenWrap>
  );
}

function RoleTile({
  label,
  caption,
  onClick,
}: {
  label: string;
  caption: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[18px] border border-line bg-white p-4 text-left transition hover:border-sage active:scale-[0.98]"
    >
      <div className="font-serif font-semibold text-[18px] leading-tight">{label}</div>
      <div className="text-muted text-[13px] mt-1">{caption}</div>
    </button>
  );
}
