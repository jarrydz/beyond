import { useMemo, useState } from 'react';
import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  Eyebrow,
  useToast,
} from '@/components';
import { useAi, useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import type { AiSummary } from '@/types';
import { shortDate } from '@/utils/format';

interface Props {
  memberId: string;
  onBack: () => void;
}

export function MemberDetail({ memberId, onBack }: Props) {
  const ai = useAi();
  const toast = useToast();

  const member = useStoreState((s) => s.profiles.find((p) => p.id === memberId));
  const allGoals = useStoreState((s) => s.goals);
  const allCheckIns = useStoreState((s) => s.checkIns);

  const goals = useMemo(
    () => allGoals.filter((g) => g.profileId === memberId),
    [allGoals, memberId],
  );
  const memberCheckIns = useMemo(
    () =>
      [...allCheckIns]
        .filter((c) => c.memberId === memberId)
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    [allCheckIns, memberId],
  );

  const activeGoal = useMemo(() => goals.find((g) => g.active), [goals]);
  const completed = useMemo(
    () => memberCheckIns.filter((c) => c.status === 'completed'),
    [memberCheckIns],
  );
  const upcoming = useMemo(
    () =>
      [...memberCheckIns]
        .filter((c) => c.status === 'upcoming')
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0],
    [memberCheckIns],
  );

  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);

  async function runSummary() {
    setLoadingSummary(true);
    try {
      setSummary(await ai.summariseMember(memberId));
    } finally {
      setLoadingSummary(false);
    }
  }

  function handleRecorded() {
    setRecordOpen(false);
    toast('Check-in recorded');
    // Refresh summary if one was shown — it should reflect the new check-in.
    if (summary) runSummary();
  }

  if (!member) {
    return (
      <section className="px-5 pt-3 pb-7">
        <p className="text-muted">Member not found.</p>
        <Button variant="ghost" className="!mt-4" onClick={onBack}>
          Back to roster
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="px-5 pt-3 pb-7">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12.5px] text-muted font-semibold mb-3 mt-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 6-6 6 6 6" />
          </svg>
          Roster
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Avatar profile={member} size={56} />
          <div className="flex-1 min-w-0">
            <h2 className="font-serif font-semibold text-[22px] leading-tight">
              {member.fullName}
            </h2>
            <p className="text-muted text-[12.5px]">
              {member.onboarded ? 'Onboarded · ' : 'Not onboarded · '}
              {completed.length} check-ins
            </p>
          </div>
        </div>

        <Button onClick={() => setRecordOpen(true)}>Record a check-in</Button>

        {activeGoal && (
          <Card className="!mt-4">
            <Eyebrow>Active goal</Eyebrow>
            <div className="font-serif font-semibold text-[18px] leading-tight">
              {activeGoal.title}
            </div>
            {activeGoal.target && (
              <div className="text-muted text-[12.5px] mt-1">{activeGoal.target}</div>
            )}
          </Card>
        )}

        {upcoming && (
          <Card>
            <Eyebrow>Upcoming check-in</Eyebrow>
            <div className="text-[14px] font-semibold">{shortDate(upcoming.scheduledAt)}</div>
            <div className="text-muted text-[12.5px]">
              {new Date(upcoming.scheduledAt).toLocaleString(undefined, {
                weekday: 'long',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          </Card>
        )}

        <Eyebrow className="mt-4 mb-2">Check-in history</Eyebrow>
        {completed.length === 0 ? (
          <Card>
            <p className="text-muted text-[13.5px]">No completed check-ins yet.</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {completed.map((c) => (
              <Card key={c.id} className="!mb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px]">{shortDate(c.scheduledAt)}</div>
                    {c.topBlocker && (
                      <div className="text-muted text-[12.5px] mt-0.5">
                        Blocker: {c.topBlocker}
                      </div>
                    )}
                    {c.commitment && (
                      <div className="text-[13px] mt-1.5">
                        <span className="text-green-soft font-semibold">Commitment:</span>{' '}
                        {c.commitment}
                      </div>
                    )}
                    {c.notes && (
                      <div className="text-[13px] text-muted leading-snug mt-1.5">{c.notes}</div>
                    )}
                  </div>
                  {typeof c.goalScore === 'number' && (
                    <span className="inline-flex items-center bg-sand text-green text-[12px] font-semibold rounded-full px-3 py-1 flex-none">
                      {c.goalScore}/10
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Eyebrow className="mt-4 mb-2">AI summary</Eyebrow>
        {summary ? (
          <Card>
            <div className="font-serif font-semibold text-[16px] leading-snug mb-2">
              {summary.headline}
            </div>
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-[0.13em] text-green-soft font-semibold mb-1">
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
              <div className="text-[11px] uppercase tracking-[0.13em] text-terra font-semibold mb-1">
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
              Read the last few check-ins back as a single picture before you call them.
            </p>
            <Button variant="ghost" onClick={runSummary} disabled={loadingSummary}>
              {loadingSummary ? 'Thinking…' : "Summarise this member's month"}
            </Button>
          </Card>
        )}
      </section>

      <RecordCheckInSheet
        open={recordOpen}
        memberId={member.id}
        memberFirstName={member.fullName.split(' ')[0]}
        onClose={() => setRecordOpen(false)}
        onSaved={handleRecorded}
      />
    </>
  );
}

interface RecordProps {
  open: boolean;
  memberId: string;
  memberFirstName: string;
  onClose: () => void;
  onSaved: () => void;
}

function RecordCheckInSheet({ open, memberId, memberFirstName, onClose, onSaved }: RecordProps) {
  const data = useData();
  const toast = useToast();
  const [score, setScore] = useState<number | null>(null);
  const [blocker, setBlocker] = useState('');
  const [commitment, setCommitment] = useState('');
  const [notes, setNotes] = useState('');

  function reset() {
    setScore(null);
    setBlocker('');
    setCommitment('');
    setNotes('');
  }

  function save() {
    if (score === null) {
      toast('Pick a goal score');
      return;
    }
    data.recordCheckIn({
      memberId,
      goalScore: score,
      topBlocker: blocker.trim() || undefined,
      commitment: commitment.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    reset();
    onSaved();
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={`Record check-in · ${memberFirstName}`}
      subtitle="Logs a completed check-in. The member sees it on Home + Progress."
      footer={<Button onClick={save}>Save check-in</Button>}
    >
      <div className="mb-4">
        <div className="text-[11px] tracking-[0.13em] uppercase text-green-soft font-semibold mb-2">
          Goal score
        </div>
        <div className="grid grid-cols-11 gap-1.5">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              className={[
                'h-9 rounded-[10px] text-[13px] font-semibold transition',
                score === n
                  ? 'bg-green text-cream'
                  : 'bg-white border border-line text-ink hover:border-sage',
              ].join(' ')}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Field label="Top blocker" placeholder="e.g. late screens" value={blocker} onChange={setBlocker} />
      <Field
        label="Commitment"
        placeholder="What did they commit to next?"
        value={commitment}
        onChange={setCommitment}
      />
      <Field
        label="Notes"
        placeholder="Anything you'd want to remember"
        value={notes}
        onChange={setNotes}
        textarea
      />
    </BottomSheet>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  textarea,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block mb-3">
      <div className="text-[11px] tracking-[0.13em] uppercase text-green-soft font-semibold mb-1.5">
        {label}
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border border-line bg-white rounded-[12px] px-3 py-2.5 text-[13.5px] outline-none focus:border-sage resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-line bg-white rounded-[12px] px-3 py-2.5 text-[13.5px] outline-none focus:border-sage"
        />
      )}
    </label>
  );
}
