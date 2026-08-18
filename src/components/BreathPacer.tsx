import { useEffect, useRef, useState } from 'react';
import { Button, Card, Eyebrow } from '.';
import type { ContentItem } from '@/types';

interface Pattern {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
}

interface Mode {
  key: string;
  label: string;
  detail: string;
  pattern: Pattern;
}

interface Props {
  item: ContentItem;
  onDone: () => void;
}

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Breathe in',
  hold1: 'Hold',
  exhale: 'Breathe out',
  hold2: 'Hold',
};

const ORDER: Phase[] = ['inhale', 'hold1', 'exhale', 'hold2'];

/**
 * The breathing engine (PRD-07): a circle that expands, holds, contracts,
 * holds, driven entirely by config. CSS/SVG only — no canvas, no animation
 * library, no sound. With config.modes the member picks a state first
 * (down-regulate ≠ up-regulate — the patterns genuinely differ).
 * Honours prefers-reduced-motion: label and countdown, no scaling.
 */
export function BreathPacer({ item, onDone }: Props) {
  const modes = item.config?.modes as Mode[] | undefined;
  const [mode, setMode] = useState<Mode | null>(null);

  const pattern: Pattern | null = modes
    ? mode?.pattern ?? null
    : (item.config as unknown as Pattern);

  if (modes && !pattern) {
    return (
      <>
        <Eyebrow>How are you arriving?</Eyebrow>
        <div className="space-y-2.5">
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m)}
              className="w-full text-left rounded-card border border-line bg-white shadow-card p-3.5 transition active:scale-[0.985] hover:border-sage"
            >
              <div className="font-serif font-semibold text-[17px] leading-tight">
                {m.label}
              </div>
              <div className="text-muted text-[12.5px] mt-1">{m.detail}</div>
            </button>
          ))}
        </div>
      </>
    );
  }

  if (!pattern) return null;
  return (
    <Pacer
      key={mode?.key ?? 'single'}
      pattern={pattern}
      intro={mode?.detail}
      onChangeMode={modes ? () => setMode(null) : undefined}
      onDone={onDone}
    />
  );
}

function Pacer({
  pattern,
  intro,
  onChangeMode,
  onDone,
}: {
  pattern: Pattern;
  intro?: string;
  onChangeMode?: () => void;
  onDone: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [cycle, setCycle] = useState(1);
  const [remaining, setRemaining] = useState(pattern.inhale);
  const [finished, setFinished] = useState(false);
  const doneRef = useRef(false);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One tick per second: count the phase down, roll to the next (skipping
  // zero-length holds), and close out after the final cycle.
  useEffect(() => {
    if (!running || finished) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        let i = ORDER.indexOf(phase);
        let nextPhase: Phase;
        let rolledCycle = false;
        do {
          i = (i + 1) % ORDER.length;
          nextPhase = ORDER[i];
          if (nextPhase === 'inhale') rolledCycle = true;
        } while (pattern[nextPhase] === 0);
        if (rolledCycle) {
          if (cycle >= pattern.cycles) {
            setFinished(true);
            setRunning(false);
            if (!doneRef.current) {
              doneRef.current = true;
              onDone();
            }
            return 0;
          }
          setCycle((c) => c + 1);
        }
        setPhase(nextPhase);
        return pattern[nextPhase];
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase, cycle, finished, pattern, onDone]);

  const expanded = phase === 'inhale' || (phase === 'hold1' && running);
  const phaseSeconds = pattern[phase];

  function start() {
    setPhase('inhale');
    setRemaining(pattern.inhale);
    setCycle(1);
    setFinished(false);
    setRunning(true);
  }

  return (
    <>
      {intro && <p className="text-muted text-[13px] text-center mb-4">{intro}</p>}

      <div className="grid place-items-center py-6">
        {reducedMotion ? (
          <div className="w-[190px] h-[190px] rounded-full border-2 border-line-alt grid place-items-center bg-white">
            <div className="text-center">
              <div className="font-serif font-semibold text-[21px]">
                {finished ? 'Done' : running ? PHASE_LABEL[phase] : 'Ready'}
              </div>
              {running && (
                <div className="text-muted text-[15px] tabular-nums mt-1">{remaining}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-[220px] h-[220px] grid place-items-center">
            <div
              className="w-[130px] h-[130px] rounded-full grid place-items-center"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #5C8A8F, #173238)',
                transform: running ? `scale(${expanded ? 1.5 : 1})` : 'scale(1.15)',
                transition: running
                  ? `transform ${phaseSeconds}s ease-in-out`
                  : 'transform 0.6s ease',
                boxShadow: '0 10px 40px rgba(18,38,43,0.3)',
              }}
            >
              <span className="text-white text-[13px] font-semibold text-center leading-tight px-3">
                {finished ? 'Done' : running ? PHASE_LABEL[phase] : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {finished ? (
        <Card tone="sage">
          <Eyebrow>Done</Eyebrow>
          <p className="text-[14.5px] leading-relaxed">
            {pattern.cycles} rounds, all the way through. Notice where your shoulders are now.
          </p>
        </Card>
      ) : (
        <p className="text-center text-muted text-[13px] mb-4">
          {running
            ? `Round ${cycle} of ${pattern.cycles}`
            : `${pattern.inhale} in · ${pattern.hold1 ? `${pattern.hold1} hold · ` : ''}${pattern.exhale} out${pattern.hold2 ? ` · ${pattern.hold2} hold` : ''}, ${pattern.cycles} rounds`}
        </p>
      )}

      {!finished && (
        <Button onClick={running ? () => setRunning(false) : start}>
          {running ? 'Stop' : 'Start'}
        </Button>
      )}
      {onChangeMode && (
        <button
          type="button"
          onClick={onChangeMode}
          className="mt-3 w-full text-center text-[13px] text-muted font-semibold py-1"
        >
          Pick a different state
        </button>
      )}
    </>
  );
}
