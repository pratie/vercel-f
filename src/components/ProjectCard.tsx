// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Loader2, Edit, MessageSquare, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { api, Project, RedditPost, RedditMention } from '@/lib/api';
import { toast } from 'sonner';
import { EditProjectDialog } from './EditProjectDialog';
import { RedditAnalysisLoading } from './RedditAnalysisLoading';
import { useRedditAuthStore } from '@/lib/redditAuth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCache, setCache } from '@/lib/cacheUtils';
import { isValidRedditUrl, safeJsonParse } from '@/lib/securityUtils';
import { logError } from '@/lib/errorUtils';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState<RedditMention[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const router = useRouter();
  const redditAuth = useRedditAuthStore();

  const handleViewMentions = async () => {
    if (!project.keywords.length || !project.subreddits.length) {
      toast.error('Project must have keywords and subreddits to analyze');
      return;
    }

    // Toggle mentions visibility if already loaded
    if (mentions.length > 0) {
      setShowMentions(!showMentions);
      return;
    }

    const CACHE_KEY = `mentions-${project.id}`;
    const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    // Check if we have cached mentions using the new utility
    const cachedMentions = getCache<{mentions: RedditMention[], timestamp: number}>(CACHE_KEY, CACHE_DURATION);
    
    if (cachedMentions && cachedMentions.mentions.length > 0) {
      // Process cached data to ensure matching_keywords exists
      const processedMentions = cachedMentions.mentions.map((mention: RedditMention) => ({
        ...mention,
        matching_keywords: Array.isArray(mention.matching_keywords) ? 
          mention.matching_keywords : 
          (mention.keyword ? [mention.keyword] : [])
      }))
      // Sort by created_utc in descending order (latest first)
      .sort((a, b) => b.created_utc - a.created_utc);

      // Set mentions and show them
      setMentions(processedMentions);
      setShowMentions(true);
      return;
    }

    setLoading(true);

    try {
      const analysisResult = await api.analyzeReddit({
        brand_id: project.id,
        keywords: project.keywords,
        subreddits: project.subreddits,
        time_period: 'month',
        limit: 100,
      });

      if (analysisResult.status === 'success' && analysisResult.posts.length > 0) {
        // Process posts to ensure consistent data structure
        const processedPosts = analysisResult.posts.map(post => ({
          ...post,
          matching_keywords: Array.isArray(post.matching_keywords) ? 
            post.matching_keywords : [],
          relevance_score: post.relevance_score || post.score || 0,
          formatted_date: new Date(post.created_utc * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }))
        // Sort by created_utc in descending order (latest first)
        .sort((a, b) => b.created_utc - a.created_utc);

        // Store the analysis result with timestamp using the new utility
        setCache(CACHE_KEY, {
          mentions: processedPosts,
          timestamp: Date.now()
        }, CACHE_DURATION);
        
        // Set mentions and show them
        setMentions(processedPosts);
        setShowMentions(true);
      } else {
        toast.info('No matching Reddit posts found for your keywords');
      }
    } catch (error) {
      logError(error, 'ProjectCard.handleViewMentions');
      toast.error(error instanceof Error ? error.message : 'Failed to analyze Reddit posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      return;
    }

    try {
      await api.deleteProject(project.id);
      toast.success('Project deleted successfully');
      onDelete?.(project.id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleEdit = async (updatedProject: Project) => {
    try {
      await api.updateProject(project.id, updatedProject);
      toast.success('Project updated successfully');
      
      // Refresh the page to show updated project instead of using onDelete
      window.location.reload();
      
      // Close the edit dialog
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project. Please try again.');
      throw error;
    }
  };

  const openRedditPost = (url: string) => {
    // Validate URL before opening
    if (isValidRedditUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Invalid Reddit URL');
      logError(new Error(`Invalid Reddit URL: ${url}`), 'ProjectCard.openRedditPost');
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5">
                <DropdownMenuItem 
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center p-2 cursor-pointer rounded-md hover:bg-orange-50 focus:bg-orange-50 text-gray-700"
                >
                  <Edit className="mr-2 h-4 w-4 text-orange-500" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  className="flex items-center p-2 cursor-pointer rounded-md hover:bg-red-50 focus:bg-red-50 text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-500">Keywords</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {project.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Subreddits</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {project.subreddits.map((subreddit, index) => (
                  <Badge key={index} variant="outline" className="text-blue-600 border-blue-300">
                    r/{subreddit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex flex-col w-full">
          <Button 
            onClick={handleViewMentions} 
            className="w-full" 
            variant="default"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Reddit...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                {showMentions && mentions.length > 0 ? 'Hide Mentions' : 'View Mentions'}
              </>
            )}
          </Button>
          
          {loading && (
            <div className="mt-4 w-full">
              <RedditAnalysisLoading />
            </div>
          )}
          
          {showMentions && mentions.length > 0 && (
            <div className="mt-4 w-full">
              <Accordion type="single" collapsible className="w-full">
                {mentions.slice(0, 5).map((mention, index) => (
                  <AccordionItem key={index} value={`mention-${index}`} className="border border-gray-200 rounded-md mb-2">
                    <AccordionTrigger className="px-3 py-2 hover:bg-gray-50">
                      <div className="flex flex-col items-start text-left">
                        <div className="font-medium text-sm line-clamp-1">{mention.title}</div>
                        <div className="text-xs text-gray-500">
                          r/{mention.subreddit} • {mention.formatted_date}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="space-y-2">
                        <p className="text-sm line-clamp-3">{mention.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {mention.matching_keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openRedditPost(mention.url)}
                            className="text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View on Reddit
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {mentions.length > 5 && (
                <Button 
                  variant="link" 
                  className="w-full mt-2 text-sm text-blue-600"
                  onClick={() => router.push(`/mentions/${project.id}`)}
                >
                  View all {mentions.length} mentions
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
      
      <EditProjectDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        project={project} 
        onSave={handleEdit} 
      />
    </div>
  );
}