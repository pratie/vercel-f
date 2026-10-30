// src/components/ProjectCard.tsx
import { useState } from 'react';
import { Trash2, Loader2, Pencil, ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Project } from '@/lib/api';
import { toast } from 'sonner';
import { EditProjectDialog } from './EditProjectDialog';
import { logError } from '@/lib/errorUtils';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  /** Open the edit dialog on mount (from a /projects?edit=<id> link). */
  startEditing?: boolean;
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

export function ProjectCard({ project: initialProject, onDelete, startEditing = false }: ProjectCardProps) {
  // Local copy so an edit updates the card in place instead of reloading the page.
  const [project, setProject] = useState(initialProject);
  const [isEditOpen, setIsEditOpen] = useState(startEditing);
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
        className="w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-[#1c1917] bg-white shadow-[4px_4px_0_#1c1917] transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_#1c1917] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        <div className="p-5">
          {/* Identity row */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-play text-[14px] font-extrabold text-white ${projectDot(project.name)}`} aria-hidden="true">
              {(project.name.trim()[0] || '?').toUpperCase()}
            </span>
            <h3 className="min-w-0 flex-1 truncate font-play text-[18px] font-bold tracking-[-0.015em] text-ink-900">
              {project.name}
            </h3>
            {project.analysis_status === 'scanning' ? (
              <span className="flex shrink-0 items-center gap-1.5 text-[#b83200]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
                </span>
                <span className="text-[11.5px] font-semibold">
                  Scanning <span className="tabular-nums">{project.analysis_progress}%</span>
                </span>
              </span>
            ) : project.last_analyzed ? (
              <span className="text-[11px] text-ink-400 shrink-0">{updatedLabel(project.last_analyzed)}</span>
            ) : null}
          </div>

          {project.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-ink-600 line-clamp-2">{project.description}</p>
          )}

          {/* Where it's watching */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            {shownSubreddits.map((subreddit) => (
              <span key={subreddit} className="chip bg-[#ff4500]/[0.1] text-[11.5px] text-[#b83200]">
                r/{subreddit}
              </span>
            ))}
            {moreSubreddits > 0 && (
              <span className="chip bg-cream text-[11.5px] text-ink-600">+{moreSubreddits}</span>
            )}
            <span className="ml-1 text-[12px] text-ink-400">
              {project.keywords.length} keywords
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t-2 border-[#1c1917]/[0.08] bg-[#fcfbf9] px-5 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#b83200] transition-[gap] duration-200 group-hover:gap-2.5 motion-reduce:transition-none">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Opening
                </>
              ) : (
                <>
                  View leads
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </span>
            {/* Secondary destination. Stops propagation so it never fires the card's leads action. */}
            <Link
              href={`/mentions/${project.id}/seo`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-ink-600 transition-colors duration-150 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50"
              aria-label={`Open SEO opportunities for ${project.name}`}
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              SEO opportunities
            </Link>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
              className="rounded-lg p-2 text-ink-400 transition-colors duration-150 hover:bg-cream hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50"
              aria-label={`Edit ${project.name}`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              className="rounded-lg p-2 text-ink-400 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50"
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
