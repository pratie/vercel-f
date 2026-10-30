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
import { QueueHeader } from '@/components/mentions/QueueHeader';
import { BTN_PRIMARY, BTN_QUIET, PANEL, STICKER_PANEL } from '@/components/ui/sticker';

/** Mirrors the analytics layout while data loads — no spinner, no jump. */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading analytics">
      <div className={`${STICKER_PANEL} overflow-hidden`}>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-4">
              <div className="h-3 w-20 rounded-full bg-[#f2efeb]" />
              <div className="mt-3 h-8 w-16 rounded-lg bg-[#f2efeb]" />
              <div className="mt-3 h-3 w-24 rounded-full bg-[#f7f5f2]" />
            </div>
          ))}
        </div>
        <div className="border-t-2 border-[#1c1917]/[0.08] p-5">
          <div className="h-[260px] rounded-xl bg-[#f7f5f2] sm:h-[300px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${PANEL} p-5`}>
            <div className="mb-4 h-4 w-28 rounded-full bg-[#f2efeb]" />
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} className="mb-2 h-9 rounded-lg bg-[#f7f5f2]" style={{ width: `${90 - j * 14}%` }} />
            ))}
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
      <div className="mx-auto max-w-[1080px]">
        <QueueHeader
          projectName={project?.name}
          title="Analytics"
          lede="Where your leads come from, how good they are, and how many you answered."
        >
          <button
            type="button"
            onClick={() => {
              try {
                exportMentionsToCSV(mentions, `sneakyguy_analytics_${project?.name || projectId}`);
                toast.success('CSV exported');
              } catch {
                toast.error('Could not export the CSV. Try again.');
              }
            }}
            disabled={isLoading || mentions.length === 0}
            className={BTN_QUIET}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </QueueHeader>

        {/* Content */}
        {isLoading ? (
          <AnalyticsSkeleton />
        ) : mentions.length === 0 ? (
          <div className={`${PANEL} px-6 py-16 text-center`}>
            <div className="mx-auto w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
              <Inbox className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-sm font-medium text-ink-900 mb-1">No leads to analyze yet</p>
            <p className="text-xs text-ink-400 leading-relaxed mb-5 max-w-xs mx-auto">
              Analytics fills in once your first scan finds leads. Start a scan from the leads dashboard.
            </p>
            <Link
              href={`/mentions/${projectId}`}
              className={BTN_PRIMARY}
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
