import { useState } from 'react';
import {
  BottomNav,
  FloatingHeader,
  HeaderActionsContext,
  NavIcons,
  ScreenWrap,
  type NavItem,
} from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { TodayScreen } from './coach/TodayScreen';
import { MembersScreen } from './coach/MembersScreen';
import { MemberDetail } from './coach/MemberDetail';
import { ContentScreen } from './coach/ContentScreen';
import { CommunityScreen } from './member/CommunityScreen';
import { CoachProfileScreen } from './coach/ProfileScreen';

const navItems: NavItem[] = [
  { key: 'today', label: 'Today', icon: NavIcons.today },
  { key: 'members', label: 'Members', icon: NavIcons.members },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'content', label: 'Content', icon: NavIcons.content },
];

type Tab = 'today' | 'members' | 'group' | 'content' | 'profile';

export function CoachHome() {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const [active, setActive] = useState<Tab>('today');
  const [prevTab, setPrevTab] = useState<Tab>('today');
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next) || next === 'profile') {
      if (active !== 'profile') setPrevTab(active);
      setActive(next as Tab);
      setOpenMemberId(null);
    }
  }

  function openMember(id: string) {
    setActive('members');
    setOpenMemberId(id);
  }

  return (
    <HeaderActionsContext.Provider
      value={{
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
        <FloatingHeader profile={me} showBack onProfileTap={() => setActive(prevTab)} />
      )}
      <ScreenWrap key={`${active}:${openMemberId ?? 'list'}`}>
        {active === 'today' && <TodayScreen onOpenMember={openMember} />}
        {active === 'members' &&
          (openMemberId ? (
            <MemberDetail memberId={openMemberId} onBack={() => setOpenMemberId(null)} />
          ) : (
            <MembersScreen onOpenMember={(id) => setOpenMemberId(id)} />
          ))}
        {active === 'group' && <CommunityScreen />}
        {active === 'content' && <ContentScreen />}
        {active === 'profile' && <CoachProfileScreen />}
      </ScreenWrap>
      <BottomNav items={navItems} active={active} onChange={goTab} />
    </HeaderActionsContext.Provider>
  );
}
