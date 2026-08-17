import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useStoreState } from '@/store/StoreProvider';

/**
 * Decides where the user belongs based on auth + role + onboarding/paywall state.
 * Wrap any route that requires signed-in state; pass `need` to gate by role.
 *
 * Member flow:  signed-in → /onboarding → onboarded → /m
 * Coach flow:   signed-in → /c (no onboarding gate)
 *
 * PRD-05 (JZ, 2026-08-17, option a): a member with a booking skips app
 * onboarding entirely — the T-21 journey captures the goal + why with the
 * same shared GoalWhyForm. Onboarding remains the alumni (no-booking) path.
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
  const hasBooking = useStoreState((s) =>
    Boolean(s.booking && s.booking.profileId === s.currentUserId),
  );
  const location = useLocation();

  if (!signedIn) return <Navigate to="/welcome" replace />;

  // Coach routes: skip onboarding/paywall.
  if (need === 'coach') {
    if (activeRole !== 'coach') return <Navigate to="/m" replace />;
    return <>{children}</>;
  }

  // Member-side gating. A booking bypasses onboarding — even a hard
  // navigation to /onboarding (Welcome still points there) lands on /m.
  if (activeRole === 'member') {
    if (hasBooking && location.pathname === '/onboarding') {
      return <Navigate to="/m" replace />;
    }
    if (!onboarded && !hasBooking && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  }

  if (need === 'member' && activeRole !== 'member') {
    return <Navigate to="/c" replace />;
  }

  return <>{children}</>;
}

/**
 * For the welcome route — if you're already signed in, skip past.
 */
export function PublicOnly({ children }: { children: ReactNode }) {
  const signedIn = useStoreState((s) => s.signedIn);
  const activeRole = useStoreState((s) => s.activeRole);
  const onboarded = useStoreState((s) => {
    const me = s.profiles.find((p) => p.id === s.currentUserId);
    return Boolean(me?.onboarded);
  });
  const hasBooking = useStoreState((s) =>
    Boolean(s.booking && s.booking.profileId === s.currentUserId),
  );
  if (signedIn) {
    if (activeRole === 'coach') return <Navigate to="/c" replace />;
    if (!onboarded && !hasBooking) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/m" replace />;
  }
  return <>{children}</>;
}
