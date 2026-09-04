'use client';

/**
 * The sticky offer bar for /explore.
 *
 * Timing is the whole point of this component. It is deliberately ABSENT for
 * the first two phases, while we are still reading their site and picking
 * their subreddits, because asking for money before the visitor has seen
 * anything useful is exactly the mistake this funnel exists to fix. It appears
 * at phase_index >= 2, the moment we start showing them which competitors the
 * assistants named instead of them, and from then on it stays pinned.
 *
 * Motion contract: the entrance runs ONCE. The page re-renders every 1500ms on
 * each poll, so the visible state is latched, never derived fresh, and the bar
 * cannot slide in again on a later tick.
 *
 * The latch does NOT survive a failed run. The backend leaves phase_index alone
 * when it flips a session to "failed", so a run that dies during visibility or
 * thread search stays on index 2 or 3 forever. Without the phase check the bar
 * would sit above the error screen asking for money to keep everything we are
 * "finding", which is the one thing this component must never do.
 *
 * Placement: fixed to the BOTTOM of the viewport. It used to be sticky top-0,
 * which fought the shell's own sticky header (domain + step rail): both pinned
 * to the top and the bar, with the higher z-index, sat on top of the rail the
 * moment a phone scrolled. The shell pads its main column so nothing hides
 * under the bar. Pass `className` if a page needs to nudge it.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingPhase } from '@/lib/onboarding';

/**
 * The bar is held back until this phase index. Phase 2 is check_visibility,
 * the point where the visitor has watched us find their competitors.
 */
export const OFFER_BAR_MIN_PHASE_INDEX = 2;

/** The only price this flow may ever show. One month, no auto renewal. */
const PRICE_LABEL = '$19';

export interface OfferBarProps {
  /** phase_index off the poll response. The bar shows from 2 onwards. */
  phaseIndex: number;
  /**
   * phase off the poll response. Required, because phase_index alone cannot
   * tell a live run from a dead one: "failed" keeps whatever index it died on.
   */
  phase: OnboardingPhase;
  /** Fired by the primary CTA. The page owns the hand off to /login. */
  onCta: () => void;
  /** company.name, when phase 0 came back with one. Used in the detail line. */
  brandName?: string;
  /** keywords.length off the poll response. */
  keywordCount?: number;
  /** subreddits.length off the poll response. */
  subredditCount?: number;
  className?: string;
}

export function OfferBar({
  phaseIndex,
  phase,
  onCta,
  brandName,
  keywordCount = 0,
  subredditCount = 0,
  className,
}: OfferBarProps) {
  const reduce = useReducedMotion();

  // Latched, not derived. Once the visitor has earned the offer they keep it,
  // even if a later poll were to report a lower phase index.
  const failed = phase === 'failed';

  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!failed && phaseIndex >= OFFER_BAR_MIN_PHASE_INDEX) setShown(true);
  }, [phaseIndex, failed]);

  // Gated on every render, not just at latch time, so a run that fails after
  // the bar is already up takes the bar down with it.
  return (
    <AnimatePresence initial={false}>
      {shown && !failed && (
        <motion.div
          key="offer-bar"
          initial={reduce ? false : { y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#1c1917]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]',
            className,
          )}
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:gap-6 sm:px-8 sm:py-3.5">
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold leading-snug tracking-tight text-[#fafaf9] sm:text-[15px]">
                <span className="sm:hidden">Keep all of this, {PRICE_LABEL} for a month</span>
                <span className="hidden sm:inline">Keep everything we are finding, {PRICE_LABEL} for one month</span>
              </p>
              {/* One line on a phone. The detail is on the ready panel anyway. */}
              <p className="mt-0.5 hidden text-[12.5px] leading-relaxed text-[#a8a29e] sm:block">
                {detailLine({ brandName, keywordCount, subredditCount })}
              </p>
            </div>

            <button
              type="button"
              onClick={onCta}
              className="group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#ff4500] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1917]"
            >
              Get started
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The supporting line. Concrete about their own run when we have the numbers,
 * and honest about the plan when we do not. No auto renewal is stated either
 * way, it is the single most reassuring fact we have.
 */
function detailLine({
  brandName,
  keywordCount,
  subredditCount,
}: {
  brandName?: string;
  keywordCount: number;
  subredditCount: number;
}): string {
  const brand = brandName?.trim();
  const parts: string[] = [];

  if (keywordCount > 0) {
    parts.push(`${keywordCount} ${keywordCount === 1 ? 'keyword' : 'keywords'}`);
  }
  if (subredditCount > 0) {
    parts.push(`${subredditCount} ${subredditCount === 1 ? 'subreddit' : 'subreddits'}`);
  }

  if (parts.length === 0) {
    return 'No auto renewal. Threads worth joining, a reply drafted in your voice, and tracking for who the assistants name.';
  }

  const found = parts.join(' and ');
  const forBrand = brand ? ` for ${brand}` : '';
  return `No auto renewal. Keeps the ${found} we drafted${forBrand}, plus the threads we find next and a reply drafted in your voice.`;
}
