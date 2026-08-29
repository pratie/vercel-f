'use client';

import { useState } from 'react';
import { Check, ChevronDown, Minus } from 'lucide-react';
import { VisibilityPromptResult } from '@/lib/api';
import { engineLabel } from './engines';

interface PromptListProps {
  prompts: VisibilityPromptResult[];
}

export function PromptList({ prompts }: PromptListProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (prompts.length === 0) return null;

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400 mb-2.5">
        Every question we asked
      </h2>

      <div className="space-y-2">
        {prompts.map((prompt) => {
          const isOpen = expanded.has(prompt.id);
          const hits = prompt.results.filter((r) => r.brand_mentioned).length;

          return (
            <div key={prompt.id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <button
                onClick={() => toggle(prompt.id)}
                aria-expanded={isOpen}
                className="w-full text-left p-4 sm:p-5 flex items-start gap-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold text-ink-900 leading-snug tracking-[-0.01em]">
                    {prompt.text}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    {prompt.results.map((result) => (
                      <span
                        key={`${prompt.id}-${result.engine}`}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${
                          result.brand_mentioned
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-cream text-ink-400'
                        }`}
                        title={
                          result.brand_mentioned
                            ? `${engineLabel(result.engine)} recommends you${result.brand_rank ? ` at position ${result.brand_rank}` : ''}`
                            : `${engineLabel(result.engine)} does not mention you`
                        }
                      >
                        {result.brand_mentioned
                          ? <Check className="h-3 w-3" />
                          : <Minus className="h-3 w-3" />}
                        {engineLabel(result.engine)}
                        {result.brand_mentioned && result.brand_rank != null && (
                          <span className="tabular-nums opacity-70">#{result.brand_rank}</span>
                        )}
                      </span>
                    ))}
                    {prompt.results.length === 0 && (
                      <span className="text-[11.5px] text-ink-300">Not checked in the last run</span>
                    )}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-[11.5px] font-semibold text-ink-400 tabular-nums">
                    {hits}/{prompt.results.length}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-ink-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>

              {isOpen && prompt.results.length > 0 && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
                  {prompt.results.map((result) => (
                    <div key={`detail-${prompt.id}-${result.engine}`} className="rounded-xl bg-cream/60 px-3.5 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${result.brand_mentioned ? 'bg-emerald-500' : 'bg-ink-300'}`} />
                        <span className="text-[12px] font-bold text-ink-900">{engineLabel(result.engine)}</span>
                        <span className="text-[11.5px] text-ink-400">
                          {result.brand_mentioned ? 'recommends you' : 'did not mention you'}
                        </span>
                      </div>

                      {result.answer_excerpt && (
                        <p className="text-[12.5px] text-ink-600 leading-relaxed">
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
