'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, ArrowUpRight, Calendar, Target, RefreshCw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import KeywordStats from '@/components/KeywordStats';

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
    } catch (error) {
      console.error('Error refreshing mentions:', error);
      toast.error('Failed to refresh mentions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Top Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/projects')} 
                className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 h-9"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Back to Projects</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-4 w-px bg-gray-200" />
              <h1 className="text-xl sm:text-2xl font-semibold">Mentions</h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-2 sm:px-3 h-9"
                size="sm"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-y-0.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button
                onClick={refreshMentions}
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#ff4500] hover:bg-[#ff4500]/90 text-white h-9 px-2 sm:px-3"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh Mentions'}</span>
                <span className="sm:hidden">{isLoading ? 'Loading...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>

          {/* Project Info and Filters */}
          {project && (
            <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
              <div className="p-4 sm:p-6 space-y-4">
                {/* Project Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{project.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant="outline" className="bg-[#ff4500]/5 text-[#ff4500] border-[#ff4500]/20 h-7">
                      {mentions.length} Mentions
                    </Badge>
                    <Badge variant="outline" className="h-7">
                      {project.keywords?.length || 0} Keywords
                    </Badge>
                    <Badge variant="outline" className="h-7">
                      {project.subreddits?.length || 0} Subreddits
                    </Badge>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 hidden sm:block">
                    Showing mentions from the selected time period
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <select
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
                      className="h-9 rounded-md border border-gray-200 bg-white px-2 sm:px-3 py-1 text-sm shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4500]/20 flex-1 sm:flex-none"
                      disabled={isLoading}
                    >
                      <option value="day">Last 24 hours</option>
                      <option value="week">Last 7 days</option>
                      <option value="month">Last 30 days</option>
                    </select>
                    <select
                      value={postsLimit}
                      onChange={(e) => setPostsLimit(Number(e.target.value))}
                      className="h-9 rounded-md border border-gray-200 bg-white px-2 sm:px-3 py-1 text-sm shadow-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4500]/20 flex-1 sm:flex-none"
                      disabled={isLoading}
                    >
                      <option value={20}>20 posts</option>
                      <option value={50}>50 posts</option>
                      <option value={100}>100 posts</option>
                      <option value={200}>200 posts</option>
                    </select>
                  </div>
                </div>
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
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50/30">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow space-y-2">
                        <div className="flex items-start gap-3 flex-wrap">
                          <h3 className="text-lg font-medium flex-grow">
                            <span
                              className="hover:text-[#ff4500] transition-colors duration-200"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightKeywords(mention.title, mention.matching_keywords)
                              }}
                            />
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200 transition-colors">
                              r/{mention.subreddit}
                            </Badge>
                            <a 
                              href={mention.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#ff4500] text-white hover:bg-[#ff4500]/90 transition-colors text-sm font-medium"
                            >
                              View Post
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                        {mention.matching_keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm font-medium text-gray-700">Matched:</span>
                            {mention.matching_keywords.map((keyword) => (
                              <Badge 
                                key={keyword} 
                                className="bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/20 transition-colors"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {mention.formatted_date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Target className="h-4 w-4" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRelevanceColor(mention.relevance_score)}`}>
                          {mention.relevance_score}% Relevant
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        {mention.num_comments} comments
                      </div>
                    </div>

                    {mention.suggested_comment && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="text-sm font-medium text-gray-700 mb-2">Suggested Response:</div>
                        <div className="text-sm text-gray-600">{mention.suggested_comment}</div>
                      </div>
                    )}
                  </div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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