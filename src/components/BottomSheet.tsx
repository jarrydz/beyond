import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

function usePortalTarget() {
  const ref = useRef<HTMLElement | null>(null);
  if (!ref.current) {
    const el = document.getElementById('sheet-portal');
    ref.current = el ?? document.body;
  }
  return ref.current;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: BottomSheetProps) {
  const target = usePortalTarget();
  if (!open) return null;

  return createPortal(
    <div className="absolute inset-0 z-[75]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(28,27,24,0.45)] cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 bg-cream rounded-t-sheet px-[22px] pt-[22px] pb-[26px]"
        style={{ animation: 'beyond-sheet-up 0.3s ease' }}
      >
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />
        {title && (
          <h3 className="font-serif font-semibold text-[20px] mb-1">{title}</h3>
        )}
        {subtitle && <p className="text-muted text-[13px] mb-4">{subtitle}</p>}
        {children}
        {footer && <div className="mt-2">{footer}</div>}
      </div>
    </div>,
    target,
  );
}

interface SlotProps {
  title: ReactNode;
  meta?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export function SheetSlot({ title, meta, selected = false, onClick }: SlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center justify-between text-left border rounded-[14px] px-[15px] py-[13px] mb-[9px] bg-white transition-colors',
        selected ? 'border-green bg-[#F1F4ED]' : 'border-line hover:border-sage',
      ].join(' ')}
    >
      <div>
        <div className="font-semibold text-sm">{title}</div>
        {meta && <div className="text-muted text-[12px]">{meta}</div>}
      </div>
      <div
        className={[
          'w-5 h-5 rounded-full border-2 flex-none',
          selected ? 'border-green bg-green' : 'border-line bg-transparent',
        ].join(' ')}
      />
    </button>
  );
}
