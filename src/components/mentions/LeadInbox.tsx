'use client';

// The two-pane lead inbox (desktop). The job is "which thread do I answer,
// and what do I say?", so the list is built for ranking at a glance (a big
// score badge, the intent, the community) and the right pane holds one lead
// in full with its reply flow. J and K move through the queue.
//
// Below lg the page keeps the single-column MentionCard list instead.

import { useEffect, useMemo, useState } from 'react';
import { Check, MessageCircle } from 'lucide-react';
import { MentionCard } from './MentionCard';
import { Mention, intentLabel, isHighIntent, isUnscored, relativeTime } from '@/lib/mentions';

interface LeadInboxProps {
  mentions: Mention[];
  viewed: Set<number>;
  published: Record<number, string>;
  onViewed: (id: number) => void;
  onPublished: (id: number, url: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

function ScoreBadge({ mention }: { mention: Mention }) {
  if (isUnscored(mention) || mention.relevance_score == null) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-ink-300 text-[11px] font-semibold text-ink-400" title="Not scored yet">
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
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-play text-[17px] font-extrabold tabular-nums ${tone}`}
      title={`${score} out of 100 match`}
    >
      {score}
    </span>
  );
}

export function LeadInbox({ mentions, viewed, published, onViewed, onPublished, hasMore, onLoadMore }: LeadInboxProps) {
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
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
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
    <div className="grid grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6 items-start">
      {/* Ranked list */}
      <div>
        <ul className="space-y-2" aria-label="Leads">
          {mentions.map((m) => {
            const active = m.id === selectedId;
            const replied = !!published[m.id];
            return (
              <li key={m.id}>
                <button
                  id={`lead-row-${m.id}`}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-start gap-3 rounded-2xl border-2 bg-white p-3 text-left transition-[box-shadow,border-color,transform] duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40
                    ${active
                      ? 'border-[#1c1917] shadow-[4px_4px_0_#1c1917] -translate-x-[2px] -translate-y-[2px]'
                      : 'border-transparent hover:border-black/[0.12]'}
                    ${viewed.has(m.id) && !active && !replied ? 'opacity-70' : ''}`}
                >
                  <ScoreBadge mention={m} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold leading-snug text-ink-900 line-clamp-2">{m.title}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-400">
                      <span className="font-medium text-ink-600">r/{m.subreddit}</span>
                      <span>{relativeTime(m.created_utc)}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{m.num_comments}</span>
                      {replied && (
                        <span className="inline-flex items-center gap-1 font-medium text-[#047857]"><Check className="h-3 w-3" />Replied</span>
                      )}
                    </span>
                    {m.intent && (
                      <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${isHighIntent(m) ? 'bg-[#059669]/[0.12] text-[#047857]' : 'bg-black/[0.05] text-ink-600'}`}>
                        {intentLabel(m.intent)}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            className="mt-3 h-10 w-full rounded-xl border-2 border-dashed border-ink-300 text-[13px] font-semibold text-ink-600 hover:border-[#1c1917] hover:text-ink-900"
          >
            Show more leads
          </button>
        )}
        <p className="mt-3 text-center text-[12px] text-ink-400">
          Press <kbd className="rounded border border-ink-300 px-1 font-sans">J</kbd> and <kbd className="rounded border border-ink-300 px-1 font-sans">K</kbd> to move between leads
        </p>
      </div>

      {/* Reading pane */}
      <div className="sticky top-6">
        {selected ? (
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[22px] border-2 border-[#1c1917] bg-white p-6 shadow-[6px_6px_0_#1c1917]">
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
          <div className="rounded-[22px] border-2 border-dashed border-ink-300 p-10 text-center text-[14px] text-ink-400">
            Pick a lead on the left to read it and draft a reply.
          </div>
        )}
      </div>
    </div>
  );
}
