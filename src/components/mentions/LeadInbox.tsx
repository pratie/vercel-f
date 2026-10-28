'use client';

// The two-pane lead inbox (desktop). The job is "which thread do I answer,
// and what do I say?", so the list is built for ranking at a glance (a big
// score badge, the community, the intent) and the right pane holds one lead
// in full with its reply flow. Both panes scroll on their own, like a mail
// client, so the page never grows to thousands of pixels. J and K move
// through the queue.
//
// Below lg the page keeps the single-column MentionCard list instead.

import { useEffect, useMemo, useState } from 'react';
import { Check, MessageCircle } from 'lucide-react';
import { MentionCard } from './MentionCard';
import { Mention, intentLabel, isHighIntent, isUnscored, relativeTime } from '@/lib/mentions';
import { STICKER_PANEL } from '@/components/ui/sticker';

interface LeadInboxProps {
  mentions: Mention[];
  viewed: Set<number>;
  published: Record<number, string>;
  onViewed: (id: number) => void;
  onPublished: (id: number, url: string) => void;
  /** How many leads match the filters beyond the ones in `mentions`. */
  remaining: number;
  onLoadMore: () => void;
}

/** Height of both panes: the viewport minus the page header and toolbar. */
const PANE_HEIGHT = 'h-[calc(100vh-13.5rem)] min-h-[420px]';

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

export function LeadInbox({ mentions, viewed, published, onViewed, onPublished, remaining, onLoadMore }: LeadInboxProps) {
  const [selectedId, setSelectedId] = useState<number | null>(mentions[0]?.id ?? null);

  // Keep a valid selection when filters change the list underneath it.
  useEffect(() => {
    if (!mentions.some((m) => m.id === selectedId)) setSelectedId(mentions[0]?.id ?? null);
  }, [mentions, selectedId]);

  const index = useMemo(() => mentions.findIndex((m) => m.id === selectedId), [mentions, selectedId]);
  const selected = index >= 0 ? mentions[index] : null;

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

  return (
    <div className="grid grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-5 items-start">
      {/* Ranked list */}
      <div className={`flex flex-col ${PANE_HEIGHT}`}>
        {/* The extra padding gives the active sticker's offset shadow room inside the scroll box. */}
        <ul className="-mx-1.5 min-h-0 flex-1 space-y-1.5 overflow-y-auto px-1.5 pb-2 pt-1" aria-label="Leads">
          {mentions.map((m) => {
            const active = m.id === selectedId;
            const replied = !!published[m.id];
            const seen = viewed.has(m.id);
            return (
              <li key={m.id}>
                <button
                  id={`lead-row-${m.id}`}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-start gap-3 rounded-xl border-2 bg-white p-2.5 text-left transition-[box-shadow,border-color,transform] duration-150 motion-reduce:transition-none
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40
                    ${active
                      ? 'border-[#1c1917] shadow-[3px_3px_0_#1c1917]'
                      : 'border-transparent hover:border-[#1c1917]/[0.15]'}
                    ${seen && !active && !replied ? 'opacity-60' : ''}`}
                >
                  <ScoreBadge mention={m} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13.5px] leading-snug text-ink-900 line-clamp-2 ${seen || replied ? 'font-medium' : 'font-semibold'}`}>
                      {m.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-ink-400">
                      <span className="font-medium text-ink-600">r/{m.subreddit}</span>
                      <span aria-hidden="true">·</span>
                      <span>{relativeTime(m.created_utc)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" aria-hidden="true" />{m.num_comments}</span>
                    </span>
                    {(m.intent || replied || m.draft_reply) && (
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12px] text-ink-400">
                        {m.intent && (
                          <span className={isHighIntent(m) ? 'font-semibold text-[#047857]' : ''}>{intentLabel(m.intent)}</span>
                        )}
                        {m.intent && replied && <span aria-hidden="true">·</span>}
                        {replied && (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#047857]"><Check className="h-3 w-3" aria-hidden="true" />Replied</span>
                        )}
                        {!replied && m.draft_reply && (
                          <>
                            {m.intent && <span aria-hidden="true">·</span>}
                            <span className="font-semibold text-[#b83200]">Reply ready</span>
                          </>
                        )}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
          {remaining > 0 && (
            <li className="pt-1">
              <button
                type="button"
                onClick={onLoadMore}
                className="h-10 w-full rounded-xl border-2 border-dashed border-ink-300 text-[13px] font-semibold text-ink-600 transition-colors hover:border-[#1c1917] hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
              >
                Show {Math.min(25, remaining)} more
                <span className="font-normal text-ink-400"> ({remaining} left)</span>
              </button>
            </li>
          )}
        </ul>
        <p className="shrink-0 pt-2 text-center text-[11.5px] text-ink-400">
          <kbd className="rounded border border-ink-300 px-1 font-sans">J</kbd> next{' '}
          <kbd className="ml-1.5 rounded border border-ink-300 px-1 font-sans">K</kbd> previous
        </p>
      </div>

      {/* Reading pane */}
      {selected ? (
        <div className={`${STICKER_PANEL} ${PANE_HEIGHT} overflow-y-auto p-6`}>
          <MentionCard
            key={selected.id}
            variant="detail"
            mention={selected}
            viewed={viewed.has(selected.id)}
            publishedUrl={published[selected.id]}
            onViewed={onViewed}
            onPublished={onPublished}
          />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-ink-300 p-10 text-center text-[14px] text-ink-400">
          Pick a lead on the left to read it and draft a reply.
        </div>
      )}
    </div>
  );
}
