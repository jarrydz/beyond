import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { FOCUS_QUESTIONS } from '@/config/focusQuestions';
import type { PillarId } from '@/types';

/** What a completed check-in hands back — video path sets videoUrl, the no-camera path sets mood/note. */
export interface CheckInResult {
  videoUrl?: string;
  mood?: number;
  note?: string;
  /** PRD-06: answers to the two focus questions, keyed by question id. */
  focusAnswers?: Record<string, number>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (result: CheckInResult) => void;
  /**
   * PRD-06: the active goal's pillar. When set, one extra screen with the
   * two focus questions follows the send — BOTH paths (camera and
   * text/mood) converge on it, then on the same onSave. Absent = the step
   * never renders; the alumni check-in is untouched.
   */
  focusPillarId?: PillarId;
}

/** The no-camera mood scale — calm words, not a smiley barrage. */
const MOODS = [
  { value: 1, label: 'Rough' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
] as const;

const MAX_SECONDS = 30;
/**
 * How long we wait for the camera before giving up. Covers the failure mode
 * where the permission prompt is never answered — without this the
 * getUserMedia promise pends forever: black preview, dead record button,
 * no explanation.
 */
const CAMERA_TIMEOUT_MS = 8000;

/** Why the camera isn't available — each renders a message and a way forward. */
type CamState = 'requesting' | 'ready' | 'denied' | 'timeout';

export function DailyCheckInRecorder({ open, onClose, onSave, focusPillarId }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  /** Bumped on every acquire/cleanup so a stale getUserMedia can't win. */
  const attemptRef = useRef(0);

  const [phase, setPhase] = useState<'preview' | 'recording' | 'review'>('preview');
  const [camState, setCamState] = useState<CamState>('requesting');
  const [elapsed, setElapsed] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  /** 'video' records a selfie; 'text' is the first-class no-camera path; 'focus' is the shared final step. */
  const [mode, setMode] = useState<'video' | 'text' | 'focus'>('video');
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  /** The path's result, parked while the focus step runs — both paths converge here. */
  const pendingRef = useRef<CheckInResult | null>(null);
  const [focusAnswers, setFocusAnswers] = useState<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
    attemptRef.current++;
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setElapsed(0);
    setPhase('preview');
    setCamState('requesting');
    setMode('video');
    setMood(null);
    setNote('');
    pendingRef.current = null;
    setFocusAnswers({});
  }, [resultUrl]);

  const acquireCamera = useCallback(async () => {
    const attempt = ++attemptRef.current;
    setCamState('requesting');
    const gum = navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
      audio: true,
    });
    // If the request outlives the race (timeout fired, or the recorder was
    // closed) and then resolves, stop the tracks so the camera light goes off.
    let raceDone = false;
    let kept = false;
    gum.then((s) => {
      if (raceDone && !kept) s.getTracks().forEach((t) => t.stop());
    }).catch(() => {});
    try {
      const stream = await Promise.race([
        gum,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('camera-timeout')), CAMERA_TIMEOUT_MS),
        ),
      ]);
      raceDone = true;
      if (attempt !== attemptRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      kept = true;
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
      setCamState('ready');
    } catch (err) {
      raceDone = true;
      if (attempt !== attemptRef.current) return;
      setCamState(err instanceof Error && err.message === 'camera-timeout' ? 'timeout' : 'denied');
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    acquireCamera();
    return () => cleanup();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: getSupportedMime() });
    recorderRef.current = mr;
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setPhase('review');
    };
    mr.start(200);
    setPhase('recording');
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= MAX_SECONDS) {
          recorderRef.current?.stop();
          clearInterval(timerRef.current);
        }
        return next;
      });
    }, 1000);
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    recorderRef.current?.stop();
  }

  /**
   * Both paths route through here: with a focus pillar, park the result and
   * show the focus step; without one, save as always. One handler, no fork.
   */
  function finishPath(result: CheckInResult) {
    if (focusPillarId) {
      pendingRef.current = result;
      setMode('focus');
    } else {
      onSave(result);
    }
  }

  function handleSend() {
    finishPath({ videoUrl: resultUrl ?? undefined });
  }

  /** Switch to the no-camera path — release the camera, it isn't needed. */
  function goTextMode() {
    attemptRef.current++;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode('text');
  }

  function handleSendText() {
    if (mood == null) return;
    finishPath({ mood, note: note.trim() || undefined });
  }

  /** The focus step's exit — with answers, or skipped clean. Same award either way. */
  function handleFocusDone(skip: boolean) {
    const base = pendingRef.current ?? {};
    const answered = !skip && Object.keys(focusAnswers).length > 0;
    onSave(answered ? { ...base, focusAnswers } : base);
  }

  function handleRetake() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setElapsed(0);
    setPhase('preview');
    acquireCamera();
  }

  function handleClose() {
    cleanup();
    onClose();
  }

  if (!open) return null;

  if (mode === 'focus' && focusPillarId) {
    const questions = FOCUS_QUESTIONS[focusPillarId];
    return (
      <div className="absolute inset-0 z-[100] bg-cream flex flex-col">
        <section className="flex-1 overflow-y-auto px-6 pt-[110px] pb-8">
          <h2 className="font-serif font-semibold text-[23px] leading-tight">While it's fresh</h2>
          <p className="text-muted text-[13.5px] mt-1 mb-6">
            Two taps on today's focus. This is what your trend is made of.
          </p>

          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <div className="text-[11px] tracking-[0.13em] uppercase text-green-soft font-semibold mb-2.5">
                {q.prompt}
              </div>
              <div className="flex justify-between gap-1.5">
                {q.scale.map((label, idx) => {
                  const on = focusAnswers[q.id] === idx;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setFocusAnswers((a) => ({ ...a, [q.id]: idx }))
                      }
                      className="flex-1 flex flex-col items-center gap-1.5 transition active:scale-95"
                    >
                      <span
                        className={[
                          'w-full h-9 rounded-[10px] border grid place-items-center transition-colors',
                          on ? 'bg-green border-green' : 'bg-white border-line',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'w-2 h-2 rounded-full',
                            on ? 'bg-cream' : 'bg-line',
                          ].join(' ')}
                        />
                      </span>
                      <span
                        className={[
                          'text-[10.5px] font-semibold leading-tight text-center',
                          on ? 'text-green' : 'text-muted',
                        ].join(' ')}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <Button onClick={() => handleFocusDone(false)}>Send to coach</Button>
          <button
            type="button"
            onClick={() => handleFocusDone(true)}
            className="mt-3 w-full text-center text-[13.5px] text-muted py-2 font-semibold"
          >
            Skip today
          </button>
        </section>
      </div>
    );
  }

  if (mode === 'text') {
    return (
      <div className="absolute inset-0 z-[100] bg-cream flex flex-col">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-[56px] left-4 z-20 w-9 h-9 rounded-full bg-sand grid place-items-center transition active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <section className="flex-1 overflow-y-auto px-6 pt-[110px] pb-8">
          <h2 className="font-serif font-semibold text-[23px] leading-tight">Daily check-in</h2>
          <p className="text-muted text-[13.5px] mt-1 mb-6">
            No camera today — that still counts. How are you?
          </p>

          <div className="flex justify-between gap-2 mb-6">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                aria-pressed={mood === m.value}
                onClick={() => setMood(m.value)}
                className="flex-1 flex flex-col items-center gap-1.5 transition active:scale-95"
              >
                <span
                  className={[
                    'w-11 h-11 rounded-full border grid place-items-center font-serif font-semibold text-[15px] transition-colors',
                    mood === m.value
                      ? 'bg-green border-green text-cream'
                      : 'bg-white border-line text-muted',
                  ].join(' ')}
                >
                  {m.value}
                </span>
                <span
                  className={[
                    'text-[11px] font-semibold',
                    mood === m.value ? 'text-green' : 'text-muted',
                  ].join(' ')}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="Anything you want your coach to know? (optional)"
            className="w-full bg-white border border-line rounded-[14px] px-4 py-3 text-[14px] leading-relaxed resize-none outline-none focus:border-sage placeholder:text-muted/70 mb-5"
          />

          <Button onClick={handleSendText} disabled={mood == null}>
            Send to coach
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col">
      {/* camera / review */}
      <div className="flex-1 relative overflow-hidden rounded-2xl mx-3 mt-3">
        {/* close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur grid place-items-center transition active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        {camState === 'denied' || camState === 'timeout' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 text-sm text-center px-6 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p>
              {camState === 'denied'
                ? 'Camera access was declined — your check-in doesn’t need it.'
                : 'The camera isn’t responding — no need to wait on it.'}
            </p>
            <button
              type="button"
              onClick={goTextMode}
              className="mt-2 bg-white text-black font-semibold text-sm rounded-full px-6 py-2.5 transition active:scale-95"
            >
              Check in without camera
            </button>
            <button
              type="button"
              onClick={() => acquireCamera()}
              className="text-white font-semibold text-sm border border-white/30 rounded-full px-5 py-2 transition active:scale-95"
            >
              Try the camera again
            </button>
          </div>
        ) : phase === 'review' && resultUrl ? (
          <video
            src={resultUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            playsInline
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover -scale-x-100"
              autoPlay
              playsInline
              muted
            />
            {camState === 'requesting' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/60 text-sm animate-pulse">Connecting to your camera…</span>
              </div>
            )}
          </>
        )}

        {/* recording timer overlay */}
        {phase === 'recording' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3.5 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-semibold tabular-nums">
              {formatTimer(elapsed)} / 0:{MAX_SECONDS.toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* progress ring around elapsed */}
        {phase === 'recording' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <svg width="64" height="64" viewBox="0 0 64 64" className="drop-shadow-lg">
              <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="3" opacity="0.2" />
              <circle
                cx="32" cy="32" r="28"
                fill="none" stroke="white" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - elapsed / MAX_SECONDS)}`}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
          </div>
        )}
      </div>

      {/* bottom controls */}
      <div className="px-4 pt-4 pb-6 flex flex-col items-center justify-center gap-4">
        {phase === 'preview' && camState !== 'denied' && camState !== 'timeout' && (
          <button
            type="button"
            onClick={startRecording}
            disabled={camState !== 'ready'}
            aria-label="Record"
            className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center transition active:scale-95 disabled:opacity-40"
          >
            <span className="w-[56px] h-[56px] rounded-full bg-red-500" />
          </button>
        )}
        {phase === 'preview' && camState !== 'denied' && camState !== 'timeout' && (
          <button
            type="button"
            onClick={goTextMode}
            className="text-white/75 text-[13px] font-semibold underline underline-offset-4 transition active:scale-95"
          >
            Check in without camera
          </button>
        )}

        {phase === 'recording' && (
          <button
            type="button"
            onClick={stopRecording}
            className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center transition active:scale-95"
          >
            <span className="w-7 h-7 rounded-[6px] bg-red-500" />
          </button>
        )}

        {phase === 'review' && (
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleRetake}
              className="text-white text-sm font-semibold border border-white/30 rounded-full px-5 py-3 transition active:scale-95"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="bg-white text-black text-sm font-semibold rounded-full px-7 py-3 transition active:scale-95"
            >
              Send to coach
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimer(s: number): string {
  return `0:${s.toString().padStart(2, '0')}`;
}

function getSupportedMime(): string {
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return '';
}
