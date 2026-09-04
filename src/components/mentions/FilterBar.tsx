'use client';

import { ChevronDown, Search } from 'lucide-react';
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

/**
 * A borderless select that reads as a text control until it is active.
 * Native <select> keeps keyboard and mobile behaviour for free.
 */
function QuietSelect({
  value, onChange, active, label, children,
}: {
  value: string;
  onChange: (value: string) => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`appearance-none h-8 pl-2.5 pr-7 rounded-lg bg-transparent text-[12.5px] font-medium cursor-pointer
          transition-colors hover:bg-[#f6f3ee] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25
          ${active ? 'text-ink-900 bg-[#f2ede6]' : 'text-ink-400'}`}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 ${active ? 'text-ink-600' : 'text-ink-300'}`}
      />
    </div>
  );
}

export function FilterBar({ filters, onChange, subreddits, intents, counts, shown, matched }: FilterBarProps) {
  const hasActiveFilters =
    !!filters.query || filters.subreddit !== 'all' || filters.intent !== 'all' || filters.sort !== 'new' || filters.tab !== 'all';

  const tabs: { key: TriageTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'unread', label: 'To review', count: counts.unread },
    { key: 'replied', label: 'Replied', count: counts.replied },
  ];

  return (
    <div className="mb-1">
      {/* Search is the primary control */}
      <div className="relative">
        <Search aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="Search leads"
          className="w-full h-11 pl-7 pr-3 bg-transparent text-[15px] text-ink-900 placeholder:text-ink-300
            border-b border-black/[0.06] focus:outline-none focus:border-ink-300 transition-colors"
        />
      </div>

      {/* Tabs and filters share one row, scrollable on small screens */}
      <div className="flex items-center gap-3 overflow-x-auto border-b border-black/[0.06] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-1 shrink-0" role="tablist" aria-label="Lead status">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={filters.tab === t.key}
              onClick={() => onChange({ tab: t.key })}
              className={`relative h-11 px-2 text-[12.5px] font-medium whitespace-nowrap transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25
                ${filters.tab === t.key ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600'}`}
            >
              {t.label}
              <span className="ml-1.5 font-normal text-ink-300 tabular-nums">{t.count}</span>
              {filters.tab === t.key && (
                <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px bg-ink-900" />
              )}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1 shrink-0 pl-3">
          <QuietSelect
            value={filters.subreddit}
            onChange={(v) => onChange({ subreddit: v })}
            active={filters.subreddit !== 'all'}
            label="Filter by subreddit"
          >
            <option value="all">All subreddits</option>
            {subreddits.map((sr) => (
              <option key={sr} value={sr}>r/{sr}</option>
            ))}
          </QuietSelect>

          <QuietSelect
            value={filters.intent}
            onChange={(v) => onChange({ intent: v })}
            active={filters.intent !== 'all'}
            label="Filter by intent"
          >
            <option value="all">All intents</option>
            {intents.map((i) => (
              <option key={i} value={i}>{intentLabel(i)}</option>
            ))}
          </QuietSelect>

          <QuietSelect
            value={filters.sort}
            onChange={(v) => onChange({ sort: v as SortKey })}
            active={filters.sort !== 'new'}
            label="Sort leads"
          >
            <option value="new">Newest</option>
            <option value="relevance">Best match</option>
            <option value="comments">Most comments</option>
            <option value="upvotes">Most upvotes</option>
          </QuietSelect>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 py-2.5 text-[11.5px] text-ink-400">
        <span>
          Showing <span className="text-ink-600 tabular-nums">{shown}</span> of{' '}
          <span className="text-ink-600 tabular-nums">{matched}</span>
        </span>
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="text-ink-400 hover:text-[#d94100] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
