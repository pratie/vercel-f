// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Trash2, Loader2, Edit, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';
import { api, Project } from '@/lib/api';
import { toast } from 'sonner';
import { EditProjectDialog } from './EditProjectDialog';
import { isValidRedditUrl } from '@/lib/securityUtils';
import { logError } from '@/lib/errorUtils';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

const VISIBLE_CHIPS = 4;

export function ProjectCard({ project: initialProject, onDelete }: ProjectCardProps) {
  // Local copy so an edit updates the card in place instead of reloading the page.
  const [project, setProject] = useState(initialProject);
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
      const saved = await api.updateProject(project.id, updatedProject);
      setProject(saved);
      setIsEditOpen(false);
      toast.success('Project updated');
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
      <div className="premium-card w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h3 className="text-base font-semibold text-ink-900 tracking-tight truncate" style={{ textWrap: 'balance' } as any}>
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
              <span className="text-[11px] text-ink-400">
                Updated {new Date(project.last_analyzed).toLocaleDateString()}
              </span>
            ) : null}
          </div>
          {project.description && (
            <p className="text-[13.5px] text-ink-600 mt-1.5 line-clamp-2 leading-relaxed">{project.description}</p>
          )}
        </div>

        {/* Tags */}
        <div className="px-5 pb-4 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-[0.08em]">Keywords</span>
              {showAllKeywords && project.keywords.length > VISIBLE_CHIPS && (
                <button
                  onClick={() => setShowAllKeywords(false)}
                  className="text-ink-300 hover:text-ink-600 transition-colors duration-150"
                  aria-label="Show fewer keywords"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(showAllKeywords ? project.keywords : project.keywords.slice(0, VISIBLE_CHIPS)).map((keyword, index) => (
                <span key={index} className="chip bg-cream text-ink-700 text-[11px]">
                  {keyword}
                </span>
              ))}
              {!showAllKeywords && project.keywords.length > VISIBLE_CHIPS && (
                <button
                  onClick={() => setShowAllKeywords(true)}
                  className="chip bg-white text-ink-400 shadow-card hover:text-ink-600 hover:shadow-card-hover transition-all duration-200 text-[11px]"
                  aria-label="Show all keywords"
                >
                  +{project.keywords.length - VISIBLE_CHIPS} more
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-[0.08em]">Subreddits</span>
              {showAllSubreddits && project.subreddits.length > VISIBLE_CHIPS && (
                <button
                  onClick={() => setShowAllSubreddits(false)}
                  className="text-ink-300 hover:text-ink-600 transition-colors duration-150"
                  aria-label="Show fewer subreddits"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(showAllSubreddits ? project.subreddits : project.subreddits.slice(0, VISIBLE_CHIPS)).map((subreddit, index) => (
                <span key={index} className="chip bg-orange-50 text-orange-700 text-[11px]">
                  r/{subreddit}
                </span>
              ))}
              {!showAllSubreddits && project.subreddits.length > VISIBLE_CHIPS && (
                <button
                  onClick={() => setShowAllSubreddits(true)}
                  className="chip bg-white text-ink-400 shadow-card hover:text-ink-600 hover:shadow-card-hover transition-all duration-200 text-[11px]"
                  aria-label="Show all subreddits"
                >
                  +{project.subreddits.length - VISIBLE_CHIPS} more
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#f0e9dd] flex items-center justify-between">
          <button
            onClick={handleViewMentions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 hover:gap-2.5 text-[13px] font-semibold text-orange-600 hover:text-orange-700 transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 rounded-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                View leads
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 rounded-lg text-ink-300 hover:text-ink-600 hover:bg-cream transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
              aria-label={`Edit ${project.name}`}
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-ink-300 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
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
