'use client';

/**
 * Phase 1 of /explore: the buying-intent keywords and the subreddits they live
 * in. This is where the visitor sees their own market described back to them,
 * so it gets width and air rather than being crammed into one panel.
 *
 * Chips enter on a 40ms stagger so the list ASSEMBLES instead of appearing.
 * The page re-renders on every 1500ms poll, and framer only runs `initial` on
 * mount, so keying each chip by its text keeps settled chips still while new
 * ones animate in. That key is why the lists are deduped: the model happily
 * repeats a keyword, and two chips sharing a key reconcile onto each other.
 *
 * The two columns resolve INDEPENDENTLY. The backend commits keywords and
 * subreddits in two separate writes with a paced log line between them, so a
 * poll lands in the gap on most runs. A single shared loading flag would flash
 * "no subreddits matched" for a tick while phase 1 was still running.
 */

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SkeletonChipRow } from './Skeletons';

/** The uppercase micro-label used across every /explore card. */
const MICRO_LABEL = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-[#78716c]';

/** Roughly 40ms apart, capped so a 20 chip list does not crawl. */
const STAGGER = 0.04;
const MAX_STAGGER_STEPS = 12;

export interface PhaseCommunitiesProps {
  /** keywords off the poll response. Empty until phase 1 finishes. */
  keywords: string[];
  /** subreddits off the poll response. Empty until phase 1 finishes. */
  subreddits: string[];
  /**
   * Force both columns out of their skeleton. Left unset, each column waits on
   * its own data. Pass false explicitly once the phase is done so a genuinely
   * empty result shows its empty state instead of shimmering forever.
   */
  loading?: boolean;
  className?: string;
}

export function PhaseCommunities({ keywords, subreddits, loading, className }: PhaseCommunitiesProps) {
  // Normalised once, up front. stripPrefix runs before the dedupe so "SaaS",
  // "r/SaaS" and "/r/SaaS" collapse into a single chip rather than three
  // identical ones.
  const keywordItems = dedupe(keywords);
  const subredditItems = dedupe((subreddits || []).map(stripPrefix));

  const keywordsLoading = loading ?? keywordItems.length === 0;
  const subredditsLoading = loading ?? subredditItems.length === 0;

  return (
    <section
      className={cn('mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2 sm:gap-8', className)}
      aria-busy={keywordsLoading || subredditsLoading}
    >
      <Column
        label="Keywords"
        caption="What people type when they are close to buying"
        loading={keywordsLoading}
        chipCount={6}
        items={keywordItems}
        empty="No buying-intent keywords came back for this site. That usually means the page copy is very broad."
        renderChip={(keyword) => <span className="text-[#d6d3d1]">{keyword}</span>}
      />

      <Column
        label="Subreddits"
        caption="Where those conversations actually happen"
        loading={subredditsLoading}
        chipCount={5}
        items={subredditItems}
        empty="No subreddits matched closely enough to recommend yet."
        renderChip={(subreddit) => (
          <>
            <span className="text-[#78716c]">r/</span>
            <span className="text-[#d6d3d1]">{subreddit}</span>
          </>
        )}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Column                                                                     */
/* -------------------------------------------------------------------------- */

interface ColumnProps {
  label: string;
  caption: string;
  loading: boolean;
  chipCount: number;
  items: string[];
  empty: string;
  renderChip: (item: string) => ReactNode;
}

function Column({ label, caption, loading, chipCount, items, empty, renderChip }: ColumnProps) {
  const reduce = useReducedMotion();

  return (
    <div>
      <p className={MICRO_LABEL}>{label}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#a8a29e]">{caption}</p>

      <div className="mt-4">
        {loading ? (
          <SkeletonChipRow count={chipCount} />
        ) : items.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-[#78716c]">{empty}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <motion.li
                key={item}
                initial={reduce ? false : { opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: reduce ? 0 : 0.32,
                  delay: reduce ? 0 : Math.min(index, MAX_STAGGER_STEPS) * STAGGER,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-full border border-white/[0.08] bg-[#1c1917] px-3 py-1.5 text-[13px] leading-tight"
              >
                {renderChip(item)}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The backend may send "SaaS", "r/SaaS", "/r/SaaS" or a padded " SaaS ". The
 * chip always renders exactly one r/ prefix, so strip whatever came in.
 */
function stripPrefix(subreddit: string): string {
  return (subreddit || '').trim().replace(/^\/?r\//i, '').replace(/\/+$/, '').trim();
}

/**
 * Trim, drop blanks, and keep the first of any case-insensitive repeat. Chips
 * are keyed by their text, so a duplicate is a React key collision, not just an
 * ugly list.
 */
function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items || []) {
    const value = (item || '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
