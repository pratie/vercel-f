'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { toast, Toaster } from 'sonner';
import { PaymentGuard } from '@/components/PaymentGuard';
import { MentionsAnalytics } from '@/components/MentionsAnalytics';

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
  intent?: string;
}

interface RedditMention {
  id: number;
  brand_id: number;
  title: string;
  subreddit: string;
  relevance_score: number;
  matching_keywords: string[];
  intent?: string;
  num_comments: number;
  score: number;
  created_utc: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  subreddits: string[];
}

const transformRawMention = (mention: RawMention): RedditMention => ({
  id: mention.id,
  brand_id: mention.brand_id,
  title: mention.title,
  subreddit: mention.subreddit,
  relevance_score: mention.relevance_score,
  matching_keywords: Array.isArray(mention.matching_keywords)
    ? mention.matching_keywords
    : (mention.keyword ? [mention.keyword] : []),
  intent: mention.intent,
  num_comments: mention.num_comments,
  score: mention.score,
  created_utc: mention.created_utc,
});

export default function AnalyticsPage() {
  const [mentions, setMentions] = useState<RedditMention[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  useEffect(() => {
    if (!user) { router.push('/login'); return; }

    if (projectId && !isNaN(parseInt(projectId, 10))) {
      setIsLoading(true);
      Promise.all([
        api.getProject(projectId),
        api.getMentions(projectId, 0, 5000),
      ])
        .then(([projectData, rawMentions]) => {
          setProject(projectData);
          const transformed = rawMentions.map(transformRawMention);
          setMentions(transformed);
        })
        .catch(error => {
          console.error('Error loading analytics data:', error);
          toast.error('Failed to load analytics data.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [projectId, user, router]);

  const exportToCSV = () => {
    try {
      const headers = ['Subreddit', 'Score', 'Comments', 'Relevance', 'Intent', 'Keywords', 'Date'].join(',');
      const rows = mentions.map(m => [
        `"r/${m.subreddit}"`,
        m.score,
        m.num_comments,
        m.relevance_score,
        `"${m.intent || ''}"`,
        `"${m.matching_keywords.join('; ')}"`,
        `"${new Date(m.created_utc * 1000).toLocaleDateString()}"`,
      ].join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `analytics_${project?.name || projectId}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <PaymentGuard>
      <div className="max-w-5xl mx-auto px-4 py-4" style={{ WebkitFontSmoothing: 'antialiased' } as any}>
        <Toaster position="top-center" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/mentions/${projectId}`)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Leads
            </button>
            {project && (
              <>
                <span className="text-gray-200">/</span>
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{project.name}</span>
                <span className="text-gray-200">/</span>
                <span className="text-sm font-medium text-gray-500">Analytics</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={isLoading || mentions.length === 0}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color] disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 mb-3" />
            <p className="text-xs text-gray-400">Loading analytics...</p>
          </div>
        ) : mentions.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-gray-900 mb-1">No data yet</p>
            <p className="text-xs text-gray-400">Run a scan from the leads page to generate analytics.</p>
          </div>
        ) : project ? (
          <MentionsAnalytics mentions={mentions} keywords={project.keywords || []} />
        ) : null}
      </div>
    </PaymentGuard>
  );
}
