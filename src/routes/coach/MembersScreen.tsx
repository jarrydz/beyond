import { useMemo } from 'react';
import { Avatar, Card, SectionHeader, Sheet, WaterHeader } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import type { CheckIn, Goal, Profile } from '@/types';

interface Props {
  onOpenMember: (memberId: string) => void;
}

export function MembersScreen({ onOpenMember }: Props) {
  const profiles = useStoreState((s) => s.profiles);
  const goals = useStoreState((s) => s.goals);
  const checkIns = useStoreState((s) => s.checkIns);
  const cohortId = useStoreState((s) => s.cohort.id);

  const members = useMemo(
    () => profiles.filter((p) => p.role === 'member' && p.cohortId === cohortId),
    [profiles, cohortId],
  );

  return (
    <>
      <WaterHeader depth="shallow" eyebrow="Coach · Members" showPoints={false}>
        <h1 className="font-serif font-normal text-[30px] leading-[1.05]">Your cohort</h1>
        <p className="text-[12.5px] text-white/[.68] mt-1.5">
          {members.length} members. Tap to open a record.
        </p>
      </WaterHeader>
      <Sheet>
      <SectionHeader count={members.length}>Roster</SectionHeader>
      <div className="space-y-2">
        {members.map((m) => (
          <MemberRow
            key={m.id}
            member={m}
            goal={goals.find((g) => g.profileId === m.id && g.active)}
            lastScore={lastScoreFor(m.id, checkIns)}
            onClick={() => onOpenMember(m.id)}
          />
        ))}
      </div>
      </Sheet>
    </>
  );
}

function MemberRow({
  member,
  goal,
  lastScore,
  onClick,
}: {
  member: Profile;
  goal?: Goal;
  lastScore?: number;
  onClick: () => void;
}) {
  const attention = typeof lastScore === 'number' && lastScore < 5;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 text-left rounded-card border border-line bg-white p-3.5 hover:border-sage transition-colors shadow-card"
    >
      <Avatar profile={member} size={44} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14.5px] truncate">{member.fullName}</div>
        <div className="text-muted text-[12.5px] truncate">
          {goal ? goal.title : 'No active goal'}
        </div>
      </div>
      {typeof lastScore === 'number' && (
        <span
          className={[
            'inline-flex items-center text-[12px] font-semibold rounded-full px-3 py-1',
            attention ? 'bg-terra/10 text-terra' : 'bg-sand text-green',
          ].join(' ')}
        >
          {lastScore}/10
        </span>
      )}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7C766B"
        strokeWidth="2"
        className="ml-0.5"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}

function lastScoreFor(memberId: string, checkIns: CheckIn[]): number | undefined {
  const c = [...checkIns]
    .filter(
      (c) =>
        c.memberId === memberId &&
        c.status === 'completed' &&
        typeof c.goalScore === 'number',
    )
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0];
  return c?.goalScore;
}

export { lastScoreFor };
