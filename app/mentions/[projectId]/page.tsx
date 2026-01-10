'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, ArrowUpRight, Calendar, Target, Download, CheckCircle, RefreshCw, Loader2, Search, Zap, Sparkles, Check, TrendingUp, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true); // For initial project and first page load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For 'Load More' button
  const [currentSkip, setCurrentSkip] = useState(0);
  const [hasMoreMentions, setHasMoreMentions] = useState(true);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const [isPosting, setIsPosting] = useState<number | null>(null);
  const [publishedComments, setPublishedComments] = useState<Record<number, string>>({});
  const [expandedSuggestedComments, setExpandedSuggestedComments] = useState<Record<number, boolean>>({});
  // UI controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubreddit, setSelectedSubreddit] = useState('all');
  const [selectedIntent, setSelectedIntent] = useState('all');
  const [sortBy, setSortBy] = useState<'new' | 'comments' | 'relevance'>('new');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [allMentions, setAllMentions] = useState<RedditMention[]>([]); // New state for ALL mentions
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
    setExpandedSuggestedComments(prev => ({
      ...prev,
      [mentionId]: !prev[mentionId]
    }));
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

  // Derived filter options from all mentions
  const availableSubreddits = Array.from(new Set(allMentions.map(m => m.subreddit))).sort();
  const availableIntents = Array.from(new Set(allMentions.map(m => m.intent).filter(Boolean))) as string[];

  // Apply search, filter, sort to ALL mentions
  const filteredAll = allMentions
    .filter(m => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery = q
        ? m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q)
        : true;
      const matchesSubreddit = selectedSubreddit === 'all' || m.subreddit === selectedSubreddit;
      const matchesIntent = selectedIntent === 'all' || (m.intent || '') === selectedIntent;
      return matchesQuery && matchesSubreddit && matchesIntent;
    })
    .sort((a, b) => {
      if (sortBy === 'new') return b.created_utc - a.created_utc;
      if (sortBy === 'comments') return b.num_comments - a.num_comments;
      return b.relevance_score - a.relevance_score;
    });

  // Display only a slice for the list
  const displayMentions = filteredAll.slice(0, visibleCount);
  const hasMoreLocal = visibleCount < filteredAll.length;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

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

          // Fetch up to 5000 mentions at once for analytics
          return api.getMentions(projectId, 0, 5000).then(allMentionsRaw => ({
            projectData,
            allMentionsRaw
          }));
        })
        .then(({ projectData, allMentionsRaw }) => {
          const transformed = allMentionsRaw
            .map(transformRawMention)
            .sort((a, b) => b.created_utc - a.created_utc);

          setAllMentions(transformed);
          setMentions(transformed);
          setVisibleCount(MENTIONS_PER_PAGE);
          setHasMoreMentions(false);

          // Auto-trigger scan if the project is empty and idle (e.g., brand new project)
          if (transformed.length === 0 && projectData.analysis_status === 'idle') {
            console.log('Project is empty and idle, triggering auto-scan...');
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
            }).catch(err => {
              console.warn('Auto-scan trigger failed:', err);
            });
          }
        })
        .catch(error => {
          console.error('Error fetching project data or mentions:', error);
          toast.error('Failed to load project mentions.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (projectId) {
      toast.error('Invalid project ID');
      router.push('/projects');
      setIsLoading(false);
    }
  }, [projectId, user, router]);

  // Polling for analysis status
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
            // Refresh mentions if finished
            const allMentionsRaw = await api.getMentions(projectId, 0, 5000);
            const transformed = allMentionsRaw
              .map(transformRawMention)
              .sort((a, b) => b.created_utc - a.created_utc);
            setAllMentions(transformed);
            if (updatedProject.analysis_status === 'completed') {
              toast.success('Scan complete! New leads found.');
            }
          }
        } catch (error) {
          console.error('Error polling project status:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
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

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + MENTIONS_PER_PAGE);
  };

  const postComment = async (mention: RedditMention) => {
    if (isPosting !== null) return; // Prevent multiple simultaneous posts

    setIsPosting(mention.id);
    try {
      // Check if we have a generated reply for this mention
      const commentText = generatedReplies[mention.id] || mention.suggested_comment;

      if (!commentText) {
        toast.error('No comment text available. Please generate a reply first.');
        setIsPosting(null);
        return;
      }

      // The postComment function now handles authentication internally
      const result = await redditAuth.postComment({
        brand_id: mention.brand_id,
        post_url: mention.url,
        post_title: mention.title,
        comment_text: commentText
      });

      // Store the published comment URL
      setPublishedComments(prev => ({
        ...prev,
        [mention.id]: result.comment_url
      }));

      // Show success message with link to the comment
      toast.success(
        result.status === 'already_exists'
          ? 'Comment already exists on this post'
          : 'Comment posted successfully',
        {
          description: 'View your comment on Reddit',
          action: {
            label: 'View',
            onClick: () => window.open(result.comment_url, '_blank')
          }
        }
      );

      // Save to localStorage to persist between page refreshes
      const COMMENTS_STORAGE_KEY = `published-comments-${projectId}`;
      const savedComments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY) || '{}');
      localStorage.setItem(
        COMMENTS_STORAGE_KEY,
        JSON.stringify({
          ...savedComments,
          [mention.id]: result.comment_url
        })
      );

    } catch (error) {
      console.error('Error posting comment:', error);

      let errorMessage = 'Failed to post comment';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        description: 'Please try again later'
      });
    } finally {
      setIsPosting(null);
    }
  };

  useEffect(() => {
    // Load published comments from localStorage
    if (projectId) {
      const COMMENTS_STORAGE_KEY = `published-comments-${projectId}`;
      const savedComments = JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY) || '{}');
      setPublishedComments(savedComments);
    }
  }, [projectId]);

  const exportToCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        'Title',
        'URL',
        'Subreddit',
        'Created At',
        'Score',
        'Comments',
        'Matching Keywords'
      ].join(',');

      // Convert mentions to CSV rows
      const rows = mentions.map(mention => {
        // Format date with quotes to keep it in one column
        const formattedDate = `"${new Date(mention.created_utc * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}"`;

        return [
          `"${mention.title?.replace(/"/g, '""') || ''}"`,
          `"${mention.url || ''}"`,
          `"${mention.subreddit || ''}"`,
          formattedDate,
          mention.score,
          mention.num_comments,
          `"${Array.isArray(mention.matching_keywords) ? mention.matching_keywords.join('; ') : ''}"` // Use semicolons instead of commas
        ].join(',');
      });

      // Combine headers and rows
      const csvContent = [headers, ...rows].join('\n');

      // Create blob and download
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-[hsl(var(--primary))] text-white';
    if (score >= 60) return 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]';
    if (score >= 40) return 'bg-slate-400 text-white';
    return 'bg-slate-600 text-white';
  };

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text;

    let highlightedText = text;
    // Sort keywords by length descending to avoid partial matches on shorter keywords
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    sortedKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-orange-100 text-orange-900 font-bold px-1 rounded-sm">$1</mark>');
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
      const reply = await api.generateReply({
        title: mention.title,
        content: mention.content,
        brand_id: mention.brand_id
      });
      setGeneratedReplies(prev => ({
        ...prev,
        [mention.id]: reply
      }));
      setEditedReplies(prev => ({
        ...prev,
        [mention.id]: reply
      }));
      setEditingReplyId(mention.id);
      toast.success('Reply generated! Editor is open for modifications.');
    } catch (error) {
      console.error('Error generating reply:', error);
      toast.error('Failed to generate reply. Please try again.');
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

  return (
    <PaymentGuard>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Toaster position="top-center" />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <Button
            onClick={() => router.push('/projects')}
            className="
              group relative flex items-center gap-2
              bg-white/80 hover:bg-white
              text-gray-700 hover:text-gray-900
              border border-gray-200
              shadow-sm hover:shadow-md
              transition-all duration-200
              px-4 py-2 rounded-lg
              hover:-translate-x-0.5
              w-auto
            "
            variant="ghost"
          >
            <div className="
               absolute left-0 top-0 bottom-0 w-1
              bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent))]
              rounded-l-lg
            "/>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Projects</span>
          </Button>

          {project && (
            <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-2 sm:p-2.5 shadow-sm">
              <div className="px-3 py-1 bg-gray-50 rounded-lg">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">{project.name}</h2>
              </div>
              <div className="h-4 w-px bg-gray-200 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100/50">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">{allMentions.length} Leads</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={analysisStatus === 'scanning'}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all group"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${analysisStatus === 'scanning' ? 'animate-spin text-orange-600' : 'text-gray-400 group-hover:text-orange-600'}`} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  {analysisStatus === 'scanning' ? 'Scanning...' : 'Refresh'}
                </span>
              </Button>
              <div className="h-4 w-px bg-gray-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg transition-all ${showAnalytics ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {showAnalytics ? <Check className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest font-heading">Insights</span>
              </Button>
            </div>
          )}

          <Button
            onClick={exportToCSV}
            className="
              relative group flex items-center gap-2
              bg-gradient-to-r from-emerald-500 to-teal-500 
              hover:from-emerald-600 hover:to-teal-600
              text-white shadow-sm
              transition-all duration-300 ease-in-out
              hover:shadow-md hover:-translate-y-0.5
              h-9 px-4 rounded-md
            "
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>

            {/* Tooltip */}
            <div className="
              invisible group-hover:visible 
              absolute -top-10 left-1/2 transform -translate-x-1/2 
              bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md
              whitespace-nowrap z-50
              opacity-0 group-hover:opacity-100
              transition-all duration-200
              shadow-lg
            ">
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                border-t-4 border-l-4 border-r-4 
                border-transparent border-t-gray-800
              "></div>
              Download all mentions as CSV
            </div>
          </Button>
        </div>

        {/* Global Scanning Status */}
        {analysisStatus === 'scanning' && (
          <div className="mb-8 p-5 bg-gradient-to-br from-white to-orange-50/30 backdrop-blur-xl border border-orange-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <RefreshCw className="h-24 w-24 text-orange-600 animate-spin-slow" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-400 rounded-lg blur-md opacity-20 animate-pulse"></div>
                    <div className="p-2.5 bg-orange-100 rounded-lg relative">
                      <RefreshCw className="h-5 w-5 text-orange-600 animate-spin" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 tracking-tight">AI Engine is scanning Reddit...</p>
                    <p className="text-xs text-gray-500 font-medium">{analysisMessage || 'Hunting for qualified leads based on your keywords'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-orange-600 tracking-tighter">{analysisProgress}%</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Complete</p>
                </div>
              </div>
              <div className="h-2.5 w-full bg-gray-100/50 rounded-full overflow-hidden border border-gray-100/50">
                <div
                  className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(234,88,12,0.3)]"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {!isLoading && project && showAnalytics && (
          <MentionsAnalytics
            mentions={allMentions}
            keywords={project.keywords || []}
          />
        )}

        {/* Controls */}
        {!isLoading && allMentions.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-5 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title or content..."
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] text-sm"
                />
              </div>
            </div>
            {/* Subreddit */}
            <div className="md:col-span-3 min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[hsl(var(--primary))] opacity-70" />
                <select
                  value={selectedSubreddit}
                  onChange={(e) => setSelectedSubreddit(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]"
                >
                  <option value="all">All subreddits</option>
                  {availableSubreddits.map(sr => (
                    <option key={sr} value={sr}>{`r/${sr}`}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Intent */}
            <div className="md:col-span-2 min-w-0">
              <select
                value={selectedIntent}
                onChange={(e) => setSelectedIntent(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]"
              >
                <option value="all">All intents</option>
                {availableIntents.map(int => (
                  <option key={int} value={int}>{int}</option>
                ))}
              </select>
            </div>
            {/* Sort */}
            <div className="md:col-span-2 min-w-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]"
              >
                <option value="new">Newest</option>
                <option value="comments">Most comments</option>
                <option value="relevance">Highest relevance</option>
              </select>
            </div>
            <div className="md:col-span-12 flex items-center justify-between text-xs text-gray-500">
              <div>
                Showing <span className="font-medium text-gray-700">{displayMentions.length}</span> of <span className="font-medium text-gray-700">{filteredAll.length}</span> matching leads
              </div>
              {(searchQuery || selectedSubreddit !== 'all' || selectedIntent !== 'all' || sortBy !== 'new') && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedSubreddit('all'); setSelectedIntent('all'); setSortBy('new'); }}
                  className="text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
          </div>
        ) : allMentions.length === 0 ? (
          <div className="text-center py-10 bg-white/60 border border-dashed border-gray-300 rounded-lg">
            No leads found yet. Click refresh to scan Reddit.
          </div>
        ) : displayMentions.length === 0 ? (
          <div className="text-center py-10 bg-white/60 border border-dashed border-gray-300 rounded-lg">
            No results match your filters.
          </div>
        ) : (
          <>
            <div id="mentions-list" className="space-y-6">
              {displayMentions.map((mention, index) => (
                <div
                  key={mention.id}
                  className={`
                    relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden
                    ${mention.relevance_score > 90
                      ? 'border-orange-100/50 ring-1 ring-orange-100/30 bg-gradient-to-br from-white via-white to-orange-50/10'
                      : 'border-gray-100'}
                    ${viewedPosts.has(mention.id) ? 'opacity-90 grayscale-[0.2]' : 'opacity-100'}
                  `}
                >
                  {mention.relevance_score > 90 && (
                    <div className="absolute top-0 left-0 px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-br-xl shadow-lg z-10 flex items-center gap-1">
                      <Zap className="h-3 w-3 fill-white" />
                      High Intent
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                          <h3 className="text-base sm:text-lg font-medium flex-grow order-2 sm:order-1">
                            <span
                              className="hover:text-[hsl(var(--primary))] transition-colors duration-200"
                              dangerouslySetInnerHTML={{
                                __html: highlightKeywords(mention.title, mention.matching_keywords)
                              }}
                            />
                          </h3>
                          <div className="flex items-center gap-2 order-1 sm:order-2 self-start flex-wrap">
                            <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm">
                              r/{mention.subreddit}
                            </Badge>
                            <a
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-200 text-xs sm:text-sm font-medium h-7 sm:h-8 ${viewedPosts.has(mention.id) ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-[hsl(var(--secondary))]/60 hover:bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/15 hover:border-[hsl(var(--primary))]/25'}`}
                              onClick={() => handleMarkAsViewed(mention.id)}
                            >
                              {viewedPosts.has(mention.id) ? 'Viewed' : 'View Post'}
                              <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center order-3 mt-1 opacity-80">
                          {mention.matching_keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <Target className="h-3 w-3 text-gray-400" />
                              <div className="flex flex-wrap gap-1.5">
                                {mention.matching_keywords.map((keyword) => (
                                  <span
                                    key={keyword}
                                    className="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                                  >
                                    #{keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {mention.intent && (
                            <>
                              <div className="h-3 w-px bg-gray-200 mx-1" />
                              <div className="flex items-center gap-1.5">
                                <Zap className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{mention.intent}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {mention.formatted_date}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {mention.num_comments} comments
                            </div>
                            {publishedComments[mention.id] && (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-green-600 font-medium">Published</span>
                              </div>
                            )}
                            {typeof mention.relevance_score === 'number' && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-medium">Relevance:</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-gray-100 shadow-sm">
                                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${mention.relevance_score > 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : mention.relevance_score > 60 ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                                  <span className={`text-xs font-black tracking-tight ${getRelevanceColor(mention.relevance_score)}`}>
                                    {mention.relevance_score}% Match
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleGenerateReply(mention)}
                            disabled={generatingReplyFor === mention.id}
                            className={`
                              relative group flex items-center gap-2 
                              bg-white hover:bg-white text-[hsl(var(--primary))] 
                              border border-[hsl(var(--primary))]/20 shadow-sm 
                              h-9 px-5 transition-all duration-300 w-full sm:w-auto mt-2 sm:mt-0 
                              hover:shadow-md hover:border-[hsl(var(--primary))]/40 font-bold overflow-hidden
                            `}
                            size="sm"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--primary))]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            {generatingReplyFor === mention.id ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                                <span>AI Reply</span>
                              </>
                            )}
                          </Button>
                        </div>
                        {mention.suggested_comment && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs sm:text-sm text-gray-600">
                              <span className="font-medium text-gray-700">Score Explanation: </span>
                              {
                                expandedSuggestedComments[mention.id]
                                  ? mention.suggested_comment
                                  : `${mention.suggested_comment.substring(0, 120)}${mention.suggested_comment.length > 120 ? '...' : ''}`
                              }
                              {mention.suggested_comment.length > 120 && (
                                <button
                                  onClick={() => toggleSuggestedComment(mention.id)}
                                  className="text-blue-500 hover:text-blue-700 ml-1 text-xs font-medium"
                                >
                                  {expandedSuggestedComments[mention.id] ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </p>
                          </div>
                        )}
                        {/* Show generated reply if available */}
                        {generatedReplies[mention.id] && (
                          <div className="mt-4 space-y-3">
                            <div className="border border-gray-100 rounded-lg bg-white overflow-hidden">
                              {/* Header */}
                              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <h4 className="text-sm font-medium text-gray-700">Generated Reply</h4>
                              </div>

                              {/* Content */}
                              <div
                                className={`p-4 cursor-text ${editingReplyId !== mention.id ? 'hover:bg-gray-50 transition-colors' : ''}`}
                                onClick={() => {
                                  if (editingReplyId !== mention.id) {
                                    setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] }));
                                    setEditingReplyId(mention.id);
                                  }
                                }}
                              >
                                {editingReplyId === mention.id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      autoFocus
                                      className="w-full border border-gray-200 rounded-md p-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all"
                                      rows={4}
                                      value={editedReplies[mention.id] || ''}
                                      onChange={e => setEditedReplies(prev => ({ ...prev, [mention.id]: e.target.value }))}
                                    />
                                    <div className="flex justify-end gap-2 pt-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] }));
                                          setEditingReplyId(null);
                                        }}
                                        className="text-xs h-8"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setGeneratedReplies(prev => ({ ...prev, [mention.id]: editedReplies[mention.id] || generatedReplies[mention.id] }));
                                          setEditingReplyId(null);
                                        }}
                                        className="text-xs h-8 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
                                      >
                                        Save Changes
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="group flex items-start justify-between">
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{generatedReplies[mention.id]}</p>
                                    <button
                                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] }));
                                        setEditingReplyId(mention.id);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        await navigator.clipboard.writeText(generatedReplies[mention.id]);
                                        window.open(mention.url, '_blank', 'noopener,noreferrer');
                                        toast.success('Reply copied and opening post...');
                                      } catch (error) {
                                        console.error('Error:', error);
                                        toast.error('Failed to copy or open post');
                                      }
                                    }}
                                    className="h-8 px-3 text-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 flex items-center gap-1.5"
                                    size="sm"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy & Go to Post
                                  </Button>

                                  <Button
                                    onClick={() => postComment(mention)}
                                    disabled={isPosting === mention.id || !!publishedComments[mention.id]}
                                    className={`h-8 px-3 text-xs ${isPosting === mention.id
                                      ? 'bg-gray-100 text-gray-500'
                                      : publishedComments[mention.id]
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white'} flex-shrink-0`}
                                    size="sm"
                                  >
                                    {isPosting === mention.id ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                        Posting...
                                      </>
                                    ) : publishedComments[mention.id] ? (
                                      <>
                                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                        Published
                                      </>
                                    ) : (
                                      'Publish'
                                    )}
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 ml-auto"
                                    onClick={() => {
                                      setGeneratedReplies(prev => {
                                        const newReplies = { ...prev };
                                        delete newReplies[mention.id];
                                        return newReplies;
                                      });
                                    }}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreLocal && (
              <div className="mt-8 flex justify-center pb-12">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20 px-8 py-6 rounded-xl hover:shadow-md transition-all duration-200"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingMore ? 'animate-spin' : ''}`} />
                  {isLoadingMore ? 'Loading...' : `Show 25 More Leads (of ${filteredAll.length - displayMentions.length} remaining)`}
                </Button>
              </div>
            )}
          </>
        )}
        {!redditAuth.isAuthenticated && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span className="text-sm font-medium">
                Connect your Reddit account to post comments directly
              </span>
              <Button
                size="sm"
                className="ml-auto bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-xs"
                onClick={() => redditAuth.ensureRedditConnection()}
              >
                Connect
              </Button>
            </div>
          </div>
        )}
      </div>
    </PaymentGuard>
  );
}