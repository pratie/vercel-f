'use client';

import { useState } from 'react';
import { ArrowBigUp, ArrowUpRight, MessageSquare, Minus } from 'lucide-react';
import { VisibilityOpportunity, VisibilityOpportunityThread } from '@/lib/api';
import { engineLabel, joinEngineNames } from './engines';
import { BTN_SECONDARY } from '@/components/ui/sticker';

interface OpportunitiesProps {
  items: VisibilityOpportunity[];
  /** True when the latest run found engines that skip the brand, even if no threads matched. */
  hasGaps: boolean;
  onOpenLeads: () => void;
}

/** "1 thread" / "3 threads". Every count in this section goes through here. */
function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/**
 * How busy a thread is. Upvotes and comments both signal that a conversation is
 * still alive and worth replying in, so they are added rather than ranked
 * separately. Used only for ordering, never shown as a score of its own.
 */
function threadReach(thread: VisibilityOpportunityThread): number {
  return (thread.score || 0) + (thread.num_comments || 0);
}

/**
 * The same post can be returned under several questions. It is one conversation
 * to go and join, so it is counted and rendered once per question and deduped
 * for the section total.
 */
function uniqueThreads(threads: VisibilityOpportunityThread[]): VisibilityOpportunityThread[] {
  const seen = new Set<number>();
  const out: VisibilityOpportunityThread[] = [];
  for (const thread of threads) {
    if (seen.has(thread.id)) continue;
    seen.add(thread.id);
    out.push(thread);
  }
  return out;
}

/**
 * Engine keys are aliased on the backend ("openai" and "chatgpt" both mean
 * ChatGPT), so dedupe on the display label. Otherwise a question can show the
 * same assistant twice and React sees duplicate keys.
 */
function uniqueEngineLabels(engines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const engine of engines) {
    const label = engineLabel(engine);
    if (seen.has(label)) continue;
    seen.add(label);
    out.push(label);
  }
  return out;
}

/** Threads shown per question before the rest fold behind a toggle. */
const THREADS_SHOWN = 3;

export function Opportunities({ items, hasGaps, onOpenLeads }: OpportunitiesProps) {
  const [openAll, setOpenAll] = useState<Set<number>>(new Set());
  if (items.length === 0 && !hasGaps) return null;

  // Prepared once so ordering, the header total and the cross-question badge
  // all read from the same deduped view of the data.
  const prepared = items.map((item) => {
    const threads = uniqueThreads(item.reddit_mentions)
      .sort((a, b) => threadReach(b) - threadReach(a) || a.id - b.id);
    return {
      item,
      threads,
      engines: uniqueEngineLabels(item.gap_engines),
      reach: threads.reduce((sum, thread) => sum + threadReach(thread), 0),
    };
  });

  // The queue order. Questions you can actually act on come first, then the
  // widest gap, then the liveliest threads. Deterministic all the way down so
  // the numbering does not shuffle between renders.
  const ranked = prepared.slice().sort((a, b) => {
    const aActionable = a.threads.length > 0;
    const bActionable = b.threads.length > 0;
    if (aActionable !== bActionable) return aActionable ? -1 : 1;
    if (b.engines.length !== a.engines.length) return b.engines.length - a.engines.length;
    if (b.reach !== a.reach) return b.reach - a.reach;
    if (b.threads.length !== a.threads.length) return b.threads.length - a.threads.length;
    return a.item.prompt_id - b.item.prompt_id;
  });

  // How many questions each thread turns up under. One reply that lands on a
  // thread covering three questions is worth flagging.
  const questionsPerThread = new Map<number, number>();
  for (const entry of prepared) {
    for (const thread of entry.threads) {
      questionsPerThread.set(thread.id, (questionsPerThread.get(thread.id) ?? 0) + 1);
    }
  }
  const totalThreads = questionsPerThread.size;

  // Say the real ordering rule, not an approximation of it. Actionability is the
  // first sort key, so a narrower gap with a thread outranks a wider gap without
  // one, and the header has to admit that or it contradicts what is on screen.
  // With one card there is no order to explain.
  const orderingNote =
    ranked.length < 2
      ? ''
      : totalThreads > 0
        ? ' Questions with a thread you can join come first, then the widest gap, then the busiest threads.'
        : ' Ordered by how many assistants skip you.';

  return (
    <section aria-labelledby="opportunities-heading">
      <div className="mb-4">
        <div className="min-w-0">
          <h2
            id="opportunities-heading"
            className="font-play text-[22px] font-bold leading-tight tracking-[-0.015em] text-ink-900"
          >
            Where to reply next
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-ink-600">
            {totalThreads > 0
              ? `${plural(totalThreads, 'Reddit conversation')} shaping the answers you are missing from.${orderingNote}`
              : `Where the assistants skip you, and what to do about it.${orderingNote}`}
          </p>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[#1c1917]/[0.12] bg-white p-5">
          <p className="min-w-[220px] flex-1 text-[13px] leading-snug text-ink-600">
            The assistants are skipping you on some questions, but none of your saved Reddit threads match
            those questions yet. Scan Reddit to pull in conversations worth joining.
          </p>
          <button onClick={onOpenLeads} className={BTN_SECONDARY}>
            Scan Reddit
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <ol className="space-y-3">
          {ranked.map(({ item, threads, engines }, index) => {
            // Only the first card carries the accent. If every card shouts, the
            // queue stops telling you where to start. And when nothing is
            // actionable yet (gaps found, no threads matched), nothing gets the
            // accent: pointing "start here" at a card whose only content is
            // "scan Reddit" is a promise the card cannot keep. Actionable cards
            // sort first, so index 0 having threads means it is the best one.
            const isNext = index === 0 && threads.length > 0;
            return (
              <li
                key={item.prompt_id}
                className={`overflow-hidden rounded-2xl bg-white ${
                  isNext
                    ? 'border-2 border-[#1c1917] shadow-[4px_4px_0_#1c1917]'
                    : 'border-2 border-[#1c1917]/[0.12]'
                }`}
              >

                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-play text-[12px] font-extrabold tabular-nums ${
                        isNext ? 'bg-[#d13800] text-white' : 'bg-cream text-ink-600'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[14.5px] font-semibold text-ink-900 leading-snug tracking-[-0.01em]"
                        style={{ textWrap: 'pretty' } as React.CSSProperties}
                      >
                        &ldquo;{item.prompt_text}&rdquo;
                      </p>

                      {engines.length > 0 && (
                        <div
                          className="mt-2 flex flex-wrap items-center gap-1.5"
                          title={`${joinEngineNames(engines)} did not name you in the latest run.`}
                        >
                          <span className="text-[12px] font-medium text-ink-400">Not named by</span>
                          {engines.map((label) => (
                            <span key={label} className="chip bg-cream text-ink-600">
                              <Minus className="h-3 w-3 text-ink-300" aria-hidden="true" />
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {threads.length > 0 ? (
                    <div className="mt-3.5 sm:pl-9">
                      {(() => {
                        const showAll = openAll.has(item.prompt_id);
                        const shown = showAll ? threads : threads.slice(0, THREADS_SHOWN);
                        const hidden = threads.length - shown.length;
                        return (
                          <>
                      <p className="mb-1.5 text-[12px] font-semibold text-ink-600 tabular-nums">
                        {plural(threads.length, 'thread')} ranking for this question
                      </p>

                      <ul className="space-y-1.5">
                        {shown.map((thread) => {
                          const alsoCovers = (questionsPerThread.get(thread.id) ?? 1) - 1;
                          return (
                            <li
                              key={thread.id}
                              className="rounded-xl bg-cream px-3.5 py-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                  <a
                                    href={thread.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded text-[13.5px] font-semibold leading-snug text-ink-900 transition-colors line-clamp-2 hover:text-[#b83200] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                                  >
                                    {thread.title}
                                  </a>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11.5px] text-ink-400">
                                    <span className="font-medium text-ink-600">
                                      r/{thread.subreddit}
                                    </span>
                                    <span
                                      className="flex items-center gap-1 tabular-nums"
                                      title={plural(thread.score ?? 0, 'upvote')}
                                    >
                                      <ArrowBigUp className="h-3.5 w-3.5" aria-hidden="true" />
                                      {thread.score ?? 0}
                                    </span>
                                    <span
                                      className="flex items-center gap-1 tabular-nums"
                                      title={plural(thread.num_comments ?? 0, 'comment')}
                                    >
                                      <MessageSquare className="h-3 w-3" aria-hidden="true" />
                                      {thread.num_comments ?? 0}
                                    </span>
                                    {alsoCovers > 0 && (
                                      <span className="tabular-nums">
                                        Also ranks for {plural(alsoCovers, 'other question')}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <a
                                  href={thread.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Join thread on Reddit: ${thread.title}`}
                                  className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-[12.5px] font-semibold text-[#b83200] transition-colors hover:bg-white hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50"
                                >
                                  Join
                                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                                </a>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {hidden > 0 && (
                        <button
                          type="button"
                          onClick={() => setOpenAll((prev) => new Set(prev).add(item.prompt_id))}
                          className="mt-2 inline-flex h-9 items-center rounded-lg px-2 text-[12.5px] font-semibold text-ink-600 transition-colors hover:bg-cream hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                        >
                          Show {plural(hidden, 'more thread')}
                        </button>
                      )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="mt-3.5 sm:pl-9 flex flex-wrap items-center gap-2">
                      <p className="min-w-[200px] flex-1 text-[12.5px] leading-snug text-ink-600">
                        No saved Reddit thread matches this question yet. Scan Reddit to find one.
                      </p>
                      <button
                        onClick={onOpenLeads}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold text-ink-600 transition-colors hover:bg-cream hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                      >
                        Scan Reddit
                        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
