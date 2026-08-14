'use client';

import { ArrowUpRight, Loader2, Sparkles, Target, TrendingUp, Users, Zap } from 'lucide-react';

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

function StatCard({
  icon, iconBg, label, value, sub, onClick, title,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="group flex items-center gap-3 bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-px transition-[box-shadow,transform] duration-300 px-3.5 py-3 text-left"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10.5px] font-bold uppercase tracking-[0.07em] text-ink-400">{label}</span>
        <span className="block text-[17px] font-bold text-ink-900 tabular-nums tracking-tight leading-tight truncate">
          {value}
        </span>
        {sub && <span className="block text-[10.5px] text-ink-400 truncate">{sub}</span>}
      </span>
    </button>
  );
}

export function StatsStrip({ stats, onOpenAnalytics, onRescore, rescoring }: StatsStripProps) {
  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          onClick={onOpenAnalytics}
          icon={
            stats.newLast24h > 0 ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
              </span>
            ) : (
              <Users className="h-4 w-4 text-orange-600" />
            )
          }
          iconBg="bg-orange-50"
          label="Leads"
          value={stats.total}
          sub={stats.newLast24h > 0 ? `${stats.newLast24h} new today` : undefined}
          title="Total leads found for this project"
        />
        <StatCard
          onClick={onOpenAnalytics}
          icon={<Target className="h-4 w-4 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Avg match"
          value={stats.avgRelevance === null ? '—' : `${stats.avgRelevance}%`}
          title="Average AI relevance across scored leads"
        />
        <StatCard
          onClick={onOpenAnalytics}
          icon={<Zap className="h-4 w-4 text-violet-600" />}
          iconBg="bg-violet-50"
          label="High intent"
          value={stats.highIntent}
          title="Leads with buying or solution-seeking intent"
        />
        <StatCard
          onClick={onOpenAnalytics}
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Top community"
          value={stats.topSubreddit ? `r/${stats.topSubreddit}` : '—'}
          sub={
            <span className="inline-flex items-center gap-0.5 text-ink-400 group-hover:text-orange-600 transition-colors">
              View analytics <ArrowUpRight className="h-2.5 w-2.5" />
            </span>
          }
          title="Community with the most leads — click for full analytics"
        />
      </div>

      {stats.unscored > 3 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#fff8ec] rounded-2xl shadow-[0_0_0_1px_rgba(217,150,6,0.16)]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
          </span>
          <p className="text-[12.5px] text-amber-900 flex-1 leading-snug">
            <span className="font-bold tabular-nums">{stats.unscored}</span> leads haven&apos;t been AI-scored yet, so they can&apos;t be ranked by relevance.
          </p>
          <button
            onClick={onRescore}
            disabled={rescoring}
            className="flex items-center gap-1.5 px-3.5 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11.5px] font-bold transition-colors disabled:opacity-60 shrink-0 shadow-[0_2px_8px_-2px_rgba(217,119,6,0.5)]"
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
