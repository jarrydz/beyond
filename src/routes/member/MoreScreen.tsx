import type { ReactNode } from 'react';
import { Sheet, WaterHeader } from '@/components';

interface Props {
  onOpenMarketplace: () => void;
  onOpenProfile: () => void;
  /** Present only when a booking exists — the PRD-05 demo stage switcher. */
  onOpenStageSheet?: () => void;
  /** Demo member switcher — the two personas (guest / alumna). */
  onOpenMemberSheet?: () => void;
}

/**
 * The overflow tab — a calm list of secondary surfaces (deliberately roomy so
 * later features land here instead of growing the nav). Marketplace lives
 * here by decision (JZ, 2026-07-03): Community keeps its primary tab.
 */
export function MoreScreen({ onOpenMarketplace, onOpenProfile, onOpenStageSheet, onOpenMemberSheet }: Props) {
  return (
    <>
      <WaterHeader depth="deep" eyebrow="More">
        <h1 className="font-serif font-normal text-[30px] leading-[1.05]">More</h1>
        <p className="text-[12.5px] text-white/[.62] mt-1.5">
          The rest of Beyond, out of the way.
        </p>
      </WaterHeader>
      <Sheet>

      <div className="space-y-3">
        <MoreRow
          title="Marketplace"
          subtitle="Recommended products from the retreat"
          onClick={onOpenMarketplace}
          icon={
            <svg viewBox="0 0 24 24">
              <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8Z" />
              <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
            </svg>
          }
        />
        <MoreRow
          title="Profile"
          subtitle="Your account, points and orders"
          onClick={onOpenProfile}
          icon={
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
          }
        />
        {onOpenStageSheet && (
          <MoreRow
            title="Journey stage (demo)"
            subtitle="Demo control — move the simulated clock"
            onClick={onOpenStageSheet}
            icon={
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.5" />
                <path d="M12 7.5V12l3 2" />
              </svg>
            }
          />
        )}
        {onOpenMemberSheet && (
          <MoreRow
            title="Member (demo)"
            subtitle="Demo control — guest or alumna persona"
            onClick={onOpenMemberSheet}
            icon={
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="8.5" r="3" />
                <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
                <circle cx="17" cy="10" r="2.4" />
                <path d="M14.5 19.5a4.6 4.6 0 0 1 6 0" />
              </svg>
            }
          />
        )}
      </div>
      </Sheet>
    </>
  );
}

function MoreRow({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-card border border-line bg-white shadow-card p-3.5 flex items-center gap-3.5 transition active:scale-[0.985] hover:border-sage"
    >
      <div className="w-12 h-12 rounded-[16px] bg-sand grid place-items-center flex-none text-green">
        <span className="w-6 h-6 block [&_svg]:w-6 [&_svg]:h-6 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif font-semibold text-[17px] leading-tight">{title}</div>
        <div className="text-muted text-[12.5px] mt-0.5">{subtitle}</div>
      </div>
      <svg
        className="w-4 h-4 flex-none text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
