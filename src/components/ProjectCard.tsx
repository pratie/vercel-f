// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Loader2, Edit, MessageSquare, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
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
      api.analyzeReddit({
        brand_id: project.id,
        keywords: project.keywords,
        subreddits: project.subreddits,
        time_period: 'month',
        limit: 100,
      }).catch(err => {
        console.warn('Background scan trigger status:', err);
      });

      router.push(`/mentions/${project.id}`);
    } catch (error) {
      logError(error, 'ProjectCard.handleViewMentions');
      toast.error('Could not open dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${project.name}?`)) return;
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
    <div className="w-full group" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' } as any}>
      <div className="w-full bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[box-shadow,transform] duration-300 ease-out overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 tracking-tight truncate" style={{ textWrap: 'balance' } as any}>
                {project.name}
              </h3>
              {project.analysis_status === 'scanning' ? (
                <div className="flex items-center gap-1.5 text-orange-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Scanning <span className="tabular-nums">{project.analysis_progress}%</span>
                  </span>
                </div>
              ) : project.last_analyzed ? (
                <span className="text-[11px] text-gray-400">
                  Updated {new Date(project.last_analyzed).toLocaleDateString()}
                </span>
              ) : null}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 -mr-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 p-1">
                <DropdownMenuItem
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-md text-[13px] text-gray-600 hover:text-gray-900"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer rounded-md text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {project.description && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{project.description}</p>
          )}
        </div>

        {/* Tags */}
        <div className="px-5 pb-4 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Keywords</span>
              {project.keywords.length > 5 && (
                <button
                  onClick={() => setShowAllKeywords(!showAllKeywords)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showAllKeywords ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {(showAllKeywords ? project.keywords : project.keywords.slice(0, 5)).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] text-[10px] font-medium"
                >
                  {keyword}
                </span>
              ))}
              {!showAllKeywords && project.keywords.length > 5 && (
                <span className="text-[10px] text-gray-400 self-center">+{project.keywords.length - 5}</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Subreddits</span>
              {project.subreddits.length > 5 && (
                <button
                  onClick={() => setShowAllSubreddits(!showAllSubreddits)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showAllSubreddits ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {(showAllSubreddits ? project.subreddits : project.subreddits.slice(0, 5)).map((subreddit, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-md bg-blue-50/60 text-blue-600 shadow-[0_0_0_1px_rgba(59,130,246,0.1)] text-[10px] font-medium"
                >
                  r/{subreddit}
                </span>
              ))}
              {!showAllSubreddits && project.subreddits.length > 5 && (
                <span className="text-[10px] text-gray-400 self-center">+{project.subreddits.length - 5}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="px-5 pb-5">
          <Button
            onClick={handleViewMentions}
            className="w-full h-9 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-[background-color,box-shadow,transform] duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)] group"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Open Dashboard
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>

          {loading && (
            <div className="mt-3">
              <RedditAnalysisLoading />
            </div>
          )}
        </div>
      </div>

      <EditProjectDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        project={project}
        onSave={handleEdit}
      />
    </div>
  );
}
