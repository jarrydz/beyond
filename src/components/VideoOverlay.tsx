import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Poster } from '.';
import type { ContentItem } from '@/types';

interface Props {
  item: ContentItem;
  open: boolean;
  /** Dismissing completes the item where the caller wants it to (JZ's rule: the interaction completes). */
  onClose: () => void;
}

/**
 * The full-screen video surface: black background, the video (or its poster
 * while the recording is still coming — same honesty as MediaPlaceholder,
 * no fake buffering), a small back link top-left. Portals into the phone
 * frame like BottomSheet so "full screen" means the app's screen.
 */
export function VideoOverlay({ item, open, onClose }: Props) {
  // Black surface behind the frame's status bar — flip it to white while
  // open, restoring whatever state the screen underneath had set.
  useEffect(() => {
    if (!open) return;
    const bar = document.getElementById('frame-status-bar');
    const had = bar?.classList.contains('text-white');
    bar?.classList.add('text-white');
    return () => {
      if (!had) bar?.classList.remove('text-white');
    };
  }, [open]);

  if (!open) return null;
  const target = document.getElementById('sheet-portal') ?? document.body;

  return createPortal(
    <div className="absolute inset-0 z-[80] bg-black text-white flex flex-col">
      <div style={{ paddingTop: 'var(--status-pad)' }} className="px-5 flex-none">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-white/85 py-1 -ml-1 transition hover:text-white"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Back
        </button>
      </div>

      <div className="flex-1 grid place-items-center min-h-0">
        {item.mediaUrl ? (
          <video
            src={item.mediaUrl}
            controls
            autoPlay
            playsInline
            className="w-full max-h-full"
          />
        ) : (
          <div className="w-full">
            <Poster item={item} className="w-full aspect-video" />
            <p className="text-center text-white/55 text-[12.5px] leading-relaxed px-10 mt-6">
              The recording lands here when it&rsquo;s filmed — the shelf is real, the
              video is coming.
            </p>
          </div>
        )}
      </div>

      <div className="flex-none px-6 pb-9 text-center">
        <div className="font-serif text-[19px] leading-tight">{item.title}</div>
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-white/50 mt-1.5">
          {[item.durationMin ? `${item.durationMin} min` : null, item.presenter]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
    </div>,
    target,
  );
}
