'use client';

// The SneakyGuy mascot, animated from the real logo. Four frames share every
// pixel except the eyes (base, blink, glance right, wide), so swapping them
// reads as the logo itself coming alive:
//   - he pops up on load, does a wide-eyed "spotted you", then settles
//   - he blinks every few seconds
//   - he glances right when the pointer is to his right
//   - he goes wide-eyed while you hover him
// Under prefers-reduced-motion he holds the base frame and never moves.
//
// The ledge he grips (the line under his head) sits at 222 of the image's
// 336px height. The component's box ends at that line, so place its bottom
// edge on the top of whatever he is peeking over; his fingers and nose hang
// below it by design.

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Frame = 'base' | 'blink' | 'right' | 'wide';
const FRAMES: Frame[] = ['base', 'blink', 'right', 'wide'];

/** Image is 544x336; the ledge is at y=222. */
const LEDGE_RATIO = 544 / 222;
const OVERHANG = `${(336 / 222) * 100}%`;

export default function SneakyPeek({ className = '', delay = 0.25 }: { className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [eyes, setEyes] = useState<Exclude<Frame, 'blink'>>('base');
  const [blinking, setBlinking] = useState(false);
  const [hover, setHover] = useState(false);
  const [intro, setIntro] = useState(true);

  // Intro: after the pop-up lands, a short wide-eyed "spotted you".
  useEffect(() => {
    if (reduce) { setIntro(false); return; }
    const t1 = setTimeout(() => setEyes('wide'), (delay + 0.45) * 1000);
    const t2 = setTimeout(() => { setEyes('base'); setIntro(false); }, (delay + 1.15) * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduce, delay]);

  // Blink on a loose, human rhythm, with the odd double blink.
  useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setTimeout>;
    const blink = (after: number) => {
      timer = setTimeout(() => {
        setBlinking(true);
        timer = setTimeout(() => {
          setBlinking(false);
          blink(Math.random() < 0.2 ? 160 : 2400 + Math.random() * 3600);
        }, 130);
      }, after);
    };
    blink(2200 + delay * 1000);
    return () => clearTimeout(timer);
  }, [reduce, delay]);

  // Glance right when the pointer is well to his right.
  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const toRight = e.clientX - (r.left + r.width / 2) > r.width * 0.3;
        setEyes((prev) => (prev === 'wide' ? prev : toRight ? 'right' : 'base'));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduce]);

  const shown: Frame = reduce ? 'base' : blinking ? 'blink' : hover && !intro ? 'wide' : eyes;

  return (
    <div
      ref={ref}
      className={`relative w-full select-none ${className}`}
      style={{ aspectRatio: String(LEDGE_RATIO) }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-x-0 top-0"
        style={{ height: OVERHANG }}
        initial={reduce ? false : { y: '18%', opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay, type: 'spring', stiffness: 220, damping: 16 }}
      >
        {FRAMES.map((f) => (
          // All four stay mounted so a swap never waits on the network.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={f}
            src={`/mascot/${f}.webp`}
            alt=""
            role="presentation"
            draggable={false}
            width={544}
            height={336}
            className="absolute inset-0 h-full w-full"
            style={{ opacity: f === shown ? 1 : 0 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
