'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { VisibilityTrendPoint } from '@/lib/api';
import { BRAND_COLOR, CHART_GRID, CHART_TICK, COMPETITOR_COLORS } from './engines';

interface TrendChartProps {
  data: VisibilityTrendPoint[];
  brandName: string;
}

interface Series {
  key: string;
  name: string;
  color: string;
}

function shortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TrendChart({ data, brandName }: TrendChartProps) {
  // Recharts' ResponsiveContainer needs DOM measurements — client only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Competitor names are user-supplied, so they can contain dots and spaces that
  // Recharts would read as a nested dataKey path. Series get synthetic keys.
  const { rows, series } = useMemo(() => {
    const names: string[] = [];
    data.forEach((point) => {
      Object.keys(point.competitors || {}).forEach((name) => {
        if (!names.includes(name)) names.push(name);
      });
    });
    const built: Series[] = names.map((name, i) => ({
      key: `c${i}`,
      name,
      color: COMPETITOR_COLORS[i % COMPETITOR_COLORS.length],
    }));
    const mapped = data.map((point) => {
      const row: Record<string, string | number> = {
        label: shortDate(point.date),
        brand: point.visibility_pct,
      };
      built.forEach((s) => { row[s.key] = point.competitors?.[s.name] ?? 0; });
      return row;
    });
    return { rows: mapped, series: built };
  }, [data]);

  // A single point is a dot, not a trend. Hide the section rather than fake one.
  if (data.length < 2) return null;

  const TrendTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl px-3.5 py-2.5 shadow-card text-xs">
        <p className="font-medium text-ink-400 mb-1">{label}</p>
        {payload.map((entry: any) => {
          const match = series.find((s) => s.key === entry.dataKey);
          return (
            <p key={entry.dataKey} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span
                className="font-semibold text-ink-900 tabular-nums"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {entry.value}%
              </span>
              <span className="text-ink-400">{match ? match.name : brandName || 'You'}</span>
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <section className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-orange-50 text-orange-500">
          <TrendingUp className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
          Visibility over time
        </h2>
      </div>

      {mounted && (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={CHART_GRID} strokeDasharray="3 4" strokeWidth={1} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CHART_TICK} minTickGap={24} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={CHART_TICK}
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: CHART_GRID, strokeWidth: 1 }} />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                  animationDuration={500}
                />
              ))}
              <Line
                type="monotone"
                dataKey="brand"
                stroke={BRAND_COLOR}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-700">
          <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
          {brandName || 'You'}
        </span>
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[11.5px] text-ink-400">
            <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}
