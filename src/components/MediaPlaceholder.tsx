import { BottomSheet, Button } from '.';
import type { ContentItem } from '@/types';

interface Props {
  item: ContentItem;
  open: boolean;
  /** Dismissing completes the item (JZ's rule: the interaction completes). */
  onClose: () => void;
}

/**
 * The honest stand-in for video/audio with no mediaUrl yet (PRD-07
 * decision 8). Says what it is — no spinner, no progress bar, no fake
 * buffering. A player that never plays is a bug report; a card that says
 * what it is, is a prototype.
 */
export function MediaPlaceholder({ item, open, onClose }: Props) {
  const kind = item.format === 'audio' ? 'audio' : 'video';
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`This is where the ${kind} plays.`}
      subtitle={[
        item.durationMin ? `${item.durationMin} min` : null,
        item.presenter ? `with ${item.presenter}` : null,
      ]
        .filter(Boolean)
        .join(' · ')}
    >
      {item.description && (
        <p className="text-[14px] leading-relaxed mb-4">{item.description}</p>
      )}
      <p className="text-muted text-[12.5px] mb-4">
        The recording lands here when it's filmed — the shelf is real, the {kind} is coming.
      </p>
      <Button onClick={onClose}>Got it</Button>
    </BottomSheet>
  );
}
