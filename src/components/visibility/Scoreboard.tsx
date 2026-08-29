'use client';

import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { VisibilityBrandScore, VisibilityCompetitorScore } from '@/lib/api';
import { formatRunDate } from './engines';

interface ScoreboardProps {
  brand: VisibilityBrandScore;
  competitors: VisibilityCompetitorScore[];
  completedAt: string | null;
}

interface Row {
  name: string;
  pct: number;
  isBrand: boolean;
}

export function Scoreboard({ brand, competitors, completedAt }: ScoreboardProps) {
  // One ranked list so the user's position reads as a standing, not a separate stat.
  const rows: Row[] = useMemo(() => {
    const merged: Row[] = [
      { name: brand.name || 'You', pct: brand.visibility_pct, isBrand: true },
      ...competitors.map((c) => ({ name: c.name, pct: c.visibility_pct, isBrand: false })),
    ];
    return merged.sort((a, b) => b.pct - a.pct);
  }, [brand, competitors]);

  const brandRank = rows.findIndex((r) => r.isBrand) + 1;
  const leader = rows[0];
  const checkedAt = formatRunDate(completedAt);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 sm:p-7">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-10">
        {/* ── Hero stat ── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400">
            You are recommended in
          </p>
          <div className="mt-1.5 flex items-baseline gap-1 text-ink-900">
            <span
              className="text-[64px] font-bold leading-none tracking-tight tabular-nums"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {brand.visibility_pct}
            </span>
            <span className="text-[30px] font-bold leading-none text-ink-300">%</span>
          </div>
          <p className="mt-2 text-[14px] font-semibold text-ink-700">of AI answers</p>
          <p className="mt-1 text-[12.5px] text-ink-400 leading-snug">
            <span className="font-semibold text-ink-600 tabular-nums">{brand.mention_count}</span> of{' '}
            <span className="font-semibold text-ink-600 tabular-nums">{brand.total_checks}</span> answers named{' '}
            {brand.name || 'you'}.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {competitors.length > 0 && (
              <span
                className={`chip ${brandRank === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-cream text-ink-600'}`}
                title="Your rank against the competitors you track"
              >
                <Trophy className="h-3 w-3" />
                #{brandRank} of {rows.length}
              </span>
            )}
            {checkedAt && (
              <span className="text-[11.5px] text-ink-400">Checked {checkedAt}</span>
            )}
          </div>
        </div>

        {/* ── Ranked comparison ── */}
        <div>
          <div className="flex items-baseline justify-between mb-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400">
              Share of AI answers
            </p>
            {competitors.length > 0 && brandRank > 1 && leader && (
              <p className="text-[11.5px] text-ink-400">
                <span className="font-semibold text-ink-600">{leader.name}</span> leads by{' '}
                <span className="font-semibold text-ink-600 tabular-nums">
                  {leader.pct - brand.visibility_pct}
                </span>{' '}
                points
              </p>
            )}
          </div>

          <div className="space-y-2.5">
            {rows.map((row, index) => (
              <div key={`${row.name}-${index}`} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-[11px] font-semibold text-ink-300 tabular-nums text-right">
                  {index + 1}
                </span>
                <span
                  className={`w-[30%] max-w-[170px] shrink-0 truncate text-[12.5px] leading-snug ${
                    row.isBrand ? 'font-bold text-ink-900' : 'font-medium text-ink-600'
                  }`}
                  title={row.name}
                >
                  {row.name}
                  {row.isBrand && <span className="ml-1.5 text-[10.5px] font-semibold text-orange-600">you</span>}
                </span>
                <div className="flex-1 min-w-0 h-2.5 rounded-full bg-cream overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                      row.isBrand
                        ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                        : index === 0
                          ? 'bg-ink-400'
                          : 'bg-ink-300'
                    }`}
                    style={{ width: `${Math.max(row.pct, row.pct > 0 ? 2 : 0)}%` }}
                  />
                </div>
                <span
                  className={`w-10 shrink-0 text-right text-[12.5px] tabular-nums ${
                    row.isBrand ? 'font-bold text-ink-900' : 'font-medium text-ink-400'
                  }`}
                >
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>

          {competitors.length === 0 && (
            <p className="mt-3.5 text-[11.5px] text-ink-400 leading-snug">
              Add competitors below to see who gets recommended when you do not.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
