import { useState } from 'react';
import { AppHeader, BottomNav, Card, Eyebrow, NavIcons, ScreenWrap, type NavItem } from '@/components';
import { useStoreState } from '@/store/StoreProvider';

const navItems: NavItem[] = [
  { key: 'today', label: 'Today', icon: NavIcons.today },
  { key: 'members', label: 'Members', icon: NavIcons.members },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'content', label: 'Content', icon: NavIcons.content },
];

export function CoachHome() {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const memberCount = useStoreState(
    (s) => s.profiles.filter((p) => p.role === 'member' && p.cohortId === s.cohort.id).length,
  );
  const [active, setActive] = useState('today');

  return (
    <>
      <ScreenWrap>
        <AppHeader
          title={`Morning, ${me.fullName.split(' ')[0]}`}
          subtitle={`${memberCount} members in the April Cohort`}
        />
        <section className="px-5 pt-3 pb-7">
          <Card tone="dark">
            <Eyebrow className="!text-sage">Phase 2 complete</Eyebrow>
            <div className="font-serif font-semibold text-[20px] leading-snug mb-2">
              You're on the coach side now.
            </div>
            <p className="text-[13.5px] opacity-85">
              Same data, viewed from your side. Tap the role pill in the corner to flip back to
              the member view.
            </p>
          </Card>

          <Card>
            <Eyebrow>Up next (Phase 4)</Eyebrow>
            <ul className="text-[13.5px] leading-relaxed space-y-1.5 marker:text-sage list-disc pl-5">
              <li>Today — calls, quick stats, members needing attention</li>
              <li>Members — roster, member detail, record a check-in</li>
              <li>Group — post as the leader, read the cohort feed</li>
              <li>Content — what members receive this week</li>
            </ul>
          </Card>
        </section>
      </ScreenWrap>
      <BottomNav items={navItems} active={active} onChange={setActive} />
    </>
  );
}
