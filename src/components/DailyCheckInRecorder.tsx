import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (videoUrl?: string) => void;
}

const MAX_SECONDS = 30;

export function DailyCheckInRecorder({ open, onClose, onSave }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [phase, setPhase] = useState<'preview' | 'recording' | 'review'>('preview');
  const [elapsed, setElapsed] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
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
    setCameraError(false);
  }, [resultUrl]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: true,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) setCameraError(true);
      }
    })();
    return () => { cancelled = true; cleanup(); };
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

  function handleSend() {
    onSave(resultUrl ?? undefined);
  }

  function handleRetake() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setElapsed(0);
    setPhase('preview');
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        setCameraError(true);
      }
    })();
  }

  function handleClose() {
    cleanup();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 z-10">
        <button type="button" onClick={handleClose} className="text-white text-sm font-semibold">
          Cancel
        </button>
        <div className="text-white/70 text-xs font-semibold tracking-wide uppercase">
          Daily Check In
        </div>
        <div className="w-12" />
      </div>

      {/* camera / review */}
      <div className="flex-1 relative overflow-hidden rounded-2xl mx-3">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 text-sm text-center px-6 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <p>Camera access is needed to record your check-in.</p>
            <button type="button" onClick={handleClose} className="mt-2 text-white font-semibold text-sm border border-white/30 rounded-full px-5 py-2">
              Go back
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
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            autoPlay
            playsInline
            muted
          />
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
      <div className="px-4 pt-4 pb-6 flex items-center justify-center gap-6">
        {phase === 'preview' && (
          <button
            type="button"
            onClick={startRecording}
            className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center transition active:scale-95"
          >
            <span className="w-[56px] h-[56px] rounded-full bg-red-500" />
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
          <>
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
          </>
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
