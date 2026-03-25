'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, ArrowUpRight, Calendar, Target, Download, CheckCircle, RefreshCw, Loader2, Search, Zap, Sparkles, Check, TrendingUp, ExternalLink, ChevronDown, ChevronUp, Copy, X, Edit3 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { toast, Toaster } from 'sonner';
import { checkRefreshRateLimit, formatTimeRemaining } from '@/lib/rateLimit';
import { useRedditAuthStore } from '@/lib/redditAuth';
import { PaymentGuard } from '@/components/PaymentGuard';
import { MentionsAnalytics } from '@/components/MentionsAnalytics';


interface RawMention {
  id: number;
  brand_id: number;
  title: string;
  content: string;
  url: string;
  subreddit: string;
  author?: string;
  created_utc: number;
  score: number;
  num_comments: number;
  matching_keywords?: string[] | string;
  keyword?: string;
  relevance_score: number;
  suggested_comment: string;
  intent?: string;
}

interface RedditMention {
  id: number;
  brand_id: number;
  title: string;
  content: string;
  url: string;
  subreddit: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  matching_keywords: string[];
  relevance_score: number;
  suggested_comment: string;
  formatted_date: string;
  intent?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  subreddits: string[];
  analysis_status?: 'idle' | 'scanning' | 'completed' | 'failed';
  analysis_progress?: number;
  analysis_status_message?: string;
  last_analyzed?: string;
}

const MENTIONS_PER_PAGE = 25;

const transformRawMention = (mention: RawMention): RedditMention => ({
  id: mention.id,
  brand_id: mention.brand_id,
  title: mention.title,
  content: mention.content,
  url: mention.url,
  subreddit: mention.subreddit,
  author: mention.author || 'unknown',
  created_utc: mention.created_utc,
  score: mention.score,
  num_comments: mention.num_comments,
  matching_keywords: Array.isArray(mention.matching_keywords)
    ? mention.matching_keywords
    : (mention.keyword ? [mention.keyword] : []),
  relevance_score: mention.relevance_score,
  suggested_comment: mention.suggested_comment,
  intent: mention.intent,
  formatted_date: new Date(mention.created_utc * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
});

export default function MentionsPage() {
  const [mentions, setMentions] = useState<RedditMention[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [hasMoreMentions, setHasMoreMentions] = useState(true);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const [isPosting, setIsPosting] = useState<number | null>(null);
  const [publishedComments, setPublishedComments] = useState<Record<number, string>>({});
  const [expandedSuggestedComments, setExpandedSuggestedComments] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubreddit, setSelectedSubreddit] = useState('all');
  const [selectedIntent, setSelectedIntent] = useState('all');
  const [sortBy, setSortBy] = useState<'new' | 'comments' | 'relevance'>('new');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [allMentions, setAllMentions] = useState<RedditMention[]>([]);
  const [visibleCount, setVisibleCount] = useState(MENTIONS_PER_PAGE);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'scanning' | 'completed' | 'failed'>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const redditAuth = useRedditAuthStore();

  const toggleSuggestedComment = (mentionId: number) => {
    setExpandedSuggestedComments(prev => ({ ...prev, [mentionId]: !prev[mentionId] }));
  };

  const VIEWED_POSTS_STORAGE_KEY_PREFIX = 'viewedPosts_';
  const [viewedPosts, setViewedPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (projectId) {
      const key = `${VIEWED_POSTS_STORAGE_KEY_PREFIX}${projectId}`;
      const storedViewedPosts = localStorage.getItem(key);
      if (storedViewedPosts) {
        try {
          const parsedViewedPosts = JSON.parse(storedViewedPosts);
          if (Array.isArray(parsedViewedPosts)) {
            setViewedPosts(new Set(parsedViewedPosts));
          }
        } catch (error) {
          console.error('Error parsing viewed posts from localStorage:', error);
        }
      }
    }
  }, [projectId]);

  const availableSubreddits = Array.from(new Set(allMentions.map(m => m.subreddit))).sort();
  const availableIntents = Array.from(new Set(allMentions.map(m => m.intent).filter(Boolean))) as string[];

  const filteredAll = allMentions
    .filter(m => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery = q ? m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) : true;
      const matchesSubreddit = selectedSubreddit === 'all' || m.subreddit === selectedSubreddit;
      const matchesIntent = selectedIntent === 'all' || (m.intent || '') === selectedIntent;
      return matchesQuery && matchesSubreddit && matchesIntent;
    })
    .sort((a, b) => {
      if (sortBy === 'new') return b.created_utc - a.created_utc;
      if (sortBy === 'comments') return b.num_comments - a.num_comments;
      return b.relevance_score - a.relevance_score;
    });

  const displayMentions = filteredAll.slice(0, visibleCount);
  const hasMoreLocal = visibleCount < filteredAll.length;

  useEffect(() => {
    if (!user) { router.push('/login'); return; }

    if (projectId && typeof projectId === 'string' && !isNaN(parseInt(projectId, 10))) {
      setIsLoading(true);
      setMentions([]);
      setCurrentSkip(0);
      setHasMoreMentions(true);
      setProject(null);

      api.getProject(projectId)
        .then(projectData => {
          setProject(projectData);
          setAnalysisStatus(projectData.analysis_status || 'idle');
          setAnalysisProgress(projectData.analysis_progress || 0);
          setAnalysisMessage(projectData.analysis_status_message || '');
          return api.getMentions(projectId, 0, 5000).then(allMentionsRaw => ({ projectData, allMentionsRaw }));
        })
        .then(({ projectData, allMentionsRaw }) => {
          const transformed = allMentionsRaw.map(transformRawMention).sort((a, b) => b.created_utc - a.created_utc);
          setAllMentions(transformed);
          setMentions(transformed);
          setVisibleCount(MENTIONS_PER_PAGE);
          setHasMoreMentions(false);

          if (transformed.length === 0 && projectData.analysis_status === 'idle') {
            api.analyzeReddit({
              brand_id: projectId,
              keywords: projectData.keywords || [],
              subreddits: projectData.subreddits || [],
              time_period: 'month',
              limit: 1000
            }).then(resp => {
              if (resp.status === 'started') {
                setAnalysisStatus('scanning');
                setAnalysisProgress(0);
                setAnalysisMessage('Starting initial scan...');
                toast.info('Initial scan started!');
              }
            }).catch(err => console.warn('Auto-scan trigger failed:', err));
          }
        })
        .catch(error => {
          console.error('Error fetching project data or mentions:', error);
          toast.error('Failed to load project mentions.');
        })
        .finally(() => setIsLoading(false));
    } else if (projectId) {
      toast.error('Invalid project ID');
      router.push('/projects');
      setIsLoading(false);
    }
  }, [projectId, user, router]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (analysisStatus === 'scanning' && projectId) {
      pollInterval = setInterval(async () => {
        try {
          const updatedProject = await api.getProject(projectId);
          setAnalysisStatus(updatedProject.analysis_status || 'idle');
          setAnalysisProgress(updatedProject.analysis_progress || 0);
          setAnalysisMessage(updatedProject.analysis_status_message || '');

          if (updatedProject.analysis_status === 'completed' || updatedProject.analysis_status === 'failed') {
            const allMentionsRaw = await api.getMentions(projectId, 0, 5000);
            const transformed = allMentionsRaw.map(transformRawMention).sort((a, b) => b.created_utc - a.created_utc);
            setAllMentions(transformed);
            if (updatedProject.analysis_status === 'completed') {
              toast.success('Scan complete! New leads found.');
            }
          }
        } catch (error) {
          console.error('Error polling project status:', error);
        }
      }, 3000);
    }
    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [analysisStatus, projectId]);

  const handleRefresh = async () => {
    if (!projectId) return;
    try {
      const response = await api.analyzeReddit({
        brand_id: projectId,
        keywords: project?.keywords || [],
        subreddits: project?.subreddits || [],
        time_period: 'month',
        limit: 1000
      });
      if (response.status === 'started') {
        setAnalysisStatus('scanning');
        setAnalysisProgress(0);
        setAnalysisMessage('Starting scan...');
        toast.info('Scan started in background');
      } else if (response.status === 'already_running') {
        toast.warning('A scan is already in progress');
      } else if (response.status === 'cooldown') {
        toast.error(response.message || 'Scan is on cooldown');
        setAnalysisStatus('idle');
      }
    } catch (error) {
      console.error('Error starting refresh:', error);
      toast.error('Failed to start scan');
      setAnalysisStatus('idle');
    }
  };

  const handleLoadMore = () => setVisibleCount(prev => prev + MENTIONS_PER_PAGE);

  const postComment = async (mention: RedditMention) => {
    if (isPosting !== null) return;
    setIsPosting(mention.id);
    try {
      const commentText = generatedReplies[mention.id] || mention.suggested_comment;
      if (!commentText) {
        toast.error('No comment text available. Please generate a reply first.');
        setIsPosting(null);
        return;
      }
      const result = await redditAuth.postComment({
        brand_id: mention.brand_id,
        post_url: mention.url,
        post_title: mention.title,
        comment_text: commentText
      });
      setPublishedComments(prev => ({ ...prev, [mention.id]: result.comment_url }));
      toast.success(
        result.status === 'already_exists' ? 'Comment already exists on this post' : 'Comment posted successfully',
        { description: 'View your comment on Reddit', action: { label: 'View', onClick: () => window.open(result.comment_url, '_blank') } }
      );
      const COMMENTS_STORAGE_KEY = `published-comments-${projectId}`;
      const savedComments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY) || '{}');
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify({ ...savedComments, [mention.id]: result.comment_url }));
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post comment', { description: 'Please try again later' });
    } finally {
      setIsPosting(null);
    }
  };

  useEffect(() => {
    if (projectId) {
      const COMMENTS_STORAGE_KEY = `published-comments-${projectId}`;
      const savedComments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY) || '{}');
      setPublishedComments(savedComments);
    }
  }, [projectId]);

  const exportToCSV = () => {
    try {
      const headers = ['Title', 'URL', 'Subreddit', 'Created At', 'Score', 'Comments', 'Matching Keywords'].join(',');
      const rows = mentions.map(mention => {
        const formattedDate = `"${new Date(mention.created_utc * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"`;
        return [
          `"${mention.title?.replace(/"/g, '""') || ''}"`,
          `"${mention.url || ''}"`,
          `"${mention.subreddit || ''}"`,
          formattedDate,
          mention.score,
          mention.num_comments,
          `"${Array.isArray(mention.matching_keywords) ? mention.matching_keywords.join('; ') : ''}"`
        ].join(',');
      });
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reddit_mentions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const getRelevanceBadge = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500' };
    if (score >= 60) return { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' };
    return { bg: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' };
  };

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text;
    let highlightedText = text;
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    sortedKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-orange-100 text-orange-800 px-0.5 rounded">$1</mark>');
    });
    return highlightedText;
  };

  const [generatingReplyFor, setGeneratingReplyFor] = useState<number | null>(null);
  const [generatedReplies, setGeneratedReplies] = useState<Record<number, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editedReplies, setEditedReplies] = useState<Record<number, string>>({});

  const handleGenerateReply = async (mention: RedditMention) => {
    if (generatingReplyFor !== null) return;
    setGeneratingReplyFor(mention.id);
    try {
      const reply = await api.generateReply({ title: mention.title, content: mention.content, brand_id: mention.brand_id });
      setGeneratedReplies(prev => ({ ...prev, [mention.id]: reply }));
      setEditedReplies(prev => ({ ...prev, [mention.id]: reply }));
      setEditingReplyId(mention.id);
      toast.success('Reply generated!');
    } catch (error) {
      console.error('Error generating reply:', error);
      toast.error('Failed to generate reply.');
    } finally {
      setGeneratingReplyFor(null);
    }
  };

  const handleMarkAsViewed = (mentionId: number) => {
    if (!projectId) return;
    const key = `${VIEWED_POSTS_STORAGE_KEY_PREFIX}${projectId}`;
    setViewedPosts(prevViewedPosts => {
      const newViewedPosts = new Set(prevViewedPosts);
      newViewedPosts.add(mentionId);
      localStorage.setItem(key, JSON.stringify(Array.from(newViewedPosts)));
      return newViewedPosts;
    });
  };

  const hasActiveFilters = searchQuery || selectedSubreddit !== 'all' || selectedIntent !== 'all' || sortBy !== 'new';

  return (
    <PaymentGuard>
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Toaster position="top-center" />

        {/* Top Bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors group"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Projects
              </button>
              {project && (
                <>
                  <span className="text-gray-200">/</span>
                  <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{project.name}</h1>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {project && (
                <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md border border-green-100 text-[11px] font-semibold tabular-nums">
                  <TrendingUp className="h-3 w-3" />
                  {allMentions.length} leads
                </span>
              )}

              <button
                onClick={handleRefresh}
                disabled={analysisStatus === 'scanning'}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color] disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${analysisStatus === 'scanning' ? 'animate-spin text-orange-500' : ''}`} />
                {analysisStatus === 'scanning' ? 'Scanning...' : 'Refresh'}
              </button>

              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-lg border text-xs font-medium transition-[background-color,color,border-color] ${showAnalytics ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                Insights
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color]"
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scanning Status */}
        {analysisStatus === 'scanning' && (
          <div className="mb-6 p-4 bg-white border border-orange-100 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <RefreshCw className="h-4 w-4 text-orange-600 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Scanning Reddit...</p>
                  <p className="text-xs text-gray-500">{analysisMessage || 'Finding leads based on your keywords'}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-orange-600 tabular-nums">{analysisProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-[width] duration-500"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Reddit Connect Warning */}
        {!redditAuth.isAuthenticated && !isLoading && allMentions.length > 0 && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <span className="text-xs text-amber-800 font-medium flex-1">
              Connect your Reddit account to post comments directly.
            </span>
            <Button
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-7 px-3"
              onClick={() => redditAuth.ensureRedditConnection()}
            >
              Connect
            </Button>
          </div>
        )}

        {/* Analytics */}
        {!isLoading && project && showAnalytics && (
          <MentionsAnalytics mentions={allMentions} keywords={project.keywords || []} />
        )}

        {/* Filters */}
        {!isLoading && allMentions.length > 0 && (
          <div className="mb-5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow]"
                />
              </div>
              <select
                value={selectedSubreddit}
                onChange={(e) => setSelectedSubreddit(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="all">All subreddits</option>
                {availableSubreddits.map(sr => <option key={sr} value={sr}>r/{sr}</option>)}
              </select>
              <select
                value={selectedIntent}
                onChange={(e) => setSelectedIntent(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="all">All intents</option>
                {availableIntents.map(int => <option key={int} value={int}>{int}</option>)}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="new">Newest</option>
                <option value="comments">Most comments</option>
                <option value="relevance">Highest relevance</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>
                Showing <span className="font-medium text-gray-600 tabular-nums">{displayMentions.length}</span> of <span className="font-medium text-gray-600 tabular-nums">{filteredAll.length}</span> leads
              </span>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedSubreddit('all'); setSelectedIntent('all'); setSortBy('new'); }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 mb-3" />
            <p className="text-xs text-gray-400">Loading leads...</p>
          </div>
        ) : allMentions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No leads found yet</p>
            <p className="text-xs text-gray-400">Click Refresh to scan Reddit for leads.</p>
          </div>
        ) : displayMentions.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-500">No results match your filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayMentions.map((mention) => {
                const relevance = getRelevanceBadge(mention.relevance_score);
                const isHighIntent = mention.relevance_score > 90;

                return (
                  <div
                    key={mention.id}
                    className={`
                      bg-white rounded-xl border transition-[box-shadow,border-color] duration-200 overflow-hidden
                      ${isHighIntent ? 'border-orange-100 shadow-sm' : 'border-gray-100'}
                      ${viewedPosts.has(mention.id) ? 'opacity-80' : ''}
                      hover:shadow-md hover:border-gray-200
                    `}
                  >
                    {/* High intent indicator */}
                    {isHighIntent && (
                      <div className="h-0.5 bg-gradient-to-r from-orange-500 to-amber-400" />
                    )}

                    <div className="p-4 sm:p-5">
                      {/* Top row: subreddit, intent, relevance, external link */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                          r/{mention.subreddit}
                        </span>
                        {mention.intent && (
                          <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/50 uppercase tracking-wider">
                            {mention.intent}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${relevance.bg} flex items-center gap-1 tabular-nums`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${relevance.dot}`} />
                          {mention.relevance_score}%
                        </span>
                        {publishedComments[mention.id] && (
                          <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 flex items-center gap-1">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Published
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-1.5">
                          <a
                            href={mention.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-[background-color] ${viewedPosts.has(mention.id) ? 'text-gray-400 bg-gray-50' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'}`}
                            onClick={() => handleMarkAsViewed(mention.id)}
                          >
                            {viewedPosts.has(mention.id) ? 'Viewed' : 'Open'}
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-[13px] sm:text-sm font-medium text-gray-900 leading-snug mb-2">
                        <span dangerouslySetInnerHTML={{ __html: highlightKeywords(mention.title, mention.matching_keywords) }} />
                      </h3>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {mention.formatted_date}
                        </span>
                        <span className="flex items-center gap-1 tabular-nums">
                          <MessageSquare className="h-3 w-3" />
                          {mention.num_comments}
                        </span>
                        {mention.matching_keywords?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {mention.matching_keywords.map(k => `#${k}`).join(' ')}
                          </span>
                        )}
                      </div>

                      {/* Score explanation */}
                      {mention.suggested_comment && (
                        <div className="text-xs text-gray-500 leading-relaxed mb-3">
                          {expandedSuggestedComments[mention.id]
                            ? mention.suggested_comment
                            : `${mention.suggested_comment.substring(0, 140)}${mention.suggested_comment.length > 140 ? '...' : ''}`}
                          {mention.suggested_comment.length > 140 && (
                            <button
                              onClick={() => toggleSuggestedComment(mention.id)}
                              className="text-orange-600 hover:text-orange-700 ml-1 font-medium"
                            >
                              {expandedSuggestedComments[mention.id] ? 'less' : 'more'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* AI Reply Button */}
                      {!generatedReplies[mention.id] && (
                        <button
                          onClick={() => handleGenerateReply(mention)}
                          disabled={generatingReplyFor === mention.id}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color] disabled:opacity-50"
                        >
                          {generatingReplyFor === mention.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 text-orange-500" />
                              Generate Reply
                            </>
                          )}
                        </button>
                      )}

                      {/* Generated Reply */}
                      {generatedReplies[mention.id] && (
                        <div className="mt-3 rounded-lg border border-gray-100 overflow-hidden bg-gray-50/50">
                          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Generated Reply</span>
                            <button
                              className="text-gray-400 hover:text-gray-600 p-0.5"
                              onClick={() => {
                                setGeneratedReplies(prev => { const n = { ...prev }; delete n[mention.id]; return n; });
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="p-4">
                            {editingReplyId === mention.id ? (
                              <div className="space-y-2">
                                <textarea
                                  autoFocus
                                  className="w-full border border-gray-200 rounded-lg p-3 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow] resize-none"
                                  rows={4}
                                  value={editedReplies[mention.id] || ''}
                                  onChange={e => setEditedReplies(prev => ({ ...prev, [mention.id]: e.target.value }))}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] })); setEditingReplyId(null); }}
                                    className="text-xs h-7 px-3 border-gray-200"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => { setGeneratedReplies(prev => ({ ...prev, [mention.id]: editedReplies[mention.id] || generatedReplies[mention.id] })); setEditingReplyId(null); }}
                                    className="text-xs h-7 px-3 bg-gray-900 hover:bg-gray-800 text-white"
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p
                                className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-white rounded p-1 -m-1 transition-colors"
                                onClick={() => { setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] })); setEditingReplyId(mention.id); }}
                              >
                                {generatedReplies[mention.id]}
                              </p>
                            )}
                          </div>

                          {editingReplyId !== mention.id && (
                            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(generatedReplies[mention.id]);
                                    window.open(mention.url, '_blank', 'noopener,noreferrer');
                                    toast.success('Copied & opening post...');
                                  } catch { toast.error('Failed to copy'); }
                                }}
                                className="flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-[background-color]"
                              >
                                <Copy className="h-3 w-3" />
                                Copy & Open
                              </button>
                              <button
                                onClick={() => { setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] })); setEditingReplyId(mention.id); }}
                                className="flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-[background-color]"
                              >
                                <Edit3 className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => postComment(mention)}
                                disabled={isPosting === mention.id || !!publishedComments[mention.id]}
                                className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-semibold transition-[background-color] ${
                                  publishedComments[mention.id]
                                    ? 'bg-green-600 text-white'
                                    : isPosting === mention.id
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                                }`}
                              >
                                {isPosting === mention.id ? (
                                  <><Loader2 className="h-3 w-3 animate-spin" /> Posting...</>
                                ) : publishedComments[mention.id] ? (
                                  <><CheckCircle className="h-3 w-3" /> Published</>
                                ) : (
                                  'Publish'
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMoreLocal && (
              <div className="mt-6 flex justify-center pb-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-6 h-9 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color]"
                >
                  {isLoadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {isLoadingMore ? 'Loading...' : `Load ${Math.min(MENTIONS_PER_PAGE, filteredAll.length - displayMentions.length)} more`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PaymentGuard>
  );
}
