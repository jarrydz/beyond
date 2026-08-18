import { useMemo, useState } from 'react';
import {
  BottomSheet,
  Button,
  ScorePill,
  SectionHeader,
  Sheet,
  SheetSlot,
  StatusChip,
  WaterHeader,
  useToast,
} from '@/components';
import { useAi, useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { formatCheckInTime, shortDate } from '@/utils/format';
import type { AiSummary } from '@/types';

interface SlotOption {
  label: string;
  meta: string;
  /** Hours from now. */
  offsetHours: number;
}

const SLOTS: SlotOption[] = [
  { label: 'Tomorrow · 7:00am', meta: 'Before your day starts', offsetHours: 24 + 7 - new Date().getHours() },
  { label: 'Wednesday · 12:30pm', meta: 'Lunch reset', offsetHours: 48 + 12.5 - new Date().getHours() },
  { label: 'Friday · 6:00pm', meta: 'Wind down the week', offsetHours: 96 + 18 - new Date().getHours() },
];

/**
 * Your Coach (design refresh): identity and actions live in the water
 * header — portrait circle with serif initials (photograph when one
 * exists), acid Book pill, outlined Message. The sheet carries the
 * upcoming session card, the past check-in log rows and the coach's note.
 * All booking / AI logic unchanged.
 */
export function CoachScreen() {
  const data = useData();
  const ai = useAi();
  const toast = useToast();

  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const coach = useStoreState(
    (s) => s.profiles.find((p) => p.role === 'coach' && p.cohortId === s.cohort.id)!,
  );
  const checkIns = useStoreState((s) => s.checkIns);
  const myCheckIns = useMemo(
    () =>
      [...checkIns]
        .filter((c) => c.memberId === me.id)
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [checkIns, me.id],
  );
  const upcoming = myCheckIns.find((c) => c.status === 'upcoming');
  const past = useMemo(
    () =>
      myCheckIns
        .filter((c) => c.status === 'completed')
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [myCheckIns],
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<number | null>(null);
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  function confirmBooking() {
    if (pickedSlot === null) {
      toast('Pick a time first');
      return;
    }
    const slot = SLOTS[pickedSlot];
    const when = new Date(Date.now() + slot.offsetHours * 3_600_000);
    data.bookCheckIn(when);
    setSheetOpen(false);
    setPickedSlot(null);
    toast(`Check-in booked with ${coach.fullName.split(' ')[0]} ✓`);
  }

  async function runSummary() {
    setLoadingSummary(true);
    try {
      const s = await ai.summariseMember(me.id);
      setSummary(s);
    } finally {
      setLoadingSummary(false);
    }
  }

  const coachInitials = coach.fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <>
      <WaterHeader depth="deep" eyebrow="Your coach">
        <div className="flex items-center gap-4 mb-5">
          {/* Portrait slot — gradient + serif initials until the real photo lands. */}
          <div
            className="w-[78px] h-[78px] rounded-full grid place-items-center flex-none font-serif text-[26px] text-white/90"
            style={{
              background: 'linear-gradient(160deg, #5C8A8F, #2C5259)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.3)',
            }}
          >
            {coachInitials}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif font-normal text-[30px] leading-[1.05]">
              {coach.fullName}
            </h1>
            <p className="text-[12.5px] text-white/[.68] mt-1">
              Wellbeing leader · Gwinganna
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="acid" className="flex-1 !py-3" onClick={() => setSheetOpen(true)}>
            Book a check-in
          </Button>
          <Button
            inline
            variant="outline-dark"
            className="px-6 !py-3"
            onClick={() => toast(`Opening your chat with ${coach.fullName.split(' ')[0]}…`)}
          >
            Message
          </Button>
        </div>
      </WaterHeader>

      <Sheet>
        {upcoming && (
          <>
            <SectionHeader>Upcoming</SectionHeader>
            <div className="flex items-center gap-4 rounded-card border-[1.5px] border-ink p-4 mb-6">
              <div className="pr-4 border-r border-line text-center flex-none">
                <div className="font-mono text-[9px] font-semibold uppercase text-quiet">
                  {weekdayShort(upcoming.scheduledAt)}
                </div>
                <div className="font-serif text-[26px] leading-none mt-0.5">
                  {new Date(upcoming.scheduledAt).getDate()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-medium text-[18px] leading-tight">
                  15-min check-in
                </div>
                <div className="text-[12px] text-muted mt-0.5">
                  {formatCheckInTime(upcoming.scheduledAt)}
                </div>
              </div>
              <StatusChip tone="acid">Confirmed</StatusChip>
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <SectionHeader count={past.length}>Past check-ins</SectionHeader>
            <div className="mb-6">
              {past.map((c, idx) => (
                <div
                  key={c.id}
                  className={[
                    'flex items-center gap-3.5 py-4 border-t border-line',
                    idx === past.length - 1 ? 'border-b' : '',
                  ].join(' ')}
                >
                  <span className="font-mono text-[9px] font-semibold uppercase text-quiet w-[44px] flex-none">
                    {shortDate(c.scheduledAt)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-serif font-medium text-[17px] leading-tight text-ink">
                      {idx === past.length - 1 ? 'Goal-setting call' : 'Progress call'}
                    </span>
                    {c.topBlocker && (
                      <span className="block text-[12px] text-muted mt-0.5">
                        Blocker: {c.topBlocker}.
                      </span>
                    )}
                  </span>
                  {typeof c.goalScore === 'number' && <ScorePill>{c.goalScore}/10</ScorePill>}
                </div>
              ))}
            </div>
          </>
        )}

        {summary ? (
          <div className="rounded-card bg-grey-50 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted mb-2.5">
              From {coach.fullName.split(' ')[0]}
            </div>
            <p className="font-serif text-[16px] leading-[1.45] text-ink mb-2">
              {summary.headline}
            </p>
            <p className="text-[12.5px] text-muted leading-relaxed mb-1.5">
              {summary.wins[0]} {summary.watchOuts[0] !== 'Nothing flagged.' && `Watch: ${summary.watchOuts[0]?.toLowerCase()}`}
            </p>
            <p className="text-[12.5px] text-muted leading-relaxed mb-3">
              Suggested focus: {summary.suggestedFocus}
            </p>
            <button
              type="button"
              onClick={runSummary}
              disabled={loadingSummary}
              className="text-[12.5px] font-semibold text-ink underline underline-offset-[3px]"
            >
              {loadingSummary ? 'Thinking…' : 'Refresh the note'}
            </button>
          </div>
        ) : (
          <div className="rounded-card bg-grey-50 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted mb-2.5">
              From {coach.fullName.split(' ')[0]}
            </div>
            <p className="font-serif text-[16px] leading-[1.45] text-ink mb-3">
              A short read on your last few check-ins — what's working, what's tripping you
              up, and where to put your attention next.
            </p>
            <button
              type="button"
              onClick={runSummary}
              disabled={loadingSummary}
              className="text-[12.5px] font-semibold text-ink underline underline-offset-[3px]"
            >
              {loadingSummary ? 'Thinking…' : 'Read the note'}
            </button>
          </div>
        )}
      </Sheet>

      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setPickedSlot(null);
        }}
        title="Book your 15-min check-in"
        subtitle={`With ${coach.fullName.split(' ')[0]}. Pick a time that suits you.`}
        footer={<Button onClick={confirmBooking}>Confirm check-in</Button>}
      >
        {SLOTS.map((slot, i) => (
          <SheetSlot
            key={i}
            title={slot.label}
            meta={slot.meta}
            selected={pickedSlot === i}
            onClick={() => setPickedSlot(i)}
          />
        ))}
      </BottomSheet>
    </>
  );
}

function weekdayShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' });
}
