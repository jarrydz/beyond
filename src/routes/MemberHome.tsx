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
import { PillarsScreen } from './member/PillarsScreen';
import { PillarDetailScreen } from './member/PillarDetailScreen';
import { ProfileScreen } from './member/ProfileScreen';
import type { PillarId } from '@/types';

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: NavIcons.home },
  { key: 'pillars', label: 'Pillars', icon: NavIcons.pillars },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'coach', label: 'Coach', icon: NavIcons.coach },
];

type Tab = 'home' | 'pillars' | 'group' | 'coach' | 'profile';

export function MemberHome() {
  const data = useData();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const [active, setActive] = useState<Tab>('home');
  const [prevTab, setPrevTab] = useState<Tab>('home');
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [openPillarId, setOpenPillarId] = useState<PillarId | null>(null);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next) || next === 'profile') {
      if (active !== 'profile') setPrevTab(active);
      setActive(next as Tab);
      setOpenPillarId(null);
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
      <ScreenWrap key={`${active}:${openPillarId ?? ''}`} withBottomNav={!recorderOpen}>
        {active === 'home' && (
          <HomeScreen onGoTab={goTab} onOpenDailyCheckIn={() => setRecorderOpen(true)} />
        )}
        {active === 'pillars' &&
          (openPillarId ? (
            <PillarDetailScreen pillarId={openPillarId} onBack={() => setOpenPillarId(null)} />
          ) : (
            <PillarsScreen onOpenPillar={(id) => setOpenPillarId(id)} />
          ))}
        {active === 'group' && <GroupScreen />}
        {active === 'coach' && <CoachScreen />}
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
