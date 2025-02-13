// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Loader2, Edit, MessageSquare } from "lucide-react";
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

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleViewMentions = async () => {
    if (!project.keywords.length || !project.subreddits.length) {
      toast.error('Project must have keywords and subreddits to analyze');
      return;
    }

    const CACHE_KEY = `mentions-${project.id}`;
    const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    // Check if we have cached mentions
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { mentions, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (!isExpired && mentions.length > 0) {
        // Process cached data to ensure matching_keywords exists
        const processedMentions = mentions.map((mention: RedditMention) => ({
          ...mention,
          matching_keywords: Array.isArray(mention.matching_keywords) ? 
            mention.matching_keywords : 
            (mention.keyword ? [mention.keyword] : [])
        }));

        // Update cache with processed data
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          mentions: processedMentions,
          timestamp
        }));

        // Use cached data
        router.push(`/mentions/${project.id}`);
        return;
      }
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
          relevance_score: post.relevance_score || post.score || 0
        }));

        // Store the analysis result with timestamp
        const cacheData = {
          mentions: processedPosts,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        // Navigate to mentions page
        router.push(`/mentions/${project.id}`);
      } else {
        toast.info('No matching Reddit posts found for your keywords');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze Reddit posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setLoading(true);
    try {
      await api.deleteProject(project.id);
      // Only call onDelete if the deletion was successful
      onDelete(project.id);
    } catch (error) {
      // Only show error in ProjectCard if it wasn't already handled by the parent
      if (error instanceof Error && !error.message.includes('Failed to delete project')) {
        console.error('Delete project error in card:', error);
        toast.error(error.message);
      }
      throw error; // Re-throw to let parent handle it
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (projectId: string, updatedData: Partial<Project>) => {
    try {
      await api.updateProject(projectId, updatedData);
      // Update the local project data
      project.keywords = updatedData.keywords || project.keywords;
      project.subreddits = updatedData.subreddits || project.subreddits;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg bg-white/70 backdrop-blur-sm border-gray-100/80">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-grow">
            <CardTitle className="text-xl font-semibold line-clamp-2 hover:line-clamp-none transition-all duration-200">
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-3 hover:line-clamp-none transition-all duration-200">
              {project.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <RedditAnalysisLoading />
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Keywords</Label>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 pr-2">
                  {project.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="bg-[#ff4500]/10 text-[#ff4500] hover:bg-[#ff4500]/20 transition-colors"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Subreddits</Label>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 pr-2">
                  {project.subreddits.map((subreddit) => (
                    <Badge
                      key={subreddit}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      r/{subreddit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleViewMentions}
              className="w-full bg-[#ff4500] hover:bg-[#ff4500]/90 text-white transition-colors"
              disabled={loading || !project.keywords.length || !project.subreddits.length}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Mentions
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>

      <CardFooter>
      </CardFooter>

      <EditProjectDialog
        project={project}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditProject}
      />
    </Card>
  );
}