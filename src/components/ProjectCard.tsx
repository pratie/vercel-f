// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Loader2, Edit, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { api, Project } from '@/lib/api';
import { toast } from 'sonner';
import { EditProjectDialog } from './EditProjectDialog';
import { RedditAnalysisLoading } from './RedditAnalysisLoading';
import { isValidRedditUrl } from '@/lib/securityUtils';
import { logError } from '@/lib/errorUtils';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [showAllSubreddits, setShowAllSubreddits] = useState(false);
  const router = useRouter();

  const handleViewMentions = async () => {
    if (!project.keywords.length || !project.subreddits.length) {
      toast.error('Project must have keywords and subreddits to analyze');
      return;
    }

    setLoading(true);
    try {
      // Try to trigger a scan in the background to ensure data is fresh.
      // We don't wait for this to finish before navigating, as the Mentions page
      // handles its own polling and status display.
      api.analyzeReddit({
        brand_id: project.id,
        keywords: project.keywords,
        subreddits: project.subreddits,
        time_period: 'month',
        limit: 100,
      }).catch(err => {
        console.warn('Background scan trigger status:', err);
      });

      // Always navigate to the full dashboard immediately
      router.push(`/mentions/${project.id}`);
    } catch (error) {
      logError(error, 'ProjectCard.handleViewMentions');
      toast.error('Could not open dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      return;
    }
    onDelete?.(project.id);
  };

  const handleEdit = async (updatedProject: Project) => {
    try {
      await api.updateProject(project.id, updatedProject);
      toast.success('Project updated successfully');
      window.location.reload();
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project. Please try again.');
    }
  };

  const openRedditPost = (url: string) => {
    if (isValidRedditUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Invalid Reddit URL');
    }
  };

  return (
    <div className="w-full group">
      <Card className="w-full border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-[hsl(var(--primary))] transition-colors">
                {project.name}
              </CardTitle>
              {project.analysis_status === 'scanning' ? (
                <div className="flex items-center gap-2 px-2 py-1 bg-orange-50 rounded-full border border-orange-100 w-fit">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                    Scanning {project.analysis_progress}%
                  </span>
                </div>
              ) : project.last_analyzed ? (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Last active: {new Date(project.last_analyzed).toLocaleDateString()}
                </span>
              ) : null}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5">
                <DropdownMenuItem
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center p-2 cursor-pointer rounded-md hover:bg-[hsl(var(--secondary))] focus:bg-[hsl(var(--secondary))] text-gray-700"
                >
                  <Edit className="mr-2 h-4 w-4 text-[hsl(var(--primary))]" />
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
          <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Keywords</Label>
                {project.keywords.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowAllKeywords(!showAllKeywords)}
                  >
                    {showAllKeywords ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 transition-all duration-300">
                {(showAllKeywords ? project.keywords : project.keywords.slice(0, 5)).map((keyword, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100 font-bold uppercase tracking-widest text-[9px]"
                  >
                    #{keyword}
                  </div>
                ))}
                {!showAllKeywords && project.keywords.length > 5 && (
                  <div className="text-[9px] font-bold text-gray-400 mt-1">+{project.keywords.length - 5} more</div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Target Subreddits</Label>
                {project.subreddits.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowAllSubreddits(!showAllSubreddits)}
                  >
                    {showAllSubreddits ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 transition-all duration-300">
                {(showAllSubreddits ? project.subreddits : project.subreddits.slice(0, 5)).map((subreddit, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 rounded-md bg-blue-50/50 text-blue-600 border border-blue-100/50 font-bold uppercase tracking-widest text-[9px]"
                  >
                    r/{subreddit}
                  </div>
                ))}
                {!showAllSubreddits && project.subreddits.length > 5 && (
                  <div className="text-[9px] font-bold text-gray-400 mt-1">+{project.subreddits.length - 5} more</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-6 flex flex-col w-full">
          <Button
            onClick={handleViewMentions}
            className="w-full h-12 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:shadow-lg hover:-translate-y-0.5 text-white font-bold transition-all duration-300 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Enter Dashboard
              </>
            )}
          </Button>

          {loading && (
            <div className="mt-4 w-full">
              <RedditAnalysisLoading />
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