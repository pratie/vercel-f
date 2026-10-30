// Class strings for the public marketing pages (/tools, /alternatives,
// /affiliates). Same values as the landing page in app/page.tsx: white canvas,
// ink text, 2px ink border with a hard offset shadow, #d13800 under white text.

export const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4500]';

export const STICKER = 'rounded-2xl border-2 border-[#1c1917] bg-white shadow-[5px_5px_0_#1c1917]';

/** Quiet panel: same border weight, no shadow. */
export const PANEL = 'rounded-2xl border-2 border-[#1c1917]/[0.12] bg-white';

const PRESS =
  'transition-[transform,box-shadow,background-color] duration-150 motion-reduce:transition-none hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none';

export const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 h-12 shrink-0 rounded-xl px-6 text-[15px] font-semibold text-white bg-[#d13800] hover:bg-[#bf3400] ${PRESS} ${FOCUS}`;

export const BTN_SECONDARY = `inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border-2 border-[#1c1917] bg-white text-[14px] font-semibold text-[#1c1917] shadow-[3px_3px_0_#1c1917] hover:shadow-[4px_4px_0_#1c1917] ${PRESS} ${FOCUS}`;

/** The input row: one sticker holding the field and its button. */
export const INPUT_SHELL =
  'flex flex-col sm:flex-row gap-2 rounded-2xl border-2 border-[#1c1917] bg-white p-2 shadow-[5px_5px_0_#1c1917] transition-shadow focus-within:shadow-[5px_5px_0_#ff4500]';

export const INPUT =
  'w-full h-12 px-3.5 rounded-xl text-[16px] text-[#1c1917] placeholder:text-[#78716c] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500] focus-visible:ring-inset';

export const LINK = `font-semibold text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-4 hover:decoration-[#1c1917] rounded ${FOCUS}`;

// 336/544 is the logo PNG's ratio. Keep it or the mascot gets crushed.
export const logoHeight = (width: number) => Math.round((width * 336) / 544);
