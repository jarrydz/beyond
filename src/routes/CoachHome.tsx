import { useState } from 'react';
import {
  BottomNav,
  FloatingHeader,
  NavIcons,
  ScreenWrap,
  type NavItem,
} from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { TodayScreen } from './coach/TodayScreen';
import { MembersScreen } from './coach/MembersScreen';
import { MemberDetail } from './coach/MemberDetail';
import { ContentScreen } from './coach/ContentScreen';
import { GroupScreen } from './member/GroupScreen';
import { CoachProfileScreen } from './coach/ProfileScreen';

const navItems: NavItem[] = [
  { key: 'today', label: 'Today', icon: NavIcons.today },
  { key: 'members', label: 'Members', icon: NavIcons.members },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'content', label: 'Content', icon: NavIcons.content },
];

const tabLabels: Record<string, string> = {
  today: 'Today',
  members: 'Members',
  group: 'Group',
  content: 'Content',
  profile: 'Profile',
};

type Tab = 'today' | 'members' | 'group' | 'content' | 'profile';

export function CoachHome() {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const [active, setActive] = useState<Tab>('today');
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);

  function goTab(next: string) {
    if (navItems.some((n) => n.key === next) || next === 'profile') {
      setActive(next as Tab);
      setOpenMemberId(null);
    }
  }

  function openMember(id: string) {
    setActive('members');
    setOpenMemberId(id);
  }

  return (
    <>
      <FloatingHeader
        title={tabLabels[active] ?? 'Today'}
        profile={me}
        onProfileTap={() => setActive('profile')}
      />
      <ScreenWrap key={`${active}:${openMemberId ?? 'list'}`} withHeader>
        {active === 'today' && <TodayScreen onOpenMember={openMember} />}
        {active === 'members' &&
          (openMemberId ? (
            <MemberDetail memberId={openMemberId} onBack={() => setOpenMemberId(null)} />
          ) : (
            <MembersScreen onOpenMember={(id) => setOpenMemberId(id)} />
          ))}
        {active === 'group' && <GroupScreen />}
        {active === 'content' && <ContentScreen />}
        {active === 'profile' && <CoachProfileScreen />}
      </ScreenWrap>
      <BottomNav items={navItems} active={active} onChange={goTab} />
    </>
  );
}
