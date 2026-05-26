import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Eyebrow, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';

export function ProfileScreen() {
  const data = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const activeRole = useStoreState((s) => s.activeRole);
  const subscription = useStoreState((s) =>
    s.subscriptions.find((sub) => sub.profileId === s.currentUserId),
  );

  const planLabel = subscription ? 'Beyond · Monthly' : 'No active plan';
  const statusLabel = subscription
    ? subscription.status === 'mock' ? 'Active' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
    : '—';
  const since = subscription?.startedAt
    ? new Date(subscription.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  function switchToCoach() {
    data.switchRole('coach');
    toast('Switched to coach view');
    navigate('/c', { replace: true });
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
        <p className="text-muted text-[13px] mt-0.5">Member</p>
      </div>

      <Eyebrow>Subscription</Eyebrow>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[14.5px]">{planLabel}</div>
            {since && <div className="text-muted text-[12.5px] mt-0.5">Since {since}</div>}
          </div>
          <span className="text-[11px] tracking-[0.13em] uppercase text-green font-semibold">
            {statusLabel}
          </span>
        </div>
      </Card>

      <Eyebrow className="mt-4">Demo</Eyebrow>
      <Card>
        <button
          type="button"
          onClick={switchToCoach}
          className="w-full flex items-center justify-between py-1"
        >
          <div>
            <div className="font-semibold text-[14.5px]">Switch to coach view</div>
            <div className="text-muted text-[12.5px] mt-0.5">See what {activeRole === 'member' ? 'the coach' : 'a member'} sees</div>
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
