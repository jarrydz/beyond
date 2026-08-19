import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BottomNav,
  DailyCheckInRecorder,
  FloatingHeader,
  HeaderActionsContext,
  JourneyStageSheet,
  MemberSwitcherSheet,
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
import { JourneyScreen } from './member/JourneyScreen';
import { QuietScreen } from './member/QuietScreen';
import { ReintegrationScreen } from './member/ReintegrationScreen';
import { ContentDetailScreen } from './member/ContentDetailScreen';
import { stageFor } from '@/utils/journey';
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

function initialTab(state: unknown, hasBooking: boolean): Tab {
  const tab = (state as MemberHomeLocationState | null)?.tab;
  if (tab === 'home' || tab === 'pillars') return tab;
  // PRD-05: a booking means the journey is the story — land on Home. The
  // no-booking default stays Pillars (the shipped demo path, unchanged).
  return hasBooking ? 'home' : 'pillars';
}

export function MemberHome() {
  const location = useLocation();
  const data = useData();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const pointsBalance = useStoreState((s) => s.pointsBalance);
  const pointsLedger = useStoreState((s) => s.pointsLedger);
  // PRD-05: the lifecycle stage — always derived, never stored. Home renders the stage.
  const booking = useStoreState((s) =>
    s.booking && s.booking.profileId === s.currentUserId ? s.booking : null,
  );
  const stage = useStoreState((s) => stageFor(booking, s.demoDayOffset));
  // PRD-06: the active goal's pillar IS the focus — the check-in asks about it.
  const focusPillarId = useStoreState(
    (s) => s.goals.find((g) => g.profileId === s.currentUserId && g.active)?.pillarId,
  );
  // A copied share link (?recipe=<id>) opens straight onto that recipe —
  // only when the id resolves; a dead id falls back to the normal landing.
  const navigate = useNavigate();
  const meals = useStoreState((s) => s.meals);
  const sharedRecipeId = (() => {
    const id = new URLSearchParams(location.search).get('recipe');
    return id && meals.some((m) => m.id === id) ? id : null;
  })();
  useEffect(() => {
    if (new URLSearchParams(location.search).has('recipe')) {
      navigate('/m', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pointsOpen, setPointsOpen] = useState(false);
  const [active, setActive] = useState<Tab>(() =>
    sharedRecipeId ? 'pillars' : initialTab(location.state, !!booking),
  );
  const [prevTab, setPrevTab] = useState<Tab>(() => initialTab(location.state, !!booking));
  const [stageSheetOpen, setStageSheetOpen] = useState(false);
  const [memberSheetOpen, setMemberSheetOpen] = useState(false);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [openPillarId, setOpenPillarId] = useState<PillarId | null>(null);
  const [openMealId, setOpenMealId] = useState<string | null>(sharedRecipeId);
  const [openContentId, setOpenContentId] = useState<string | null>(null);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next) || next === 'profile') {
      if (active !== 'profile') setPrevTab(active);
      setActive(next as Tab);
      setOpenPillarId(null);
      setOpenMealId(null);
      setOpenContentId(null);
      setDeliveryOpen(false);
      setMarketOpen(false);
      setOpenProductId(null);
    }
  }

  // Quiet mode (decision 2): one screen, no nav, no points pill, no chrome.
  // Restraint reads as premium — the app steps back while they're on property.
  if (stage === 'on_retreat' && booking) {
    return (
      <>
        <ScreenWrap withBottomNav={false}>
          <QuietScreen booking={booking} onOpenStageSheet={() => setStageSheetOpen(true)} />
        </ScreenWrap>
        <JourneyStageSheet open={stageSheetOpen} onClose={() => setStageSheetOpen(false)} />
      </>
    );
  }

  // Pre-retreat (JZ, 2026-08-19): the countdown is an onboarding journey, not
  // an app tour — pillars aren't understood yet, community isn't live for you,
  // and the coach is someone you're only just meeting. So no tab bar: just the
  // journey, with Profile (and its demo settings) reachable from the avatar.
  if (stage === 'pre_retreat' && booking) {
    return (
      <HeaderActionsContext.Provider
        value={{
          onPointsTap: () => setPointsOpen(true),
          onProfileTap: () =>
            setActive((cur) => (cur === 'profile' ? 'home' : 'profile')),
        }}
      >
        {active === 'profile' && (
          <FloatingHeader profile={me} showBack onProfileTap={() => setActive('home')} />
        )}
        <ScreenWrap key={active} withBottomNav={false}>
          {active === 'profile' ? (
            <ProfileScreen
              onOpenStageSheet={() => setStageSheetOpen(true)}
              onOpenMemberSheet={() => setMemberSheetOpen(true)}
            />
          ) : (
            <JourneyScreen />
          )}
        </ScreenWrap>
        <JourneyStageSheet open={stageSheetOpen} onClose={() => setStageSheetOpen(false)} />
        <MemberSwitcherSheet open={memberSheetOpen} onClose={() => setMemberSheetOpen(false)} />
        <PointsSheet
          open={pointsOpen}
          onClose={() => setPointsOpen(false)}
          balance={pointsBalance}
          ledger={pointsLedger
            .filter((e) => e.memberId === me.id)
            .sort((a, b) => b.at.localeCompare(a.at))}
        />
      </HeaderActionsContext.Provider>
    );
  }

  return (
    <HeaderActionsContext.Provider
      value={{
        onPointsTap: () => setPointsOpen(true),
        onProfileTap: () => {
          if (active === 'profile') setActive(prevTab);
          else {
            setPrevTab(active);
            setActive('profile');
          }
        },
      }}
    >
      {active === 'profile' && (
        <FloatingHeader
          profile={me}
          showBack
          onProfileTap={() => setActive(prevTab)}
        />
      )}
      <ScreenWrap
        key={`${active}:${openPillarId ?? ''}:${openMealId ?? ''}:${openContentId ?? ''}:${deliveryOpen}:${marketOpen}:${openProductId ?? ''}`}
        withBottomNav={!recorderOpen}
      >
        {active === 'home' &&
          (openContentId ? (
            <ContentDetailScreen
              contentId={openContentId}
              onBack={() => setOpenContentId(null)}
              onOpenMeal={(id) => {
                goTab('pillars');
                setOpenMealId(id);
              }}
            />
          ) : stage === 'pre_retreat' ? (
            <JourneyScreen />
          ) : stage === 'reintegration' && booking ? (
            <ReintegrationScreen
              booking={booking}
              onOpenDailyCheckIn={() => setRecorderOpen(true)}
              onOpenContent={(id) => setOpenContentId(id)}
            />
          ) : (
            <HomeScreen
              onGoTab={goTab}
              onOpenDailyCheckIn={() => setRecorderOpen(true)}
              onOpenContent={(id) => setOpenContentId(id)}
            />
          ))}
        {active === 'pillars' &&
          (openMealId ? (
            <MealDetailScreen mealId={openMealId} onBack={() => setOpenMealId(null)} />
          ) : deliveryOpen ? (
            <MealDeliveryScreen onBack={() => setDeliveryOpen(false)} />
          ) : openContentId ? (
            <ContentDetailScreen
              contentId={openContentId}
              onBack={() => setOpenContentId(null)}
              onOpenMeal={(id) => setOpenMealId(id)}
            />
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
              onOpenContent={(id) => setOpenContentId(id)}
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
            onOpenStageSheet={booking ? () => setStageSheetOpen(true) : undefined}
            onOpenMemberSheet={() => setMemberSheetOpen(true)}
          />
        )}
      </ScreenWrap>
      {!recorderOpen && <BottomNav items={navItems} active={active} onChange={goTab} />}
      <JourneyStageSheet open={stageSheetOpen} onClose={() => setStageSheetOpen(false)} />
      <MemberSwitcherSheet open={memberSheetOpen} onClose={() => setMemberSheetOpen(false)} />
      <PointsSheet
        open={pointsOpen}
        onClose={() => setPointsOpen(false)}
        balance={pointsBalance}
        ledger={pointsLedger
          .filter((e) => e.memberId === me.id)
          .sort((a, b) => b.at.localeCompare(a.at))}
        onSpend={() => {
          setPointsOpen(false);
          goTab('more');
          setMarketOpen(true);
        }}
      />
      <DailyCheckInRecorder
        open={recorderOpen}
        focusPillarId={focusPillarId}
        onClose={() => setRecorderOpen(false)}
        onSave={(result) => {
          data.addDailyCheckIn(result);
          setRecorderOpen(false);
          const award = data.awardPoints('daily_check_in');
          toast(award ? `+${award.points} · ${award.label}` : 'Sent to your coach. Nice work.');
        }}
      />
    </HeaderActionsContext.Provider>
  );
}
