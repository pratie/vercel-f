'use client';

/**
 * Shimmer placeholders for the /explore funnel.
 *
 * These exist to set expectation of SHAPE before the real content lands. The
 * user is watching an agent work for the better part of a minute, and a card
 * that already looks like the answer it is about to hold makes that wait feel
 * productive instead of empty.
 *
 * Two tones, because the same bar has to read on two different surfaces:
 *   base   #ffffff  sits on the page canvas (#ffffff)
 *   raised #f4f1ec  sits inside a panel that is already #ffffff
 * Picking the wrong tone makes the placeholder invisible, so every skeleton
 * that lives inside a panel passes tone="raised".
 *
 * The sheen is a framer-motion element rather than a Tailwind keyframe on
 * purpose: useReducedMotion lets us drop it entirely, and this flow adds no
 * keys to tailwind.config.js.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SkeletonTone = 'base' | 'raised';

const TONE_CLASS: Record<SkeletonTone, string> = {
  base: 'bg-[#ffffff]',
  raised: 'bg-[#f4f1ec]',
};

/* -------------------------------------------------------------------------- */
/* Sheen                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The travelling highlight. Absolutely positioned, half the width of its
 * parent, sliding from just off the left edge to just past the right one.
 * Renders nothing under prefers-reduced-motion, which leaves a plain, calm
 * block that still communicates shape.
 */
function Sheen() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-black/[0.055] to-transparent"
      animate={{ x: ['0%', '400%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.3 }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* SkeletonLine                                                               */
/* -------------------------------------------------------------------------- */

export interface SkeletonLineProps {
  /** Width utility, e.g. 'w-2/3'. Vary it across lines so it reads as prose. */
  width?: string;
  /** Height utility. Bump it for headings. */
  height?: string;
  /** Surface this sits on. 'raised' when inside a #ffffff panel. */
  tone?: SkeletonTone;
  className?: string;
}

export function SkeletonLine({ width = 'w-full', height = 'h-3', tone = 'base', className }: SkeletonLineProps) {
  return (
    <div
      aria-hidden
      className={cn('relative overflow-hidden rounded-md', TONE_CLASS[tone], width, height, className)}
    >
      <Sheen />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SkeletonBlock                                                              */
/* -------------------------------------------------------------------------- */

export interface SkeletonBlockProps {
  /** Full sizing/shape utilities, e.g. 'h-10 w-10 rounded-lg'. */
  className?: string;
  tone?: SkeletonTone;
}

/** A free-form shimmer rectangle. Used for the favicon square and chips. */
export function SkeletonBlock({ className, tone = 'base' }: SkeletonBlockProps) {
  return (
    <div aria-hidden className={cn('relative overflow-hidden rounded-lg', TONE_CLASS[tone], className)}>
      <Sheen />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SkeletonCard                                                               */
/* -------------------------------------------------------------------------- */

export interface SkeletonCardProps {
  /** Number of body lines under the optional header. */
  lines?: number;
  /** Draw a wider, taller bar on top standing in for a title. */
  header?: boolean;
  className?: string;
}

/**
 * A panel-shaped placeholder. Matches the real cards' border and radius so the
 * swap to content moves nothing but the text.
 */
export function SkeletonCard({ lines = 3, header = true, className }: SkeletonCardProps) {
  // Deterministic widths. Math.random here would differ between the server and
  // client render and trip hydration.
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-3/5'];

  return (
    <div
      aria-hidden
      className={cn('rounded-2xl border border-black/[0.09] bg-[#ffffff] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.14)] p-5 sm:p-6', className)}
    >
      {header && (
        <div className="mb-5 flex items-center gap-3">
          <SkeletonBlock tone="raised" className="h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonLine tone="raised" width="w-1/3" height="h-3.5" />
            <SkeletonLine tone="raised" width="w-1/4" height="h-2.5" />
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} tone="raised" width={widths[i % widths.length]} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SkeletonChipRow                                                            */
/* -------------------------------------------------------------------------- */

export interface SkeletonChipRowProps {
  /** How many chip placeholders to draw. */
  count?: number;
  tone?: SkeletonTone;
  className?: string;
}

/**
 * A wrapped row of pill placeholders. Widths cycle through a fixed set so the
 * row looks like real, ragged content rather than a progress bar.
 */
export function SkeletonChipRow({ count = 6, tone = 'base', className }: SkeletonChipRowProps) {
  const widths = ['w-24', 'w-16', 'w-32', 'w-20', 'w-28', 'w-14', 'w-24', 'w-20'];

  return (
    <div aria-hidden className={cn('flex flex-wrap gap-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} tone={tone} className={cn('h-7 rounded-full', widths[i % widths.length])} />
      ))}
    </div>
  );
}
