'use client';

// ---------------------------------------------------------------------------
// STEP ANIMATIONS  (landing page, "How it works")
//
// Three small inline SVGs, one per step, that show the mechanism instead of
// decorating it: a URL settling into a field and fanning out into keywords and
// subreddits, a reply composing itself under a thread, and "You" arriving into
// a ranked list the assistants read from.
//
// Rules baked in here, do not break them in a repaint:
//   - every colour is a literal from the landing palette (canvas #ffffff,
//     panel #f4f1ec, hairline black/0.08, text #1c1917 / #44403c / #78716c /
//     #8a827b, brand #ff4500 with #d94100 when orange is TEXT, ok #059669)
//   - each SVG is aria-hidden; the card's heading and body carry the meaning
//   - one shot on scroll into view, settles into a finished frame, no loop
//   - prefers-reduced-motion renders that finished frame with zero motion
//   - viewBox only, never a hardcoded pixel width, so the card can shrink to
//     390px without overflowing
// ---------------------------------------------------------------------------

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useId } from 'react';

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const C = {
  panel: '#f4f1ec',
  hair: 'rgba(28,25,23,0.10)',
  textHi: '#1c1917',
  text: '#44403c',
  muted: '#78716c',
  dim: '#a8a29e',
  brand: '#ff4500',
  brandText: '#d94100',
  ok: '#059669',
};

// Every drawing is authored on the same 260x110 stage so the three cards line
// up whatever the column width is.
const VB = '0 0 260 110';
const VIEWPORT = { once: true, margin: '-60px' } as const;

type StepProps = { delay?: number };

/** Parent gate. Children inherit "hidden"/"visible" through variant propagation. */
function useStage(delay: number) {
  const reduce = useReducedMotion();

  const stage = {
    viewBox: VB,
    'aria-hidden': true as const,
    focusable: 'false' as const,
    className: 'block w-full h-auto',
    variants: { hidden: {}, visible: {} } satisfies Variants,
    initial: reduce ? ('visible' as const) : ('hidden' as const),
    whileInView: 'visible' as const,
    viewport: VIEWPORT,
  };

  // Reduced motion: no delays, no travel, the settled frame renders instantly.
  const at = (start: number, duration = 0.5) =>
    reduce ? { duration: 0 } : { duration, delay: delay + start, ease: EASE };

  const v = (hidden: Variants['x'], visible: Variants['x'], start: number, duration = 0.5): Variants => ({
    hidden,
    visible: { ...visible, transition: at(start, duration) },
  });

  return { stage, v, reduce };
}

const fadeUp = (dy = 6) => ({ opacity: 0, y: dy });
const settled = { opacity: 1, y: 0 };

// ---------------------------------------------------------------------------
// 1. Paste your site
//    The URL drops into the field, the field acknowledges it, a hairline drops
//    out of the bottom, and the derived keywords and subreddits fan out.
// ---------------------------------------------------------------------------

const KEYWORDS: { label: string; x: number; w: number }[] = [
  { label: 'stripe alternative', x: 10, w: 104 },
  { label: 'lower fees', x: 122, w: 66 },
];

const SUBREDDITS: { label: string; x: number; w: number }[] = [
  { label: 'r/SaaS', x: 10, w: 46 },
  { label: 'r/smallbusiness', x: 64, w: 90 },
  { label: 'r/startups', x: 162, w: 66 },
];

export function PasteSiteAnimation({ delay = 0 }: StepProps) {
  const { stage, v } = useStage(delay);

  return (
    <motion.svg {...stage}>
      {/* the field */}
      <motion.rect
        x={10}
        y={8}
        width={240}
        height={28}
        rx={9}
        fill={C.panel}
        stroke={C.hair}
        strokeWidth={1}
        variants={v({ opacity: 0 }, { opacity: 1 }, 0, 0.4)}
      />
      {/* it acknowledges the paste */}
      <motion.rect
        x={10}
        y={8}
        width={240}
        height={28}
        rx={9}
        fill="none"
        stroke={C.brand}
        strokeWidth={1.4}
        variants={v({ opacity: 0 }, { opacity: [0, 0.85, 0] }, 0.34, 0.8)}
      />
      <motion.g variants={v({ opacity: 0, y: -12 }, { ...settled }, 0.16, 0.62)}>
        <circle cx={26} cy={22} r={4.5} fill="none" stroke={C.brandText} strokeWidth={1.2} />
        <path d="M21.5 22h9M26 17.5c2.4 2.6 2.4 6.4 0 9M26 17.5c-2.4 2.6-2.4 6.4 0 9" stroke={C.brandText} strokeWidth={1.1} fill="none" />
        <text x={38} y={26} fontSize={11} fill={C.textHi} fontWeight={500}>
          {'yourstartup.com'}
        </text>
      </motion.g>

      {/* derived from, not decoration */}
      <motion.path
        d="M20 40 V 48"
        fill="none"
        stroke={C.hair}
        strokeWidth={1.2}
        strokeLinecap="round"
        variants={v({ pathLength: 0, opacity: 0 }, { pathLength: 1, opacity: 1 }, 0.72, 0.4)}
      />

      {KEYWORDS.map((chip, i) => (
        <motion.g key={chip.label} variants={v({ opacity: 0, y: 7 }, { ...settled }, 0.86 + i * 0.11, 0.5)}>
          <rect x={chip.x} y={52} width={chip.w} height={20} rx={10} fill={C.panel} />
          <text x={chip.x + chip.w / 2} y={66} fontSize={9} fill={C.text} textAnchor="middle">
            {chip.label}
          </text>
        </motion.g>
      ))}

      {SUBREDDITS.map((chip, i) => (
        <motion.g key={chip.label} variants={v({ opacity: 0, y: 7 }, { ...settled }, 1.08 + i * 0.11, 0.5)}>
          <rect x={chip.x} y={78} width={chip.w} height={20} rx={10} fill={C.brand} fillOpacity={0.12} />
          <text x={chip.x + chip.w / 2} y={92} fontSize={9} fill={C.brandText} textAnchor="middle" fontWeight={500}>
            {chip.label}
          </text>
        </motion.g>
      ))}
    </motion.svg>
  );
}

// ---------------------------------------------------------------------------
// 2. Reply where it counts
//    A thread appears, a rail drops into an indented reply, and two lines type
//    themselves behind a clip mask before the caret leaves and the reply lands.
// ---------------------------------------------------------------------------

const L1 = 'Been there. Happy to share what worked.';
const L2 = 'Took about a week to see the first lead.';
const L1_W = 200; // generous clip widths: better a hair wide than a clipped word
const L2_W = 204;
const TYPE_X = 34;

export function ReplyAnimation({ delay = 0 }: StepProps) {
  const { stage, v, reduce } = useStage(delay);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clip1 = `sg-t1-${uid}`;
  const clip2 = `sg-t2-${uid}`;

  return (
    <motion.svg {...stage}>
      <defs>
        <clipPath id={clip1}>
          <motion.rect x={TYPE_X} y={72} height={14} variants={v({ width: 0 }, { width: L1_W }, 0.82, 0.55)} />
        </clipPath>
        <clipPath id={clip2}>
          <motion.rect x={TYPE_X} y={86} height={14} variants={v({ width: 0 }, { width: L2_W }, 1.4, 0.55)} />
        </clipPath>
      </defs>

      {/* the thread */}
      <motion.g variants={v(fadeUp(6), settled, 0, 0.5)}>
        <rect x={10} y={4} width={46} height={16} rx={8} fill={C.panel} />
        <text x={33} y={15.5} fontSize={8.5} fill={C.muted} textAnchor="middle" fontWeight={500}>
          {'r/SaaS'}
        </text>
        <text x={62} y={15.5} fontSize={8.5} fill={C.dim}>
          {'2h ago'}
        </text>
        <text x={10} y={38} fontSize={10.5} fill={C.textHi} fontWeight={500}>
          {'Any tool for finding leads on Reddit?'}
        </text>
      </motion.g>

      {/* the rail into the reply */}
      <motion.path
        d="M14 44 V 60 Q 14 66 20 66 H 24"
        fill="none"
        stroke={C.hair}
        strokeWidth={1.2}
        strokeLinecap="round"
        variants={v({ pathLength: 0, opacity: 0 }, { pathLength: 1, opacity: 1 }, 0.38, 0.42)}
      />

      {/* your reply */}
      <motion.g variants={v({ opacity: 0, y: 6 }, settled, 0.6, 0.5)}>
        <rect x={24} y={52} width={226} height={52} rx={11} fill={C.brand} fillOpacity={0.06} stroke={C.brand} strokeOpacity={0.2} strokeWidth={1} />
        <circle cx={35} cy={64} r={3.2} fill={C.brand} />
        <text x={43} y={67} fontSize={8.5} fill={C.brandText} fontWeight={600}>
          {'You'}
        </text>
      </motion.g>

      <g clipPath={`url(#${clip1})`}>
        <text x={TYPE_X} y={82} fontSize={9} fill={C.text}>
          {L1}
        </text>
      </g>
      <g clipPath={`url(#${clip2})`}>
        <text x={TYPE_X} y={96} fontSize={9} fill={C.text}>
          {L2}
        </text>
      </g>

      {/* the caret runs the two lines, then leaves */}
      {!reduce && (
        <motion.rect
          width={1.5}
          height={11}
          rx={0.75}
          fill={C.brand}
          variants={{
            hidden: { opacity: 0, x: TYPE_X, y: 72 },
            visible: {
              opacity: [0, 1, 1, 1, 0],
              x: [TYPE_X, TYPE_X + L1_W, TYPE_X, TYPE_X + L2_W, TYPE_X + L2_W],
              y: [72, 72, 86, 86, 86],
              transition: {
                duration: 1.35,
                delay: delay + 0.8,
                times: [0, 0.42, 0.46, 0.9, 1],
                ease: 'linear',
              },
            },
          }}
        />
      )}

      {/* it lands as the useful answer */}
      <motion.g variants={v({ opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, 2.02, 0.45)} style={{ transformOrigin: '236px 64px' }}>
        <circle cx={236} cy={64} r={7} fill={C.ok} fillOpacity={0.12} />
        <path d="M232.6 64.2l2.3 2.3 4.4-4.6" fill="none" stroke={C.ok} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </motion.svg>
  );
}

// ---------------------------------------------------------------------------
// 3. Watch the AI catch up
//    A ranked list of the names the assistants hand out, with rank 2 sitting
//    empty, then "You" arriving into that slot. This is the payoff beat.
// ---------------------------------------------------------------------------

const ROW_Y = [18, 40, 62, 84];
const RIVALS: { rank: number; name: string; slot: number }[] = [
  { rank: 1, name: 'Leado', slot: 0 },
  { rank: 3, name: 'Linkeddit', slot: 2 },
  { rank: 4, name: 'Syften', slot: 3 },
];

export function AiCatchUpAnimation({ delay = 0 }: StepProps) {
  const { stage, v } = useStage(delay);
  const y = ROW_Y[1];

  return (
    <motion.svg {...stage}>
      <motion.g variants={v({ opacity: 0 }, { opacity: 1 }, 0, 0.4)}>
        <circle cx={13} cy={7} r={3} fill={C.ok} fillOpacity={0.9} />
        <text x={21} y={10} fontSize={8.5} fill={C.muted} fontWeight={500}>
          {'ChatGPT, asked weekly: which tool?'}
        </text>
      </motion.g>

      {RIVALS.map((row, i) => (
        <motion.g key={row.name} variants={v({ opacity: 0, y: 6 }, settled, 0.18 + i * 0.1, 0.5)}>
          <rect x={10} y={ROW_Y[row.slot]} width={240} height={18} rx={9} fill={C.panel} />
          <text x={22} y={ROW_Y[row.slot] + 12.5} fontSize={8.5} fill={C.dim} textAnchor="middle">
            {String(row.rank)}
          </text>
          <text x={34} y={ROW_Y[row.slot] + 12.5} fontSize={9.5} fill={C.text}>
            {row.name}
          </text>
        </motion.g>
      ))}

      {/* the slot with your name missing from it */}
      <motion.rect
        x={10}
        y={y}
        width={240}
        height={18}
        rx={9}
        fill="none"
        stroke={C.hair}
        strokeWidth={1}
        strokeDasharray="4 4"
        variants={v({ opacity: 0 }, { opacity: [0, 1, 1, 0] }, 0.5, 1.1)}
      />

      {/* and you arriving into it */}
      <motion.g variants={v({ opacity: 0, x: -30 }, { opacity: 1, x: 0 }, 1.2, 0.72)}>
        <rect x={10} y={y} width={240} height={18} rx={9} fill={C.brand} fillOpacity={0.12} stroke={C.brand} strokeOpacity={0.28} strokeWidth={1} />
        <text x={22} y={y + 12.5} fontSize={8.5} fill={C.brandText} textAnchor="middle" fontWeight={600}>
          {'2'}
        </text>
        <text x={34} y={y + 12.5} fontSize={9.5} fill={C.brandText} fontWeight={600}>
          {'You'}
        </text>
      </motion.g>

      <motion.g variants={v({ opacity: 0 }, { opacity: 1 }, 1.78, 0.4)}>
        <circle cx={196} cy={y + 9} r={2.5} fill={C.ok} />
        <text x={204} y={y + 12} fontSize={8} fill={C.ok} fontWeight={600}>
          {'named you'}
        </text>
      </motion.g>
    </motion.svg>
  );
}

// ---------------------------------------------------------------------------

const STEP_ANIMATIONS = [PasteSiteAnimation, ReplyAnimation, AiCatchUpAnimation];

/** Picks the drawing for step `index` (0-based) and staggers it behind the card. */
export default function StepAnimation({ index, delay = 0 }: { index: number; delay?: number }) {
  const Drawing = STEP_ANIMATIONS[index];
  if (!Drawing) return null;
  return <Drawing delay={delay} />;
}
