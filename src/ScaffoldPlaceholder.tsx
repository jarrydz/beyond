import { useState } from 'react';
import {
  BottomNav,
  BottomSheet,
  Button,
  ButtonRow,
  Card,
  Eyebrow,
  NavIcons,
  SheetSlot,
  useToast,
  type NavItem,
} from './components';
import { useData, useAi } from './services';
import { useStoreState } from './store/StoreProvider';
import type { AiSummary } from './types';
import { brand } from './config/brand';

/**
 * Phase 1 scaffolding view. Screens come in Phase 3.
 * This page lights up every base component (card, button, nav, toast, sheet)
 * and reads from the seeded store via dataService + aiService, so we can verify
 * the design tokens, store wiring, and services before building any real screens.
 */
const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: NavIcons.home },
  { key: 'group', label: 'Group', icon: NavIcons.group },
  { key: 'coach', label: 'Coach', icon: NavIcons.coach },
  { key: 'learn', label: 'Learn', icon: NavIcons.learn },
  { key: 'progress', label: 'Progress', icon: NavIcons.progress },
];

export function ScaffoldPlaceholder() {
  const data = useData();
  const ai = useAi();
  const toast = useToast();

  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const postCount = useStoreState((s) => s.posts.length);
  const memberCount = useStoreState((s) => s.profiles.filter((p) => p.role === 'member').length);
  const cohortName = useStoreState((s) => s.cohort.name);
  const retreatName = useStoreState((s) => s.cohort.retreatName);

  const [active, setActive] = useState('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const slots = [
    { label: 'Tomorrow · 7:00am', meta: 'Before your day starts' },
    { label: 'Wednesday · 12:30pm', meta: 'Lunch reset' },
    { label: 'Friday · 6:00pm', meta: 'Wind down the week' },
  ];

  async function runSummary() {
    setSummaryLoading(true);
    try {
      const s = await ai.summariseMember(me.id);
      setSummary(s);
      toast('AI summary generated');
    } finally {
      setSummaryLoading(false);
    }
  }

  function confirmBooking() {
    if (picked === null) {
      toast('Pick a time first');
      return;
    }
    const days = picked === 0 ? 1 : picked === 1 ? 2 : 4;
    const slot = new Date(Date.now() + days * 86_400_000);
    data.bookCheckIn(slot);
    setSheetOpen(false);
    setPicked(null);
    toast('Check-in booked with Lucy');
  }

  return (
    <>
      <section
        className="px-5 pt-2 pb-7"
        style={{ animation: 'beyond-fade-in 0.35s ease' }}
      >
        <h2 className="font-serif font-semibold text-[25px] tracking-tight mt-1.5 mb-0.5">
          {brand.name} — Phase 1 scaffold
        </h2>
        <p className="text-muted text-[13.5px] mb-4">
          Design tokens, base components, store + services. Screens come next.
        </p>

        <Card tone="dark">
          <Eyebrow className="!text-sage">Welcome</Eyebrow>
          <div className="font-serif font-semibold text-[22px] leading-tight mb-1.5">
            {brand.hero}
          </div>
          <p className="text-[13.5px] opacity-85 mb-3">{brand.lead}</p>
          <div className="text-[12.5px] opacity-70">{brand.cohortLabel}</div>
        </Card>

        <Card>
          <Eyebrow>Store check</Eyebrow>
          <div className="text-[14px] leading-relaxed">
            Signed in as <span className="font-semibold">{me.fullName}</span> ({me.role}) ·{' '}
            <span className="font-semibold">{cohortName}</span> at {retreatName}
          </div>
          <div className="text-muted text-[13px] mt-1">
            {memberCount} members · {postCount} seeded posts
          </div>
        </Card>

        <Card>
          <Eyebrow>Buttons</Eyebrow>
          <div className="space-y-2.5">
            <Button onClick={() => toast('Primary tapped')}>Primary action</Button>
            <Button variant="ghost" onClick={() => toast('Ghost tapped')}>
              Ghost action
            </Button>
            <Button variant="terra" onClick={() => toast('Terra tapped')}>
              Accent action
            </Button>
            <ButtonRow>
              <Button onClick={() => setSheetOpen(true)}>Open booking sheet</Button>
              <Button variant="ghost" onClick={() => toast('Hello from the toast')}>
                Show toast
              </Button>
            </ButtonRow>
          </div>
        </Card>

        <Card>
          <Eyebrow>aiService stub</Eyebrow>
          <p className="text-[13.5px] text-muted mb-3">
            Generates a canned AiSummary from {me.fullName}'s seeded check-ins.
          </p>
          <Button variant="ghost" onClick={runSummary} disabled={summaryLoading}>
            {summaryLoading ? 'Thinking…' : 'Summarise my month'}
          </Button>
          {summary && (
            <div className="mt-4 text-[13.5px] leading-relaxed">
              <div className="font-serif font-semibold text-[16px] mb-2">{summary.headline}</div>
              <div className="mb-2">
                <div className="text-[11px] uppercase tracking-[0.13em] text-green-soft font-semibold mb-1">
                  Wins
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {summary.wins.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <div className="text-[11px] uppercase tracking-[0.13em] text-terra font-semibold mb-1">
                  Watch outs
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {summary.watchOuts.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 pt-3 border-t border-line text-[13.5px]">
                <span className="font-semibold">Suggested focus:</span> {summary.suggestedFocus}
              </div>
            </div>
          )}
        </Card>

        <Card tone="sage">
          <Eyebrow>Card tones</Eyebrow>
          <p className="text-[13.5px]">Default, sage (this one), dark, and terra are all wired.</p>
        </Card>

        <Card tone="terra">
          <p className="font-serif text-[17px] leading-snug">
            You haven't waited for the next retreat to change. You're changing now.
          </p>
        </Card>

        <p className="text-muted text-[11.5px] text-center mt-4">
          Phase 1 of 6 · screens land in Phase 3
        </p>
      </section>

      <BottomNav items={navItems} active={active} onChange={setActive} />

      <BottomSheet
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setPicked(null);
        }}
        title="Book your 15-min check-in"
        subtitle="With Lucy. Pick a time that suits you."
        footer={
          <Button onClick={confirmBooking}>Confirm check-in</Button>
        }
      >
        {slots.map((s, i) => (
          <SheetSlot
            key={i}
            title={s.label}
            meta={s.meta}
            selected={picked === i}
            onClick={() => setPicked(i)}
          />
        ))}
      </BottomSheet>
    </>
  );
}
