'use client';

/**
 * Phase 3 of /explore: the payoff, and the first thing on the page the visitor
 * can act on.
 *
 * The framing matters as much as the rows. These threads are presented as the
 * conversations that would change the answer in PhaseVisibility, which is what
 * turns "here are some links" into "here is the lever". Each row opens Reddit
 * in a new tab with rel="noopener noreferrer" so we never hand the opened tab
 * a window.opener handle back to us.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowBigUp, ArrowUpRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingThread } from '@/lib/onboarding';
import { SkeletonBlock, SkeletonLine } from './Skeletons';

const MICRO_LABEL = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a827b]';

export interface PhaseThreadsProps {
  /** threads off the poll response. Empty until phase 3 finishes. */
  threads: OnboardingThread[];
  /**
   * Force the skeleton. Defaults to "no threads yet". Pass false explicitly
   * once the phase is done, otherwise a genuinely empty result shimmers
   * forever instead of showing its empty state.
   */
  loading?: boolean;
  className?: string;
}

export function PhaseThreads({ threads, loading, className }: PhaseThreadsProps) {
  const reduce = useReducedMotion();
  // Rows are keyed by url, so a repeat would collide. The backend dedupes, but
  // this list is rendered straight from an unauthenticated response.
  const visibleThreads = dedupeByUrl(threads);
  const isLoading = loading ?? visibleThreads.length === 0;

  return (
    <section className={cn('mx-auto w-full max-w-3xl', className)} aria-busy={isLoading}>
      <p className={MICRO_LABEL}>Threads to join</p>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#78716c]">
        These are the conversations that would change the answer above. A useful reply here is what gets a brand
        named the next time someone asks.
      </p>

      <div className="mt-4">
        {isLoading ? (
          <ThreadsSkeleton />
        ) : visibleThreads.length === 0 ? (
          <EmptyThreads />
        ) : (
          <ul className="space-y-2">
            {visibleThreads.map((thread, index) => (
              <motion.li
                key={thread.url || `${thread.subreddit}-${index}`}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.35,
                  delay: reduce ? 0 : Math.min(index, 8) * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ThreadRow thread={thread} />
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ThreadRow                                                                  */
/* -------------------------------------------------------------------------- */

function ThreadRow({ thread }: { thread: OnboardingThread }) {
  // Reddit occasionally hands back a post with no subreddit field. Rendering
  // the chip anyway puts a bare "r/" on the row, so drop it instead.
  const subreddit = stripPrefix(thread.subreddit);
  const title = (thread.title || '').trim();

  return (
    <a
      href={thread.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-black/[0.08] bg-[#ffffff] p-4 transition-colors duration-200 hover:border-black/[0.14] hover:bg-[#f3efe9] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/25"
    >
      <div className="min-w-0 flex-1">
        {subreddit && (
          <span className="inline-flex items-center rounded-md border border-black/[0.08] bg-[#f3efe9] px-2 py-0.5 font-mono text-[11px] leading-tight text-[#78716c] transition-colors group-hover:text-[#44403c]">
            r/{subreddit}
          </span>
        )}

        <p className={cn(
          'text-[14px] leading-snug text-[#44403c] transition-colors group-hover:text-[#1c1917]',
          subreddit && 'mt-2',
        )}>
          {title || 'Untitled thread'}
        </p>

        <div className="mt-2.5 flex items-center gap-4 font-mono text-[11.5px] tabular-nums text-[#8a827b]">
          <span className="inline-flex items-center gap-1">
            <ArrowBigUp className="h-3.5 w-3.5" aria-hidden />
            {formatCount(thread.score)}
            <span className="sr-only">upvotes</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" aria-hidden />
            {formatCount(thread.num_comments)}
            <span className="sr-only">comments</span>
          </span>
        </div>
      </div>

      <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[11.5px] text-[#8a827b] transition-colors group-hover:text-[#1c1917]">
        <span className="hidden sm:inline">Open on Reddit</span>
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Zero threads is a normal outcome, not a failure, so this reads as a status
 * rather than an error. Never render a blank box here.
 */
function EmptyThreads() {
  return (
    <div className="rounded-xl border border-black/[0.08] bg-[#ffffff] p-5">
      <p className="text-[13.5px] leading-relaxed text-[#78716c]">
        Nothing matched closely enough right now. These subreddits get new posts every day, so the useful thread
        is usually a question that has not been asked yet this week.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function ThreadsSkeleton() {
  const titleWidths = ['w-11/12', 'w-4/5', 'w-full'];

  return (
    <div className="space-y-2">
      {titleWidths.map((width, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-black/[0.08] bg-[#ffffff] p-4">
          <div className="min-w-0 flex-1">
            <SkeletonBlock tone="raised" className="h-5 w-24 rounded-md" />
            <SkeletonLine tone="raised" width={width} height="h-3.5" className="mt-2.5" />
            <div className="mt-3 flex gap-4">
              <SkeletonBlock tone="raised" className="h-3 w-12 rounded-md" />
              <SkeletonBlock tone="raised" className="h-3 w-12 rounded-md" />
            </div>
          </div>
          <SkeletonBlock tone="raised" className="h-4 w-4 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** 1240 -> "1.2k". Keeps the meta row from wrapping on a phone. */
function formatCount(value: number): string {
  const n = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
}

/** Accepts "SaaS", "r/SaaS" or "/r/SaaS" and always renders one r/ prefix. */
function stripPrefix(subreddit: string): string {
  return (subreddit || '').trim().replace(/^\/?r\//i, '').replace(/\/+$/, '').trim();
}

/** Keep the first row for each url. Rows are keyed by url downstream. */
function dedupeByUrl(threads: OnboardingThread[]): OnboardingThread[] {
  const seen = new Set<string>();
  const out: OnboardingThread[] = [];
  for (const thread of threads || []) {
    if (!thread) continue;
    const key = thread.url || '';
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push(thread);
  }
  return out;
}
