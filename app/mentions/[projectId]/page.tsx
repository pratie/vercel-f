'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, BarChart3, Download, RefreshCw, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { api, Project } from '@/lib/api';
import { useRedditAuthStore } from '@/lib/redditAuth';
import { PaymentGuard } from '@/components/PaymentGuard';
import {
  Mention, transformRawMention, isUnscored, isHighIntent, exportMentionsToCSV,
} from '@/lib/mentions';
import { MentionCard } from '@/components/mentions/MentionCard';
import { ScanBanner } from '@/components/mentions/ScanBanner';
import { StatsStrip, MentionStats } from '@/components/mentions/StatsStrip';
import { FilterBar, MentionFilters, DEFAULT_FILTERS, SortKey, TriageTab } from '@/components/mentions/FilterBar';

const MENTIONS_PER_PAGE = 25;
const SCAN_POLL_MS = 3000;

type ScanStatus = 'idle' | 'scanning' | 'completed' | 'failed';

export default function MentionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;
  const redditAuth = useRedditAuthStore();

  const [allMentions, setAllMentions] = useState<Mention[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(MENTIONS_PER_PAGE);

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');

  const [viewedPosts, setViewedPosts] = useState<Set<number>>(new Set());
  const [publishedComments, setPublishedComments] = useState<Record<number, string>>({});
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [rescoring, setRescoring] = useState(false);

  // Filters initialise from the URL so filtered views survive refresh and can be shared.
  const [filters, setFilters] = useState<MentionFilters>(() => ({
    query: searchParams?.get('q') ?? DEFAULT_FILTERS.query,
    subreddit: searchParams?.get('sr') ?? DEFAULT_FILTERS.subreddit,
    intent: searchParams?.get('intent') ?? DEFAULT_FILTERS.intent,
    sort: (searchParams?.get('sort') as SortKey) ?? DEFAULT_FILTERS.sort,
    tab: (searchParams?.get('tab') as TriageTab) ?? DEFAULT_FILTERS.tab,
  }));

  const updateFilters = useCallback((next: Partial<MentionFilters>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...next };
      const url = new URL(window.location.href);
      const set = (key: string, value: string, def: string) => {
        if (value && value !== def) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      };
      set('q', merged.query, DEFAULT_FILTERS.query);
      set('sr', merged.subreddit, DEFAULT_FILTERS.subreddit);
      set('intent', merged.intent, DEFAULT_FILTERS.intent);
      set('sort', merged.sort, DEFAULT_FILTERS.sort);
      set('tab', merged.tab, DEFAULT_FILTERS.tab);
      window.history.replaceState(null, '', url.toString());
      return merged;
    });
    setVisibleCount(MENTIONS_PER_PAGE);
  }, []);

  // ---- Local triage state (persisted per project) ----
  useEffect(() => {
    if (!projectId) return;
    try {
      const viewed = JSON.parse(localStorage.getItem(`viewedPosts_${projectId}`) || '[]');
      if (Array.isArray(viewed)) setViewedPosts(new Set(viewed));
    } catch { /* corrupted state — start fresh */ }
    try {
      setPublishedComments(JSON.parse(localStorage.getItem(`published-comments-${projectId}`) || '{}'));
    } catch { /* corrupted state — start fresh */ }
  }, [projectId]);

  const markViewed = useCallback((id: number) => {
    setViewedPosts((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      localStorage.setItem(`viewedPosts_${projectId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [projectId]);

  const markPublished = useCallback((id: number, commentUrl: string) => {
    setPublishedComments((prev) => {
      const next = { ...prev, [id]: commentUrl };
      localStorage.setItem(`published-comments-${projectId}`, JSON.stringify(next));
      return next;
    });
    setQuota((q) => (q ? { ...q, used: q.used + 1, remaining: Math.max(0, q.remaining - 1) } : q));
  }, [projectId]);

  // ---- Data loading ----
  const loadMentions = useCallback(async () => {
    const raw = await api.getMentions(projectId, 0, 5000);
    const transformed = raw.map(transformRawMention);
    setAllMentions(transformed);
    return transformed;
  }, [projectId]);

  const startScan = useCallback(async (silent = false) => {
    if (!projectId) return;
    try {
      const response = await api.analyzeReddit({
        brand_id: projectId,
        keywords: project?.keywords || [],
        subreddits: project?.subreddits || [],
        time_period: 'month',
        limit: 1000,
      });
      if (response.status === 'started') {
        setScanStatus('scanning');
        setScanProgress(0);
        setScanMessage('Starting scan…');
        if (!silent) toast.info('Scanning Reddit for new leads');
      } else if (response.status === 'already_running') {
        setScanStatus('scanning');
        if (!silent) toast.warning('A scan is already in progress');
      } else if (response.status === 'cooldown') {
        if (!silent) toast.error(response.message || 'Scans are limited to once every 10 minutes');
      }
    } catch (error) {
      if (!silent) toast.error('Failed to start scan', { description: error instanceof Error ? error.message : undefined });
    }
  }, [projectId, project]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!projectId || isNaN(parseInt(projectId, 10))) {
      toast.error('Invalid project');
      router.push('/projects');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const projectData = await api.getProject(projectId);
        if (cancelled) return;
        setProject(projectData);
        setScanStatus((projectData.analysis_status as ScanStatus) || 'idle');
        setScanProgress(projectData.analysis_progress || 0);
        setScanMessage(projectData.analysis_status_message || '');

        const transformed = await loadMentions();
        if (cancelled) return;

        // Brand-new project: kick off the first scan automatically.
        if (transformed.length === 0 && projectData.analysis_status === 'idle') {
          startScan(true);
          setScanStatus('scanning');
          setScanMessage('Running your first Reddit scan…');
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load this project.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    api.getReplyQuota().then(setQuota).catch(() => setQuota(null));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  // ---- Scan polling: setTimeout chain, paused while the tab is hidden ----
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (scanStatus !== 'scanning' || !projectId) return;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (document.hidden) {
        pollTimer.current = setTimeout(tick, SCAN_POLL_MS);
        return;
      }
      try {
        const updated = await api.getProject(projectId);
        if (stopped) return;
        setScanProgress(updated.analysis_progress || 0);
        setScanMessage(updated.analysis_status_message || '');
        const status = (updated.analysis_status as ScanStatus) || 'idle';
        if (status === 'completed' || status === 'failed') {
          setScanStatus(status);
          const before = allMentions.length;
          const after = await loadMentions();
          if (status === 'completed') {
            const found = after.length - before;
            toast.success(found > 0 ? `Scan complete — ${found} new lead${found === 1 ? '' : 's'}` : 'Scan complete — no new leads this time');
          } else {
            toast.error('Scan failed', { description: updated.analysis_status_message || 'Try again in a few minutes.' });
          }
          return;
        }
      } catch { /* transient poll error — keep trying */ }
      pollTimer.current = setTimeout(tick, SCAN_POLL_MS);
    };

    pollTimer.current = setTimeout(tick, SCAN_POLL_MS);
    return () => {
      stopped = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanStatus, projectId]);

  // ---- Re-scoring placeholder leads ----
  const handleRescore = useCallback(async () => {
    if (rescoring) return;
    setRescoring(true);
    try {
      const res = await api.rescoreMentions(projectId);
      if (res.status === 'started') {
        toast.success(`Scoring ${res.count} leads with AI`, { description: 'This runs in the background — results appear as they finish.' });
        // Refresh periodically while the background job works through the batch.
        let runs = 0;
        const interval = setInterval(async () => {
          runs += 1;
          try {
            const refreshed = await loadMentions();
            if (runs >= 15 || refreshed.every((m) => !isUnscored(m))) {
              clearInterval(interval);
              setRescoring(false);
            }
          } catch { /* keep trying until the cap */ }
        }, 20_000);
      } else if (res.status === 'already_running') {
        toast.info('Scoring is already running — results appear as they finish.');
        setRescoring(false);
      } else {
        toast.info('All leads are already scored.');
        setRescoring(false);
      }
    } catch (error) {
      toast.error('Could not start scoring', { description: error instanceof Error ? error.message : undefined });
      setRescoring(false);
    }
  }, [projectId, rescoring, loadMentions]);

  // ---- Derived data (memoised — the old page recomputed all of this every keystroke, twice) ----
  const availableSubreddits = useMemo(
    () => Array.from(new Set(allMentions.map((m) => m.subreddit))).sort(),
    [allMentions]
  );
  const availableIntents = useMemo(
    () => Array.from(new Set(allMentions.map((m) => m.intent).filter(Boolean))) as string[],
    [allMentions]
  );

  const triageCounts = useMemo(() => {
    const replied = allMentions.filter((m) => publishedComments[m.id]).length;
    const unread = allMentions.filter((m) => !viewedPosts.has(m.id) && !publishedComments[m.id]).length;
    return { all: allMentions.length, unread, replied };
  }, [allMentions, viewedPosts, publishedComments]);

  const filteredAll = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return allMentions
      .filter((m) => {
        if (filters.tab === 'unread' && (viewedPosts.has(m.id) || publishedComments[m.id])) return false;
        if (filters.tab === 'replied' && !publishedComments[m.id]) return false;
        if (q && !m.title.toLowerCase().includes(q) && !m.content.toLowerCase().includes(q)) return false;
        if (filters.subreddit !== 'all' && m.subreddit !== filters.subreddit) return false;
        if (filters.intent !== 'all' && (m.intent || '') !== filters.intent) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'new') return b.created_utc - a.created_utc;
        if (filters.sort === 'comments') return b.num_comments - a.num_comments;
        if (filters.sort === 'upvotes') return b.score - a.score;
        // Best match: real scores first, placeholder/unscored sink to the bottom.
        const scoreOf = (m: Mention) => (isUnscored(m) ? -1 : m.relevance_score ?? -1);
        return scoreOf(b) - scoreOf(a);
      });
  }, [allMentions, filters, viewedPosts, publishedComments]);

  const displayMentions = filteredAll.slice(0, visibleCount);

  const stats: MentionStats = useMemo(() => {
    const scored = allMentions.filter((m) => !isUnscored(m));
    const dayAgo = Date.now() / 1000 - 86_400;
    const bySubreddit = allMentions.reduce((acc, m) => {
      acc[m.subreddit] = (acc[m.subreddit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const top = Object.entries(bySubreddit).sort((a, b) => b[1] - a[1])[0];
    return {
      total: allMentions.length,
      newLast24h: allMentions.filter((m) => m.created_utc > dayAgo).length,
      avgRelevance: scored.length
        ? Math.round(scored.reduce((acc, m) => acc + (m.relevance_score || 0), 0) / scored.length)
        : null,
      highIntent: allMentions.filter(isHighIntent).length,
      topSubreddit: top ? top[0] : null,
      unscored: allMentions.filter(isUnscored).length,
    };
  }, [allMentions]);

  return (
    <PaymentGuard>
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Top bar */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-ink-700 transition-colors group mb-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Projects
          </button>
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold text-ink-900 tracking-tight truncate leading-tight">
                {project ? project.name : ' '}
              </h1>
              {allMentions.length > 0 && (
                <p className="text-[12.5px] text-ink-400 mt-0.5">
                  <span className="font-semibold text-ink-600 tabular-nums">{allMentions.length}</span> conversations found across{' '}
                  <span className="font-semibold text-ink-600 tabular-nums">{availableSubreddits.length}</span> communities
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startScan()}
                disabled={scanStatus === 'scanning'}
                className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-white text-xs font-semibold text-ink-600 shadow-card hover:shadow-card-hover hover:text-ink-900 transition-[box-shadow,color] disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${scanStatus === 'scanning' ? 'animate-spin text-orange-500' : ''}`} />
                {scanStatus === 'scanning' ? 'Scanning…' : 'Scan now'}
              </button>
              <button
                onClick={() => router.push(`/mentions/${projectId}/analytics`)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-white text-xs font-semibold text-ink-600 shadow-card hover:shadow-card-hover hover:text-ink-900 transition-[box-shadow,color]"
              >
                <BarChart3 className="h-3 w-3" />
                Analytics
              </button>
              <button
                onClick={() => {
                  exportMentionsToCSV(filteredAll, project ? project.name.replace(/\s+/g, '_').toLowerCase() : 'sneakyguy_leads');
                  toast.success(`Exported ${filteredAll.length} leads`);
                }}
                disabled={filteredAll.length === 0}
                className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-white text-xs font-semibold text-ink-600 shadow-card hover:shadow-card-hover hover:text-ink-900 transition-[box-shadow,color] disabled:opacity-40"
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {scanStatus === 'scanning' && <ScanBanner progress={scanProgress} message={scanMessage} />}

        {/* Reddit connect nudge */}
        {!redditAuth.isAuthenticated && !isLoading && allMentions.length > 0 && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-[#fff8ec] rounded-2xl shadow-[0_0_0_1px_rgba(217,150,6,0.16)]">
            <span className="text-[12.5px] text-amber-900 font-medium flex-1 leading-snug">
              Connect your Reddit account to publish replies without leaving SneakyGuy.
            </span>
            <button
              className="px-3.5 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-orange transition-colors shrink-0"
              onClick={() => redditAuth.ensureRedditConnection()}
            >
              Connect
            </button>
          </div>
        )}

        {!isLoading && allMentions.length > 0 && (
          <StatsStrip
            stats={stats}
            onOpenAnalytics={() => router.push(`/mentions/${projectId}/analytics`)}
            onRescore={handleRescore}
            rescoring={rescoring}
          />
        )}

        {!isLoading && allMentions.length > 0 && (
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            subreddits={availableSubreddits}
            intents={availableIntents}
            counts={triageCounts}
            shown={displayMentions.length}
            matched={filteredAll.length}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading leads">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-20 bg-cream rounded-full" />
                  <div className="h-5 w-24 bg-cream rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-cream rounded mb-2" />
                <div className="h-3 w-1/2 bg-cream rounded" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card">
            <p className="text-sm font-semibold text-ink-900 mb-1">Couldn&apos;t load this project</p>
            <p className="text-xs text-ink-400 mb-4">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-orange transition-colors"
            >
              Try again
            </button>
          </div>
        ) : allMentions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card px-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3 text-orange-500">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-[15px] font-semibold text-ink-900 mb-1">
              {scanStatus === 'scanning' ? 'Your first scan is running' : 'No leads yet'}
            </p>
            <p className="text-[12.5px] text-ink-400 mb-4 max-w-sm mx-auto leading-relaxed">
              {scanStatus === 'scanning'
                ? 'We’re combing your subreddits for conversations that match your keywords. This usually takes a minute or two.'
                : 'Scan Reddit to find conversations that match your keywords.'}
            </p>
            {project && project.keywords.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-5 max-w-md mx-auto">
                {project.keywords.slice(0, 8).map((k) => (
                  <span key={k} className="chip bg-cream text-ink-600">{k}</span>
                ))}
              </div>
            )}
            {scanStatus !== 'scanning' && (
              <button
                onClick={() => startScan()}
                className="btn-primary text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Scan Reddit now
              </button>
            )}
          </div>
        ) : displayMentions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-card">
            <p className="text-sm text-ink-600 mb-3">No leads match your filters.</p>
            <button
              onClick={() => updateFilters({ ...DEFAULT_FILTERS })}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayMentions.map((mention) => (
                <MentionCard
                  key={mention.id}
                  mention={mention}
                  viewed={viewedPosts.has(mention.id)}
                  publishedUrl={publishedComments[mention.id]}
                  onViewed={markViewed}
                  onPublished={markPublished}
                  quotaRemaining={quota ? quota.remaining : null}
                />
              ))}
            </div>

            {visibleCount < filteredAll.length && (
              <div className="mt-6 flex justify-center pb-8">
                <button
                  onClick={() => setVisibleCount((c) => c + MENTIONS_PER_PAGE)}
                  className="flex items-center gap-2 px-6 h-10 rounded-xl bg-white text-xs font-semibold text-ink-600 shadow-card hover:shadow-card-hover hover:text-ink-900 transition-[box-shadow,color]"
                >
                  Show {Math.min(MENTIONS_PER_PAGE, filteredAll.length - visibleCount)} more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PaymentGuard>
  );
}
