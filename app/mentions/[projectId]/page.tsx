'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, ArrowUpRight, Calendar, Target, Clock, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { toast, Toaster } from 'sonner';
import { checkRefreshRateLimit, formatTimeRemaining } from '@/lib/rateLimit';
import { useRedditAuthStore } from '@/lib/redditAuth';
import { PaymentGuard } from '@/components/PaymentGuard';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [nextRefreshTime, setNextRefreshTime] = useState<number | null>(null);
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const [isPosting, setIsPosting] = useState<number | null>(null);
  const [publishedComments, setPublishedComments] = useState<Record<number, string>>({});
  const itemsPerPage = 15;
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const redditAuth = useRedditAuthStore();

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
      // Sort by date (created_utc) in descending order (latest first)
      .sort((a, b) => b.created_utc - a.created_utc);

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

  useEffect(() => {
    if (!projectId) return;
    
    // Project data is already loaded in fetchMentions
    fetchMentions();
    
    // Reddit auth status is now checked with caching in the redditAuth store
    // No need to call it explicitly here as it's already checked in AuthContext
  }, [projectId, fetchMentions]);

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
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editedReplies, setEditedReplies] = useState<Record<number, string>>({});

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
              bg-gradient-to-b from-[#ff4500] to-[#ff6d3f]
              rounded-l-lg
            "/>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Projects</span>
          </Button>

          {project && (
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-3">
              <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
              <div className="h-4 w-px bg-gray-200" />
              <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
                {mentions.length} Mentions
              </Badge>
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
                <Card key={mention.id} className="w-full transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-gray-100/80 rounded-xl sm:rounded-2xl">
                  <CardContent className="p-4 sm:p-6">
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
                          <div className="flex items-center gap-2 order-1 sm:order-2 self-start flex-wrap">
                            <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm">
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
                              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              {mention.num_comments} comments
                            </div>
                            {publishedComments[mention.id] && (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-green-600 font-medium">Published</span>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleGenerateReply(mention)}
                            disabled={generatingReplyFor === mention.id}
                            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white border-none shadow-sm h-8 px-3 transition-colors duration-200 w-full sm:w-auto mt-2 sm:mt-0"
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
                          <div className="mt-3 space-y-3">
                            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                <span className="text-sm font-medium text-gray-700">Generated Reply</span>
                                {editingReplyId === mention.id ? (
                                  <div className="flex gap-2 mt-2 sm:mt-0">
                                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => {
                                      setGeneratedReplies(prev => ({ ...prev, [mention.id]: editedReplies[mention.id] || generatedReplies[mention.id] }));
                                      setEditingReplyId(null);
                                    }}>Save</Button>
                                    <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700" onClick={() => {
                                      setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] }));
                                      setEditingReplyId(null);
                                    }}>Cancel</Button>
                                  </div>
                                ) : (
                                  <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700" onClick={() => {
                                    setEditedReplies(prev => ({ ...prev, [mention.id]: generatedReplies[mention.id] }));
                                    setEditingReplyId(mention.id);
                                  }}>Edit</Button>
                                )}
                              </div>
                              {editingReplyId === mention.id ? (
                                <textarea
                                  className="w-full border rounded-md p-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4500]"
                                  rows={4}
                                  value={editedReplies[mention.id] || ''}
                                  onChange={e => setEditedReplies(prev => ({ ...prev, [mention.id]: e.target.value }))}
                                />
                              ) : (
                                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{generatedReplies[mention.id]}</p>
                              )}
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Button
                                onClick={() => navigator.clipboard.writeText(generatedReplies[mention.id])}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto"
                                size="sm"
                              >
                                <svg 
                                  className="w-4 h-4" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy
                              </Button>
                              <Button
                                onClick={() => postComment(mention)}
                                disabled={isPosting === mention.id || !!publishedComments[mention.id]}
                                className={`flex items-center gap-2 ${isPosting === mention.id ? 'bg-gray-100 text-gray-500' : publishedComments[mention.id] ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#ff4500] hover:bg-[#ff4500]/90 text-white'} w-full sm:w-auto`}
                                size="sm"
                              >
                                {isPosting === mention.id ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Posting...
                                  </>
                                ) : publishedComments[mention.id] ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Published
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="w-4 h-4" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700 w-full sm:w-auto"
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
                className="ml-auto bg-[#ff4500] hover:bg-[#ff4500]/90 text-xs"
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