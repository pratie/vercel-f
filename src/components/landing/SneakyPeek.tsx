'use client';

// The SneakyGuy mascot, redrawn as SVG so he can do one thing the PNG cannot:
// watch you. The pupils follow the pointer. That is the only ongoing motion;
// the rise from behind the ledge plays once on load and is skipped entirely
// under prefers-reduced-motion.
//
// The drawing sits on a 260x150 stage whose bottom edge (y=150) is the ledge.
// Place the component so its bottom edge lines up with the top of whatever he
// is peeking over; his fingers and nose hang over that edge by design.

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const INK = '#1c1917';
const SKIN = '#f8c49b';
const HAIR = '#5b2a1e';

const EYES = [
  { cx: 104, cy: 84 },
  { cx: 156, cy: 84 },
];
// How far a pupil may travel inside its eye, in stage units.
const MAX_DX = 7;
const MAX_DY = 3;

export default function SneakyPeek({ className = '', delay = 0.25 }: { className?: string; delay?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const [look, setLook] = useState({ x: 2, y: 1 });

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = svg.getBoundingClientRect();
        // Eyes sit at roughly 40% / 56% of the stage height.
        const ex = r.left + r.width / 2;
        const ey = r.top + r.height * 0.56;
        const dx = e.clientX - ex;
        const dy = e.clientY - ey;
        const dist = Math.hypot(dx, dy) || 1;
        // Ease in over the first 300px so small movements near him still read.
        const reach = Math.min(1, dist / 300);
        setLook({ x: (dx / dist) * MAX_DX * reach, y: (dy / dist) * MAX_DY * reach });
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 260 162"
      className={`block overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Everything above the ledge line; the head rises out from behind it. */}
        <clipPath id="sg-above-ledge">
          <rect x="-20" y="-40" width="300" height="190" />
        </clipPath>
      </defs>

      <g clipPath="url(#sg-above-ledge)">
        <motion.g
          initial={reduce ? false : { y: 110 }}
          animate={{ y: 0 }}
          transition={{ delay, type: 'spring', stiffness: 170, damping: 17 }}
        >
          {/* ears */}
          <ellipse cx="56" cy="98" rx="16" ry="23" fill={SKIN} stroke={INK} strokeWidth="5" />
          <ellipse cx="204" cy="98" rx="16" ry="23" fill={SKIN} stroke={INK} strokeWidth="5" />
          {/* head: a dome that disappears behind the ledge */}
          <path d="M62 150 C62 66 96 30 130 30 C164 30 198 66 198 150 Z" fill={SKIN} stroke={INK} strokeWidth="5.5" strokeLinejoin="round" />
          {/* hair */}
          <path d="M70 84 C74 48 102 28 130 28 C158 28 186 48 190 84 C172 62 152 54 130 54 C108 54 88 62 70 84 Z" fill={HAIR} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M104 44 C116 40 144 40 156 44" stroke="#8a4a37" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* sneaky brows */}
          <path d="M84 66 L122 74" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <path d="M176 66 L138 74" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          {/* eyes: whites, tracking pupils, heavy upper lids */}
          {EYES.map((e, i) => (
            <g key={i}>
              <ellipse cx={e.cx} cy={e.cy} rx="19" ry="11" fill="#fff" stroke={INK} strokeWidth="4" />
              <circle cx={e.cx + look.x} cy={e.cy + 2 + look.y} r="6.5" fill={INK} />
              <path
                d={`M${e.cx - 21} ${e.cy - 1} C${e.cx - 12} ${e.cy - 14} ${e.cx + 12} ${e.cy - 14} ${e.cx + 21} ${e.cy - 1} Z`}
                fill={INK}
              />
            </g>
          ))}
        </motion.g>
      </g>

      {/* nose and fingers hang over the ledge, so they sit outside the clip */}
      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.18, duration: 0.2 }}
      >
        <path d="M114 98 C124 94 140 94 150 98 L136 164 C134 168 130 168 128 164 Z" fill={SKIN} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        {[30, 48, 66].map((x) => (
          <ellipse key={`l${x}`} cx={x} cy="152" rx="10" ry="13" fill={SKIN} stroke={INK} strokeWidth="4.5" />
        ))}
        {[194, 212, 230].map((x) => (
          <ellipse key={`r${x}`} cx={x} cy="152" rx="10" ry="13" fill={SKIN} stroke={INK} strokeWidth="4.5" />
        ))}
      </motion.g>
    </svg>
  );
}
