'use client';

/**
 * The narration column for /explore. Machine voice, monospace, one line per
 * step of work, with a blinking cursor on whatever is currently happening.
 *
 * Motion contract: lines animate in ONLY when they are genuinely new. The page
 * re-renders every 1500ms on each poll, and re-running the entrance animation
 * on every tick would look like a stutter, so entries are keyed by index+text
 * and AnimatePresence leaves settled lines alone. A line flipping done:false to
 * done:true keeps its key, so it swaps its marker without re-animating.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ONBOARDING_STEP_COUNT, type OnboardingLogEntry, type OnboardingPhase } from '@/lib/onboarding';

/* -------------------------------------------------------------------------- */
/* LiveDot                                                                    */
/* -------------------------------------------------------------------------- */

export interface LiveDotProps {
  /** Emit the expanding ring. Off for terminal states so the screen goes calm. */
  pulse?: boolean;
  /** Tailwind colour class for the dot, e.g. 'bg-[#059669]'. */
  className?: string;
}

/**
 * The emerald status dot. Emerald is reserved for "alive" and "done" in this
 * flow, it is never a call to action. Shared with StepRail so the pulse in the
 * step pill and the pulse above the log stay in the same visual language.
 */
export function LiveDot({ pulse = true, className }: LiveDotProps) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-flex h-1.5 w-1.5 shrink-0" aria-hidden>
      {pulse && !reduce && (
        <motion.span
          className={cn('absolute inset-0 rounded-full bg-[#059669]', className)}
          animate={{ opacity: [0.55, 0, 0.55], scale: [1, 2.6, 1] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span className={cn('relative h-1.5 w-1.5 rounded-full bg-[#059669]', className)} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* AgentLog                                                                   */
/* -------------------------------------------------------------------------- */

export interface AgentLogProps {
  /** log[] straight off the poll response, ordered oldest first. */
  log: OnboardingLogEntry[];
  /** phase_index off the poll response. Drives the "step N of 5" header. */
  phaseIndex: number;
  /** phase off the poll response. Switches the header to its calm done state. */
  phase: OnboardingPhase;
  /** Keep only the last N lines. Used by the compact mobile log. */
  maxLines?: number;
  /** Hide the "SneakyGuy is working on step N of 5" header. */
  hideHeader?: boolean;
  className?: string;
}

export function AgentLog({ log, phaseIndex, phase, maxLines, hideHeader = false, className }: AgentLogProps) {
  const reduce = useReducedMotion();

  // Number of lines present at the previous commit. Anything at or past this
  // index is new this tick and earns a staggered entrance.
  const seenRef = useRef(0);
  const firstNewIndex = seenRef.current;
  useEffect(() => {
    seenRef.current = log.length;
  }, [log.length]);

  const visible = typeof maxLines === 'number' ? log.slice(Math.max(0, log.length - maxLines)) : log;
  const offset = log.length - visible.length;

  const step = Math.min(phaseIndex + 1, ONBOARDING_STEP_COUNT);
  const failed = phase === 'failed';
  // phaseIndex is the step the page is REVEALING, which lags the backend on
  // purpose. The backend can be "ready" while the canvas still shows step one,
  // and a header saying "finished all 5 steps" next to a rail on step 1 reads
  // as a bug. So "done" needs both: the run finished AND the reveal caught up.
  const ready = phase === 'ready' && phaseIndex >= ONBOARDING_STEP_COUNT - 1;

  return (
    <div className={cn('font-mono', className)}>
      {!hideHeader && (
        <div className="mb-3 flex items-center gap-2 text-[11px] leading-[1.4]">
          {failed ? (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8a827b]" aria-hidden />
          ) : (
            <LiveDot pulse={!ready} />
          )}
          <span className={failed ? 'text-[#78716c]' : 'text-[#44403c]'}>
            {failed
              ? 'SneakyGuy stopped early'
              : ready
                ? `SneakyGuy finished all ${ONBOARDING_STEP_COUNT} steps`
                : `SneakyGuy is working on step ${step} of ${ONBOARDING_STEP_COUNT}`}
          </span>
        </div>
      )}

      {/* aria-live so a screen reader hears the narration without needing the
          animation to convey it. */}
      <ul className="space-y-[7px] text-[12.5px] leading-[1.5]" aria-live="polite" aria-atomic="false">
        <AnimatePresence initial={!reduce}>
          {visible.map((entry, i) => {
            const index = offset + i;
            const isNew = index >= firstNewIndex;
            // Cap the cascade: a resumed session can arrive with a dozen lines
            // at once and a 12-deep stagger would read as a slow crawl.
            const delay = reduce || !isNew ? 0 : Math.min(index - firstNewIndex, 5) * 0.06;

            return (
              <motion.li
                key={`${index}-${entry.text}`}
                layout={reduce ? false : 'position'}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-2"
              >
                <span className="mt-[3px] flex h-3 w-3 shrink-0 items-center justify-center" aria-hidden>
                  {entry.done ? (
                    <Check className="h-3 w-3 text-[#059669]/55" strokeWidth={2.5} />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-[#8a827b]" />
                  )}
                </span>

                <span className={cn('min-w-0 break-words', entry.done ? 'text-[#8a827b]' : 'text-[#44403c]')}>
                  {entry.text}
                  {!entry.done && <BlinkingCursor />}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/**
 * A 1ch block cursor sitting on the end of the active line. Opacity 1 -> 0 -> 1
 * on a one second loop, which is the terminal cadence people expect. Under
 * reduced motion it holds steady at half opacity instead of vanishing, so the
 * "this line is still running" signal survives.
 */
function BlinkingCursor() {
  const reduce = useReducedMotion();
  if (reduce) {
    return <span aria-hidden className="ml-[3px] inline-block h-[1em] w-[1ch] translate-y-[2px] bg-[#44403c] opacity-50" />;
  }
  return (
    <motion.span
      aria-hidden
      className="ml-[3px] inline-block h-[1em] w-[1ch] translate-y-[2px] bg-[#44403c]"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear', times: [0, 0.5, 1] }}
    />
  );
}
