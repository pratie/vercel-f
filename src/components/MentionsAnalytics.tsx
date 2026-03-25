import React from 'react';
import {
    Target,
    TrendingUp,
    BarChart3,
    Users,
    Zap,
    MessageSquare,
    Filter
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

export const MentionsAnalytics = ({ mentions, keywords }: MentionsAnalyticsProps) => {
    if (!mentions || mentions.length === 0) return null;

    const totalLeads = mentions.length;
    const avgRelevance = Math.round(mentions.reduce((acc, m) => acc + (m.relevance_score || 0), 0) / totalLeads);

    const subredditCounts = mentions.reduce((acc, m) => {
        acc[m.subreddit] = (acc[m.subreddit] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topSubreddit = Object.entries(subredditCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const highIntentLeads = mentions.filter(m =>
        m.intent?.toLowerCase().includes('purchase') ||
        m.intent?.toLowerCase().includes('solution') ||
        m.intent?.toLowerCase().includes('recommendation')
    ).length;

    const keywordStats = keywords.map(kw => {
        const count = mentions.filter(m =>
            m.matching_keywords?.some(mkw => mkw.toLowerCase() === kw.toLowerCase())
        ).length;
        return { kw, count };
    }).sort((a, b) => b.count - a.count).filter(s => s.count > 0);

    const intentCounts = mentions.reduce((acc, m) => {
        const intent = m.intent || 'Unknown';
        acc[intent] = (acc[intent] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedIntents = Object.entries(intentCounts).sort((a, b) => b[1] - a[1]);

    const topSubreddits = Object.entries(subredditCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
        <div className="space-y-4 mb-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                    label="Total Leads"
                    value={totalLeads.toString()}
                    icon={<Users className="h-4 w-4 text-blue-500" />}
                />
                <MetricCard
                    label="Avg Relevance"
                    value={`${avgRelevance}%`}
                    icon={<Target className="h-4 w-4 text-green-500" />}
                    badge={avgRelevance > 70 ? "Excellent" : avgRelevance > 50 ? "Good" : undefined}
                />
                <MetricCard
                    label="High Intent"
                    value={highIntentLeads.toString()}
                    icon={<Zap className="h-4 w-4 text-orange-500" />}
                    badge={`${Math.round((highIntentLeads / totalLeads) * 100)}%`}
                />
                <MetricCard
                    label="Top Community"
                    value={`r/${topSubreddit}`}
                    icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
                />
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Keywords */}
                <div className="bg-white rounded-xl p-4 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-3">
                        <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Keywords</h3>
                    </div>
                    <div className="space-y-2.5">
                        {keywordStats.slice(0, 6).map((stat) => (
                            <div key={stat.kw} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-700">{stat.kw}</span>
                                    <span className="text-[10px] text-gray-400 tabular-nums">{stat.count}</span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-[width] duration-700"
                                        style={{ width: `${Math.max((stat.count / totalLeads) * 100, 4)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {keywordStats.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-3">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Communities */}
                <div className="bg-white rounded-xl p-4 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Filter className="h-3.5 w-3.5 text-gray-400" />
                        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Communities</h3>
                    </div>
                    <div className="space-y-2">
                        {topSubreddits.map(([sr, count], i) => (
                            <div key={sr} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        {i + 1}
                                    </span>
                                    <span className="text-xs font-medium text-gray-700">r/{sr}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{count}</span>
                            </div>
                        ))}
                        {topSubreddits.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-3">No data yet</p>
                        )}
                    </div>
                </div>

                {/* Intents */}
                <div className="bg-white rounded-xl p-4 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-1.5 mb-3">
                        <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Intent Analysis</h3>
                    </div>
                    <div className="space-y-2.5">
                        {sortedIntents.slice(0, 5).map(([intent, count]) => (
                            <div key={intent} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-700 capitalize">{intent.replace(/_/g, ' ')}</span>
                                    <span className="text-[10px] text-gray-400 tabular-nums">{Math.round((count / totalLeads) * 100)}%</span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-[width] duration-700 ${
                                            intent.toLowerCase().includes('purchase') ? 'bg-orange-500' :
                                            intent.toLowerCase().includes('solution') ? 'bg-blue-500' :
                                            intent.toLowerCase().includes('recommendation') ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                        style={{ width: `${Math.max((count / totalLeads) * 100, 4)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {sortedIntents.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-3">Analyzing...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    badge?: string;
}

const MetricCard = ({ label, value, icon, badge }: MetricCardProps) => (
    <div className="bg-white rounded-xl p-4 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06),0px_2px_4px_0px_rgba(0,0,0,0.04)] hover:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.08),0px_2px_8px_-2px_rgba(0,0,0,0.08)] transition-[box-shadow]">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
            <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 tracking-tight tabular-nums">{value}</span>
            {badge && <span className="text-[9px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md">{badge}</span>}
        </div>
    </div>
);

export default MentionsAnalytics;
