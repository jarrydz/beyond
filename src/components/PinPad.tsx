interface PinPadProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

export function PinPad({ value, onChange, length = 4 }: PinPadProps) {
  function press(key: (typeof KEYS)[number]) {
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '') return;
    if (value.length >= length) return;
    onChange(value + key);
  }

  return (
    <div className="select-none">
      <div className="flex justify-center gap-3 mb-7">
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          return (
            <div
              key={i}
              className={[
                'w-3.5 h-3.5 rounded-full transition-colors',
                filled ? 'bg-green' : 'bg-line',
              ].join(' ')}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />;
          const isDel = key === 'del';
          return (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              className={[
                'h-14 rounded-[16px] text-[22px] font-serif font-medium transition active:scale-[0.97]',
                isDel
                  ? 'text-muted bg-transparent'
                  : 'bg-white border border-line text-ink hover:border-sage',
              ].join(' ')}
              aria-label={isDel ? 'Delete' : `Digit ${key}`}
            >
              {isDel ? (
                <svg
                  className="mx-auto"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 5H10L3 12l7 7h11a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
                  <path d="m15 9-4 6m0-6 4 6" />
                </svg>
              ) : (
                key
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
