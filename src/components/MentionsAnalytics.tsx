'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import {
    Target,
    TrendingUp,
    BarChart3,
    Users,
    Zap,
    MessageSquare,
    Filter,
    ArrowUpRight,
} from 'lucide-react';

interface RedditMention {
    id: number;
    brand_id: number;
    title: string;
    subreddit: string;
    relevance_score: number;
    matching_keywords: string[];
    intent?: string;
    num_comments: number;
    score: number;
    created_utc: number;
}

interface MentionsAnalyticsProps {
    mentions: RedditMention[];
    keywords: string[];
}

const intentColors: Record<string, { bar: string; bg: string; text: string; dot: string; hex: string }> = {
    purchase: { bar: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', hex: '#f97316' },
    solution: { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', hex: '#3b82f6' },
    recommendation: { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', hex: '#10b981' },
    general: { bar: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400', hex: '#a78bfa' },
    default: { bar: 'bg-gray-300', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', hex: '#9ca3af' },
};

const getIntentColor = (intent: string) => {
    const lower = intent.toLowerCase();
    if (lower.includes('purchase')) return intentColors.purchase;
    if (lower.includes('solution')) return intentColors.solution;
    if (lower.includes('recommendation')) return intentColors.recommendation;
    if (lower.includes('general')) return intentColors.general;
    return intentColors.default;
};

const keywordBarColors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-gray-800">
            <p className="font-medium mb-0.5">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-gray-300 tabular-nums">
                    {p.name}: <span className="text-white font-semibold">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

export const MentionsAnalytics = ({ mentions, keywords }: MentionsAnalyticsProps) => {
    // Ensure recharts only renders on the client (ResponsiveContainer needs DOM measurements)
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // ── Mentions Over Time (area chart data) — hooks must be before early return ──
    const timeSeriesData = useMemo(() => {
        if (!mentions || mentions.length === 0) return [];
        const sorted = [...mentions].sort((a, b) => a.created_utc - b.created_utc);
        if (sorted.length === 0) return [];

        const buckets: Record<string, { date: string; mentions: number; engagement: number }> = {};
        sorted.forEach(m => {
            const d = new Date(m.created_utc * 1000);
            const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!buckets[key]) buckets[key] = { date: key, mentions: 0, engagement: 0 };
            buckets[key].mentions += 1;
            buckets[key].engagement += m.score + m.num_comments;
        });
        return Object.values(buckets);
    }, [mentions]);

    // ── Relevance Distribution (bar chart data) ──
    const relevanceDistribution = useMemo(() => {
        if (!mentions || mentions.length === 0) return [];
        const buckets = [
            { range: '0-20', count: 0, color: '#e5e7eb' },
            { range: '21-40', count: 0, color: '#fca5a5' },
            { range: '41-60', count: 0, color: '#fbbf24' },
            { range: '61-80', count: 0, color: '#34d399' },
            { range: '81-100', count: 0, color: '#10b981' },
        ];
        mentions.forEach(m => {
            const s = m.relevance_score;
            if (s <= 20) buckets[0].count++;
            else if (s <= 40) buckets[1].count++;
            else if (s <= 60) buckets[2].count++;
            else if (s <= 80) buckets[3].count++;
            else buckets[4].count++;
        });
        return buckets;
    }, [mentions]);

    // Early return after hooks
    if (!mentions || mentions.length === 0) return null;

    const totalLeads = mentions.length;
    const avgRelevance = Math.round(mentions.reduce((acc, m) => acc + (m.relevance_score || 0), 0) / totalLeads);

    const subredditCounts = mentions.reduce((acc, m) => {
        acc[m.subreddit] = (acc[m.subreddit] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topSubreddit = Object.entries(subredditCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topSubredditCount = Object.entries(subredditCounts).sort((a, b) => b[1] - a[1])[0]?.[1] || 0;

    const highIntentLeads = mentions.filter(m =>
        m.intent?.toLowerCase().includes('purchase') ||
        m.intent?.toLowerCase().includes('solution') ||
        m.intent?.toLowerCase().includes('recommendation')
    ).length;
    const highIntentPct = Math.round((highIntentLeads / totalLeads) * 100);

    const keywordStats = keywords.map(kw => {
        const count = mentions.filter(m =>
            m.matching_keywords?.some(mkw => mkw.toLowerCase() === kw.toLowerCase())
        ).length;
        return { kw, count };
    }).sort((a, b) => b.count - a.count).filter(s => s.count > 0);

    const maxKeywordCount = keywordStats[0]?.count || 1;

    const intentCounts = mentions.reduce((acc, m) => {
        const intent = m.intent || 'Unknown';
        acc[intent] = (acc[intent] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedIntents = Object.entries(intentCounts).sort((a, b) => b[1] - a[1]);

    const topSubreddits = Object.entries(subredditCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxSubredditCount = topSubreddits[0]?.[1] || 1;

    return (
        <div className="space-y-4 mb-6">
            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Leads */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(59,130,246,0.08)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider">Total Leads</span>
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>{totalLeads}</span>
                    </div>
                    <div className="absolute bottom-0 right-3 flex items-end gap-[3px] h-8 opacity-20">
                        {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                            <div key={i} className="w-[4px] bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                {/* Avg Relevance */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-green-50/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(16,185,129,0.08)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Avg Relevance</span>
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <Target className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>{avgRelevance}%</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            avgRelevance > 70 ? 'bg-emerald-100 text-emerald-700' :
                            avgRelevance > 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {avgRelevance > 70 ? 'Excellent' : avgRelevance > 50 ? 'Good' : 'Low'}
                        </span>
                    </div>
                    <div className="absolute bottom-2 right-3 opacity-15">
                        <svg width="36" height="36" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-200" />
                            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500"
                                strokeDasharray={`${avgRelevance * 0.94} 100`}
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                    </div>
                </div>

                {/* High Intent */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-orange-50 to-amber-50/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(249,115,22,0.08)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-orange-600/70 uppercase tracking-wider">High Intent</span>
                        <div className="p-1.5 bg-orange-500/10 rounded-lg">
                            <Zap className="h-3.5 w-3.5 text-orange-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>{highIntentLeads}</span>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            highIntentPct > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                            {highIntentPct > 50 ? <ArrowUpRight className="h-2.5 w-2.5" /> : null}
                            {highIntentPct}%
                        </span>
                    </div>
                    <div className="absolute bottom-2 right-3 opacity-15">
                        <svg width="48" height="24" viewBox="0 0 48 24">
                            <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500"
                                points="0,20 8,16 16,18 24,10 32,14 40,6 48,8"
                                strokeLinecap="round" strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Top Community */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-violet-50 to-purple-50/50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(139,92,246,0.08)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-violet-600/70 uppercase tracking-wider">Top Community</span>
                        <div className="p-1.5 bg-violet-500/10 rounded-lg">
                            <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900 tracking-tight" style={{ textWrap: 'balance' as any }}>r/{topSubreddit}</span>
                    </div>
                    <span className="text-[10px] text-violet-600/60 font-medium tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>{topSubredditCount} leads</span>
                </div>
            </div>

            {/* ── Charts Row ── */}
            {mounted && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Mentions Over Time — Area Chart */}
                {timeSeriesData.length > 0 && (
                    <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-1.5 mb-4">
                            <div className="p-1 bg-blue-50 rounded">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">Mentions Over Time</h3>
                        </div>
                        <div className="h-[180px] -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeSeriesData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="mentionsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="mentions"
                                        name="Mentions"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fill="url(#mentionsGrad)"
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Relevance Distribution — Bar Chart */}
                <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="p-1 bg-emerald-50 rounded">
                            <Target className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">Relevance Distribution</h3>
                    </div>
                    <div className="h-[180px] -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={relevanceDistribution} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                                <XAxis
                                    dataKey="range"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="count"
                                    name="Posts"
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={600}
                                    animationEasing="ease-out"
                                >
                                    {relevanceDistribution.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            )}

            {/* ── Detail Cards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Keywords */}
                <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="p-1 bg-blue-50 rounded">
                            <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">Top Keywords</h3>
                    </div>
                    <div className="space-y-3">
                        {keywordStats.slice(0, 6).map((stat, i) => (
                            <div key={stat.kw}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[13px] font-medium text-gray-800">{stat.kw}</span>
                                    <span className="text-[11px] font-semibold text-gray-500 tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>{stat.count}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-[width] duration-700"
                                        style={{
                                            width: `${Math.max((stat.count / maxKeywordCount) * 100, 6)}%`,
                                            backgroundColor: keywordBarColors[i % keywordBarColors.length],
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {keywordStats.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Communities */}
                <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="p-1 bg-violet-50 rounded">
                            <Filter className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">Communities</h3>
                    </div>
                    <div className="space-y-2.5">
                        {topSubreddits.map(([sr, count], i) => (
                            <div key={sr} className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center text-[10px] font-bold shrink-0 tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[13px] font-medium text-gray-800 truncate">r/{sr}</span>
                                        <span className="text-[11px] font-semibold text-gray-500 tabular-nums ml-2" style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-violet-400 rounded-full transition-[width] duration-700"
                                            style={{ width: `${(count / maxSubredditCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topSubreddits.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Intents */}
                <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="p-1 bg-orange-50 rounded">
                            <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
                        </div>
                        <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">Intent Breakdown</h3>
                    </div>
                    <div className="space-y-3">
                        {sortedIntents.slice(0, 5).map(([intent, count]) => {
                            const pct = Math.round((count / totalLeads) * 100);
                            const colors = getIntentColor(intent);
                            return (
                                <div key={intent}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                            <span className="text-[13px] font-medium text-gray-800 capitalize">{intent.replace(/_/g, ' ')}</span>
                                        </div>
                                        <span className="text-[11px] font-semibold text-gray-500 tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-[width] duration-700"
                                            style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: colors.hex }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedIntents.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">Analyzing...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentionsAnalytics;
