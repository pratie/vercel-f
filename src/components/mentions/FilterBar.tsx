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
  'h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-gray-300';

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
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-lg w-fit" role="tablist" aria-label="Lead status">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={filters.tab === t.key}
            onClick={() => onChange({ tab: t.key })}
            className={`px-3 h-7 rounded-md text-xs font-medium transition-colors tabular-nums ${
              filters.tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 ${filters.tab === t.key ? 'text-gray-400' : 'text-gray-400/70'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Search leads…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-gray-300 transition-[border-color,box-shadow]"
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

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>
          Showing <span className="font-medium text-gray-600 tabular-nums">{shown}</span> of{' '}
          <span className="font-medium text-gray-600 tabular-nums">{matched}</span> leads
        </span>
        {hasActiveFilters && (
          <button onClick={() => onChange({ ...DEFAULT_FILTERS })} className="text-orange-600 hover:text-orange-700 font-medium">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
