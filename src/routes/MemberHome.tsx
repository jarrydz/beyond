import { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { MealDeliveryScreen } from './member/MealDeliveryScreen';
import { MoreScreen } from './member/MoreScreen';
import { MarketplaceScreen } from './member/MarketplaceScreen';
import { ProductDetailScreen } from './member/ProductDetailScreen';
import { ProfileScreen } from './member/ProfileScreen';
import type { PillarId } from '@/types';

// Five tabs by decision (JZ, 2026-07-03): Marketplace lives inside More;
// Community keeps its primary slot.
const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: NavIcons.home },
  { key: 'pillars', label: 'Pillars', icon: NavIcons.pillars },
  { key: 'community', label: 'Community', icon: NavIcons.group },
  { key: 'coach', label: 'Coach', icon: NavIcons.coach },
  { key: 'more', label: 'More', icon: NavIcons.more },
];

type Tab = 'home' | 'pillars' | 'community' | 'coach' | 'more' | 'profile';

type MemberHomeLocationState = {
  tab?: Tab;
};

function initialTab(state: unknown): Tab {
  const tab = (state as MemberHomeLocationState | null)?.tab;
  if (tab === 'home' || tab === 'pillars') return tab;
  return 'pillars';
}

export function MemberHome() {
  const location = useLocation();
  const data = useData();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const pointsBalance = useStoreState((s) => s.pointsBalance);
  const pointsLedger = useStoreState((s) => s.pointsLedger);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [active, setActive] = useState<Tab>(() => initialTab(location.state));
  const [prevTab, setPrevTab] = useState<Tab>(() => initialTab(location.state));
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [openPillarId, setOpenPillarId] = useState<PillarId | null>(null);
  const [openMealId, setOpenMealId] = useState<string | null>(null);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next) || next === 'profile') {
      if (active !== 'profile') setPrevTab(active);
      setActive(next as Tab);
      setOpenPillarId(null);
      setOpenMealId(null);
      setDeliveryOpen(false);
      setMarketOpen(false);
      setOpenProductId(null);
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
      <ScreenWrap
        key={`${active}:${openPillarId ?? ''}:${openMealId ?? ''}:${deliveryOpen}:${marketOpen}:${openProductId ?? ''}`}
        withBottomNav={!recorderOpen}
      >
        {active === 'home' && (
          <HomeScreen onGoTab={goTab} onOpenDailyCheckIn={() => setRecorderOpen(true)} />
        )}
        {active === 'pillars' &&
          (openMealId ? (
            <MealDetailScreen mealId={openMealId} onBack={() => setOpenMealId(null)} />
          ) : deliveryOpen ? (
            <MealDeliveryScreen onBack={() => setDeliveryOpen(false)} />
          ) : openPillarId ? (
            <PillarDetailScreen
              pillarId={openPillarId}
              onBack={() => setOpenPillarId(null)}
              onOpenMeal={(id) => setOpenMealId(id)}
              onOpenMealDelivery={
                openPillarId === 'nourishment' ? () => setDeliveryOpen(true) : undefined
              }
              onOpenProduct={(id) => {
                goTab('more');
                setMarketOpen(true);
                setOpenProductId(id);
              }}
            />
          ) : (
            <PillarsScreen onOpenPillar={(id) => setOpenPillarId(id)} />
          ))}
        {active === 'community' && <CommunityScreen />}
        {active === 'coach' && <CoachScreen />}
        {active === 'more' &&
          (openProductId ? (
            <ProductDetailScreen
              productId={openProductId}
              onBack={() => setOpenProductId(null)}
            />
          ) : marketOpen ? (
            <MarketplaceScreen
              onBack={() => setMarketOpen(false)}
              onOpenProduct={(id) => setOpenProductId(id)}
            />
          ) : (
            <MoreScreen
              onOpenMarketplace={() => setMarketOpen(true)}
              onOpenProfile={() => goTab('profile')}
            />
          ))}
        {active === 'profile' && (
          <ProfileScreen
            onOpenShop={() => {
              goTab('more');
              setMarketOpen(true);
            }}
          />
        )}
      </ScreenWrap>
      {!recorderOpen && <BottomNav items={navItems} active={active} onChange={goTab} />}
      <PointsSheet
        open={pointsOpen}
        onClose={() => setPointsOpen(false)}
        balance={pointsBalance}
        ledger={[...pointsLedger].sort((a, b) => b.at.localeCompare(a.at))}
        onSpend={() => {
          setPointsOpen(false);
          goTab('more');
          setMarketOpen(true);
        }}
      />
      <DailyCheckInRecorder
        open={recorderOpen}
        onClose={() => setRecorderOpen(false)}
        onSave={(result) => {
          data.addDailyCheckIn(result);
          setRecorderOpen(false);
          const award = data.awardPoints('daily_check_in');
          toast(award ? `+${award.points} · ${award.label}` : 'Sent to your coach. Nice work.');
        }}
      />
    </>
  );
}
