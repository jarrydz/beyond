import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSED_KEY = 'beyond:install-dismissed';

/**
 * Captures the deferred beforeinstallprompt event (Chromium only) and shows a
 * small banner above the bottom nav, only on the in-app routes. iOS Safari
 * doesn't fire the event, so users there install via the share menu — nothing
 * for us to show in that case.
 */
export function InstallPrompt() {
  const location = useLocation();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY) === '1');
    } catch {
      // sessionStorage can be unavailable in private modes; banner just stays visible
    }

    function onBIP(e: Event) {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setEvent(null);
      try {
        sessionStorage.setItem(DISMISSED_KEY, '1');
      } catch { /* ignore */ }
    }
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const onAppRoute =
    location.pathname.startsWith('/m') || location.pathname.startsWith('/c');

  if (!event || dismissed || !onAppRoute) return null;

  async function install() {
    if (!event) return;
    try {
      await event.prompt();
      await event.userChoice;
    } finally {
      setEvent(null);
    }
  }

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch { /* ignore */ }
    setDismissed(true);
  }

  return (
    <div className="absolute left-3 right-3 bottom-[88px] z-[60] bg-ink text-cream rounded-[18px] px-3.5 py-3 flex items-center gap-3 shadow-phone">
      <div
        className="w-9 h-9 rounded-[12px] grid place-items-center flex-none"
        style={{ background: '#3A5145' }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4EFE7" strokeWidth="1.7">
          <path d="M12 21c5-4 8-7 8-11a4 4 0 0 0-8-1 4 4 0 0 0-8 1c0 4 3 7 8 11Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13px] leading-tight">Install Beyond</div>
        <div className="text-[11.5px] opacity-80 leading-snug">
          Open it like a real app from your home screen.
        </div>
      </div>
      <button
        type="button"
        onClick={install}
        className="bg-cream text-green-deep rounded-[10px] px-3 py-1.5 text-[12px] font-semibold flex-none transition active:scale-[0.95]"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="text-cream/70 hover:text-cream flex-none px-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
    </div>
  );
}
