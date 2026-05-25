import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStoreState } from '@/store/StoreProvider';

/**
 * Decides where the user belongs based on auth + role + onboarding/paywall state.
 * Wrap any route that requires signed-in state; pass `need` to gate by role.
 *
 * Member flow:  signed-in → onboarded → subscribed → /m
 * Coach flow:   signed-in → /c (no onboarding or paywall)
 */
export function Guard({
  need,
  children,
}: {
  need?: 'member' | 'coach' | 'authed';
  children: ReactNode;
}) {
  const signedIn = useStoreState((s) => s.signedIn);
  const activeRole = useStoreState((s) => s.activeRole);
  const onboarded = useStoreState((s) => {
    const me = s.profiles.find((p) => p.id === s.currentUserId);
    return Boolean(me?.onboarded);
  });
  const hasSubscription = useStoreState((s) =>
    s.subscriptions.some((sub) => sub.profileId === s.currentUserId),
  );
  const location = useLocation();

  if (!signedIn) return <Navigate to="/signin" replace />;

  // Coach routes: skip onboarding/paywall.
  if (need === 'coach') {
    if (activeRole !== 'coach') return <Navigate to="/m" replace />;
    return <>{children}</>;
  }

  // Member-side gating.
  if (activeRole === 'member') {
    if (!onboarded && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    if (onboarded && !hasSubscription && location.pathname !== '/paywall') {
      return <Navigate to="/paywall" replace />;
    }
  }

  if (need === 'member' && activeRole !== 'member') {
    return <Navigate to="/c" replace />;
  }

  return <>{children}</>;
}

/**
 * For the welcome/signin routes — if you're already signed in, skip past.
 */
export function PublicOnly({ children }: { children: ReactNode }) {
  const signedIn = useStoreState((s) => s.signedIn);
  const activeRole = useStoreState((s) => s.activeRole);
  if (signedIn) {
    return <Navigate to={activeRole === 'coach' ? '/c' : '/m'} replace />;
  }
  return <>{children}</>;
}
