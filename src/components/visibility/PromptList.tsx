'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Minus } from 'lucide-react';
import { VisibilityEngineResult, VisibilityPromptResult } from '@/lib/api';
import { engineLabel } from './engines';

interface PromptListProps {
  prompts: VisibilityPromptResult[];
}

/**
 * Shared column width. The header cells and the row cells both use it, which is
 * what keeps the grid reading as columns without a real <table>.
 */
const CELL = 'w-[52px] sm:w-[62px]';

/**
 * One answer. The whole run is only a handful of these, so every one gets a
 * cell rather than being rolled into a percentage. Rank is shown in place of
 * the check when we have it: "named at position 2" is strictly more than
 * "named".
 */
function AnswerCell({ label, result }: { label: string; result: VisibilityEngineResult | undefined }) {
  let badge: string;
  let content: React.ReactNode;
  let description: string;

  if (!result) {
    badge = 'bg-paper text-ink-300';
    content = <span className="h-1 w-1 rounded-full bg-ink-300" aria-hidden="true" />;
    description = `${label} was not asked this question in the last run`;
  } else if (result.brand_mentioned) {
    badge = 'bg-emerald-50 text-emerald-700';
    content = result.brand_rank != null
      ? <span className="text-[11px] font-bold leading-none tabular-nums">#{result.brand_rank}</span>
      : <Check className="h-3.5 w-3.5" aria-hidden="true" />;
    description = result.brand_rank != null
      ? `${label} names you at position ${result.brand_rank}`
      : `${label} names you`;
  } else {
    badge = 'bg-cream text-ink-300';
    content = <Minus className="h-3.5 w-3.5" aria-hidden="true" />;
    description = `${label} does not name you`;
  }

  return (
    <span className={`flex shrink-0 flex-col items-center gap-1 px-0.5 ${CELL}`}>
      <span
        title={description}
        className={`flex h-7 w-full items-center justify-center rounded-lg ${badge}`}
      >
        {content}
        <span className="sr-only">{description}</span>
      </span>
      <span className="max-w-full truncate text-[9.5px] font-semibold leading-none text-ink-400 sm:hidden">
        {label}
      </span>
    </span>
  );
}

export function PromptList({ prompts }: PromptListProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Engine keys are aliased on the backend ("openai" and "chatgpt" both mean
  // ChatGPT), so the columns are keyed on the display label. Order is first
  // appearance, which keeps a column in the same place between renders.
  const columns = useMemo(() => {
    const seen: string[] = [];
    for (const prompt of prompts) {
      for (const result of prompt.results) {
        const label = engineLabel(result.engine);
        if (!seen.includes(label)) seen.push(label);
      }
    }
    return seen;
  }, [prompts]);

  const { answers, hits } = useMemo(() => {
    let total = 0;
    let named = 0;
    for (const prompt of prompts) {
      total += prompt.results.length;
      named += prompt.results.filter((r) => r.brand_mentioned).length;
    }
    return { answers: total, hits: named };
  }, [prompts]);

  if (prompts.length === 0) return null;

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const pct = answers > 0 ? Math.round((hits / answers) * 100) : 0;

  return (
    <section aria-labelledby="questions-heading">
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          id="questions-heading"
          className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400"
        >
          Every question we asked
        </h2>
        <p className="text-[11.5px] text-ink-400 tabular-nums">
          {prompts.length} question{prompts.length === 1 ? '' : 's'} × {columns.length} assistant
          {columns.length === 1 ? '' : 's'}, {hits} of {answers} answers named you ({pct}%)
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        {/* Column header. Below sm the cells carry their own labels instead, so
            the grid still reads when it wraps under the question. */}
        <div className="hidden items-center gap-x-3 border-b border-cream px-5 pb-2 pt-3.5 sm:flex">
          <span className="min-w-0 flex-1 text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-300">
            Question
          </span>
          <span className="flex shrink-0 items-center gap-x-3">
            <span className="flex">
              {columns.map((label) => (
                <span
                  key={label}
                  title={label}
                  className={`truncate px-0.5 text-center text-[10.5px] font-semibold text-ink-400 ${CELL}`}
                >
                  {label}
                </span>
              ))}
            </span>
            <span className="w-[46px] text-right text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-300">
              Named
            </span>
            <span className="w-4 shrink-0" aria-hidden="true" />
          </span>
        </div>

        <ul className="divide-y divide-cream">
          {prompts.map((prompt) => {
            const isOpen = expanded.has(prompt.id);
            const named = prompt.results.filter((r) => r.brand_mentioned).length;

            // First result wins per column, so an aliased duplicate cannot
            // render the same assistant twice on one row.
            const byLabel = new Map<string, VisibilityEngineResult>();
            for (const result of prompt.results) {
              const label = engineLabel(result.engine);
              if (!byLabel.has(label)) byLabel.set(label, result);
            }

            return (
              <li key={prompt.id}>
                <button
                  onClick={() => toggle(prompt.id)}
                  aria-expanded={isOpen}
                  className="flex w-full flex-wrap items-center gap-x-3 gap-y-2.5 px-4 py-3 text-left transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/40 sm:px-5"
                >
                  <span className="min-w-[180px] flex-1 text-[13px] font-semibold leading-snug tracking-[-0.01em] text-ink-900">
                    {prompt.text}
                  </span>

                  {/* Below sm the cell group takes its own line, and the line can
                      be narrower than the group's natural width at 320px or with
                      a fifth assistant. Letting it shrink and wrap keeps the
                      chevron and the Named column inside the card, which
                      overflow-hidden would otherwise clip away. Fixed at sm+. */}
                  <span className="flex items-center gap-x-3 sm:shrink-0">
                    {columns.length > 0 ? (
                      <span className="flex flex-wrap gap-y-1.5 sm:flex-nowrap sm:gap-y-0">
                        {columns.map((label) => (
                          <AnswerCell key={`${prompt.id}-${label}`} label={label} result={byLabel.get(label)} />
                        ))}
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-ink-300">Not checked in the last run</span>
                    )}

                    <span
                      className={`w-[46px] shrink-0 text-right text-[11.5px] font-semibold tabular-nums ${
                        named > 0 ? 'text-ink-900' : 'text-ink-400'
                      }`}
                    >
                      {named} of {prompt.results.length}
                    </span>

                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-ink-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isOpen && prompt.results.length > 0 && (
                  <div className="space-y-2 px-4 pb-4 sm:px-5">
                    {prompt.results.map((result) => (
                      <div key={`detail-${prompt.id}-${result.engine}`} className="rounded-xl bg-cream/60 px-3.5 py-3">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${result.brand_mentioned ? 'bg-emerald-600' : 'bg-ink-300'}`} />
                          <span className="text-[12px] font-bold text-ink-900">{engineLabel(result.engine)}</span>
                          <span className="text-[11.5px] text-ink-400">
                            {result.brand_mentioned
                              ? result.brand_rank != null
                                ? `names you at position ${result.brand_rank}`
                                : 'names you'
                              : 'did not name you'}
                          </span>
                        </div>

                        {result.answer_excerpt && (
                          <p className="text-[12.5px] leading-relaxed text-ink-600">
                            {result.answer_excerpt}
                          </p>
                        )}

                        {result.competitors.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-ink-400">
                              {result.brand_mentioned ? 'Also named:' : 'Recommended instead:'}
                            </span>
                            {result.competitors.map((name) => (
                              <span key={`${result.engine}-${name}`} className="chip bg-white text-ink-600 shadow-card">
                                {name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* The cells are never colour alone, but the shorthand still needs saying once. */}
      <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-400">
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-5 items-center justify-center rounded bg-emerald-50 text-emerald-700">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
          names you
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-4 w-5 items-center justify-center rounded bg-cream text-ink-300">
            <Minus className="h-3 w-3" aria-hidden="true" />
          </span>
          does not
        </span>
        <span className="tabular-nums">#2 is your position in that answer</span>
        <span>Open a question for the answer text and who was named instead.</span>
      </p>
    </section>
  );
}
