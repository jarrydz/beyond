import { useState } from 'react';
import { BottomNav, NavIcons, RoleSwitcherPill, ScreenWrap, type NavItem } from '@/components';
import { HomeScreen } from './member/HomeScreen';
import { GroupScreen } from './member/GroupScreen';
import { CoachScreen } from './member/CoachScreen';
import { LearnScreen } from './member/LearnScreen';
import { ProgressScreen } from './member/ProgressScreen';

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: NavIcons.home },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'coach', label: 'Coach', icon: NavIcons.coach },
  { key: 'learn', label: 'Learn', icon: NavIcons.learn },
  { key: 'progress', label: 'Progress', icon: NavIcons.progress },
];

type Tab = (typeof navItems)[number]['key'];

export function MemberHome() {
  const [active, setActive] = useState<Tab>('home');

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next)) setActive(next);
  }

  return (
    <>
      <RoleSwitcherPill />
      <ScreenWrap key={active}>
        {active === 'home' && <HomeScreen onGoTab={goTab} />}
        {active === 'group' && <GroupScreen />}
        {active === 'coach' && <CoachScreen />}
        {active === 'learn' && <LearnScreen />}
        {active === 'progress' && <ProgressScreen />}
      </ScreenWrap>
      <BottomNav items={navItems} active={active} onChange={goTab} />
    </>
  );
}
