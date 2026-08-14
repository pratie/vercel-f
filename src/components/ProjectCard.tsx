// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Trash2, Loader2, Edit, ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';
import { api, Project } from '@/lib/api';
import { toast } from 'sonner';
import { EditProjectDialog } from './EditProjectDialog';
import { logError } from '@/lib/errorUtils';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
}

// Same hash + palette as the sidebar quick-switcher, so a project keeps one
// identity color everywhere.
const DOT_PALETTE = ['bg-orange-500', 'bg-amber-500', 'bg-rose-400', 'bg-violet-400', 'bg-teal-500'];
function projectDot(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return DOT_PALETTE[hash % DOT_PALETTE.length];
}

const VISIBLE_SUBREDDITS = 3;

function updatedLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  if (days < 7) return `Updated ${days} days ago`;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return `Updated ${d.toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export function ProjectCard({ project: initialProject, onDelete }: ProjectCardProps) {
  // Local copy so an edit updates the card in place instead of reloading the page.
  const [project, setProject] = useState(initialProject);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const shownSubreddits = project.subreddits.slice(0, VISIBLE_SUBREDDITS);
  const moreSubreddits = project.subreddits.length - shownSubreddits.length;

  return (
    <div className="w-full group">
      {/* The whole card is the "view leads" action; edit/delete stop propagation. */}
      <div
        role="link"
        tabIndex={0}
        aria-label={`Open leads for ${project.name}`}
        onClick={handleViewMentions}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewMentions(); } }}
        className="premium-card w-full overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
      >
        <div className="p-5">
          {/* Identity row */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${projectDot(project.name)}`} aria-hidden="true" />
            <h3 className="text-[15.5px] font-semibold text-ink-900 tracking-tight truncate flex-1">
              {project.name}
            </h3>
            {project.analysis_status === 'scanning' ? (
              <span className="flex items-center gap-1.5 text-orange-600 shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  Scanning <span className="tabular-nums">{project.analysis_progress}%</span>
                </span>
              </span>
            ) : project.last_analyzed ? (
              <span className="text-[11px] text-ink-400 shrink-0">{updatedLabel(project.last_analyzed)}</span>
            ) : null}
          </div>

          {project.description && (
            <p className="text-[13px] text-ink-600 mt-2 line-clamp-1 leading-relaxed">{project.description}</p>
          )}

          {/* Where it's watching */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {shownSubreddits.map((subreddit) => (
              <span key={subreddit} className="chip bg-orange-50 text-orange-700 text-[11px]">
                r/{subreddit}
              </span>
            ))}
            {moreSubreddits > 0 && (
              <span className="chip bg-cream text-ink-400 text-[11px]">+{moreSubreddits}</span>
            )}
            <span className="text-[11px] text-ink-400 ml-1">
              · {project.keywords.length} keywords
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#f0e9dd] flex items-center justify-between bg-[#fdfbf8]">
          <span className="inline-flex items-center gap-1.5 group-hover:gap-2.5 text-[13px] font-semibold text-orange-600 transition-all duration-200">
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Opening…
              </>
            ) : (
              <>
                View leads
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
              className="p-1.5 rounded-lg text-ink-300 hover:text-ink-600 hover:bg-cream transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
              aria-label={`Edit ${project.name}`}
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
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
