'use client';

/**
 * The five step progress rail for /explore.
 *
 * Everything that is not the current step is a bare circled number. The active
 * step alone expands into a pill and gets a label, so the eye always lands on
 * one place. The pill background is a shared layoutId element, which means it
 * slides and resizes from step to step instead of popping.
 */

import { Fragment } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LiveDot } from './AgentLog';

/** Step labels, index-aligned with phase_index from the API. */
export const EXPLORE_STEPS = [
  'Research your company',
  'Find your communities',
  'Check AI visibility',
  'Find threads to join',
  'Ready',
] as const;

export const EXPLORE_STEP_COUNT = EXPLORE_STEPS.length;

export interface StepRailProps {
  /** phase_index from the poll response. Clamped to 0..4 internally. */
  activeIndex: number;
  /** True at phase "ready". Stops the dot pulsing so the rail settles. */
  complete?: boolean;
  /**
   * True at phase "failed". The run is over, so the active step gets the same
   * dead grey dot the log header uses. Without this a dead run sits here
   * pulsing emerald forever, telling the visitor work is still happening while
   * the log two inches away says it stopped.
   */
  failed?: boolean;
  className?: string;
}

export function StepRail({ activeIndex, complete = false, failed = false, className }: StepRailProps) {
  const reduce = useReducedMotion();
  const active = Math.max(0, Math.min(activeIndex, EXPLORE_STEP_COUNT - 1));

  const transition = reduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 38, mass: 0.9 };

  return (
    <nav
      className={cn(
        // Five pills do not fit a phone. Let the row scroll rather than wrap,
        // the active step is what matters and it is always in view on desktop.
        'flex items-center overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label={`Step ${active + 1} of ${EXPLORE_STEP_COUNT}`}
    >
      {EXPLORE_STEPS.map((label, index) => {
        const isActive = index === active;
        return (
          <Fragment key={label}>
            {index > 0 && <span className="h-px w-4 shrink-0 bg-white/[0.08] sm:w-7" aria-hidden />}

            <motion.div
              layout={!reduce}
              transition={transition}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'relative flex shrink-0 items-center justify-center',
                isActive ? 'h-9 gap-2 rounded-full px-3.5' : 'h-7 w-7 rounded-full',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="explore-active-step-pill"
                  transition={transition}
                  className="absolute inset-0 rounded-full border border-white/[0.08] bg-[#1c1917]"
                />
              ) : (
                <span className="absolute inset-0 rounded-full border border-white/[0.08]" aria-hidden />
              )}

              {isActive && (
                <span className="relative z-10 flex items-center">
                  {failed ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#78716c]" aria-hidden />
                  ) : (
                    <LiveDot pulse={!complete} />
                  )}
                </span>
              )}

              <span
                className={cn(
                  'relative z-10 font-mono text-[12px] tabular-nums',
                  isActive ? 'text-[#fafaf9]' : 'text-[#78716c]',
                )}
              >
                {index + 1}
              </span>

              {/* No exit animation on purpose. An exiting label has to be
                  popped out of layout to let the pill shrink, which leaves it
                  floating across its neighbours for the length of the fade.
                  Unmounting it outright still looks smooth, because the parent
                  `layout` animates the width change either way. */}
              {isActive && (
                <motion.span
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : 0.06 }}
                  className="relative z-10 whitespace-nowrap text-[13px] font-medium text-[#fafaf9]"
                >
                  {label}
                </motion.span>
              )}
            </motion.div>
          </Fragment>
        );
      })}
    </nav>
  );
}
