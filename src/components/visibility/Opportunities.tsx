'use client';

import { ArrowBigUp, ArrowUpRight, MessageSquare, Search, Target } from 'lucide-react';
import { VisibilityOpportunity } from '@/lib/api';
import { joinEngineNames } from './engines';

interface OpportunitiesProps {
  items: VisibilityOpportunity[];
  /** True when the latest run found engines that skip the brand, even if no threads matched. */
  hasGaps: boolean;
  onOpenLeads: () => void;
}

/**
 * The action line under each question. Split so the engine names can be
 * emphasised without re-parsing the assembled sentence.
 */
function gapCopy(gapEngines: string[], threadCount: number): { names: string; rest: string } {
  const names = joinEngineNames(gapEngines);
  const threads = `${threadCount} Reddit thread${threadCount === 1 ? '' : 's'}`;
  if (!names) return { names: '', rest: `These ${threads} rank for this question.` };
  const verb = gapEngines.length === 1 ? 'does not' : 'do not';
  return { names, rest: `${verb} mention you for this. These ${threads} rank for it.` };
}

export function Opportunities({ items, hasGaps, onOpenLeads }: OpportunitiesProps) {
  if (items.length === 0 && !hasGaps) return null;

  const totalThreads = items.reduce((acc, item) => acc + item.reddit_mentions.length, 0);

  return (
    <section>
      <div className="flex items-start gap-3 mb-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Target className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-ink-900 leading-tight tracking-tight">
            Close the gap
          </h2>
          <p className="text-[12.5px] text-ink-400 leading-snug mt-0.5">
            {items.length > 0
              ? `${totalThreads} Reddit conversation${totalThreads === 1 ? '' : 's'} shaping the answers you are missing from. Join them and the models start seeing you.`
              : 'Where the assistants skip you, and what to do about it.'}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-5 flex flex-wrap items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cream text-ink-400">
            <Search className="h-3.5 w-3.5" />
          </span>
          <p className="flex-1 min-w-[220px] text-[12.5px] text-ink-600 leading-snug">
            You have gaps, but none of your saved Reddit leads match those questions yet. Scan Reddit to find
            conversations worth joining.
          </p>
          <button
            onClick={onOpenLeads}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-white text-xs font-semibold text-ink-600 shadow-card hover:shadow-card-hover hover:text-ink-900 transition-[box-shadow,color]"
          >
            Find leads
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const copy = gapCopy(item.gap_engines, item.reddit_mentions.length);
            return (
            <div
              key={item.prompt_id}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(255,69,0,0.09),0_0_0_1px_rgba(255,69,0,0.13),0_8px_20px_-10px_rgba(255,69,0,0.12)] hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />
              <div className="p-4 sm:p-5">
                <p className="text-[14.5px] font-semibold text-ink-900 leading-snug tracking-[-0.01em]">
                  &ldquo;{item.prompt_text}&rdquo;
                </p>
                <p className="mt-1.5 text-[12.5px] text-ink-600 leading-snug">
                  {copy.names && <span className="font-semibold text-orange-700">{copy.names} </span>}
                  {copy.rest}
                </p>

                <ul className="mt-3.5 space-y-1.5">
                  {item.reddit_mentions.map((thread) => (
                    <li key={thread.id}>
                      <a
                        href={thread.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2.5 rounded-xl bg-cream/70 px-3.5 py-2.5 hover:bg-orange-50 transition-colors"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium text-ink-900 leading-snug group-hover:text-orange-700 transition-colors line-clamp-2">
                            {thread.title}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-3 text-[11.5px] text-ink-400">
                            <span className="font-semibold text-ink-600">r/{thread.subreddit}</span>
                            <span className="flex items-center gap-1 tabular-nums" title="Upvotes">
                              <ArrowBigUp className="h-3.5 w-3.5" />
                              {thread.score}
                            </span>
                            <span className="flex items-center gap-1 tabular-nums" title="Comments">
                              <MessageSquare className="h-3 w-3" />
                              {thread.num_comments}
                            </span>
                          </span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-ink-300 group-hover:text-orange-600 transition-colors" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
