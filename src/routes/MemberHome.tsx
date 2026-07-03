import { useState } from 'react';
import {
  BottomNav,
  DailyCheckInRecorder,
  FloatingHeader,
  NavIcons,
  PointsSheet,
  ScreenWrap,
  useToast,
  type NavItem,
} from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { HomeScreen } from './member/HomeScreen';
import { CommunityScreen } from './member/CommunityScreen';
import { CoachScreen } from './member/CoachScreen';
import { PillarsScreen } from './member/PillarsScreen';
import { PillarDetailScreen } from './member/PillarDetailScreen';
import { MealDetailScreen } from './member/MealDetailScreen';
import { ProfileScreen } from './member/ProfileScreen';
import type { PillarId } from '@/types';

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: NavIcons.home },
  { key: 'pillars', label: 'Pillars', icon: NavIcons.pillars },
  { key: 'community', label: 'Community', icon: NavIcons.group },
  { key: 'coach', label: 'Coach', icon: NavIcons.coach },
];

type Tab = 'home' | 'pillars' | 'community' | 'coach' | 'profile';

export function MemberHome() {
  const data = useData();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const pointsBalance = useStoreState((s) => s.pointsBalance);
  const pointsLedger = useStoreState((s) => s.pointsLedger);
  const [pointsOpen, setPointsOpen] = useState(false);
  // Land on Pillars so the five pillars are the first thing a member or partner sees.
  const [active, setActive] = useState<Tab>('pillars');
  const [prevTab, setPrevTab] = useState<Tab>('pillars');
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [openPillarId, setOpenPillarId] = useState<PillarId | null>(null);
  const [openMealId, setOpenMealId] = useState<string | null>(null);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next) || next === 'profile') {
      if (active !== 'profile') setPrevTab(active);
      setActive(next as Tab);
      setOpenPillarId(null);
      setOpenMealId(null);
    }
  }

  return (
    <>
      <FloatingHeader
        profile={me}
        showBack={active === 'profile'}
        points={pointsBalance}
        onPointsTap={() => setPointsOpen(true)}
        onProfileTap={() => {
          if (active === 'profile') setActive(prevTab);
          else { setPrevTab(active); setActive('profile'); }
        }}
      />
      <ScreenWrap key={`${active}:${openPillarId ?? ''}:${openMealId ?? ''}`} withBottomNav={!recorderOpen}>
        {active === 'home' && (
          <HomeScreen onGoTab={goTab} onOpenDailyCheckIn={() => setRecorderOpen(true)} />
        )}
        {active === 'pillars' &&
          (openMealId ? (
            <MealDetailScreen mealId={openMealId} onBack={() => setOpenMealId(null)} />
          ) : openPillarId ? (
            <PillarDetailScreen
              pillarId={openPillarId}
              onBack={() => setOpenPillarId(null)}
              onOpenMeal={(id) => setOpenMealId(id)}
            />
          ) : (
            <PillarsScreen onOpenPillar={(id) => setOpenPillarId(id)} />
          ))}
        {active === 'community' && <CommunityScreen />}
        {active === 'coach' && <CoachScreen />}
        {active === 'profile' && <ProfileScreen />}
      </ScreenWrap>
      {!recorderOpen && <BottomNav items={navItems} active={active} onChange={goTab} />}
      <PointsSheet
        open={pointsOpen}
        onClose={() => setPointsOpen(false)}
        balance={pointsBalance}
        ledger={[...pointsLedger].sort((a, b) => b.at.localeCompare(a.at))}
      />
      <DailyCheckInRecorder
        open={recorderOpen}
        onClose={() => setRecorderOpen(false)}
        onSave={(videoUrl) => {
          data.addDailyCheckIn(videoUrl);
          setRecorderOpen(false);
          const award = data.awardPoints('daily_check_in');
          toast(award ? `+${award.points} · ${award.label}` : 'Sent to your coach. Nice work.');
        }}
      />
    </>
  );
}
