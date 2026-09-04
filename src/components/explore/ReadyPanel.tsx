'use client';

/**
 * The terminal panel for /explore, rendered at phase "ready".
 *
 * This is the paywall moment, and the visitor is holding a finished analysis of
 * their own business. So the panel does not pitch, it recaps: what we decided
 * they sell, how much groundwork we drafted, how many assistants named someone
 * else, and how many threads are sitting there waiting. The CTA follows the
 * evidence rather than replacing it.
 *
 * CTA HAND OFF, do not change without reading app/projects/page.tsx:
 *   1. sessionStorage 'onboarding_session' <- session_id
 *   2. sessionStorage 'pending_analyze_url' is already set by the landing page.
 *      We backfill it from session.url only when it is missing, which happens
 *      when someone opens a shared /explore link directly.
 *   3. route to /login
 * The existing flow takes it from there: login lands on /projects, which reads
 * pending_analyze_url and opens the create project dialog. The visitor is NOT
 * authenticated here, so this component never creates a project and never
 * touches a paid endpoint.
 */

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingSession } from '@/lib/onboarding';

const MICRO_LABEL = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a827b]';

/** The only price this flow may ever show. One month, no auto renewal. */
const PRICE_LABEL = '$19';

export interface ReadyPanelProps {
  /** The finished poll response. */
  session: OnboardingSession;
  /**
   * Override the primary CTA. Leave unset and the panel runs the standard
   * hand off itself, which is what the page normally wants.
   */
  onCta?: () => void;
  /** Override the quiet secondary action. Defaults to starting over at /. */
  onStartOver?: () => void;
  className?: string;
}

export function ReadyPanel({ session, onCta, onStartOver, className }: ReadyPanelProps) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const brand = session.company?.name?.trim() || 'your site';
  const description = session.company?.description?.trim() || '';
  const keywordCount = session.keywords?.length ?? 0;
  const subredditCount = session.subreddits?.length ?? 0;
  const threadCount = session.threads?.length ?? 0;

  const engines = session.visibility?.engines ?? [];
  const engineCount = engines.length;
  // "Named a competitor instead of you" is only honest when the model actually
  // named someone. A model that named nobody is not evidence either way.
  const missedCount = engines.filter(
    (engine) => !engine.brand_mentioned && (engine.competitors?.length ?? 0) > 0,
  ).length;

  const handleCta = () => {
    if (onCta) {
      onCta();
      return;
    }
    handoffToSignup(session);
    router.push('/login');
  };

  const handleStartOver = () => {
    if (onStartOver) {
      onStartOver();
      return;
    }
    router.push('/');
  };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn('mx-auto w-full max-w-3xl', className)}
    >
      <p className={MICRO_LABEL}>Your analysis is done</p>

      <h2 className="mt-3 text-[22px] font-semibold leading-tight tracking-tight text-[#1c1917] sm:text-[26px]">
        Here is what we found for {brand}
      </h2>

      {description && (
        <p className="mt-2.5 text-[14px] leading-relaxed text-[#78716c]">{description}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.08] sm:grid-cols-4">
        <Stat value={keywordCount} label={keywordCount === 1 ? 'buying intent keyword' : 'buying intent keywords'} />
        <Stat value={subredditCount} label={subredditCount === 1 ? 'subreddit to watch' : 'subreddits to watch'} />
        {/*
          When the visibility phase produced nothing (it is allowed to fail
          without killing the session) we have NO answers, which is not the
          same as "no assistant named a competitor". Reporting a bare 0 under
          "assistants named someone else" would read as good news we never
          earned, so the cell states what it actually is: nothing checked.
        */}
        {engineCount > 0 ? (
          <Stat
            value={`${missedCount}/${engineCount}`}
            label={engineCount === 1 ? 'assistant named someone else' : 'assistants named someone else'}
            highlight={missedCount > 0}
          />
        ) : (
          <Stat value={0} label="assistant answers we could check" />
        )}
        <Stat value={threadCount} label={threadCount === 1 ? 'thread waiting' : 'threads waiting'} />
      </div>

      <div className="mt-6 rounded-2xl border border-black/[0.09] bg-[#ffffff] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.14)] p-5 sm:p-6">
        {/*
          Phases 2 and 3 are allowed to come back empty without failing the
          session, so this panel can legitimately render with zero threads.
          The heading has to survive that: pointing at "these threads" when
          there are none is the kind of small lie that loses the sale.
        */}
        <p className="text-[15px] font-semibold tracking-tight text-[#1c1917] sm:text-[16px]">
          {threadCount > 0 ? 'Start replying to these threads' : 'Start catching these conversations'}
        </p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#78716c]">
          {PRICE_LABEL} for one month, no auto renewal. We keep watching{' '}
          {subredditCount > 0 ? `those ${subredditCount} subreddits` : 'your subreddits'}, surface new threads as they
          appear, draft the reply in your voice, and track whether the assistants start naming {brand}.
        </p>

        <button
          type="button"
          onClick={handleCta}
          className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-[#ff4500] px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff] sm:w-auto"
        >
          Get started for {PRICE_LABEL}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>

        <p className="mt-3 text-[12px] leading-relaxed text-[#8a827b]">
          You will create your account on the next screen. Nothing is charged until you choose to pay.
        </p>
      </div>

      {/* Nobody gets trapped in this flow. */}
      <div className="mt-5 text-center sm:text-left">
        <button
          type="button"
          onClick={handleStartOver}
          className="text-[13px] text-[#8a827b] underline underline-offset-4 transition-colors hover:text-[#78716c] focus:outline-none focus-visible:text-[#78716c]"
        >
          Not right now, run this on a different website
        </button>
      </div>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat                                                                       */
/* -------------------------------------------------------------------------- */

function Stat({
  value,
  label,
  highlight = false,
}: {
  value: number | string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-[#ffffff] px-4 py-4">
      <p
        className={cn(
          'font-mono text-[22px] leading-none tabular-nums',
          highlight ? 'text-[#1c1917]' : 'text-[#44403c]',
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[11.5px] leading-snug text-[#8a827b]">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hand off                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Park everything the post signup flow needs, then let the caller route to
 * /login. Exported so the sticky OfferBar can run the identical hand off
 * instead of duplicating the storage keys.
 *
 * Storage writes are wrapped because Safari private mode throws on setItem,
 * and losing the session id must never block the visitor from signing up.
 */
export function handoffToSignup(session: Pick<OnboardingSession, 'session_id' | 'url'>): void {
  if (typeof window === 'undefined') return;

  try {
    if (session.session_id) {
      sessionStorage.setItem('onboarding_session', session.session_id);
    }

    // The landing page normally set this already. Backfill only, never clobber
    // what the visitor actually typed.
    if (!sessionStorage.getItem('pending_analyze_url') && session.url) {
      const raw = session.url.trim();
      const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      sessionStorage.setItem('pending_analyze_url', normalized);
    }
  } catch {
    /* storage unavailable, the sign up flow still works without the hints */
  }
}
