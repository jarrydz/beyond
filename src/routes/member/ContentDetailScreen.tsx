import { useState } from 'react';
import {
  Button,
  Card,
  Eyebrow,
  MediaPlaceholder,
  PillarBadge,
  Poster,
  VideoOverlay,
  useToast,
} from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { FOCUS_QUESTIONS } from '@/config/focusQuestions';
import { INTERACTIVE } from '@/content/registry';

interface Props {
  contentId: string;
  onBack: () => void;
  /** Cook-along: jump to the recipe for ingredients — reuse, never duplicate. */
  onOpenMeal?: (mealId: string) => void;
}

/**
 * One screen for all twelve (PRD-07), dispatching on format:
 * interactive → the registry; read → paragraphs; video/audio → the real
 * medium when mediaUrl exists, the honest placeholder when it doesn't.
 * Every path completes the item through the same markContentDone seam.
 */
export function ContentDetailScreen({ contentId, onBack, onOpenMeal }: Props) {
  const data = useData();
  const toast = useToast();
  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const item = useStoreState((s) => s.library.find((c) => c.id === contentId));
  useStoreState((s) => s.dailyCheckIns.length); // vars can depend on the log
  const [sheetOpen, setSheetOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  if (!item) return null;

  const done = item.doneBy.includes(me.id);

  function markDone() {
    if (item!.doneBy.includes(me.id)) return;
    data.markContentDone(item!.id);
    const award = data.awardPoints('content_complete', item!.id);
    toast(award ? `+${award.points} · ${award.label}` : 'Done. It stays in your library.');
  }

  // Personalisation tokens — data stays pure, substitution happens here.
  // {lightsOut}: the member's latest lights-out answer, as its scale label.
  const vars: Record<string, string> = {};
  const lightsOutIdx = [...data.getFocusHistory()]
    .reverse()
    .find((d) => d.focusAnswers?.sleep_lights_out != null)?.focusAnswers?.sleep_lights_out;
  vars.lightsOut =
    lightsOutIdx != null
      ? FOCUS_QUESTIONS.sleep[0].scale[lightsOutIdx].toLowerCase()
      : 'by 10:30';

  const Interactive = item.componentKey ? INTERACTIVE[item.componentKey] : undefined;
  const mealId = item.config?.mealId as string | undefined;

  return (
    <section style={{ paddingTop: 'var(--status-pad)' }} className="px-5 pb-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-muted text-[13px] font-semibold mb-3 -ml-1"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Library
      </button>

      <Poster item={item} className="rounded-card h-[150px] shadow-card mb-4">
        {(item.format === 'video' || (item.format === 'audio' && !item.mediaUrl)) && (
          <button
            type="button"
            aria-label={`Open ${item.format}`}
            onClick={() =>
              item.format === 'video' ? setVideoOpen(true) : setSheetOpen(true)
            }
            className="absolute inset-0 m-auto w-[54px] h-[54px] rounded-full bg-white/85 grid place-items-center transition active:scale-90"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3A5145" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        {item.durationMin && (
          <span className="absolute bottom-2.5 right-3 text-[11px] font-semibold text-white/90 bg-black/25 rounded-full px-2 py-0.5">
            {item.durationMin} min
          </span>
        )}
      </Poster>

      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="font-serif font-semibold text-[23px] leading-tight">{item.title}</h2>
        {done && (
          <span className="flex-none text-[11px] tracking-[0.1em] uppercase text-green font-semibold">
            Done ✓
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <PillarBadge pillarId={item.pillarId} />
        {item.presenter && (
          <span className="text-muted text-[12.5px]">with {item.presenter}</span>
        )}
      </div>
      {item.description && (
        <p className="text-muted text-[13.5px] leading-relaxed mb-5">{item.description}</p>
      )}

      {mealId && onOpenMeal && (
        <Button variant="ghost" className="mb-4" onClick={() => onOpenMeal(mealId)}>
          Ingredients — open the recipe
        </Button>
      )}

      {item.format === 'interactive' &&
        (Interactive ? (
          <Interactive item={item} vars={vars} onDone={markDone} />
        ) : (
          <Card>
            <p className="text-muted text-[13.5px]">
              This one isn't available in the app yet.
            </p>
          </Card>
        ))}

      {item.format === 'read' && (
        <>
          {(item.body ?? []).map((p) => (
            <p key={p.slice(0, 32)} className="text-[14.5px] leading-relaxed mb-4">
              {p}
            </p>
          ))}
          {done ? (
            <Button className="!bg-green-soft" onClick={() => toast('Already read.')}>
              Read ✓
            </Button>
          ) : (
            <Button onClick={markDone}>Mark as read</Button>
          )}
        </>
      )}

      {item.format === 'video' && (
        <Button onClick={() => setVideoOpen(true)}>Play the video</Button>
      )}
      {item.format === 'audio' &&
        (item.mediaUrl ? (
          <audio src={item.mediaUrl} controls className="w-full" onEnded={markDone} />
        ) : (
          <Button onClick={() => setSheetOpen(true)}>Play the audio</Button>
        ))}

      <MediaPlaceholder
        item={item}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          markDone();
        }}
      />
      <VideoOverlay
        item={item}
        open={videoOpen}
        onClose={() => {
          setVideoOpen(false);
          markDone();
        }}
      />
    </section>
  );
}
