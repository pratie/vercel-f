import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Target,
    TrendingUp,
    BarChart3,
    Users,
    Zap,
    MessageSquare,
    ArrowUpRight,
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

    // 1. Calculate Hero Metrics
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

    // 2. Keyword Stats
    const keywordStats = keywords.map(kw => {
        const count = mentions.filter(m =>
            m.matching_keywords?.some(mkw => mkw.toLowerCase() === kw.toLowerCase())
        ).length;
        return { kw, count };
    }).sort((a, b) => b.count - a.count).filter(s => s.count > 0);

    // 3. Intent Breakdown
    const intentCounts = mentions.reduce((acc, m) => {
        const intent = m.intent || 'Unknown';
        acc[intent] = (acc[intent] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const sortedIntents = Object.entries(intentCounts).sort((a, b) => b[1] - a[1]);

    // 4. Subreddit Stats (Top 5)
    const topSubreddits = Object.entries(subredditCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return (
        <div className="space-y-6 mb-8 mt-2 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Leads"
                    value={totalLeads.toString()}
                    icon={<Users className="h-5 w-5 text-blue-500" />}
                    description="Potential opportunities found"
                />
                <MetricCard
                    title="Avg Relevance"
                    value={`${avgRelevance}%`}
                    icon={<Target className="h-5 w-5 text-emerald-500" />}
                    description="Overall match quality"
                    trend={avgRelevance > 70 ? "Excellent" : avgRelevance > 50 ? "Good" : "Normal"}
                />
                <MetricCard
                    title="High Intent"
                    value={highIntentLeads.toString()}
                    icon={<Zap className="h-5 w-5 text-orange-500" />}
                    description="Ready-to-convert leads"
                    trend={`${Math.round((highIntentLeads / totalLeads) * 100)}% of total`}
                />
                <MetricCard
                    title="Top Subreddit"
                    value={`r/${topSubreddit}`}
                    icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
                    description="Most active community"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Keywords Volume */}
                <Card className="lg:col-span-1 border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                            Keyword Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 px-4 space-y-4">
                        {keywordStats.slice(0, 6).map((stat, i) => (
                            <div key={stat.kw} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-gray-700">{stat.kw}</span>
                                    <span className="text-gray-500">{stat.count} leads</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500/80 rounded-full transition-all duration-1000"
                                        style={{ width: `${(stat.count / totalLeads) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {keywordStats.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No keyword data yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Subreddit Breakdown */}
                <Card className="lg:col-span-1 border-gray-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            Top Communities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 px-4">
                        <div className="space-y-3">
                            {topSubreddits.map(([sr, count], i) => (
                                <div key={sr} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm text-gray-700 font-medium">r/{sr}</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-gray-50 text-gray-600 font-normal">
                                        {count}
                                    </Badge>
                                </div>
                            ))}
                            {topSubreddits.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No community data yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Intent Breakdown */}
                <Card className="lg:col-span-1 border-gray-100 shadow-sm overflow-hidden text-[#1d1d1f]">
                    <CardHeader className="bg-gray-50/50 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            Lead Intent Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 px-4 space-y-4">
                        {sortedIntents.slice(0, 5).map(([intent, count]) => (
                            <div key={intent} className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-700 capitalize">
                                        {intent.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{Math.round((count / totalLeads) * 100)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${intent.toLowerCase().includes('purchase') ? 'bg-orange-500' :
                                            intent.toLowerCase().includes('solution') ? 'bg-blue-500' : 'bg-gray-400'
                                            }`}
                                        style={{ width: `${(count / totalLeads) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {sortedIntents.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Analyzing lead intent...</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 7-Day Trend */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        Lead Activity (Last 7 Days)
                    </CardTitle>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temporal Distribution</span>
                </CardHeader>
                <CardContent className="pt-8 pb-4 px-6">
                    <div className="flex items-end justify-between h-32 gap-2">
                        {(() => {
                            const now = new Date();
                            const days = Array.from({ length: 7 }, (_, i) => {
                                const date = new Date(now);
                                date.setDate(now.getDate() - (6 - i));
                                return date.toISOString().split('T')[0];
                            });

                            const dayCounts = mentions.reduce((acc, m) => {
                                const date = new Date(m.created_utc * 1000).toISOString().split('T')[0];
                                acc[date] = (acc[date] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);

                            const maxCount = Math.max(...days.map(d => dayCounts[d] || 0), 1);

                            return days.map(day => {
                                const count = dayCounts[day] || 0;
                                const height = (count / maxCount) * 100;
                                const dateLabel = new Date(day).toLocaleDateString('en-US', { weekday: 'short' });

                                return (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full flex items-end justify-center h-full">
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                                {count} leads
                                            </div>
                                            <div
                                                className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-1000 ease-out hover:from-orange-500 hover:to-orange-400"
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-900 transition-colors">{dateLabel}</span>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
    trend?: string;
}

const MetricCard = ({ title, value, icon, description, trend }: MetricCardProps) => (
    <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardContent className="p-5">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-gray-900 leading-none">{value}</h3>
                        {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{trend}</span>}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{description}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default MentionsAnalytics;
