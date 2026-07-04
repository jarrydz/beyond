import type { ReactNode } from 'react';

interface Props {
  onOpenMarketplace: () => void;
  onOpenProfile: () => void;
}

/**
 * The overflow tab — a calm list of secondary surfaces (deliberately roomy so
 * later features land here instead of growing the nav). Marketplace lives
 * here by decision (JZ, 2026-07-03): Community keeps its primary tab.
 */
export function MoreScreen({ onOpenMarketplace, onOpenProfile }: Props) {
  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">More</h2>
      <p className="text-muted text-[13.5px] mb-4">The rest of Beyond, out of the way.</p>

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
      </div>
    </section>
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
