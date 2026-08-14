'use client';

import { Search } from 'lucide-react';
import { intentLabel } from '@/lib/mentions';

export type SortKey = 'new' | 'relevance' | 'comments' | 'upvotes';
export type TriageTab = 'all' | 'unread' | 'replied';

export interface MentionFilters {
  query: string;
  subreddit: string; // 'all' or name
  intent: string; // 'all' or slug
  sort: SortKey;
  tab: TriageTab;
}

export const DEFAULT_FILTERS: MentionFilters = {
  query: '',
  subreddit: 'all',
  intent: 'all',
  sort: 'new',
  tab: 'all',
};

interface FilterBarProps {
  filters: MentionFilters;
  onChange: (next: Partial<MentionFilters>) => void;
  subreddits: string[];
  intents: string[];
  counts: { all: number; unread: number; replied: number };
  shown: number;
  matched: number;
}

const selectCls =
  'h-10 px-3 rounded-xl bg-white text-xs font-medium text-ink-600 shadow-card focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-shadow cursor-pointer hover:shadow-card-hover';

export function FilterBar({ filters, onChange, subreddits, intents, counts, shown, matched }: FilterBarProps) {
  const hasActiveFilters =
    filters.query || filters.subreddit !== 'all' || filters.intent !== 'all' || filters.sort !== 'new' || filters.tab !== 'all';

  const tabs: { key: TriageTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'unread', label: 'To review', count: counts.unread },
    { key: 'replied', label: 'Replied', count: counts.replied },
  ];

  return (
    <div className="mb-5 space-y-3">
      {/* Triage tabs */}
      <div className="flex items-center gap-1 p-1 bg-cream rounded-full w-fit" role="tablist" aria-label="Lead status">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={filters.tab === t.key}
            onClick={() => onChange({ tab: t.key })}
            className={`px-4 h-8 rounded-full text-xs font-semibold transition-all tabular-nums ${
              filters.tab === t.key
                ? 'bg-white text-orange-700 shadow-card'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {t.label}
            <span
              className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                filters.tab === t.key ? 'bg-orange-100 text-orange-700' : 'bg-white/70 text-ink-400'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Search leads…"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-white text-[13px] text-ink-900 placeholder:text-ink-300 shadow-card focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:shadow-card-hover transition-shadow"
          />
        </div>
        <div className="grid grid-cols-3 sm:flex gap-2">
          <select value={filters.subreddit} onChange={(e) => onChange({ subreddit: e.target.value })} className={selectCls} aria-label="Filter by subreddit">
            <option value="all">All subreddits</option>
            {subreddits.map((sr) => (
              <option key={sr} value={sr}>r/{sr}</option>
            ))}
          </select>
          <select value={filters.intent} onChange={(e) => onChange({ intent: e.target.value })} className={selectCls} aria-label="Filter by intent">
            <option value="all">All intents</option>
            {intents.map((i) => (
              <option key={i} value={i}>{intentLabel(i)}</option>
            ))}
          </select>
          <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as SortKey })} className={selectCls} aria-label="Sort leads">
            <option value="new">Newest</option>
            <option value="relevance">Best match</option>
            <option value="comments">Most comments</option>
            <option value="upvotes">Most upvotes</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-ink-400">
        <span>
          Showing <span className="font-semibold text-ink-600 tabular-nums">{shown}</span> of{' '}
          <span className="font-semibold text-ink-600 tabular-nums">{matched}</span> leads
        </span>
        {hasActiveFilters && (
          <button onClick={() => onChange({ ...DEFAULT_FILTERS })} className="text-orange-600 hover:text-orange-700 font-semibold">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
