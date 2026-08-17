import { useState } from 'react';
import { Button, Card, Eyebrow } from '@/components';
import { useData } from '@/services';
import type { Booking } from '@/types';

interface Props {
  booking: Booking;
  onBack: () => void;
}

/**
 * The T-21 connect step — the screen that makes the journey feel like a real
 * integration. Validates against the seeded reservation; the hint is on
 * screen because this is a demo, not a login.
 */
export function ConnectBookingScreen({ booking, onBack }: Props) {
  const data = useData();
  const [confirmation, setConfirmation] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState(false);
  const [connected, setConnected] = useState(false);

  const surnameOnFile = booking.guestName.trim().split(/\s+/).at(-1) ?? '';

  function submit() {
    const ok = data.connectBooking(confirmation, surname);
    if (ok) {
      setError(false);
      setConnected(true);
    } else {
      setError(true);
    }
  }

  if (connected) {
    return (
      <section className="px-5 pt-3 pb-7">
        <Eyebrow className="mt-1.5">Found you</Eyebrow>
        <h2 className="font-serif font-semibold text-[25px] leading-tight mb-4">
          {booking.guestName.split(' ')[0]}, you're booked.
        </h2>
        <Card tone="sage">
          <Eyebrow>Your booking</Eyebrow>
          <div className="font-serif font-semibold text-[20px] leading-tight">
            {booking.packageName}
          </div>
          <div className="text-[13.5px] mt-2 space-y-1">
            <div>{booking.roomType}</div>
            <div>
              Arrive {formatDate(booking.arrivalDate)} · {booking.arrivalWindow}
            </div>
            <div>Depart {formatDate(booking.departureDate)}</div>
            <div className="text-muted">Confirmation {booking.confirmationNumber}</div>
          </div>
        </Card>
        <Card>
          <p className="text-[14px] leading-relaxed">
            <span className="font-semibold">{booking.hostName}</span>, {booking.hostRole.toLowerCase().replace(/^your /, 'your ')},
            will walk with you from here. The countdown starts now.
          </p>
        </Card>
        <Button onClick={onBack}>Start the countdown</Button>
      </section>
    );
  }

  return (
    <section className="px-5 pt-3 pb-7">
      <BackRow onBack={onBack} />
      <h2 className="font-serif font-semibold text-[25px] leading-tight mb-1">
        Connect your booking
      </h2>
      <p className="text-muted text-[13.5px] mb-5">
        The confirmation number is on your booking email from Gwinganna.
      </p>

      <Card>
        <label className="block mb-4">
          <Eyebrow>Confirmation number</Eyebrow>
          <input
            className="w-full bg-transparent border-0 border-b border-line focus:border-green outline-none py-2 text-[17px] font-serif tracking-[0.06em]"
            inputMode="numeric"
            placeholder="e.g. 90210"
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value);
              setError(false);
            }}
          />
        </label>
        <label className="block">
          <Eyebrow>Surname on the booking</Eyebrow>
          <input
            className="w-full bg-transparent border-0 border-b border-line focus:border-green outline-none py-2 text-[17px] font-serif"
            placeholder="Surname"
            value={surname}
            onChange={(e) => {
              setSurname(e.target.value);
              setError(false);
            }}
          />
        </label>
      </Card>

      {error && (
        <p className="text-[13px] text-terra-deep mb-3 px-1">
          That doesn't match a reservation. Check the confirmation email and try again.
        </p>
      )}

      <Button onClick={submit} disabled={!confirmation.trim() || !surname.trim()}>
        Find my booking
      </Button>

      <p className="text-muted/80 text-[12px] text-center mt-4">
        Demo hint: {booking.confirmationNumber} · {surnameOnFile}
      </p>
    </section>
  );
}

function BackRow({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1 text-green-soft font-semibold text-[13.5px] mt-1.5 mb-3 transition hover:text-green"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Journey
    </button>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
