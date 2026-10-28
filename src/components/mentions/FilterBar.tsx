'use client';

import { ChevronDown, Search, X } from 'lucide-react';
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
  // Best match first: the inbox is for deciding what to answer, not reading a feed.
  sort: 'relevance',
  tab: 'all',
};

interface FilterBarProps {
  filters: MentionFilters;
  onChange: (next: Partial<MentionFilters>) => void;
  subreddits: string[];
  intents: string[];
  counts: { all: number; unread: number; replied: number };
}

/**
 * A native select dressed as a quiet text control. Native keeps keyboard and
 * mobile behaviour for free; it darkens when a non-default value is picked.
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
        className={`h-9 max-w-[160px] cursor-pointer appearance-none truncate rounded-lg pl-2.5 pr-7 text-[13px] font-medium transition-colors
          hover:bg-[#f7f6f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40
          ${active ? 'bg-[#1c1917] text-white hover:bg-[#1c1917]' : 'bg-transparent text-ink-600'}`}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${active ? 'text-white' : 'text-ink-400'}`}
      />
    </div>
  );
}

/**
 * One row: the triage tabs on the left, search and the three filters on the
 * right. Below lg the filters wrap under the tabs.
 */
export function FilterBar({ filters, onChange, subreddits, intents, counts }: FilterBarProps) {
  const hasActiveFilters =
    !!filters.query || filters.subreddit !== 'all' || filters.intent !== 'all' || filters.sort !== 'relevance';

  const tabs: { key: TriageTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'unread', label: 'To review', count: counts.unread },
    { key: 'replied', label: 'Replied', count: counts.replied },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-[#1c1917]/[0.08] pb-2">
      <div className="flex items-center gap-1" role="tablist" aria-label="Lead status">
        {tabs.map((t) => {
          const selected = filters.tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange({ tab: t.key })}
              className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-semibold transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40
                ${selected ? 'bg-[#ff4500]/[0.12] text-[#b83200]' : 'text-ink-600 hover:bg-[#f7f6f4] hover:text-ink-900'}`}
            >
              {t.label}
              <span className={`tabular-nums text-[12px] font-medium ${selected ? 'text-[#b83200]/80' : 'text-ink-400'}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full min-w-0 flex-wrap items-center gap-x-1 gap-y-2 lg:w-auto lg:flex-1 lg:justify-end">
        <label className="relative w-full lg:w-auto">
          <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Search leads"
            aria-label="Search leads"
            className="h-9 w-full rounded-lg border-2 border-[#1c1917]/[0.12] bg-white pl-8 pr-3 text-[13px] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-[#1c1917] focus:outline-none lg:w-[200px]"
          />
        </label>

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
          active={filters.sort !== 'relevance'}
          label="Sort leads"
        >
          <option value="relevance">Best match</option>
          <option value="new">Newest</option>
          <option value="comments">Most comments</option>
          <option value="upvotes">Most upvotes</option>
        </QuietSelect>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS, tab: filters.tab })}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-[12.5px] font-medium text-ink-600 transition-colors hover:bg-[#f7f6f4] hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
