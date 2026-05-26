import { useState } from 'react';
import {
  BottomNav,
  DailyCheckInRecorder,
  NavIcons,
  RoleSwitcherPill,
  ScreenWrap,
  useToast,
  type NavItem,
} from '@/components';
import { useData } from '@/services';
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
  const data = useData();
  const toast = useToast();
  const [active, setActive] = useState<Tab>('home');
  const [recorderOpen, setRecorderOpen] = useState(false);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next)) setActive(next);
  }

  return (
    <>
      <RoleSwitcherPill />
      <ScreenWrap key={active} withBottomNav={!recorderOpen}>
        {active === 'home' && (
          <HomeScreen onGoTab={goTab} onOpenDailyCheckIn={() => setRecorderOpen(true)} />
        )}
        {active === 'group' && <GroupScreen />}
        {active === 'coach' && <CoachScreen />}
        {active === 'learn' && <LearnScreen />}
        {active === 'progress' && <ProgressScreen />}
      </ScreenWrap>
      {!recorderOpen && <BottomNav items={navItems} active={active} onChange={goTab} />}
      <DailyCheckInRecorder
        open={recorderOpen}
        onClose={() => setRecorderOpen(false)}
        onSave={(videoUrl) => {
          data.addDailyCheckIn(videoUrl);
          setRecorderOpen(false);
          toast('Sent to your coach. Nice work.');
        }}
      />
    </>
  );
}
