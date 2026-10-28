/**
 * The app's "sticker" language: a 2px ink border and a hard offset shadow.
 * One place for the class strings so every signed-in screen uses the same
 * primary button, secondary button, quiet text button and panel.
 */

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2';

const PRESS =
  'transition-[transform,box-shadow] duration-150 motion-reduce:transition-none ' +
  'hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#1c1917] ' +
  'active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#1c1917] ' +
  'disabled:opacity-50 disabled:pointer-events-none';

/** Solid orange sticker. One per screen. */
export const BTN_PRIMARY =
  `inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border-2 border-[#1c1917] bg-[#d13800] text-white text-[13px] font-semibold shadow-[3px_3px_0_#1c1917] ${PRESS} ${FOCUS}`;

/** White sticker for the second most important action. */
export const BTN_SECONDARY =
  `inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl border-2 border-[#1c1917] bg-white text-ink-900 text-[13px] font-semibold shadow-[3px_3px_0_#1c1917] ${PRESS} ${FOCUS}`;

/** Text button for everything else. */
export const BTN_QUIET =
  `inline-flex items-center justify-center gap-1.5 h-10 px-2.5 rounded-lg text-[13px] font-medium text-ink-600 transition-colors hover:bg-[#f7f6f4] hover:text-ink-900 disabled:opacity-40 disabled:pointer-events-none ${FOCUS}`;

/** The hero panel of a screen. */
export const STICKER_PANEL = 'rounded-2xl border-2 border-[#1c1917] bg-white shadow-[6px_6px_0_#1c1917]';

/** Supporting panels: same border weight, no shadow, softer ink. */
export const PANEL = 'rounded-2xl border-2 border-[#1c1917]/[0.12] bg-white';

/** Form fields. */
export const FIELD =
  'h-10 rounded-xl border-2 border-[#1c1917]/[0.12] bg-white px-3 text-[13.5px] text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none focus:border-[#1c1917]';
