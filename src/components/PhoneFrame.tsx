import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

/** True when the viewport is phone-sized — then we drop the fake device frame. */
export function useIsCompact(): boolean {
  const query = '(max-width: 480px)';
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}

/**
 * The phone shell from the prototype: rounded device, notch, status bar.
 * On a phone-sized screen the real device is the frame, so we go full-bleed —
 * no bezel, no notch, fills the viewport. On desktop we keep the framed look.
 * Screens slot in between the status bar and the bottom nav.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  const compact = useIsCompact();

  if (compact) {
    return (
      <div className="relative bg-cream overflow-hidden w-screen h-[100dvh]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-8 pb-14">
      <div
        className="relative bg-cream overflow-hidden w-[390px] max-w-full h-[800px]"
        style={{
          borderRadius: '46px',
          boxShadow:
            '0 18px 50px rgba(42,42,38,0.16), 0 0 0 12px #1c1b18, 0 0 0 13px #34322d',
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[26px] bg-[#1c1b18] rounded-b-2xl z-[60]" />
        <StatusBar />
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  const time = useLiveClock();
  return (
    <div className="absolute top-0 inset-x-0 h-[46px] flex items-center justify-between px-[26px] text-[12px] font-semibold z-[50]">
      <span>{time}</span>
      <span className="flex gap-1.5 items-center">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="6" width="3" height="5" rx="1" />
          <rect x="4.5" y="4" width="3" height="7" rx="1" />
          <rect x="9" y="2" width="3" height="9" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="22" height="11" viewBox="0 0 24 12" fill="none">
          <rect x="1" y="1" width="20" height="10" rx="3" stroke="currentColor" />
          <rect x="3" y="3" width="14" height="6" rx="1.5" fill="currentColor" />
          <rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}

import { useEffect, useState } from 'react';

function useLiveClock(): string {
  const fmt = () => {
    const d = new Date();
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

interface ScreenWrapProps {
  children: ReactNode;
  /** Reserve space at the bottom for the nav; off on screens without it. */
  withBottomNav?: boolean;
}

export function ScreenWrap({ children, withBottomNav = true }: ScreenWrapProps) {
  const compact = useIsCompact();
  return (
    <div
      className={[
        'absolute inset-x-0 overflow-y-auto overflow-x-hidden no-scrollbar',
        compact ? 'top-0' : 'top-[46px]',
        withBottomNav ? 'bottom-[76px]' : 'bottom-0',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
