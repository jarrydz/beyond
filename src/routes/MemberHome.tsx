import { useState } from 'react';
import { AppHeader, BottomNav, Card, Eyebrow, NavIcons, ScreenWrap, type NavItem } from '@/components';
import { useStoreState } from '@/store/StoreProvider';

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: NavIcons.home },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'coach', label: 'Coach', icon: NavIcons.coach },
  { key: 'learn', label: 'Learn', icon: NavIcons.learn },
  { key: 'progress', label: 'Progress', icon: NavIcons.progress },
];

export function MemberHome() {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const [active, setActive] = useState('home');

  return (
    <>
      <ScreenWrap>
        <AppHeader
          title={`Hi, ${me.fullName.split(' ')[0]}`}
          subtitle="You're in. Screens land in Phase 3."
        />
        <section className="px-5 pt-3 pb-7">
          <Card tone="dark">
            <Eyebrow className="!text-sage">Phase 2 complete</Eyebrow>
            <div className="font-serif font-semibold text-[20px] leading-snug mb-2">
              Welcome to the member side, {me.fullName.split(' ')[0]}.
            </div>
            <p className="text-[13.5px] opacity-85">
              You signed in, picked your cohort, set a goal, and passed the mock paywall. Tap the
              role pill in the corner to flip to the coach view.
            </p>
          </Card>

          <Card>
            <Eyebrow>Up next (Phase 3)</Eyebrow>
            <ul className="text-[13.5px] leading-relaxed space-y-1.5 marker:text-sage list-disc pl-5">
              <li>Home — day counter, next check-in, goal ring, today's content</li>
              <li>Group — cohort feed with posts and likes</li>
              <li>Coach — profile, booking sheet, AI summary of your month</li>
              <li>Learn — recipes, movement, cook-along</li>
              <li>Progress — goal-score chart and streaks</li>
            </ul>
          </Card>
        </section>
      </ScreenWrap>
      <BottomNav items={navItems} active={active} onChange={setActive} />
    </>
  );
}
