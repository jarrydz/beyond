/**
 * The outbound programme, as a window (PRD-06). The message is the trigger;
 * the app is the payoff — the real engine is 2× weekly SMS/WhatsApp, one
 * weekly send, one short video from the host. Four touches, not seven:
 * restraint is the brand.
 *
 * NONE of these channels exist in the prototype and this card does not fake
 * them — no inbox, no thread, no notifications. It makes the operating
 * model legible: these arrive on your phone, not here.
 */
export interface WeekTouch {
  /** 0 = Sunday … 6 = Saturday, matching Date.getDay(). */
  weekday: number;
  dayLabel: string;
  channel: string;
  text: string;
}

export const YOUR_WEEK: WeekTouch[] = [
  { weekday: 1, dayLabel: 'Mon', channel: 'SMS', text: 'A nudge on your focus' },
  { weekday: 3, dayLabel: 'Wed', channel: 'The send', text: 'The weekly letter, with audio' },
  { weekday: 4, dayLabel: 'Thu', channel: 'WhatsApp', text: 'One question, one tap back' },
  { weekday: 0, dayLabel: 'Sun', channel: 'From Lucy', text: '90 seconds for the week ahead' },
];

export const YOUR_WEEK_NOTE = 'Sent to your phone, not here.';
