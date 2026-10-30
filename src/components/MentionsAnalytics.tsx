'use client';

// Project analytics, laid out like a web analytics dashboard: one hero chart
// driven by four metric tabs (leads, high intent, average match, replies) and
// a range switch, then breakdown lists where a faint bar behind each row shows
// its share. Every number on the page follows the selected range, and each
// metric compares itself with the range before it.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Mention, isUnscored, isHighIntent, intentLabel, intentTone } from '@/lib/mentions';
import { api } from '@/lib/api';
import { PANEL, STICKER_PANEL } from '@/components/ui/sticker';

interface MentionsAnalyticsProps {
  mentions: Mention[];
  keywords: string[];
  projectId: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const BRAND = '#ff4500';
const GRID = '#f0ece6';
const TICK = { fontSize: 11.5, fill: '#8a8072' };

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 0, label: 'All time' },
] as const;
type RangeDays = (typeof RANGES)[number]['days'];

type MetricKey = 'leads' | 'intent' | 'match' | 'replied';
const METRICS: { key: MetricKey; label: string; chartTitle: string }[] = [
  { key: 'leads', label: 'Leads found', chartTitle: 'Leads per day' },
  { key: 'intent', label: 'High intent', chartTitle: 'High intent leads per day' },
  { key: 'match', label: 'Average match', chartTitle: 'Average match per day' },
  { key: 'replied', label: 'Replies posted', chartTitle: 'Replies posted per day' },
];

const QUALITY = [
  { label: 'Strong match', range: '80 to 100', min: 80, color: '#059669' },
  { label: 'Good match', range: '60 to 79', min: 60, color: '#f59e0b' },
  { label: 'Fair match', range: '40 to 59', min: 40, color: '#fdba74' },
  { label: 'Weak match', range: 'under 40', min: 0, color: '#d6d3d1' },
];

/* ── Date helpers ────────────────────────────────────────────────────────── */

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dayKey(ms: number): number {
  return startOfDay(new Date(ms));
}

/* ── Small pieces ────────────────────────────────────────────────────────── */

function Delta({ current, previous, unit, allTime }: { current: number | null; previous: number | null; unit: 'pct' | 'pts'; allTime: boolean }) {
  if (current == null) return <span className="text-[12px] text-ink-300">No data yet</span>;
  if (allTime) return <span className="text-[12px] text-ink-400">Since your first lead</span>;
  if (previous == null || (unit === 'pct' && previous === 0)) {
    return current > 0
      ? <span className="text-[12px] font-semibold text-[#047857]">New this period</span>
      : <span className="text-[12px] text-ink-300">Same as before</span>;
  }
  const diff = unit === 'pct' ? Math.round(((current - previous) / previous) * 100) : Math.round(current - previous);
  if (diff === 0) return <span className="text-[12px] text-ink-400">Same as before</span>;
  const up = diff > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums ${up ? 'text-[#047857]' : 'text-[#b83200]'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {Math.abs(diff)}{unit === 'pct' ? '%' : ' pts'}
      <span className="ml-1 font-normal text-ink-400">vs previous</span>
    </span>
  );
}

function ChartTooltip({ active, payload, metric }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { full: string; value: number | null; n: number };
  const verb = METRICS.find((m) => m.key === metric)!.label.toLowerCase();
  const value =
    metric === 'match'
      ? (p.value == null ? 'No scored leads' : `${p.value}% across ${p.n} ${p.n === 1 ? 'lead' : 'leads'}`)
      : `${p.value ?? 0} ${verb}`;
  return (
    <div className="rounded-xl border-2 border-[#1c1917] bg-white px-3 py-2 shadow-[3px_3px_0_#1c1917]">
      <p className="text-[11.5px] font-semibold text-ink-400">{p.full}</p>
      <p className="mt-0.5 text-[13.5px] font-semibold text-ink-900 tabular-nums">{value}</p>
    </div>
  );
}

interface BreakdownRow {
  key: string;
  label: React.ReactNode;
  value: number;
  /** 0 to 1, the width of the bar behind the row. */
  share: number;
  aside?: React.ReactNode;
  muted?: boolean;
}

function Breakdown({
  title, column, rows, empty, footer,
}: {
  title: string;
  column: string;
  rows: BreakdownRow[];
  empty: string;
  footer?: React.ReactNode;
}) {
  return (
    <section className={`${PANEL} flex flex-col p-5`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-play text-[17px] font-bold tracking-[-0.01em] text-ink-900">{title}</h2>
        <span className="text-[12px] font-semibold text-ink-400">{column}</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-ink-400">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((r) => (
            <li key={r.key} className="relative flex h-9 items-center gap-3 overflow-hidden rounded-lg px-2.5">
              <span
                className="absolute inset-y-0 left-0 rounded-lg bg-[#ff4500]/[0.09] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${Math.max(r.share * 100, r.value > 0 ? 2 : 0)}%` }}
                aria-hidden="true"
              />
              <span className={`relative min-w-0 flex-1 truncate text-[13.5px] ${r.muted ? 'text-ink-400' : 'font-medium text-ink-900'}`}>
                {r.label}
              </span>
              {r.aside && <span className="relative shrink-0 text-[12px] text-ink-400 tabular-nums">{r.aside}</span>}
              <span className={`relative w-10 shrink-0 text-right text-[13.5px] font-semibold tabular-nums ${r.muted ? 'text-ink-300' : 'text-ink-900'}`}>
                {r.value.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
      {footer && <div className="mt-auto pt-3">{footer}</div>}
    </section>
  );
}

/* ── The page ────────────────────────────────────────────────────────────── */

export const MentionsAnalytics = ({ mentions, keywords, projectId }: MentionsAnalyticsProps) => {
  // Recharts measures the DOM, so the chart renders on the client only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [range, setRange] = useState<RangeDays>(30);
  const [metric, setMetric] = useState<MetricKey>('leads');

  // Reply dates live on the server with the rest of the triage state.
  const [repliedAt, setRepliedAt] = useState<number[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    api.getTriage(projectId)
      .then(({ items }) => {
        if (cancelled) return;
        const ids = new Set(mentions.map((m) => m.id));
        setRepliedAt(items.filter((t) => t.replied_at && ids.has(t.id)).map((t) => Date.parse(t.replied_at as string)));
      })
      .catch(() => { if (!cancelled) setRepliedAt([]); });
    return () => { cancelled = true; };
  }, [projectId, mentions]);

  // The selected range ends today; the previous range is the same length before
  // it. "All time" starts at the oldest lead and plots weeks once it is long.
  const allTime = range === 0;
  const { start, prevStart, days, step } = useMemo(() => {
    const today = startOfDay(new Date());
    const oldest = mentions.reduce((min, m) => Math.min(min, m.created_utc * 1000), Date.now());
    const span = allTime ? Math.max(7, Math.round((today - startOfDay(new Date(oldest))) / DAY_MS) + 1) : range;
    const st = span > 100 ? 7 : 1;
    const s = today - (Math.ceil(span / st) * st - 1) * DAY_MS;
    const list: number[] = [];
    for (let t = s; t <= today; t += st * DAY_MS) list.push(dayKey(t));
    return { start: s, prevStart: allTime ? s : s - span * DAY_MS, days: list, step: st };
  }, [range, allTime, mentions]);
  const bucketOf = useCallback((ms: number) => days[Math.min(days.length - 1, Math.floor((dayKey(ms) - start) / (step * DAY_MS)))], [days, start, step]);

  const inRange = useMemo(() => mentions.filter((m) => m.created_utc * 1000 >= start), [mentions, start]);
  const inPrev = useMemo(
    () => mentions.filter((m) => m.created_utc * 1000 >= prevStart && m.created_utc * 1000 < start),
    [mentions, prevStart, start],
  );

  /* Metric totals, this range and the one before */
  const totals = useMemo(() => {
    const avg = (list: Mention[]) => {
      const s = list.filter((m) => !isUnscored(m));
      return s.length ? Math.round(s.reduce((a, m) => a + (m.relevance_score ?? 0), 0) / s.length) : null;
    };
    const replies = repliedAt ?? [];
    return {
      leads: { cur: inRange.length, prev: inPrev.length },
      intent: { cur: inRange.filter(isHighIntent).length, prev: inPrev.filter(isHighIntent).length },
      match: { cur: avg(inRange), prev: avg(inPrev) },
      replied: {
        cur: repliedAt == null ? null : replies.filter((t) => t >= start).length,
        prev: repliedAt == null ? null : replies.filter((t) => t >= prevStart && t < start).length,
      },
    };
  }, [inRange, inPrev, repliedAt, start, prevStart]);

  /* Daily series for the selected metric */
  const series = useMemo(() => {
    const byDay = new Map<number, Mention[]>();
    inRange.forEach((m) => {
      byDay.set(bucketOf(m.created_utc * 1000), [...(byDay.get(bucketOf(m.created_utc * 1000)) || []), m]);
    });
    const replyDays = new Map<number, number>();
    (repliedAt ?? []).forEach((t) => {
      if (t >= start) replyDays.set(bucketOf(t), (replyDays.get(bucketOf(t)) || 0) + 1);
    });
    return days.map((k) => {
      const list = byDay.get(k) || [];
      const d = new Date(k);
      let value: number | null = list.length;
      let n = list.length;
      if (metric === 'intent') value = list.filter(isHighIntent).length;
      if (metric === 'replied') value = replyDays.get(k) || 0;
      if (metric === 'match') {
        const s = list.filter((m) => !isUnscored(m));
        n = s.length;
        value = s.length ? Math.round(s.reduce((a, m) => a + (m.relevance_score ?? 0), 0) / s.length) : null;
      }
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        full: step === 7
          ? `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value,
        n,
      };
    });
  }, [inRange, repliedAt, days, metric, start, step, bucketOf]);
  const seriesEmpty = series.every((p) => !p.value);
  // A line through mostly empty days reads as random spikes; bars say it plainly.
  const sparse = metric !== 'match' && series.filter((p) => p.value).length < series.length * 0.35;

  /* Breakdowns, all for the selected range */
  const subreddits = useMemo(() => {
    const map = new Map<string, { count: number; sum: number; scored: number }>();
    inRange.forEach((m) => {
      const e = map.get(m.subreddit) || { count: 0, sum: 0, scored: 0 };
      e.count++;
      if (!isUnscored(m)) { e.sum += m.relevance_score ?? 0; e.scored++; }
      map.set(m.subreddit, e);
    });
    const list = Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 8);
    const max = list[0]?.[1].count || 1;
    return list.map(([sub, e]): BreakdownRow => ({
      key: sub,
      label: `r/${sub}`,
      value: e.count,
      share: e.count / max,
      aside: e.scored ? `${Math.round(e.sum / e.scored)}% match` : undefined,
    }));
  }, [inRange]);

  const intents = useMemo(() => {
    const map = new Map<string, number>();
    inRange.filter((m) => !isUnscored(m)).forEach((m) => {
      const k = m.intent || 'other';
      map.set(k, (map.get(k) || 0) + 1);
    });
    const list = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = list[0]?.[1] || 1;
    return list.map(([intent, count]): BreakdownRow => ({
      key: intent,
      label: (
        <span className="inline-flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${intentTone(intent).bar}`} aria-hidden="true" />
          {intentLabel(intent)}
        </span>
      ),
      value: count,
      share: count / max,
    }));
  }, [inRange]);

  const keywordRows = useMemo(() => {
    const map = new Map<string, { display: string; count: number }>();
    inRange.forEach((m) => m.matching_keywords.forEach((kw) => {
      const k = kw.trim().toLowerCase();
      if (!k) return;
      const e = map.get(k);
      if (e) e.count++; else map.set(k, { display: kw.trim(), count: 1 });
    }));
    // Keywords that found nothing still show, muted: that is worth knowing.
    keywords.forEach((kw) => {
      const k = kw.trim().toLowerCase();
      if (k && !map.has(k)) map.set(k, { display: kw.trim(), count: 0 });
    });
    const list = Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 8);
    const max = list[0]?.count || 1;
    return list.map((e): BreakdownRow => ({ key: e.display, label: e.display, value: e.count, share: e.count / max, muted: e.count === 0 }));
  }, [inRange, keywords]);

  const quality = useMemo(() => {
    const scored = inRange.filter((m) => !isUnscored(m));
    const counts = QUALITY.map((q, i) =>
      scored.filter((m) => {
        const s = m.relevance_score ?? 0;
        return s >= q.min && (i === 0 || s < QUALITY[i - 1].min);
      }).length,
    );
    return { scored: scored.length, unscored: inRange.length - scored.length, counts };
  }, [inRange]);

  const active = METRICS.find((m) => m.key === metric)!;
  const tickEvery = days.length <= 8 ? 0 : Math.ceil(days.length / 6) - 1;
  const periodText = allTime ? 'yet' : `in the last ${range} days`;
  const chartTitle = step === 7 ? active.chartTitle.replace('per day', 'per week') : active.chartTitle;

  return (
    <div className="space-y-5 pb-6">
      {/* ── Hero: metric tabs + chart ── */}
      <section className={`${STICKER_PANEL} overflow-hidden`}>
        <div className="grid grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="Metric">
          {METRICS.map((m, i) => {
            const t = totals[m.key];
            const selected = m.key === metric;
            const value =
              t.cur == null ? (m.key === 'replied' && repliedAt == null ? '…' : '-')
                : m.key === 'match' ? `${t.cur}%` : t.cur.toLocaleString();
            return (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMetric(m.key)}
                className={`relative px-5 py-4 text-left transition-colors duration-150 motion-reduce:transition-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4500]/50
                  ${i % 2 === 1 ? 'border-l-2' : ''} ${i >= 2 ? 'border-t-2 lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l-2' : ''}
                  border-[#1c1917]/[0.08] ${selected ? 'bg-[#fff6f1]' : 'bg-white hover:bg-[#fcfbf9]'}`}
              >
                {selected && <span className="absolute inset-x-0 top-0 h-[3px] bg-[#ff4500]" aria-hidden="true" />}
                <span className={`block text-[13px] font-semibold ${selected ? 'text-[#b83200]' : 'text-ink-400'}`}>{m.label}</span>
                <span className="mt-1 block font-play text-[30px] font-extrabold leading-none tracking-[-0.025em] text-ink-900 tabular-nums sm:text-[34px]">
                  {value}
                </span>
                <span className="mt-2 block">
                  <Delta current={t.cur} previous={t.prev} unit={m.key === 'match' ? 'pts' : 'pct'} allTime={allTime} />
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t-2 border-[#1c1917]/[0.08] px-3 pb-4 pt-4 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2 sm:px-0">
            <h2 className="font-play text-[17px] font-bold tracking-[-0.01em] text-ink-900">{chartTitle}</h2>
            <div className="inline-flex rounded-xl border-2 border-[#1c1917]/[0.12] bg-white p-0.5" role="radiogroup" aria-label="Date range">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  type="button"
                  role="radio"
                  aria-checked={range === r.days}
                  onClick={() => setRange(r.days)}
                  className={`h-8 rounded-[9px] px-3 text-[12.5px] font-semibold transition-colors duration-150 motion-reduce:transition-none
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50
                    ${range === r.days ? 'bg-[#1c1917] text-white' : 'text-ink-600 hover:text-ink-900'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[260px] sm:h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis
                    dataKey="label"
                    tick={TICK}
                    tickLine={false}
                    axisLine={false}
                    interval={tickEvery}
                    minTickGap={12}
                    dy={6}
                  />
                  <YAxis
                    tick={TICK}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={44}
                    domain={metric === 'match' ? [0, 100] : [0, (max: number) => Math.max(4, Math.ceil(max * 1.15))]}
                    tickFormatter={(v: number) => (metric === 'match' ? `${v}%` : String(v))}
                  />
                  <Tooltip
                    content={<ChartTooltip metric={metric} />}
                    cursor={sparse ? { fill: '#ff4500', fillOpacity: 0.06 } : { stroke: '#1c1917', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  {sparse ? (
                    <Bar dataKey="value" fill={BRAND} radius={[5, 5, 0, 0]} maxBarSize={days.length <= 8 ? 44 : 18} isAnimationActive={false} />
                  ) : (
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={BRAND}
                    strokeWidth={2.5}
                    fill="url(#analyticsFill)"
                    connectNulls={metric === 'match'}
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props;
                      if (!payload?.value || days.length > 45) return <g key={index} />;
                      return <circle key={index} cx={cx} cy={cy} r={3.5} fill="#fff" stroke={BRAND} strokeWidth={2} />;
                    }}
                    activeDot={{ r: 5, fill: BRAND, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
            {mounted && seriesEmpty && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="rounded-xl bg-white/90 px-4 py-2 text-center text-[13px] text-ink-400">
                  {metric === 'replied'
                    ? 'No replies marked as posted in this range. Mark a lead as replied and it shows up here.'
                    : allTime ? 'No leads yet. Your first scan fills this in.' : `Nothing in the last ${range} days. Try a longer range.`}
                </p>
              </div>
            )}
          </div>
          <p className="mt-2 px-2 text-[11.5px] text-ink-300 sm:px-0">
            Leads are dated by when they were posted on Reddit, replies by when you marked them.
          </p>
        </div>
      </section>

      {/* ── Breakdowns ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Breakdown title="Subreddits" column="Leads" rows={subreddits} empty={`No leads ${periodText}.`} />
        <Breakdown title="What people want" column="Leads" rows={intents} empty={`No scored leads ${periodText}.`} />
        <Breakdown title="Keywords" column="Matches" rows={keywordRows} empty="Add keywords to your project to see which ones find leads." />

        <section className={`${PANEL} flex flex-col p-5`}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-play text-[17px] font-bold tracking-[-0.01em] text-ink-900">Match quality</h2>
            <span className="text-[12px] font-semibold text-ink-400">Leads</span>
          </div>
          {quality.scored === 0 ? (
            <p className="py-8 text-center text-[13px] text-ink-400">No scored leads {periodText}.</p>
          ) : (
            <>
              <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-[#f5f3f0]" aria-hidden="true">
                {QUALITY.map((q, i) => quality.counts[i] > 0 && (
                  <span key={q.label} style={{ width: `${(quality.counts[i] / quality.scored) * 100}%`, background: q.color }} />
                ))}
              </div>
              <ul className="space-y-1">
                {QUALITY.map((q, i) => (
                  <li key={q.label} className="flex h-9 items-center gap-3 px-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: q.color }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink-900">
                      {q.label} <span className="font-normal text-ink-400">{q.range}</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-ink-400 tabular-nums">
                      {Math.round((quality.counts[i] / quality.scored) * 100)}%
                    </span>
                    <span className="w-10 shrink-0 text-right text-[13.5px] font-semibold text-ink-900 tabular-nums">{quality.counts[i]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {quality.unscored > 0 && (
            <p className="mt-auto pt-3 text-[12px] text-ink-400">
              {quality.unscored} {quality.unscored === 1 ? 'lead is' : 'leads are'} not scored yet and left out of these numbers.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
