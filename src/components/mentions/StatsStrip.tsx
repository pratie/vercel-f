'use client';

import { Loader2 } from 'lucide-react';

export interface MentionStats {
  total: number;
  newLast24h: number;
  avgRelevance: number | null; // null when nothing is scored yet
  highIntent: number;
  topSubreddit: string | null;
  unscored: number;
}

interface StatsStripProps {
  stats: MentionStats;
  onOpenAnalytics: () => void;
  onRescore: () => void;
  rescoring: boolean;
}

/**
 * One number and its label. `tone="good"` colours the number green, which is
 * reserved for the figure a user actually wants to go up: high intent leads.
 * Everything else stays ink, so the one green number carries real meaning.
 */
function Figure({ value, label, tone = 'plain' }: { value: string; label: string; tone?: 'plain' | 'good' }) {
  return (
    <span className="whitespace-nowrap">
      <span className={`font-semibold tabular-nums ${tone === 'good' ? 'text-emerald-600' : 'text-ink-900'}`}>
        {value}
      </span>
      <span className="text-ink-400"> {label}</span>
    </span>
  );
}

/**
 * One quiet line of numbers instead of four tiles. The whole line is the
 * analytics affordance; the only other control is the rescore nudge, which
 * appears solely when there is a real backlog of unscored leads.
 */
export function StatsStrip({ stats, onOpenAnalytics, onRescore, rescoring }: StatsStripProps) {
  const dot = <span aria-hidden="true" className="text-ink-300">·</span>;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px]">
      <button
        onClick={onOpenAnalytics}
        title="Open full analytics"
        className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-left rounded-md
          transition-colors hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25"
      >
        <Figure value={String(stats.total)} label={stats.total === 1 ? 'lead' : 'leads'} />
        {dot}
        <Figure value={String(stats.highIntent)} label="high intent" tone="good" />
        {dot}
        <Figure value={stats.avgRelevance === null ? '—' : `${stats.avgRelevance}%`} label="avg match" />
        {stats.topSubreddit && (
          <>
            {dot}
            <span className="whitespace-nowrap text-ink-400">
              top <span className="font-semibold text-ink-900">r/{stats.topSubreddit}</span>
            </span>
          </>
        )}
      </button>

      {stats.newLast24h > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[#d94100] whitespace-nowrap">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
          <span className="tabular-nums">{stats.newLast24h} new today</span>
        </span>
      )}

      {stats.unscored > 3 && (
        <button
          onClick={onRescore}
          disabled={rescoring}
          title={`${stats.unscored} leads have not been AI-scored yet, so they cannot be ranked by relevance`}
          className="ml-auto inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[12px] font-medium text-ink-600
            hover:text-ink-900 hover:bg-[#f7f6f4] transition-colors disabled:opacity-50
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25"
        >
          {rescoring ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {rescoring ? 'Scoring' : `Score ${stats.unscored} unscored`}
        </button>
      )}
    </div>
  );
}
