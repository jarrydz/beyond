import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Eyebrow, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';

export function CoachProfileScreen() {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);

  function switchToMember() {
    data.switchRole('member');
    toast('Switched to member view');
    navigate('/m', { replace: true });
  }

  function signOut() {
    data.signOut();
    navigate('/welcome', { replace: true });
  }

  return (
    <section className="px-5 pt-3 pb-7">
      <div className="flex flex-col items-center pt-4 pb-6">
        <Avatar profile={me} size={72} />
        <h2 className="font-serif font-semibold text-[22px] mt-3">{me.fullName}</h2>
        <p className="text-muted text-[13px] mt-0.5">Coach</p>
      </div>

      <Eyebrow>Demo</Eyebrow>
      <Card>
        <button
          type="button"
          onClick={switchToMember}
          className="w-full flex items-center justify-between py-1"
        >
          <div>
            <div className="font-semibold text-[14.5px]">Switch to member view</div>
            <div className="text-muted text-[12.5px] mt-0.5">See what a member sees</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </Card>

      <button
        type="button"
        onClick={signOut}
        className="mt-4 w-full text-center text-[14px] text-muted py-3 font-semibold"
      >
        Sign out
      </button>
    </section>
  );
}
