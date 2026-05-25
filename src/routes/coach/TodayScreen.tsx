import { useMemo } from 'react';
import { Avatar, Card, Eyebrow } from '@/components';
import { useStoreState } from '@/store/StoreProvider';
import { formatTime, greeting } from '@/utils/format';
import {
  endOfWeek,
  isSameDay,
  membersNeedingAttention,
  startOfWeek,
} from '@/utils/attention';

interface Props {
  onOpenMember: (memberId: string) => void;
}

export function TodayScreen({ onOpenMember }: Props) {
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const profiles = useStoreState((s) => s.profiles);
  const checkIns = useStoreState((s) => s.checkIns);
  const posts = useStoreState((s) => s.posts);
  const cohort = useStoreState((s) => s.cohort);

  const members = useMemo(
    () => profiles.filter((p) => p.role === 'member' && p.cohortId === cohort.id),
    [profiles, cohort.id],
  );

  const profileById = useMemo(() => {
    const m = new Map<string, (typeof profiles)[number]>();
    for (const p of profiles) m.set(p.id, p);
    return m;
  }, [profiles]);

  const today = new Date();
  const weekStart = startOfWeek(today).getTime();
  const weekEnd = endOfWeek(today).getTime();

  const todaysCalls = useMemo(
    () =>
      checkIns
        .filter((c) => isSameDay(new Date(c.scheduledAt), today))
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [checkIns, today.toDateString()], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const callsThisWeek = useMemo(
    () =>
      checkIns.filter((c) => {
        const t = new Date(c.scheduledAt).getTime();
        return t >= weekStart && t < weekEnd;
      }),
    [checkIns, weekStart, weekEnd],
  );

  const attention = useMemo(
    () => membersNeedingAttention(members, checkIns, posts),
    [members, checkIns, posts],
  );

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">
        {greeting()}, {me.fullName.split(' ')[0]}
      </h2>
      <p className="text-muted text-[13.5px] mb-4">
        {members.length} members in the {cohort.name}
      </p>

      <Card>
        <Eyebrow>Today's calls</Eyebrow>
        {todaysCalls.length === 0 ? (
          <p className="text-muted text-[13.5px]">No check-ins on your calendar today.</p>
        ) : (
          <div className="space-y-3">
            {todaysCalls.map((c) => {
              const member = profileById.get(c.memberId);
              if (!member) return null;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onOpenMember(member.id)}
                  className="w-full flex items-center gap-3 text-left rounded-[14px] border border-line bg-white px-3 py-2.5 hover:border-sage transition-colors"
                >
                  <Avatar profile={member} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px]">{member.fullName}</div>
                    <div className="text-muted text-[12px]">
                      {formatTime(new Date(c.scheduledAt))} ·{' '}
                      {c.status === 'completed' ? 'recorded' : '15-min check-in'}
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C766B"
                    strokeWidth="2"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="grid grid-cols-3 divide-x divide-line">
          <Stat num={members.length} label="members" />
          <Stat num={callsThisWeek.length} label="calls this week" />
          <Stat num={attention.length} label={attention.length === 1 ? 'needs attention' : 'need attention'} tone={attention.length > 0 ? 'terra' : undefined} />
        </div>
      </Card>

      <Eyebrow className="mt-4 mb-2">Needs attention</Eyebrow>
      {attention.length === 0 ? (
        <Card>
          <p className="text-muted text-[13.5px]">
            Everyone's tracking. Quiet week from your side is a win.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {attention.map((a) => (
            <button
              key={a.member.id}
              type="button"
              onClick={() => onOpenMember(a.member.id)}
              className="w-full flex items-center gap-3 text-left rounded-card border border-line bg-white p-3.5 hover:border-sage transition-colors shadow-card"
            >
              <Avatar profile={a.member} size={44} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14.5px]">{a.member.fullName}</div>
                <div className="text-muted text-[12.5px] mt-0.5">
                  {a.reasons.join(' · ')}
                </div>
              </div>
              {typeof a.lastScore === 'number' && (
                <span className="inline-flex items-center bg-terra/10 text-terra text-[12px] font-semibold rounded-full px-3 py-1">
                  {a.lastScore}/10
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({
  num,
  label,
  tone,
}: {
  num: number;
  label: string;
  tone?: 'terra';
}) {
  return (
    <div className="px-3 first:pl-0 last:pr-0 text-center">
      <div
        className={[
          'font-serif text-[28px] font-semibold leading-none',
          tone === 'terra' ? 'text-terra' : 'text-green',
        ].join(' ')}
      >
        {num}
      </div>
      <div className="text-muted text-[11.5px] mt-1 leading-tight">{label}</div>
    </div>
  );
}
