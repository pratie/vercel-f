'use client';

import { ArrowUpRight, BarChart3, Loader2, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

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

export function StatsStrip({ stats, onOpenAnalytics, onRescore, rescoring }: StatsStripProps) {
  return (
    <div className="mb-5 flex flex-col gap-2">
      <button
        onClick={onOpenAnalytics}
        className="w-full flex items-center gap-4 sm:gap-6 px-4 py-3 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-[box-shadow] duration-300 text-left group"
      >
        {stats.newLast24h > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-xs font-bold text-gray-900 tabular-nums">{stats.newLast24h}</span>
            <span className="text-xs text-gray-500">new today</span>
          </div>
        )}
        <div className="flex items-center gap-1.5" title="Average AI relevance across scored leads">
          <Target className="h-3 w-3 text-emerald-500" />
          <span className="text-xs text-gray-500">Avg match</span>
          <span className="text-xs font-bold text-gray-900 tabular-nums">
            {stats.avgRelevance === null ? '—' : `${stats.avgRelevance}%`}
          </span>
        </div>
        <div className="flex items-center gap-1.5" title="Leads with buying or solution-seeking intent">
          <Zap className="h-3 w-3 text-orange-500" />
          <span className="text-xs text-gray-500">High intent</span>
          <span className="text-xs font-bold text-gray-900 tabular-nums">{stats.highIntent}</span>
        </div>
        {stats.topSubreddit && (
          <div className="hidden sm:flex items-center gap-1.5" title="Community with the most leads">
            <TrendingUp className="h-3 w-3 text-violet-500" />
            <span className="text-xs text-gray-500">Top</span>
            <span className="text-xs font-bold text-gray-900">r/{stats.topSubreddit}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 text-[11px] font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
          <BarChart3 className="h-3 w-3" />
          <span className="hidden sm:inline">Analytics</span>
          <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {stats.unscored > 3 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50/70 rounded-xl shadow-[0_0_0_1px_rgba(217,119,6,0.12)]">
          <p className="text-xs text-amber-800 flex-1">
            <span className="font-semibold tabular-nums">{stats.unscored}</span> leads haven&apos;t been AI-scored yet, so they can&apos;t be ranked by relevance.
          </p>
          <button
            onClick={onRescore}
            disabled={rescoring}
            className="flex items-center gap-1.5 px-3 h-7 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors disabled:opacity-60 shrink-0"
          >
            {rescoring ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Scoring…</>
            ) : (
              <><Sparkles className="h-3 w-3" /> Score leads</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
