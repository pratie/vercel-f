'use client';

/**
 * Phase 2 of /explore, and the emotional peak of the whole funnel.
 *
 * We show the exact question we asked, then one panel per model listing who it
 * recommended, then a clearly separated line saying whether the visitor's own
 * brand was named. When it was not, that line is the entire argument for the
 * product, so it is deliberately UNDERSTATED: a dim dot and grey text. No red,
 * no warning triangle, no gloating. Decorating it would make it read as a
 * sales trick instead of a fact.
 *
 * INTEGRATION. The backend seeds `visibility` with the question and an EMPTY
 * engines array before it queries anything, then appends one engine at a time.
 * So `visibility !== null` does not mean the phase is finished, and a count
 * derived from a half filled engines array would read as a verdict while the
 * second model is still answering. The shell must therefore pass
 * `loading={false}` once phase_index > 2 (or phase is ready/failed). Until it
 * does, this component stays in its skeleton and withholds the count.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { OnboardingVisibility, OnboardingVisibilityEngine } from '@/lib/onboarding';
import { SkeletonBlock, SkeletonChipRow, SkeletonLine } from './Skeletons';

const MICRO_LABEL = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-[#78716c]';

/**
 * The API sends internal slugs ("chatgpt", "perplexity"), not display names.
 * Rendering the slug straight into the panel heading puts a lowercase
 * "chatgpt" on the most important card in the funnel.
 */
const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
  copilot: 'Copilot',
  grok: 'Grok',
};

function engineLabel(slug: string): string {
  const key = (slug || '').trim().toLowerCase();
  if (ENGINE_LABELS[key]) return ENGINE_LABELS[key];
  if (!key) return 'Model';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** Required disclosure. We query models by API, never the consumer apps. */
const DISCLOSURE =
  'We ask each model directly with live web search enabled. Results can differ slightly from the consumer apps.';

export interface PhaseVisibilityProps {
  /** visibility off the poll response. null until phase 2 finishes. */
  visibility: OnboardingVisibility | null;
  /**
   * The visitor's brand, from company.name. Used for the "not mentioned" line.
   * Falls back to "Your brand" when phase 0 came back thin.
   */
  brandName?: string;
  /**
   * Force the skeleton. Defaults to "no engine has reported yet", because the
   * backend writes the question before it has a single answer. Pass false
   * explicitly once the phase is over, otherwise a run where every model timed
   * out shimmers forever instead of saying so.
   */
  loading?: boolean;
  className?: string;
}

export function PhaseVisibility({ visibility, brandName, loading, className }: PhaseVisibilityProps) {
  const reduce = useReducedMotion();
  const brand = brandName?.trim() || 'Your brand';

  const engines = visibility?.engines ?? [];
  // visibility arrives with engines: [] and fills in one model at a time, so
  // "the payload exists" is not the same as "the phase is done".
  const isLoading = loading ?? (visibility === null || engines.length === 0);

  // Only the shell can tell us the phase actually finished. Without that we do
  // not know whether a second model is still answering, and "named in 0 of 1
  // answers" would be read as the final score.
  const settled = loading === false;
  const mentions = engines.filter((engine) => engine.brand_mentioned).length;
  // The backend tallies every (question, engine) pair. Falling back to the
  // engine count keeps older sessions rendering a true number rather than a
  // wrong one.
  const checkTotal = visibility?.checks?.total ?? engines.length;
  const checkNamed = visibility?.checks?.named ?? mentions;
  const question = visibility?.question?.trim() || '';

  return (
    <section className={cn('mx-auto w-full max-w-3xl', className)} aria-busy={isLoading}>
      <p className={MICRO_LABEL}>What the models answer</p>

      {isLoading ? (
        <VisibilitySkeleton />
      ) : (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {question && (
            <blockquote className="mt-3 text-[17px] leading-snug text-[#fafaf9] sm:text-[19px]">
              &ldquo;{question}&rdquo;
            </blockquote>
          )}

          {settled && engines.length > 0 && (
            <p className="mt-3 text-[13px] text-[#a8a29e]">
              {brand} was named in{' '}
              <span className="font-mono tabular-nums text-[#d6d3d1]">
                {checkNamed} of {checkTotal}
              </span>{' '}
              {checkTotal === 1 ? 'answer' : 'answers'}.
            </p>
          )}

          {engines.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-white/[0.08] bg-[#1c1917] p-5 text-[13.5px] leading-relaxed text-[#a8a29e]">
              {question
                ? `No model answers came back for this question. That happens when the models time out, and it says nothing either way about where ${brand} stands.`
                : `We did not get far enough to put a buying question to the models on this run. That says nothing either way about where ${brand} stands.`}
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {engines.map((engine, index) => (
                <EnginePanel key={engine.engine} engine={engine} brand={brand} index={index} />
              ))}
            </div>
          )}

          <p className="mt-4 text-[11.5px] leading-relaxed text-[#78716c]">{DISCLOSURE}</p>
        </motion.div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* EnginePanel                                                                */
/* -------------------------------------------------------------------------- */

interface EnginePanelProps {
  engine: OnboardingVisibilityEngine;
  brand: string;
  index: number;
}

function EnginePanel({ engine, brand, index }: EnginePanelProps) {
  const reduce = useReducedMotion();
  // Extraction is an LLM pass and repeats itself often enough that a raw map
  // here throws duplicate-key warnings and reconciles the wrong chips.
  const competitors = dedupe(engine.competitors ?? []);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.4,
        delay: reduce ? 0 : 0.1 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#1c1917] p-4 sm:p-5"
    >
      <p className="text-[13.5px] font-semibold text-[#fafaf9]">{engineLabel(engine.engine)}</p>

      <p className={cn(MICRO_LABEL, 'mt-4')}>Recommended</p>

      <div className="mt-2.5 flex-1">
        {competitors.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-[#78716c]">
            This model did not name any specific tools.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {competitors.map((competitor, i) => (
              <motion.li
                key={competitor}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.28,
                  delay: reduce ? 0 : 0.2 + index * 0.12 + Math.min(i, 8) * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-md border border-white/[0.08] bg-[#292524] px-2.5 py-1 text-[12.5px] leading-tight text-[#d6d3d1]"
              >
                {competitor}
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* The separated verdict. Everything above is context, this is the point. */}
      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.08] pt-3.5">
        <span
          aria-hidden
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            engine.brand_mentioned ? 'bg-[#34d399]' : 'bg-[#57534e]',
          )}
        />
        <span className={cn('text-[13px]', engine.brand_mentioned ? 'text-[#d6d3d1]' : 'text-[#78716c]')}>
          {brand}, {engine.brand_mentioned ? 'mentioned' : 'not mentioned'}
        </span>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function VisibilitySkeleton() {
  return (
    <div>
      <div className="mt-3.5 space-y-2.5">
        <SkeletonLine width="w-full" height="h-4" />
        <SkeletonLine width="w-2/3" height="h-4" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#1c1917] p-4 sm:p-5">
            <SkeletonLine tone="raised" width="w-24" height="h-3.5" />
            <SkeletonChipRow tone="raised" count={4} className="mt-6" />
            <div className="mt-4 border-t border-white/[0.08] pt-3.5">
              <SkeletonBlock tone="raised" className="h-3 w-2/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-[#78716c]">{DISCLOSURE}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Trim, drop blanks, and keep the first of any case-insensitive repeat. */
function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const value = (item || '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
