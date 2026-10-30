'use client';

// The lead inbox (desktop): one uniform white row per thread, ranked for a
// glance (score, community, age, intent, status). Clicking a row opens it in
// place with the full post and the reply flow; clicking it again closes it.
// Only one row is open at a time. J and K move through the list.
//
// Below lg the page keeps the single-column MentionCard list instead.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, MessageCircle, Send } from 'lucide-react';
import { MentionCard, cleanRedditText } from './MentionCard';
import { SubredditBadge } from './SubredditBadge';
import { Mention, intentLabel, isHighIntent, isUnscored, relativeTime } from '@/lib/mentions';
import { useSubredditRules } from '@/lib/useSubredditRules';

interface LeadInboxProps {
  mentions: Mention[];
  viewed: Set<number>;
  published: Record<number, string>;
  onViewed: (id: number) => void;
  onPublished: (id: number, url: string) => void;
  /** How many leads match the filters beyond the ones in `mentions`. */
  remaining: number;
  onLoadMore: () => void;
  /** Queue pages: which flow the reading pane leads with. Default is the reply flow. */
  cardFocus?: 'reply' | 'dm';
  dmSent?: Record<number, number>;
  onDmSent?: (id: number) => void;
  /** Rendered under the reading pane: the queue's own action row. */
  footer?: (selected: Mention, position: { index: number; total: number }) => ReactNode;
  /** Open on this lead when the list first renders (from a deep link). */
  initialSelectedId?: number | null;
}

function ScoreBadge({ mention }: { mention: Mention }) {
  if (isUnscored(mention) || mention.relevance_score == null) {
    return (
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-ink-300 text-[11px] font-semibold text-ink-400"
        title="Not scored yet"
        aria-label="Not scored yet"
      >
        ?
      </span>
    );
  }
  const score = mention.relevance_score;
  const tone =
    score >= 80 ? 'bg-[#059669] text-white border-[#1c1917]'
      : score >= 60 ? 'bg-[#1c1917] text-white border-[#1c1917]'
        : 'bg-white text-ink-600 border-ink-300';
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-play text-[16px] font-extrabold tabular-nums ${tone}`}
      title={`${score} out of 100 match`}
      aria-label={`Score ${score} out of 100`}
    >
      {score}
    </span>
  );
}

export function LeadInbox({
  mentions, viewed, published, onViewed, onPublished, remaining, onLoadMore,
  cardFocus = 'reply', dmSent = {}, onDmSent, footer, initialSelectedId,
}: LeadInboxProps) {
  // Queue pages (they pass a footer) open on the first lead; the lead list
  // starts with every row closed unless a deep link names one.
  const [selectedId, setSelectedId] = useState<number | null>(
    (initialSelectedId && mentions.some((m) => m.id === initialSelectedId) ? initialSelectedId : null)
      ?? (footer ? mentions[0]?.id ?? null : null)
  );
  // Where the open row was last seen, so when a lead leaves the list (marked
  // posted, sent) the next one opens in its place instead of the top one.
  const lastIndex = useRef(0);

  useEffect(() => {
    if (selectedId == null || mentions.some((m) => m.id === selectedId)) return;
    const next = mentions[Math.min(lastIndex.current, mentions.length - 1)];
    setSelectedId(next?.id ?? null);
  }, [mentions, selectedId]);

  // Bring a newly opened row to the top of the view.
  useEffect(() => {
    if (selectedId == null) return;
    document.getElementById(`lead-row-${selectedId}`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  const index = useMemo(() => mentions.findIndex((m) => m.id === selectedId), [mentions, selectedId]);
  const rulesFor = useSubredditRules(useMemo(() => Array.from(new Set(mentions.map((m) => m.subreddit))), [mentions]));
  useEffect(() => { if (index >= 0) lastIndex.current = index; }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        const next = e.key === 'j' ? Math.min(mentions.length - 1, index + 1) : Math.max(0, index - 1);
        const m = mentions[next];
        if (m) {
          setSelectedId(m.id);
          document.getElementById(`lead-row-${m.id}`)?.scrollIntoView({ block: 'nearest' });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mentions, index]);

  // Clicking the open row again closes it.
  const toggle = (id: number) => setSelectedId((cur) => (cur === id ? null : id));

  return (
    <div>
      <ol className="border-t border-black/[0.08]" aria-label="Leads">
        {mentions.map((m, i) => {
          const open = m.id === selectedId;
          const replied = !!published[m.id];
          const messaged = !!dmSent[m.id];
          const seen = viewed.has(m.id);
          return (
            <li key={m.id} id={`lead-row-${m.id}`} className="border-b border-black/[0.08] bg-white">
              <button
                type="button"
                onClick={() => toggle(m.id)}
                aria-expanded={open}
                className={`group flex w-full items-center gap-4 px-2 py-3.5 text-left transition-colors duration-150 motion-reduce:transition-none
                  hover:bg-[#fcfbf9] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4500]/40
                  ${seen && !open && !replied ? 'opacity-60 hover:opacity-100' : ''}`}
              >
                <ScoreBadge mention={m} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[15px] leading-snug text-ink-900 line-clamp-1 ${seen || replied ? 'font-medium' : 'font-semibold'}`}>
                    {cleanRedditText(m.title)}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] text-ink-400">
                    <span className="font-semibold text-ink-600">r/{m.subreddit}</span>
                    <SubredditBadge rules={rulesFor(m.subreddit)} mode="static" />
                    <span aria-hidden="true">·</span>
                    <span>{relativeTime(m.created_utc)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" aria-hidden="true" />{m.num_comments}</span>
                    {m.intent && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className={isHighIntent(m) ? 'font-semibold text-[#047857]' : ''}>{intentLabel(m.intent)}</span>
                      </>
                    )}
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-3 text-[12.5px] font-semibold sm:flex">
                  {replied && <span className="inline-flex items-center gap-1 text-[#047857]"><Check className="h-3.5 w-3.5" aria-hidden="true" />Replied</span>}
                  {!replied && m.draft_reply && <span className="text-[#b83200]">Reply ready</span>}
                  {messaged && <span className="inline-flex items-center gap-1 text-[#047857]"><Send className="h-3.5 w-3.5" aria-hidden="true" />Messaged</span>}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-180 text-ink-900' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {open && (
                <div className="border-t border-black/[0.06] px-2 pb-5 pt-0 sm:pl-[64px]">
                  <MentionCard
                    key={m.id}
                    variant="detail"
                    inline
                    focus={cardFocus}
                    mention={m}
                    viewed={seen}
                    publishedUrl={published[m.id]}
                    dmSentAt={dmSent[m.id]}
                    onViewed={onViewed}
                    onPublished={onPublished}
                    onDmSent={onDmSent}
                    hotkeys
                  />
                  {footer && (
                    <div className="mt-4 border-t border-black/[0.06] pt-3">
                      {footer(m, { index: i, total: mentions.length })}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex items-center justify-between gap-4 pt-3">
        <p className="text-[11.5px] text-ink-400">
          <kbd className="rounded border border-ink-300 px-1 font-sans">J</kbd> next{' '}
          <kbd className="ml-1.5 rounded border border-ink-300 px-1 font-sans">K</kbd> previous{' '}
          <kbd className="ml-1.5 rounded border border-ink-300 px-1 font-sans">R</kbd> draft another
        </p>
        {remaining > 0 && (
          <button
            type="button"
            onClick={onLoadMore}
            className="h-10 rounded-xl border-2 border-dashed border-ink-300 px-4 text-[13px] font-semibold text-ink-600 transition-colors hover:border-[#1c1917] hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
          >
            Show {Math.min(25, remaining)} more
            <span className="font-normal text-ink-400"> ({remaining} left)</span>
          </button>
        )}
      </div>
    </div>
  );
}
