'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, ArrowUpRight, Calendar, Target, RefreshCw, Clock, Download } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import KeywordStats from '@/components/KeywordStats';
import { checkRefreshRateLimit, formatTimeRemaining } from '@/lib/rateLimit';

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
}

interface Project {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  subreddits: string[];
}

export default function MentionsPage() {
  const [mentions, setMentions] = useState<RedditMention[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLimit, setPostsLimit] = useState<number>(100); // Default to 100 posts
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('month'); // Default to month
  const [currentPage, setCurrentPage] = useState(1);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const itemsPerPage = 15;
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const fetchMentions = useCallback(async () => {
    // Add additional type safety check
    if (!projectId || typeof projectId !== 'string' || isNaN(parseInt(projectId, 10))) {
      toast.error('Invalid project ID');
      return;
    }

    setIsLoading(true);
    try {
      const projectData = await api.getProject(projectId);
      setProject(projectData);

      // Get mentions from database
      const mentions: RawMention[] = await api.getMentions(projectId);
      
      // Transform mentions to match RedditPost interface
      const transformedMentions = mentions.map(mention => ({
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
        matching_keywords: Array.isArray(mention.matching_keywords) ? 
          mention.matching_keywords : 
          (mention.keyword ? [mention.keyword] : []),
        relevance_score: mention.relevance_score,
        suggested_comment: mention.suggested_comment,
        formatted_date: new Date(mention.created_utc * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }))
      // Sort by relevance score in descending order
      .sort((a, b) => b.relevance_score - a.relevance_score);

      setMentions(transformedMentions);
    } catch (error) {
      console.error('Error fetching mentions:', error);
      toast.error('Failed to fetch mentions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if projectId exists and is valid
    if (!projectId || typeof projectId !== 'string' || isNaN(parseInt(projectId, 10))) {
      toast.error('Invalid project ID');
      router.push('/projects');
      return;
    }

    fetchMentions();
  }, [projectId, user, router, fetchMentions]);

  const refreshMentions = async () => {
    if (!project) return;

    // Check rate limit
    const rateLimitStatus = checkRefreshRateLimit(projectId);
    if (!rateLimitStatus.canRefresh) {
      setNextRefreshTime(rateLimitStatus.nextAllowedTime);
      setRefreshDisabled(true);
      toast.error(`Please wait ${formatTimeRemaining(rateLimitStatus.timeRemaining)} before refreshing again`);
      return;
    }

    setIsLoading(true);
    try {
      // First, get the latest project data to ensure we have current keywords and subreddits
      const latestProject = await api.getProject(projectId);
      
      if (!latestProject.keywords.length || !latestProject.subreddits.length) {
        toast.error('Project must have keywords and subreddits to analyze');
        return;
      }

      // Use the updated refreshMentions API with latest project data and limit
      const updatedMentions: RawMention[] = await api.refreshMentions(
        projectId,
        latestProject.keywords,
        latestProject.subreddits,
        {
          time_period: timePeriod,
          limit: postsLimit
        }
      );
      
      // Update the project state with latest data
      setProject(latestProject);
      
      // Transform mentions to match RedditPost interface
      const transformedMentions = updatedMentions.map(mention => ({
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
        matching_keywords: Array.isArray(mention.matching_keywords) ? 
          mention.matching_keywords : 
          (mention.keyword ? [mention.keyword] : []),
        relevance_score: mention.relevance_score,
        suggested_comment: mention.suggested_comment,
        formatted_date: new Date(mention.created_utc * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }))
      // Sort by relevance score in descending order
      .sort((a, b) => b.relevance_score - a.relevance_score);

      setMentions(transformedMentions);
      toast.success('Mentions refreshed successfully');
      
      // Update next refresh time
      setNextRefreshTime(rateLimitStatus.nextAllowedTime);
      setRefreshDisabled(true);
    } catch (error) {
      console.error('Error refreshing mentions:', error);
      toast.error('Failed to refresh mentions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to update refresh button state
  useEffect(() => {
    const updateRefreshState = () => {
      if (!projectId) return;
      
      const rateLimitStatus = checkRefreshRateLimit(projectId);
      if (!rateLimitStatus.canRefresh) {
        setNextRefreshTime(rateLimitStatus.nextAllowedTime);
        setRefreshDisabled(true);
      } else {
        setNextRefreshTime(null);
        setRefreshDisabled(false);
      }
    };

    updateRefreshState();
    const interval = setInterval(updateRefreshState, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [projectId]);

  const exportToCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        'Title',
        'URL',
        'Author',
        'Subreddit',
        'Created At',
        'Score',
        'Comments',
        'Relevance Score',
        'Matching Keywords'
      ].join(',');

      // Convert mentions to CSV rows
      const rows = mentions.map(mention => {
        return [
          `"${mention.title?.replace(/"/g, '""') || ''}"`,
          `"${mention.url || ''}"`,
          `"${mention.author || ''}"`,
          `"${mention.subreddit || ''}"`,
          new Date(mention.created_utc * 1000).toLocaleString(),
          mention.score,
          mention.num_comments,
          mention.relevance_score,
          `"${Array.isArray(mention.matching_keywords) ? mention.matching_keywords.join(', ') : ''}"`,
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
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-yellow-500 text-white';
    if (score >= 40) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!text || !keywords) return text;
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 font-medium">$1</mark>');
    });
    return highlightedText;
  };

  const [generatingReplyFor, setGeneratingReplyFor] = useState<number | null>(null);
  const [generatedReplies, setGeneratedReplies] = useState<Record<number, string>>({});

  const handleGenerateReply = async (mention: RedditMention) => {
    if (generatingReplyFor !== null) return; // Prevent multiple simultaneous generations
    
    setGeneratingReplyFor(mention.id);
    try {
      const reply = await api.generateReply({
        title: mention.title,
        content: mention.content,
        brand_id: mention.brand_id
      });
      // Store the generated reply
      setGeneratedReplies(prev => ({
        ...prev,
        [mention.id]: reply
      }));
      // Copy to clipboard
      await navigator.clipboard.writeText(reply);
      toast.success('Reply generated and copied to clipboard!');
    } catch (error) {
      console.error('Error generating reply:', error);
      toast.error('Failed to generate reply. Please try again.');
    } finally {
      setGeneratingReplyFor(null);
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(mentions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMentions = mentions.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      // Smooth scroll to top of mentions
      document.getElementById('mentions-list')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Smooth scroll to top of mentions
      document.getElementById('mentions-list')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          {/* Back button and Actions Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
                w-full sm:w-auto
              "
              variant="ghost"
            >
              <div className="
                absolute left-0 top-0 bottom-0 w-1
                bg-gradient-to-b from-[#ff4500] to-[#ff6d3f]
                rounded-l-lg
              "/>
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Projects</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3">
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
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
                
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

              <Button
                onClick={refreshMentions}
                disabled={isLoading || refreshDisabled}
                className={`
                  relative group flex items-center gap-2 
                  ${isLoading || refreshDisabled 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed hover:bg-gray-100' 
                    : 'bg-[#ff4500] hover:bg-[#ff4500]/90 text-white'
                  } 
                  transition-all duration-200 h-9 px-4 rounded-md
                `}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isLoading ? 'Refreshing...' : 'Refresh Mentions'}
                </span>
                <span className="sm:hidden">
                  {isLoading ? 'Loading...' : 'Refresh'}
                </span>
                
                {refreshDisabled && nextRefreshTime && (
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
                    <Clock className="h-3 w-3 inline-block mr-1.5" />
                    <span>Available in {formatTimeRemaining(nextRefreshTime - Date.now())}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Compact Keywords Stats */}
          {project && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#ff4500]/5 text-[#ff4500] border-[#ff4500]/20">
                    {mentions.length} Mentions
                  </Badge>
                  <Badge variant="outline">
                    {project.keywords?.length || 0} Keywords
                  </Badge>
                  <Badge variant="outline">
                    {project.subreddits?.length || 0} Subreddits
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
                  className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4500]/20"
                  disabled={isLoading}
                >
                  <option value="day">Last 24 hours</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
                <select
                  value={postsLimit}
                  onChange={(e) => setPostsLimit(Number(e.target.value))}
                  className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4500]/20"
                  disabled={isLoading}
                >
                  <option value={20}>20 posts</option>
                  <option value={50}>50 posts</option>
                  <option value={100}>100 posts</option>
                  <option value={200}>200 posts</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Keywords Stats Section */}
        {project && (
          <div className="space-y-6 sm:space-y-8">
            <KeywordStats 
              keywords={project.keywords || []}
              mentions={mentions}
            />
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : mentions.length === 0 ? (
          <div className="text-center py-8">No mentions found.</div>
        ) : (
          <>
            <div id="mentions-list" className="space-y-6">
              {currentMentions.map((mention, index) => (
                <Card key={mention.id} className="w-full transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-gray-100/80">
                  <CardContent className="p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                          <h3 className="text-base sm:text-lg font-medium flex-grow order-2 sm:order-1">
                            <span
                              className="hover:text-[#ff4500] transition-colors duration-200"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightKeywords(mention.title, mention.matching_keywords)
                              }}
                            />
                          </h3>
                          <div className="flex items-center gap-2 order-1 sm:order-2 self-start">
                            <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
                              r/{mention.subreddit}
                            </Badge>
                            <a 
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#ff4500] text-white hover:bg-[#ff4500]/90 transition-colors text-xs sm:text-sm font-medium h-7 sm:h-8"
                            >
                              View Post
                              <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </a>
                          </div>
                        </div>
                        {mention.matching_keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center order-3">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Matched:</span>
                            {mention.matching_keywords.map((keyword) => (
                              <Badge 
                                key={keyword} 
                                className="bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/20 transition-colors text-xs"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {mention.formatted_date}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${getRelevanceColor(mention.relevance_score)}`}>
                                {mention.relevance_score}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {mention.num_comments} comments
                            </div>
                          </div>
                          <Button
                            onClick={() => handleGenerateReply(mention)}
                            disabled={generatingReplyFor === mention.id}
                            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white border-none shadow-sm h-8 px-3 transition-colors duration-200"
                            size="sm"
                          >
                            {generatingReplyFor === mention.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4" />
                                <span>Generate Reply</span>
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Show generated reply if available */}
                        {generatedReplies[mention.id] && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Generated Reply</span>
                              <Button
                                onClick={() => navigator.clipboard.writeText(generatedReplies[mention.id])}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                              >
                                Copy
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{generatedReplies[mention.id]}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center text-sm text-gray-500">
                Showing <span className="font-medium mx-1">{startIndex + 1}</span>
                to <span className="font-medium mx-1">{Math.min(endIndex, mentions.length)}</span>
                of <span className="font-medium mx-1">{mentions.length}</span> mentions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7-7 18 7 18 7-7z" />
                  </svg>
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        document.getElementById('mentions-list')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`w-8 h-8 p-0 ${
                        currentPage === page ? 'bg-[#ff4500] hover:bg-[#ff4500]/90' : ''
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}