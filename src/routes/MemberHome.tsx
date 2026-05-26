import { useState } from 'react';
import {
  BottomNav,
  DailyCheckInRecorder,
  FloatingHeader,
  NavIcons,
  ScreenWrap,
  useToast,
  type NavItem,
} from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { HomeScreen } from './member/HomeScreen';
import { GroupScreen } from './member/GroupScreen';
import { CoachScreen } from './member/CoachScreen';
import { GrowScreen } from './member/GrowScreen';
import { ProfileScreen } from './member/ProfileScreen';

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: NavIcons.home },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'coach', label: 'Coach', icon: NavIcons.coach },
  { key: 'grow', label: 'Grow', icon: NavIcons.grow },
];

type Tab = 'home' | 'group' | 'coach' | 'grow' | 'profile';

export function MemberHome() {
  const data = useData();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const [active, setActive] = useState<Tab>('home');
  const [prevTab, setPrevTab] = useState<Tab>('home');
  const [recorderOpen, setRecorderOpen] = useState(false);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next) || next === 'profile') {
      if (active !== 'profile') setPrevTab(active);
      setActive(next as Tab);
    }
  }

  return (
    <>
      <FloatingHeader
        profile={me}
        showBack={active === 'profile'}
        onProfileTap={() => {
          if (active === 'profile') setActive(prevTab);
          else { setPrevTab(active); setActive('profile'); }
        }}
      />
      <ScreenWrap key={active} withBottomNav={!recorderOpen}>
        {active === 'home' && (
          <HomeScreen onGoTab={goTab} onOpenDailyCheckIn={() => setRecorderOpen(true)} />
        )}
        {active === 'group' && <GroupScreen />}
        {active === 'coach' && <CoachScreen />}
        {active === 'grow' && <GrowScreen />}
        {active === 'profile' && <ProfileScreen />}
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
