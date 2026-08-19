import { useNavigate } from 'react-router-dom';
import { Avatar, Card, Eyebrow, SparkIcon, useToast } from '@/components';
import { relativeTime } from '@/utils/format';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';

interface Props {
  /** Jump to the marketplace (More tab) — the Profile "Shop" row. */
  onOpenShop?: () => void;
  /** Present only when a booking exists — the PRD-05 demo stage switcher. */
  onOpenStageSheet?: () => void;
  /** Demo member switcher — the two personas (guest / alumna). */
  onOpenMemberSheet?: () => void;
}

export function ProfileScreen({ onOpenShop, onOpenStageSheet, onOpenMemberSheet }: Props) {
  const data = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const subscription = useStoreState((s) =>
    s.subscriptions.find((sub) => sub.profileId === s.currentUserId),
  );
  const pointsBalance = useStoreState((s) => s.pointsBalance);
  const lastEarn = useStoreState(
    (s) =>
      s.pointsLedger
        .filter((e) => e.memberId === s.currentUserId)
        .sort((a, b) => b.at.localeCompare(a.at))[0],
  );
  const latestOrder = useStoreState(
    (s) => [...s.orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0],
  );
  const orderedProduct = useStoreState((s) =>
    latestOrder ? s.products.find((p) => p.id === latestOrder.productId) : undefined,
  );

  const planLabel = subscription ? 'Beyond · Monthly' : 'No active plan';
  const statusLabel = subscription
    ? subscription.status === 'mock' ? 'Active' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
    : '—';
  const since = subscription?.startedAt
    ? new Date(subscription.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  function signOut() {
    data.signOut();
    navigate('/welcome', { replace: true });
  }

  return (
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-7">
      <div className="flex flex-col items-center pt-4 pb-6">
        <Avatar profile={me} size={72} />
        <h2 className="font-serif font-semibold text-[22px] mt-3">{me.fullName}</h2>
        <p className="text-muted text-[13px] mt-0.5">Member</p>
      </div>

      <Eyebrow>Points</Eyebrow>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-semibold text-[24px] leading-none">
                {pointsBalance}
              </span>
              <span className="text-muted text-[12.5px]">points</span>
            </div>
            {lastEarn && (
              <div className="text-muted text-[12.5px] mt-1">
                Last: {lastEarn.label} · {relativeTime(lastEarn.at)}
              </div>
            )}
          </div>
          <SparkIcon className="w-5 h-5 text-green" />
        </div>
      </Card>

      {/* Pre-retreat hides the tab bar and with it the marketplace — no row
          to a screen you can't come back from. */}
      {onOpenShop && (
        <>
      <Eyebrow className="mt-4">Shop</Eyebrow>
      <Card>
        <button
          type="button"
          onClick={onOpenShop}
          className="w-full flex items-center justify-between text-left py-1"
        >
          <div>
            <div className="font-semibold text-[14.5px]">Marketplace</div>
            <div className="text-muted text-[12.5px] mt-0.5">
              Recommended products from the retreat
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {latestOrder && orderedProduct && (
          <div className="flex items-center justify-between border-t border-line mt-2 pt-3 pb-1">
            <div>
              <div className="font-semibold text-[13.5px]">{orderedProduct.name}</div>
              <div className="text-muted text-[12px] mt-0.5">
                Ordered {relativeTime(latestOrder.placedAt)}
                {latestOrder.method === 'points' ? ' · paid with points' : ''}
              </div>
            </div>
            <span className="text-[11px] tracking-[0.13em] uppercase text-green font-semibold">
              On its way
            </span>
          </div>
        )}
      </Card>
        </>
      )}

      <Eyebrow className="mt-4">Subscription</Eyebrow>
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

      {(onOpenStageSheet || onOpenMemberSheet) && (
        <>
          <Eyebrow className="mt-4">Demo settings</Eyebrow>
          <Card>
            {onOpenStageSheet && (
              <button
                type="button"
                onClick={onOpenStageSheet}
                className="w-full flex items-center justify-between text-left py-1"
              >
                <div>
                  <div className="font-semibold text-[14.5px]">Journey stage</div>
                  <div className="text-muted text-[12.5px] mt-0.5">
                    Move the simulated clock
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {onOpenMemberSheet && (
              <button
                type="button"
                onClick={onOpenMemberSheet}
                className={[
                  'w-full flex items-center justify-between text-left py-1',
                  onOpenStageSheet ? 'border-t border-line mt-2 pt-3' : '',
                ].join(' ')}
              >
                <div>
                  <div className="font-semibold text-[14.5px]">Member</div>
                  <div className="text-muted text-[12.5px] mt-0.5">
                    Guest or alumna persona
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                data.resetJourneyDemo();
                toast('Journey refreshed — a clean run from 7 days out');
              }}
              className="w-full flex items-center justify-between text-left py-1 border-t border-line mt-2 pt-3"
            >
              <div>
                <div className="font-semibold text-[14.5px]">Refresh journey</div>
                <div className="text-muted text-[12.5px] mt-0.5">
                  Clean run — tasks, taper and the clock reset
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.6-6.4" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </Card>
        </>
      )}

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
