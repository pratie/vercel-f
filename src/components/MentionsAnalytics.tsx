import React from 'react';
import {
    Target,
    TrendingUp,
    BarChart3,
    Users,
    Zap,
    MessageSquare,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
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

const intentColors: Record<string, { bar: string; bg: string; text: string; dot: string }> = {
    purchase: { bar: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    solution: { bar: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    recommendation: { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    general: { bar: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
    default: { bar: 'bg-gray-300', bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
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
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
];

export const MentionsAnalytics = ({ mentions, keywords }: MentionsAnalyticsProps) => {
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
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Leads */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-blue-600/70 uppercase tracking-wider">Total Leads</span>
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{totalLeads}</span>
                    </div>
                    {/* Mini bar chart decoration */}
                    <div className="absolute bottom-0 right-3 flex items-end gap-[3px] h-8 opacity-20">
                        {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                            <div key={i} className="w-[4px] bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                {/* Avg Relevance */}
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-green-50/50 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Avg Relevance</span>
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <Target className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{avgRelevance}%</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            avgRelevance > 70 ? 'bg-emerald-100 text-emerald-700' :
                            avgRelevance > 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                            {avgRelevance > 70 ? 'Excellent' : avgRelevance > 50 ? 'Good' : 'Low'}
                        </span>
                    </div>
                    {/* Circular progress ring */}
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
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-orange-50 to-amber-50/50 shadow-[0_0_0_1px_rgba(249,115,22,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-orange-600/70 uppercase tracking-wider">High Intent</span>
                        <div className="p-1.5 bg-orange-500/10 rounded-lg">
                            <Zap className="h-3.5 w-3.5 text-orange-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{highIntentLeads}</span>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            highIntentPct > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                            {highIntentPct > 50 ? <ArrowUpRight className="h-2.5 w-2.5" /> : null}
                            {highIntentPct}%
                        </span>
                    </div>
                    {/* Sparkline decoration */}
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
                <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-violet-50 to-purple-50/50 shadow-[0_0_0_1px_rgba(139,92,246,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold text-violet-600/70 uppercase tracking-wider">Top Community</span>
                        <div className="p-1.5 bg-violet-500/10 rounded-lg">
                            <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900 tracking-tight">r/{topSubreddit}</span>
                    </div>
                    <span className="text-[10px] text-violet-600/60 font-medium tabular-nums">{topSubredditCount} leads</span>
                </div>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Keywords */}
                <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]">
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
                                    <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{stat.count}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-[width] duration-700 ${keywordBarColors[i % keywordBarColors.length]}`}
                                        style={{ width: `${Math.max((stat.count / maxKeywordCount) * 100, 6)}%` }}
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
                <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="p-1 bg-violet-50 rounded">
                            <Filter className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider">Communities</h3>
                    </div>
                    <div className="space-y-2.5">
                        {topSubreddits.map(([sr, count], i) => (
                            <div key={sr} className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[13px] font-medium text-gray-800 truncate">r/{sr}</span>
                                        <span className="text-[11px] font-semibold text-gray-500 tabular-nums ml-2">{count}</span>
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
                <div className="bg-white rounded-xl p-5 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]">
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
                                        <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{pct}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-[width] duration-700 ${colors.bar}`}
                                            style={{ width: `${Math.max(pct, 3)}%` }}
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
