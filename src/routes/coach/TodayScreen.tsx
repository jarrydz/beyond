import { useMemo, useState } from 'react';
import { Avatar, BottomSheet, Button, Card, Eyebrow, PillarBadge, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { formatTime, greeting } from '@/utils/format';
import { pillars } from '@/config/pillars';
import type { GuestBooking, PillarId } from '@/types';
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
  const data = useData();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const profiles = useStoreState((s) => s.profiles);
  const checkIns = useStoreState((s) => s.checkIns);
  const posts = useStoreState((s) => s.posts);
  const cohort = useStoreState((s) => s.cohort);
  // PRD-06: subscribed so the board recomputes on focus set / clock change.
  useStoreState((s) => s.guestFocus);
  useStoreState((s) => s.demoDayOffset);
  useStoreState((s) => s.goals);

  const board = data.getCoachBoard();
  const [openGuest, setOpenGuest] = useState<GuestBooking | null>(null);
  const [focusGuest, setFocusGuest] = useState<GuestBooking | null>(null);

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
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">
        {greeting()}, {me.fullName.split(' ')[0]}
      </h2>
      <p className="text-muted text-[13.5px] mb-4">
        {members.length} members in the {cohort.name}
      </p>

      {/* The roll-up strip — what Gwinganna reads over Lucy's shoulder.
          Computed entirely from booking + prep state; she does nothing extra. */}
      <Card>
        <Eyebrow>Next 7 days</Eyebrow>
        <div className="grid grid-cols-4 divide-x divide-line">
          <Stat num={board.rollup.arrivingNext7} label="arriving" />
          <Stat
            num={`${board.rollup.readyPct}%`}
            label="prep complete"
            tone={board.rollup.readyPct < 60 ? 'terra' : undefined}
          />
          <Stat num={board.rollup.erfDone} label="ERFs in" />
          <Stat num={board.rollup.tapersStarted} label="tapers started" />
        </div>
      </Card>

      <Eyebrow className="mt-4 mb-2">Arriving today</Eyebrow>
      {board.arrivingToday.length === 0 ? (
        <Card>
          <p className="text-muted text-[13.5px]">No arrivals today.</p>
        </Card>
      ) : (
        <div className="space-y-2 mb-1">
          {board.arrivingToday.map((g) => (
            <button
              key={g.booking.id}
              type="button"
              onClick={() => setOpenGuest(g)}
              className="w-full text-left rounded-card border border-line bg-white shadow-card p-3.5 hover:border-sage transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-[14.5px] truncate">{g.booking.guestName}</div>
                <span
                  className={[
                    'flex-none text-[11px] font-semibold rounded-full px-2.5 py-1',
                    g.requiredDone === g.requiredTotal
                      ? 'bg-[#F1F4ED] text-green'
                      : 'bg-terra/10 text-terra',
                  ].join(' ')}
                >
                  Prep {g.requiredDone}/{g.requiredTotal}
                </span>
              </div>
              <div className="text-muted text-[12.5px] mt-0.5">
                {g.booking.packageName} · {g.booking.roomType} · {g.booking.arrivalWindow}
              </div>
              <div className="mt-2">
                <PillarBadge pillarId={g.goalPillarId} />
              </div>
            </button>
          ))}
        </div>
      )}

      <Eyebrow className="mt-4 mb-2">Departing</Eyebrow>
      {board.departingSoon.length === 0 ? (
        <Card>
          <p className="text-muted text-[13.5px]">Nobody on property right now.</p>
        </Card>
      ) : (
        <div className="space-y-2 mb-1">
          {board.departingSoon.map((g) => (
            <div
              key={g.booking.id}
              className="rounded-card border border-line bg-white shadow-card p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-[14.5px] truncate">
                    {g.booking.guestName}
                  </div>
                  <div className="text-muted text-[12.5px] mt-0.5">
                    {g.departsInDays === 0
                      ? 'Departs today'
                      : g.departsInDays === 1
                        ? 'Departs tomorrow'
                        : `Departs in ${g.departsInDays} days`}{' '}
                    · {g.booking.packageName}
                  </div>
                </div>
                <PillarBadge pillarId={g.goalPillarId} />
              </div>
              {g.focusSet ? (
                <div className="mt-2.5 text-[12.5px] font-semibold text-green">
                  Focus set at departure ✓
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="mt-2.5 !py-2.5"
                  onClick={() => setFocusGuest(g)}
                >
                  Set their focus
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Card className="mt-4">
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

      <GuestSheet guest={openGuest} onClose={() => setOpenGuest(null)} />
      <SetFocusSheet guest={focusGuest} onClose={() => setFocusGuest(null)} />
    </section>
  );
}

/** Tapping an arrival opens the guest's goal and why — what they're coming for. */
function GuestSheet({ guest, onClose }: { guest: GuestBooking | null; onClose: () => void }) {
  if (!guest) return null;
  return (
    <BottomSheet
      open
      onClose={onClose}
      title={guest.booking.guestName}
      subtitle={`${guest.booking.packageName} · ${guest.booking.roomType} · arrives ${guest.booking.arrivalWindow}`}
    >
      <div className="mb-3">
        <PillarBadge pillarId={guest.goalPillarId} />
      </div>
      <Card tone="dark" className="!mb-3">
        <Eyebrow className="!text-sage">Their goal</Eyebrow>
        <p className="font-serif text-[19px] leading-snug">{guest.goalTitle}</p>
        {guest.goalWhy && (
          <p className="text-[14px] leading-relaxed text-cream/85 mt-2.5 italic">
            “{guest.goalWhy}”
          </p>
        )}
      </Card>
      <p className="text-muted text-[12.5px]">
        Prep {guest.requiredDone}/{guest.requiredTotal} ·{' '}
        {guest.erfDone ? 'ERF in' : 'ERF outstanding'} ·{' '}
        {guest.taperStarted ? 'taper started' : 'taper not started'}
      </p>
    </BottomSheet>
  );
}

/**
 * The departure handoff (PRD-06) — the action this PRD turns on. Pre-selects
 * the guest's own T-21 pick: confirming is one tap, changing is deliberate.
 */
function SetFocusSheet({ guest, onClose }: { guest: GuestBooking | null; onClose: () => void }) {
  const data = useData();
  const toast = useToast();
  const [pillarId, setPillarId] = useState<PillarId | null>(null);
  const [note, setNote] = useState('');

  if (!guest) return null;
  const selected = pillarId ?? guest.goalPillarId;

  function save() {
    data.setGuestFocus(guest!.booking.id, selected, note);
    toast(`Focus set — ${guest!.booking.guestName.split(' ')[0]} sees it on day 1 home.`);
    setPillarId(null);
    setNote('');
    onClose();
  }

  return (
    <BottomSheet
      open
      onClose={() => {
        setPillarId(null);
        setNote('');
        onClose();
      }}
      title={`Set their focus · ${guest.booking.guestName.split(' ')[0]}`}
      subtitle="Their own pick is pre-selected. Confirm it, or change it — you've watched them for five days."
      footer={<Button onClick={save}>{selected === guest.goalPillarId ? 'Confirm focus' : 'Change focus'}</Button>}
    >
      <div className="space-y-2 mb-4">
        {pillars.map((p) => {
          const on = p.id === selected;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPillarId(p.id)}
              className={[
                'w-full flex items-center justify-between text-left border rounded-[14px] px-[15px] py-[11px] bg-white transition-colors',
                on ? 'border-green bg-[#F1F4ED]' : 'border-line hover:border-sage',
              ].join(' ')}
            >
              <span className="font-semibold text-[14px]">{p.label}</span>
              {p.id === guest.goalPillarId && (
                <span className="text-[10.5px] tracking-[0.08em] uppercase text-muted font-semibold">
                  Their pick
                </span>
              )}
            </button>
          );
        })}
      </div>
      <label className="block">
        <div className="text-[11px] tracking-[0.13em] uppercase text-green-soft font-semibold mb-1.5">
          Your one line — they read it on day 1 home
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={160}
          placeholder='e.g. "You told me you wake at 3am. Everything else follows that."'
          className="w-full border border-line bg-white rounded-[12px] px-3 py-2.5 text-[13.5px] outline-none focus:border-sage resize-none"
        />
      </label>
    </BottomSheet>
  );
}

function Stat({
  num,
  label,
  tone,
}: {
  num: number | string;
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
