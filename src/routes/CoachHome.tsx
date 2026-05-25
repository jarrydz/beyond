import { useState } from 'react';
import {
  BottomNav,
  NavIcons,
  RoleSwitcherPill,
  ScreenWrap,
  type NavItem,
} from '@/components';
import { TodayScreen } from './coach/TodayScreen';
import { MembersScreen } from './coach/MembersScreen';
import { MemberDetail } from './coach/MemberDetail';
import { ContentScreen } from './coach/ContentScreen';
import { GroupScreen } from './member/GroupScreen';

const navItems: NavItem[] = [
  { key: 'today', label: 'Today', icon: NavIcons.today },
  { key: 'members', label: 'Members', icon: NavIcons.members },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'content', label: 'Content', icon: NavIcons.content },
];

type Tab = (typeof navItems)[number]['key'];

export function CoachHome() {
  const [active, setActive] = useState<Tab>('today');
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);

  function goTab(next: string) {
    if (!navItems.some((n) => n.key === next)) return;
    setActive(next);
    setOpenMemberId(null);
  }

  function openMember(id: string) {
    setActive('members');
    setOpenMemberId(id);
  }

  return (
    <>
      <RoleSwitcherPill />
      <ScreenWrap key={`${active}:${openMemberId ?? 'list'}`}>
        {active === 'today' && <TodayScreen onOpenMember={openMember} />}
        {active === 'members' &&
          (openMemberId ? (
            <MemberDetail memberId={openMemberId} onBack={() => setOpenMemberId(null)} />
          ) : (
            <MembersScreen onOpenMember={(id) => setOpenMemberId(id)} />
          ))}
        {active === 'group' && <GroupScreen />}
        {active === 'content' && <ContentScreen />}
      </ScreenWrap>
      <BottomNav items={navItems} active={active} onChange={goTab} />
    </>
  );
}
