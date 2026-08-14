'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CalendarDays, Gauge, MessageSquare, Search, Target, Users, Zap } from 'lucide-react';
import { Mention, isUnscored, isHighIntent, intentLabel, intentTone } from '@/lib/mentions';

interface MentionsAnalyticsProps {
  mentions: Mention[];
  keywords: string[];
  projectId: string;
}

/* ── Chart constants ─────────────────────────────────────────────────────── */

// Brand orange (tailwind orange-500 is re-anchored to #ff4500 in the config).
const BRAND = '#ff4500';
const BRAND_LIGHT = '#ff6a2b';
const GRID = '#f0eae2'; // warm hairline, matches the cream ramp
const TICK = { fontSize: 11, fill: '#8a8072' }; // ink-400

// Match-quality buckets follow the scoreTier() color language:
// emerald = strong, amber = good, soft orange = fair, stone = weak.
const QUALITY_RAMP = ['#d6d3d1', '#fdba74', '#fbbf24', '#34d399'];
const UNSCORED_FILL = '#e7e5e4'; // stone-200, drawn with a dashed outline
const UNSCORED_STROKE = '#a8a29e';

const DAY_MS = 24 * 60 * 60 * 1000;

/* ── Shared tooltip chrome: white rounded card, warm shadow, no border ───── */

function TooltipCard({ title, rows }: { title: string; rows: { label: string; value: string; swatch?: string }[] }) {
  return (
    <div className="bg-white rounded-xl px-3.5 py-2.5 shadow-card text-xs">
      <p className="font-medium text-ink-400 mb-1">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-1.5">
          {r.swatch && <span className="w-2 h-2 rounded-[3px] shrink-0" style={{ backgroundColor: r.swatch }} />}
          <span className="font-semibold text-ink-900 tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {r.value}
          </span>
          <span className="text-ink-400">{r.label}</span>
        </p>
      ))}
    </div>
  );
}

function TimeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <TooltipCard
      title={p.fullDate}
      rows={[{ label: p.count === 1 ? 'new lead' : 'new leads', value: String(p.count), swatch: BRAND }]}
    />
  );
}

function QualityTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <TooltipCard
      title={p.unscored ? 'Not yet scored' : `${p.bucket}% match`}
      rows={[{ label: p.count === 1 ? 'lead' : 'leads', value: String(p.count), swatch: p.fill }]}
    />
  );
}

/* ── Small building blocks ───────────────────────────────────────────────── */

function CardTitle({ icon: Icon, tint, children }: { icon: React.ElementType; tint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h3 className="text-xs uppercase tracking-wider text-ink-400 font-semibold">{children}</h3>
    </div>
  );
}

function EmptyCardState({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream/60 rounded-xl px-4 py-8">
      <p className="text-xs leading-relaxed text-ink-400 text-center">{children}</p>
    </div>
  );
}

function StatTile({
  icon: Icon, iconTint, label, value, sub, subTone = 'muted',
}: {
  icon: React.ElementType;
  iconTint: string;
  label: string;
  value: string;
  sub: string;
  subTone?: 'positive' | 'muted';
}) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">{label}</span>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconTint}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div
        className="text-[28px] font-bold text-ink-900 tracking-tight leading-none mb-2 tabular-nums"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </div>
      {subTone === 'positive' ? (
        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold leading-none">
          {sub}
        </span>
      ) : (
        <div className="text-[12.5px] text-ink-600">{sub}</div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export const MentionsAnalytics = ({ mentions, keywords, projectId }: MentionsAnalyticsProps) => {
  // Recharts' ResponsiveContainer needs DOM measurements — client only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Replied count comes from the same localStorage record the dashboard writes.
  const [repliedCount, setRepliedCount] = useState(0);
  useEffect(() => {
    try {
      const record: Record<string, string> = JSON.parse(
        localStorage.getItem(`published-comments-${projectId}`) || '{}'
      );
      const ids = new Set(mentions.map((m) => m.id));
      setRepliedCount(Object.keys(record).filter((id) => ids.has(Number(id))).length);
    } catch {
      setRepliedCount(0); // corrupted state — count nothing rather than lie
    }
  }, [projectId, mentions]);

  const scored = useMemo(() => mentions.filter((m) => !isUnscored(m)), [mentions]);
  const unscoredCount = mentions.length - scored.length;

  /* KPIs */
  const newThisWeek = useMemo(() => {
    const cutoff = (Date.now() - 7 * DAY_MS) / 1000;
    return mentions.filter((m) => m.created_utc >= cutoff).length;
  }, [mentions]);

  const avgMatch = scored.length > 0
    ? Math.round(scored.reduce((acc, m) => acc + (m.relevance_score ?? 0), 0) / scored.length)
    : null;

  const highIntentCount = useMemo(() => mentions.filter(isHighIntent).length, [mentions]);

  /* Leads over time — daily buckets, last 30 days, missing days = 0 */
  const timeSeries = useMemo(() => {
    const counts = new Map<string, number>();
    mentions.forEach((m) => {
      const d = new Date(m.created_utc * 1000);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const today = new Date();
    const days: { label: string; fullDate: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      days.push({
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        count: counts.get(key) || 0,
      });
    }
    return days;
  }, [mentions]);
  const last30Total = useMemo(() => timeSeries.reduce((acc, d) => acc + d.count, 0), [timeSeries]);

  /* Match quality — scored leads only, plus a distinct "Unscored" bucket */
  const qualityBuckets = useMemo(() => {
    const buckets = [
      { bucket: '20–39', count: 0, fill: QUALITY_RAMP[0], unscored: false },
      { bucket: '40–59', count: 0, fill: QUALITY_RAMP[1], unscored: false },
      { bucket: '60–79', count: 0, fill: QUALITY_RAMP[2], unscored: false },
      { bucket: '80–100', count: 0, fill: QUALITY_RAMP[3], unscored: false },
    ];
    scored.forEach((m) => {
      const s = m.relevance_score ?? 0;
      if (s < 40) buckets[0].count++;
      else if (s < 60) buckets[1].count++;
      else if (s < 80) buckets[2].count++;
      else buckets[3].count++;
    });
    return [...buckets, { bucket: 'Unscored', count: unscoredCount, fill: UNSCORED_FILL, unscored: true }];
  }, [scored, unscoredCount]);

  /* Where your buyers hang out — count + avg match per subreddit */
  const topSubreddits = useMemo(() => {
    const map = new Map<string, { count: number; scoreSum: number; scoredCount: number }>();
    mentions.forEach((m) => {
      const entry = map.get(m.subreddit) || { count: 0, scoreSum: 0, scoredCount: 0 };
      entry.count++;
      if (!isUnscored(m)) {
        entry.scoreSum += m.relevance_score ?? 0;
        entry.scoredCount++;
      }
      map.set(m.subreddit, entry);
    });
    return Array.from(map.entries())
      .map(([subreddit, s]) => ({
        subreddit,
        count: s.count,
        avgMatch: s.scoredCount > 0 ? Math.round(s.scoreSum / s.scoredCount) : null,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [mentions]);
  const maxSubredditCount = topSubreddits[0]?.count || 1;

  /* What people are asking for — intent breakdown of scored leads */
  const intentStats = useMemo(() => {
    const map = new Map<string, number>();
    scored.forEach((m) => {
      const key = m.intent || 'other';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([intent, count]) => ({
        intent,
        count,
        pct: scored.length > 0 ? Math.round((count / scored.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [scored]);
  const maxIntentCount = intentStats[0]?.count || 1;

  /* Top keywords — aggregated from what actually matched on each lead */
  const keywordStats = useMemo(() => {
    const map = new Map<string, { display: string; count: number }>();
    mentions.forEach((m) => {
      m.matching_keywords.forEach((kw) => {
        const key = kw.trim().toLowerCase();
        if (!key) return;
        const entry = map.get(key);
        if (entry) entry.count++;
        else map.set(key, { display: kw.trim(), count: 1 });
      });
    });
    // Project keywords that never matched still show (count 0 is honest signal).
    keywords.forEach((kw) => {
      const key = kw.trim().toLowerCase();
      if (key && !map.has(key)) map.set(key, { display: kw.trim(), count: 0 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [mentions, keywords]);
  const maxKeywordCount = keywordStats[0]?.count || 1;

  return (
    <div className="space-y-5 mb-6">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={Users}
          iconTint="bg-orange-50 text-orange-500"
          label="Total leads"
          value={mentions.length.toLocaleString()}
          sub={newThisWeek > 0 ? `+${newThisWeek} this week` : 'No new leads this week'}
          subTone={newThisWeek > 0 ? 'positive' : 'muted'}
        />
        <StatTile
          icon={Target}
          iconTint="bg-emerald-50 text-emerald-600"
          label="Avg match"
          value={avgMatch != null ? `${avgMatch}%` : '—'}
          sub={
            scored.length > 0
              ? `across ${scored.length.toLocaleString()} scored`
              : 'No scored leads yet'
          }
        />
        <StatTile
          icon={Zap}
          iconTint="bg-violet-50 text-violet-600"
          label="High intent"
          value={highIntentCount.toLocaleString()}
          sub={
            scored.length > 0
              ? `${Math.round((highIntentCount / scored.length) * 100)}% of scored leads`
              : 'Waiting on scoring'
          }
        />
        <StatTile
          icon={MessageSquare}
          iconTint="bg-blue-50 text-blue-600"
          label="Replied"
          value={repliedCount.toLocaleString()}
          sub={
            repliedCount > 0
              ? `${Math.round((repliedCount / mentions.length) * 100)}% of all leads`
              : 'No replies posted yet'
          }
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads over time */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <CardTitle icon={CalendarDays} tint="bg-orange-50 text-orange-500">
            Leads over time · last 30 days
          </CardTitle>
          {last30Total === 0 ? (
            <EmptyCardState>
              Nothing new in the last 30 days — your older leads still count toward the totals above.
            </EmptyCardState>
          ) : mounted && (
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeries} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadsBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND_LIGHT} />
                      <stop offset="100%" stopColor={BRAND} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 4" strokeWidth={1} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={TICK}
                    interval={6}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <Tooltip content={<TimeTooltip />} cursor={{ fill: 'rgba(255, 69, 0, 0.05)' }} />
                  <Bar
                    dataKey="count"
                    fill="url(#leadsBarGradient)"
                    maxBarSize={10}
                    radius={[6, 6, 0, 0]}
                    animationDuration={500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Match quality */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <CardTitle icon={Gauge} tint="bg-emerald-50 text-emerald-600">Match quality</CardTitle>
          {scored.length === 0 && unscoredCount === 0 ? (
            <EmptyCardState>No leads to bucket yet — this fills in as leads come through.</EmptyCardState>
          ) : (
            <>
              {mounted && (
                <div className="h-[168px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityBuckets} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 4" strokeWidth={1} />
                      <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={TICK} />
                      <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                      <Tooltip content={<QualityTooltip />} cursor={{ fill: 'rgba(255, 69, 0, 0.05)' }} />
                      <Bar dataKey="count" maxBarSize={36} radius={[6, 6, 0, 0]} animationDuration={500} animationEasing="ease-out">
                        {qualityBuckets.map((entry) => (
                          <Cell
                            key={entry.bucket}
                            fill={entry.fill}
                            stroke={entry.unscored ? UNSCORED_STROKE : undefined}
                            strokeWidth={entry.unscored ? 1 : 0}
                            strokeDasharray={entry.unscored ? '4 3' : undefined}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="text-[11px] text-ink-400 mt-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[3px] bg-stone-200 border border-dashed border-stone-400 shrink-0" />
                {scored.length === 0
                  ? `All ${unscoredCount.toLocaleString()} leads are awaiting AI scoring — buckets fill in as scoring runs.`
                  : unscoredCount > 0
                    ? `${unscoredCount.toLocaleString()} ${unscoredCount === 1 ? 'lead' : 'leads'} not yet scored by AI (shown dashed, excluded from averages).`
                    : 'Every lead has been scored.'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Breakdown row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Where your buyers hang out */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <CardTitle icon={Users} tint="bg-orange-50 text-orange-500">Where your buyers hang out</CardTitle>
          {topSubreddits.length === 0 ? (
            <EmptyCardState>No communities yet — run a scan to find where your buyers post.</EmptyCardState>
          ) : (
            <div className="space-y-1.5">
              {topSubreddits.map((s) => (
                <div
                  key={s.subreddit}
                  className="rounded-lg px-2 -mx-2 py-1.5 hover:bg-orange-50/40 transition-colors duration-200"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-[13px] font-medium text-ink-700 truncate">r/{s.subreddit}</span>
                    <span
                      className="text-[11px] text-ink-600 tabular-nums text-right shrink-0"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      <span className="font-semibold text-ink-700">{s.count}</span>
                      {' · '}
                      {s.avgMatch != null ? `${s.avgMatch}% avg match` : 'unscored'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${(s.count / maxSubredditCount) * 100}%`,
                        backgroundImage: `linear-gradient(90deg, ${BRAND_LIGHT}, ${BRAND})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What people are asking for */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <CardTitle icon={MessageSquare} tint="bg-violet-50 text-violet-600">What people are asking for</CardTitle>
          {intentStats.length === 0 ? (
            <EmptyCardState>
              Intent shows up once leads are scored by AI.
              {unscoredCount > 0 && (
                <>
                  <br />
                  {unscoredCount.toLocaleString()} {unscoredCount === 1 ? 'lead is' : 'leads are'} waiting in the queue.
                </>
              )}
            </EmptyCardState>
          ) : (
            <div className="space-y-1.5">
              {intentStats.map((s) => {
                const tone = intentTone(s.intent === 'other' ? null : s.intent);
                return (
                  <div
                    key={s.intent}
                    className="rounded-lg px-2 -mx-2 py-1.5 hover:bg-orange-50/40 transition-colors duration-200"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.bar}`} />
                        <span className="text-[13px] font-medium text-ink-700 truncate">
                          {s.intent === 'other' ? 'Other' : intentLabel(s.intent)}
                        </span>
                      </span>
                      <span
                        className="text-[11px] text-ink-600 tabular-nums text-right shrink-0"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        <span className="font-semibold text-ink-700">{s.count}</span>
                        {' · '}
                        {s.pct}% of scored
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
                        style={{ width: `${(s.count / maxIntentCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top keywords */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <CardTitle icon={Search} tint="bg-blue-50 text-blue-600">Top keywords</CardTitle>
          {keywordStats.length === 0 ? (
            <EmptyCardState>Add keywords to your project to start catching leads.</EmptyCardState>
          ) : (
            <div className="space-y-1.5">
              {keywordStats.map((s) => (
                <div
                  key={s.display.toLowerCase()}
                  className={`rounded-lg px-2 -mx-2 py-1.5 hover:bg-orange-50/40 transition-colors duration-200 ${
                    s.count === 0 ? 'opacity-30' : ''
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-[13px] font-medium text-ink-700 truncate">{s.display}</span>
                    <span
                      className="text-[11px] text-ink-600 tabular-nums text-right shrink-0"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      <span className="font-semibold text-ink-700">{s.count}</span>
                      {' '}
                      {s.count === 1 ? 'lead' : 'leads'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500/60 rounded-full transition-[width] duration-500"
                      style={{ width: `${(s.count / maxKeywordCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentionsAnalytics;
