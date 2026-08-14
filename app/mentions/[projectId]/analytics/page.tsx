'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { api, Project } from '@/lib/api';
import { PaymentGuard } from '@/components/PaymentGuard';
import { Mention, transformRawMention, exportMentionsToCSV } from '@/lib/mentions';
import { MentionsAnalytics } from '@/components/MentionsAnalytics';

/** Mirrors the analytics layout while data loads — no spinner, no jump. */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-hidden="true">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-5">
            <div className="h-2.5 w-20 bg-cream rounded-full mb-4" />
            <div className="h-7 w-14 bg-cream rounded-lg mb-2" />
            <div className="h-2.5 w-24 bg-cream/70 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-6">
            <div className="h-2.5 w-28 bg-cream rounded-full mb-5" />
            <div className="h-[190px] bg-cream/60 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-6">
            <div className="h-2.5 w-32 bg-cream rounded-full mb-5" />
            <div className="space-y-4">
              {[0, 1, 2, 3].map((j) => (
                <div key={j}>
                  <div className="h-2.5 w-3/4 bg-cream/70 rounded-full mb-2" />
                  <div className="h-1.5 w-full bg-cream rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (projectId && !isNaN(parseInt(projectId, 10))) {
      setIsLoading(true);
      Promise.all([api.getProject(projectId), api.getMentions(projectId, 0, 5000)])
        .then(([projectData, rawMentions]) => {
          setProject(projectData);
          setMentions(rawMentions.map(transformRawMention));
        })
        .catch((error) => {
          console.error('Error loading analytics data:', error);
          toast.error('Failed to load analytics data.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [projectId, user, router]);

  return (
    <PaymentGuard>
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Header — breadcrumb back to the leads dashboard */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/mentions/${projectId}`}
              className="flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-ink-700 transition-colors duration-200 group shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Leads
            </Link>
            {project && (
              <>
                <span className="text-ink-300/60">/</span>
                <span className="text-sm font-semibold text-ink-900 truncate max-w-[200px]">{project.name}</span>
                <span className="text-ink-300/60">/</span>
                <span className="text-sm font-medium text-ink-600 shrink-0">Analytics</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isLoading && mentions.length > 0 && (
              <span className="text-xs text-ink-600 tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {mentions.length.toLocaleString()} {mentions.length === 1 ? 'lead' : 'leads'}
              </span>
            )}
            <button
              onClick={() => {
                try {
                  exportMentionsToCSV(mentions, `sneakyguy_analytics_${project?.name || projectId}`);
                  toast.success('CSV exported');
                } catch {
                  toast.error('Failed to export CSV');
                }
              }}
              disabled={isLoading || mentions.length === 0}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-white shadow-card text-xs font-medium text-ink-600 hover:bg-orange-50/60 hover:text-ink-900 hover:shadow-card-hover transition-all duration-200 disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <AnalyticsSkeleton />
        ) : mentions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-card">
            <div className="mx-auto w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
              <Inbox className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-sm font-medium text-ink-900 mb-1">No leads to analyze yet</p>
            <p className="text-xs text-ink-400 leading-relaxed mb-5 max-w-xs mx-auto">
              Analytics fills in once your first scan finds leads. Start a scan from the leads dashboard.
            </p>
            <Link
              href={`/mentions/${projectId}`}
              className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-xl bg-orange-500 text-white text-xs font-semibold shadow-orange hover:bg-orange-600 transition-all duration-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to leads
            </Link>
          </div>
        ) : project ? (
          <MentionsAnalytics mentions={mentions} keywords={project.keywords || []} projectId={projectId} />
        ) : null}
      </div>
    </PaymentGuard>
  );
}
