import { useMemo, useState } from 'react';
import {
  Avatar,
  BottomSheet,
  Button,
  ButtonRow,
  Card,
  Eyebrow,
  Ring,
  SheetSlot,
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

  return (
    <>
      <section className="px-5 pt-3 pb-7">
        <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">Your coach</h2>
        <p className="text-muted text-[13.5px] mb-4">One-on-one support between retreats</p>

        <Card className="!text-center">
          <Avatar profile={coach} size={74} className="!mx-auto mt-1 mb-3" />
          <div className="font-serif font-semibold text-[20px]">{coach.fullName}</div>
          <div className="text-muted text-[13px] mb-3.5">
            Wellbeing leader · Gwinganna retreats
          </div>
          <ButtonRow>
            <Button onClick={() => setSheetOpen(true)}>Book a check-in</Button>
            <Button
              variant="ghost"
              onClick={() => toast(`Opening your chat with ${coach.fullName.split(' ')[0]}…`)}
            >
              Message
            </Button>
          </ButtonRow>
        </Card>

        {upcoming && (
          <Card>
            <Eyebrow>Upcoming</Eyebrow>
            <div className="flex items-center gap-3">
              <Ring value={1} max={1} size={50}>
                {weekdayShort(upcoming.scheduledAt)}
              </Ring>
              <div>
                <div className="font-semibold text-[14.5px]">15-min check-in</div>
                <div className="text-muted text-[12.5px]">
                  {formatCheckInTime(upcoming.scheduledAt)}
                </div>
              </div>
            </div>
          </Card>
        )}

        {past.length > 0 && (
          <>
            <Eyebrow className="mt-4 mb-2">Past check-ins</Eyebrow>
            <Card>
              {past.map((c, idx) => (
                <div
                  key={c.id}
                  className={[
                    'flex items-center gap-3 py-3.5',
                    idx === past.length - 1 ? '' : 'border-b border-line',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">
                      {idx === past.length - 1 ? 'Goal-setting call' : 'Progress call'}
                    </div>
                    <div className="text-muted text-[12px]">
                      {shortDate(c.scheduledAt)}
                      {c.topBlocker && ` · blocker: ${c.topBlocker}`}
                    </div>
                  </div>
                  {typeof c.goalScore === 'number' && (
                    <span className="inline-flex items-center bg-sand text-green text-[12px] font-semibold rounded-full px-3 py-1">
                      Goal {c.goalScore}/10
                    </span>
                  )}
                </div>
              ))}
            </Card>
          </>
        )}

        <Eyebrow className="mt-4 mb-2">AI summary of my month</Eyebrow>
        {summary ? (
          <Card>
            <div className="font-serif font-semibold text-[17px] leading-snug mb-3">
              {summary.headline}
            </div>
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-[0.13em] text-green-soft font-semibold mb-1.5">
                Wins
              </div>
              <ul className="space-y-1 text-[13.5px] leading-snug">
                {summary.wins.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-sage">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-[0.13em] text-terra font-semibold mb-1.5">
                Watch outs
              </div>
              <ul className="space-y-1 text-[13.5px] leading-snug">
                {summary.watchOuts.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-terra-soft">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-line text-[13.5px]">
              <span className="font-semibold">Suggested focus:</span> {summary.suggestedFocus}
            </div>
            <Button variant="ghost" className="!mt-4" onClick={runSummary} disabled={loadingSummary}>
              {loadingSummary ? 'Thinking…' : 'Refresh summary'}
            </Button>
          </Card>
        ) : (
          <Card>
            <p className="text-[13.5px] text-muted leading-relaxed mb-3">
              A short read on your last few check-ins — what's working, what's tripping you up,
              and where to put your attention next.
            </p>
            <Button variant="ghost" onClick={runSummary} disabled={loadingSummary}>
              {loadingSummary ? 'Thinking…' : 'Summarise my month'}
            </Button>
          </Card>
        )}
      </section>

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
